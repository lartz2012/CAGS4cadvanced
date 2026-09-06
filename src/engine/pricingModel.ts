import { SPECIES_CATALOG, GemSpecies } from './speciesCatalog';

export interface GemInputParams {
  speciesId: string;
  carat: number;
  dimensions?: { length: number; width: number; height: number };
  tone: number; // 0 to 100%
  saturation: number; // 0 to 100%
  clarityGrade: 'FI' | 'LI' | 'MI' | 'HI' | 'EI'; // Flawless to Excessively Included
  eyeClean: boolean;
  transparency: number; // 0.4 to 1.0
  colorZoning: 'minimal' | 'noticeable' | 'strong';
  brilliance: number; // 0 to 100%
  windowing: number; // 0 to 100%
  extinction: number; // 0 to 100%
  symmetry: 'excellent' | 'very_good' | 'good' | 'fair';
  polish: 'excellent' | 'very_good' | 'good' | 'fair';
  treatment: string;
  origin: string;
  certification: 'major' | 'domestic' | 'none';
  customBasePrice?: number; // Optional live CRON market price override
  retailMarginPercent?: number; // e.g. 50%
}

export interface ValuationBreakdownItem {
  name: string;
  factor: number;
  description: string;
  impactType: 'positive' | 'negative' | 'neutral';
}

export interface ValuationResult {
  species: GemSpecies;
  carat: number;
  basePricePerCarat: number;

  // Multipliers / Factors
  colorScore: number;
  clarityScore: number;
  cutScore: number;
  compositeQualityScore: number; // 0 to 100
  tradeColorTerm?: string;
  colorTermMultiplier?: number;
  bracketLabel: string;
  originMultiplier: number;
  treatmentMultiplier: number;
  certMultiplier: number;
  combinedMultiplier: number;

  // Wholesale Trade Pricing (USD)
  wholesaleMidpointPerCarat: number;
  wholesaleLowPerCarat: number;
  wholesaleHighPerCarat: number;
  wholesaleTotalLow: number;
  wholesaleTotalHigh: number;
  wholesaleTotalMidpoint: number;

  // Retail Appraised Pricing (USD)
  retailMidpointPerCarat: number;
  retailTotalMidpoint: number;
  retailTotalLow: number;
  retailTotalHigh: number;

  // Confidence & Grade
  qualityTier: 'Superb (Connoisseur)' | 'Fine Trade' | 'Good Commercial' | 'Commercial' | 'Promotional';
  tierColor: string;
  breakdown: ValuationBreakdownItem[];
}

