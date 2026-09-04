"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GEMGUIDE_GRIDS = exports.CARAT_BRACKETS = exports.TREATMENT_TABLE = exports.ORIGIN_TABLE = void 0;
exports.getCaratBracket = getCaratBracket;
exports.calculateGemValuation = calculateGemValuation;
const speciesCatalog_1 = require("./speciesCatalog");
// ----------------------------------------------------------------------
// 1. ORIGIN PROVENANCE TABLES (Baseline 1.0 listed first for each)
// ----------------------------------------------------------------------
exports.ORIGIN_TABLE = {
    corundum: {
        srilanka: { label: 'Sri Lanka (Ceylon) - Trade Baseline', factor: 1.0 },
        madagascar: { label: 'Madagascar - Trade Standard', factor: 1.0 },
        kashmir: { label: 'Kashmir (Historical Rarity)', factor: 2.5 },
        burma: { label: 'Burma (Mogok)', factor: 1.6 },
        tanzania: { label: 'Tanzania', factor: 0.95 },
        australia: { label: 'Australia / Basaltic', factor: 0.65 },
        unknown: { label: 'Origin Unknown', factor: 0.85 }
    },
    ruby: {
        mozambique: { label: 'Mozambique (Montepuez) - Trade Benchmark', factor: 1.0 },
        burma_mogok: { label: 'Burma (Mogok Valley) - Prestige', factor: 2.2 },
        srilanka: { label: 'Sri Lanka (Ceylon)', factor: 1.1 },
        thailand: { label: 'Thailand / Cambodia', factor: 0.70 },
        unknown: { label: 'Origin Unknown', factor: 0.85 }
    },
    emerald: {
        colombia: { label: 'Colombia (Muzo / Chivor)', factor: 1.35 },
        zambia: { label: 'Zambia (Kagem) - Trade Benchmark', factor: 1.0 },
        afghanistan: { label: 'Afghanistan (Panjshir)', factor: 1.2 },
        brazil: { label: 'Brazil (Belmont)', factor: 0.85 },
        unknown: { label: 'Origin Unknown', factor: 0.85 }
    },
    paraiba: {
        mozambique: { label: 'Mozambique (Alto Ligonha) - Trade Baseline', factor: 1.0 },
        brazil_batalha: { label: 'Brazil (São José da Batalha) - Original Locality', factor: 2.2 },
        nigeria: { label: 'Nigeria (Edoukou)', factor: 0.90 },
        unknown: { label: 'Origin Unknown', factor: 0.85 }
    },
    spinel: {
        burma_mogok: { label: 'Burma (Mogok Valley)', factor: 1.4 },
        vietnam_lucyen: { label: 'Vietnam (Luc Yen)', factor: 1.3 },
        tanzania_mahenge: { label: 'Tanzania (Mahenge) - Standard', factor: 1.0 },
        tajikistan: { label: 'Tajikistan (Pamir)', factor: 1.2 },
        srilanka: { label: 'Sri Lanka (Ceylon)', factor: 0.95 },
        unknown: { label: 'Origin Unknown', factor: 0.85 }
    },
    alexandrite: {
        brazil: { label: 'Brazil (Hematita) - Trade Standard', factor: 1.0 },
        russia_ural: { label: 'Russia (Historic Ural Mts)', factor: 2.2 },
        srilanka: { label: 'Sri Lanka (Ceylon)', factor: 1.0 },
        tanzania: { label: 'Tanzania', factor: 0.9 },
        unknown: { label: 'Origin Unknown', factor: 0.85 }
    },
    demantoid: {
        russia: { label: 'Russia (Ural Mountains)', factor: 1.5 },
        namibia: { label: 'Namibia (Green Dragon)', factor: 1.0 },
        madagascar: { label: 'Madagascar', factor: 0.9 },
        unknown: { label: 'Origin Unknown', factor: 0.85 }
    },
    generic: {
        srilanka: { label: 'Sri Lanka - Trade Baseline', factor: 1.0 },
        brazil: { label: 'Brazil', factor: 1.0 },
        madagascar: { label: 'Madagascar', factor: 1.0 },
        pakistan: { label: 'Pakistan / Afghanistan', factor: 1.0 },
        other: { label: 'Other Origin', factor: 0.9 },
        unknown: { label: 'Origin Unknown', factor: 0.85 }
    }
};
// ----------------------------------------------------------------------
// 2. TREATMENT TABLES (Standard customary treatment listed first)
// ----------------------------------------------------------------------
exports.TREATMENT_TABLE = {
    corundum: {
        heated_standard: { label: 'Standard Heat (Permanent) - Trade Baseline', factor: 1.0 },
        unheated_cert: { label: 'Unheated (Accredited Lab Cert)', factor: 2.0 },
        unheated_claim: { label: 'Unheated Claimed (No Lab Cert)', factor: 1.25 },
        beryllium_diffused: { label: 'Beryllium / Lattice Diffused', factor: 0.35 },
        glass_filled: { label: 'Lead-Glass Filled (Promotional)', factor: 0.15 }
    },
    ruby: {
        heated_standard: { label: 'Standard Heat (Residue Free) - Trade Baseline', factor: 1.0 },
        unheated_cert: { label: 'Unheated (Accredited Lab Cert)', factor: 2.2 },
        flux_healed: { label: 'Flux Healed / Minor Residue', factor: 0.55 },
        glass_filled: { label: 'Lead-Glass Filled', factor: 0.12 }
    },
    emerald: {
        minor_oil: { label: 'Minor Traditional Cedarwood Oil - Standard', factor: 1.0 },
        insignificant_oil: { label: 'None / Insignificant Clarity Enhancement', factor: 1.65 },
        moderate_oil: { label: 'Moderate Clarity Enhancement', factor: 0.75 },
        significant_resin: { label: 'Significant / Artificial Polymer Resin', factor: 0.40 }
    },
    tourmaline: {
        heated: { label: 'Routine Heated (Customary for Paraíba)', factor: 1.0 },
        untreated: { label: 'Natural Untreated (Rare)', factor: 1.2 },
        diffused: { label: 'Surface Diffused', factor: 0.35 }
    },
    routine_heat: {
        routine_heated: { label: 'Routine Heat (Industry Standard)', factor: 1.0 },
        natural_unheated: { label: 'Natural Unheated (Rare for Tanzanite)', factor: 1.20 }
    },
    untreated: {
        natural: { label: 'Natural Untreated (Trade Standard)', factor: 1.0 },
        heated: { label: 'Routine Heated / Enhanced', factor: 0.60 }
    },
    irradiated: {
        irradiated: { label: 'Irradiated (Industry Standard)', factor: 1.0 },
        untreated: { label: 'Natural Untreated (Rare)', factor: 2.0 }
    },
    generic: {
        natural: { label: 'Natural Untreated', factor: 1.0 },
        treated: { label: 'Treated / Enhanced', factor: 0.70 }
    }
};
exports.CARAT_BRACKETS = [
    { min: 0.05, max: 0.99, label: '0.50 – 0.99 ct' },
    { min: 1.00, max: 1.99, label: '1.00 – 1.99 ct' },
    { min: 2.00, max: 2.99, label: '2.00 – 2.99 ct' },
    { min: 3.00, max: 4.99, label: '3.00 – 4.99 ct' },
    { min: 5.00, max: 9.99, label: '5.00 – 9.99 ct' },
    { min: 10.00, max: 100.0, label: '10.00+ ct' }
];
exports.GEMGUIDE_GRIDS = {
    // Blue Sapphire (Ceylon / Madagascar Baseline, Heated Standard)
    'blue_sapphire': {
        commercial: [[100, 250], [180, 450], [350, 750], [600, 1200], [900, 2000], [1500, 3200]],
        good: [[250, 600], [450, 950], [750, 1600], [1200, 2500], [2000, 4500], [3200, 7000]],
        fine: [[600, 1100], [950, 1800], [1600, 3200], [2500, 4800], [4500, 8800], [7000, 14000]],
        extra_fine: [[1100, 1800], [1800, 3200], [3200, 5500], [4800, 8500], [8800, 16000], [14000, 24000]]
    },
    // Ruby (Mozambique Baseline, Heated Standard)
    'ruby': {
        commercial: [[150, 400], [300, 800], [600, 1600], [1200, 3200], [2500, 6500], [5000, 12000]],
        good: [[400, 1000], [800, 2200], [1600, 4200], [3200, 8500], [6500, 16000], [12000, 28000]],
        fine: [[1000, 2200], [2200, 4800], [4200, 9000], [8500, 18000], [16000, 36000], [28000, 65000]],
        extra_fine: [[2200, 4500], [4800, 9000], [9000, 18000], [18000, 35000], [36000, 75000], [65000, 130000]]
    },
    // Emerald (Colombia / Zambia Baseline, Minor Oil)
    'emerald': {
        commercial: [[120, 350], [250, 650], [450, 1200], [850, 2200], [1500, 3800], [2500, 6000]],
        good: [[350, 850], [650, 1600], [1200, 2800], [2200, 5000], [3800, 8800], [6000, 14000]],
        fine: [[850, 1800], [1600, 3600], [2800, 6200], [5000, 10500], [8800, 18500], [14000, 28000]],
        extra_fine: [[1800, 3500], [3600, 7200], [6200, 12500], [10500, 21000], [18500, 36000], [28000, 55000]]
    },
    // Paraíba Tourmaline (Mozambique Baseline, Heated)
    'paraiba': {
        commercial: [[400, 1000], [800, 2200], [1600, 4200], [2800, 7500], [4500, 13000], [7000, 20000]],
        good: [[1000, 2500], [2200, 5500], [4200, 10500], [7500, 18500], [13000, 30000], [20000, 48000]],
        fine: [[2500, 6000], [5500, 13000], [10500, 23000], [18500, 40000], [30000, 65000], [48000, 95000]],
        extra_fine: [[6000, 12000], [13000, 26000], [23000, 48000], [40000, 80000], [65000, 135000], [95000, 200000]]
    },
    // Padparadscha Sapphire (Ceylon Baseline, Heated)
    'padparadscha': {
        commercial: [[300, 750], [600, 1500], [1200, 3000], [2400, 5800], [4500, 10500], [7500, 16000]],
        good: [[750, 1800], [1500, 3500], [3000, 6800], [5800, 12500], [10500, 22500], [16000, 35000]],
        fine: [[1800, 3800], [3500, 7200], [6800, 14500], [12500, 25000], [22500, 46000], [35000, 70000]],
        extra_fine: [[3800, 7500], [7200, 14500], [14500, 26000], [25000, 46000], [46000, 88000], [70000, 130000]]
    },
    // Tanzanite (Standard Heated Baseline)
    'tanzanite': {
        commercial: [[60, 120], [90, 180], [120, 220], [150, 280], [180, 350], [220, 420]],
        good: [[120, 200], [180, 300], [220, 380], [280, 480], [350, 600], [420, 750]],
        fine: [[200, 320], [300, 460], [380, 560], [480, 700], [600, 890], [750, 1150]],
        extra_fine: [[320, 450], [460, 620], [560, 760], [700, 960], [890, 1250], [1150, 1550]]
    },
    // Alexandrite (Brazil / Tanzania Baseline, Natural Untreated)
    'alexandrite': {
        commercial: [[500, 1500], [1200, 3200], [2600, 6200], [5200, 12500], [9000, 22000], [15000, 35000]],
        good: [[1500, 3600], [3200, 7800], [6200, 14500], [12500, 26000], [22000, 45000], [35000, 75000]],
        fine: [[3600, 7800], [7800, 18500], [14500, 32000], [26000, 58000], [45000, 95000], [75000, 150000]],
        extra_fine: [[7800, 16000], [18500, 36000], [32000, 65000], [58000, 110000], [95000, 180000], [150000, 280000]]
    },
    // Tsavorite Garnet (Kenya / Tanzania Baseline, Natural Untreated)
    'tsavorite': {
        commercial: [[100, 250], [200, 520], [460, 1050], [920, 2100], [1800, 4200], [3200, 7500]],
        good: [[250, 550], [520, 1150], [1050, 2450], [2100, 4600], [4200, 9200], [7500, 15500]],
        fine: [[550, 1100], [1150, 2300], [2450, 4900], [4600, 9800], [9200, 18500], [15500, 28000]],
        extra_fine: [[1100, 2000], [2300, 4200], [4900, 8800], [9800, 18500], [18500, 33000], [28000, 50000]]
    },
    // Aquamarine (Brazil / Mozambique Baseline, Routine Heated)
    'aquamarine': {
        commercial: [[25, 60], [35, 90], [45, 110], [60, 150], [80, 210], [110, 290]],
        good: [[60, 130], [90, 200], [110, 240], [150, 320], [210, 460], [290, 620]],
        fine: [[130, 260], [200, 420], [240, 480], [320, 620], [460, 880], [620, 1150]],
        extra_fine: [[260, 420], [420, 700], [480, 800], [620, 1050], [880, 1450], [1150, 1900]]
    },
    // Pink / Red Spinel (Burma / Tanzania Baseline, Natural Untreated)
    'spinel_pink': {
        commercial: [[80, 200], [150, 420], [300, 820], [600, 1550], [1200, 2900], [2200, 5200]],
        good: [[200, 450], [420, 920], [820, 1850], [1550, 3600], [2900, 6800], [5200, 11500]],
        fine: [[450, 950], [920, 2100], [1850, 4200], [3600, 8200], [6800, 14500], [11500, 23000]],
        extra_fine: [[950, 1900], [2100, 4200], [4200, 8200], [8200, 16500], [14500, 29000], [23000, 45000]]
    },
    // Cobalt Blue Spinel
    'spinel_cobalt': {
        commercial: [[300, 800], [600, 1500], [1200, 3000], [2500, 6000], [4500, 11000], [8000, 18000]],
        good: [[800, 1800], [1500, 3600], [3000, 7200], [6000, 14000], [11000, 25000], [18000, 42000]],
        fine: [[1800, 4000], [3600, 8200], [7200, 16500], [14000, 30000], [25000, 52000], [42000, 85000]],
        extra_fine: [[4000, 9000], [8200, 18000], [16500, 34000], [30000, 62000], [52000, 105000], [85000, 175000]]
    },
    // Grey / Silver Spinel
    'spinel_grey': {
        commercial: [[20, 60], [40, 110], [80, 200], [150, 360], [280, 650], [500, 1100]],
        good: [[60, 130], [110, 240], [200, 440], [360, 780], [650, 1350], [1100, 2200]],
        fine: [[130, 280], [240, 520], [440, 900], [780, 1550], [1350, 2600], [2200, 4200]],
        extra_fine: [[280, 550], [520, 950], [900, 1650], [1550, 2800], [2600, 4800], [4200, 7500]]
    },
    // Yellow Sapphire (Heated Baseline)
    'yellow_sapphire': {
        commercial: [[30, 80], [60, 160], [110, 260], [180, 420], [300, 700], [550, 1200]],
        good: [[80, 180], [160, 360], [260, 580], [420, 920], [700, 1550], [1200, 2600]],
        fine: [[180, 380], [360, 720], [580, 1150], [920, 1850], [1550, 3100], [2600, 4800]],
        extra_fine: [[380, 720], [720, 1350], [1150, 2100], [1850, 3300], [3100, 5600], [4800, 8800]]
    },
    // Pink Sapphire (Heated Baseline)
    'pink_sapphire': {
        commercial: [[70, 180], [140, 360], [280, 680], [500, 1200], [850, 2000], [1500, 3400]],
        good: [[180, 420], [360, 820], [680, 1500], [1200, 2600], [2000, 4400], [3400, 7200]],
        fine: [[420, 900], [820, 1750], [1500, 3100], [2600, 5200], [4400, 8800], [7200, 14500]],
        extra_fine: [[900, 1800], [1750, 3400], [3100, 5800], [5200, 9800], [8800, 16500], [14500, 26000]]
    },
    // Demantoid Garnet (Natural Untreated)
    'demantoid': {
        commercial: [[150, 400], [300, 800], [650, 1600], [1400, 3200], [2600, 6000], [4500, 10500]],
        good: [[400, 950], [800, 2000], [1600, 3800], [3200, 7500], [6000, 13500], [10500, 23000]],
        fine: [[950, 2100], [2000, 4500], [3800, 8200], [7500, 16500], [13500, 28000], [23000, 48000]],
        extra_fine: [[2100, 4200], [4500, 9000], [8200, 16500], [16500, 33000], [28000, 55000], [48000, 95000]]
    },
    // Spessartite Garnet (Mandarin)
    'spessartite': {
        commercial: [[40, 100], [80, 200], [150, 350], [250, 600], [450, 1050], [750, 1800]],
        good: [[100, 220], [200, 450], [350, 750], [600, 1300], [1050, 2200], [1800, 3800]],
        fine: [[220, 460], [450, 950], [750, 1600], [1300, 2700], [2200, 4500], [3800, 7800]],
        extra_fine: [[460, 900], [950, 1850], [1600, 3200], [2700, 5200], [4500, 8800], [7800, 14500]]
    },
    // Rubellite Tourmaline
    'rubellite': {
        commercial: [[40, 100], [80, 200], [160, 380], [280, 680], [500, 1200], [850, 2000]],
        good: [[100, 220], [200, 460], [380, 850], [680, 1500], [1200, 2600], [2000, 4200]],
        fine: [[220, 480], [460, 980], [850, 1850], [1500, 3200], [2600, 5500], [4200, 8800]],
        extra_fine: [[480, 950], [980, 1950], [1850, 3600], [3200, 6200], [5500, 11000], [8800, 16500]]
    },
    // Indicolite (Blue Tourmaline)
    'indicolite': {
        commercial: [[50, 120], [100, 250], [200, 480], [350, 850], [600, 1450], [1000, 2400]],
        good: [[120, 280], [250, 580], [480, 1100], [850, 1900], [1450, 3200], [2400, 5200]],
        fine: [[280, 600], [580, 1250], [1100, 2400], [1900, 4200], [3200, 7000], [5200, 11000]],
        extra_fine: [[600, 1250], [1250, 2500], [2400, 4800], [4200, 8200], [7000, 14000], [11000, 22000]]
    },
    // Morganite (Peach Beryl)
    'morganite': {
        commercial: [[15, 40], [25, 60], [40, 90], [55, 130], [75, 180], [100, 240]],
        good: [[40, 80], [60, 120], [90, 180], [130, 250], [180, 350], [240, 480]],
        fine: [[80, 160], [120, 240], [180, 340], [250, 480], [350, 680], [480, 920]],
        extra_fine: [[160, 280], [240, 420], [340, 580], [480, 820], [680, 1150], [920, 1550]]
    }
};
/**
 * Returns the index (0..5) and display label of the carat bracket
 */
