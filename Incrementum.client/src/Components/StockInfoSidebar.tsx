import React from 'react';
import { formatMarketCap, formatWithCommas, formatDate, formatCurrency, formatLargeNumber } from '../utils/formatUtils';

interface StockMeta {
  symbol: string;
  company_name?: string | null;
  market_cap?: number | null;
  primary_exchange?: string | null;
  type?: string | null;
  currency_name?: string | null;
  cik?: string | null;
  composite_figi?: string | null;
  share_class_figi?: string | null;
  outstanding_shares?: number | null;
  homepage_url?: string | null;
  total_employees?: number | null;
  list_date?: string | null;
  locale?: string | null;
  sic_code?: string | null;
  sic_description?: string | null;
  updated_at?: string | null;
  eps?: number | null;
}

interface StockInfoSidebarProps {
  results: StockMeta;
}

const StockInfoSidebar: React.FC<StockInfoSidebarProps> = ({ results }) => {
  const fmt = (v: unknown) => (v === null || v === undefined ? 'N/A' : String(v));

  return (
    <div className="stock-info-sidebar-wrapper">
      <div className="stock-info-sidebar-panel">
        <div>
          <h2 className="stock-info-sidebar-title">
            {fmt(results.company_name)}
          </h2>
          <p className="stock-info-sidebar-symbol">{results.symbol}</p>

          <div className="stock-info-section">
            <h3 className="stock-info-section-header">Key Metrics</h3>
            
            <div className="stock-info-sidebar-row">
              <span className="stock-info-label">Market Cap</span>
              <span className="stock-info-value">{formatMarketCap(results.market_cap)}</span>
            </div>

            <div className="stock-info-sidebar-row">
              <span className="stock-info-label">Outstanding Shares</span>
              <span className="stock-info-value">{formatLargeNumber(results.outstanding_shares)}</span>
            </div>

            <div className="stock-info-sidebar-row">
              <span className="stock-info-label">EPS</span>
              <span className="stock-info-value">{formatCurrency(results.eps)}</span>
            </div>

            <div className="stock-info-sidebar-row">
              <span className="stock-info-label">Total Employees</span>
              <span className="stock-info-value">{formatWithCommas(results.total_employees)}</span>
            </div>
          </div>

          <div className="stock-info-section">
            <h3 className="stock-info-section-header">Trading Information</h3>
            
            <div className="stock-info-sidebar-row">
              <span className="stock-info-label">Primary Exchange</span>
              <span className="stock-info-value">{fmt(results.primary_exchange)}</span>
            </div>

            <div className="stock-info-sidebar-row">
              <span className="stock-info-label">Type</span>
              <span className="stock-info-value">{fmt(results.type)}</span>
            </div>

            <div className="stock-info-sidebar-row">
              <span className="stock-info-label">Currency</span>
              <span className="stock-info-value">{fmt(results.currency_name)}</span>
            </div>

            <div className="stock-info-sidebar-row">
              <span className="stock-info-label">List Date</span>
              <span className="stock-info-value">{formatDate(results.list_date)}</span>
            </div>

            <div className="stock-info-sidebar-row">
              <span className="stock-info-label">Locale</span>
              <span className="stock-info-value">{fmt(results.locale)}</span>
            </div>
          </div>

          <div className="stock-info-section">
            <h3 className="stock-info-section-header">Company Details</h3>
            
            <div className="stock-info-sidebar-row">
              <span className="stock-info-label">SIC Code</span>
              <span className="stock-info-value">{fmt(results.sic_code)}</span>
            </div>

            {results.sic_description && (
              <div className="stock-info-sidebar-row">
                <span className="stock-info-label">Industry</span>
                <span className="stock-info-value">{results.sic_description}</span>
              </div>
            )}

            {results.homepage_url && (
              <div className="stock-info-sidebar-row">
                <span className="stock-info-label">Homepage</span>
                <span className="stock-info-value">
                  <a href={results.homepage_url} target="_blank" rel="noreferrer" className="stock-info-link">
                    Visit Website →
                  </a>
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockInfoSidebar;
