import React, { useState } from 'react';
import { useDatabaseScreenerContext } from '../../Context/DatabaseScreenerContext';
import ExpandableSidebarItem from '../ExpandableSidebarItem';

const TickerSymbolFilter: React.FC = () => {
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { addFilter } = useDatabaseScreenerContext();

  const handleAdd = () => {
    const trimmed = input.trim();
    if (!trimmed) {
      setError('Please enter at least one ticker symbol.');
      return;
    }
    const symbols = trimmed
      .split(/[\s,]+/)
      .map(s => s.trim().toUpperCase())
      .filter(s => s.length > 0);
    if (symbols.length === 0) {
      setError('No valid symbols found.');
      return;
    }
    symbols.forEach(symbol => {
      addFilter({
        operator: 'equals',
        operand: 'ticker',
        filter_type: 'categoric',
        value: symbol,
      });
    });
    setInput('');
    setError(null);
  };

  return (
    <ExpandableSidebarItem title="Ticker Symbol">
      <div style={{ marginBottom: '0.5rem' }}>
        <div style={{ fontWeight: 600 }}>Ticker Symbols</div>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value.toUpperCase())}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAdd();
            }
          }}
          placeholder="e.g. AAPL, MSFT, GOOGL"
          className="sidebar-input"
          style={{ width: '100%', padding: '0.4rem', borderRadius: 4, minWidth: 0, marginBottom: 8 }}
        />
        <button
          onClick={handleAdd}
          style={{ padding: '6px 16px', borderRadius: 4, background: '#1976d2', color: '#fff', border: 'none', width: '100%' }}
        >
          Add Filter
        </button>
        {error && <div style={{ color: 'red', marginTop: 4 }}>{error}</div>}
        <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#2b2b2b' }}>
          Enter multiple symbols separated by commas or spaces.
        </div>
      </div>
    </ExpandableSidebarItem>
  );
};

export default TickerSymbolFilter;
