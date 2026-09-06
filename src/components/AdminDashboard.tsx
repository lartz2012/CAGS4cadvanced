import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { GlassCard } from './GlassCard';
import {
  Settings,
  RefreshCw,
  AlertTriangle,
  Edit2,
  Check,
  X,
  Database,
  MapPin,
  Thermometer,
  Sliders,
  Trash2,
  ArrowLeft,
  Search,
  Sparkles,
  Plus,
  Filter,
  CheckCircle2,
  Layers,
  HelpCircle,
  FolderPlus
} from 'lucide-react';
import {
  calculateGemValuation,
  ORIGIN_TABLE,
  TREATMENT_TABLE,
  TRADE_COLOR_TERMS,
  GemInputParams
} from '../engine/pricingModel';
import { SPECIES_CATALOG } from '../engine/speciesCatalog';

const API = ''; // Relative path works on both localhost (proxied) and Vercel

const CATEGORY_NAMES: Record<string, string> = {
  corundum: 'Blue & Fancy Sapphires (Corundum)',
  ruby: 'Natural Rubies (Corundum)',
  emerald: 'Emeralds (Beryl)',
  paraiba: 'Paraíba & Cuprian Tourmalines',
  tourmaline: 'Standard Tourmaline Species',
  spinel: 'Noble Spinel',
  alexandrite: 'Alexandrite & Chrysoberyl',
  demantoid: 'Demantoid & Rare Garnets',
  routine_heat: 'Tanzanite & Heat-Treated Standards',
  untreated: 'Natural Untreated Type Gems',
  irradiated: 'Topaz & Radiation-Treated Standards',
  generic: 'Standard Colored Gemstones (Global Baseline)'
};

// Immediate Default State so tables are NEVER blank even before network connects
const DEFAULT_PRICES = Object.values(SPECIES_CATALOG).map(s => ({
  speciesId: s.id,
  name: s.name,
  family: s.family,
  basePrice: s.basePricePerCarat,
  isManualOverride: false,
  lastUpdated: null,
  source: 'Catalog Default'
}));

const DEFAULT_CONFIG_DATA = {
  origins: ORIGIN_TABLE,
  treatments: TREATMENT_TABLE,
  species: Object.fromEntries(
    Object.entries(SPECIES_CATALOG).map(([id, s]) => [id, {
      id: s.id,
      name: s.name,
      family: s.family,
      basePricePerCarat: s.basePricePerCarat,
      clarityType: s.clarityType,
      treatmentCategory: s.treatmentCategory,
      originCategory: s.originCategory
    }])
  ),
  overrides: {},
  systemSettings: {
    defaultRetailMargin: 50,
    certSpread: { major: 0.12, domestic: 0.20, none: 0.30 },
    certMultiplier: { major: 1.10, domestic: 1.00, none: 0.88 }
  },
  colorTerms: TRADE_COLOR_TERMS
};

type Tab = 'sandbox' | 'prices' | 'origins' | 'treatments' | 'colorTerms' | 'species' | 'system';

