const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const path = require('path');
const fs = require('fs');

// Initialize Firebase Admin SDK
if (!getApps().length) {
  let credential;

  // 1. Check for Service Account JSON string in Environment Variables (for Vercel / Cloud)
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      const parsed = typeof process.env.FIREBASE_SERVICE_ACCOUNT === 'string'
        ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
        : process.env.FIREBASE_SERVICE_ACCOUNT;
      credential = cert(parsed);
      console.log('✓ Firebase Admin initialized with FIREBASE_SERVICE_ACCOUNT environment variable');
    } catch (e) {
      console.warn('Failed to parse FIREBASE_SERVICE_ACCOUNT env var:', e.message);
    }
  }

  // 2. Check for individual Environment Variables (Alternative for Vercel)
  if (!credential && process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    try {
      credential = cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
      });
      console.log('✓ Firebase Admin initialized with individual FIREBASE_* env variables');
    } catch (e) {
      console.warn('Failed to parse individual FIREBASE_* env vars:', e.message);
    }
  }

  // 3. Fallback to local serviceAccountKey.json file (Local Development)
  if (!credential) {
    const keyPath = path.resolve(__dirname, '..', 'serviceAccountKey.json');
    if (fs.existsSync(keyPath)) {
      credential = cert(require(keyPath));
      console.log('✓ Firebase Admin initialized with local serviceAccountKey.json');
    } else {
      console.warn('⚠️ No Firebase credentials detected. Falling back to built-in catalog data.');
    }
  }

  if (credential) {
    try {
      initializeApp({ credential });
    } catch (e) {
      console.warn('Firebase initializeApp error:', e.message);
    }
  }
}

let db = null;
try {
  if (getApps().length) {
    db = getFirestore();
  }
} catch (e) {
  console.warn('Firestore initialization warning:', e.message);
}

// Local In-Memory / File Fallback Cache for zero-dependency & offline resilience
let inMemoryConfigOverrides = {};
let inMemoryMarketPrices = {};

const localCachePath = path.resolve(__dirname, 'server_cache.json');
try {
  if (fs.existsSync(localCachePath)) {
    const raw = fs.readFileSync(localCachePath, 'utf8');
    const parsed = JSON.parse(raw);
    if (parsed.overrides) inMemoryConfigOverrides = parsed.overrides;
    if (parsed.prices) inMemoryMarketPrices = parsed.prices;
  }
} catch (e) {}

function saveLocalCache() {
  try {
    fs.writeFileSync(localCachePath, JSON.stringify({
      overrides: inMemoryConfigOverrides,
      prices: inMemoryMarketPrices
    }, null, 2), 'utf8');
  } catch (e) {}
}

// -------------------------------------------------------------
// 1. Market Prices Collection Helper Functions
// -------------------------------------------------------------

/**
 * Fetch all market price documents from Firestore or local cache
 */
async function getMarketPrices() {
  const localRows = Object.values(inMemoryMarketPrices);
  if (!db) {
    return localRows;
  }

  try {
    const snapshot = await db.collection('market_prices').get();
    const rows = [];
    const seen = new Set();
    snapshot.forEach(doc => {
      seen.add(doc.id);
      rows.push({
        speciesId: doc.id,
        ...doc.data()
      });
    });
    // Merge any memory cached prices
    localRows.forEach(r => {
      if (!seen.has(r.speciesId)) rows.push(r);
    });
    return rows;
  } catch (error) {
    console.warn('Error fetching market prices from Firestore, returning local cache:', error.message);
    return localRows;
  }
}

/**
 * Update or insert a market price record for a species
 */
async function updateMarketPrice(speciesId, priceData, isManual = false) {
  const dataToSave = {
    speciesId,
    basePrice: Number(priceData.basePrice),
    lowIqr: Number(priceData.lowIqr || Math.round(priceData.basePrice * 0.88)),
    highIqr: Number(priceData.highIqr || Math.round(priceData.basePrice * 1.15)),
    trend30d: priceData.trend30d || '+0.0%',
    clearedTransactionsCount: Number(priceData.clearedTransactionsCount || 50),
    source: priceData.source || (isManual ? 'Admin Manual Override' : 'Trade Registry Feed'),
    isManualOverride: isManual ? true : false,
    lastUpdated: new Date().toISOString()
  };

  inMemoryMarketPrices[speciesId] = dataToSave;
  saveLocalCache();

  if (!db) {
    console.log(`✓ Saved price override for ${speciesId} to local server cache`);
    return { id: speciesId, changes: 1, cached: true };
  }

  try {
    const docRef = db.collection('market_prices').doc(speciesId);
    const existing = await docRef.get();

    if (existing.exists) {
      const current = existing.data();
      if (current.isManualOverride && !isManual) {
        return { id: speciesId, status: 'skipped_manual_override_active' };
      }
    }

    await docRef.set(dataToSave, { merge: true });

    await db.collection('audit_logs').add({
      speciesId,
      oldPrice: existing.exists ? existing.data().basePrice : null,
      newPrice: dataToSave.basePrice,
      isManualOverride: isManual,
      source: dataToSave.source,
      timestamp: new Date().toISOString()
    }).catch(() => {});

    return { id: speciesId, changes: 1 };
  } catch (error) {
    console.warn(`Firestore write warning for ${speciesId}, kept in local server cache:`, error.message);
    return { id: speciesId, changes: 1, cached: true };
  }
}

