import React, { useRef, useState } from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  cornerRadius?: number;
  padding?: string;
  elevated?: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  cornerRadius = 14,
  padding = '24px',
  elevated = false,
  onClick,
  style = {}
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    cardRef.current.style.setProperty('--mouse-x', `${x}px`);
    cardRef.current.style.setProperty('--mouse-y', `${y}px`);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      className={`liquid-card ${elevated ? 'liquid-card-elevated' : ''} ${className}`}
      style={{
        position: 'relative',
        width: '100%',
        borderRadius: `${cornerRadius}px`,
        padding,
        background: elevated ? 'var(--glass-surface-elevated)' : 'var(--glass-surface)',
        backdropFilter: 'blur(36px) saturate(210%) contrast(104%)',
        WebkitBackdropFilter: 'blur(36px) saturate(210%) contrast(104%)',
        border: elevated ? '1px solid var(--glass-border-hover)' : '1px solid var(--glass-border)',
        boxShadow: elevated ? 'var(--shadow-elevated)' : 'var(--shadow-glass)',
        transition: 'border-color 0.25s ease, box-shadow 0.25s ease, background-color 0.25s ease',
        overflow: 'hidden',
        ...style
      }}
    >
      {/* Specular Mouse-Reactive Glint */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle 420px at var(--mouse-x, 50%) var(--mouse-y, 50%), var(--mouse-specular-color), transparent 75%)',
          pointerEvents: 'none',
          opacity: isHovered ? 1 : 0,
          transition: 'opacity 0.3s ease',
          zIndex: 1
        }}
      />

      {/* Iridescent Refraction Highlight Rim */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: 'var(--card-rim-gradient)',
          pointerEvents: 'none',
          zIndex: 2
        }}
      />

      <div style={{ position: 'relative', zIndex: 3, width: '100%' }}>
        {children}
      </div>
    </div>
  );
};
