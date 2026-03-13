import React, { useState } from 'react'
import { LANGUAGES } from '../locales/landing'

export const LanguageSelector = ({ currentLang, onSelect }) => {
  const [open, setOpen] = useState(false)
  const current = LANGUAGES.find(l => l.code === currentLang) || LANGUAGES[0]

  return (
    <div className="lang-selector" onBlur={() => setOpen(false)} tabIndex={0}>
      <button
        className="lang-trigger"
        onClick={() => setOpen(o => !o)}
        aria-label="Select language"
      >
        <img
          className="lang-flag-img"
          src={`https://flagcdn.com/24x18/${current.flagCode}.png`}
          alt={current.label}
          width="24"
          height="18"
        />
        <span className="lang-code">{current.code === 'ptBR' ? 'PT' : current.code.toUpperCase()}</span>
        <span className="lang-chevron" style={{ transform: open ? 'rotate(180deg)' : 'none' }}>▾</span>
      </button>

      {open && (
        <div className="lang-dropdown">
          {LANGUAGES.map(l => (
            <button
              key={l.code}
              className={`lang-option ${l.code === currentLang ? 'lang-option-active' : ''}`}
              onMouseDown={() => { onSelect(l.code); setOpen(false) }}
            >
              <img
                className="lang-flag-img"
                src={`https://flagcdn.com/24x18/${l.flagCode}.png`}
                alt={l.label}
                width="24"
                height="18"
              />
              <span>{l.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
