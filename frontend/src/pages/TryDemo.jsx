import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Check, AlertTriangle, ArrowRight, ArrowLeft } from 'lucide-react';
import './TryDemo.css';

const CURRENCIES = [
  { code: 'BRL', symbol: 'R$',  locale: 'pt-BR', label: 'Real Brasileiro'     },
  { code: 'USD', symbol: '$',   locale: 'en-US', label: 'US Dollar'            },
  { code: 'EUR', symbol: '€',   locale: 'de-DE', label: 'Euro'                 },
  { code: 'GBP', symbol: '£',   locale: 'en-GB', label: 'British Pound'        },
  { code: 'JPY', symbol: '¥',   locale: 'ja-JP', label: 'Yen Japonês'          },
  { code: 'ARS', symbol: '$',   locale: 'es-AR', label: 'Peso Argentino'       },
  { code: 'CLP', symbol: '$',   locale: 'es-CL', label: 'Peso Chileno'         },
  { code: 'MXN', symbol: '$',   locale: 'es-MX', label: 'Peso Mexicano'        },
  { code: 'CAD', symbol: 'CA$', locale: 'en-CA', label: 'Canadian Dollar'      },
  { code: 'AUD', symbol: 'A$',  locale: 'en-AU', label: 'Australian Dollar'    },
];

