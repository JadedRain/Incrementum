import '../styles/UserStockPotentialsTable.css';
import { useState } from 'react';
import type { UserStockPotential } from "/mnt/c/Users/pokre/Incrementum/Incrementum.client/src/hooks/useFetchUserStockPotentials"
import { formatCurrency, formatPercentage } from '../utils/formatUtils';
import Loading from './Loading';
import UserStockPotentialForm from './UserStockPotentialForm';
import { deleteUserStockPotential } from '../hooks/useUserStockPotentialsMutations';
import Toast from './Toast';

interface UserStockPotentialsTableProps {
  potentials: UserStockPotential[];
  loading: boolean;
  error: string | null;
  stockSymbol: string;
  apiKey: string | null;
  onRefresh: () => void;
}

export default function UserStockPotentialsTable({
  potentials,
  loading,
  error,
  stockSymbol,
  apiKey,
  onRefresh,
}: UserStockPotentialsTableProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingPotential, setEditingPotential] = useState<UserStockPotential | undefined>();
  const [toast, setToast] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);

  const handleEdit = (potential: UserStockPotential) => {
    setEditingPotential(potential);
    setShowForm(true);
  };

  const handleAddNew = () => {
    setEditingPotential(undefined);
    setShowForm(true);
  };

  const handleDelete = async (potentialId: number) => {
    if (!apiKey) return;
    if (!confirm('Are you sure you want to delete this holding?')) return;

    setDeleting(potentialId);
    try {
      await deleteUserStockPotential(potentialId, apiKey);
      setToast('Holding deleted successfully');
      onRefresh();
    } catch (err) {
      setToast('Failed to delete holding');
      console.error(err);
    } finally {
      setDeleting(null);
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingPotential(undefined);
    setToast(editingPotential ? 'Holding updated successfully' : 'Holding added successfully');
    onRefresh();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingPotential(undefined);
  };

  if (loading) {
    return <Loading loading={true} />;
  }

  if (error) {
    return (
      <div className="user-potentials-error">
        <p>{error}</p>
      </div>
    );
  }

  const isEmpty = potentials.length === 0;

  // Calculate totals only if there are potentials
  const totalQuantity = isEmpty ? 0 : potentials.reduce((sum, p) => sum + parseFloat(p.quantity), 0);
  const totalInvested = isEmpty ? 0 : potentials.reduce(
    (sum, p) => sum + parseFloat(p.quantity) * parseFloat(p.purchase_price),
    0
  );
  const totalDifference = isEmpty ? 0 : potentials.reduce((sum, p) => sum + parseFloat(p.difference), 0);
  const averagePrice = totalQuantity === 0 ? 0 : totalInvested / totalQuantity;
  const returnPercentage = totalInvested === 0 ? 0 : (totalDifference / totalInvested) * 100;

  return (
    <div className="user-potentials-container">
      <Toast message={toast} />

      <div className="user-potentials-header">
        <h3>Your {isEmpty ? '' : potentials[0]?.stock_symbol} Holdings</h3>
        <button
          className="btn-add-potential"
          onClick={handleAddNew}
          disabled={!apiKey}
        >
          + Add Holding
        </button>
      </div>

      {isEmpty ? (
        <div className="user-potentials-empty">
          <p>No stock purchases found for this stock</p>
          <p className="user-potentials-empty-hint">Click "Add Holding" to track your purchases</p>
        </div>
      ) : (
        <div className="user-potentials-table-wrapper">
          <table className="user-potentials-table">
            <thead>
              <tr>
                <th>Purchase Date</th>
                <th>Quantity</th>
                <th>Purchase Price</th>
                <th>Total Invested</th>
                <th>Current Difference</th>
                <th>Change %</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {potentials.map((potential) => {
                const totalInvestedForRow =
                  parseFloat(potential.quantity) * parseFloat(potential.purchase_price);
                const changePercent = (parseFloat(potential.difference) / totalInvestedForRow) * 100;

                return (
                  <tr key={potential.id}>
                    <td>{new Date(potential.purchase_date).toLocaleDateString()}</td>
                    <td className="number-cell">{parseFloat(potential.quantity).toFixed(4)}</td>
                    <td className="number-cell">{formatCurrency(parseFloat(potential.purchase_price))}</td>
                    <td className="number-cell">
                      {formatCurrency(totalInvestedForRow)}
                    </td>
                    <td className={`number-cell ${parseFloat(potential.difference) >= 0 ? 'positive' : 'negative'}`}>
                      {formatCurrency(parseFloat(potential.difference))}
                    </td>
                    <td className={`number-cell ${changePercent >= 0 ? 'positive' : 'negative'}`}>
                      {formatPercentage(changePercent)}
                    </td>
                    <td className="actions-cell">
                      <button
                        className="btn-action btn-edit"
                        onClick={() => handleEdit(potential)}
                        disabled={!apiKey}
                        title="Edit"
                      >
                        ✎
                      </button>
                      <button
                        className="btn-action btn-delete"
                        onClick={() => handleDelete(potential.id)}
                        disabled={!apiKey || deleting === potential.id}
                        title="Delete"
                      >
                        {deleting === potential.id ? '...' : '✕'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="totals-row">
                <td colSpan={1} className="totals-label">
                  <strong>TOTALS</strong>
                </td>
                <td className="number-cell">
                  <strong>{totalQuantity.toFixed(4)}</strong>
                </td>
                <td className="number-cell">
                  <strong>{formatCurrency(averagePrice)}</strong>
                </td>
                <td className="number-cell">
                  <strong>{formatCurrency(totalInvested)}</strong>
                </td>
                <td className={`number-cell ${totalDifference >= 0 ? 'positive' : 'negative'}`}>
                  <strong>{formatCurrency(totalDifference)}</strong>
                </td>
                <td className={`number-cell ${returnPercentage >= 0 ? 'positive' : 'negative'}`}>
                  <strong>{formatPercentage(returnPercentage)}</strong>
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {showForm && apiKey && (
        <UserStockPotentialForm
          stockSymbol={stockSymbol}
          apiKey={apiKey}
          editingPotential={editingPotential}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      )}
    </div>
  );
}
