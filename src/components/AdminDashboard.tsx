import React, { useState, useEffect, useCallback } from 'react';
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
  ArrowLeft
} from 'lucide-react';

const API = ''; // Uses current host/domain (relative paths for local + Vercel)

const S = {
  page: { padding: '2rem 1.5rem', minHeight: '100vh', maxWidth: '1120px', margin: '0 auto', position: 'relative', zIndex: 1 } as React.CSSProperties,
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border, rgba(255,255,255,0.1))', paddingBottom: '1.2rem', flexWrap: 'wrap', gap: '14px' } as React.CSSProperties,
  title: { display: 'flex', alignItems: 'center', gap: '10px', margin: 0, fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary, #fff)', letterSpacing: '-0.02em' } as React.CSSProperties,
  tabs: { display: 'flex', gap: '6px', marginBottom: '1.5rem', flexWrap: 'wrap' } as React.CSSProperties,
  tab: (active: boolean) => ({ padding: '8px 16px', background: active ? 'rgba(34,211,238,0.15)' : 'var(--glass-surface, rgba(255,255,255,0.04))', border: active ? '1px solid rgba(34,211,238,0.4)' : '1px solid var(--glass-border, rgba(255,255,255,0.1))', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 600, color: active ? 'var(--accent-cyan, #22d3ee)' : 'var(--text-muted, rgba(255,255,255,0.5))', transition: 'all 0.15s', display: 'flex', alignItems: 'center', gap: '6px' } as React.CSSProperties),
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' } as React.CSSProperties,
  th: { padding: '0.7rem 0.5rem', color: 'var(--text-muted, rgba(255,255,255,0.4))', fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase' as const, borderBottom: '1px solid var(--glass-border, rgba(255,255,255,0.08))' } as React.CSSProperties,
  td: { padding: '0.85rem 0.5rem', borderBottom: '1px solid var(--glass-border, rgba(255,255,255,0.04))', color: 'var(--text-primary, #fff)', fontSize: '0.88rem' } as React.CSSProperties,
  fc: (f: number) => ({ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.95rem', color: f > 1.0 ? '#10b981' : f < 0.9 ? '#ef4444' : 'var(--text-primary, #fff)' } as React.CSSProperties),
  badge: (o: boolean) => ({ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', padding: '3px 7px', borderRadius: '4px', background: o ? 'rgba(245,158,11,0.15)' : 'rgba(16,185,129,0.12)', color: o ? '#f59e0b' : '#10b981' } as React.CSSProperties),
  ab: { padding: '5px 10px', background: 'var(--glass-surface, rgba(255,255,255,0.06))', border: '1px solid var(--glass-border, rgba(255,255,255,0.15))', borderRadius: '6px', cursor: 'pointer', color: 'var(--text-primary, #fff)', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px' } as React.CSSProperties,
  inp: { background: 'var(--input-bg, rgba(15,23,42,0.65))', border: '1px solid var(--input-border, rgba(255,255,255,0.14))', borderRadius: '6px', padding: '5px 8px', color: 'var(--text-primary, #fff)', fontFamily: 'monospace', fontSize: '0.88rem' } as React.CSSProperties,
  settingRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.9rem 0', borderBottom: '1px solid var(--glass-border, rgba(255,255,255,0.05))' } as React.CSSProperties,
  label: { fontSize: '0.88rem', color: 'var(--text-primary, #fff)', fontWeight: 500 } as React.CSSProperties,
  sub: { fontSize: '0.72rem', color: 'var(--text-muted, rgba(255,255,255,0.4))', marginTop: '2px' } as React.CSSProperties,
  saveBtn: { padding: '8px 18px', background: 'var(--accent-cyan, #22d3ee)', color: '#090d16', border: 'none', borderRadius: '6px', fontWeight: 700, fontSize: '13px', cursor: 'pointer' } as React.CSSProperties,
  resetBtn: { padding: '8px 16px', background: 'rgba(239,68,68,0.12)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '6px', fontWeight: 700, fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' } as React.CSSProperties,
  backBtn: { padding: '8px 16px', background: 'var(--glass-surface, rgba(255,255,255,0.08))', color: 'var(--text-primary, #fff)', border: '1px solid var(--glass-border, rgba(255,255,255,0.15))', borderRadius: '6px', fontWeight: 600, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' } as React.CSSProperties,
  notice: { background: 'rgba(34,211,238,0.06)', border: '1px solid rgba(34,211,238,0.15)', borderRadius: '8px', padding: '10px 14px', fontSize: '12px', color: 'var(--text-muted, rgba(255,255,255,0.5))', marginBottom: '1.5rem' } as React.CSSProperties,
  catHead: { color: 'var(--accent-cyan, #22d3ee)', fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase' as const, marginBottom: '0.5rem', marginTop: '1.5rem', fontWeight: 700 } as React.CSSProperties,
};

type Tab = 'prices' | 'species' | 'colorTerms' | 'origins' | 'treatments' | 'system';

interface AdminDashboardProps {
  onBack?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBack }) => {
  const [tab, setTab] = useState<Tab>('prices');
  const [prices, setPrices] = useState<any[]>([]);
  const [configData, setConfigData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saved, setSaved] = useState('');

  const [priceEdits, setPriceEdits] = useState<{ [k: string]: number }>({});
  const [speciesEdits, setSpeciesEdits] = useState<{ [k: string]: any }>({});
  const [colorTermEdits, setColorTermEdits] = useState<{ [k: string]: any[] }>({});
  const [originEdits, setOriginEdits] = useState<{ [cat: string]: { [key: string]: { factor?: number } } }>({});
  const [treatEdits, setTreatEdits] = useState<{ [cat: string]: { [key: string]: { factor?: number } } }>({});
  const [systemEdits, setSystemEdits] = useState<any>({});

  const fetchPrices = useCallback(async () => {
    const res = await fetch(`${API}/api/admin/prices`);
    if (res.ok) setPrices(await res.json());
  }, []);

  const fetchConfig = useCallback(async () => {
    const res = await fetch(`${API}/api/admin/config`);
    if (res.ok) {
      const d = await res.json();
      setConfigData(d);
      setSystemEdits(d.systemSettings || {});
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchPrices(), fetchConfig()]).finally(() => setLoading(false));
  }, [fetchPrices, fetchConfig]);

  const flash = (msg = 'Saved ✓') => { setSaved(msg); setTimeout(() => setSaved(''), 3000); };

  // ── Price handlers ──────────────────────────────────────────────────────
  const submitPrice = async (speciesId: string) => {
    const p = priceEdits[speciesId]; if (!p) return;
    await fetch(`${API}/api/admin/override-price`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ speciesId, priceData: { basePrice: p, lowIqr: Math.round(p * 0.88), highIqr: Math.round(p * 1.15), trend30d: '+0.0%', clearedTransactionsCount: 50, source: 'Admin Manual Override' } })
    });
    const n = { ...priceEdits }; delete n[speciesId]; setPriceEdits(n);
    await fetchPrices(); flash(`Saved $${p}/ct`);
  };

  const clearPrice = async (speciesId: string) => {
    await fetch(`${API}/api/admin/clear-override`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ speciesId }) });
    await fetchPrices(); flash('Override cleared');
  };

  const forceRefresh = async () => {
    setRefreshing(true);
    await fetch(`${API}/api/admin/force-refresh`, { method: 'POST' });
    await fetchPrices(); setRefreshing(false); flash('Feed refreshed');
  };

  // ── Config handlers ─────────────────────────────────────────────────────
  const saveOrigin = async (cat: string, key: string) => {
    const v = originEdits[cat]?.[key]; if (!v) return;
    await fetch(`${API}/api/admin/config`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'origin', category: cat, key, value: v }) });
    await fetchConfig(); flash('Origin factor saved');
    setOriginEdits(p => { const n = { ...p }; if (n[cat]) delete n[cat][key]; return n; });
  };

  const saveTreat = async (cat: string, key: string) => {
    const v = treatEdits[cat]?.[key]; if (!v) return;
    await fetch(`${API}/api/admin/config`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'treatment', category: cat, key, value: v }) });
    await fetchConfig(); flash('Treatment factor saved');
    setTreatEdits(p => { const n = { ...p }; if (n[cat]) delete n[cat][key]; return n; });
  };

  const saveSpecies = async (speciesId: string) => {
    const v = speciesEdits[speciesId]; if (!v) return;
    await fetch(`${API}/api/admin/config`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'species', key: speciesId, value: v }) });
    await fetchConfig(); flash('Species config saved');
    setSpeciesEdits(p => { const n = { ...p }; delete n[speciesId]; return n; });
  };

  const saveColorTermArray = async (speciesId: string, newArray: any[]) => {
    await fetch(`${API}/api/admin/config`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'colorTerm', key: speciesId, value: newArray }) });
    await fetchConfig(); flash('Color terms saved');
    setColorTermEdits(p => { const n = { ...p }; delete n[speciesId]; return n; });
  };

  const saveSystem = async () => {
    await fetch(`${API}/api/admin/config`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ systemSettings: systemEdits }) });
    await fetchConfig(); flash('System settings saved');
  };

  const resetAll = async () => {
    if (!confirm('Reset ALL config overrides to catalog defaults?')) return;
    await fetch(`${API}/api/admin/config`, { method: 'DELETE' });
    await fetchConfig(); flash('All overrides reset to defaults');
  };

  return (
    <div style={S.page}>
      <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
        {/* Header */}
        <div style={S.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {onBack && (
              <button style={S.backBtn} onClick={onBack} title="Return to Appraisal Suite">
                <ArrowLeft size={16} />
                <span>Appraisal Suite</span>
              </button>
            )}
            <h1 style={S.title}>
              <Settings size={24} color="var(--accent-cyan, #22d3ee)" />
              <span>CAGS Admin Control Panel</span>
            </h1>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {saved && <span style={{ color: '#10b981', fontWeight: 600, fontSize: '13px', minWidth: '140px', textAlign: 'right' }}>{saved}</span>}
            <button style={S.resetBtn} onClick={resetAll}><Trash2 size={13} /> Reset All Overrides</button>
            <button onClick={forceRefresh} disabled={refreshing} style={{ ...S.saveBtn, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <RefreshCw size={13} className={refreshing ? 'spin' : ''} />
              {refreshing ? 'Refreshing...' : 'Force API Refresh'}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={S.tabs}>
          {([
            ['prices', 'Base Prices', <Database size={13} />],
            ['species', 'Species Catalog', <Settings size={13} />],
            ['colorTerms', 'Color Terms', <MapPin size={13} />],
            ['origins', 'Origin Multipliers', <MapPin size={13} />],
            ['treatments', 'Treatment Factors', <Thermometer size={13} />],
            ['system', 'System Settings', <Sliders size={13} />]
          ] as [Tab, string, React.ReactNode][]).map(([id, label, icon]) => (
            <button key={id} style={S.tab(tab === id)} onClick={() => setTab(id)}>{icon}{label}</button>
          ))}
        </div>

        <div style={S.notice}>
          All configuration updates apply instantly to the valuation calculations and persist securely in Google Cloud Firestore.
        </div>

        {loading ? (
          <p style={{ color: 'var(--text-muted, rgba(255,255,255,0.5))', padding: '20px' }}>Loading admin configuration...</p>
        ) : (
          <>
            {/* ── BASE PRICES ─────────────────────────────────────────────── */}
            {tab === 'prices' && (
              <GlassCard>
                <h3 style={{ marginTop: 0, color: 'var(--text-primary)' }}>Species Base Price Overrides</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '1.5rem' }}>
                  These per-carat base prices calibrate the entire valuation matrix. They reflect the institutional trade reference prices.
                </p>
                <div style={{ overflowX: 'auto' }}>
                  <table style={S.table}>
                    <thead>
                      <tr>
                        <th style={S.th}>Species</th>
                        <th style={S.th}>Base ($/ct)</th>
                        <th style={S.th}>Status</th>
                        <th style={S.th}>Updated</th>
                        <th style={S.th}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {prices.map(p => (
                        <tr key={p.speciesId}>
                          <td style={S.td}>
                            <div style={{ fontWeight: 600 }}>{p.name || p.speciesName || p.speciesId.replace(/_/g, ' ')}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{p.speciesId}</div>
                          </td>
                          <td style={S.td}>
                            {priceEdits[p.speciesId] !== undefined ? (
                              <input
                                type="number"
                                style={{ ...S.inp, width: '100px' }}
                                value={priceEdits[p.speciesId]}
                                onChange={e => setPriceEdits({ ...priceEdits, [p.speciesId]: Number(e.target.value) })}
                              />
                            ) : (
                              <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '1rem' }}>
                                ${p.basePrice?.toLocaleString()}
                              </span>
                            )}
                          </td>
                          <td style={S.td}>
                            <span style={S.badge(!!p.isManualOverride)}>
                              {p.isManualOverride ? <><AlertTriangle size={11} /> Manual</> : 'Default'}
                            </span>
                          </td>
                          <td style={{ ...S.td, color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                            {p.lastUpdated ? new Date(p.lastUpdated).toLocaleString() : '—'}
                          </td>
                          <td style={S.td}>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              {priceEdits[p.speciesId] !== undefined ? (
                                <>
                                  <button style={{ ...S.ab, borderColor: '#10b981', color: '#10b981' }} onClick={() => submitPrice(p.speciesId)}>
                                    <Check size={12} /> Save
                                  </button>
                                  <button
                                    style={{ ...S.ab, borderColor: '#ef4444', color: '#ef4444' }}
                                    onClick={() => { const n = { ...priceEdits }; delete n[p.speciesId]; setPriceEdits(n); }}
                                  >
                                    <X size={12} />
                                  </button>
                                </>
                              ) : (
                                <button style={S.ab} onClick={() => setPriceEdits({ ...priceEdits, [p.speciesId]: p.basePrice })}>
                                  <Edit2 size={12} /> Edit
                                </button>
                              )}
                              {p.isManualOverride && (
                                <button style={{ ...S.ab, borderColor: '#ef4444', color: '#ef4444' }} onClick={() => clearPrice(p.speciesId)} title="Restore catalog default">
                                  <RefreshCw size={12} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </GlassCard>
            )}

            {/* ── ORIGIN MULTIPLIERS ──────────────────────────────────────── */}
            {tab === 'origins' && configData && (
              <GlassCard>
                <h3 style={{ marginTop: 0, color: 'var(--text-primary)' }}>Geographic Origin Multipliers</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '1rem' }}>
                  Applied directly to wholesale midpoint. 1.0 = trade baseline.
                </p>
                {Object.entries(configData.origins as Record<string, Record<string, any>>).map(([cat, entries]) => (
                  <div key={cat} style={{ marginBottom: '1.5rem' }}>
                    <h4 style={S.catHead}>{cat} category</h4>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={S.table}>
                        <thead>
                          <tr>
                            <th style={S.th}>Origin</th>
                            <th style={S.th}>Current ×</th>
                            <th style={S.th}>Set New ×</th>
                            <th style={S.th}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(entries).map(([key, entry]: [string, any]) => {
                            const ed = originEdits[cat]?.[key];
                            const hasOvr = configData.overrides?.origins?.[cat]?.[key];
                            return (
                              <tr key={key}>
                                <td style={S.td}>{entry.label}</td>
                                <td style={S.td}>
                                  <span style={S.fc(entry.factor)}>×{entry.factor?.toFixed(2)}</span>
                                  {hasOvr && <span style={{ ...S.badge(true), marginLeft: '8px' }}><AlertTriangle size={10} />OVR</span>}
                                </td>
                                <td style={S.td}>
                                  <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="5"
                                    style={{ ...S.inp, width: '80px' }}
                                    placeholder={entry.factor?.toFixed(2)}
                                    value={ed?.factor ?? ''}
                                    onChange={e => setOriginEdits(p => ({ ...p, [cat]: { ...p[cat], [key]: { factor: parseFloat(e.target.value) } } }))}
                                  />
                                </td>
                                <td style={S.td}>
                                  {ed?.factor !== undefined && (
                                    <button style={{ ...S.ab, borderColor: '#10b981', color: '#10b981' }} onClick={() => saveOrigin(cat, key)}>
                                      <Check size={12} /> Apply
                                    </button>
                                  )}
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

            {/* ── TREATMENT FACTORS ──────────────────────────────────────── */}
            {tab === 'treatments' && configData && (
              <GlassCard>
                <h3 style={{ marginTop: 0, color: 'var(--text-primary)' }}>Treatment Status Factors</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '1rem' }}>
                  These factors multiply the wholesale midpoint. Unheated gems command large premiums; diffused gems steep discounts.
                </p>
                {Object.entries(configData.treatments as Record<string, Record<string, any>>).map(([cat, entries]) => (
                  <div key={cat} style={{ marginBottom: '1.5rem' }}>
                    <h4 style={S.catHead}>{cat} category</h4>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={S.table}>
                        <thead>
                          <tr>
                            <th style={S.th}>Treatment</th>
                            <th style={S.th}>Current ×</th>
                            <th style={S.th}>Set New ×</th>
                            <th style={S.th}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(entries).map(([key, entry]: [string, any]) => {
                            const ed = treatEdits[cat]?.[key];
                            const hasOvr = configData.overrides?.treatments?.[cat]?.[key];
                            return (
                              <tr key={key}>
                                <td style={S.td}>{entry.label}</td>
                                <td style={S.td}>
                                  <span style={S.fc(entry.factor)}>×{entry.factor?.toFixed(2)}</span>
                                  {hasOvr && <span style={{ ...S.badge(true), marginLeft: '8px' }}><AlertTriangle size={10} />OVR</span>}
                                </td>
                                <td style={S.td}>
                                  <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="5"
                                    style={{ ...S.inp, width: '80px' }}
                                    placeholder={entry.factor?.toFixed(2)}
                                    value={ed?.factor ?? ''}
                                    onChange={e => setTreatEdits(p => ({ ...p, [cat]: { ...p[cat], [key]: { factor: parseFloat(e.target.value) } } }))}
                                  />
                                </td>
                                <td style={S.td}>
                                  {ed?.factor !== undefined && (
                                    <button style={{ ...S.ab, borderColor: '#10b981', color: '#10b981' }} onClick={() => saveTreat(cat, key)}>
                                      <Check size={12} /> Apply
                                    </button>
                                  )}
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

            {/* ── SPECIES CATALOG ────────────────────────────────────────── */}
            {tab === 'species' && configData && (
              <GlassCard>
                <h3 style={{ marginTop: 0, color: 'var(--text-primary)' }}>Species Catalog Management</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '1rem' }}>
                  Edit base parameters for species (e.g. clarity type, origin category).
                </p>
                <div style={{ overflowX: 'auto' }}>
                  <table style={S.table}>
                    <thead>
                      <tr>
                        <th style={S.th}>Species</th>
                        <th style={S.th}>Clarity Type</th>
                        <th style={S.th}>Origin Cat</th>
                        <th style={S.th}>Treatment Cat</th>
                        <th style={S.th}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(configData.species as Record<string, any>).map(([key, entry]) => {
                        const ed = speciesEdits[key] || {};
                        const hasOvr = configData.overrides?.species?.[key];
                        return (
                          <tr key={key}>
                            <td style={S.td}>
                              {entry.name} <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>({key})</span>
                              {hasOvr && <span style={{ ...S.badge(true), marginLeft: '8px' }}><AlertTriangle size={10} />OVR</span>}
                            </td>
                            <td style={S.td}>
                              <select
                                style={S.inp}
                                value={ed.clarityType ?? entry.clarityType}
                                onChange={e => setSpeciesEdits(p => ({ ...p, [key]: { ...p[key], clarityType: e.target.value } }))}
                              >
                                <option value="I">Type I</option>
                                <option value="II">Type II</option>
                                <option value="III">Type III</option>
                              </select>
                            </td>
                            <td style={S.td}>
                              <input
                                type="text"
                                style={{ ...S.inp, width: '100px' }}
                                value={ed.originCategory ?? entry.originCategory}
                                onChange={e => setSpeciesEdits(p => ({ ...p, [key]: { ...p[key], originCategory: e.target.value } }))}
                              />
                            </td>
                            <td style={S.td}>
                              <input
                                type="text"
                                style={{ ...S.inp, width: '100px' }}
                                value={ed.treatmentCategory ?? entry.treatmentCategory}
                                onChange={e => setSpeciesEdits(p => ({ ...p, [key]: { ...p[key], treatmentCategory: e.target.value } }))}
                              />
                            </td>
                            <td style={S.td}>
                              {Object.keys(ed).length > 0 && (
                                <button style={{ ...S.ab, borderColor: '#10b981', color: '#10b981' }} onClick={() => saveSpecies(key)}>
                                  <Check size={12} /> Apply
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </GlassCard>
            )}

            {/* ── COLOR TERMS ────────────────────────────────────────────── */}
            {tab === 'colorTerms' && configData && (
              <GlassCard>
                <h3 style={{ marginTop: 0, color: 'var(--text-primary)' }}>Trade Color Term Premiums</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '1rem' }}>
                  Manage prestige trade terms (e.g. Royal Blue, Cornflower Blue) and their multipliers.
                </p>
                {Object.entries(configData.colorTerms as Record<string, any[]>).map(([speciesId, terms]) => {
                  const hasOvr = configData.overrides?.colorTerms?.[speciesId];
                  const displayTerms = hasOvr || terms;
                  const edTerms = colorTermEdits[speciesId] || displayTerms;
                  return (
                    <div key={speciesId} style={{ marginBottom: '2rem', border: '1px solid var(--glass-border)', padding: '14px', borderRadius: '10px' }}>
                      <h4 style={{ ...S.catHead, marginTop: 0 }}>
                        {speciesId} {hasOvr && <span style={S.badge(true)}>Overridden</span>}
                      </h4>
                      <div style={{ overflowX: 'auto' }}>
                        <table style={S.table}>
                          <thead>
                            <tr>
                              <th style={S.th}>Term</th>
                              <th style={S.th}>Multiplier ×</th>
                              <th style={S.th}>Premium</th>
                              <th style={S.th}>Hue Range</th>
                            </tr>
                          </thead>
                          <tbody>
                            {edTerms.map((t, idx) => (
                              <tr key={idx}>
                                <td style={S.td}>{t.term}</td>
                                <td style={S.td}>
                                  <input
                                    type="number"
                                    step="0.01"
                                    style={{ ...S.inp, width: '70px' }}
                                    value={t.multiplier}
                                    onChange={e => {
                                      const nw = [...edTerms];
                                      nw[idx] = { ...nw[idx], multiplier: parseFloat(e.target.value) };
                                      setColorTermEdits(p => ({ ...p, [speciesId]: nw }));
                                    }}
                                  />
                                </td>
                                <td style={S.td}>{t.premium ? 'Yes' : 'No'}</td>
                                <td style={S.td}>{t.hueMin}° – {t.hueMax}°</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {colorTermEdits[speciesId] && (
                        <div style={{ marginTop: '10px' }}>
                          <button style={S.saveBtn} onClick={() => saveColorTermArray(speciesId, edTerms)}>
                            Save {speciesId} Terms
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </GlassCard>
            )}

            {/* ── SYSTEM SETTINGS ────────────────────────────────────────── */}
            {tab === 'system' && (
              <GlassCard>
                <h3 style={{ marginTop: 0, color: 'var(--text-primary)' }}>System Settings</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '1.5rem' }}>
                  Controls global calculation parameters. These affect all valuations in real-time.
                </p>

                <div style={S.settingRow}>
                  <div>
                    <div style={S.label}>Default Retail Gross Margin (%)</div>
                    <div style={S.sub}>Appraisal default when calculating Retail Replacement Value</div>
                  </div>
                  <input
                    type="number"
                    style={{ ...S.inp, width: '80px' }}
                    min="0"
                    max="200"
                    value={systemEdits.defaultRetailMargin ?? 50}
                    onChange={e => setSystemEdits({ ...systemEdits, defaultRetailMargin: Number(e.target.value) })}
                  />
                </div>

                <h4 style={{ ...S.catHead, marginTop: '1.5rem' }}>Certification Spread (± % on midpoint to compute Low / High range)</h4>
                {[['major', 'Tier 1 Lab (GIA/SSEF/Gübelin)', 0.12], ['domestic', 'Domestic Lab', 0.20], ['none', 'No Report', 0.30]].map(([cert, name, def]) => (
                  <div key={cert as string} style={S.settingRow}>
                    <div>
                      <div style={S.label}>{name as string}</div>
                      <div style={S.sub}>Spread value × 100 = ±{Math.round((systemEdits.certSpread?.[cert as string] ?? def as number) * 100)}%</div>
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="1"
                      style={{ ...S.inp, width: '80px' }}
                      value={systemEdits.certSpread?.[cert as string] ?? def}
                      onChange={e => setSystemEdits({ ...systemEdits, certSpread: { ...(systemEdits.certSpread || {}), [cert as string]: parseFloat(e.target.value) } })}
                    />
                  </div>
                ))}

                <h4 style={{ ...S.catHead, marginTop: '1.5rem' }}>Certification Multiplier (× applied to wholesale midpoint)</h4>
                {[['major', 'Tier 1 Lab (GIA/SSEF/Gübelin)', 1.10], ['domestic', 'Domestic Lab', 1.00], ['none', 'No Report', 0.88]].map(([cert, name, def]) => (
                  <div key={cert as string} style={S.settingRow}>
                    <div>
                      <div style={S.label}>{name as string}</div>
                      <div style={S.sub}>Lab certification liquidity and trust factor</div>
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="2"
                      style={{ ...S.inp, width: '80px' }}
                      value={systemEdits.certMultiplier?.[cert as string] ?? def}
                      onChange={e => setSystemEdits({ ...systemEdits, certMultiplier: { ...(systemEdits.certMultiplier || {}), [cert as string]: parseFloat(e.target.value) } })}
                    />
                  </div>
                ))}

                <div style={{ marginTop: '2rem' }}>
                  <button style={S.saveBtn} onClick={saveSystem}>Save System Settings</button>
                </div>
              </GlassCard>
            )}
          </>
        )}
      </div>
      <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
};
