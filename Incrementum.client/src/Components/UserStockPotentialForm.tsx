import { useState } from 'react';
import '../styles/UserStockPotentialForm.css';
import type { UserStockPotential } from '../hooks/useFetchUserStockPotentials.ts';
import {
  createUserStockPotential,
  updateUserStockPotential,
} from '../hooks/useUserStockPotentialsMutations';

interface UserStockPotentialFormProps {
  stockSymbol: string;
  apiKey: string;
  editingPotential?: UserStockPotential;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function UserStockPotentialForm({
  stockSymbol,
  apiKey,
  editingPotential,
  onSuccess,
  onCancel,
}: UserStockPotentialFormProps) {
  const [quantity, setQuantity] = useState(editingPotential?.quantity || '');
  const [purchasePrice, setPurchasePrice] = useState(editingPotential?.purchase_price || '');
  const [purchaseDate, setPurchaseDate] = useState(editingPotential?.purchase_date || '');
  const [screener, setScreener] = useState<string>(editingPotential?.screener?.toString() || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (editingPotential) {
        // Update existing
        await updateUserStockPotential(
          editingPotential.id,
          {
            quantity: parseFloat(quantity),
            purchase_price: purchasePrice ? parseFloat(purchasePrice) : undefined,
            purchase_date: purchaseDate,
            screener: screener ? parseInt(screener) : null,
          },
          apiKey
        );
      } else {
        // Create new
        await createUserStockPotential(
          {
            stock_symbol: stockSymbol,
            quantity: parseFloat(quantity),
            purchase_price: purchasePrice ? parseFloat(purchasePrice) : undefined,
            purchase_date: purchaseDate,
            screener: screener ? parseInt(screener) : null,
          },
          apiKey
        );
      }
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save potential');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="potential-form-overlay" onClick={onCancel}>
      <div className="potential-form-modal" onClick={(e) => e.stopPropagation()}>
        <div className="potential-form-header">
          <h2>{editingPotential ? 'Edit Potential' : 'Add New Potential'}</h2>
          <button
            className="potential-form-close"
            onClick={onCancel}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="potential-form">
          {error && <div className="potential-form-error">{error}</div>}

          <div className="form-group">
            <label htmlFor="purchase-date">Purchase Date *</label>
            <input
              id="purchase-date"
              type="date"
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="quantity">Quantity *</label>
            <input
              id="quantity"
              type="number"
              step="0.0001"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="0.0000"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="purchase-price">Purchase Price (Optional)</label>
            <input
              id="purchase-price"
              type="number"
              step="0.01"
              value={purchasePrice}
              onChange={(e) => setPurchasePrice(e.target.value)}
              placeholder="Leave empty to auto-fetch from history"
              disabled={loading}
            />
            <small className="form-helper-text">If empty, the price will be automatically fetched from historical data</small>
          </div>

          <div className="form-group">
            <label htmlFor="screener">Screener (Optional)</label>
            <input
              id="screener"
              type="number"
              value={screener}
              onChange={(e) => setScreener(e.target.value)}
              placeholder="Screener ID"
              disabled={loading}
            />
          </div>

          <div className="potential-form-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
