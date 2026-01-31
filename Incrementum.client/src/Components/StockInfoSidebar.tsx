import React from 'react';

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
    <div className="w-full md:w-80 flex-shrink-0">
      <div className="p-6 shadow-lg h-[800px] flex flex-col" style={{ backgroundColor: 'hsl(40, 63%, 63%)', borderRadius: '2px', boxShadow: '4px 6px 8px rgba(0, 0, 0, 0.3)' }}>
        <div>
          <h2 className="text-2xl font-bold mb-4" style={{ color: 'hsl(40, 62%, 26%)' }}>
            {fmt(results.company_name)}
          </h2>
          <p className="text-lg mb-6" style={{ color: 'hsl(40, 62%, 26%)' }}>({results.symbol})</p>

          <div className="space-y-3">
            <div className="pb-3" style={{ borderBottom: '1px solid hsl(41, 61%, 9%)' }}>
              <p style={{ color: 'hsl(40, 62%, 26%)' }}>
                <strong>Market Cap:</strong> {fmt(results.market_cap)}
              </p>
            </div>

            <div className="pb-3" style={{ borderBottom: '1px solid hsl(41, 61%, 9%)' }}>
              <p style={{ color: 'hsl(40, 62%, 26%)' }}>
                <strong>Primary Exchange:</strong> {fmt(results.primary_exchange)}
              </p>
            </div>

            <div className="pb-3" style={{ borderBottom: '1px solid hsl(41, 61%, 9%)' }}>
              <p style={{ color: 'hsl(40, 62%, 26%)' }}>
                <strong>Type:</strong> {fmt(results.type)}
              </p>
            </div>

            <div className="pb-3" style={{ borderBottom: '1px solid hsl(41, 61%, 9%)' }}>
              <p style={{ color: 'hsl(40, 62%, 26%)' }}>
                <strong>Currency:</strong> {fmt(results.currency_name)}
              </p>
            </div>


            <div className="pb-3">
              <p style={{ color: 'hsl(40, 62%, 26%)' }}>
                <strong>Outstanding Shares:</strong> {fmt(results.outstanding_shares)}
              </p>
            </div>

            <div className="pb-3">
              <p style={{ color: 'hsl(40, 62%, 26%)' }}>
                <strong>Homepage:</strong> {results.homepage_url ? <a href={results.homepage_url} target="_blank" rel="noreferrer">{results.homepage_url}</a> : 'N/A'}
              </p>
            </div>

            <div className="pb-3">
              <p style={{ color: 'hsl(40, 62%, 26%)' }}>
                <strong>Total Employees:</strong> {fmt(results.total_employees)}
              </p>
            </div>

            <div className="pb-3">
              <p style={{ color: 'hsl(40, 62%, 26%)' }}>
                <strong>List Date:</strong> {fmt(results.list_date)}
              </p>
            </div>

            <div className="pb-3">
              <p style={{ color: 'hsl(40, 62%, 26%)' }}>
                <strong>Locale:</strong> {fmt(results.locale)}
              </p>
            </div>

            <div className="pb-3">
              <p style={{ color: 'hsl(40, 62%, 26%)' }}>
                <strong>SIC:</strong> {fmt(results.sic_code)} — {fmt(results.sic_description)}
              </p>
            </div>

            <div className="pb-3">
              <p style={{ color: 'hsl(40, 62%, 26%)' }}>
                <strong>EPS:</strong> {results.eps !== null && results.eps !== undefined ? String(results.eps) : 'N/A'}
              </p>
            </div>

            
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockInfoSidebar;
