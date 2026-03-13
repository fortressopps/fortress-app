import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  getSupermarketLists,
  createSupermarketList,
  getSupermarketListById,
  addSupermarketItem,
  updateSupermarketItem,
  deleteSupermarketItem,
  processReceipt,
} from '../api/coreApi';

import { ShoppingCart, ArrowLeft, Receipt } from 'lucide-react';
import './Supermarket.css';

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

  // Add item form state
  const [showAddItem, setShowAddItem] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', category: 'PRODUCE', estimatedPrice: '', quantity: 1 });
  const [addingItem, setAddingItem] = useState(false);

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
        listId: currentList.id,
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

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItem.name.trim()) return;
    const price = parseFloat(newItem.estimatedPrice);
    if (isNaN(price) || price < 0) { setError('Enter a valid price.'); return; }
    setAddingItem(true);
    setError(null);
    try {
      await addSupermarketItem(currentList.id, {
        name: newItem.name.trim(),
        category: newItem.category,
        estimatedPrice: price,
        quantity: Number(newItem.quantity) || 1,
      });
      setNewItem({ name: '', category: 'PRODUCE', estimatedPrice: '', quantity: 1 });
      setShowAddItem(false);
      // Refetch list detail
      const updated = await getSupermarketListById(currentList.id);
      setCurrentList(updated);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setAddingItem(false);
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

          <div className="supermarket-list-actions">
            <button
              className="btn btn-primary supermarket-add-btn"
              onClick={() => setShowAddItem(!showAddItem)}
            >
              + Add Item
            </button>
            <button
              className="btn btn-outline supermarket-process-btn"
              onClick={() => setProcessReceiptOpen(true)}
            >
              <Receipt size={18} />
              Process Receipt
            </button>
          </div>

          {showAddItem && (
            <form onSubmit={handleAddItem} className="card supermarket-add-form">
              <h3>Add Item</h3>
              <div className="supermarket-add-grid">
                <div className="supermarket-field">
                  <label>Item name *</label>
                  <input
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    placeholder="e.g. Milk"
                    required
                    autoFocus
                  />
                </div>
                <div className="supermarket-field">
                  <label>Category</label>
                  <select
                    value={newItem.category}
                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="supermarket-field">
                  <label>Est. Price (BRL)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={newItem.estimatedPrice}
                    onChange={(e) => setNewItem({ ...newItem, estimatedPrice: e.target.value })}
                    placeholder="0.00"
                    required
                  />
                </div>
                <div className="supermarket-field">
                  <label>Qty</label>
                  <input
                    type="number"
                    min="1"
                    value={newItem.quantity}
                    onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
                  />
                </div>
              </div>
              <div className="supermarket-add-actions">
                <button type="submit" className="btn btn-primary" disabled={addingItem}>
                  {addingItem ? 'Adding...' : 'Add Item'}
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => { setShowAddItem(false); setNewItem({ name: '', category: 'PRODUCE', estimatedPrice: '', quantity: 1 }); }}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
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

    </div>
  );
}