function getCaratBracket(carat) {
    for (let i = 0; i < exports.CARAT_BRACKETS.length; i++) {
        if (carat <= exports.CARAT_BRACKETS[i].max) {
            return { index: i, label: exports.CARAT_BRACKETS[i].label };
        }
    }
    return { index: exports.CARAT_BRACKETS.length - 1, label: exports.CARAT_BRACKETS[exports.CARAT_BRACKETS.length - 1].label };
}
/**
 * TRADE COLOR TERM DEFINITIONS PER SPECIES
 * Each entry defines "sweet spots" — specific (hue, tone, saturation) ranges that map
 * to prestigious trade color descriptors. When a stone's color parameters fall within
 * a sweet spot, it earns a prestige multiplier applied on top of the base color score.
 * 
 * Research basis: GIA GemFest, GRS color charts, Gübelin Gem Lab, SSEF standards,
 * AGL (American Gemological Laboratories) color grades, and trade literature.
 */
const TRADE_COLOR_TERMS = exports.TRADE_COLOR_TERMS = {
    'blue_sapphire': [
        // Royal Blue: Deep, vivid, intense blue — the ultimate fine sapphire color
        { term: 'Royal Blue', hueMin: 205, hueMax: 225, toneMin: 68, toneMax: 80, satMin: 80, satMax: 100, multiplier: 1.35, premium: true },
        // Cornflower Blue: Medium violetish-blue, velvety — classic Kashmir descriptor
        { term: 'Cornflower Blue', hueMin: 218, hueMax: 240, toneMin: 50, toneMax: 68, satMin: 70, satMax: 90, multiplier: 1.25, premium: true },
        // Peacock Blue: Vivid teal-blue with green secondary — Ceylon trade term
        { term: 'Peacock Blue', hueMin: 195, hueMax: 210, toneMin: 58, toneMax: 75, satMin: 75, satMax: 95, multiplier: 1.15, premium: true },
        // Fine Blue: Good but off-axis, no special descriptor
        { term: 'Fine Blue', hueMin: 190, hueMax: 245, toneMin: 40, toneMax: 85, satMin: 60, satMax: 100, multiplier: 1.0, premium: false },
        // Off-color: Inky dark or too violet / greenish
        { term: 'Commercial Blue', hueMin: 170, hueMax: 260, toneMin: 25, toneMax: 100, satMin: 20, satMax: 100, multiplier: 0.82, premium: false },
    ],
    'ruby': [
        // Pigeon's Blood: Vivid pure red with faint blue fluorescence — top Mogok descriptor (GRS/Gübelin certified)
        { term: "Pigeon's Blood", hueMin: 348, hueMax: 360, toneMin: 65, toneMax: 80, satMin: 85, satMax: 100, multiplier: 1.50, premium: true },
        { term: "Pigeon's Blood", hueMin: 0, hueMax: 8, toneMin: 65, toneMax: 80, satMin: 85, satMax: 100, multiplier: 1.50, premium: true },
        // Vivid Red: Pure red, high sat — excellent commercial fine ruby
        { term: 'Vivid Red', hueMin: 348, hueMax: 360, toneMin: 58, toneMax: 78, satMin: 75, satMax: 100, multiplier: 1.20, premium: true },
        { term: 'Vivid Red', hueMin: 0, hueMax: 12, toneMin: 58, toneMax: 78, satMin: 75, satMax: 100, multiplier: 1.20, premium: true },
        // Pinkish-Red: Secondary pink — Sri Lanka type
        { term: 'Pinkish-Red', hueMin: 340, hueMax: 358, toneMin: 55, toneMax: 72, satMin: 65, satMax: 85, multiplier: 1.05, premium: false },
        // Purplish-Red: Common treatment artifact — discount
        { term: 'Purplish-Red', hueMin: 320, hueMax: 348, toneMin: 50, toneMax: 80, satMin: 50, satMax: 100, multiplier: 0.85, premium: false },
        // Dark/Brownish Red
        { term: 'Commercial Red', hueMin: 0, hueMax: 360, toneMin: 0, toneMax: 100, satMin: 0, satMax: 100, multiplier: 0.80, premium: false },
    ],
    'emerald': [
        // Vivid Colombian Green: The reference standard — deep, saturated, slightly bluish
        { term: 'Vivid Colombian Green', hueMin: 138, hueMax: 155, toneMin: 62, toneMax: 76, satMin: 80, satMax: 100, multiplier: 1.30, premium: true },
        // Fine Emerald Green: Good color, slightly lighter or yellowish
        { term: 'Fine Emerald Green', hueMin: 130, hueMax: 158, toneMin: 55, toneMax: 78, satMin: 70, satMax: 95, multiplier: 1.10, premium: true },
        // Yellowish-Green: Off hue, commercial
        { term: 'Yellowish-Green', hueMin: 110, hueMax: 138, toneMin: 40, toneMax: 75, satMin: 50, satMax: 100, multiplier: 0.85, premium: false },
        // Bluish-Green: Zambian type, still commercial
        { term: 'Bluish-Green', hueMin: 155, hueMax: 175, toneMin: 50, toneMax: 80, satMin: 60, satMax: 100, multiplier: 0.90, premium: false },
        // Dark/Blackish — over-tone
        { term: 'Commercial Green', hueMin: 100, hueMax: 180, toneMin: 0, toneMax: 100, satMin: 0, satMax: 100, multiplier: 0.78, premium: false },
    ],
    'padparadscha': [
        // True Padparadscha: The lotus flower color — pink-orange bicolor balance, most sought after
        { term: 'True Padparadscha', hueMin: 5, hueMax: 25, toneMin: 50, toneMax: 68, satMin: 68, satMax: 90, multiplier: 1.40, premium: true },
        // Near-Padparadscha: Slightly off-axis pink or orange
        { term: 'Near-Padparadscha', hueMin: 355, hueMax: 35, toneMin: 45, toneMax: 72, satMin: 55, satMax: 85, multiplier: 1.10, premium: true },
        // Too pink or too orange — loses designation
        { term: 'Orange-Pink Sapphire', hueMin: 0, hueMax: 360, toneMin: 0, toneMax: 100, satMin: 0, satMax: 100, multiplier: 0.90, premium: false },
    ],
    'paraiba': [
        // Neon Electric: The iconic color — high Cu/Mn saturation causes neon turquoise glow
        { term: 'Neon Electric Turquoise', hueMin: 168, hueMax: 188, toneMin: 52, toneMax: 68, satMin: 88, satMax: 100, multiplier: 1.45, premium: true },
        // Fine Paraiba Blue-Green
        { term: 'Fine Paraíba Blue', hueMin: 185, hueMax: 200, toneMin: 50, toneMax: 70, satMin: 78, satMax: 100, multiplier: 1.20, premium: true },
        // Off-neon, still desirable
        { term: 'Paraíba Green', hueMin: 155, hueMax: 175, toneMin: 45, toneMax: 75, satMin: 70, satMax: 100, multiplier: 1.00, premium: false },
        // Default
        { term: 'Commercial Blue-Green', hueMin: 0, hueMax: 360, toneMin: 0, toneMax: 100, satMin: 0, satMax: 100, multiplier: 0.85, premium: false },
    ],
    'alexandrite': [
        // Strong Color Change: High 'shift' ratio — the defining characteristic
        { term: 'Strong Color Change', hueMin: 100, hueMax: 165, toneMin: 55, toneMax: 75, satMin: 70, satMax: 100, multiplier: 1.50, premium: true },
        // Moderate Color Change
        { term: 'Moderate Color Change', hueMin: 100, hueMax: 165, toneMin: 45, toneMax: 80, satMin: 55, satMax: 85, multiplier: 1.15, premium: true },
        // Weak Color Change
        { term: 'Weak Color Change', hueMin: 0, hueMax: 360, toneMin: 0, toneMax: 100, satMin: 0, satMax: 100, multiplier: 0.85, premium: false },
    ],
};

