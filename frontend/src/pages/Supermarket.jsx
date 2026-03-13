import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  getSupermarketLists,
  createSupermarketList,
  getSupermarketListById,
  updateSupermarketItem,
  deleteSupermarketItem,
  processReceipt,
} from '../api/coreApi';
import { ShoppingCart, ArrowLeft, Receipt } from 'lucide-react';

const CATEGORIES = [
  'PRODUCE', 'DAIRY', 'MEAT', 'BAKERY', 'FROZEN', 'BEVERAGES',
  'PANTRY', 'CLEANING', 'HYGIENE', 'HOME', 'PETS', 'PHARMACY', 'FITNESS', 'OTHER',
];

function formatBRL(val) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(val || 0);
}

function formatDate(d) {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export default function Supermarket() {
  const { listId } = useParams();
  const [lists, setLists] = useState([]);
  const [currentList, setCurrentList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNewList, setShowNewList] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [processReceiptOpen, setProcessReceiptOpen] = useState(false);
  const [receiptTotal, setReceiptTotal] = useState('');
  const [receiptCategory, setReceiptCategory] = useState('PRODUCE');
  const [receiptSubmitting, setReceiptSubmitting] = useState(false);

  const loadLists = () => {
    getSupermarketLists()
      .then((data) => {
        const items = data?.items ?? data?.lists ?? (Array.isArray(data) ? data : []);
        setLists(Array.isArray(items) ? items : []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(loadLists, []);

  useEffect(() => {
    if (!listId) {
      setCurrentList(null);
      return;
    }
    getSupermarketListById(listId)
      .then(setCurrentList)
      .catch(() => setCurrentList(null));
  }, [listId]);

  const handleCreateList = async (e) => {
    e.preventDefault();
    if (!newListName.trim()) return;
    try {
      await createSupermarketList({ name: newListName.trim() });
      setNewListName('');
      setShowNewList(false);
      loadLists();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleTogglePurchased = async (item) => {
    try {
      const updated = await updateSupermarketItem(
        currentList.id,
        item.id,
        { purchased: !item.purchased }
      );
      setCurrentList((prev) => ({
        ...prev,
        items: prev.items.map((i) => (i.id === item.id ? updated : i)),
      }));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('Remove this item?')) return;
    try {
      await deleteSupermarketItem(currentList.id, itemId);
      setCurrentList((prev) => ({
        ...prev,
        items: prev.items.filter((i) => i.id !== itemId),
      }));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleProcessReceipt = async (e) => {
    e.preventDefault();
    const totalCents = Math.round(parseFloat(receiptTotal || 0) * 100);
    if (totalCents <= 0) return;
    setReceiptSubmitting(true);
    try {
      await processReceipt({
        total: totalCents,
        category: receiptCategory,
        projectedTotal: 100000,
        average: 5000,
      });
      setProcessReceiptOpen(false);
      setReceiptTotal('');
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setReceiptSubmitting(false);
    }
  };

  // List detail view
  if (listId && currentList) {
    const items = currentList.items || [];
    const totalSpent = items.reduce(
      (s, i) => s + (i.actualPrice ?? i.estimatedPrice ?? 0) * (i.quantity ?? 1),
      0
    );

    return (
      <div className="supermarket-page">
        <header className="supermarket-header">
          <Link to="/supermarket" className="supermarket-back">
            <ArrowLeft size={20} /> Back
          </Link>
          <h1>{currentList.name}</h1>
        </header>

        {error && <div className="supermarket-error">{error}</div>}

        <div className="supermarket-list-detail">
          <div className="supermarket-list-stats">
            <span>{items.length} items</span>
            <span>{formatBRL(totalSpent)} total</span>
          </div>

          <div className="supermarket-items">
            {items.length === 0 ? (
              <p className="supermarket-empty">No items in this list.</p>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className={`supermarket-item-row ${item.purchased ? 'purchased' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={!!item.purchased}
                    onChange={() => handleTogglePurchased(item)}
                  />
                  <div className="supermarket-item-info">
                    <span className="supermarket-item-name">{item.name}</span>
                    <span className="supermarket-item-meta">
                      {item.category} · {formatBRL(item.actualPrice ?? item.estimatedPrice)}
                      {(item.quantity ?? 1) > 1 && ` × ${item.quantity}`}
                    </span>
                  </div>
                  <button
                    className="supermarket-item-delete"
                    onClick={() => handleDeleteItem(item.id)}
                  >
                    Delete
                  </button>
                </div>
              ))
            )}
          </div>

          <button
            className="btn btn-primary supermarket-process-btn"
            onClick={() => setProcessReceiptOpen(true)}
          >
            <Receipt size={18} />
            Process Receipt
          </button>
        </div>

        {processReceiptOpen && (
          <div className="supermarket-receipt-modal">
            <div className="card supermarket-receipt-card">
              <h2>Process Receipt</h2>
              <form onSubmit={handleProcessReceipt}>
                <div className="supermarket-field">
                  <label>Total (BRL)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={receiptTotal}
                    onChange={(e) => setReceiptTotal(e.target.value)}
                    placeholder="e.g. 150.00"
                    required
                  />
                </div>
                <div className="supermarket-field">
                  <label>Category</label>
                  <select
                    value={receiptCategory}
                    onChange={(e) => setReceiptCategory(e.target.value)}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="supermarket-receipt-actions">
                  <button type="submit" className="btn btn-primary" disabled={receiptSubmitting}>
                    {receiptSubmitting ? 'Processing...' : 'Process'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setProcessReceiptOpen(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <style>{`
          .supermarket-back {
            display: inline-flex;
            text-decoration: none;
            align-items: center;
            gap: 8px;
            color: var(--text-secondary);
            font-size: 14px;
            margin-bottom: 12px;
          }
          .supermarket-back:hover { color: var(--primary); }
          .supermarket-list-detail { margin-top: 24px; }
          .supermarket-list-stats {
            display: flex;
            gap: 24px;
            margin-bottom: 20px;
            color: var(--text-secondary);
            font-size: 14px;
          }
          .supermarket-items { margin-bottom: 24px; }
          .supermarket-empty { color: var(--text-secondary); padding: 24px; }
          .supermarket-item-row {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px;
            border: 1px solid var(--card-border);
            border-radius: var(--radius-btn);
            margin-bottom: 8px;
          }
          .supermarket-item-row.purchased .supermarket-item-name { text-decoration: line-through; opacity: 0.6; }
          .supermarket-item-info { flex: 1; display: flex; flex-direction: column; gap: 2px; }
          .supermarket-item-name { font-weight: 500; }
          .supermarket-item-meta { font-size: 12px; color: var(--text-secondary); }
          .supermarket-item-delete {
            background: none;
            border: none;
            color: #ef4444;
            cursor: pointer;
            font-size: 12px;
          }
          .supermarket-process-btn { display: inline-flex; align-items: center; gap: 8px; }
          .supermarket-receipt-modal {
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 200;
            padding: 24px;
          }
          .supermarket-receipt-card {
            padding: 24px;
            max-width: 400px;
            width: 100%;
          }
          .supermarket-receipt-card h2 { margin-bottom: 20px; }
          .supermarket-field { margin-bottom: 16px; }
          .supermarket-field label {
            display: block;
            font-size: 12px;
            color: var(--text-secondary);
            margin-bottom: 6px;
          }
          .supermarket-field input, .supermarket-field select {
            width: 100%;
            padding: 10px 14px;
            background: #1a1a1a;
            border: 1px solid var(--card-border);
            border-radius: var(--radius-btn);
            color: var(--text);
          }
          .supermarket-receipt-actions { display: flex; gap: 12px; margin-top: 20px; }
        `}</style>
      </div>
    );
  }

  // Lists view
  if (loading) {
    return (
      <div className="supermarket-loading">
        <div className="supermarket-spinner" />
        <p>Loading lists...</p>
      </div>
    );
  }

  return (
    <div className="supermarket-page">
      <header className="supermarket-header">
        <h1>My Lists</h1>
        <button className="btn btn-primary" onClick={() => setShowNewList(!showNewList)}>
          New List
        </button>
      </header>

      {error && <div className="supermarket-error">{error}</div>}

      {showNewList && (
        <form onSubmit={handleCreateList} className="card supermarket-new-form">
          <input
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            placeholder="List name"
            autoFocus
          />
          <div className="supermarket-new-actions">
            <button type="submit" className="btn btn-primary">Create</button>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => { setShowNewList(false); setNewListName(''); }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="supermarket-grid">
        {lists.length === 0 && !showNewList ? (
          <div className="card supermarket-empty">
            <ShoppingCart size={48} className="supermarket-empty-icon" />
            <h3>No lists yet</h3>
            <p>Create your first shopping list.</p>
            <button className="btn btn-primary" onClick={() => setShowNewList(true)}>
              New List
            </button>
          </div>
        ) : (
          lists.map((list) => {
            const count = list.items?.length ?? '—';
            const updated = list.updatedAt || list.createdAt;
            return (
              <Link
                key={list.id}
                to={`/supermarket/${list.id}`}
                className="card supermarket-list-card"
              >
                <h3>{list.name}</h3>
                <p>{count === '—' ? 'View list' : `${count} items`}</p>
                <p className="supermarket-list-date">Updated {formatDate(updated)}</p>
              </Link>
            );
          })
        )}
      </div>

      <style>{`
        .supermarket-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 200px;
          gap: 16px;
          color: var(--text-secondary);
        }
        .supermarket-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid var(--card-border);
          border-top-color: var(--primary);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .supermarket-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .supermarket-header h1 { font-size: 1.5rem; }
        .supermarket-error {
          padding: 12px;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: var(--radius-btn);
          color: #ef4444;
          margin-bottom: 24px;
        }
        .supermarket-new-form {
          padding: 20px;
          margin-bottom: 24px;
          display: flex;
          gap: 12px;
          align-items: center;
        }
        .supermarket-new-form input {
          flex: 1;
          padding: 10px 14px;
          background: #1a1a1a;
          border: 1px solid var(--card-border);
          border-radius: var(--radius-btn);
          color: var(--text);
        }
        .supermarket-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 24px;
        }
        .supermarket-list-card {
          padding: 24px;
          text-decoration: none;
          color: inherit;
          display: block;
          transition: border-color 0.2s;
        }
        .supermarket-list-card:hover { border-color: var(--primary); }
        .supermarket-list-card h3 { margin-bottom: 8px; }
        .supermarket-list-card p { color: var(--text-secondary); font-size: 14px; }
        .supermarket-list-date { font-size: 12px; margin-top: 4px; }
        .supermarket-empty {
          grid-column: 1 / -1;
          padding: 48px;
          text-align: center;
        }
        .supermarket-empty-icon { color: var(--text-secondary); margin-bottom: 16px; opacity: 0.5; }
        .supermarket-empty h3 { margin-bottom: 8px; }
        .supermarket-empty p { color: var(--text-secondary); margin-bottom: 20px; }
      `}</style>
    </div>
  );
}
