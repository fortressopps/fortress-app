import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../hooks/useLang';
import { LanguageSelector } from '../components/LanguageSelector';
import './Landing.css';

export default function Landing() {
  const { lang, setLang, t } = useLang();

  useEffect(() => {
    const nav = document.querySelector('.landing-navbar');
    const onScroll = () => {
      if (window.scrollY > 20) nav?.classList.add('scrolled');
      else nav?.classList.remove('scrolled');
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const htmlLangMap = {
      en: 'en', ptBR: 'pt-BR', de: 'de',
      ru: 'ru', es: 'es', zh: 'zh', ja: 'ja'
    }
    document.documentElement.lang = htmlLangMap[lang] || 'en'
  }, [lang])

  return (
    <div className="landing-page">
      {/* Seção 1 — Navbar */}
      <nav className="landing-navbar">
        <div className="landing-navbar-inner">
          <span className="landing-logo">FORTRESS</span>
          <div className="landing-nav-actions">
            <LanguageSelector currentLang={lang} onSelect={setLang} />
            <Link to="/login" className="landing-nav-link">{t.signIn}</Link>
            <Link to="/register" className="landing-nav-cta">{t.joinNow}</Link>
          </div>
        </div>
      </nav>

      {/* Seção 2 — Hero */}
      <section className="landing-hero">
        <div className="hero-grid-bg" aria-hidden="true" />
        <div className="hero-content">
          <div className="hero-badge">{t.heroBadge}</div>
          <h1 className="hero-title">
            {t.heroTitle.split('\n').map((line, i) => (
              <span key={i}>{line}{i === 0 && <br />}</span>
            ))}
          </h1>
          <p className="hero-subtitle">{t.heroSubtitle}</p>
          <div className="hero-ctas">
            <Link to="/register" className="hero-cta-primary">{t.heroGetStarted}</Link>
            <Link to="/try" className="hero-cta-secondary">{t.heroTryDemo}</Link>
          </div>
          <div className="hero-social-proof">
            <div className="hero-avatars">
              {['A','B','C','D','E'].map((l, i) => (
                <div key={i} className="hero-avatar" style={{ zIndex: 5 - i }}>
                  {l}
                </div>
              ))}
            </div>
            <span className="hero-proof-text">
              <strong>{t.heroSocialProof}</strong>
              <span className="hero-stars">★★★★★</span>
            </span>
          </div>
        </div>
      </section>

      {/* Seção 3 — Features */}
      <section className="landing-section" id="features">
        <div className="landing-container">
          <h2 className="section-title">
            {t.featuresTitle.split('\n').map((line, i) => (
              <span key={i}>{line}{i === 0 && <br />}</span>
            ))}
          </h2>
          <div className="features-grid">
            {[
              { icon: '🧠', title: t.feature1Title, desc: t.feature1Desc },
              { icon: '📊', title: t.feature2Title, desc: t.feature2Desc },
              { icon: '🔒', title: t.feature3Title, desc: t.feature3Desc }
            ].map((f, i) => (
              <div key={i} className="feature-card">
                <span className="feature-icon">{f.icon}</span>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Seção 4 — Como funciona */}
      <section className="landing-section landing-section-alt">
        <div className="landing-container">
          <h2 className="section-title">{t.stepsTitle}</h2>
          <div className="steps-row">
            {[
              { n: '01', title: t.step1Title, desc: t.step1Desc },
              { n: '02', title: t.step2Title, desc: t.step2Desc },
              { n: '03', title: t.step3Title, desc: t.step3Desc }
            ].map((s, i) => (
              <div key={i} className="step-item">
                <div className="step-number">{s.n}</div>
                <h3 className="step-title">{s.title}</h3>
                <p className="step-desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Seção 5 — Pricing */}
      <section className="landing-section" id="pricing">
        <div className="landing-container">
          <h2 className="section-title">
            {t.pricingTitle.split('\n').map((line, i) => (
              <span key={i}>{line}{i === 0 && <br />}</span>
            ))}
          </h2>
          <p className="section-subtitle">{t.pricingSubtitle}</p>
          <div className="pricing-grid">

            <div className="pricing-card">
              <div className="pricing-tier">SENTINEL</div>
              <div className="pricing-price">R$ 0<span>{t.pricingPerMonth}</span></div>
              <ul className="pricing-features">
                <li>✓ {t.pricingF1}</li>
                <li>✓ {t.pricingF2}</li>
                <li>✓ {t.pricingF3}</li>
                <li>✓ {t.pricingF4}</li>
                <li>✓ {t.pricingAILimit5}</li>
                <li className="pricing-unavailable">— {t.pricingF5}</li>
                <li className="pricing-unavailable">— {t.pricingF6}</li>
                <li className="pricing-unavailable">— {t.pricingF7}</li>
                <li className="pricing-unavailable">— {t.pricingF8}</li>
              </ul>
              <Link to="/register" className="pricing-btn pricing-btn-ghost">{t.pricingBtnFree}</Link>
            </div>

            <div className="pricing-card pricing-card-featured">
              <div className="pricing-popular-badge">{t.pricingMostPopular}</div>
              <div className="pricing-tier">VANGUARD</div>
              <div className="pricing-price">
                {t.pricingVanguardSymbol} {t.pricingVanguardValue}<span>{t.pricingPerMonth}</span>
              </div>
              <ul className="pricing-features">
                <li>✓ {t.pricingF1} ({t.pricingFree})</li>
                <li>✓ {t.pricingF5}</li>
                <li>✓ {t.pricingF6}</li>
                <li>✓ {t.pricingF7}</li>
                <li>✓ {t.pricingF8}</li>
                <li>✓ {t.pricingAILimit200}</li>
                <li className="pricing-unavailable">— {t.pricingF9}</li>
              </ul>
              <Link to="/register" className="pricing-btn pricing-btn-primary">{t.pricingBtnPro}</Link>
            </div>

            <div className="pricing-card">
              <div className="pricing-tier">LEGACY</div>
              <div className="pricing-price">
                {t.pricingCustom}
                <span style={{ display: 'block', fontSize: '0.8rem', fontWeight: 400, color: 'var(--text-secondary)', marginTop: '4px' }}>
                  {t.pricingContactSub}
                </span>
              </div>
              <ul className="pricing-features">
                <li>✓ {t.pricingF1} ({t.pricingBtnPro})</li>
                <li>✓ {t.pricingF9}</li>
                <li>✓ {t.pricingF10}</li>
                <li>✓ {t.pricingF11}</li>
              </ul>
              <a href="mailto:hello@fortress.app" className="pricing-btn pricing-btn-ghost">{t.pricingBtnEnterprise}</a>
            </div>

          </div>
        </div>
      </section>

      {/* Seção 6 — CTA Final */}
      <section className="landing-section landing-section-alt landing-cta-final">
        <div className="landing-container" style={{ textAlign: 'center' }}>
          <h2 className="section-title">
            {t.ctaTitle.split('\n').map((line, i) => (
              <span key={i}>{line}{i === 0 && <br />}</span>
            ))}
          </h2>
          <p className="hero-subtitle" style={{ margin: '0 auto 2rem' }}>
            {t.ctaSubtitle}
          </p>
          <Link to="/register" className="cta-final-btn">
            {t.ctaBtn}
          </Link>
        </div>
      </section>

      {/* Seção 7 — Footer */}
      <footer className="landing-footer">
        <div className="landing-container">
          <div className="footer-grid">
            <div>
              <div className="landing-logo" style={{ marginBottom: '0.5rem' }}>FORTRESS</div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>
                {t.footerTagline}
              </p>
            </div>
            <div className="footer-links">
              <a href="#features">{t.footerLinks}</a>
              <a href="#pricing">{t.footerPricing}</a>
              <Link to="/login">{t.signIn}</Link>
              <Link to="/register">{t.joinNow}</Link>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', margin: '0 0 4px' }}>
                {t.footerRights}
              </p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', margin: 0 }}>
                {t.footerNoAds}
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