interface AdminDashboardProps {
  onBack?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBack }) => {
  const [tab, setTab] = useState<Tab>('sandbox');
  const [prices, setPrices] = useState<any[]>(DEFAULT_PRICES);
  const [configData, setConfigData] = useState<any>(DEFAULT_CONFIG_DATA);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [saved, setSaved] = useState('');

  // Search & Filter States
  const [priceSearch, setPriceSearch] = useState('');
  const [familyFilter, setFamilyFilter] = useState('all');
  const [speciesSearch, setSpeciesSearch] = useState('');

  // Editing States
  const [priceEdits, setPriceEdits] = useState<{ [k: string]: number }>({});
  const [speciesEdits, setSpeciesEdits] = useState<{ [k: string]: any }>({});
  const [colorTermEdits, setColorTermEdits] = useState<{ [k: string]: any[] }>({});
  const [originEdits, setOriginEdits] = useState<{ [cat: string]: { [key: string]: { factor?: number; label?: string } } }>({});
  const [treatEdits, setTreatEdits] = useState<{ [cat: string]: { [key: string]: { factor?: number; label?: string } } }>({});
  const [systemEdits, setSystemEdits] = useState<any>(DEFAULT_CONFIG_DATA.systemSettings);

  // Modal Dialogs for Creating New Items
  const [showAddOrigin, setShowAddOrigin] = useState(false);
  const [newOrigin, setNewOrigin] = useState({ category: 'corundum', key: '', label: '', factor: 1.0 });

  const [showAddTreat, setShowAddTreat] = useState(false);
  const [newTreat, setNewTreat] = useState({ category: 'corundum', key: '', label: '', factor: 1.0 });

  const [showAddColorTerm, setShowAddColorTerm] = useState(false);
  const [newColorTerm, setNewColorTerm] = useState({
    speciesId: 'blue_sapphire',
    term: '',
    multiplier: 1.2,
    premium: true,
    hueMin: 200,
    hueMax: 230,
    toneMin: 60,
    toneMax: 75,
    satMin: 70,
    satMax: 95
  });

  const [showAddSpecies, setShowAddSpecies] = useState(false);
  const [newSpecies, setNewSpecies] = useState({
    id: '',
    name: '',
    family: 'Corundum',
    basePricePerCarat: 500,
    clarityType: 'II' as 'I' | 'II' | 'III',
    originCategory: 'corundum',
    treatmentCategory: 'corundum'
  });

  // --------------------------------------------------------------------------
  // LIVE SIMULATION SANDBOX STATE
  // --------------------------------------------------------------------------
  const [simSpeciesId, setSimSpeciesId] = useState('blue_sapphire');
  const [simCarat, setSimCarat] = useState(3.0);
  const [simQualityPreset, setSimQualityPreset] = useState<'extra_fine' | 'fine' | 'good' | 'commercial'>('fine');
  const [simOrigin, setSimOrigin] = useState('srilanka');
  const [simTreatment, setSimTreatment] = useState('heated_standard');
  const [simCert, setSimCert] = useState<'major' | 'domestic' | 'none'>('major');

  const flash = (msg = 'Saved ✓') => {
    setSaved(msg);
    setTimeout(() => setSaved(''), 3500);
  };

  const fetchPrices = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/admin/prices`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setPrices(data);
        }
      }
    } catch (e) {
      console.warn('Using default prices fallback:', e);
    }
  }, []);

  const fetchConfig = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/admin/config`);
      if (res.ok) {
        const d = await res.json();
        if (d && d.origins) {
          setConfigData(d);
          setSystemEdits(d.systemSettings || DEFAULT_CONFIG_DATA.systemSettings);
        }
      }
    } catch (e) {
      console.warn('Using default config fallback:', e);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchPrices(), fetchConfig()]).finally(() => setLoading(false));
  }, [fetchPrices, fetchConfig]);

  // Sync sandbox origin & treatment when species changes
  useEffect(() => {
    const sp = SPECIES_CATALOG[simSpeciesId];
    if (!sp) return;
    const catOrigins = configData?.origins?.[sp.originCategory] || ORIGIN_TABLE[sp.originCategory] || ORIGIN_TABLE.generic;
    const defaultOrig = Object.keys(catOrigins)[0] || 'srilanka';
    setSimOrigin(defaultOrig);

    const catTreats = configData?.treatments?.[sp.treatmentCategory] || TREATMENT_TABLE[sp.treatmentCategory] || TREATMENT_TABLE.generic;
    const defaultTrt = Object.keys(catTreats)[0] || 'heated_standard';
    setSimTreatment(defaultTrt);
  }, [simSpeciesId, configData]);

  // --------------------------------------------------------------------------
  // CRUD ACTIONS: SPECIES BASE PRICES
  // --------------------------------------------------------------------------
  const submitPrice = async (speciesId: string) => {
    const p = priceEdits[speciesId];
    if (p === undefined || isNaN(p) || p <= 0) return;
    try {
      await fetch(`${API}/api/admin/override-price`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          speciesId,
          priceData: {
            basePrice: p,
            lowIqr: Math.round(p * 0.88),
            highIqr: Math.round(p * 1.15),
            trend30d: '+0.0%',
            clearedTransactionsCount: 50,
            source: 'Admin Manual Override'
          }
        })
      });
      // Local state update immediately for instant responsiveness
      setPrices(prev => prev.map(item => item.speciesId === speciesId ? { ...item, basePrice: p, isManualOverride: true } : item));
      const n = { ...priceEdits };
      delete n[speciesId];
      setPriceEdits(n);
      await Promise.all([fetchPrices(), fetchConfig()]);
      flash(`Updated base price to $${p.toLocaleString()}/ct`);
    } catch (err: any) {
      alert('Error updating price: ' + err.message);
    }
  };

  const clearPrice = async (speciesId: string) => {
    try {
      await fetch(`${API}/api/admin/clear-override`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ speciesId })
      });
      const def = SPECIES_CATALOG[speciesId]?.basePricePerCarat || 500;
      setPrices(prev => prev.map(item => item.speciesId === speciesId ? { ...item, basePrice: def, isManualOverride: false } : item));
      await Promise.all([fetchPrices(), fetchConfig()]);
      flash('Price restored to catalog default');
    } catch (err: any) {
      alert('Error restoring default price: ' + err.message);
    }
  };

  const forceRefresh = async () => {
    setRefreshing(true);
    try {
      await fetch(`${API}/api/admin/force-refresh`, { method: 'POST' });
      await Promise.all([fetchPrices(), fetchConfig()]);
      flash('Firestore connection verified and refreshed');
    } finally {
      setRefreshing(false);
    }
  };

  // --------------------------------------------------------------------------
  // CRUD ACTIONS: ORIGIN MULTIPLIERS
  // --------------------------------------------------------------------------
  const saveOrigin = async (cat: string, key: string) => {
    const v = originEdits[cat]?.[key];
    if (!v) return;
    await fetch(`${API}/api/admin/config`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'origin', category: cat, key, value: v })
    });
    await fetchConfig();
    flash(`Saved origin multiplier for ${key}`);
    setOriginEdits(p => {
      const n = { ...p };
      if (n[cat]) delete n[cat][key];
      return n;
    });
  };

  const resetOrigin = async (cat: string, key: string) => {
    await fetch(`${API}/api/admin/config`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'origin', category: cat, key })
    });
    await fetchConfig();
    flash(`Reset origin ${key} to default`);
  };

  const handleAddOrigin = async () => {
    if (!newOrigin.key || !newOrigin.label) {
      alert('Please provide both an Origin Key and Display Label');
      return;
    }
    const cleanKey = newOrigin.key.toLowerCase().replace(/[^a-z0-9_]/g, '_');
    await fetch(`${API}/api/admin/config`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'origin',
        category: newOrigin.category,
        key: cleanKey,
        value: { label: newOrigin.label, factor: Number(newOrigin.factor) }
      })
    });
    await fetchConfig();
    setShowAddOrigin(false);
    setNewOrigin({ category: 'corundum', key: '', label: '', factor: 1.0 });
    flash(`Added new origin: ${newOrigin.label}`);
  };

  // --------------------------------------------------------------------------
  // CRUD ACTIONS: TREATMENT STATUS FACTORS
  // --------------------------------------------------------------------------
  const saveTreat = async (cat: string, key: string) => {
    const v = treatEdits[cat]?.[key];
    if (!v) return;
    await fetch(`${API}/api/admin/config`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'treatment', category: cat, key, value: v })
    });
    await fetchConfig();
    flash(`Saved treatment factor for ${key}`);
    setTreatEdits(p => {
      const n = { ...p };
      if (n[cat]) delete n[cat][key];
      return n;
    });
  };

  const resetTreat = async (cat: string, key: string) => {
    await fetch(`${API}/api/admin/config`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'treatment', category: cat, key })
    });
    await fetchConfig();
    flash(`Reset treatment ${key} to default`);
  };

  const handleAddTreat = async () => {
    if (!newTreat.key || !newTreat.label) {
      alert('Please provide both a Treatment Key and Display Label');
      return;
    }
    const cleanKey = newTreat.key.toLowerCase().replace(/[^a-z0-9_]/g, '_');
    await fetch(`${API}/api/admin/config`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'treatment',
        category: newTreat.category,
        key: cleanKey,
        value: { label: newTreat.label, factor: Number(newTreat.factor) }
      })
    });
    await fetchConfig();
    setShowAddTreat(false);
    setNewTreat({ category: 'corundum', key: '', label: '', factor: 1.0 });
    flash(`Added new treatment: ${newTreat.label}`);
  };

  // --------------------------------------------------------------------------
  // CRUD ACTIONS: TRADE COLOR TERMS
  // --------------------------------------------------------------------------
  const saveColorTermArray = async (speciesId: string, newArray: any[]) => {
    await fetch(`${API}/api/admin/config`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'colorTerm', key: speciesId, value: newArray })
    });
    await fetchConfig();
    flash(`Updated prestige color terms for ${speciesId}`);
    setColorTermEdits(p => {
      const n = { ...p };
      delete n[speciesId];
      return n;
    });
  };

  const handleAddColorTerm = async () => {
    if (!newColorTerm.term) {
      alert('Please enter a color term name');
      return;
    }
    const currentList = configData?.colorTerms?.[newColorTerm.speciesId] || TRADE_COLOR_TERMS[newColorTerm.speciesId] || [];
    const updatedList = [
      {
        term: newColorTerm.term,
        multiplier: Number(newColorTerm.multiplier),
        premium: Boolean(newColorTerm.premium),
        hueMin: Number(newColorTerm.hueMin),
        hueMax: Number(newColorTerm.hueMax),
        toneMin: Number(newColorTerm.toneMin),
        toneMax: Number(newColorTerm.toneMax),
        satMin: Number(newColorTerm.satMin),
        satMax: Number(newColorTerm.satMax)
      },
      ...currentList
    ];
    await saveColorTermArray(newColorTerm.speciesId, updatedList);
    setShowAddColorTerm(false);
    setNewColorTerm({
      speciesId: 'blue_sapphire',
      term: '',
      multiplier: 1.2,
      premium: true,
      hueMin: 200,
      hueMax: 230,
      toneMin: 60,
      toneMax: 75,
      satMin: 70,
      satMax: 95
    });
  };

  // --------------------------------------------------------------------------
  // CRUD ACTIONS: SPECIES CATALOG META
  // --------------------------------------------------------------------------
  const saveSpeciesMeta = async (speciesId: string) => {
    const edit = speciesEdits[speciesId];
    if (!edit) return;
    await fetch(`${API}/api/admin/config`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'species', key: speciesId, value: edit })
    });
    await fetchConfig();
    flash(`Saved metadata for ${speciesId}`);
    setSpeciesEdits(p => {
      const n = { ...p };
      delete n[speciesId];
      return n;
    });
  };

  const resetSpeciesMeta = async (speciesId: string) => {
    await fetch(`${API}/api/admin/config`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'species', key: speciesId })
    });
    await fetchConfig();
    flash(`Reset metadata for ${speciesId}`);
  };

  const handleAddSpecies = async () => {
    if (!newSpecies.id || !newSpecies.name) {
      alert('Please provide Species ID and Name');
      return;
    }
    const cleanId = newSpecies.id.toLowerCase().replace(/[^a-z0-9_]/g, '_');
    // 1. Add to species config
    await fetch(`${API}/api/admin/config`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'species',
        key: cleanId,
        value: {
          id: cleanId,
          name: newSpecies.name,
          family: newSpecies.family,
          basePricePerCarat: Number(newSpecies.basePricePerCarat),
          clarityType: newSpecies.clarityType,
          originCategory: newSpecies.originCategory,
          treatmentCategory: newSpecies.treatmentCategory
        }
      })
    });
    // 2. Add base price
    await fetch(`${API}/api/admin/override-price`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        speciesId: cleanId,
        priceData: {
          basePrice: Number(newSpecies.basePricePerCarat),
          lowIqr: Math.round(newSpecies.basePricePerCarat * 0.88),
          highIqr: Math.round(newSpecies.basePricePerCarat * 1.15),
          trend30d: '+0.0%',
          clearedTransactionsCount: 10,
          source: 'Admin Created Species'
        }
      })
    });
    await Promise.all([fetchPrices(), fetchConfig()]);
    setShowAddSpecies(false);
    setNewSpecies({
      id: '',
      name: '',
      family: 'Corundum',
      basePricePerCarat: 500,
      clarityType: 'II',
      originCategory: 'corundum',
      treatmentCategory: 'corundum'
    });
    flash(`Added new species: ${newSpecies.name}`);
  };

  // --------------------------------------------------------------------------
  // SYSTEM SETTINGS ACTIONS
  // --------------------------------------------------------------------------
  const saveSystem = async () => {
    await fetch(`${API}/api/admin/config`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ systemSettings: systemEdits })
    });
    await fetchConfig();
    flash('Global system settings saved to Cloud Firestore');
  };

  const resetSection = async (type: string, name: string) => {
    if (!confirm(`Reset all ${name} back to factory defaults?`)) return;
    await fetch(`${API}/api/admin/config`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type })
    });
    await Promise.all([fetchPrices(), fetchConfig()]);
    flash(`All ${name} reset to catalog defaults`);
  };

  const resetAll = async () => {
    if (!confirm('Are you sure you want to reset ALL configuration overrides to catalog defaults?')) return;
    await fetch(`${API}/api/admin/config`, { method: 'DELETE' });
    await Promise.all([fetchPrices(), fetchConfig()]);
    flash('All overrides reset to defaults');
  };

  // --------------------------------------------------------------------------
  // LIVE SIMULATION CALCULATIONS (BASELINE VS ADJUSTED)
  // --------------------------------------------------------------------------
  const simSpecies = SPECIES_CATALOG[simSpeciesId] || SPECIES_CATALOG['blue_sapphire'];

  const qualityScores = useMemo(() => {
    switch (simQualityPreset) {
      case 'extra_fine':
        return { tone: 68, sat: 92, clarity: 'FI' as const, eyeClean: true, brilliance: 90, windowing: 3, extinction: 5 };
      case 'fine':
        return { tone: 65, sat: 82, clarity: 'LI' as const, eyeClean: true, brilliance: 85, windowing: 5, extinction: 8 };
      case 'good':
        return { tone: 58, sat: 65, clarity: 'MI' as const, eyeClean: false, brilliance: 75, windowing: 10, extinction: 15 };
      case 'commercial':
      default:
        return { tone: 45, sat: 45, clarity: 'HI' as const, eyeClean: false, brilliance: 60, windowing: 20, extinction: 25 };
    }
  }, [simQualityPreset]);

  const simParams: GemInputParams = useMemo(() => ({
    speciesId: simSpeciesId,
    carat: simCarat,
    hue: simSpecies.defaultColor?.hue || 215,
    tone: qualityScores.tone,
    saturation: qualityScores.sat,
    clarityGrade: qualityScores.clarity,
    eyeClean: qualityScores.eyeClean,
    transparency: 0.95,
    colorZoning: 'minimal',
    brilliance: qualityScores.brilliance,
    windowing: qualityScores.windowing,
    extinction: qualityScores.extinction,
    symmetry: 'very_good',
    polish: 'very_good',
    treatment: simTreatment,
    origin: simOrigin,
    certification: simCert,
    retailMarginPercent: systemEdits?.defaultRetailMargin ?? 50
  }), [simSpeciesId, simCarat, simSpecies, qualityScores, simTreatment, simOrigin, simCert, systemEdits]);

  const baselineResult = useMemo(() => {
    try {
      return calculateGemValuation(simParams, {}, {});
    } catch (e) {
      return null;
    }
  }, [simParams]);

  const adjustedResult = useMemo(() => {
    try {
      const livePriceMap: Record<string, number> = {};
      prices.forEach(p => {
        if (p.speciesId && p.basePrice) livePriceMap[p.speciesId] = p.basePrice;
      });
      return calculateGemValuation(simParams, livePriceMap, configData?.overrides || {});
    } catch (e) {
      return null;
    }
  }, [simParams, prices, configData]);

  const filteredPrices = useMemo(() => {
    return prices.filter(p => {
      const matchSearch =
        !priceSearch ||
        p.name?.toLowerCase().includes(priceSearch.toLowerCase()) ||
        p.speciesId?.toLowerCase().includes(priceSearch.toLowerCase()) ||
        p.family?.toLowerCase().includes(priceSearch.toLowerCase());
      const matchFamily = familyFilter === 'all' || p.family?.toLowerCase() === familyFilter.toLowerCase();
      return matchSearch && matchFamily;
    });
  }, [prices, priceSearch, familyFilter]);

  const filteredSpeciesList = useMemo(() => {
    const list = Object.entries(configData?.species || DEFAULT_CONFIG_DATA.species);
    if (!speciesSearch) return list;
    return list.filter(([key, entry]: [string, any]) =>
      entry.name?.toLowerCase().includes(speciesSearch.toLowerCase()) ||
      key.toLowerCase().includes(speciesSearch.toLowerCase()) ||
      entry.family?.toLowerCase().includes(speciesSearch.toLowerCase())
    );
  }, [configData, speciesSearch]);

  const availableFamilies = useMemo(() => {
    const s = new Set<string>();
    prices.forEach(p => { if (p.family) s.add(p.family); });
    return Array.from(s).sort();
  }, [prices]);

  return (
    <div style={{ padding: '2rem 1.5rem', minHeight: '100vh', maxWidth: '1180px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border, rgba(255,255,255,0.1))', paddingBottom: '1.2rem', flexWrap: 'wrap', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {onBack && (
            <button
              onClick={onBack}
              style={{ padding: '8px 16px', background: 'var(--glass-surface, rgba(255,255,255,0.08))', color: 'var(--text-primary, #fff)', border: '1px solid var(--glass-border, rgba(255,255,255,0.15))', borderRadius: '8px', fontWeight: 600, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s' }}
              title="Return to Appraisal Suite"
            >
              <ArrowLeft size={16} />
              <span>Back to Appraisal Suite</span>
            </button>
          )}
          <div>
            <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: 0, fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary, #fff)', letterSpacing: '-0.02em' }}>
              <Settings size={24} color="var(--accent-cyan, #38bdf8)" />
              <span>CAGS Admin Control Panel</span>
            </h1>
            <div style={{ fontSize: '11px', color: 'var(--text-muted, #8090a7)', marginTop: '3px' }}>
              Institutional Valuation Calibration Engine · Cloud Firestore Dynamic Configuration
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {saved && (
            <span style={{ color: '#10b981', fontWeight: 600, fontSize: '13px', padding: '4px 10px', background: 'rgba(16,185,129,0.15)', borderRadius: '6px', border: '1px solid rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <CheckCircle2 size={13} /> {saved}
            </span>
          )}
          <button
            onClick={resetAll}
            style={{ padding: '8px 14px', background: 'rgba(239,68,68,0.12)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '8px', fontWeight: 600, fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Trash2 size={13} /> Reset All Overrides
          </button>
          <button
            onClick={forceRefresh}
            disabled={refreshing}
            style={{ padding: '8px 16px', background: 'var(--accent-cyan, #38bdf8)', color: '#090d16', border: 'none', borderRadius: '8px', fontWeight: 700, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <RefreshCw size={13} className={refreshing ? 'spin' : ''} />
            {refreshing ? 'Refreshing...' : 'Verify Cloud Sync'}
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {([
          ['sandbox', 'Live Simulation Sandbox', <Sparkles size={14} color="#38bdf8" />],
          ['prices', 'Species Base Prices', <Database size={14} />],
          ['origins', 'Origin Multipliers', <MapPin size={14} />],
          ['treatments', 'Treatment Factors', <Thermometer size={14} />],
          ['colorTerms', 'Trade Color Terms', <Layers size={14} />],
          ['species', 'Species Catalog Meta', <Settings size={14} />],
          ['system', 'System Settings', <Sliders size={14} />]
        ] as [Tab, string, React.ReactNode][]).map(([id, label, icon]) => {
          const active = tab === id;
          return (
            <button
              key={id}
              onClick={() => setTab(id)}
              style={{
                padding: '9px 16px',
                background: active ? 'rgba(56,189,248,0.15)' : 'var(--glass-surface, rgba(255,255,255,0.04))',
                border: active ? '1px solid rgba(56,189,248,0.5)' : '1px solid var(--glass-border, rgba(255,255,255,0.1))',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '12.5px',
                fontWeight: active ? 700 : 500,
                color: active ? 'var(--accent-cyan, #38bdf8)' : 'var(--text-secondary, #cbd5e1)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.15s ease'
              }}
            >
              {icon}
              {label}
            </button>
          );
        })}
      </div>

      <>
        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* TAB 1: LIVE SIMULATION SANDBOX                                    */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {tab === 'sandbox' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <GlassCard>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '1.2rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ padding: '3px 8px', background: 'rgba(56,189,248,0.18)', color: '#38bdf8', borderRadius: '6px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      Real-Time Calibration
                    </span>
                    <h2 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-primary)' }}>
                      Valuation Simulation Sandbox
                    </h2>
                  </div>
                  <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--text-muted)' }}>
                    Test your base price overrides, origin multipliers, and treatment factors immediately without leaving the panel.
                  </p>
                </div>
              </div>

              {/* Sandbox Input Controls */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', padding: '16px', background: 'rgba(0,0,0,0.2)', borderRadius: '10px', border: '1px solid var(--glass-border)' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600 }}>
                    Species
                  </label>
                  <select
                    value={simSpeciesId}
                    onChange={e => setSimSpeciesId(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', background: 'var(--input-bg)', border: '1px solid var(--input-border)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '13px' }}
                  >
                    {Object.values(SPECIES_CATALOG).map(sp => (
                      <option key={sp.id} value={sp.id} style={{ background: '#0f172a', color: '#fff' }}>
                        {sp.name} ({sp.family})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600 }}>
                    Carat Weight
                  </label>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {[1.0, 2.5, 3.0, 5.0].map(ct => (
                      <button
                        key={ct}
                        onClick={() => setSimCarat(ct)}
                        style={{
                          flex: 1,
                          padding: '6px 4px',
                          background: simCarat === ct ? 'var(--accent-cyan)' : 'var(--glass-surface)',
                          color: simCarat === ct ? '#090d16' : 'var(--text-primary)',
                          border: '1px solid var(--glass-border)',
                          borderRadius: '6px',
                          fontSize: '11.5px',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        {ct} ct
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600 }}>
                    Quality Tier
                  </label>
                  <select
                    value={simQualityPreset}
                    onChange={e => setSimQualityPreset(e.target.value as any)}
                    style={{ width: '100%', padding: '8px 10px', background: 'var(--input-bg)', border: '1px solid var(--input-border)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '13px' }}
                  >
                    <option value="extra_fine" style={{ background: '#0f172a' }}>Superb / Extra Fine (Connoisseur)</option>
                    <option value="fine" style={{ background: '#0f172a' }}>Fine Trade (Investment Grade)</option>
                    <option value="good" style={{ background: '#0f172a' }}>Good Commercial</option>
                    <option value="commercial" style={{ background: '#0f172a' }}>Commercial Trade</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600 }}>
                    Geographic Origin
                  </label>
                  <select
                    value={simOrigin}
                    onChange={e => setSimOrigin(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', background: 'var(--input-bg)', border: '1px solid var(--input-border)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '13px' }}
                  >
                    {Object.entries(
                      configData?.origins?.[simSpecies.originCategory] ||
                      ORIGIN_TABLE[simSpecies.originCategory] ||
                      ORIGIN_TABLE.generic
                    ).map(([k, orig]: [string, any]) => (
                      <option key={k} value={k} style={{ background: '#0f172a' }}>
                        {orig.label} (×{orig.factor?.toFixed(2)})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600 }}>
                    Treatment Status
                  </label>
                  <select
                    value={simTreatment}
                    onChange={e => setSimTreatment(e.target.value)}
                    style={{ width: '100%', padding: '8px 10px', background: 'var(--input-bg)', border: '1px solid var(--input-border)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '13px' }}
                  >
                    {Object.entries(
                      configData?.treatments?.[simSpecies.treatmentCategory] ||
                      TREATMENT_TABLE[simSpecies.treatmentCategory] ||
                      TREATMENT_TABLE.generic
                    ).map(([k, trt]: [string, any]) => (
                      <option key={k} value={k} style={{ background: '#0f172a' }}>
                        {trt.label} (×{trt.factor?.toFixed(2)})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600 }}>
                    Lab Certification
                  </label>
                  <select
                    value={simCert}
                    onChange={e => setSimCert(e.target.value as any)}
                    style={{ width: '100%', padding: '8px 10px', background: 'var(--input-bg)', border: '1px solid var(--input-border)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '13px' }}
                  >
                    <option value="major" style={{ background: '#0f172a' }}>Tier 1 Lab (GIA / SSEF / Gübelin)</option>
                    <option value="domestic" style={{ background: '#0f172a' }}>Domestic Accredited Lab</option>
                    <option value="none" style={{ background: '#0f172a' }}>No Formal Laboratory Report</option>
                  </select>
                </div>
              </div>

              {/* Simulation Output Cards */}
              {baselineResult && adjustedResult && (
                <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                  {/* Baseline Card */}
                  <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', borderRadius: '10px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
                      Catalog Baseline (Uncalibrated)
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'monospace' }}>
                      ${baselineResult.wholesaleTotalMidpoint?.toLocaleString()}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                      Wholesale: ${baselineResult.wholesaleMidpointPerCarat?.toLocaleString()} /ct
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '6px', borderTop: '1px solid var(--glass-border)', paddingTop: '6px' }}>
                      Retail Replacement: <strong>${baselineResult.retailTotalMidpoint?.toLocaleString()}</strong>
                    </div>
                  </div>

                  {/* Adjusted Card */}
                  <div style={{ padding: '16px', background: 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.3)', borderRadius: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-cyan)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        Active Admin Calibration
                      </div>
                      {baselineResult.wholesaleTotalMidpoint > 0 && (
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 800,
                            padding: '2px 6px',
                            borderRadius: '4px',
                            background: adjustedResult.wholesaleTotalMidpoint >= baselineResult.wholesaleTotalMidpoint ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)',
                            color: adjustedResult.wholesaleTotalMidpoint >= baselineResult.wholesaleTotalMidpoint ? '#10b981' : '#ef4444'
                          }}
                        >
                          {adjustedResult.wholesaleTotalMidpoint >= baselineResult.wholesaleTotalMidpoint ? '+' : ''}
                          {(
                            ((adjustedResult.wholesaleTotalMidpoint - baselineResult.wholesaleTotalMidpoint) /
                              baselineResult.wholesaleTotalMidpoint) *
                            100
                          ).toFixed(1)}%
                        </span>
                      )}
                    </div>

                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-cyan)', fontFamily: 'monospace' }}>
                      ${adjustedResult.wholesaleTotalMidpoint?.toLocaleString()}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                      Wholesale: ${adjustedResult.wholesaleMidpointPerCarat?.toLocaleString()} /ct
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-primary)', marginTop: '6px', borderTop: '1px solid rgba(56,189,248,0.2)', paddingTop: '6px' }}>
                      Retail Replacement: <strong>${adjustedResult.retailTotalMidpoint?.toLocaleString()}</strong>
                    </div>
                  </div>

                  {/* Multipliers Breakdown */}
                  <div style={{ padding: '16px', background: 'rgba(0,0,0,0.25)', border: '1px solid var(--glass-border)', borderRadius: '10px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>
                      Calculation Multipliers Active
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Base Price (/ct):</span>
                        <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>
                          ${adjustedResult.species.basePricePerCarat?.toLocaleString()}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Quality Tier:</span>
                        <span style={{ color: adjustedResult.tierColor, fontWeight: 700 }}>
                          {adjustedResult.qualityTier} ({adjustedResult.compositeQualityScore}/100)
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Trade Color Term:</span>
                        <span style={{ color: '#38bdf8', fontWeight: 600 }}>{adjustedResult.tradeColorTerm}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Origin Multiplier:</span>
                        <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>
                          ×{adjustedResult.breakdown.find(b => b.name.includes('Origin'))?.factor?.toFixed(2) || '1.00'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Treatment Factor:</span>
                        <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>
                          ×{adjustedResult.breakdown.find(b => b.name.includes('Treatment'))?.factor?.toFixed(2) || '1.00'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Cert Multiplier:</span>
                        <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>
                          ×{adjustedResult.breakdown.find(b => b.name.includes('Laboratory'))?.factor?.toFixed(2) || '1.00'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </GlassCard>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* TAB 2: SPECIES BASE PRICES                                        */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {tab === 'prices' && (
          <GlassCard>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.25rem' }}>
                  Species Base Price Overrides
                </h3>
                <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: '13px' }}>
                  Calibrates the wholesale pricing grid proportionally across all carat brackets. Overrides take precedence immediately.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setShowAddSpecies(true)}
                  style={{ padding: '7px 14px', background: 'var(--accent-cyan)', color: '#090d16', border: 'none', borderRadius: '6px', fontWeight: 700, fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Plus size={14} /> Add New Gem Species
                </button>
                <button
                  onClick={() => resetSection('species_all', 'Base Prices')}
                  style={{ padding: '6px 12px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}
                >
                  Reset All Prices
                </button>
              </div>
            </div>

            {/* Filters & Search */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ position: 'relative', flex: '1 1 240px', minWidth: '220px' }}>
                <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search species by name or family..."
                  value={priceSearch}
                  onChange={e => setPriceSearch(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px 8px 32px', background: 'var(--input-bg)', border: '1px solid var(--input-border)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setFamilyFilter('all')}
                  style={{
                    padding: '6px 12px',
                    background: familyFilter === 'all' ? 'var(--accent-cyan)' : 'var(--glass-surface)',
                    color: familyFilter === 'all' ? '#090d16' : 'var(--text-secondary)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  All Families
                </button>
                {availableFamilies.map(fam => (
                  <button
                    key={fam}
                    onClick={() => setFamilyFilter(fam)}
                    style={{
                      padding: '6px 12px',
                      background: familyFilter === fam ? 'var(--accent-cyan)' : 'var(--glass-surface)',
                      color: familyFilter === fam ? '#090d16' : 'var(--text-secondary)',
                      border: '1px solid var(--glass-border)',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    {fam}
                  </button>
                ))}
              </div>
            </div>

            {/* Table */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                    <th style={{ padding: '10px 8px', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Gemstone & Family</th>
                    <th style={{ padding: '10px 8px', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Catalog Baseline</th>
                    <th style={{ padding: '10px 8px', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Active Price (/ct)</th>
                    <th style={{ padding: '10px 8px', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Status & Delta</th>
                    <th style={{ padding: '10px 8px', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Quick Adjust</th>
                    <th style={{ padding: '10px 8px', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPrices.map(p => {
                    const baseline = SPECIES_CATALOG[p.speciesId]?.basePricePerCarat || p.basePrice || 500;
                    const current = p.basePrice || baseline;
                    const deltaPct = baseline > 0 ? (((current - baseline) / baseline) * 100).toFixed(0) : '0';
                    const isEditing = priceEdits[p.speciesId] !== undefined;

                    return (
                      <tr key={p.speciesId} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                        <td style={{ padding: '12px 8px' }}>
                          <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '14px' }}>
                            {p.name || p.speciesId}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                            {p.family} · <code style={{ color: 'var(--accent-cyan)' }}>{p.speciesId}</code>
                          </div>
                        </td>

                        <td style={{ padding: '12px 8px', color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: '13px' }}>
                          ${baseline.toLocaleString()}
                        </td>

                        <td style={{ padding: '12px 8px' }}>
                          {isEditing ? (
                            <input
                              type="number"
                              min="1"
                              value={priceEdits[p.speciesId]}
                              onChange={e => setPriceEdits({ ...priceEdits, [p.speciesId]: Number(e.target.value) })}
                              style={{ width: '110px', padding: '6px 8px', background: 'var(--input-bg)', border: '1px solid var(--accent-cyan)', borderRadius: '6px', color: '#fff', fontFamily: 'monospace', fontSize: '14px', fontWeight: 700 }}
                            />
                          ) : (
                            <span style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '15px', color: p.isManualOverride ? '#38bdf8' : 'var(--text-primary)' }}>
                              ${current.toLocaleString()}
                            </span>
                          )}
                        </td>

                        <td style={{ padding: '12px 8px' }}>
                          {p.isManualOverride ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', padding: '3px 8px', borderRadius: '4px', background: 'rgba(56,189,248,0.15)', color: '#38bdf8', fontWeight: 700 }}>
                              Manual ({Number(deltaPct) >= 0 ? `+${deltaPct}%` : `${deltaPct}%`})
                            </span>
                          ) : (
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)', padding: '3px 8px', background: 'rgba(255,255,255,0.04)', borderRadius: '4px' }}>
                              Default Catalog
                            </span>
                          )}
                        </td>

                        <td style={{ padding: '12px 8px' }}>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            {[-10, 10, 25].map(step => (
                              <button
                                key={step}
                                onClick={() => setPriceEdits({ ...priceEdits, [p.speciesId]: Math.round(current * (1 + step / 100)) })}
                                style={{ padding: '3px 7px', background: 'var(--glass-surface)', border: '1px solid var(--glass-border)', borderRadius: '4px', color: 'var(--text-secondary)', fontSize: '11px', cursor: 'pointer' }}
                              >
                                {step > 0 ? `+${step}%` : `${step}%`}
                              </button>
                            ))}
                          </div>
                        </td>

                        <td style={{ padding: '12px 8px' }}>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            {isEditing ? (
                              <>
                                <button
                                  onClick={() => submitPrice(p.speciesId)}
                                  style={{ padding: '6px 12px', background: '#10b981', color: '#090d16', border: 'none', borderRadius: '6px', fontWeight: 700, fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                >
                                  <Check size={13} /> Save
                                </button>
                                <button
                                  onClick={() => {
                                    const n = { ...priceEdits };
                                    delete n[p.speciesId];
                                    setPriceEdits(n);
                                  }}
                                  style={{ padding: '6px 10px', background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '6px', cursor: 'pointer' }}
                                >
                                  <X size={13} />
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => setPriceEdits({ ...priceEdits, [p.speciesId]: current })}
                                style={{ padding: '6px 12px', background: 'var(--glass-surface)', border: '1px solid var(--glass-border)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
                              >
                                <Edit2 size={12} /> Edit
                              </button>
                            )}

                            {p.isManualOverride && (
                              <button
                                onClick={() => clearPrice(p.speciesId)}
                                style={{ padding: '6px 10px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '6px', cursor: 'pointer' }}
                                title="Reset to factory baseline"
                              >
                                <RefreshCw size={12} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </GlassCard>
        )}

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* TAB 3: ORIGIN MULTIPLIERS                                         */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {tab === 'origins' && (
          <GlassCard>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.25rem' }}>
                  Geographic Origin Multipliers
                </h3>
                <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: '13px' }}>
                  Multiplied directly into wholesale valuation. 1.00 = Trade baseline. Values &gt; 1.00 award prestige provenance premiums.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setShowAddOrigin(!showAddOrigin)}
                  style={{ padding: '7px 14px', background: 'var(--accent-cyan)', color: '#090d16', border: 'none', borderRadius: '6px', fontWeight: 700, fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Plus size={14} /> Add Origin
                </button>
                <button
                  onClick={() => resetSection('origins', 'Origins')}
                  style={{ padding: '7px 12px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}
                >
                  Reset Section
                </button>
              </div>
            </div>

            {/* Add Origin Form Modal / Drawer */}
            {showAddOrigin && (
              <div style={{ padding: '16px', background: 'rgba(56,189,248,0.06)', border: '1px solid rgba(56,189,248,0.3)', borderRadius: '10px', marginBottom: '1.5rem' }}>
                <h4 style={{ margin: '0 0 12px', color: 'var(--accent-cyan)', fontSize: '14px' }}>Add New Geographic Origin</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>Category</label>
                    <select
                      value={newOrigin.category}
                      onChange={e => setNewOrigin({ ...newOrigin, category: e.target.value })}
                      style={{ width: '100%', padding: '6px 8px', background: 'var(--input-bg)', border: '1px solid var(--input-border)', borderRadius: '6px', color: '#fff', fontSize: '12px' }}
                    >
                      {Object.keys(ORIGIN_TABLE).map(cat => (
                        <option key={cat} value={cat} style={{ background: '#0f172a' }}>{CATEGORY_NAMES[cat] || cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>Unique Key (e.g. vietnam_lucyen)</label>
                    <input
                      type="text"
                      placeholder="e.g. vietnam_lucyen"
                      value={newOrigin.key}
                      onChange={e => setNewOrigin({ ...newOrigin, key: e.target.value })}
                      style={{ width: '100%', padding: '6px 8px', background: 'var(--input-bg)', border: '1px solid var(--input-border)', borderRadius: '6px', color: '#fff', fontSize: '12px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>Display Label</label>
                    <input
                      type="text"
                      placeholder="e.g. Vietnam (Luc Yen Valley)"
                      value={newOrigin.label}
                      onChange={e => setNewOrigin({ ...newOrigin, label: e.target.value })}
                      style={{ width: '100%', padding: '6px 8px', background: 'var(--input-bg)', border: '1px solid var(--input-border)', borderRadius: '6px', color: '#fff', fontSize: '12px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>Multiplier (×)</label>
                    <input
                      type="number"
                      step="0.05"
                      min="0.1"
                      max="10"
                      value={newOrigin.factor}
                      onChange={e => setNewOrigin({ ...newOrigin, factor: Number(e.target.value) })}
                      style={{ width: '100%', padding: '6px 8px', background: 'var(--input-bg)', border: '1px solid var(--input-border)', borderRadius: '6px', color: '#fff', fontSize: '12px' }}
                    />
                  </div>
                </div>

                <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
                  <button onClick={handleAddOrigin} style={{ padding: '6px 14px', background: 'var(--accent-cyan)', color: '#090d16', border: 'none', borderRadius: '6px', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}>
                    Save Origin
                  </button>
                  <button onClick={() => setShowAddOrigin(false)} style={{ padding: '6px 12px', background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--glass-border)', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}>
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Origin Categories */}
            {Object.entries((configData?.origins || DEFAULT_CONFIG_DATA.origins) as Record<string, Record<string, any>>).map(([cat, entries]) => (
              <div key={cat} style={{ marginBottom: '2rem', background: 'rgba(0,0,0,0.15)', padding: '16px', borderRadius: '10px', border: '1px solid var(--glass-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <h4 style={{ margin: 0, color: 'var(--accent-cyan)', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
                    {CATEGORY_NAMES[cat] || `${cat} Origins`}
                  </h4>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{Object.keys(entries).length} Localities</span>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                        <th style={{ padding: '8px', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>Locality / Provenance</th>
                        <th style={{ padding: '8px', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>Baseline Factor</th>
                        <th style={{ padding: '8px', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>Current Multiplier</th>
                        <th style={{ padding: '8px', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>Set New Value</th>
                        <th style={{ padding: '8px', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(entries).map(([key, entry]: [string, any]) => {
                        const baseOrig = ORIGIN_TABLE[cat]?.[key];
                        const hasOverride = !!configData?.overrides?.origins?.[cat]?.[key];
                        const ed = originEdits[cat]?.[key];

                        return (
                          <tr key={key} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                            <td style={{ padding: '10px 8px' }}>
                              <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '13px' }}>{entry.label}</div>
                              <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>Key: <code>{key}</code></div>
                            </td>

                            <td style={{ padding: '10px 8px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                              ×{baseOrig?.factor?.toFixed(2) || entry.factor?.toFixed(2)}
                            </td>

                            <td style={{ padding: '10px 8px' }}>
                              <span style={{ fontFamily: 'monospace', fontWeight: 800, color: entry.factor > 1.0 ? '#10b981' : entry.factor < 0.95 ? '#ef4444' : '#fff' }}>
                                ×{entry.factor?.toFixed(2)}
                              </span>
                              {hasOverride && (
                                <span style={{ marginLeft: '8px', fontSize: '10px', padding: '2px 6px', background: 'rgba(56,189,248,0.18)', color: '#38bdf8', borderRadius: '4px', fontWeight: 700 }}>
                                  OVERRIDDEN
                                </span>
                              )}
                            </td>

                            <td style={{ padding: '10px 8px' }}>
                              <input
                                type="number"
                                step="0.05"
                                min="0.1"
                                max="10"
                                placeholder={entry.factor?.toFixed(2)}
                                value={ed?.factor ?? ''}
                                onChange={e =>
                                  setOriginEdits(p => ({
                                    ...p,
                                    [cat]: { ...p[cat], [key]: { factor: parseFloat(e.target.value) } }
                                  }))
                                }
                                style={{ width: '80px', padding: '5px 8px', background: 'var(--input-bg)', border: '1px solid var(--input-border)', borderRadius: '6px', color: '#fff', fontFamily: 'monospace', fontSize: '13px' }}
                              />
                            </td>

                            <td style={{ padding: '10px 8px' }}>
                              <div style={{ display: 'flex', gap: '6px' }}>
                                {ed?.factor !== undefined && !isNaN(ed.factor) && (
                                  <button
                                    onClick={() => saveOrigin(cat, key)}
                                    style={{ padding: '5px 10px', background: '#10b981', color: '#090d16', border: 'none', borderRadius: '6px', fontWeight: 700, fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                  >
                                    <Check size={12} /> Apply
                                  </button>
                                )}
                                {hasOverride && (
                                  <button
                                    onClick={() => resetOrigin(cat, key)}
                                    style={{ padding: '5px 8px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '6px', fontSize: '11px', cursor: 'pointer' }}
                                    title="Reset to default"
                                  >
                                    <RefreshCw size={11} />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </GlassCard>
        )}

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* TAB 4: TREATMENT STATUS FACTORS                                   */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {tab === 'treatments' && (
          <GlassCard>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.25rem' }}>
                  Treatment Status & Rarity Factors
                </h3>
                <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: '13px' }}>
                  Adjusts wholesale pricing based on laboratory-verified enhancement status.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setShowAddTreat(!showAddTreat)}
                  style={{ padding: '7px 14px', background: 'var(--accent-cyan)', color: '#090d16', border: 'none', borderRadius: '6px', fontWeight: 700, fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Plus size={14} /> Add Treatment
                </button>
                <button
                  onClick={() => resetSection('treatments', 'Treatments')}
                  style={{ padding: '7px 12px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}
                >
                  Reset Section
                </button>
              </div>
            </div>

            {/* Add Treatment Form Modal */}
            {showAddTreat && (
              <div style={{ padding: '16px', background: 'rgba(56,189,248,0.06)', border: '1px solid rgba(56,189,248,0.3)', borderRadius: '10px', marginBottom: '1.5rem' }}>
                <h4 style={{ margin: '0 0 12px', color: 'var(--accent-cyan)', fontSize: '14px' }}>Add New Treatment Entry</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>Category</label>
                    <select
                      value={newTreat.category}
                      onChange={e => setNewTreat({ ...newTreat, category: e.target.value })}
                      style={{ width: '100%', padding: '6px 8px', background: 'var(--input-bg)', border: '1px solid var(--input-border)', borderRadius: '6px', color: '#fff', fontSize: '12px' }}
                    >
                      {Object.keys(TREATMENT_TABLE).map(cat => (
                        <option key={cat} value={cat} style={{ background: '#0f172a' }}>{CATEGORY_NAMES[cat] || cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>Unique Key</label>
                    <input
                      type="text"
                      placeholder="e.g. low_temp_heat"
                      value={newTreat.key}
                      onChange={e => setNewTreat({ ...newTreat, key: e.target.value })}
                      style={{ width: '100%', padding: '6px 8px', background: 'var(--input-bg)', border: '1px solid var(--input-border)', borderRadius: '6px', color: '#fff', fontSize: '12px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>Display Label</label>
                    <input
                      type="text"
                      placeholder="e.g. Low-Temperature Heat (Mild)"
                      value={newTreat.label}
                      onChange={e => setNewTreat({ ...newTreat, label: e.target.value })}
                      style={{ width: '100%', padding: '6px 8px', background: 'var(--input-bg)', border: '1px solid var(--input-border)', borderRadius: '6px', color: '#fff', fontSize: '12px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>Multiplier (×)</label>
                    <input
                      type="number"
                      step="0.05"
                      min="0.05"
                      max="10"
                      value={newTreat.factor}
                      onChange={e => setNewTreat({ ...newTreat, factor: Number(e.target.value) })}
                      style={{ width: '100%', padding: '6px 8px', background: 'var(--input-bg)', border: '1px solid var(--input-border)', borderRadius: '6px', color: '#fff', fontSize: '12px' }}
                    />
                  </div>
                </div>

                <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
                  <button onClick={handleAddTreat} style={{ padding: '6px 14px', background: 'var(--accent-cyan)', color: '#090d16', border: 'none', borderRadius: '6px', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}>
                    Save Treatment
                  </button>
                  <button onClick={() => setShowAddTreat(false)} style={{ padding: '6px 12px', background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--glass-border)', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}>
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Treatment Categories */}
            {Object.entries((configData?.treatments || DEFAULT_CONFIG_DATA.treatments) as Record<string, Record<string, any>>).map(([cat, entries]) => (
              <div key={cat} style={{ marginBottom: '2rem', background: 'rgba(0,0,0,0.15)', padding: '16px', borderRadius: '10px', border: '1px solid var(--glass-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <h4 style={{ margin: 0, color: 'var(--accent-cyan)', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
                    {CATEGORY_NAMES[cat] || `${cat} Treatments`}
                  </h4>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{Object.keys(entries).length} Status Types</span>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                        <th style={{ padding: '8px', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>Treatment Description</th>
                        <th style={{ padding: '8px', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>Baseline Factor</th>
                        <th style={{ padding: '8px', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>Current Multiplier</th>
                        <th style={{ padding: '8px', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>Set New Value</th>
                        <th style={{ padding: '8px', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(entries).map(([key, entry]: [string, any]) => {
                        const baseTrt = TREATMENT_TABLE[cat]?.[key];
                        const hasOverride = !!configData?.overrides?.treatments?.[cat]?.[key];
                        const ed = treatEdits[cat]?.[key];

                        return (
                          <tr key={key} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                            <td style={{ padding: '10px 8px' }}>
                              <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '13px' }}>{entry.label}</div>
                              <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>Key: <code>{key}</code></div>
                            </td>

                            <td style={{ padding: '10px 8px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                              ×{baseTrt?.factor?.toFixed(2) || entry.factor?.toFixed(2)}
                            </td>

                            <td style={{ padding: '10px 8px' }}>
                              <span style={{ fontFamily: 'monospace', fontWeight: 800, color: entry.factor > 1.0 ? '#10b981' : entry.factor < 0.9 ? '#ef4444' : '#fff' }}>
                                ×{entry.factor?.toFixed(2)}
                              </span>
                              {hasOverride && (
                                <span style={{ marginLeft: '8px', fontSize: '10px', padding: '2px 6px', background: 'rgba(56,189,248,0.18)', color: '#38bdf8', borderRadius: '4px', fontWeight: 700 }}>
                                  OVERRIDDEN
                                </span>
                              )}
                            </td>

                            <td style={{ padding: '10px 8px' }}>
                              <input
                                type="number"
                                step="0.05"
                                min="0.05"
                                max="10"
                                placeholder={entry.factor?.toFixed(2)}
                                value={ed?.factor ?? ''}
                                onChange={e =>
                                  setTreatEdits(p => ({
                                    ...p,
                                    [cat]: { ...p[cat], [key]: { factor: parseFloat(e.target.value) } }
                                  }))
                                }
                                style={{ width: '80px', padding: '5px 8px', background: 'var(--input-bg)', border: '1px solid var(--input-border)', borderRadius: '6px', color: '#fff', fontFamily: 'monospace', fontSize: '13px' }}
                              />
                            </td>

                            <td style={{ padding: '10px 8px' }}>
                              <div style={{ display: 'flex', gap: '6px' }}>
                                {ed?.factor !== undefined && !isNaN(ed.factor) && (
                                  <button
                                    onClick={() => saveTreat(cat, key)}
                                    style={{ padding: '5px 10px', background: '#10b981', color: '#090d16', border: 'none', borderRadius: '6px', fontWeight: 700, fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                  >
                                    <Check size={12} /> Apply
                                  </button>
                                )}
                                {hasOverride && (
                                  <button
                                    onClick={() => resetTreat(cat, key)}
                                    style={{ padding: '5px 8px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '6px', fontSize: '11px', cursor: 'pointer' }}
                                    title="Reset to default"
                                  >
                                    <RefreshCw size={11} />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </GlassCard>
        )}

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* TAB 5: TRADE COLOR TERMS                                          */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {tab === 'colorTerms' && (
          <GlassCard>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.25rem' }}>
                  Prestige Trade Color Term Multipliers
                </h3>
                <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: '13px' }}>
                  Institutional descriptors (e.g. Royal Blue, Pigeon's Blood, Muzo Green, Padparadscha) that command historical premiums.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setShowAddColorTerm(!showAddColorTerm)}
                  style={{ padding: '7px 14px', background: 'var(--accent-cyan)', color: '#090d16', border: 'none', borderRadius: '6px', fontWeight: 700, fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Plus size={14} /> Add Color Term
                </button>
                <button
                  onClick={() => resetSection('colorTerms', 'Color Terms')}
                  style={{ padding: '7px 12px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}
                >
                  Reset Color Terms
                </button>
              </div>
            </div>

            {/* Add Color Term Form */}
            {showAddColorTerm && (
              <div style={{ padding: '16px', background: 'rgba(56,189,248,0.06)', border: '1px solid rgba(56,189,248,0.3)', borderRadius: '10px', marginBottom: '1.5rem' }}>
                <h4 style={{ margin: '0 0 12px', color: 'var(--accent-cyan)', fontSize: '14px' }}>Add Prestige Color Term</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>Species</label>
                    <select
                      value={newColorTerm.speciesId}
                      onChange={e => setNewColorTerm({ ...newColorTerm, speciesId: e.target.value })}
                      style={{ width: '100%', padding: '6px 8px', background: 'var(--input-bg)', border: '1px solid var(--input-border)', borderRadius: '6px', color: '#fff', fontSize: '12px' }}
                    >
                      {Object.values(SPECIES_CATALOG).map(sp => (
                        <option key={sp.id} value={sp.id} style={{ background: '#0f172a' }}>{sp.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>Term Descriptor</label>
                    <input
                      type="text"
                      placeholder="e.g. Peacock Blue"
                      value={newColorTerm.term}
                      onChange={e => setNewColorTerm({ ...newColorTerm, term: e.target.value })}
                      style={{ width: '100%', padding: '6px 8px', background: 'var(--input-bg)', border: '1px solid var(--input-border)', borderRadius: '6px', color: '#fff', fontSize: '12px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>Multiplier (×)</label>
                    <input
                      type="number"
                      step="0.05"
                      min="0.5"
                      max="5.0"
                      value={newColorTerm.multiplier}
                      onChange={e => setNewColorTerm({ ...newColorTerm, multiplier: Number(e.target.value) })}
                      style={{ width: '100%', padding: '6px 8px', background: 'var(--input-bg)', border: '1px solid var(--input-border)', borderRadius: '6px', color: '#fff', fontSize: '12px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>Prestige Premium</label>
                    <select
                      value={newColorTerm.premium ? 'yes' : 'no'}
                      onChange={e => setNewColorTerm({ ...newColorTerm, premium: e.target.value === 'yes' })}
                      style={{ width: '100%', padding: '6px 8px', background: 'var(--input-bg)', border: '1px solid var(--input-border)', borderRadius: '6px', color: '#fff', fontSize: '12px' }}
                    >
                      <option value="yes" style={{ background: '#0f172a' }}>Yes (Prestige Certified)</option>
                      <option value="no" style={{ background: '#0f172a' }}>No (Standard / Commercial)</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
                  <button onClick={handleAddColorTerm} style={{ padding: '6px 14px', background: 'var(--accent-cyan)', color: '#090d16', border: 'none', borderRadius: '6px', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}>
                    Save Term
                  </button>
                  <button onClick={() => setShowAddColorTerm(false)} style={{ padding: '6px 12px', background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--glass-border)', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}>
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {Object.entries((configData?.colorTerms || DEFAULT_CONFIG_DATA.colorTerms) as Record<string, any[]>).map(([speciesId, terms]) => {
              const sp = SPECIES_CATALOG[speciesId];
              const hasOvr = !!configData?.overrides?.colorTerms?.[speciesId];
              const displayTerms = hasOvr ? configData.overrides.colorTerms[speciesId] : terms;
              const edTerms = colorTermEdits[speciesId] || displayTerms;

              return (
                <div key={speciesId} style={{ marginBottom: '2rem', background: 'rgba(0,0,0,0.18)', border: '1px solid var(--glass-border)', padding: '16px', borderRadius: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div>
                      <h4 style={{ margin: 0, color: 'var(--accent-cyan)', fontSize: '14px', fontWeight: 700 }}>
                        {sp?.name || speciesId} Trade Color Terms
                      </h4>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        Species ID: <code>{speciesId}</code>
                      </div>
                    </div>
                    {hasOvr && (
                      <span style={{ fontSize: '10px', padding: '2px 8px', background: 'rgba(56,189,248,0.18)', color: '#38bdf8', borderRadius: '4px', fontWeight: 700 }}>
                        CUSTOMIZED
                      </span>
                    )}
                  </div>

                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                          <th style={{ padding: '8px', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>Color Descriptor</th>
                          <th style={{ padding: '8px', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>Multiplier (×)</th>
                          <th style={{ padding: '8px', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>Prestige Tier</th>
                          <th style={{ padding: '8px', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>Hue Range</th>
                          <th style={{ padding: '8px', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>Tone & Sat Ranges</th>
                        </tr>
                      </thead>
                      <tbody>
                        {edTerms.map((t: any, idx: number) => (
                          <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                            <td style={{ padding: '10px 8px', fontWeight: 600, color: 'var(--text-primary)' }}>
                              {t.term}
                            </td>
                            <td style={{ padding: '10px 8px' }}>
                              <input
                                type="number"
                                step="0.05"
                                min="0.1"
                                max="5.0"
                                value={t.multiplier}
                                onChange={e => {
                                  const nw = [...edTerms];
                                  nw[idx] = { ...nw[idx], multiplier: parseFloat(e.target.value) };
                                  setColorTermEdits(p => ({ ...p, [speciesId]: nw }));
                                }}
                                style={{ width: '80px', padding: '5px 8px', background: 'var(--input-bg)', border: '1px solid var(--input-border)', borderRadius: '6px', color: '#fff', fontFamily: 'monospace', fontSize: '13px', fontWeight: 700 }}
                              />
                            </td>
                            <td style={{ padding: '10px 8px' }}>
                              <span style={{ padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 700, background: t.premium ? 'rgba(245,158,11,0.18)' : 'rgba(255,255,255,0.05)', color: t.premium ? '#f59e0b' : 'var(--text-muted)' }}>
                                {t.premium ? 'Prestige Premium' : 'Commercial / Standard'}
                              </span>
                            </td>
                            <td style={{ padding: '10px 8px', fontFamily: 'monospace', fontSize: '12px', color: 'var(--text-secondary)' }}>
                              {t.hueMin}° – {t.hueMax}°
                            </td>
                            <td style={{ padding: '10px 8px', fontFamily: 'monospace', fontSize: '12px', color: 'var(--text-muted)' }}>
                              Tone: {t.toneMin}–{t.toneMax}% · Sat: {t.satMin}–{t.satMax}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {colorTermEdits[speciesId] && (
                    <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => saveColorTermArray(speciesId, edTerms)}
                        style={{ padding: '6px 14px', background: '#10b981', color: '#090d16', border: 'none', borderRadius: '6px', fontWeight: 700, fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
                      >
                        <Check size={12} /> Save Changes for {sp?.name || speciesId}
                      </button>
                      <button
                        onClick={() => {
                          const n = { ...colorTermEdits };
                          delete n[speciesId];
                          setColorTermEdits(n);
                        }}
                        style={{ padding: '6px 12px', background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--glass-border)', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </GlassCard>
        )}

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* TAB 6: SPECIES CATALOG META (FULL CRUD)                           */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {tab === 'species' && (
          <GlassCard>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.25rem' }}>
                  Species Gemological Catalog Meta
                </h3>
                <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: '13px' }}>
                  Configure species-level associations for GIA clarity type, origin category, and treatment rules.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setShowAddSpecies(!showAddSpecies)}
                  style={{ padding: '7px 14px', background: 'var(--accent-cyan)', color: '#090d16', border: 'none', borderRadius: '6px', fontWeight: 700, fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Plus size={14} /> Add Gem Species
                </button>
                <button
                  onClick={() => resetSection('species_all', 'Species Metadata')}
                  style={{ padding: '6px 12px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}
                >
                  Reset Metadata
                </button>
              </div>
            </div>

            {/* Add Species Form */}
            {showAddSpecies && (
              <div style={{ padding: '16px', background: 'rgba(56,189,248,0.06)', border: '1px solid rgba(56,189,248,0.3)', borderRadius: '10px', marginBottom: '1.5rem' }}>
                <h4 style={{ margin: '0 0 12px', color: 'var(--accent-cyan)', fontSize: '14px' }}>Add New Gem Species</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>Unique Species ID</label>
                    <input
                      type="text"
                      placeholder="e.g. grandidierite"
                      value={newSpecies.id}
                      onChange={e => setNewSpecies({ ...newSpecies, id: e.target.value })}
                      style={{ width: '100%', padding: '6px 8px', background: 'var(--input-bg)', border: '1px solid var(--input-border)', borderRadius: '6px', color: '#fff', fontSize: '12px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>Display Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Grandidierite"
                      value={newSpecies.name}
                      onChange={e => setNewSpecies({ ...newSpecies, name: e.target.value })}
                      style={{ width: '100%', padding: '6px 8px', background: 'var(--input-bg)', border: '1px solid var(--input-border)', borderRadius: '6px', color: '#fff', fontSize: '12px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>Mineral Family</label>
                    <input
                      type="text"
                      placeholder="e.g. Silicate"
                      value={newSpecies.family}
                      onChange={e => setNewSpecies({ ...newSpecies, family: e.target.value })}
                      style={{ width: '100%', padding: '6px 8px', background: 'var(--input-bg)', border: '1px solid var(--input-border)', borderRadius: '6px', color: '#fff', fontSize: '12px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>Base Price ($/ct)</label>
                    <input
                      type="number"
                      value={newSpecies.basePricePerCarat}
                      onChange={e => setNewSpecies({ ...newSpecies, basePricePerCarat: Number(e.target.value) })}
                      style={{ width: '100%', padding: '6px 8px', background: 'var(--input-bg)', border: '1px solid var(--input-border)', borderRadius: '6px', color: '#fff', fontSize: '12px' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>GIA Clarity Type</label>
                    <select
                      value={newSpecies.clarityType}
                      onChange={e => setNewSpecies({ ...newSpecies, clarityType: e.target.value as any })}
                      style={{ width: '100%', padding: '6px 8px', background: 'var(--input-bg)', border: '1px solid var(--input-border)', borderRadius: '6px', color: '#fff', fontSize: '12px' }}
                    >
                      <option value="I" style={{ background: '#0f172a' }}>Type I (Aquamarine, Tanzanite - Strict)</option>
                      <option value="II" style={{ background: '#0f172a' }}>Type II (Sapphire, Ruby, Spinel - Standard)</option>
                      <option value="III" style={{ background: '#0f172a' }}>Type III (Emerald - Tolerant)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>Origin Category</label>
                    <select
                      value={newSpecies.originCategory}
                      onChange={e => setNewSpecies({ ...newSpecies, originCategory: e.target.value })}
                      style={{ width: '100%', padding: '6px 8px', background: 'var(--input-bg)', border: '1px solid var(--input-border)', borderRadius: '6px', color: '#fff', fontSize: '12px' }}
                    >
                      {Object.keys(ORIGIN_TABLE).map(cat => (
                        <option key={cat} value={cat} style={{ background: '#0f172a' }}>{CATEGORY_NAMES[cat] || cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>Treatment Category</label>
                    <select
                      value={newSpecies.treatmentCategory}
                      onChange={e => setNewSpecies({ ...newSpecies, treatmentCategory: e.target.value })}
                      style={{ width: '100%', padding: '6px 8px', background: 'var(--input-bg)', border: '1px solid var(--input-border)', borderRadius: '6px', color: '#fff', fontSize: '12px' }}
                    >
                      {Object.keys(TREATMENT_TABLE).map(cat => (
                        <option key={cat} value={cat} style={{ background: '#0f172a' }}>{CATEGORY_NAMES[cat] || cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
                  <button onClick={handleAddSpecies} style={{ padding: '6px 14px', background: 'var(--accent-cyan)', color: '#090d16', border: 'none', borderRadius: '6px', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}>
                    Save Species
                  </button>
                  <button onClick={() => setShowAddSpecies(false)} style={{ padding: '6px 12px', background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--glass-border)', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}>
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Search filter for species meta */}
            <div style={{ position: 'relative', marginBottom: '1rem', maxWidth: '350px' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search species metadata..."
                value={speciesSearch}
                onChange={e => setSpeciesSearch(e.target.value)}
                style={{ width: '100%', padding: '8px 10px 8px 32px', background: 'var(--input-bg)', border: '1px solid var(--input-border)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '13px' }}
              />
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                    <th style={{ padding: '10px 8px', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>Species Name</th>
                    <th style={{ padding: '10px 8px', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>GIA Clarity Type</th>
                    <th style={{ padding: '10px 8px', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>Origin Category</th>
                    <th style={{ padding: '10px 8px', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>Treatment Category</th>
                    <th style={{ padding: '10px 8px', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSpeciesList.map(([key, entry]: [string, any]) => {
                    const ed = speciesEdits[key] || {};
                    const hasOvr = !!configData?.overrides?.species?.[key];

                    return (
                      <tr key={key} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <td style={{ padding: '10px 8px' }}>
                          <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{entry.name}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{entry.family} · <code>{key}</code></div>
                        </td>

                        <td style={{ padding: '10px 8px' }}>
                          <select
                            value={ed.clarityType ?? entry.clarityType}
                            onChange={e => setSpeciesEdits(p => ({ ...p, [key]: { ...p[key], clarityType: e.target.value } }))}
                            style={{ padding: '5px 8px', background: 'var(--input-bg)', border: '1px solid var(--input-border)', borderRadius: '6px', color: '#fff', fontSize: '12px' }}
                          >
                            <option value="I" style={{ background: '#0f172a' }}>Type I (Aquamarine, Tanzanite)</option>
                            <option value="II" style={{ background: '#0f172a' }}>Type II (Sapphire, Ruby, Spinel)</option>
                            <option value="III" style={{ background: '#0f172a' }}>Type III (Emerald)</option>
                          </select>
                        </td>

                        <td style={{ padding: '10px 8px' }}>
                          <select
                            value={ed.originCategory ?? entry.originCategory}
                            onChange={e => setSpeciesEdits(p => ({ ...p, [key]: { ...p[key], originCategory: e.target.value } }))}
                            style={{ padding: '5px 8px', background: 'var(--input-bg)', border: '1px solid var(--input-border)', borderRadius: '6px', color: 'var(--accent-cyan)', fontSize: '12px' }}
                          >
                            {Object.keys(ORIGIN_TABLE).map(cat => (
                              <option key={cat} value={cat} style={{ background: '#0f172a', color: '#fff' }}>{CATEGORY_NAMES[cat] || cat}</option>
                            ))}
                          </select>
                        </td>

                        <td style={{ padding: '10px 8px' }}>
                          <select
                            value={ed.treatmentCategory ?? entry.treatmentCategory}
                            onChange={e => setSpeciesEdits(p => ({ ...p, [key]: { ...p[key], treatmentCategory: e.target.value } }))}
                            style={{ padding: '5px 8px', background: 'var(--input-bg)', border: '1px solid var(--input-border)', borderRadius: '6px', color: '#f59e0b', fontSize: '12px' }}
                          >
                            {Object.keys(TREATMENT_TABLE).map(cat => (
                              <option key={cat} value={cat} style={{ background: '#0f172a', color: '#fff' }}>{CATEGORY_NAMES[cat] || cat}</option>
                            ))}
                          </select>
                        </td>

                        <td style={{ padding: '10px 8px' }}>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            {speciesEdits[key] && (
                              <button
                                onClick={() => saveSpeciesMeta(key)}
                                style={{ padding: '5px 10px', background: '#10b981', color: '#090d16', border: 'none', borderRadius: '6px', fontWeight: 700, fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                              >
                                <Check size={12} /> Apply
                              </button>
                            )}
                            {hasOvr && (
                              <button
                                onClick={() => resetSpeciesMeta(key)}
                                style={{ padding: '5px 8px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '6px', fontSize: '11px', cursor: 'pointer' }}
                                title="Reset metadata to default"
                              >
                                <RefreshCw size={11} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </GlassCard>
        )}

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* TAB 7: GLOBAL SYSTEM SETTINGS                                     */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {tab === 'system' && (
          <GlassCard>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.25rem' }}>
                  Global Appraisal System Settings
                </h3>
                <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: '13px' }}>
                  Controls global financial parameters, retail replacement markup, and laboratory certification confidence spreads.
                </p>
              </div>
              <button
                onClick={() => resetSection('systemSettings', 'System Settings')}
                style={{ padding: '6px 12px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}
              >
                Reset Settings
              </button>
            </div>

            {/* Retail Margin */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid var(--glass-border)' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Default Retail Replacement Gross Margin (%)
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Standard markup applied over wholesale market midpoint to compute Insurance Retail Replacement Value.
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="number"
                  min="0"
                  max="300"
                  value={systemEdits.defaultRetailMargin ?? 50}
                  onChange={e => setSystemEdits({ ...systemEdits, defaultRetailMargin: Number(e.target.value) })}
                  style={{ width: '90px', padding: '6px 8px', background: 'var(--input-bg)', border: '1px solid var(--input-border)', borderRadius: '6px', color: '#fff', fontFamily: 'monospace', fontSize: '14px', fontWeight: 700 }}
                />
                <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>%</span>
              </div>
            </div>

            {/* Certification Liquidity Multipliers */}
            <div style={{ marginTop: '24px' }}>
              <h4 style={{ margin: '0 0 12px', color: 'var(--accent-cyan)', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
                Laboratory Verification Multipliers (× Applied to Wholesale)
              </h4>
              {[
                ['major', 'Tier 1 Global Lab (GIA / SSEF / Gübelin / AGL)', 1.10],
                ['domestic', 'Domestic Accredited Laboratory Report', 1.00],
                ['none', 'No Formal Laboratory Certificate', 0.88]
              ].map(([cert, label, def]) => (
                <div key={cert as string} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{label as string}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Baseline default: ×{(def as number).toFixed(2)}</div>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    min="0.5"
                    max="2.0"
                    value={systemEdits.certMultiplier?.[cert as string] ?? def}
                    onChange={e =>
                      setSystemEdits({
                        ...systemEdits,
                        certMultiplier: { ...(systemEdits.certMultiplier || {}), [cert as string]: parseFloat(e.target.value) }
                      })
                    }
                    style={{ width: '90px', padding: '6px 8px', background: 'var(--input-bg)', border: '1px solid var(--input-border)', borderRadius: '6px', color: '#fff', fontFamily: 'monospace', fontSize: '13px', fontWeight: 700 }}
                  />
                </div>
              ))}
            </div>

            {/* Certification Spread */}
            <div style={{ marginTop: '24px' }}>
              <h4 style={{ margin: '0 0 12px', color: 'var(--accent-cyan)', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
                Valuation Confidence Spread (± Range on Midpoint)
              </h4>
              {[
                ['major', 'Tier 1 Global Lab Spread', 0.12],
                ['domestic', 'Domestic Lab Spread', 0.20],
                ['none', 'No Report Spread', 0.30]
              ].map(([cert, label, def]) => (
                <div key={cert as string} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{label as string}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      Calculated range: ±{Math.round(((systemEdits.certSpread?.[cert as string] ?? def) as number) * 100)}%
                    </div>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    min="0.05"
                    max="0.5"
                    value={systemEdits.certSpread?.[cert as string] ?? def}
                    onChange={e =>
                      setSystemEdits({
                        ...systemEdits,
                        certSpread: { ...(systemEdits.certSpread || {}), [cert as string]: parseFloat(e.target.value) }
                      })
                    }
                    style={{ width: '90px', padding: '6px 8px', background: 'var(--input-bg)', border: '1px solid var(--input-border)', borderRadius: '6px', color: '#fff', fontFamily: 'monospace', fontSize: '13px', fontWeight: 700 }}
                  />
                </div>
              ))}
            </div>

            <div style={{ marginTop: '24px' }}>
              <button
                onClick={saveSystem}
                style={{ padding: '10px 24px', background: 'var(--accent-cyan)', color: '#090d16', border: 'none', borderRadius: '8px', fontWeight: 800, fontSize: '13.5px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Check size={14} /> Save Global System Settings
              </button>
            </div>
          </GlassCard>
        )}
      </>

      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};
