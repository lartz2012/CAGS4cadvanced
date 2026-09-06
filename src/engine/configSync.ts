import { ORIGIN_TABLE, TREATMENT_TABLE, TRADE_COLOR_TERMS } from './pricingModel';
import { SPECIES_CATALOG } from './speciesCatalog';

export const STORAGE_KEY_CONFIG = 'cags_config_overrides';
export const STORAGE_KEY_PRICES = 'cags_price_overrides';

export function getLocalConfigOverrides(): any {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CONFIG);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.warn('Failed to read local config overrides:', e);
    return {};
  }
}

export function saveLocalConfigOverrides(overrides: any): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(overrides));
  } catch (e) {
    console.warn('Failed to save local config overrides:', e);
  }
}

export function clearLocalConfigOverrides(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY_CONFIG);
  } catch (e) {}
}

export function getLocalPriceOverrides(): Record<string, number> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PRICES);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

export function saveLocalPriceOverride(speciesId: string, basePrice: number): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getLocalPriceOverrides();
    current[speciesId] = basePrice;
    localStorage.setItem(STORAGE_KEY_PRICES, JSON.stringify(current));
  } catch (e) {}
}

export function clearLocalPriceOverride(speciesId: string): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getLocalPriceOverrides();
    delete current[speciesId];
    localStorage.setItem(STORAGE_KEY_PRICES, JSON.stringify(current));
  } catch (e) {}
}

export function clearAllLocalPriceOverrides(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY_PRICES);
  } catch (e) {}
}

/**
 * Merges overrides onto base catalog configuration
 */
export function mergeConfigOverrides(baseConfig: any, overrides: any): any {
  if (!baseConfig) {
    baseConfig = {
      origins: ORIGIN_TABLE,
      treatments: TREATMENT_TABLE,
      species: SPECIES_CATALOG,
      colorTerms: TRADE_COLOR_TERMS,
      systemSettings: {
        defaultRetailMargin: 50,
        certSpread: { major: 0.12, domestic: 0.20, none: 0.30 },
        certMultiplier: { major: 1.10, domestic: 1.00, none: 0.88 }
      }
    };
  }
  if (!overrides || Object.keys(overrides).length === 0) {
    return { ...baseConfig, overrides: {} };
  }

  const merged = { ...baseConfig };

  if (overrides.origins) {
    merged.origins = { ...baseConfig.origins };
    for (const [cat, items] of Object.entries(overrides.origins)) {
      merged.origins[cat] = { ...(merged.origins[cat] || {}), ...(items as any) };
    }
  }

  if (overrides.treatments) {
    merged.treatments = { ...baseConfig.treatments };
    for (const [cat, items] of Object.entries(overrides.treatments)) {
      merged.treatments[cat] = { ...(merged.treatments[cat] || {}), ...(items as any) };
    }
  }

  if (overrides.species) {
    merged.species = { ...baseConfig.species };
    for (const [id, spec] of Object.entries(overrides.species)) {
      merged.species[id] = { ...(merged.species[id] || {}), ...(spec as any) };
    }
  }

  if (overrides.colorTerms) {
    merged.colorTerms = { ...(baseConfig.colorTerms || {}), ...(overrides.colorTerms as any) };
  }

  if (overrides.systemSettings) {
    merged.systemSettings = { ...(baseConfig.systemSettings || {}), ...(overrides.systemSettings as any) };
  }

  merged.overrides = overrides;
  return merged;
}
