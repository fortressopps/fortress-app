import React, { useEffect, useState, useCallback } from 'react';
import { getTransactions, createTransaction, deleteTransaction, getTransactionReport } from '../api/coreApi';
import { formatBRL } from '../utils/format';
import { Upload, FileDown } from 'lucide-react';
import ImportModal from '../components/ImportModal';
import { generatePDF } from '../utils/generatePDF';
import './Transactions.css';

const CATEGORIES = ['FOOD', 'TRANSPORT', 'HEALTH', 'ENTERTAINMENT', 'SHOPPING', 'SALARY', 'OTHER'];

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters
  const [page, setPage] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [exporting, setExporting] = useState(false);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    category: 'FOOD',
    description: '',
    date: new Date().toISOString().substring(0, 16),
  });
  const [filtersOpen, setFiltersOpen] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getTransactions({ page, limit: 10, category: categoryFilter || undefined });
      setTransactions(res.data || []);
      setMeta(res.meta);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  }, [page, categoryFilter]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this transaction?")) return;
    
    // Optimistic Update
    setTransactions(prev => prev.filter(t => t.id !== id));
    
    try {
      await deleteTransaction(id);
    } catch (err) {
      setError(err.message);
      loadData(); // Revert on failure
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const amountNum = parseFloat(formData.amount);
    if (isNaN(amountNum)) {
      setError("Invalid amount");
      setIsSubmitting(false);
      return;
    }

    try {
      await createTransaction({
        amount: amountNum,
        category: formData.category,
        description: formData.description,
        date: new Date(formData.date).toISOString(),
      });
      setShowModal(false);
      setFormData({ amount: '', category: 'FOOD', description: '', date: new Date().toISOString().substring(0, 16) });
      setPage(1); // Reset to first page to see new tx
      loadData();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      // Usar o filtro de categoria se existir, mas o relatório é focado no mês
      // Assumindo que o sistema foca no mês atual se não houver seletor explícito de mês no frontend ainda
      const monthStr = new Date().toISOString().slice(0, 7); 
      const data = await getTransactionReport(monthStr);
      await generatePDF(data);
    } catch (err) {
      setError("Falha ao gerar PDF: " + (err.response?.data?.error || err.message));
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="transactions-page">
      <header className="tx-header">
        <div>
          <h1>Transactions</h1>
          <p className="tx-header-sub">Manage your income and expenses.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-outline btn-filter-toggle" onClick={() => setFiltersOpen(!filtersOpen)}>
            {filtersOpen ? '✖ Close' : '⚙️ Filter'}
          </button>
          <button className="btn btn-outline" onClick={handleExport} disabled={exporting}>
            <FileDown size={18} style={{ marginRight: '8px' }} /> {exporting ? 'Generating...' : 'Export PDF'}
          </button>
          <button className="btn btn-outline" onClick={() => setShowImportModal(true)}>
            <Upload size={18} style={{ marginRight: '8px' }} /> Import CSV
          </button>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ New Transaction</button>
        </div>
      </header>

      {error && <div className="card tx-error" style={{ borderColor: '#ef4444', color: '#ef4444', marginBottom: '16px', padding: '12px' }}>{error}</div>}

      <div className={`card tx-filters ${filtersOpen ? 'open' : ''}`}>
        <select 
          value={categoryFilter} 
          onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
          className="tx-select"
        >
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        {/* Simple pagination controls */}
        <div className="tx-pagination">
          <button 
            disabled={page === 1 || loading} 
            onClick={() => setPage(p => p - 1)}
            className="btn btn-outline"
          >Prev</button>
          <span>Page {meta?.page || 1} of {meta?.totalPages || 1}</span>
          <button 
            disabled={!meta || page >= meta.totalPages || loading} 
            onClick={() => setPage(p => p + 1)}
            className="btn btn-outline"
          >Next</button>
        </div>
      </div>

      <div className="card tx-table-container">
        {loading && transactions.length === 0 ? (
           <div style={{ padding: '24px', textAlign: 'center' }}><div className="tx-spinner" /> Loading...</div>
        ) : transactions.length === 0 ? (
           <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>No transactions found.</div>
        ) : (
          <table className="tx-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Category</th>
                <th>Source</th>
                <th style={{ textAlign: 'right' }}>Amount</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(tx => (
                <tr key={tx.id}>
                  <td data-label="Date">{formatDate(tx.date)}</td>
                  <td data-label="Description">{tx.description}</td>
                  <td data-label="Category"><span className="tx-badge">{tx.category}</span></td>
                  <td data-label="Source"><span className="tx-badge source">{tx.source}</span></td>
                  <td data-label="Amount" style={{ textAlign: 'right' }} className={tx.amount < 0 ? 'text-danger' : 'text-success'}>
                    {formatBRL(tx.amount)}
                  </td>
                  <td data-label="Actions" style={{ textAlign: 'right' }}>
                    {tx.source === 'MANUAL' && (
                       <button onClick={() => handleDelete(tx.id)} className="btn btn-link text-danger" style={{ padding: 0 }}>Delete</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="tx-modal-overlay">
          <div className="card tx-modal-card">
            <h2>New Transaction</h2>
            <form onSubmit={handleCreate} className="tx-form">
              <div className="tx-field">
                <label>Description</label>
                <input 
                  required 
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})} 
                  placeholder="e.g. Salary, Groceries"
                />
              </div>
              <div className="tx-field">
                <label>Amount (BRL, use - for expenses)</label>
                <input 
                  required 
                  type="number" 
                  step="0.01" 
                  value={formData.amount} 
                  onChange={e => setFormData({...formData, amount: e.target.value})} 
                  placeholder="-150.00 or 5000.00"
                />
              </div>
              <div className="tx-field">
                <label>Category</label>
                <select 
                  value={formData.category} 
                  onChange={e => setFormData({...formData, category: e.target.value})}
                  className="tx-select"
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="tx-field">
                <label>Date</label>
                <input 
                  required 
                  type="datetime-local" 
                  value={formData.date} 
                  onChange={e => setFormData({...formData, date: e.target.value})} 
                />
              </div>
              <div className="tx-form-actions">
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Save'}
                </button>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ImportModal 
        isOpen={showImportModal} 
        onClose={() => setShowImportModal(false)}
        onSuccess={() => { setShowImportModal(false); setPage(1); loadData(); }}
      />
    </div>
  );
}
