import React, { useState } from "react";
import "../../styles/PotentialGains.css"; // Make sure to import your Tailwind CSS file

const mockRows = [
  { symbol: "INTC", price: "$10.00", shares: 10, gain: "Up", date: "1/27" },
  { symbol: "NVDA", price: "", shares: "", gain: "", date: "" },
];

const StockTable: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handleRowClick = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className="w-full">
      <div className="stock-table-wrapper">

        <table className="stock-table">
          <thead>
            <tr className="stock-table-header-row">
              <th className="stock-table-header-cell">Symbol</th>
              <th className="stock-table-header-cell">Price</th>
              <th className="stock-table-header-cell"># of Shares</th>
              <th className="stock-table-header-cell">Gain/Loss</th>
              <th className="stock-table-header-cell">Date</th>
              <th className="stock-table-header-cell"></th>
            </tr>
          </thead>
          <tbody>
            {mockRows.map((row, idx) => (
              <React.Fragment key={row.symbol}>
                <tr
                  className="stock-table-row"
                  onClick={() => handleRowClick(idx)}
                >
                  <td className="stock-table-cell">{row.symbol}</td>
                  <td className="stock-table-cell">{row.price}</td>
                  <td className="stock-table-cell">
                    <input
                      className="stock-table-input"
                      defaultValue={row.shares}
                      onClick={e => e.stopPropagation()}
                    />
                  </td>
                  <td className="stock-table-cell">{row.gain}</td>
                  <td className="stock-table-cell">
                    <input
                      className="stock-table-input-date"
                      defaultValue={row.date}
                      onClick={e => e.stopPropagation()}
                    />
                  </td>
                  <td className="stock-table-expand-btn">+</td>
                </tr>
                {openIndex === idx && (
                  <tr>
                    <td colSpan={6} className="stock-table-collapsible-row">
                      <div className="stock-table-collapsible-content">
                        Collapsible content for {row.symbol}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StockTable;