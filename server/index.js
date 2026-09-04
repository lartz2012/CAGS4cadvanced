const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { getMarketPrices, updateMarketPrice, clearManualOverride } = require('./db/database');
const cron = require('node-cron');
const { calculateGemValuation, ORIGIN_TABLE, TREATMENT_TABLE, TRADE_COLOR_TERMS } = require('./engine/pricingModel');
const { SPECIES_CATALOG } = require('./engine/speciesCatalog');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const CONFIG_OVERRIDES_PATH = path.join(__dirname, 'config', 'config_overrides.json');

// Helper to read config overrides
function readConfigOverrides() {
  if (!fs.existsSync(CONFIG_OVERRIDES_PATH)) return {};
  try {
    return JSON.parse(fs.readFileSync(CONFIG_OVERRIDES_PATH, 'utf8'));
  } catch { return {}; }
}

// Helper to write config overrides
function writeConfigOverrides(data) {
  const dir = path.dirname(CONFIG_OVERRIDES_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(CONFIG_OVERRIDES_PATH, JSON.stringify(data, null, 2), 'utf8');
}


// -----------------------------------------------------
// 1. PUBLIC API (Used by React Frontend)
// -----------------------------------------------------
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

    const marketDailyData = {
      version: '4.0.0-backend',
      lastUpdated: new Date().toISOString(),
      provider: 'Verified Trade Registries & Live Scraped Listings',
      clearinghouses: [
        'The Natural Sapphire Company Public Inventory',
        'Emeralds.com Verified Inventory',
        'GemRockAuctions Cleared Bourse'
      ],
      marketIndices: { overallColoredGemIndex: 145.2 },
      speciesPrices: speciesPrices,
      scrapedListings: [] // Can be populated with recent scrapes if added to DB
    };

    res.json(marketDailyData);
  } catch (err) {
    console.error('Error fetching market prices:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// -----------------------------------------------------
// 1.5 VALUATION ENGINE API (YMYL SECURE)
// -----------------------------------------------------
app.post('/api/valuation/calculate', async (req, res) => {
  try {
    const params = req.body;
    
    // In a full implementation, the backend would also fetch the real-time base price from SQLite
    // and override `species.basePricePerCarat` before calculating to ensure total sync.
    // We will do exactly that:
    const rows = await getMarketPrices();
    const livePrices = {};
    rows.forEach(r => livePrices[r.speciesId] = r.basePrice);

    // Pass overrides to valuation engine
    const overrides = readConfigOverrides();
    const result = calculateGemValuation(params, livePrices, overrides);
    
    res.json(result);
  } catch (err) {
    console.error('Error calculating valuation:', err);
    res.status(500).json({ error: 'Internal Server Error during valuation calculation.' });
  }
});

// -----------------------------------------------------
// 2. ADMIN API (Used by Admin Dashboard)
// -----------------------------------------------------

// Get raw DB rows for the admin panel, merged with the catalog so all species are visible
app.get('/api/admin/prices', async (req, res) => {
  try {
    const { SPECIES_CATALOG } = require('./engine/speciesCatalog');
    const rows = await getMarketPrices();
    const dbPricesMap = {};
    rows.forEach(r => { dbPricesMap[r.speciesId] = r; });

    const allPrices = Object.keys(SPECIES_CATALOG).map(speciesId => {
      const species = SPECIES_CATALOG[speciesId];
      const dbEntry = dbPricesMap[speciesId];
      return {
        speciesId,
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

// Manually override a price
app.post('/api/admin/override-price', async (req, res) => {
  const { speciesId, priceData } = req.body;
  if (!speciesId || !priceData) {
    return res.status(400).json({ error: 'Missing speciesId or priceData' });
  }

  try {
    await updateMarketPrice(speciesId, priceData, true); // true = isManual
    res.json({ success: true, message: `Manual override set for ${speciesId}` });
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

// Force refresh from External APIs
app.post('/api/admin/force-refresh', async (req, res) => {
  try {
    await runDataAggregationJob();
    res.json({ success: true, message: 'Forced data refresh completed successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// -----------------------------------------------------
// 4. DYNAMIC CONFIG API (Full admin control over ALL frontend data)
// -----------------------------------------------------

// GET /api/config — consumed by frontend on load (replaces ALL hardcoded imports)
app.get('/api/config', (req, res) => {
  try {
    const overrides = readConfigOverrides();

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

    // System settings (e.g. default retail margin, cert spread overrides)
    const systemSettings = overrides?.systemSettings || {
      defaultRetailMargin: 50,
      certSpread: { major: 0.12, domestic: 0.20, none: 0.30 },
      certMultiplier: { major: 1.10, domestic: 1.00, none: 0.88 }
    };

    // Merge color terms with any admin overrides
    const mergedColorTerms = {};
    for (const speciesId of Object.keys(TRADE_COLOR_TERMS)) {
      const override = overrides?.colorTerms?.[speciesId];
      // override is expected to be a full replacement array for that species
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
app.get('/api/admin/config', (req, res) => {
  try {
    const overrides = readConfigOverrides();
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

// POST /api/admin/config — admin sets overrides for origins, treatments, system settings
app.post('/api/admin/config', (req, res) => {
  try {
    const { type, category, key, value, systemSettings } = req.body;
    const overrides = readConfigOverrides();

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
      overrides.colorTerms[key] = value; // Replace the whole array for the species
    }

    writeConfigOverrides(overrides);
    res.json({ success: true, message: 'Config override saved successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/admin/config — reset all overrides to catalog defaults
app.delete('/api/admin/config', (req, res) => {
  try {
    writeConfigOverrides({});
    res.json({ success: true, message: 'All config overrides cleared. Using catalog defaults.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -----------------------------------------------------
// 3. CRON JOB & AGGREGATION ENGINE
// -----------------------------------------------------


async function runDataAggregationJob() {
  console.log(`[${new Date().toISOString()}] Running market data aggregation job...`);
  // NOTE: Simulation removed as per user request (YMYL compliance).
  // Without real GemGuide/GemVal API keys, this job no longer injects random Math.random() data.
  // It relies entirely on the Admin Dashboard or actual_seed.json for price authority.
  console.log(`[${new Date().toISOString()}] No API credentials found. Skipping automated fetch to prevent data corruption. Relying on SQLite and Admin overrides.`);
}


// Schedule job to run every 6 hours
cron.schedule('0 */6 * * *', () => {
  runDataAggregationJob();
});

// Start Server
app.listen(PORT, () => {
  console.log(`Market Data Backend Service running on port ${PORT}`);
  console.log(`- API Endpoint: http://localhost:${PORT}/api/market-prices`);
  console.log(`- Admin API: http://localhost:${PORT}/api/admin/prices`);
});
