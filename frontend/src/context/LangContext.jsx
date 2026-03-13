import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { LANDING_TRANSLATIONS, detectLanguage } from '../locales/landing';

const LangContext = createContext();

export const LangProvider = ({ children }) => {
  const [lang, setLangState] = useState(detectLanguage);

  const setLang = useCallback((code) => {
    localStorage.setItem('fortress_lang', code);
    setLangState(code);
  }, []);

  // For now, we use the landing translations. 
  // In a real scenario, this would merge with other page translations.
  const t = LANDING_TRANSLATIONS[lang] || LANDING_TRANSLATIONS.en;

  useEffect(() => {
    const htmlLangMap = {
      en: 'en', ptBR: 'pt-BR', de: 'de',
      ru: 'ru', es: 'es', zh: 'zh', ja: 'ja'
    };
    document.documentElement.lang = htmlLangMap[lang] || 'en';
  }, [lang]);

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  );
};

export const useLang = () => {
  const context = useContext(LangContext);
  if (!context) {
    throw new Error('useLang must be used within a LangProvider');
  }
  return context;
};
