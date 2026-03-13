import React, { useState, useRef } from 'react';
import { Upload, X, FileText } from 'lucide-react';
import { importTransactions } from '../api/coreApi';
import './ImportModal.css';

export default function ImportModal({ isOpen, onClose, onSuccess }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFile = (selectedFile) => {
    setError(null);
    setResult(null);
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.csv') && selectedFile.type !== 'text/csv') {
      setError('Apenas arquivos .csv são suportados.');
      return;
    }
    
    if (selectedFile.size > 2 * 1024 * 1024) {
      setError('O arquivo deve ter no máximo 2MB.');
      return;
    }

    setFile(selectedFile);

    // Read first 5 lines for preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const lines = text.split(/\r?\n/).filter(l => l.trim());
      setPreview(lines.slice(0, 5));
    };
    reader.readAsText(selectedFile);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    handleFile(droppedFile);
  };

  const handleImport = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await importTransactions(formData);
      setResult(res);
      setFile(null);
      setPreview([]);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setFile(null);
    setPreview([]);
    setError(null);
    setResult(null);
    onClose();
  };

  return (
    <div className="import-modal-overlay">
      <div className="card import-modal-card">
        <div className="import-modal-header">
          <h2>Import CSV</h2>
          <button className="import-btn-close" onClick={reset} disabled={loading}><X size={20} /></button>
        </div>

        {error && <div className="import-error">{error}</div>}

        {result ? (
          <div className="import-result text-center">
            <h3>Importação concluída!</h3>
            <p className="text-success">{result.imported} registros carregados com sucesso.</p>
            {result.skipped > 0 && <p className="text-warning">{result.skipped} registros ignorados.</p>}
            {result.errors.length > 0 && (
              <div className="import-error-list">
                {result.errors.slice(0, 5).map((e, i) => <div key={i}>{e}</div>)}
                {result.errors.length > 5 && <div>e outros {result.errors.length - 5} erros ocultos.</div>}
              </div>
            )}
            <button className="btn btn-primary mt-4" onClick={reset}>Fechar</button>
          </div>
        ) : !file ? (
          <div 
            className="import-drop-zone"
            onDragOver={e => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={40} className="import-upload-icon" />
            <p>Arraste e solte o CSV aqui</p>
            <span className="import-drop-sub">ou clique para selecionar (máximo 2MB)</span>
            <span className="import-drop-sub text-warning" style={{ marginTop: '16px', color: '#eab308' }}>⚠️ Nota: Evite usar vírgulas nas descrições de suas transações para não quebrar a importação.</span>
            <input 
              type="file" 
              accept=".csv" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              onChange={e => handleFile(e.target.files[0])} 
            />
          </div>
        ) : (
          <div className="import-preview-zone">
            <div className="import-file-meta">
              <FileText size={20} />
              <span>{file.name}</span>
              <button className="btn btn-link text-danger" onClick={() => setFile(null)} disabled={loading}>Remover</button>
            </div>
            
            <div className="import-preview-content">
              <strong>Preview:</strong>
              <pre>{preview.join('\n')}</pre>
            </div>

            {loading && (
               <div className="import-progress-bg">
                 <div className="import-progress-fill import-progress-anim" />
               </div>
            )}

            <div className="import-actions">
              <button className="btn btn-primary" onClick={handleImport} disabled={loading}>
                {loading ? 'Importando...' : 'Confirmar Importação'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
