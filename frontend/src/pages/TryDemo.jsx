import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Sparkles, Check, AlertTriangle, ArrowRight, ArrowLeft 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
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

const EXPENSE_CATEGORIES = [
  { field: 'food',      label: 'Alimentação', icon: '🛒' },
  { field: 'transport', label: 'Transporte',  icon: '🚗' },
  { field: 'health',    label: 'Saúde',       icon: '❤️' },
  { field: 'leisure',   label: 'Lazer',       icon: '🎮' },
  { field: 'others',    label: 'Outros',      icon: '📦' },
];

export default function TryDemo() {
  const [step, setStep] = useState(1); // 1, 2, 3, 'loading', 'report', 'blocked', 'error'
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);
  const [msgIndex, setMsgIndex] = useState(0);
  const [currency, setCurrency] = useState(CURRENCIES[0]);
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    income: '5000',
    food: '1200',
    transport: '600',
    health: '300',
    leisure: '400',
    others: '200',
    goal: '',
    unexpected: ''
  });

  const loadingMessages = [
    "Kernel está analisando seus dados...",
    "Mapeando comportamentos financeiros...",
    "Calculando metas sustentáveis...",
    "Projetando sua independência...",
    "Finalizando seu relatório personalizado..."
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
    // 1. Regra: Se não tiver conta, mostrar animação e depois BLOQUEADO
    if (!user) {
      setStep('loading');
      setTimeout(() => {
        const demoData = {
          name: form.name,
          goal: form.goal,
          income: form.income,
          currency: {
            code: currency.code,
            symbol: currency.symbol,
            locale: currency.locale,
          },
          expenses: {
            food:      form.food      || '0',
            transport: form.transport || '0',
            health:    form.health    || '0',
            leisure:   form.leisure   || '0',
            others:    form.others    || '0',
          },
          savedAt: Date.now(),
        };
        localStorage.setItem('fortress_demo_data', JSON.stringify(demoData));
        setStep('blocked');
      }, 3000); // Animação de 3 segundos
      return;
    }

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
  const handleUnlock = () => {
    const demoData = {
      name: form.name,
      goal: form.goal,
      income: form.income,
      currency: {
        code: currency.code,
        symbol: currency.symbol,
        locale: currency.locale,
      },
      expenses: {
        food:      form.food      || '0',
        transport: form.transport || '0',
        health:    form.health    || '0',
        leisure:   form.leisure   || '0',
        others:    form.others    || '0',
      },
      report: {
        profileName:    report.profileName,
        profileEmoji:   report.profileEmoji,
        scoreLabel:     report.scoreLabel,
        savingsHealth:  report.savingsHealth,
        mainAlert:      report.mainAlert,
        goals:          report.goals,
      },
      savedAt: Date.now(),
    }
    localStorage.setItem('fortress_demo_data', JSON.stringify(demoData))
    navigate('/register')
  }

  const totalExpenses = EXPENSE_CATEGORIES.reduce((acc, cat) => acc + (Number(form[cat.field]) || 0), 0);
  const totalPct = form.income ? Math.round((totalExpenses / Number(form.income)) * 100) : 0;

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
                ✦ <em>Toda grande jornada começa com uma meta clara e um nome.</em>
              </div>
              <div className="try-field">
                <label className="try-label">COMO VOCÊ SE CHAMA?</label>
                <input
                  type="text"
                  className="try-input"
                  placeholder="Ex: Roberto"
                  value={form.name}
                  onChange={update('name')}
                  autoFocus
                />
              </div>
              <div className="try-field">
                <label className="try-label">QUAL É O SEU OBJETIVO FINANCEIRO?</label>
                <textarea 
                  className="try-input try-textarea"
                  placeholder="Ex: Quero viajar para Dubai em dezembro, juntar R$ 15.000 para entrada de um apartamento..."
                  value={form.goal}
                  onChange={update('goal')}
                />
              </div>
              <button 
                className="try-btn" 
                disabled={!form.goal.trim() || !form.name.trim()} 
                onClick={() => setStep(2)}
              >
                Próximo <ArrowRight size={18} />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="try-step-content animate-fade-in">
              <div className="try-motivation">
                💡 <em>{form.name}, entender para onde vai seu dinheiro é o primeiro passo para controlá-lo.</em>
              </div>
              <div className="try-field">
                <label className="try-label">RENDA MENSAL LÍQUIDA ({currency.code})</label>
                <div className="try-input-currency-wrapper">
                  <span className="try-input-prefix">{currency.symbol}</span>
                  <input 
                    type="text"
                    inputMode="numeric"
                    className="try-input try-input-with-prefix"
                    placeholder="0"
                    value={form.income === '' ? '' : formatCurrencyDisplay(form.income, currency.locale)}
                    onFocus={(e) => { e.target.value = form.income }}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/[^\d]/g, '');
                      update('income')({ target: { value: raw } });
                    }}
                    onBlur={(e) => { e.target.value = formatCurrencyDisplay(form.income, currency.locale) }}
                    autoFocus
                  />
                </div>
              </div>

              <label className="try-label">SUA DISTRIBUIÇÃO DE GASTOS</label>
              <div className="try-expenses-interactive">
                {EXPENSE_CATEGORIES.map(cat => {
                  const val = Number(form[cat.field] || 0);
                  const pct = form.income ? Math.round((val / Number(form.income)) * 100) : 0;
                  return (
                    <div key={cat.field} className="try-expense-row">
                      <div className="try-expense-header">
                        <span>{cat.icon} {cat.label}</span>
                        <span className={`try-expense-pct ${pct > 30 ? 'danger' : pct > 20 ? 'warning' : ''}`}>
                          {pct}%
                        </span>
                      </div>
                      <div className="try-expense-controls">
                        <input
                          type="range"
                          className="try-slider"
                          min="0"
                          max={Number(form.income) || 10000}
                          step="50"
                          value={val}
                          onChange={(e) => update(cat.field)({ target: { value: e.target.value } })}
                        />
                        <div className="try-input-currency-wrapper">
                          <span className="try-input-prefix">{currency.symbol}</span>
                          <input
                            type="text"
                            inputMode="numeric"
                            className="try-input try-input-with-prefix try-input-small"
                            placeholder="0"
                            value={form[cat.field] === '' ? '' : formatCurrencyDisplay(form[cat.field], currency.locale)}
                            onFocus={(e) => { e.target.value = form[cat.field] }}
                            onChange={(e) => {
                              const raw = e.target.value.replace(/[^\d]/g, '')
                              update(cat.field)({ target: { value: raw } })
                            }}
                            onBlur={(e) => { e.target.value = formatCurrencyDisplay(form[cat.field], currency.locale) }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="try-budget-bar">
                <div className="try-budget-bar-track">
                  <div
                    className={`try-budget-bar-fill ${totalPct > 100 ? 'over' : totalPct > 80 ? 'warning' : ''}`}
                    style={{ width: `${Math.min(totalPct, 100)}%` }}
                  />
                </div>
                <p className="try-budget-summary">
                  {currency.symbol}{formatCurrencyDisplay(totalExpenses, currency.locale)} alocados
                  · {currency.symbol}{formatCurrencyDisplay(Math.max(0, Number(form.income) - totalExpenses), currency.locale)} livres
                  · <strong style={{color: totalPct > 100 ? '#ef4444' : '#22c55e'}}>{totalPct}% da renda</strong>
                </p>
              </div>

              <div className="try-nav-row">
                <button className="try-btn-back" onClick={() => setStep(1)}>
                  <ArrowLeft size={18} /> Voltar
                </button>
                <button 
                  className="try-btn" 
                  disabled={!form.income.trim() || totalExpenses <= 0} 
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
                🎯 <em>Quase pronto, {form.name}. Um último detalhe que Kernel usará para sua segurança.</em>
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
                  "Gastos inesperados revelam vulnerabilidades financeiras. Kernel usará isso para desenhar sua reserva ideal."
                </p>
              </div>

              <div className="try-nav-row">
                <button className="try-btn-back" onClick={() => setStep(2)}>
                  <ArrowLeft size={18} /> Voltar
                </button>
                <button className="try-btn" onClick={handleAnalyze}>
                  Gerar Relatório Completo <Sparkles size={18} />
                </button>
              </div>
              <p className="try-disclaimer">Nenhum dado é armazenado. Análise gerada em tempo real pela IA Kernel.</p>
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

      {step === 'blocked' && (
        <div className="try-demo-card try-blocked-card animate-fade-in">
          <div className="try-locked-header">
            <div className="try-locked-icon-large">🔒</div>
            <h1 className="try-locked-title">🎉 Parabéns, {form.name}!</h1>
            <p className="try-locked-main-msg">Sua análise está pronta.</p>
          </div>
          
          <div className="try-report-preview-blurred">
             <div className="try-blurred-line" style={{ width: '80%' }}></div>
             <div className="try-blurred-line" style={{ width: '60%' }}></div>
             <div className="try-blurred-line" style={{ width: '90%' }}></div>
          </div>

          <div className="try-unlock-footer">
            <p className="try-unlock-text">
              Para desbloquear o relatório completo, basta criar sua conta gratuitamente.
            </p>
            <p className="try-welcome-text">Bem-vindo à Fortress, {form.name}!</p>
            <button className="try-btn try-btn-unlock" onClick={() => navigate('/register')}>
              Criar minha conta grátis
            </button>
          </div>
        </div>
      )}

      {step === 'report' && report && (
        <div className="try-demo-card try-report-card animate-fade-in">
          <div className="try-report-section">
            <label className="try-report-label">RESULTADO DA ANÁLISE — {form.name.toUpperCase()}</label>
            <div className="try-score-card">
              <div className="try-score-circle" data-health={report.savingsHealth}>
                <span className="try-score-number">{report.scoreLabel}</span>
                <span className="try-score-label">/ 100</span>
              </div>
              <div>
                <p className="try-profile-name">{report.profileEmoji} {report.profileName}</p>
                <p className="try-profile-desc">{report.profileDescription}</p>
              </div>
            </div>
          </div>

          <div className="try-report-section">
            <label className="try-report-label">DISTRIBUIÇÃO DE GASTOS</label>
            <div className="try-spending-bars">
              {EXPENSE_CATEGORIES.map(cat => {
                const val = Number(form[cat.field] || 0)
                const pct = form.income ? Math.round((val / Number(form.income)) * 100) : 0
                return (
                  <div key={cat.field} className="try-bar-row">
                    <span className="try-bar-label">{cat.icon} {cat.label}</span>
                    <div className="try-bar-track">
                      <div
                        className={`try-bar-fill ${pct > 30 ? 'danger' : pct > 20 ? 'warning' : 'ok'}`}
                        style={{ width: `${Math.min(pct * 2, 100)}%` }}
                      />
                    </div>
                    <span className="try-bar-pct">{pct}%</span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="try-report-section">
            <label className="try-report-label">INSIGHTS PRINCIPAIS</label>
            <div className="try-analysis-item">
              <span className="try-analysis-icon text-success">✓</span>
              <span>{report.spendingAnalysis.positive}</span>
            </div>
            <div className="try-analysis-item">
              <span className="try-analysis-icon text-warning">⚠</span>
              <span>{report.spendingAnalysis.warning}</span>
            </div>
          </div>

          <div className="try-report-section">
            <label className="try-report-label">META PRIORITÁRIA</label>
            {report.goals.slice(0, 1).map((g, i) => (
              <div key={i} className="try-goal-item">
                <div className="try-goal-title">🎯 {g.title}</div>
                <div className="try-goal-desc">{g.description}</div>
                <div className="try-goal-meta">
                  {currency.symbol}{formatCurrencyDisplay(g.monthlyAmount, currency.locale)}/mês · {g.timelineMonths} meses
                </div>
              </div>
            ))}
          </div>

          <div className="try-report-section">
            <div className="try-alert-card">🔔 {report.mainAlert}</div>
          </div>

          <div className="try-locked-section">

            {/* Título da seção bloqueada */}
            <div className="try-locked-header">
              <div className="try-locked-header-line" />
              <span className="try-locked-header-label">🔒 Conteúdo exclusivo</span>
              <div className="try-locked-header-line" />
            </div>

            {/* Preview borrado — metas 2 e 3 */}
            <div className="try-locked-blur-zone">

              {report.goals.slice(1).map((g, i) => (
                <div key={i} className="try-goal-item try-goal-item-blurred">
                  <div className="try-goal-title">{g.title}</div>
                  <div className="try-goal-desc">{g.description}</div>
                  <div className="try-goal-meta">
                    {currency.symbol}{g.monthlyAmount?.toLocaleString()}/mês · {g.timelineMonths} meses
                  </div>
                </div>
              ))}

              {report.lockedInsights?.map((insight, i) => (
                <div key={i} className="try-locked-insight-item">
                  <span className="try-locked-icon">💡</span>
                  <span className="try-locked-text">{insight}</span>
                </div>
              ))}

              {/* Overlay gradiente sobre o blur */}
              <div className="try-locked-gradient" />
            </div>

            {/* CTA de desbloqueio — fora do blur zone */}
            <div className="try-unlock-box">
              <div className="try-unlock-icon-row">
                <div className="try-unlock-icon-circle">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </div>
              </div>
              <p className="try-unlock-title">
                Seu relatório completo está pronto, {form.name}.
              </p>
              <p className="try-unlock-sub">
                {report.goals.length - 1} metas adicionais e {report.lockedInsights?.length || 3} insights exclusivos
                gerados especificamente para o seu perfil <strong>{report.profileEmoji} {report.profileName}</strong>.
              </p>
              <button className="try-cta-btn" onClick={handleUnlock}>
                Desbloquear relatório completo →
              </button>
              <p className="try-cta-sub">Gratuito. Sem cartão de crédito.</p>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