export default function TryDemo() {
  const [step, setStep] = useState(1); // 1, 2, 3, 'loading', 'report', 'error'
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);
  const [msgIndex, setMsgIndex] = useState(0);
  const [currency, setCurrency] = useState(CURRENCIES[0]);

  const [form, setForm] = useState({
    income: '',
    food: '',
    transport: '',
    health: '',
    leisure: '',
    others: '',
    goal: '',
    unexpected: ''
  });

  const loadingMessages = [
    "Mapeando seu perfil financeiro...",
    "Identificando padrões de gasto...",
    "Calculando capacidade de economia...",
    "Gerando metas personalizadas...",
    "Preparando seu relatório..."
  ];

  useEffect(() => {
    let interval;
    if (step === 'loading') {
      interval = setInterval(() => {
        setMsgIndex(i => (i + 1) % loadingMessages.length);
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [step]);

  const update = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const formatCurrencyDisplay = (rawValue, currencyLocale) => {
    const num = parseFloat(rawValue);
    if (isNaN(num) || rawValue === '') return '';
    return new Intl.NumberFormat(currencyLocale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const handleAnalyze = async () => {
    setStep('loading');
    setError(null);
    try {
      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, currencyCode: currency.code, currencySymbol: currency.symbol })
      });
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      setReport(data);
      setStep('report');
    } catch (err) {
      console.error(err);
      setError('Não foi possível gerar a análise. Verifique sua conexão ou tente novamente.');
      setStep('error');
    }
  };

  const renderStepIndicator = () => (
    <div className="try-steps-indicator">
      {[1, 2, 3].map(s => (
        <div 
          key={s} 
          className={`try-step-dot ${step === s ? 'active' : ''} ${typeof step === 'number' && step > s ? 'done' : ''}`} 
        />
      ))}
    </div>
  );

  return (
    <div className="try-demo-page">
      <Link to="/" className="try-back-logo">FORTRESS</Link>

      {(step === 1 || step === 2 || step === 3) && (
        <div className="try-demo-card animate-fade-in">
          {renderStepIndicator()}

          {step === 1 && (
            <div className="try-step-content animate-fade-in">
              <div className="try-currency-row">
                <label className="try-label">QUAL MOEDA VOCÊ USA?</label>
                <div className="try-currency-grid">
                  {CURRENCIES.map(c => (
                    <button
                      key={c.code}
                      type="button"
                      className={`try-currency-btn ${currency.code === c.code ? 'active' : ''}`}
                      onClick={() => setCurrency(c)}
                    >
                      <span className="try-currency-symbol">{c.symbol}</span>
                      <span className="try-currency-code">{c.code}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="try-motivation">
                ✦ <em>Toda grande jornada começa com uma meta clara.</em>
              </div>
              <div className="try-field">
                <label className="try-label">QUAL É O SEU OBJETIVO FINANCEIRO?</label>
                <textarea 
                  className="try-input try-textarea"
                  placeholder="Ex: Quero viajar para Dubai em dezembro, juntar R$ 15.000 para entrada de um apartamento..."
                  value={form.goal}
                  onChange={update('goal')}
                  autoFocus
                />
              </div>
              <button 
                className="try-btn" 
                disabled={!form.goal.trim()} 
                onClick={() => setStep(2)}
              >
                Próximo <ArrowRight size={18} />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="try-step-content animate-fade-in">
              <div className="try-motivation">
                💡 <em>Entender para onde vai o dinheiro é o primeiro passo para controlá-lo.</em>
              </div>
              <div className="try-field">
                <label className="try-label">RENDA MENSAL LÍQUIDA (R$)</label>
                <div className="try-input-currency-wrapper">
                  <span className="try-input-prefix">{currency.symbol}</span>
                  <input 
                    type="text"
                    inputMode="numeric"
                    className="try-input try-input-with-prefix"
                    placeholder="0"
                    value={form.income === '' ? '' : formatCurrencyDisplay(form.income, currency.locale)}
                    onFocus={(e) => {
                      e.target.value = form.income;
                    }}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/[^\d]/g, '');
                      if (raw === '' || Number(raw) >= 0) {
                        update('income')({ target: { value: raw } });
                      }
                    }}
                    onBlur={(e) => {
                      e.target.value = formatCurrencyDisplay(form.income, currency.locale);
                    }}
                    autoFocus
                  />
                </div>
              </div>

              <label className="try-label">SEUS GASTOS MENSAIS ({currency.code})</label>
              <div className="try-expenses-grid">
                {['food', 'transport', 'health', 'leisure', 'others'].map(field => (
                  <div key={field} className="try-expense-item">
                    <label className="try-expense-label">
                      {field === 'food' ? 'Alimentação' : 
                       field === 'transport' ? 'Transporte' : 
                       field === 'health' ? 'Saúde' : 
                       field === 'leisure' ? 'Lazer' : 'Outros'}
                    </label>
                    <div className="try-input-currency-wrapper">
                      <span className="try-input-prefix">{currency.symbol}</span>
                      <input 
                        type="text"
                        inputMode="numeric"
                        className="try-input try-input-with-prefix"
                        placeholder="0"
                        value={form[field] === '' ? '' : formatCurrencyDisplay(form[field], currency.locale)}
                        onFocus={(e) => {
                          e.target.value = form[field];
                        }}
                        onChange={(e) => {
                          const raw = e.target.value.replace(/[^\d]/g, '');
                          if (raw === '' || Number(raw) >= 0) {
                            update(field)({ target: { value: raw } });
                          }
                        }}
                        onBlur={(e) => {
                          e.target.value = formatCurrencyDisplay(form[field], currency.locale);
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="try-nav-row">
                <button className="try-btn-back" onClick={() => setStep(1)}>
                  <ArrowLeft size={18} /> Voltar
                </button>
                <button 
                  className="try-btn" 
                  disabled={!form.income.trim()} 
                  onClick={() => setStep(3)}
                >
                  Próximo <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="try-step-content animate-fade-in">
              <div className="try-motivation">
                🎯 <em>Quase lá. Um último detalhe que faz toda a diferença na análise.</em>
              </div>
              <div className="try-field">
                <label className="try-label">TEVE ALGUM GASTO INESPERADO ESSE MÊS? (OPCIONAL)</label>
                <input 
                  type="text"
                  className="try-input"
                  placeholder="Ex: Conserto do carro R$ 800, consulta médica R$ 350..."
                  value={form.unexpected}
                  onChange={update('unexpected')}
                  autoFocus
                />
                <p className="try-field-hint">
                  "Gastos inesperados revelam vulnerabilidades financeiras. A IA usará isso para sugerir uma reserva de emergência personalizada."
                </p>
              </div>

              <div className="try-nav-row">
                <button className="try-btn-back" onClick={() => setStep(2)}>
                  <ArrowLeft size={18} /> Voltar
                </button>
                <button className="try-btn" onClick={handleAnalyze}>
                  Analisar com IA <ArrowRight size={18} />
                </button>
              </div>
              <p className="try-disclaimer">Nenhum dado é armazenado. Análise gerada em tempo real pela IA do Fortress.</p>
            </div>
          )}
        </div>
      )}

      {step === 'loading' && (
        <div className="try-loading animate-fade-in">
          <span className="try-loading-icon">✦</span>
          <p className="try-loading-msg">{loadingMessages[msgIndex]}</p>
        </div>
      )}

      {step === 'error' && (
        <div className="try-demo-card animate-fade-in">
          <div className="try-error">
            <p>{error}</p>
            <button className="try-retry-btn" onClick={() => setStep(1)}>Tentar novamente</button>
          </div>
        </div>
      )}

      {step === 'report' && report && (
        <div className="try-demo-card try-report-card animate-fade-in">
          <div className="try-report-section">
            <label className="try-report-label">SEU PERFIL FINANCEIRO</label>
            <h2 className="try-profile-name">{report.profileName}</h2>
            <p className="try-profile-desc">{report.profileDescription}</p>
          </div>

          <div className="try-report-section">
            <label className="try-report-label">ANÁLISE</label>
            <div className="try-analysis-item">
              <Check className="try-analysis-icon text-success" size={18} />
              <span>{report.spendingAnalysis.positive}</span>
            </div>
            <div className="try-analysis-item">
              <AlertTriangle className="try-analysis-icon text-warning" size={18} />
              <span>{report.spendingAnalysis.warning}</span>
            </div>
          </div>

          <div className="try-report-section">
            <label className="try-report-label">METAS RECOMENDADAS</label>
            {report.goals.map((g, i) => (
              <div key={i} className="try-goal-item">
                <h3 className="try-goal-title">{g.title}</h3>
                <p className="try-goal-desc">{g.description}</p>
                <span className="try-goal-meta">{currency.symbol} {g.monthlyAmount}/mês · {g.timelineMonths} meses</span>
              </div>
            ))}
          </div>

          <div className="try-report-section">
            <div className="try-alert-card">
              {report.mainAlert}
            </div>
          </div>

          <Link to="/register" className="try-cta-btn">
            Criar minha conta grátis →
          </Link>
          <p className="try-cta-sub">Veja isso aplicado aos seus dados reais</p>
        </div>
      )}
    </div>
  );
}
