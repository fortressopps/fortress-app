import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { completeOnboarding } from '../api/coreApi';
import './Onboarding.css';

const goals = [
  { id: 'Criar reserva de emergência', icon: '💰', label: 'Criar reserva de emergência' },
  { id: 'Sair das dívidas', icon: '📉', label: 'Sair das dívidas' },
  { id: 'Juntar para um objetivo grande', icon: '🏠', label: 'Juntar para um objetivo grande' },
  { id: 'Entender meus gastos', icon: '📊', label: 'Entender meus gastos' }
];

const categories = [
  { id: 'FOOD', icon: '🛒', label: 'Alimentação' },
  { id: 'TRANSPORT', icon: '🚗', label: 'Transporte' },
  { id: 'HEALTH', icon: '❤️', label: 'Saúde' },
  { id: 'ENTERTAINMENT', icon: '🎮', label: 'Entretenimento' },
  { id: 'SHOPPING', icon: '🛍️', label: 'Compras' }
];

export default function Onboarding() {
  const { refreshUser, user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    monthlyBudget: '',
    mainGoal: '',
    primaryCategory: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [demoData, setDemoData] = useState(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('fortress_demo_data');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Date.now() - parsed.savedAt < 1800000) {
          setDemoData(parsed);
        } else {
          localStorage.removeItem('fortress_demo_data');
        }
      }
    } catch {
      localStorage.removeItem('fortress_demo_data');
    }
  }, []);

  useEffect(() => {
    if (!demoData) return;
    if (demoData.income) {
      setFormData(prev => ({ ...prev, monthlyBudget: demoData.income }));
    }
    if (demoData.goal) {
      const match = goals.find(g => 
        demoData.goal.toLowerCase().includes(g.id.toLowerCase()) ||
        g.id.toLowerCase().includes(demoData.goal.toLowerCase())
      );
      if (match) {
        setFormData(prev => ({ ...prev, mainGoal: match.id }));
      }
    }
  }, [demoData]);

  const handleFinish = async () => {
    setLoading(true);
    setError(null);
    try {
      await completeOnboarding({
        monthlyBudget: Number(formData.monthlyBudget),
        mainGoal: formData.mainGoal,
        primaryCategory: formData.primaryCategory
      });
      await refreshUser();
      localStorage.removeItem('fortress_demo_data');
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao finalizar configuração');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="onboarding-page">
      <div className="onboarding-card card">
        <div className="onboarding-progress">
          <div
            className="onboarding-progress-bar"
            style={{ width: `${(step / 4) * 100}%` }}
          />
          <span>Passo {step} de 4</span>
        </div>

        {demoData && (
          <div className="onboarding-demo-banner animate-fade-in">
            <span className="onboarding-demo-emoji">{demoData.report.profileEmoji}</span>
            <div>
              <p className="onboarding-demo-title">
                Bem-vindo, {demoData.name}! Seu relatório foi salvo.
              </p>
              <p className="onboarding-demo-sub">
                Pré-preenchemos seus dados da análise. Confirme ou ajuste abaixo.
              </p>
            </div>
          </div>
        )}

        {error && <div className="onboarding-error">{error}</div>}

        {step === 1 && (
          <div className="onboarding-step">
            <h1 className="onboarding-title">Bem-vindo ao Fortress</h1>
            <p className="onboarding-subtitle">Vamos configurar sua fortaleza financeira em 3 minutos</p>
            <button className="btn btn-primary" onClick={() => setStep(2)}>Começar</button>
          </div>
        )}

        {step === 2 && (
          <div className="onboarding-step">
            <h2 className="onboarding-title">Qual é o seu orçamento mensal?</h2>
            <div className="onboarding-field">
              <input
                type="number"
                placeholder="R$ 0,00"
                className="onboarding-input"
                value={formData.monthlyBudget}
                onChange={e => setFormData(prev => ({ ...prev, monthlyBudget: e.target.value }))}
              />
            </div>
            <p className="onboarding-hint">Usaremos isso para calcular seus alertas e progresso</p>
            <button
              className="btn btn-primary"
              onClick={() => formData.monthlyBudget > 0 && setStep(3)}
              disabled={!formData.monthlyBudget || formData.monthlyBudget <= 0}
            >
              Continuar
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="onboarding-step">
            <h2 className="onboarding-title">Qual é seu principal objetivo financeiro?</h2>
            {demoData && (
              <div className="onboarding-insight-card animate-fade-in">
                <span className="onboarding-insight-label">DA SUA ANÁLISE</span>
                <p className="onboarding-insight-text">
                  {demoData.report.profileEmoji} {demoData.report.profileName} —{' '}
                  {demoData.report.mainAlert}
                </p>
              </div>
            )}
            <div className="onboarding-grid">
              {goals.map(goal => (
                <div
                  key={goal.id}
                  className={`onboarding-option card ${formData.mainGoal === goal.id ? 'active' : ''}`}
                  onClick={() => {
                    setFormData(prev => ({ ...prev, mainGoal: goal.id }));
                    setStep(4);
                  }}
                >
                  <span className="onboarding-option-icon">{goal.icon}</span>
                  <span className="onboarding-option-label">{goal.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="onboarding-step">
            <h2 className="onboarding-title">Com o que você mais gasta?</h2>
            <div className="onboarding-grid">
              {categories.map(cat => (
                <div
                  key={cat.id}
                  className={`onboarding-option card ${formData.primaryCategory === cat.id ? 'active' : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, primaryCategory: cat.id }))}
                >
                  <span className="onboarding-option-icon">{cat.icon}</span>
                  <span className="onboarding-option-label">{cat.label}</span>
                </div>
              ))}
            </div>
            <button
              className="btn btn-primary"
              style={{ marginTop: '24px' }}
              onClick={handleFinish}
              disabled={loading || !formData.primaryCategory}
            >
              {loading ? 'Finalizando...' : 'Finalizar configuração'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
