const { calculateGemValuation } = require('./server/engine/pricingModel');
const { ORIGIN_TABLE, TREATMENT_TABLE, SPECIES_CATALOG } = require('./server/engine/speciesCatalog');
const fs = require('fs');
const overrides = JSON.parse(fs.readFileSync('./server/config/config_overrides.json', 'utf8'));

try {
  const result = calculateGemValuation({
    speciesId: 'blue_sapphire',
    carat: 3.5,
    dimensions: { length: 9.8, width: 7.6, height: 5.2 },
    hue: 215,
    tone: 70,
    saturation: 80,
    clarityGrade: 'LI',
    eyeClean: true,
    transparency: 0.95,
    colorZoning: 'minimal',
    brilliance: 85,
    windowing: 5,
    extinction: 10,
    symmetry: 'very_good',
    polish: 'excellent',
    treatment: 'heated_standard',
    origin: 'srilanka',
    certification: 'major',
    retailMarginPercent: 50
  }, overrides);
  console.log('Success:', result);
} catch (e) {
  console.error('Error:', e);
}
