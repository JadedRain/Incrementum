import React from 'react';
import NavigationBar from '../Components/NavigationBar';
import '../styles/HelpPage.css';

const HelpPage: React.FC = () => {
  return (
    <div className="help-page">
      <NavigationBar />
      <main className="help-page-content">
        <section className="help-hero">
          <p className="help-eyebrow">Incrementum User Guide</p>
          <h1>How To Screen, Sort, Search, and Predict</h1>
          <p>
            This page is the in-app guide for using Incrementum. It reflects the latest
            screener workflow.
          </p>
        </section>

        <section className="help-section">
          <h2>Workflow at a Glance</h2>
          <div className="help-glance-grid">
            <article className="help-glance-card">
              <h3>Screener Selection</h3>
              <p>Select a screener from the dropdown: Day Gainers, Day Losers, Most Actives, Undervalued Growth Stocks, or None.</p>
            </article>
            <article className="help-glance-card">
              <h3>Filter Setup</h3>
              <p>Build your criteria in the right sidebar and refine results instantly.</p>
            </article>
            <article className="help-glance-card">
              <h3>Save and Share</h3>
              <p>Save your screener name from the top bar, then share when needed.</p>
            </article>
            <article className="help-glance-card">
              <h3>Stock Details</h3>
              <p>Select any ticker for details and run prediction for decision support.</p>
            </article>
          </div>
        </section>
        <div className="help-detail-grid">
          <section className="help-section">
            <h2>Create a Screener</h2>
            <p className="help-section-intro">Start from the screener selector in the top bar, then save your setup.</p>
            <ol className="help-steps">
              <li>Open the Screener page.</li>
              <li>Select a screener from the dropdown in the top bar.</li>
            </ol>
            <ul className="help-bullets">
              <li>Day Gainers</li>
              <li>Day Losers</li>
              <li>Most Actives</li>
              <li>Undervalued Growth Stocks</li>
              <li>None (blank screener)</li>
            </ul>
            <ol className="help-steps" start={3}>
              <li>Apply filters in the right sidebar.</li>
              <li>Click Save in the top bar to create a saved screener.</li>
              <li>Enter a screener name and save it.</li>
            </ol>
          </section>

          <section className="help-section">
            <h2>Add Filters</h2>
            <p className="help-section-intro">Use the right panel to narrow results with fundamentals and categories.</p>
            <ol className="help-steps">
              <li>Open any screener (built-in, blank, or saved).</li>
              <li>Use the right sidebar to add conditions such as:</li>
            </ol>
            <ul className="help-bullets">
              <li>Ticker Symbol</li>
              <li>Industry</li>
              <li>Market Cap</li>
              <li>Price</li>
              <li>Volume</li>
              <li>EPS</li>
              <li>Debt-to-Equity</li>
              <li>Other fundamentals shown in the sidebar</li>
            </ul>
            <ol className="help-steps" start={3}>
              <li>Each filter immediately updates the stock results.</li>
              <li>Use Reset All Filters to clear all currently applied filters.</li>
            </ol>
          </section>

          <section className="help-section">
            <h2>Sort Results</h2>
            <p className="help-section-intro">Sort directly in the table to rank opportunities after filtering.</p>
            <ol className="help-steps">
              <li>In the screener results table, click a column header to sort by that data point.</li>
              <li>Click the same header again to reverse the sort direction.</li>
              <li>Common sortable fields include:</li>
            </ol>
            <ul className="help-bullets">
              <li>Symbol</li>
              <li>Company Name</li>
              <li>Price</li>
              <li>EPS</li>
              <li>D/E Ratio</li>
              <li>52W High / 52W Low</li>
              <li>1 Day % Chg.</li>
              <li>Volume</li>
              <li>Market Cap</li>
              <li>Listed Date</li>
              <li>Industry</li>
              <li>P/E Ratio, PEG Ratio, Revenue/Share, P/S Ratio</li>
            </ul>
          </section>

          <section className="help-section help-section-right-column">
            <h2>View Details and Run Prediction</h2>
            <p className="help-section-intro">Open a ticker profile, then run a model prediction for context.</p>
            <ol className="help-steps">
              <li>From a screener table or search results, select a stock to open its stock detail page.</li>
              <li>On the stock page, use the prediction action to request a model forecast.</li>
              <li>The prediction response includes values such as:</li>
            </ol>
            <ul className="help-bullets">
              <li>Predicted price</li>
              <li>Last close</li>
              <li>Predicted return metrics</li>
              <li>Model/version metadata</li>
            </ul>
            <ol className="help-steps" start={4}>
              <li>Use this estimate as a decision-support signal, not financial advice.</li>
            </ol>
          </section>

          <section className="help-section">
            <h2>Search Any Stock</h2>
            <p className="help-section-intro">Use the global search in the header from any page.</p>
            <ol className="help-steps">
              <li>Use the search bar in the app header (placeholder: Search stocks...).</li>
              <li>Type a ticker or stock query.</li>
              <li>Press Enter to open the search results page for that symbol/query.</li>
            </ol>
          </section>

        </div>
      </main>
    </div>
  );
};

export default HelpPage;