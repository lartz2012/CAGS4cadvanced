import React from 'react';

interface ColorPickerProps {
  hue: number;
  tone: number;
  saturation: number;
  onColorChange: (color: { hue: number; tone: number; saturation: number }) => void;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
  hue,
  tone,
  saturation,
  onColorChange
}) => {
  // Convert HSV to CSS HSL approximation for preview
  const hslLightness = Math.round((tone / 100) * 50);
  const colorPreviewStyle = {
    backgroundColor: `hsl(${hue}, ${saturation}%, ${hslLightness}%)`,
    boxShadow: `0 0 25px hsl(${hue}, ${saturation}%, 40%)`
  };

  const getToneLabel = (t: number) => {
    if (t <= 20) return 'Very Light';
    if (t <= 40) return 'Light';
    if (t <= 60) return 'Medium';
    if (t <= 75) return 'Medium-Dark';
    if (t <= 85) return 'Dark';
    return 'Very Dark';
  };

  const getSatLabel = (s: number) => {
    if (s <= 20) return 'Grayish / Brownish';
    if (s <= 40) return 'Slightly Grayish';
    if (s <= 60) return 'Moderately Strong';
    if (s <= 80) return 'Strong';
    return 'Vivid / Intense';
  };

  // GIA Discrete Levels
  const TONE_LEVELS = [20, 40, 60, 75, 85, 95];
  const SAT_LEVELS = [20, 40, 60, 80, 100];

  return (
    <div className="color-picker-container" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Live Preview Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'var(--bg-glass)', padding: '16px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            border: '2px solid rgba(255, 255, 255, 0.4)',
            transition: 'all 0.2s ease',
            flexShrink: 0,
            ...colorPreviewStyle
          }}
        />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>
            Color Grade Estimate
          </div>
          <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.3 }}>
            {getToneLabel(tone)}, {getSatLabel(saturation)}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--accent-cyan)', marginTop: '4px', fontFamily: 'monospace' }}>
            H:{hue}° | T:{tone}% | S:{saturation}%
          </div>
        </div>
      </div>

      {/* Hue Bar Slider */}
      <div className="slider-container">
        <div className="slider-header" style={{ marginBottom: '12px' }}>
          <span style={{ color: '#94a3b8', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>Spectral Hue</span>
        </div>
        <input
          type="range"
          min="0"
          max="360"
          value={hue}
          onChange={(e) => onColorChange({ hue: Number(e.target.value), tone, saturation })}
          style={{
            background: 'linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)',
            height: '12px',
            borderRadius: '6px'
          }}
        />
      </div>

      {/* GIA Tone Discrete Selector */}
      <div className="slider-container">
        <div className="slider-header" style={{ marginBottom: '8px' }}>
          <span style={{ color: '#94a3b8', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>GIA Depth of Tone</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
          {TONE_LEVELS.map(t => (
            <button
              key={`tone-${t}`}
              onClick={() => onColorChange({ hue, tone: t, saturation })}
              style={{
                padding: '8px 4px',
                fontSize: '11px',
                borderRadius: '8px',
                border: tone === t ? '1px solid var(--accent-cyan)' : '1px solid var(--border-color)',
                background: tone === t ? 'rgba(0, 240, 255, 0.1)' : 'var(--bg-glass)',
                color: tone === t ? 'var(--accent-cyan)' : 'var(--text-primary)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontWeight: tone === t ? 600 : 400
              }}
            >
              {getToneLabel(t)}
            </button>
          ))}
        </div>
      </div>

      {/* GIA Saturation Discrete Selector */}
      <div className="slider-container">
        <div className="slider-header" style={{ marginBottom: '8px' }}>
          <span style={{ color: '#94a3b8', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>GIA Saturation Intensity</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {SAT_LEVELS.map(s => (
            <button
              key={`sat-${s}`}
              onClick={() => onColorChange({ hue, tone, saturation: s })}
              style={{
                padding: '10px 12px',
                fontSize: '12px',
                textAlign: 'left',
                borderRadius: '8px',
                border: saturation === s ? '1px solid var(--accent-cyan)' : '1px solid var(--border-color)',
                background: saturation === s ? 'rgba(0, 240, 255, 0.1)' : 'var(--bg-glass)',
                color: saturation === s ? 'var(--accent-cyan)' : 'var(--text-primary)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                justifyContent: 'space-between',
                fontWeight: saturation === s ? 600 : 400
              }}
            >
              <span>{getSatLabel(s)}</span>
              <span style={{ color: 'var(--text-muted)' }}>{s}%</span>
            </button>
          ))}
        </div>
      </div>
      
    </div>
  );
};
