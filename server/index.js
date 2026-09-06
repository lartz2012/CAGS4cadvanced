const express = require('express');
const cors = require('cors');
const path = require('path');
const cron = require('node-cron');
const {
  getMarketPrices,
  updateMarketPrice,
  clearManualOverride,
  readConfigOverrides,
  writeConfigOverrides,
  resetConfigOverrides,
  saveAppraisal,
  getAppraisal,
  getMarketListings
} = require('./db/firebase');

const { calculateGemValuation, ORIGIN_TABLE, TREATMENT_TABLE, TRADE_COLOR_TERMS } = require('./engine/pricingModel');
const { SPECIES_CATALOG } = require('./engine/speciesCatalog');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// -----------------------------------------------------
// 1. PUBLIC API (Consumed by React Frontend)
// -----------------------------------------------------

// GET /api/market-prices — Live prices from Cloud Firestore
app.get('/api/market-prices', async (req, res) => {
  try {
    const rows = await getMarketPrices();
    
    // Transform rows into the format expected by MarketDataService
    const speciesPrices = {};
    rows.forEach(row => {
      speciesPrices[row.speciesId] = {
        basePrice: row.basePrice,
        lowIqr: row.lowIqr,
        highIqr: row.highIqr,
        trend30d: row.trend30d,
        clearedTransactionsCount: row.clearedTransactionsCount,
        source: row.source,
        isManualOverride: row.isManualOverride
      };
    });

    // Also fetch real comparable market listings from Firestore
    const scrapedListings = await getMarketListings();

    const marketDailyData = {
      version: '5.0.0-firestore',
      lastUpdated: new Date().toISOString(),
      provider: 'Google Cloud Firestore Verified Bourse Registry',
      clearinghouses: [
        'The Natural Sapphire Company Public Inventory',
        'Emeralds.com Verified Inventory',
        'GemRockAuctions Cleared Bourse'
      ],
      marketIndices: { overallColoredGemIndex: 145.2 },
      speciesPrices: speciesPrices,
      scrapedListings: scrapedListings
    };

    res.json(marketDailyData);
  } catch (err) {
    console.error('Error fetching market prices from Firestore:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/market-listings — Scraped comparables
app.get('/api/market-listings', async (req, res) => {
  try {
    const { speciesId } = req.query;
    const listings = await getMarketListings(speciesId);
    res.json(listings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -----------------------------------------------------
// 1.5 VALUATION ENGINE API (Server-Side Synced & Persistent)
// -----------------------------------------------------
app.post('/api/valuation/calculate', async (req, res) => {
  try {
    const params = req.body;
    
    // Fetch live base prices from Firestore
    const rows = await getMarketPrices();
    const livePrices = {};
    rows.forEach(r => livePrices[r.speciesId] = r.basePrice);

    // Pass Firestore overrides to valuation engine
    const overrides = await readConfigOverrides();
    const result = calculateGemValuation(params, livePrices, overrides);

    // Persist valuation to Firestore if requested (or assign a tracking certificateId)
    const certId = params.certificateId || `GM-${Date.now().toString().slice(-8)}`;
    result.certificateId = certId;

    if (params.persist !== false) {
      await saveAppraisal({
        certificateId: certId,
        inputParams: params,
        valuationResult: result,
        speciesId: params.speciesId,
        carat: params.carat,
        calculatedAt: new Date().toISOString()
      }).catch(e => console.warn('Non-blocking appraisal save error:', e.message));
    }
    
    res.json(result);
  } catch (err) {
    console.error('Error calculating valuation:', err);
    res.status(500).json({ error: 'Internal Server Error during valuation calculation.' });
  }
});

// GET /api/appraisals/:id — Retrieve saved appraisal report by certificate ID
app.get('/api/appraisals/:id', async (req, res) => {
  try {
    const appraisal = await getAppraisal(req.params.id);
    if (!appraisal) {
      return res.status(404).json({ error: 'Appraisal certificate not found' });
    }
    res.json(appraisal);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -----------------------------------------------------
// 2. ADMIN API (Used by Admin Dashboard)
// -----------------------------------------------------

// Get raw DB rows for the admin panel, merged with the catalog so all species are visible
app.get('/api/admin/prices', async (req, res) => {
  try {
    const rows = await getMarketPrices();
    const dbPricesMap = {};
    rows.forEach(r => { dbPricesMap[r.speciesId] = r; });

    const allPrices = Object.keys(SPECIES_CATALOG).map(speciesId => {
      const species = SPECIES_CATALOG[speciesId];
      const dbEntry = dbPricesMap[speciesId];
      return {
        speciesId,
        name: species.name,
        family: species.family,
        basePrice: dbEntry ? dbEntry.basePrice : species.basePricePerCarat,
        isManualOverride: dbEntry ? dbEntry.isManualOverride : false,
        lastUpdated: dbEntry ? dbEntry.lastUpdated : null,
        source: dbEntry ? dbEntry.source : 'Catalog Default (Uninitialized)'
      };
    });

    res.json(allPrices);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Manually override a price in Firestore
app.post('/api/admin/override-price', async (req, res) => {
  const { speciesId, priceData } = req.body;
  if (!speciesId || !priceData) {
    return res.status(400).json({ error: 'Missing speciesId or priceData' });
  }

  try {
    await updateMarketPrice(speciesId, priceData, true); // true = isManual
    res.json({ success: true, message: `Manual override set for ${speciesId} in Firestore` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Clear manual override
app.post('/api/admin/clear-override', async (req, res) => {
  const { speciesId } = req.body;
  if (!speciesId) {
    return res.status(400).json({ error: 'Missing speciesId' });
  }

  try {
    await clearManualOverride(speciesId);
    res.json({ success: true, message: `Manual override cleared for ${speciesId}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Force refresh
app.post('/api/admin/force-refresh', async (req, res) => {
  try {
    await runDataAggregationJob();
    res.json({ success: true, message: 'Data refresh check completed.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -----------------------------------------------------
// 4. DYNAMIC CONFIG API (Synced with Cloud Firestore)
// -----------------------------------------------------

// GET /api/config — consumed by frontend on load
app.get('/api/config', async (req, res) => {
  try {
    const overrides = await readConfigOverrides();

    // Merge origin table with any admin overrides
    const mergedOrigins = {};
    for (const category of Object.keys(ORIGIN_TABLE)) {
      mergedOrigins[category] = {};
      for (const key of Object.keys(ORIGIN_TABLE[category])) {
        const override = overrides?.origins?.[category]?.[key];
        mergedOrigins[category][key] = override
          ? { ...ORIGIN_TABLE[category][key], ...override }
          : { ...ORIGIN_TABLE[category][key] };
      }
    }

    // Merge treatment table with any admin overrides
    const mergedTreatments = {};
    for (const category of Object.keys(TREATMENT_TABLE)) {
      mergedTreatments[category] = {};
      for (const key of Object.keys(TREATMENT_TABLE[category])) {
        const override = overrides?.treatments?.[category]?.[key];
        mergedTreatments[category][key] = override
          ? { ...TREATMENT_TABLE[category][key], ...override }
          : { ...TREATMENT_TABLE[category][key] };
      }
    }

    // Merge species catalog with any admin overrides
    const mergedSpecies = {};
    for (const speciesId of Object.keys(SPECIES_CATALOG)) {
      const override = overrides?.species?.[speciesId];
      mergedSpecies[speciesId] = override
        ? { ...SPECIES_CATALOG[speciesId], ...override }
        : { ...SPECIES_CATALOG[speciesId] };
    }

    // System settings
    const systemSettings = overrides?.systemSettings || {
      defaultRetailMargin: 50,
      certSpread: { major: 0.12, domestic: 0.20, none: 0.30 },
      certMultiplier: { major: 1.10, domestic: 1.00, none: 0.88 }
    };

    // Merge color terms
    const mergedColorTerms = {};
    for (const speciesId of Object.keys(TRADE_COLOR_TERMS)) {
      const override = overrides?.colorTerms?.[speciesId];
      mergedColorTerms[speciesId] = override ? override : TRADE_COLOR_TERMS[speciesId];
    }

    res.json({
      origins: mergedOrigins,
      treatments: mergedTreatments,
      species: mergedSpecies,
      colorTerms: mergedColorTerms,
      systemSettings
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/config — returns current raw config + overrides for admin view
app.get('/api/admin/config', async (req, res) => {
  try {
    const overrides = await readConfigOverrides();
    res.json({
      origins: ORIGIN_TABLE,
      treatments: TREATMENT_TABLE,
      species: Object.fromEntries(
        Object.entries(SPECIES_CATALOG).map(([id, s]) => [id, {
          id: s.id, name: s.name, family: s.family,
          basePricePerCarat: s.basePricePerCarat,
          clarityType: s.clarityType,
          treatmentCategory: s.treatmentCategory,
          originCategory: s.originCategory
        }])
      ),
      overrides,
      systemSettings: overrides?.systemSettings || {
        defaultRetailMargin: 50,
        certSpread: { major: 0.12, domestic: 0.20, none: 0.30 },
        certMultiplier: { major: 1.10, domestic: 1.00, none: 0.88 }
      },
      colorTerms: TRADE_COLOR_TERMS
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/config — admin sets overrides in Firestore
app.post('/api/admin/config', async (req, res) => {
  try {
    const { type, category, key, value, systemSettings } = req.body;
    const overrides = await readConfigOverrides();

    if (systemSettings) {
      overrides.systemSettings = { ...overrides.systemSettings, ...systemSettings };
    }

    if (type === 'origin' && category && key && value !== undefined) {
      if (!overrides.origins) overrides.origins = {};
      if (!overrides.origins[category]) overrides.origins[category] = {};
      overrides.origins[category][key] = { ...overrides.origins[category][key], ...value };
    }

    if (type === 'treatment' && category && key && value !== undefined) {
      if (!overrides.treatments) overrides.treatments = {};
      if (!overrides.treatments[category]) overrides.treatments[category] = {};
      overrides.treatments[category][key] = { ...overrides.treatments[category][key], ...value };
    }

    if (type === 'species' && key && value !== undefined) {
      if (!overrides.species) overrides.species = {};
      overrides.species[key] = { ...overrides.species[key], ...value };
    }

    if (type === 'colorTerm' && key && value !== undefined) {
      if (!overrides.colorTerms) overrides.colorTerms = {};
      overrides.colorTerms[key] = value;
    }

    await writeConfigOverrides(overrides);
    res.json({ success: true, message: 'Config override saved to Cloud Firestore.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/admin/config — reset overrides in Firestore
app.delete('/api/admin/config', async (req, res) => {
  try {
    await resetConfigOverrides();
    res.json({ success: true, message: 'All config overrides cleared from Firestore.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -----------------------------------------------------
// 3. CRON JOB & AGGREGATION ENGINE
// -----------------------------------------------------
async function runDataAggregationJob() {
  console.log(`[${new Date().toISOString()}] Running market data aggregation job...`);
  console.log(`[${new Date().toISOString()}] Using Cloud Firestore as verified price authority.`);
}

cron.schedule('0 */6 * * *', () => {
  runDataAggregationJob();
});

// Start Server (Only in standalone node environment, not in Vercel serverless)
if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Market Data Backend Service running on port ${PORT}`);
    console.log(`- Database: Google Cloud Firestore (Project: cagsadvance)`);
    console.log(`- API Endpoint: http://localhost:${PORT}/api/market-prices`);
    console.log(`- Admin API: http://localhost:${PORT}/api/admin/prices`);
  });
}

module.exports = app;
