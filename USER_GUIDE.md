# Incrementum User Guide

This guide explains the core workflows in the Incrementum application.

## 1. Creating a Screener

1. Open the Screener page.
2. Use the top bar screener dropdown and choose one of the built-in screeners:
- Day Gainers
- Day Losers
- Most Actives
- Undervalued Growth Stocks
- None (blank screener)
3. Add filters from the right sidebar.
4. Click **Save** in the top bar.
5. Enter a screener name and save it.

## 2. Adding Filters to a Screener

1. Open any screener (built-in, blank, or custom).
2. Use the right sidebar filter controls to add conditions such as:
- Ticker Symbol
- Industry
- Market Cap
- Price
- Volume
- EPS
- Debt-to-Equity
- Other fundamentals shown in the sidebar
3. Each filter immediately updates the stock results.
4. Use **Reset All Filters** to clear all currently applied filters.

## 3. Sorting Filtered Stocks by Data Points

1. In the screener results table, click a column header to sort by that data point.
2. Click the same header again to reverse the sort direction.
3. Common sortable fields include:
- Symbol
- Company Name
- Price
- EPS
- D/E Ratio
- 52W High / 52W Low
- 1 Day % Chg.
- Volume
- Market Cap
- Listed Date
- Industry
- P/E Ratio, PEG Ratio, Revenue/Share, P/S Ratio

## 4. Searching for a Stock with the Search Bar

1. Use the search bar in the app header (placeholder: **Search stocks...**).
2. Type a ticker or stock query.
3. Press Enter to open the search results page for that symbol/query.

## 5. Viewing a Stock and Using the Prediction Feature

1. From a screener table or search results, select a stock to open its stock detail page.
2. On the stock page, use the prediction action to request a model forecast.
3. The prediction response includes values such as:
- Predicted price
- Last close
- Predicted return metrics
- Model/version metadata
4. Use this estimate as a decision-support signal, not financial advice.

## Notes

- Screener filters and sorting are designed to work together: filter first, then sort.
- If a screener is shared, opening a share link can pre-load filters and sorting.
- Prediction availability depends on backend service status and valid market data for the selected ticker.
