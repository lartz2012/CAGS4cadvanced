import React, { useState, useEffect, useMemo } from 'react';
import { SPECIES_CATALOG, GEM_PRESETS } from './engine/speciesCatalog';
import {
  GemInputParams,
  ValuationResult,
  calculateGemValuation,
  ORIGIN_TABLE,
  TREATMENT_TABLE,
  TRADE_COLOR_TERMS
} from './engine/pricingModel';
import { MarketDataService, MarketDailyData } from './services/marketDataService';
import { GlassCard } from './components/GlassCard';
import { ColorPicker } from './components/ColorPicker';
import { PdfExportButton } from './components/PdfExportButton';
import { MarketComparables } from './components/MarketComparables';
import { Sun, Moon } from 'lucide-react';

const DEFAULT_CONFIG = {
  species: SPECIES_CATALOG,
  origins: ORIGIN_TABLE,
  treatments: TREATMENT_TABLE,
  colorTerms: TRADE_COLOR_TERMS,
  systemSettings: {
    defaultRetailMargin: 50,
    certSpread: { major: 0.12, domestic: 0.20, none: 0.30 },
    certMultiplier: { major: 1.10, domestic: 1.00, none: 0.88 }
  }
};

const CURRENCIES: Record<string, { symbol: string; rate: number }> = {
  USD: { symbol: '$', rate: 1.0 },
  EUR: { symbol: '€', rate: 0.92 },
  GBP: { symbol: '£', rate: 0.79 },
  AUD: { symbol: 'A$', rate: 1.52 },
  CAD: { symbol: 'C$', rate: 1.36 },
  LKR: { symbol: 'Rs', rate: 305.0 },
  INR: { symbol: '₹', rate: 83.5 },
  JPY: { symbol: '¥', rate: 154.0 }
};