/**
 * Looks up the best matching trade color term for a given gem species and HST values.
 * Returns { term, multiplier, premium } for the first match found (most specific first).
 */
function getTradeColorTerm(speciesId, hue, tone, saturation, overrides = null) {
    const terms = overrides?.colorTerms?.[speciesId] || exports.TRADE_COLOR_TERMS[speciesId];
    if (!terms) return { term: null, multiplier: 1.0, premium: false };

    for (const entry of terms) {
        const hueMatch = entry.hueMin <= entry.hueMax
            ? hue >= entry.hueMin && hue <= entry.hueMax
            : hue >= entry.hueMin || hue <= entry.hueMax; // wraps around 360 e.g. red
        const toneMatch = tone >= entry.toneMin && tone <= entry.toneMax;
        const satMatch = saturation >= entry.satMin && saturation <= entry.satMax;
        if (hueMatch && toneMatch && satMatch) {
            return { term: entry.term, multiplier: entry.multiplier, premium: entry.premium };
        }
    }
    return { term: 'Commercial Grade', multiplier: 0.80, premium: false };
}

/**
 * Research-backed depth percentage cut penalty.
 * Based on: GIA colored stone cut standards, Gemological Institute curriculum,
 * and industry pricing deductions as documented by the American Gem Society (AGS).
 * 
 * - Optimal depth: 65%-75% (maximizes brilliance and face-up size-to-weight ratio)
 * - Deep (>80%): "Weight retention" cut — stone appears smaller than its carat weight implies
 *   → Penalty: up to -18% on cut score (proportional to excess depth)
 * - Very deep (>90%): Severe windowing from the back, color extinction
 *   → Penalty: up to -35% on cut score
 * - Shallow (<60%): Windowing (pavilion angles too flat, light passes straight through)
 *   → Penalty: up to -25% on cut score
 * - Very shallow (<50%): Severe windowing, essentially transparent "window" in center
 *   → Penalty: up to -40% on cut score
 */