// ----------------------------------------------------------------------
// 1. ORIGIN PROVENANCE TABLES (Baseline 1.0 listed first for each)
// ----------------------------------------------------------------------
export const ORIGIN_TABLE: Record<string, Record<string, { label: string; factor: number }>> = {
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
export const TREATMENT_TABLE: Record<string, Record<string, { label: string; factor: number }>> = {
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

// ----------------------------------------------------------------------
// 3. GEMGUIDE 2D WHOLESALE PRICE MATRICES
// Format: 6 carat brackets: [0.5-0.99ct, 1-1.99ct, 2-2.99ct, 3-4.99ct, 5-9.99ct, 10+ct]
// Each bracket has [low, high] in USD per carat for:
// commercial, good, fine, extra_fine
// ----------------------------------------------------------------------
export interface TierGrid {
  commercial: [number, number][];
  good: [number, number][];
  fine: [number, number][];
  extra_fine: [number, number][];
}

export const CARAT_BRACKETS = [
  { min: 0.05, max: 0.99, label: '0.50 – 0.99 ct' },
  { min: 1.00, max: 1.99, label: '1.00 – 1.99 ct' },
  { min: 2.00, max: 2.99, label: '2.00 – 2.99 ct' },
  { min: 3.00, max: 4.99, label: '3.00 – 4.99 ct' },
  { min: 5.00, max: 9.99, label: '5.00 – 9.99 ct' },
  { min: 10.00, max: 100.0, label: '10.00+ ct' }
];

export const GEMGUIDE_GRIDS: Record<string, TierGrid> = {
  // Blue Sapphire (Ceylon / Madagascar Baseline, Heated Standard)
  'blue_sapphire': {
    commercial: [[100, 250], [180, 450], [350, 750], [600, 1200], [900, 2000], [1500, 3200]],
    good:       [[250, 600], [450, 950], [750, 1600], [1200, 2500], [2000, 4500], [3200, 7000]],
    fine:       [[600, 1100], [950, 1800], [1600, 3200], [2500, 4800], [4500, 8800], [7000, 14000]],
    extra_fine: [[1100, 1800], [1800, 3200], [3200, 5500], [4800, 8500], [8800, 16000], [14000, 24000]]
  },

  // Ruby (Mozambique Baseline, Heated Standard)
  'ruby': {
    commercial: [[150, 400], [300, 800], [600, 1600], [1200, 3200], [2500, 6500], [5000, 12000]],
    good:       [[400, 1000], [800, 2200], [1600, 4200], [3200, 8500], [6500, 16000], [12000, 28000]],
    fine:       [[1000, 2200], [2200, 4800], [4200, 9000], [8500, 18000], [16000, 36000], [28000, 65000]],
    extra_fine: [[2200, 4500], [4800, 9000], [9000, 18000], [18000, 35000], [36000, 75000], [65000, 130000]]
  },

  // Emerald (Colombia / Zambia Baseline, Minor Oil)
  'emerald': {
    commercial: [[120, 350], [250, 650], [450, 1200], [850, 2200], [1500, 3800], [2500, 6000]],
    good:       [[350, 850], [650, 1600], [1200, 2800], [2200, 5000], [3800, 8800], [6000, 14000]],
    fine:       [[850, 1800], [1600, 3600], [2800, 6200], [5000, 10500], [8800, 18500], [14000, 28000]],
    extra_fine: [[1800, 3500], [3600, 7200], [6200, 12500], [10500, 21000], [18500, 36000], [28000, 55000]]
  },

  // Paraíba Tourmaline (Mozambique Baseline, Heated)
  'paraiba': {
    commercial: [[400, 1000], [800, 2200], [1600, 4200], [2800, 7500], [4500, 13000], [7000, 20000]],
    good:       [[1000, 2500], [2200, 5500], [4200, 10500], [7500, 18500], [13000, 30000], [20000, 48000]],
    fine:       [[2500, 6000], [5500, 13000], [10500, 23000], [18500, 40000], [30000, 65000], [48000, 95000]],
    extra_fine: [[6000, 12000], [13000, 26000], [23000, 48000], [40000, 80000], [65000, 135000], [95000, 200000]]
  },

  // Padparadscha Sapphire (Ceylon Baseline, Heated)
  'padparadscha': {
    commercial: [[300, 750], [600, 1500], [1200, 3000], [2400, 5800], [4500, 10500], [7500, 16000]],
    good:       [[750, 1800], [1500, 3500], [3000, 6800], [5800, 12500], [10500, 22500], [16000, 35000]],
    fine:       [[1800, 3800], [3500, 7200], [6800, 14500], [12500, 25000], [22500, 46000], [35000, 70000]],
    extra_fine: [[3800, 7500], [7200, 14500], [14500, 26000], [25000, 46000], [46000, 88000], [70000, 130000]]
  },

  // Tanzanite (Standard Heated Baseline)
  'tanzanite': {
    commercial: [[60, 120], [90, 180], [120, 220], [150, 280], [180, 350], [220, 420]],
    good:       [[120, 200], [180, 300], [220, 380], [280, 480], [350, 600], [420, 750]],
    fine:       [[200, 320], [300, 460], [380, 560], [480, 700], [600, 890], [750, 1150]],
    extra_fine: [[320, 450], [460, 620], [560, 760], [700, 960], [890, 1250], [1150, 1550]]
  },

  // Alexandrite (Brazil / Tanzania Baseline, Natural Untreated)
  'alexandrite': {
    commercial: [[500, 1500], [1200, 3200], [2600, 6200], [5200, 12500], [9000, 22000], [15000, 35000]],
    good:       [[1500, 3600], [3200, 7800], [6200, 14500], [12500, 26000], [22000, 45000], [35000, 75000]],
    fine:       [[3600, 7800], [7800, 18500], [14500, 32000], [26000, 58000], [45000, 95000], [75000, 150000]],
    extra_fine: [[7800, 16000], [18500, 36000], [32000, 65000], [58000, 110000], [95000, 180000], [150000, 280000]]
  },

  // Tsavorite Garnet (Kenya / Tanzania Baseline, Natural Untreated)
  'tsavorite': {
    commercial: [[100, 250], [200, 520], [460, 1050], [920, 2100], [1800, 4200], [3200, 7500]],
    good:       [[250, 550], [520, 1150], [1050, 2450], [2100, 4600], [4200, 9200], [7500, 15500]],
    fine:       [[550, 1100], [1150, 2300], [2450, 4900], [4600, 9800], [9200, 18500], [15500, 28000]],
    extra_fine: [[1100, 2000], [2300, 4200], [4900, 8800], [9800, 18500], [18500, 33000], [28000, 50000]]
  },

  // Aquamarine (Brazil / Mozambique Baseline, Routine Heated)
  'aquamarine': {
    commercial: [[25, 60], [35, 90], [45, 110], [60, 150], [80, 210], [110, 290]],
    good:       [[60, 130], [90, 200], [110, 240], [150, 320], [210, 460], [290, 620]],
    fine:       [[130, 260], [200, 420], [240, 480], [320, 620], [460, 880], [620, 1150]],
    extra_fine: [[260, 420], [420, 700], [480, 800], [620, 1050], [880, 1450], [1150, 1900]]
  },

  // Pink / Red Spinel (Burma / Tanzania Baseline, Natural Untreated)
  'spinel_pink': {
    commercial: [[80, 200], [150, 420], [300, 820], [600, 1550], [1200, 2900], [2200, 5200]],
    good:       [[200, 450], [420, 920], [820, 1850], [1550, 3600], [2900, 6800], [5200, 11500]],
    fine:       [[450, 950], [920, 2100], [1850, 4200], [3600, 8200], [6800, 14500], [11500, 23000]],
    extra_fine: [[950, 1900], [2100, 4200], [4200, 8200], [8200, 16500], [14500, 29000], [23000, 45000]]
  },

  // Cobalt Blue Spinel
  'spinel_cobalt': {
    commercial: [[300, 800], [600, 1500], [1200, 3000], [2500, 6000], [4500, 11000], [8000, 18000]],
    good:       [[800, 1800], [1500, 3600], [3000, 7200], [6000, 14000], [11000, 25000], [18000, 42000]],
    fine:       [[1800, 4000], [3600, 8200], [7200, 16500], [14000, 30000], [25000, 52000], [42000, 85000]],
    extra_fine: [[4000, 9000], [8200, 18000], [16500, 34000], [30000, 62000], [52000, 105000], [85000, 175000]]
  },

  // Grey / Silver Spinel
  'spinel_grey': {
    commercial: [[20, 60], [40, 110], [80, 200], [150, 360], [280, 650], [500, 1100]],
    good:       [[60, 130], [110, 240], [200, 440], [360, 780], [650, 1350], [1100, 2200]],
    fine:       [[130, 280], [240, 520], [440, 900], [780, 1550], [1350, 2600], [2200, 4200]],
    extra_fine: [[280, 550], [520, 950], [900, 1650], [1550, 2800], [2600, 4800], [4200, 7500]]
  },

  // Yellow Sapphire (Heated Baseline)
  'yellow_sapphire': {
    commercial: [[30, 80], [60, 160], [110, 260], [180, 420], [300, 700], [550, 1200]],
    good:       [[80, 180], [160, 360], [260, 580], [420, 920], [700, 1550], [1200, 2600]],
    fine:       [[180, 380], [360, 720], [580, 1150], [920, 1850], [1550, 3100], [2600, 4800]],
    extra_fine: [[380, 720], [720, 1350], [1150, 2100], [1850, 3300], [3100, 5600], [4800, 8800]]
  },

  // Pink Sapphire (Heated Baseline)
  'pink_sapphire': {
    commercial: [[70, 180], [140, 360], [280, 680], [500, 1200], [850, 2000], [1500, 3400]],
    good:       [[180, 420], [360, 820], [680, 1500], [1200, 2600], [2000, 4400], [3400, 7200]],
    fine:       [[420, 900], [820, 1750], [1500, 3100], [2600, 5200], [4400, 8800], [7200, 14500]],
    extra_fine: [[900, 1800], [1750, 3400], [3100, 5800], [5200, 9800], [8800, 16500], [14500, 26000]]
  },

  // Demantoid Garnet (Natural Untreated)
  'demantoid': {
    commercial: [[150, 400], [300, 800], [650, 1600], [1400, 3200], [2600, 6000], [4500, 10500]],
    good:       [[400, 950], [800, 2000], [1600, 3800], [3200, 7500], [6000, 13500], [10500, 23000]],
    fine:       [[950, 2100], [2000, 4500], [3800, 8200], [7500, 16500], [13500, 28000], [23000, 48000]],
    extra_fine: [[2100, 4200], [4500, 9000], [8200, 16500], [16500, 33000], [28000, 55000], [48000, 95000]]
  },

  // Spessartite Garnet (Mandarin)
  'spessartite': {
    commercial: [[40, 100], [80, 200], [150, 350], [250, 600], [450, 1050], [750, 1800]],
    good:       [[100, 220], [200, 450], [350, 750], [600, 1300], [1050, 2200], [1800, 3800]],
    fine:       [[220, 460], [450, 950], [750, 1600], [1300, 2700], [2200, 4500], [3800, 7800]],
    extra_fine: [[460, 900], [950, 1850], [1600, 3200], [2700, 5200], [4500, 8800], [7800, 14500]]
  },

  // Rubellite Tourmaline
  'rubellite': {
    commercial: [[40, 100], [80, 200], [160, 380], [280, 680], [500, 1200], [850, 2000]],
    good:       [[100, 220], [200, 460], [380, 850], [680, 1500], [1200, 2600], [2000, 4200]],
    fine:       [[220, 480], [460, 980], [850, 1850], [1500, 3200], [2600, 5500], [4200, 8800]],
    extra_fine: [[480, 950], [980, 1950], [1850, 3600], [3200, 6200], [5500, 11000], [8800, 16500]]
  },

  // Indicolite (Blue Tourmaline)
  'indicolite': {
    commercial: [[50, 120], [100, 250], [200, 480], [350, 850], [600, 1450], [1000, 2400]],
    good:       [[120, 280], [250, 580], [480, 1100], [850, 1900], [1450, 3200], [2400, 5200]],
    fine:       [[280, 600], [580, 1250], [1100, 2400], [1900, 4200], [3200, 7000], [5200, 11000]],
    extra_fine: [[600, 1250], [1250, 2500], [2400, 4800], [4200, 8200], [7000, 14000], [11000, 22000]]
  },

  // Morganite (Peach Beryl)
  'morganite': {
    commercial: [[15, 40], [25, 60], [40, 90], [55, 130], [75, 180], [100, 240]],
    good:       [[40, 80], [60, 120], [90, 180], [130, 250], [180, 350], [240, 480]],
    fine:       [[80, 160], [120, 240], [180, 340], [250, 480], [350, 680], [480, 920]],
    extra_fine: [[160, 280], [240, 420], [340, 580], [480, 820], [680, 1150], [920, 1550]]
  }
};

/**
 * Returns the index (0..5) and display label of the carat bracket
 */
export function getCaratBracket(carat: number): { index: number; label: string } {
  for (let i = 0; i < CARAT_BRACKETS.length; i++) {
    if (carat <= CARAT_BRACKETS[i].max) {
      return { index: i, label: CARAT_BRACKETS[i].label };
    }
  }
  return { index: CARAT_BRACKETS.length - 1, label: CARAT_BRACKETS[CARAT_BRACKETS.length - 1].label };
}

export interface TradeColorTermEntry {
  term: string;
  hueMin: number;
  hueMax: number;
  toneMin: number;
  toneMax: number;
  satMin: number;
  satMax: number;
  multiplier: number;
  premium: boolean;
}

export const TRADE_COLOR_TERMS: Record<string, TradeColorTermEntry[]> = {
  'blue_sapphire': [
    { term: 'Royal Blue', hueMin: 205, hueMax: 225, toneMin: 68, toneMax: 80, satMin: 80, satMax: 100, multiplier: 1.35, premium: true },
    { term: 'Cornflower Blue', hueMin: 218, hueMax: 240, toneMin: 50, toneMax: 68, satMin: 70, satMax: 90, multiplier: 1.25, premium: true },
    { term: 'Peacock Blue', hueMin: 195, hueMax: 210, toneMin: 58, toneMax: 75, satMin: 75, satMax: 95, multiplier: 1.15, premium: true },
    { term: 'Fine Blue', hueMin: 190, hueMax: 245, toneMin: 40, toneMax: 85, satMin: 60, satMax: 100, multiplier: 1.0, premium: false },
    { term: 'Commercial Blue', hueMin: 170, hueMax: 260, toneMin: 25, toneMax: 100, satMin: 20, satMax: 100, multiplier: 0.82, premium: false },
  ],
  'ruby': [
    { term: "Pigeon's Blood", hueMin: 348, hueMax: 360, toneMin: 65, toneMax: 80, satMin: 85, satMax: 100, multiplier: 1.50, premium: true },
    { term: "Pigeon's Blood", hueMin: 0, hueMax: 8, toneMin: 65, toneMax: 80, satMin: 85, satMax: 100, multiplier: 1.50, premium: true },
    { term: 'Vivid Red', hueMin: 348, hueMax: 360, toneMin: 58, toneMax: 78, satMin: 75, satMax: 100, multiplier: 1.20, premium: true },
    { term: 'Vivid Red', hueMin: 0, hueMax: 12, toneMin: 58, toneMax: 78, satMin: 75, satMax: 100, multiplier: 1.20, premium: true },
    { term: 'Pinkish-Red', hueMin: 340, hueMax: 358, toneMin: 55, toneMax: 72, satMin: 65, satMax: 85, multiplier: 1.05, premium: false },
    { term: 'Purplish-Red', hueMin: 320, hueMax: 348, toneMin: 50, toneMax: 80, satMin: 50, satMax: 100, multiplier: 0.85, premium: false },
    { term: 'Commercial Red', hueMin: 0, hueMax: 360, toneMin: 0, toneMax: 100, satMin: 0, satMax: 100, multiplier: 0.80, premium: false },
  ],
  'emerald': [
    { term: 'Vivid Colombian Green', hueMin: 138, hueMax: 155, toneMin: 62, toneMax: 76, satMin: 80, satMax: 100, multiplier: 1.30, premium: true },
    { term: 'Fine Emerald Green', hueMin: 130, hueMax: 158, toneMin: 55, toneMax: 78, satMin: 70, satMax: 95, multiplier: 1.10, premium: true },
    { term: 'Yellowish-Green', hueMin: 110, hueMax: 138, toneMin: 40, toneMax: 75, satMin: 50, satMax: 100, multiplier: 0.85, premium: false },
    { term: 'Bluish-Green', hueMin: 155, hueMax: 175, toneMin: 50, toneMax: 80, satMin: 60, satMax: 100, multiplier: 0.90, premium: false },
    { term: 'Commercial Green', hueMin: 100, hueMax: 180, toneMin: 0, toneMax: 100, satMin: 0, satMax: 100, multiplier: 0.78, premium: false },
  ],
  'padparadscha': [
    { term: 'True Padparadscha', hueMin: 5, hueMax: 25, toneMin: 50, toneMax: 68, satMin: 68, satMax: 90, multiplier: 1.40, premium: true },
    { term: 'Near-Padparadscha', hueMin: 355, hueMax: 35, toneMin: 45, toneMax: 72, satMin: 55, satMax: 85, multiplier: 1.10, premium: true },
    { term: 'Orange-Pink Sapphire', hueMin: 0, hueMax: 360, toneMin: 0, toneMax: 100, satMin: 0, satMax: 100, multiplier: 0.90, premium: false },
  ],
  'paraiba': [
    { term: 'Neon Electric Turquoise', hueMin: 168, hueMax: 188, toneMin: 52, toneMax: 68, satMin: 88, satMax: 100, multiplier: 1.45, premium: true },
    { term: 'Fine Paraíba Blue', hueMin: 185, hueMax: 200, toneMin: 50, toneMax: 70, satMin: 78, satMax: 100, multiplier: 1.20, premium: true },
    { term: 'Paraíba Green', hueMin: 155, hueMax: 175, toneMin: 45, toneMax: 75, satMin: 70, satMax: 100, multiplier: 1.00, premium: false },
    { term: 'Commercial Blue-Green', hueMin: 0, hueMax: 360, toneMin: 0, toneMax: 100, satMin: 0, satMax: 100, multiplier: 0.85, premium: false },
  ],
  'alexandrite': [
    { term: 'Strong Color Change', hueMin: 100, hueMax: 165, toneMin: 55, toneMax: 75, satMin: 70, satMax: 100, multiplier: 1.50, premium: true },
    { term: 'Moderate Color Change', hueMin: 100, hueMax: 165, toneMin: 45, toneMax: 80, satMin: 55, satMax: 85, multiplier: 1.15, premium: true },
    { term: 'Weak Color Change', hueMin: 0, hueMax: 360, toneMin: 0, toneMax: 100, satMin: 0, satMax: 100, multiplier: 0.85, premium: false },
  ],
};

export function getTradeColorTerm(
  speciesId: string,
  hue: number,
  tone: number,
  saturation: number,
  overrides: any = null
): { term: string | null; multiplier: number; premium: boolean } {
  const terms: TradeColorTermEntry[] = overrides?.colorTerms?.[speciesId] || TRADE_COLOR_TERMS[speciesId];
  if (!terms) return { term: null, multiplier: 1.0, premium: false };

  for (const entry of terms) {
    const hueMatch = entry.hueMin <= entry.hueMax
      ? hue >= entry.hueMin && hue <= entry.hueMax
      : hue >= entry.hueMin || hue <= entry.hueMax;
    const toneMatch = tone >= entry.toneMin && tone <= entry.toneMax;
    const satMatch = saturation >= entry.satMin && saturation <= entry.satMax;
    if (hueMatch && toneMatch && satMatch) {
      return { term: entry.term, multiplier: entry.multiplier, premium: entry.premium };
    }
  }
  return { term: 'Commercial Grade', multiplier: 0.80, premium: false };
}

/**
 * GemGuide 2D Quality Matrix Valuation Engine
 */
export function calculateGemValuation(
  params: GemInputParams,
  livePrices?: Record<string, number>,
  overrides?: any
): ValuationResult {
  const rawSpecies = SPECIES_CATALOG[params.speciesId] || SPECIES_CATALOG['blue_sapphire'];
  const species = { ...rawSpecies };
  if (livePrices && livePrices[species.id]) {
    species.basePricePerCarat = livePrices[species.id];
  } else if (overrides?.species?.[species.id]?.basePricePerCarat) {
    species.basePricePerCarat = overrides.species[species.id].basePricePerCarat;
  }
  const carat = Math.max(0.05, params.carat || 1.0);
  const { index: bracketIdx, label: bracketLabel } = getCaratBracket(carat);

  // ----------------------------------------------------------------------
  // 1. COMPOSITE 4C QUALITY SCORING (0 to 100 points)
  // ----------------------------------------------------------------------

  // A. Color Score (0 to 50 points - 50% weight in colored gems)
  const optimalTone = 68;
  const toneDelta = Math.abs(params.tone - optimalTone);
  // Tone score: 25 points max, gracefully decaying outside 62-72%
  const toneScore = Math.max(4, 25 - (toneDelta / 38) * 18);

  // Saturation: 25 points max, exponential curve for spectral purity
  const satNorm = Math.max(10, Math.min(100, params.saturation)) / 100;
  const satScore = Math.pow(satNorm, 1.35) * 25;

  // Color zoning modifier
  const zoningMap = { 'minimal': 1.0, 'noticeable': 0.90, 'strong': 0.78 };
  const zoningFactor = zoningMap[params.colorZoning] || 1.0;

  const rawColorScore = (toneScore + satScore) * zoningFactor;
  const colorScore = Math.min(50, Math.max(5, rawColorScore));

  // B. Clarity Score (0 to 25 points)
  // GIA Types I, II, III sensitivity
  const clarityPointsByType: Record<string, number[]> = {
    'I':   [25, 18, 10, 4, 1], // Type I (Aquamarine, Tanzanite) strict
    'II':  [25, 21, 14, 7, 2], // Type II (Sapphire, Ruby, Spinel) standard
    'III': [25, 23, 18, 11, 4] // Type III (Emerald) natural inclusions tolerated
  };
  const gradeIndexMap: Record<string, number> = { 'FI': 0, 'LI': 1, 'MI': 2, 'HI': 3, 'EI': 4 };
  const gradeIdx = gradeIndexMap[params.clarityGrade] ?? 1;
  let clarityBase = (clarityPointsByType[species.clarityType] || clarityPointsByType['II'])[gradeIdx];

  if (!params.eyeClean && gradeIdx <= 1) {
    clarityBase = Math.max(4, clarityBase - 5);
  }

  const transparencyFactor = Math.max(0.4, Math.min(1.0, params.transparency || 1.0));
  const clarityScore = Math.min(25, Math.max(2, clarityBase * transparencyFactor));

  // C. Cut & Optics Score (0 to 25 points)
  // Brilliance (+0 to 14 pts), Windowing (-0 to 8 pts), Extinction (-0 to 6 pts)
  const brilliancePts = (params.brilliance / 100) * 14;
  const windowPenalty = (params.windowing / 100) * 8;
  const extinctionPenalty = (params.extinction / 100) * 6;

  const finishGrades = { 'excellent': 3.0, 'very_good': 2.3, 'good': 1.5, 'fair': 0.5 };
  const symPts = finishGrades[params.symmetry] || 1.5;
  const polPts = finishGrades[params.polish] || 1.5;

  const rawCutScore = brilliancePts - windowPenalty - extinctionPenalty + symPts + polPts + 2.5;
  const cutScore = Math.min(25, Math.max(3, rawCutScore));

  // TOTAL COMPOSITE QUALITY SCORE (0 to 100)
  const compositeQualityScore = Math.round(colorScore + clarityScore + cutScore);

  // ----------------------------------------------------------------------
  // 2. GEMGUIDE QUALITY TIER CLASSIFICATION & MATRIX LOOKUP
  // ----------------------------------------------------------------------
  const grid = GEMGUIDE_GRIDS[species.id] || GEMGUIDE_GRIDS['blue_sapphire'];
  const catalogBaseline = rawSpecies.basePricePerCarat || 500.0;
  // Proportional scale factor: if admin overrides basePricePerCarat, it scales the grid proportionally
  const scaleFactor = species.basePricePerCarat / catalogBaseline;

  let qualityTier: ValuationResult['qualityTier'] = 'Good Commercial';
  let tierColor = '#38bdf8';
  let tierRange: [number, number];
  let tierProgress = 0.5;

  const applyScale = (range: [number, number]): [number, number] => 
    [Math.round(range[0] * scaleFactor), Math.round(range[1] * scaleFactor)];

  if (compositeQualityScore >= 85) {
    qualityTier = 'Superb (Connoisseur)';
    tierColor = '#f59e0b';
    tierRange = applyScale(grid.extra_fine[bracketIdx] || [1000, 2000]);
    tierProgress = Math.min(1.0, (compositeQualityScore - 85) / 15);
  } else if (compositeQualityScore >= 68) {
    qualityTier = 'Fine Trade';
    tierColor = '#10b981';
    tierRange = applyScale(grid.fine[bracketIdx] || [600, 1200]);
    tierProgress = (compositeQualityScore - 68) / (85 - 68);
  } else if (compositeQualityScore >= 45) {
    qualityTier = 'Good Commercial';
    tierColor = '#38bdf8';
    tierRange = applyScale(grid.good[bracketIdx] || [300, 700]);
    tierProgress = (compositeQualityScore - 45) / (68 - 45);
  } else if (compositeQualityScore >= 25) {
    qualityTier = 'Commercial';
    tierColor = '#94a3b8';
    tierRange = applyScale(grid.commercial[bracketIdx] || [100, 350]);
    tierProgress = (compositeQualityScore - 25) / (45 - 25);
  } else {
    qualityTier = 'Promotional';
    tierColor = '#f43f5e';
    const comm = grid.commercial[bracketIdx] || [100, 350];
    tierRange = applyScale([Math.round(comm[0] * 0.5), comm[0]]);
    tierProgress = compositeQualityScore / 25;
  }

  // Smooth interpolation within tier wholesale range
  const [tierLow, tierHigh] = tierRange;
  const baseWholesalePerCarat = tierLow + tierProgress * (tierHigh - tierLow);

  // Apply trade color term premium (e.g. Royal Blue, Pigeon's Blood)
  const colorTermResult = getTradeColorTerm(species.id, params.hue, params.tone, params.saturation, overrides);
  const colorTermMultiplier = colorTermResult.multiplier || 1.0;
  const tradeColorTerm = colorTermResult.term || 'Commercial Grade';
  const colorTermAdjustedWholesale = baseWholesalePerCarat * colorTermMultiplier;

  // ----------------------------------------------------------------------
  // 3. TREATMENT & UNHEATED RARITY ADJUSTMENT (WITH ADMIN OVERRIDES)
  // ----------------------------------------------------------------------
  const baseTreatCategory = TREATMENT_TABLE[species.treatmentCategory] || TREATMENT_TABLE.generic;
  const overrideTreatCategory = overrides?.treatments?.[species.treatmentCategory] || {};
  const treatCategory: Record<string, { factor: number; label: string }> = {};
  for (const k of Object.keys(baseTreatCategory)) {
    treatCategory[k] = { ...baseTreatCategory[k] };
  }
  for (const k of Object.keys(overrideTreatCategory)) {
    treatCategory[k] = {
      ...(treatCategory[k] || { label: k, factor: 1.0 }),
      ...overrideTreatCategory[k]
    };
  }
  const rawTreatData = treatCategory[params.treatment] || Object.values(treatCategory)[0] || { factor: 1.0, label: 'Standard' };
  const treatData = {
    ...rawTreatData,
    label: rawTreatData.label || params.treatment || 'Standard'
  };
  let treatmentMultiplier = treatData.factor;

  // Unheated Corundum scales non-linearly with carat bracket
  if (species.family === 'Corundum' && params.treatment === 'unheated_cert') {
    const unheatedCurves = [1.50, 1.70, 2.00, 2.30, 2.80, 3.40];
    treatmentMultiplier = unheatedCurves[bracketIdx] || 2.0;
  }

  // ----------------------------------------------------------------------
  // 4. ORIGIN PROVENANCE ADJUSTMENT (WITH ADMIN OVERRIDES)
  // ----------------------------------------------------------------------
  const baseOriginCategory = ORIGIN_TABLE[species.originCategory] || ORIGIN_TABLE.generic;
  const overrideOriginCategory = overrides?.origins?.[species.originCategory] || {};
  const originCategory: Record<string, { factor: number; label: string }> = {};
  for (const k of Object.keys(baseOriginCategory)) {
    originCategory[k] = { ...baseOriginCategory[k] };
  }
  for (const k of Object.keys(overrideOriginCategory)) {
    originCategory[k] = {
      ...(originCategory[k] || { label: k, factor: 1.0 }),
      ...overrideOriginCategory[k]
    };
  }
  const rawOriginData = originCategory[params.origin] || originCategory.unknown || Object.values(originCategory)[0] || { factor: 1.0, label: 'Standard' };
  const originData = {
    ...rawOriginData,
    label: rawOriginData.label || params.origin || 'Standard'
  };
  const originMultiplier = originData.factor;

  // ----------------------------------------------------------------------
  // 5. CERTIFICATION LIQUIDITY & SPREAD (WITH ADMIN OVERRIDES)
  // ----------------------------------------------------------------------
  const systemSettings = overrides?.systemSettings || {};
  const certMap: Record<string, number> = {
    'major': systemSettings.certMultiplier?.major ?? 1.10,
    'domestic': systemSettings.certMultiplier?.domestic ?? 1.00,
    'none': systemSettings.certMultiplier?.none ?? 0.88
  };
  const certMultiplier = certMap[params.certification] ?? 1.0;

  // Combined external multiplier
  const combinedMultiplier = originMultiplier * treatmentMultiplier * certMultiplier;

  // ----------------------------------------------------------------------
  // 6. FINAL WHOLESALE PRICE COMPUTATION
  // ----------------------------------------------------------------------
  let finalBaseWholesale = colorTermAdjustedWholesale;
  if (params.customBasePrice && params.customBasePrice > 0) {
    const liveRatio = Math.max(0.85, Math.min(1.15, params.customBasePrice / (species.basePricePerCarat || 500)));
    finalBaseWholesale *= liveRatio;
  }

  const wholesaleMidpointPerCarat = Math.round(finalBaseWholesale * combinedMultiplier);

  // Confidence spread based on certification
  const spreadPercentMap: Record<string, number> = {
    'major': systemSettings.certSpread?.major ?? 0.12,
    'domestic': systemSettings.certSpread?.domestic ?? 0.20,
    'none': systemSettings.certSpread?.none ?? 0.30
  };
  const spreadPercent = spreadPercentMap[params.certification] ?? 0.20;

  const wholesaleLowPerCarat = Math.round(wholesaleMidpointPerCarat * (1 - spreadPercent));
  const wholesaleHighPerCarat = Math.round(wholesaleMidpointPerCarat * (1 + spreadPercent));

  const wholesaleTotalLow = Math.round(wholesaleLowPerCarat * carat);
  const wholesaleTotalHigh = Math.round(wholesaleHighPerCarat * carat);
  const wholesaleTotalMidpoint = Math.round(wholesaleMidpointPerCarat * carat);

  // ----------------------------------------------------------------------
  // 7. RETAIL REPLACEMENT APPRAISAL PRICING
  // ----------------------------------------------------------------------
  const defaultMargin = systemSettings.defaultRetailMargin ?? 50;
  const retailMargin = params.retailMarginPercent ?? defaultMargin;
  const retailMultiplier = 1 + (retailMargin / 100);
  const retailMidpointPerCarat = Math.round(wholesaleMidpointPerCarat * retailMultiplier);
  const retailTotalMidpoint = Math.round(wholesaleTotalMidpoint * retailMultiplier);
  const retailTotalLow = Math.round(wholesaleTotalLow * retailMultiplier);
  const retailTotalHigh = Math.round(wholesaleTotalHigh * retailMultiplier);

  // ----------------------------------------------------------------------
  // 8. AUDIT BREAKDOWN FOR INSPECTION PANEL
  // ----------------------------------------------------------------------
  const breakdown: ValuationBreakdownItem[] = [
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
      name: `Laboratory Verification (${params.certification.toUpperCase()})`,
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