export const App: React.FC = () => {
  // Theme state: dark / light mode
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Gemological state
  const [speciesId, setSpeciesId] = useState<string>('blue_sapphire');
  const [carat, setCarat] = useState<number>(3.5);
  const [dimensions, setDimensions] = useState<{ length: number; width: number; height: number }>({
    length: 9.8,
    width: 7.6,
    height: 5.2
  });
  const [color, setColor] = useState({ hue: 215, tone: 70, saturation: 80 });
  const [clarityGrade, setClarityGrade] = useState<'FI' | 'LI' | 'MI' | 'HI' | 'EI'>('LI');
  const [eyeClean, setEyeClean] = useState<boolean>(true);
  const [transparency, setTransparency] = useState<number>(0.95);
  const [colorZoning, setColorZoning] = useState<'minimal' | 'noticeable' | 'strong'>('minimal');
  const [brilliance, setBrilliance] = useState<number>(85);
  const [windowing, setWindowing] = useState<number>(5);
  const [extinction, setExtinction] = useState<number>(10);
  const [symmetry, setSymmetry] = useState<'excellent' | 'very_good' | 'good' | 'fair'>('very_good');
  const [polish, setPolish] = useState<'excellent' | 'very_good' | 'good' | 'fair'>('excellent');
  const [origin, setOrigin] = useState<string>('srilanka');
  const [treatment, setTreatment] = useState<string>('heated_standard');
  const [certification, setCertification] = useState<'major' | 'domestic' | 'none'>('major');

  // Commercial & Market State
  const [currency, setCurrency] = useState<string>('USD');
  const [viewMode, setViewMode] = useState<'wholesale' | 'retail'>('wholesale');
  const [retailMargin, setRetailMargin] = useState<number>(50);
  const [marketData, setMarketData] = useState<MarketDailyData | null>(null);

  // Config State (Initializes immediately with DEFAULT_CONFIG so UI never freezes)
  const [appConfig, setAppConfig] = useState<any>(DEFAULT_CONFIG);
  const [configLoading, setConfigLoading] = useState(false);

  useEffect(() => {
    fetch('/api/config')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (data && data.species) {
          setAppConfig(data);
          if (data.systemSettings?.defaultRetailMargin) {
            setRetailMargin(data.systemSettings.defaultRetailMargin);
          }
        }
      })
      .catch(err => {
        console.warn('Backend config fetch failed, using built-in catalog:', err);
      });
  }, []);

  useEffect(() => {
    MarketDataService.getInstance()
      .getMarketData()
      .then(data => setMarketData(data))
      .catch(err => console.error('Market data load error:', err));
  }, []);

  const currentSpecies = appConfig?.species?.[speciesId] || (appConfig?.species ? Object.values(appConfig.species)[0] : null);

  // Sync origin/treatment when species changes
  useEffect(() => {
    if (!appConfig || !currentSpecies) return;

    const originCategory = appConfig.origins?.[currentSpecies.originCategory] || appConfig.origins?.generic || {};
    const defaultOrigin = Object.keys(originCategory)[0] || 'unknown';
    setOrigin(defaultOrigin);

    const treatCategory = appConfig.treatments?.[currentSpecies.treatmentCategory] || appConfig.treatments?.generic || {};
    const defaultTreat = Object.keys(treatCategory)[0] || 'natural';
    setTreatment(defaultTreat);

    setColor({
      hue: currentSpecies.defaultColor?.hue ?? 215,
      tone: currentSpecies.defaultColor?.tone ?? 70,
      saturation: currentSpecies.defaultColor?.sat ?? 80
    });
  }, [speciesId, appConfig, currentSpecies]);

  // Preset Handlers (Calibrated to Real Market Benchmarks)
  const handleLoadPreset = (presetId: string) => {
    setSpeciesId(presetId);
    if (presetId === 'blue_sapphire') {
      setCarat(3.5);
      setOrigin('srilanka');
      setTreatment('heated_standard');
      setClarityGrade('LI');
      setEyeClean(true);
      setBrilliance(85);
      setWindowing(5);
      setExtinction(10);
    } else if (presetId === 'emerald') {
      setCarat(3.0);
      setOrigin('colombia');
      setTreatment('minor_oil');
      setClarityGrade('MI');
      setEyeClean(true);
      setBrilliance(75);
      setWindowing(10);
      setExtinction(15);
    } else if (presetId === 'paraiba') {
      setCarat(2.5);
      setOrigin('mozambique');
      setTreatment('heated');
      setClarityGrade('LI');
      setEyeClean(true);
      setBrilliance(90);
      setWindowing(5);
      setExtinction(8);
    } else if (presetId === 'spinel_pink') {
      setCarat(3.0);
      setOrigin('burma_mogok');
      setTreatment('natural');
      setClarityGrade('LI');
      setEyeClean(true);
      setBrilliance(88);
      setWindowing(5);
      setExtinction(8);
    } else if (presetId === 'ruby') {
      setCarat(2.2);
      setOrigin('mozambique');
      setTreatment('heated_standard');
      setClarityGrade('LI');
      setEyeClean(true);
      setBrilliance(82);
      setWindowing(8);
      setExtinction(12);
    } else if (presetId === 'alexandrite') {
      setCarat(1.5);
      setOrigin('brazil');
      setTreatment('natural');
      setClarityGrade('LI');
      setEyeClean(true);
      setBrilliance(80);
      setWindowing(8);
      setExtinction(12);
    } else if (presetId === 'tsavorite') {
      setCarat(2.5);
      setOrigin('srilanka');
      setTreatment('natural');
      setClarityGrade('LI');
      setEyeClean(true);
      setBrilliance(85);
      setWindowing(5);
      setExtinction(10);
    } else if (presetId === 'tanzanite') {
      setCarat(4.0);
      setOrigin('srilanka');
      setTreatment('routine_heated');
      setClarityGrade('FI');
      setEyeClean(true);
      setBrilliance(85);
      setWindowing(5);
      setExtinction(10);
    }
  };

  // Run Valuation Engine (Server-Side Sync)
  const [valuation, setValuation] = useState<ValuationResult | null>(null);

  const valuationParams: GemInputParams = useMemo(() => ({
    speciesId,
    carat,
    dimensions,
    hue: color.hue,
    tone: color.tone,
    saturation: color.saturation,
    clarityGrade,
    eyeClean,
    transparency,
    colorZoning,
    brilliance,
    windowing,
    extinction,
    symmetry,
    polish,
    treatment,
    origin,
    certification,
    retailMarginPercent: retailMargin
  }), [
    speciesId, carat, dimensions, color, clarityGrade, eyeClean, transparency,
    colorZoning, brilliance, windowing, extinction, symmetry, polish, treatment,
    origin, certification, marketData, retailMargin
  ]);

  useEffect(() => {
    // 1. Immediate local calculation (0ms response, 100% offline & load resilience)
    try {
      const immediateResult = calculateGemValuation(valuationParams, {}, appConfig?.overrides || {});
      setValuation(immediateResult);
    } catch (e) {
      console.warn('Local calculation note:', e);
    }

    // 2. Server-Side sync with Firestore base prices
    const handler = setTimeout(async () => {
      try {
        const response = await fetch('/api/valuation/calculate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(valuationParams)
        });
        if (response.ok) {
          const data = await response.json();
          if (data && data.wholesaleTotalMidpoint) {
            setValuation(data);
          }
        }
      } catch (err) {
        // Gracefully retains local calculation
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(handler);
  }, [valuationParams, appConfig]);

  const currentRate = (marketData as any)?.fxRates?.[currency] || CURRENCIES[currency]?.rate || 1.0;
  const formatMoney = (usdAmount: number) => {
    const converted = Math.round(usdAmount * currentRate);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0
    }).format(converted);
  };

  if (configLoading || !appConfig || !currentSpecies) {
    return (
      <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', color: 'var(--text-main)' }}>
        <h2>Loading GemMetrics Engine...</h2>
      </div>
    );
  }

  const availableOrigins = appConfig.origins?.[currentSpecies.originCategory] || appConfig.origins?.generic || {};
  const availableTreatments = appConfig.treatments?.[currentSpecies.treatmentCategory] || appConfig.treatments?.generic || {};

  return (
    <>
      {/* 1. Apple Fluid Silk Wallpaper */}
      <div className="apple-wallpaper">
        <div className="wallpaper-wave wave-1" />
        <div className="wallpaper-wave wave-2" />
        <div className="wallpaper-wave wave-3" />
      </div>
      <div className="grain-overlay" />

      <div className="app-container">
        {/* Navigation Header (Architectural 12px squircle, NO PILL) */}
        <header className="nav-header liquid-card">
          <div className="brand-wrap">
            <div className="gem-mark" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinejoin="round" strokeLinecap="round">
                <path d="M6 3h12l4 6-10 12L2 9z" />
                <path d="M2 9h20" />
                <path d="M6 3l3 6 3-6 3-6 3-6" />
                <path d="M9 9l3 12 3-12" />
              </svg>
            </div>
            <div className="brand-text-block">
              <span className="brand-name">GemMetrics</span>
              <span className="brand-sub">GIA 4C Institutional Engine</span>
            </div>
          </div>

          <div className="header-meta">
            {/* Theme Toggle: Dark / Light Mode */}
            <button
              onClick={toggleTheme}
              className="theme-toggle-btn"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              aria-label="Toggle color theme"
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {/* Currency Selector */}
            <select
              className="currency-select"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              aria-label="Currency"
            >
              {Object.keys(CURRENCIES).map((c) => (
                <option key={c} value={c}>{c} ({CURRENCIES[c].symbol})</option>
              ))}
            </select>

            {/* Institutional Metadata Tag */}
            <div className="institutional-tag">
              FEED // GEMGUIDE B2B · {new Date().toISOString().slice(0, 10)}
            </div>
          </div>
        </header>

        {/* Specimen Catalog Rail (Architectural, NO PILL BADGES) */}
        <div className="catalog-bar">
          <div className="catalog-bar-kicker">CATALOG SPECIMENS</div>
          {GEM_PRESETS.map((p, index) => (
            <button
              key={p.id}
              onClick={() => handleLoadPreset(p.id)}
              className={`catalog-tab ${speciesId === p.id ? 'active' : ''}`}
            >
              <span className="catalog-tab-num">0{index + 1}</span>
              <span>{p.label}</span>
            </button>
          ))}
        </div>

        {/* Main 2-Column Calculator Grid */}
        <div className="calc-grid">
          {/* Left Column: Technical Inputs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Section 01: Identification */}
            <GlassCard>
              <div className="editorial-section-header">
                <span className="editorial-title">01 — Identification & Dimensions</span>
                <span className="editorial-subtag">{currentSpecies.family.toUpperCase()}</span>
              </div>

              <div className="field-row">
                <div className="field-label-wrap">
                  <span className="field-main-label">Gem Species & Variety</span>
                  <span className="field-sub-label">Mineral group & physical habit</span>
                </div>
                <select
                  className="glass-select"
                  value={speciesId}
                  onChange={(e) => setSpeciesId(e.target.value)}
                  style={{ minWidth: '220px' }}
                >
                  {Object.values(appConfig.species).map((s: any) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.family})
                    </option>
                  ))}
                </select>
              </div>

              <div className="field-row">
                <div className="field-label-wrap">
                  <span className="field-main-label">Carat Weight</span>
                  <span className="field-sub-label">Exact mass in metric carats</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="number"
                    step="0.01"
                    min="0.05"
                    max="100"
                    className="glass-input"
                    value={carat}
                    onChange={(e) => setCarat(parseFloat(e.target.value) || 0.1)}
                    style={{ width: '90px', textAlign: 'right', fontWeight: 600 }}
                  />
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>ct</span>
                </div>
              </div>

              <div className="field-row">
                <div className="field-label-wrap">
                  <span className="field-main-label">Dimensions (L × W × H)</span>
                  <span className="field-sub-label">Millimeter measurements</span>
                </div>
                <div style={{ display: 'flex', gap: '8px', width: '220px' }}>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="L"
                    className="glass-input"
                    value={dimensions.length}
                    onChange={(e) => setDimensions({ ...dimensions, length: parseFloat(e.target.value) || 0 })}
                    style={{ flex: 1, textAlign: 'center', minWidth: '0' }}
                  />
                  <input
                    type="number"
                    step="0.1"
                    placeholder="W"
                    className="glass-input"
                    value={dimensions.width}
                    onChange={(e) => setDimensions({ ...dimensions, width: parseFloat(e.target.value) || 0 })}
                    style={{ flex: 1, textAlign: 'center', minWidth: '0' }}
                  />
                  <input
                    type="number"
                    step="0.1"
                    placeholder="H"
                    className="glass-input"
                    value={dimensions.height}
                    onChange={(e) => setDimensions({ ...dimensions, height: parseFloat(e.target.value) || 0 })}
                    style={{ flex: 1, textAlign: 'center', minWidth: '0' }}
                  />
                </div>
              </div>
            </GlassCard>

            {/* Section 02: Color Science */}
            <GlassCard>
              <div className="editorial-section-header">
                <span className="editorial-title">02 — GIA 3D Color Evaluation</span>
                <span className="editorial-subtag">HUE / TONE / SAT</span>
              </div>
              <ColorPicker
                hue={color.hue}
                tone={color.tone}
                saturation={color.saturation}
                onColorChange={setColor}
              />
            </GlassCard>

            {/* Section 03: Clarity & Cut Optics */}
            <GlassCard>
              <div className="editorial-section-header">
                <span className="editorial-title">03 — Optical Physics & Clarity</span>
                <span className="editorial-subtag">GIA TYPE {currentSpecies.clarityType}</span>
              </div>

              <div className="field-row">
                <div className="field-label-wrap">
                  <span className="field-main-label">Clarity Grade</span>
                  <span className="field-sub-label">GIA colored stone grading scale</span>
                </div>
                <select
                  className="glass-select"
                  value={clarityGrade}
                  onChange={(e) => setClarityGrade(e.target.value as any)}
                >
                  <option value="FI">Flawless / Eye-Clean (FI)</option>
                  <option value="LI">Lightly Included (LI)</option>
                  <option value="MI">Moderately Included (MI)</option>
                  <option value="HI">Highly Included (HI)</option>
                  <option value="EI">Excessively Included (EI)</option>
                </select>
              </div>

              <div className="field-row">
                <div className="field-label-wrap">
                  <span className="field-main-label">Eye-Clean Standard</span>
                  <span className="field-sub-label">Face-up inspection without magnification</span>
                </div>
                <div className="seg-control">
                  <button
                    type="button"
                    onClick={() => setEyeClean(true)}
                    className={`seg-btn ${eyeClean ? 'active' : ''}`}
                  >
                    Eye-Clean
                  </button>
                  <button
                    type="button"
                    onClick={() => setEyeClean(false)}
                    className={`seg-btn ${!eyeClean ? 'active' : ''}`}
                  >
                    Eye-Visible
                  </button>
                </div>
              </div>

              <div className="slider-container" style={{ margin: '12px 0 6px' }}>
                <div className="slider-header">
                  <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Brilliance & Light Return</span>
                  <span className="slider-val">{brilliance}%</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="100"
                  value={brilliance}
                  onChange={(e) => setBrilliance(Number(e.target.value))}
                />
              </div>

              <div className="slider-container" style={{ margin: '8px 0 6px' }}>
                <div className="slider-header">
                  <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Pavilion Windowing Leakage</span>
                  <span className="slider-val" style={{ color: windowing > 15 ? 'var(--accent-negative)' : 'var(--accent-cyan)' }}>
                    {windowing}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="60"
                  value={windowing}
                  onChange={(e) => setWindowing(Number(e.target.value))}
                />
              </div>

              <div className="slider-container" style={{ margin: '8px 0 6px' }}>
                <div className="slider-header">
                  <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Extinction Black Zones</span>
                  <span className="slider-val" style={{ color: extinction > 25 ? 'var(--accent-negative)' : 'var(--accent-cyan)' }}>
                    {extinction}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="60"
                  value={extinction}
                  onChange={(e) => setExtinction(Number(e.target.value))}
                />
              </div>
            </GlassCard>

            {/* Section 04: Provenance & Treatment */}
            <GlassCard>
              <div className="editorial-section-header">
                <span className="editorial-title">04 — Provenance & Enhancement</span>
                <span className="editorial-subtag">LAB VERIFIED</span>
              </div>

              <div className="field-row">
                <div className="field-label-wrap">
                  <span className="field-main-label">Geographic Provenance</span>
                  <span className="field-sub-label">Historical origin factor</span>
                </div>
                <select
                  className="glass-select"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                >
                  {Object.entries(availableOrigins).map(([key, item]) => (
                    <option key={key} value={key}>
                      {item.label} (×{item.factor})
                    </option>
                  ))}
                </select>
              </div>

              <div className="field-row">
                <div className="field-label-wrap">
                  <span className="field-main-label">Treatment Status</span>
                  <span className="field-sub-label">Thermal / clarity enhancement</span>
                </div>
                <select
                  className="glass-select"
                  value={treatment}
                  onChange={(e) => setTreatment(e.target.value)}
                >
                  {Object.entries(availableTreatments).map(([key, item]) => (
                    <option key={key} value={key}>
                      {item.label} (×{item.factor})
                    </option>
                  ))}
                </select>
              </div>

              <div className="field-row">
                <div className="field-label-wrap">
                  <span className="field-main-label">Laboratory Document</span>
                  <span className="field-sub-label">Accreditation benchmark</span>
                </div>
                <select
                  className="glass-select"
                  value={certification}
                  onChange={(e) => setCertification(e.target.value as any)}
                >
                  <option value="major">Tier 1 International Lab (GIA/SSEF/Gübelin) [×1.10]</option>
                  <option value="domestic">Domestic Accredited Lab [×1.00]</option>
                  <option value="none">No Formal Laboratory Report [×0.88]</option>
                </select>
              </div>
            </GlassCard>

            {/* Section 05: Referring Market Comparables & Scraped Sources */}
            <GlassCard>
              {valuation && (
                <MarketComparables
                  speciesId={speciesId}
                  targetCarat={carat}
                  scrapedListings={marketData?.scrapedListings || []}
                  currency={currency}
                  currencyRate={currentRate}
                  currentValuationPerCarat={viewMode === 'wholesale' ? valuation.wholesaleMidpointPerCarat : valuation.retailMidpointPerCarat}
                />
              )}
            </GlassCard>

          </div>

          {/* Right Column: Sticky Editorial Valuation Panel */}
          <div className="sticky-panel">
            <GlassCard elevated>
              
              {/* Specimen Appraisal Grading Block (Architectural, NO PILL BADGE) */}
              <div className="specimen-grade-block">
                <span className="grade-kicker">CLASSIFICATION · GEMGUIDE MATRIX</span>
                <span className="grade-value">
                  {valuation ? valuation.qualityTier.toUpperCase() : '---'}
                  <span style={{ fontSize: '13px', fontWeight: 400, opacity: 0.75, marginLeft: '8px' }}>
                    ({valuation ? valuation.compositeQualityScore : 0}/100)
                  </span>
                </span>
                {valuation?.tradeColorTerm && (
                  <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(34,211,238,0.1)', border: '1px solid rgba(34,211,238,0.2)', padding: '6px 12px', borderRadius: '8px', width: 'fit-content' }}>
                    <span style={{ fontSize: '13px', color: 'var(--accent-cyan)', fontWeight: 600, letterSpacing: '0.04em' }}>{valuation.tradeColorTerm.toUpperCase()}</span>
                    {valuation.colorTermMultiplier !== 1 && (
                      <span style={{ fontSize: '12px', color: '#50fa7b', fontWeight: 700 }}>
                        (×{valuation.colorTermMultiplier.toFixed(2)})
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="val-context-heading">
                {viewMode === 'wholesale' ? 'Indicative Wholesale B2B Valuation' : 'Retail Replacement Value'}
              </div>

              {/* Price Hero */}
              <div className="val-price-hero">
                {valuation ? (viewMode === 'wholesale'
                  ? `${formatMoney(valuation.wholesaleTotalLow)} – ${formatMoney(valuation.wholesaleTotalHigh)}`
                  : `${formatMoney(valuation.retailTotalLow)} – ${formatMoney(valuation.retailTotalHigh)}`
                ) : '---'}
              </div>

              <div className="val-price-sub">
                {valuation ? (viewMode === 'wholesale'
                  ? `${formatMoney(valuation.wholesaleLowPerCarat)} – ${formatMoney(valuation.wholesaleHighPerCarat)} /ct · ${valuation.carat.toFixed(2)} ct`
                  : `${formatMoney(valuation.retailMidpointPerCarat)} /ct · ${valuation.carat.toFixed(2)} ct`
                ) : '---'}
              </div>

              <div className="val-midpoint-card">
                <span>STATISTICAL MIDPOINT</span>
                <span style={{ fontWeight: 600 }}>
                  {valuation ? formatMoney(viewMode === 'wholesale' ? valuation.wholesaleMidpointPerCarat : valuation.retailMidpointPerCarat) : '---'}/ct ·{' '}
                  {valuation ? formatMoney(viewMode === 'wholesale' ? valuation.wholesaleTotalMidpoint : valuation.retailTotalMidpoint) : '---'} total
                </span>
              </div>

              {/* View Mode Bar (Architectural, NO PILL) */}
              <div className="view-mode-bar">
                <button
                  type="button"
                  onClick={() => setViewMode('wholesale')}
                  className={`view-mode-btn ${viewMode === 'wholesale' ? 'active' : ''}`}
                >
                  Wholesale Trade (B2B)
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('retail')}
                  className={`view-mode-btn ${viewMode === 'retail' ? 'active' : ''}`}
                >
                  Retail Appraisal (+{retailMargin}%)
                </button>
              </div>

              {viewMode === 'retail' && (
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    <span>Retail Gross Margin</span>
                    <span style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>+{retailMargin}%</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="120"
                    value={retailMargin}
                    onChange={(e) => setRetailMargin(Number(e.target.value))}
                  />
                </div>
              )}

              {/* Certificate Download Action */}
              {valuation && (
                <PdfExportButton
                  valuation={valuation}
                  params={valuationParams}
                  currency={currency}
                  currencyRate={currentRate}
                  scrapedListings={marketData?.scrapedListings || []}
                  originLabel={availableOrigins[origin]?.label || origin}
                  treatmentLabel={availableTreatments[treatment]?.label || treatment}
                />
              )}

              {/* GemGuide Matrix & 4C Audit */}
              <div className="audit-table-wrap">
                <div className="audit-table-title">
                  GemGuide Matrix & 4C Audit
                </div>
                <table className="audit-table">
                  <tbody>
                    {valuation?.breakdown.map((item, idx) => (
                      <tr key={idx}>
                        <td style={{ color: 'var(--text-secondary)' }}>{item.name}</td>
                        <td className={`audit-factor ${item.impactType}`}>
                          {item.name.startsWith('GemGuide Grid')
                            ? formatMoney(item.factor) + '/ct'
                            : item.name.includes('Score')
                            ? `${item.factor} pts`
                            : `×${item.factor.toFixed(2)}`
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Institutional Sourcing Attribution */}
              <div className="sourcing-note">
                BENCHMARK: {marketData?.provider || 'GemGuide Trade Registry'}. Calibrated against verified cleared wholesale transactions.
              </div>

            </GlassCard>
          </div>
        </div>
      </div>
    </>
  );
};