function calcDepthPenalty(dimensions) {
    if (!dimensions || !dimensions.height || !dimensions.width || dimensions.width <= 0) {
        return { factor: 1.0, note: null };
    }
    const depthPct = (dimensions.height / dimensions.width) * 100;

    if (depthPct >= 65 && depthPct <= 75) {
        return { factor: 1.0, note: `Ideal proportions (${depthPct.toFixed(0)}% depth)` };
    } else if (depthPct > 75 && depthPct <= 80) {
        // Slightly deep — minor penalty
        const excess = depthPct - 75;
        const penalty = 1.0 - (excess / 5) * 0.06; // Up to -6%
        return { factor: penalty, note: `Slightly deep (${depthPct.toFixed(0)}% depth — minor weight retention)` };
    } else if (depthPct > 80 && depthPct <= 90) {
        // Deep cut — weight retention penalty
        const excess = depthPct - 80;
        const penalty = 0.94 - (excess / 10) * 0.12; // -6% to -18%
        return { factor: Math.max(0.76, penalty), note: `Deep cut (${depthPct.toFixed(0)}% depth — weight retention penalty)` };
    } else if (depthPct > 90) {
        // Very deep — severe penalty
        const excess = depthPct - 90;
        const penalty = 0.76 - Math.min(0.17, (excess / 20) * 0.17); // -18% to -35%
        return { factor: Math.max(0.65, penalty), note: `Very deep cut (${depthPct.toFixed(0)}% depth — severe weight retention)` };
    } else if (depthPct < 50) {
        // Very shallow — severe windowing
        const deficit = 50 - depthPct;
        const penalty = 0.60 - Math.min(0.15, (deficit / 15) * 0.15);
        return { factor: Math.max(0.45, penalty), note: `Very shallow (${depthPct.toFixed(0)}% depth — severe windowing)` };
    } else if (depthPct < 60) {
        // Shallow — windowing penalty
        const deficit = 60 - depthPct;
        const penalty = 1.0 - (deficit / 10) * 0.40; // -0% to -40%
        return { factor: Math.max(0.60, penalty), note: `Shallow cut (${depthPct.toFixed(0)}% depth — windowing risk)` };
    } else {
        // 60-65%: slightly shallow, minor penalty
        const deficit = 65 - depthPct;
        const penalty = 1.0 - (deficit / 5) * 0.08;
        return { factor: Math.max(0.92, penalty), note: `Slightly shallow (${depthPct.toFixed(0)}% depth — minor windowing risk)` };
    }
}

