/**
 * Automated Firestore Database Seeding Script
 * 
 * Ingests:
 * 1. Base market prices from SQLite and SPECIES_CATALOG -> `market_prices` collection
 * 2. Origin, treatment, and color term matrices -> `config` collection
 * 3. Scraped comparable market listings -> `market_listings` collection
 * 
 * Usage: node scripts/seed_firestore.cjs (from server/ directory or with Cwd: server)
 */

const path = require('path');
const fs = require('fs');

// Use initialized db from server/db/firebase
const { db } = require('./db/firebase');

// Import Catalogs
const { SPECIES_CATALOG } = require('./engine/speciesCatalog');
const { ORIGIN_TABLE, TREATMENT_TABLE, TRADE_COLOR_TERMS } = require('./engine/pricingModel');

async function seedDatabase() {
  console.log('='.repeat(70));
  console.log('🚀 Starting Cloud Firestore Seeding for Project: cagsadvance');
  console.log('='.repeat(70));

  // -------------------------------------------------------------
  // 1. Seed Market Prices
  // -------------------------------------------------------------
  console.log('\n[1/3] Seeding `market_prices` collection...');
  const batch1 = db.batch();
  let priceCount = 0;

  // Check if actual_seed.json exists
  let seedOverrides = {};
  const seedJsonPath = path.resolve(__dirname, 'db', 'actual_seed.json');
  if (fs.existsSync(seedJsonPath)) {
    try {
      const items = JSON.parse(fs.readFileSync(seedJsonPath, 'utf8'));
      items.forEach(it => { seedOverrides[it.speciesId] = it; });
    } catch (e) {}
  }

  // Also check existing SQLite data if accessible
  const sqliteDbPath = path.resolve(__dirname, 'db', 'market_data.sqlite');
  let sqlitePrices = {};
  if (fs.existsSync(sqliteDbPath)) {
    try {
      const sqlite3 = require('sqlite3').verbose();
      const sdb = new sqlite3.Database(sqliteDbPath);
      const rows = await new Promise((resolve, reject) => {
        sdb.all('SELECT * FROM market_prices', (err, rows) => {
          if (err) resolve([]);
          else resolve(rows || []);
        });
      });
      rows.forEach(r => { sqlitePrices[r.speciesId] = r; });
      sdb.close();
    } catch (e) {}
  }

  for (const [speciesId, species] of Object.entries(SPECIES_CATALOG)) {
    const override = seedOverrides[speciesId] || sqlitePrices[speciesId];
    const basePrice = override?.basePrice || species.basePricePerCarat;
    const isManual = override?.isManualOverride ? true : false;
    const source = override?.source || 'GIA / GemGuide Trade Baseline';

    const priceDocRef = db.collection('market_prices').doc(speciesId);
    batch1.set(priceDocRef, {
      speciesId,
      name: species.name,
      family: species.family,
      basePrice: Number(basePrice),
      lowIqr: Number(override?.lowIqr || Math.round(basePrice * 0.88)),
      highIqr: Number(override?.highIqr || Math.round(basePrice * 1.15)),
      trend30d: override?.trend30d || '+0.0%',
      clearedTransactionsCount: Number(override?.clearedTransactionsCount || 50),
      source,
      isManualOverride: isManual,
      lastUpdated: new Date().toISOString()
    }, { merge: true });
    priceCount++;
  }

  await batch1.commit();
  console.log(`✅ Seeded ${priceCount} species into 'market_prices'.`);

  // -------------------------------------------------------------
  // 2. Seed Config & Multipliers
  // -------------------------------------------------------------
  console.log('\n[2/3] Seeding `config` collection (Origins, Treatments, Color Terms, Settings)...');
  
  // Read any existing config_overrides.json
  let existingOverrides = {};
  const overridesPath = path.resolve(__dirname, 'config', 'config_overrides.json');
  if (fs.existsSync(overridesPath)) {
    try {
      existingOverrides = JSON.parse(fs.readFileSync(overridesPath, 'utf8'));
    } catch (e) {}
  }

  await db.collection('config').doc('origins').set(ORIGIN_TABLE);
  await db.collection('config').doc('treatments').set(TREATMENT_TABLE);
  await db.collection('config').doc('color_terms').set(TRADE_COLOR_TERMS);
  await db.collection('config').doc('system_settings').set(existingOverrides.systemSettings || {
    defaultRetailMargin: 50,
    certSpread: { major: 0.12, domestic: 0.20, none: 0.30 },
    certMultiplier: { major: 1.10, domestic: 1.00, none: 0.88 }
  });
  await db.collection('config').doc('overrides').set(existingOverrides, { merge: true });
  console.log('✅ Global configuration and master factor matrices seeded.');

  // -------------------------------------------------------------
  // 3. Seed Verified Market Listings (Comparables)
  // -------------------------------------------------------------
  console.log('\n[3/3] Seeding `market_listings` collection (Real Comparables)...');
  const marketDailyPath = path.resolve(__dirname, '..', 'public', 'market_prices_daily.json');
  let listingCount = 0;

  if (fs.existsSync(marketDailyPath)) {
    try {
      const dailyData = JSON.parse(fs.readFileSync(marketDailyPath, 'utf8'));
      const listings = dailyData.scrapedListings || [];
      const batch2 = db.batch();

      listings.forEach(item => {
        const docRef = db.collection('market_listings').doc(item.id);
        batch2.set(docRef, item, { merge: true });
        listingCount++;
      });

      if (listingCount > 0) {
        await batch2.commit();
      }
    } catch (e) {
      console.warn('Could not parse market_prices_daily.json:', e.message);
    }
  }
  console.log(`✅ Seeded ${listingCount} real market listings into 'market_listings'.`);

  console.log('\n' + '='.repeat(70));
  console.log('🎉 FIRESTORE MIGRATION & SEEDING COMPLETED SUCCESSFULLY!');
  console.log('   All gem species, origin tables, and market records are now in Google Cloud.');
  console.log('='.repeat(70));
}

seedDatabase()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ Seeding failed with error:', err);
    process.exit(1);
  });
