import React, { useMemo } from 'react';
import { ScrapedMarketListing, MarketDataService } from '../services/marketDataService';
import { ExternalLink, CheckCircle, Database } from 'lucide-react';

interface MarketComparablesProps {
  speciesId: string;
  targetCarat: number;
  scrapedListings: ScrapedMarketListing[];
  currency: string;
  currencyRate: number;
  currentValuationPerCarat: number;
}

export const MarketComparables: React.FC<MarketComparablesProps> = ({
  speciesId,
  targetCarat,
  scrapedListings,
  currency,
  currencyRate,
  currentValuationPerCarat
}) => {
  const formatMoney = (usdAmount: number) => {
    const converted = Math.round(usdAmount * currencyRate);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0
    }).format(converted);
  };

  const compData = useMemo(() => {
    return MarketDataService.getInstance().getMatchingComparables(
      scrapedListings,
      speciesId,
      targetCarat,
      6
    );
  }, [speciesId, targetCarat, scrapedListings]);

  if (compData.matches.length === 0) {
    return null;
  }

  // Calculate variance between algorithmic valuation and scraped market median
  const medianPrice = compData.medianPricePerCarat;
  const variancePercent = medianPrice > 0
    ? Math.round(((currentValuationPerCarat - medianPrice) / medianPrice) * 100)
    : 0;

  return (
    <div className="market-comparables-section">
      <div className="editorial-section-header" style={{ marginBottom: '14px' }}>
        <div>
          <span className="editorial-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Database size={15} style={{ color: 'var(--accent-cyan)' }} />
            Referring Market Comparables & Scraped Sources
          </span>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
            Ground-truth listings scraped directly from accredited dealer inventories & auction bourses
          </p>
        </div>
        <span className="editorial-subtag">{compData.count} LISTINGS INDEXED</span>
      </div>

      {/* Correlation Summary Banner */}
      <div className="comparable-stat-banner">
        <div className="comp-stat-col">
          <span className="comp-stat-label">SCRAPED MARKET MEDIAN</span>
          <span className="comp-stat-val">{formatMoney(medianPrice)} /ct</span>
        </div>
        <div className="comp-stat-col">
          <span className="comp-stat-label">MARKET SPREAD (NEARBY WEIGHTS)</span>
          <span className="comp-stat-val">
            {formatMoney(compData.minPricePerCarat)} – {formatMoney(compData.maxPricePerCarat)} /ct
          </span>
        </div>
        <div className="comp-stat-col">
          <span className="comp-stat-label">MODEL CORRELATION</span>
          <span className="comp-stat-val" style={{ color: Math.abs(variancePercent) <= 15 ? 'var(--accent-positive)' : 'var(--accent-cyan)' }}>
            {Math.abs(variancePercent) <= 5
              ? 'Exact Alignment (±5%)'
              : `${variancePercent > 0 ? '+' : ''}${variancePercent}% vs Scraped Median`}
          </span>
        </div>
      </div>

      {/* List of Real Verified Stones */}
      <div className="comparable-list">
        {compData.matches.map((item) => (
          <div key={item.id} className="comparable-card">
            <div className="comp-card-top">
              <div className="comp-card-title-wrap">
                <span className="comp-stone-title">{item.title}</span>
                <span className="comp-stone-meta">
                  {item.carat.toFixed(2)} ct · {item.origin} · {item.treatment} · {item.clarity}
                  {item.certification ? ` · ${item.certification}` : ''}
                </span>
              </div>
              <div className="comp-card-price-wrap">
                <span className="comp-price-per-ct">{formatMoney(item.pricePerCarat)} /ct</span>
                <span className="comp-price-total">Total: {formatMoney(item.priceUsd)}</span>
              </div>
            </div>

            <div className="comp-card-bottom">
              <span className="comp-source-name">
                <CheckCircle size={12} style={{ color: 'var(--accent-positive)', marginRight: '4px' }} />
                Source: <strong>{item.sourceName}</strong>
              </span>
              <a
                href={item.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="comp-link-btn"
              >
                <span>Verify Source Listing</span>
                <ExternalLink size={12} />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