/**
 * Clear a manual override flag for a species and restore catalog baseline price
 */
async function clearManualOverride(speciesId) {
  delete inMemoryMarketPrices[speciesId];
  saveLocalCache();

  if (!db) {
    return { changes: 1, cached: true };
  }

  try {
    const { SPECIES_CATALOG } = require('../engine/speciesCatalog');
    const defaultPrice = SPECIES_CATALOG[speciesId]?.basePricePerCarat || 500;
    const docRef = db.collection('market_prices').doc(speciesId);
    await docRef.update({
      basePrice: defaultPrice,
      lowIqr: Math.round(defaultPrice * 0.88),
      highIqr: Math.round(defaultPrice * 1.15),
      isManualOverride: false,
      source: 'Catalog Default (Restored)',
      lastUpdated: new Date().toISOString()
    });
    return { changes: 1 };
  } catch (error) {
    console.warn(`Firestore clear warning for ${speciesId}:`, error.message);
    return { changes: 1, cached: true };
  }
}

// -------------------------------------------------------------
// 2. Global Config & Overrides Helper Functions
// -------------------------------------------------------------

/**
 * Read the global config overrides document
 */
async function readConfigOverrides() {
  if (!db) return inMemoryConfigOverrides;

  try {
    const docRef = db.collection('config').doc('overrides');
    const doc = await docRef.get();
    if (doc.exists) {
      inMemoryConfigOverrides = { ...inMemoryConfigOverrides, ...doc.data() };
      return inMemoryConfigOverrides;
    }
    return inMemoryConfigOverrides;
  } catch (error) {
    console.warn('Note: Could not reach Firestore config overrides, using local cache:', error.message);
    return inMemoryConfigOverrides;
  }
}

/**
 * Save / merge config overrides
 */
async function writeConfigOverrides(data) {
  inMemoryConfigOverrides = { ...inMemoryConfigOverrides, ...data };
  saveLocalCache();

  if (!db) {
    console.log('✓ Saved config overrides to local server cache');
    return true;
  }

  try {
    const docRef = db.collection('config').doc('overrides');
    await docRef.set(data, { merge: true });
    return true;
  } catch (error) {
    console.warn('Error saving to Firestore, preserved in local server cache:', error.message);
    return true;
  }
}

/**
 * Reset all config overrides
 */
async function resetConfigOverrides() {
  inMemoryConfigOverrides = {};
  saveLocalCache();

  if (!db) return true;

  try {
    const docRef = db.collection('config').doc('overrides');
    await docRef.set({});
    return true;
  } catch (error) {
    console.warn('Error resetting config overrides in Firestore:', error.message);
    return true;
  }
}

// -------------------------------------------------------------
// 3. Saved Appraisals & Valuations Persistence
// -------------------------------------------------------------

/**
 * Save an appraisal valuation result to Firestore
 */
async function saveAppraisal(appraisalData) {
  const certId = appraisalData.certificateId || `GM-${Date.now().toString().slice(-8)}`;
  if (!db) {
    return { certificateId: certId, success: false, reason: 'offline' };
  }

  try {
    const docRef = db.collection('appraisals').doc(certId);
    const record = {
      ...appraisalData,
      certificateId: certId,
      createdAt: new Date().toISOString()
    };
    await docRef.set(record);
    return { certificateId: certId, success: true };
  } catch (error) {
    console.warn('Note: Appraisal save skipped (offline/unreachable):', error.message);
    return { certificateId: certId, success: false, error: error.message };
  }
}

/**
 * Retrieve a saved appraisal by certificate ID
 */
async function getAppraisal(certificateId) {
  if (!db) return null;

  try {
    const docRef = db.collection('appraisals').doc(certificateId);
    const doc = await docRef.get();
    if (!doc.exists) return null;
    return doc.data();
  } catch (error) {
    console.error(`Error retrieving appraisal ${certificateId}:`, error);
    throw error;
  }
}

// -------------------------------------------------------------
// 4. Market Comparables & Scraped Listings
// -------------------------------------------------------------

/**
 * Fetch scraped listings for a species from Firestore
 */
async function getMarketListings(speciesId = null) {
  if (!db) return [];

  try {
    let query = db.collection('market_listings');
    if (speciesId) {
      query = query.where('speciesId', '==', speciesId);
    }
    const snapshot = await query.get();
    const listings = [];
    snapshot.forEach(doc => listings.push({ id: doc.id, ...doc.data() }));
    return listings;
  } catch (error) {
    console.warn('Note: Could not reach Firestore market listings, returning empty array:', error.message);
    return [];
  }
}

module.exports = {
  db,
  getMarketPrices,
  updateMarketPrice,
  clearManualOverride,
  readConfigOverrides,
  writeConfigOverrides,
  resetConfigOverrides,
  saveAppraisal,
  getAppraisal,
  getMarketListings
};