/**
 * GemGuide 2D Quality Matrix Valuation Engine
 */
function calculateGemValuation(params, livePrices = {}, overrides = null) {
    const catalogSpecies = speciesCatalog_1.SPECIES_CATALOG[params.speciesId] || speciesCatalog_1.SPECIES_CATALOG['blue_sapphire'];
    
    // Create a working copy so we don't mutate the global catalog
    const species = { ...catalogSpecies };
    
    // YMYL Backend Sync: Override catalog base price with live database price OR overrides if provided
    const dbBasePrice = livePrices ? livePrices[species.id] : null;
    const overridePrice = overrides?.species?.[species.id]?.basePricePerCarat;
    species.basePricePerCarat = dbBasePrice || overridePrice || species.basePricePerCarat;

    const carat = Math.max(0.05, params.carat || 1.0);
    const { index: bracketIdx, label: bracketLabel } = getCaratBracket(carat);
    // ----------------------------------------------------------------------
    // 1. COMPOSITE 4C QUALITY SCORING (0 to 100 points)
    // ----------------------------------------------------------------------
    // A. Color Score (0 to 50 points - 50% weight in colored gems)
    // --- Tone scoring (25 pts max) ---
    const optimalTone = 68;
    const toneDelta = Math.abs(params.tone - optimalTone);
    const toneScore = Math.max(4, 25 - (toneDelta / 38) * 18);
    // --- Saturation scoring (25 pts max) ---
    const satNorm = Math.max(10, Math.min(100, params.saturation)) / 100;
    const satScore = Math.pow(satNorm, 1.35) * 25;
    // --- Color zoning modifier ---
    const zoningMap = { 'minimal': 1.0, 'noticeable': 0.90, 'strong': 0.78 };
    const zoningFactor = zoningMap[params.colorZoning] || 1.0;
    const rawColorScore = (toneScore + satScore) * zoningFactor;
    const colorScore = Math.min(50, Math.max(5, rawColorScore));

    // --- Trade Color Term Scoring (Hue-based prestige multiplier) ---
    const colorTermResult = getTradeColorTerm(species.id, params.hue || 0, params.tone, params.saturation, overrides);
    const colorTermMultiplier = colorTermResult.multiplier;
    const tradeColorTerm = colorTermResult.term || species.defaultColor?.name || 'Standard';

    // B. Clarity Score (0 to 25 points)
    // GIA Types I, II, III sensitivity
    const clarityPointsByType = {
        'I': [25, 18, 10, 4, 1], // Type I (Aquamarine, Tanzanite) strict
        'II': [25, 21, 14, 7, 2], // Type II (Sapphire, Ruby, Spinel) standard
        'III': [25, 23, 18, 11, 4] // Type III (Emerald) natural inclusions tolerated
    };
    const gradeIndexMap = { 'FI': 0, 'LI': 1, 'MI': 2, 'HI': 3, 'EI': 4 };
    const gradeIdx = gradeIndexMap[params.clarityGrade] ?? 1;
    let clarityBase = (clarityPointsByType[species.clarityType] || clarityPointsByType['II'])[gradeIdx];
    if (!params.eyeClean && gradeIdx <= 1) {
        clarityBase = Math.max(4, clarityBase - 5);
    }
    const transparencyFactor = Math.max(0.4, Math.min(1.0, params.transparency || 1.0));
    const clarityScore = Math.min(25, Math.max(2, clarityBase * transparencyFactor));

    // C. Cut & Optics Score (0 to 25 points)
    const brilliancePts = (params.brilliance / 100) * 14;
    const windowPenalty = (params.windowing / 100) * 8;
    const extinctionPenalty = (params.extinction / 100) * 6;
    const finishGrades = { 'excellent': 3.0, 'very_good': 2.3, 'good': 1.5, 'fair': 0.5 };
    const symPts = finishGrades[params.symmetry] || 1.5;
    const polPts = finishGrades[params.polish] || 1.5;
    const rawCutScore = brilliancePts - windowPenalty - extinctionPenalty + symPts + polPts + 2.5;

    // Apply research-backed depth % penalty
    const depthResult = calcDepthPenalty(params.dimensions);
    const cutScoreBeforeDepth = Math.min(25, Math.max(3, rawCutScore));
    const cutScore = Math.min(25, Math.max(2, cutScoreBeforeDepth * depthResult.factor));

    // TOTAL COMPOSITE QUALITY SCORE (0 to 100)
    const compositeQualityScore = Math.round(colorScore + clarityScore + cutScore);
    // ----------------------------------------------------------------------
    // 2. GEMGUIDE QUALITY TIER CLASSIFICATION & MATRIX LOOKUP
    // ----------------------------------------------------------------------
    const hasGrid = !!exports.GEMGUIDE_GRIDS[species.id];
    const grid = exports.GEMGUIDE_GRIDS[species.id] || exports.GEMGUIDE_GRIDS['blue_sapphire'];
    // Admin DB price scales native grid, or scales sapphire grid by ratio for non-gridded gems
    const originalBase = speciesCatalog_1.SPECIES_CATALOG[species.id]?.basePricePerCarat || 500.0;
    let scaleFactor = species.basePricePerCarat / originalBase;
    let qualityTier = 'Good Commercial';
    let tierColor = '#38bdf8';
    let tierRange;
    let tierProgress = 0.5;
    const applyScale = (range) => [Math.round(range[0] * scaleFactor), Math.round(range[1] * scaleFactor)];
    if (compositeQualityScore >= 85) {
        qualityTier = 'Superb (Connoisseur)';
        tierColor = '#f59e0b';
        tierRange = applyScale(grid.extra_fine[bracketIdx] || [1000, 2000]);
        tierProgress = Math.min(1.0, (compositeQualityScore - 85) / 15);
    }
    else if (compositeQualityScore >= 68) {
        qualityTier = 'Fine Trade';
        tierColor = '#10b981';
        tierRange = applyScale(grid.fine[bracketIdx] || [600, 1200]);
        tierProgress = (compositeQualityScore - 68) / (85 - 68);
    }
    else if (compositeQualityScore >= 45) {
        qualityTier = 'Good Commercial';
        tierColor = '#38bdf8';
        tierRange = applyScale(grid.good[bracketIdx] || [300, 700]);
        tierProgress = (compositeQualityScore - 45) / (68 - 45);
    }
    else if (compositeQualityScore >= 25) {
        qualityTier = 'Commercial';
        tierColor = '#94a3b8';
        tierRange = applyScale(grid.commercial[bracketIdx] || [100, 350]);
        tierProgress = (compositeQualityScore - 25) / (45 - 25);
    }
    else {
        qualityTier = 'Promotional';
        tierColor = '#f43f5e';
        const comm = grid.commercial[bracketIdx] || [100, 350];
        tierRange = applyScale([Math.round(comm[0] * 0.5), comm[0]]);
        tierProgress = compositeQualityScore / 25;
    }
    // Smooth interpolation within tier wholesale range
    const [tierLow, tierHigh] = tierRange;
    const baseWholesalePerCarat = tierLow + tierProgress * (tierHigh - tierLow);
    // Apply trade color term premium AFTER tier selection (it's a market premium, not a quality score input)
    const colorTermAdjustedWholesale = baseWholesalePerCarat * colorTermMultiplier;
    // ----------------------------------------------------------------------
    // 3. TREATMENT & UNHEATED RARITY ADJUSTMENT
    // ----------------------------------------------------------------------
    const treatCategory = exports.TREATMENT_TABLE[species.treatmentCategory] || exports.TREATMENT_TABLE.generic;
    const treatData = treatCategory[params.treatment] || Object.values(treatCategory)[0] || { factor: 1.0, label: 'Standard' };
    let treatmentMultiplier = treatData.factor;
    // Unheated Corundum scales non-linearly with carat bracket
    if (species.family === 'Corundum' && params.treatment === 'unheated_cert') {
        // Research: Auctionata/Christie's cleared data shows unheated premiums:
        // <1ct: 1.5x, 1-2ct: 1.7x, 2-3ct: 2.0x, 3-5ct: 2.3x, 5-10ct: 2.8x, 10ct+: 3.4x
        const unheatedCurves = [1.50, 1.70, 2.00, 2.30, 2.80, 3.40];
        treatmentMultiplier = unheatedCurves[bracketIdx] || 2.0;
    }
    // ----------------------------------------------------------------------
    // 4. ORIGIN PROVENANCE ADJUSTMENT
    // ----------------------------------------------------------------------
    const originCategory = exports.ORIGIN_TABLE[species.originCategory] || exports.ORIGIN_TABLE.generic;
    const originData = originCategory[params.origin] || originCategory.unknown || { factor: 1.0, label: 'Standard' };
    const originMultiplier = originData.factor;
    // ----------------------------------------------------------------------
    // 5. CERTIFICATION LIQUIDITY & SPREAD
    // ----------------------------------------------------------------------
    const certMap = { 'major': 1.10, 'domestic': 1.00, 'none': 0.88 };
    const certMultiplier = certMap[params.certification] || 1.0;
    // Combined external multiplier
    const combinedMultiplier = originMultiplier * treatmentMultiplier * certMultiplier;
    // ----------------------------------------------------------------------
    // 6. FINAL WHOLESALE PRICE COMPUTATION (No blending hacks)
    // ----------------------------------------------------------------------
    const wholesaleMidpointPerCarat = Math.round(colorTermAdjustedWholesale * combinedMultiplier);
    // Confidence spread based on certification
    const spreadPercent = params.certification === 'major' ? 0.12 : params.certification === 'domestic' ? 0.20 : 0.30;
    const wholesaleLowPerCarat = Math.round(wholesaleMidpointPerCarat * (1 - spreadPercent));
    const wholesaleHighPerCarat = Math.round(wholesaleMidpointPerCarat * (1 + spreadPercent));
    const wholesaleTotalLow = Math.round(wholesaleLowPerCarat * carat);
    const wholesaleTotalHigh = Math.round(wholesaleHighPerCarat * carat);
    const wholesaleTotalMidpoint = Math.round(wholesaleMidpointPerCarat * carat);
    // ----------------------------------------------------------------------
    // 7. RETAIL REPLACEMENT APPRAISAL PRICING
    // ----------------------------------------------------------------------
    const retailMargin = params.retailMarginPercent ?? 50;
    const retailMultiplier = 1 + (retailMargin / 100);
    const retailMidpointPerCarat = Math.round(wholesaleMidpointPerCarat * retailMultiplier);
    const retailTotalMidpoint = Math.round(wholesaleTotalMidpoint * retailMultiplier);
    const retailTotalLow = Math.round(wholesaleTotalLow * retailMultiplier);
    const retailTotalHigh = Math.round(wholesaleTotalHigh * retailMultiplier);
    // ----------------------------------------------------------------------
    // 8. AUDIT BREAKDOWN FOR INSPECTION PANEL
    // ----------------------------------------------------------------------
    const breakdown = [
        {
            name: `GemGuide Grid Bracket (${bracketLabel})`,
            factor: Math.round(baseWholesalePerCarat),
            description: `Wholesale baseline $${tierLow.toLocaleString()} – $${tierHigh.toLocaleString()} /ct for ${qualityTier}`,
            impactType: 'neutral'
        },
        {
            name: `4C Composite Score (${compositeQualityScore}/100)`,
            factor: compositeQualityScore,
            description: `Color ${colorScore.toFixed(0)}/50 · Clarity ${clarityScore.toFixed(0)}/25 · Cut ${cutScore.toFixed(0)}/25`,
            impactType: compositeQualityScore >= 68 ? 'positive' : compositeQualityScore >= 45 ? 'neutral' : 'negative'
        },
        {
            name: `Trade Color Grade: ${tradeColorTerm}`,
            factor: colorTermMultiplier,
            description: colorTermResult.premium
                ? `Prestige color descriptor — certified premium applicable`
                : `Standard commercial color — no prestige premium`,
            impactType: colorTermMultiplier > 1.0 ? 'positive' : colorTermMultiplier < 0.9 ? 'negative' : 'neutral'
        },
        ...(depthResult.note ? [{
            name: `Proportions / Depth`,
            factor: parseFloat(depthResult.factor.toFixed(2)),
            description: depthResult.note,
            impactType: depthResult.factor < 0.95 ? 'negative' : 'neutral'
        }] : []),
        {
            name: `Origin Provenance (${originData.label})`,
            factor: originMultiplier,
            description: originMultiplier > 1.0 ? 'Prestige locality trade premium' : originMultiplier < 1.0 ? 'Commercial origin discount' : 'Global trade reference standard',
            impactType: originMultiplier > 1.0 ? 'positive' : originMultiplier < 1.0 ? 'negative' : 'neutral'
        },
        {
            name: `Treatment Status (${treatData.label})`,
            factor: treatmentMultiplier,
            description: treatmentMultiplier > 1.0 ? `Natural unheated rarity factor (${bracketLabel})` : treatmentMultiplier < 1.0 ? 'Enhancement discount' : 'Customary trade standard',
            impactType: treatmentMultiplier >= 1.0 ? 'positive' : 'negative'
        },
        {
            name: `Laboratory Verification (${params.certification ? params.certification.toUpperCase() : 'NONE'})`,
            factor: certMultiplier,
            description: params.certification === 'major' ? 'Tier 1 Global Lab (GIA/SSEF/Gübelin) spread ±12%' : 'Trade report spread ±20-30%',
            impactType: certMultiplier >= 1.0 ? 'positive' : 'negative'
        }
    ];
    return {
        species,
        carat,
        basePricePerCarat: Math.round(baseWholesalePerCarat),
        colorScore,
        clarityScore,
        cutScore,
        compositeQualityScore,
        tradeColorTerm,
        colorTermMultiplier,
        depthFactor: depthResult.factor,
        bracketLabel,
        originMultiplier,
        treatmentMultiplier,
        certMultiplier,
        combinedMultiplier,
        wholesaleMidpointPerCarat,
        wholesaleLowPerCarat,
        wholesaleHighPerCarat,
        wholesaleTotalLow,
        wholesaleTotalHigh,
        wholesaleTotalMidpoint,
        retailMidpointPerCarat,
        retailTotalMidpoint,
        retailTotalLow,
        retailTotalHigh,
        qualityTier,
        tierColor,
        breakdown
    };
}




