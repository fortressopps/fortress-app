import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import './ThemeToggle.css';

const ThemeToggle = ({ variant = 'floating' }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const label = isDark ? 'Modo Claro' : 'Modo Escuro';
  const icon = isDark ? '☀️' : '🌙';

  return (
    <button
      type="button"
      className={`theme-toggle ${variant === 'floating' ? 'theme-toggle--floating' : ''}`}
      onClick={toggleTheme}
      aria-label={`Alternar para ${label}`}
      aria-pressed={isDark}
    >
      <span className="theme-toggle__icon" aria-hidden="true">{icon}</span>
      <span className="theme-toggle__label">{label}</span>
    </button>
  );
};

export default ThemeToggle;
