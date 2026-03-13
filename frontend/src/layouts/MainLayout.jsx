import React, { useState } from 'react';
import './MainLayout.css';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  Home,
  Target,
  ShoppingCart,
  BarChart3,
  Settings,
  Bell,
  Search,
  User,
  Menu,
  CreditCard,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../hooks/useLang';
import { LanguageSelector } from '../components/LanguageSelector';

export default function MainLayout() {
  const { user, logout } = useAuth();
  const { lang, setLang, t } = useLang();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { to: '/dashboard', icon: Home, label: t.navHome || 'Home' },
    { to: '/transactions', icon: CreditCard, label: t.navTransactions || 'Transactions' },
    { to: '/goals', icon: Target, label: t.navGoals || 'Goals' },
    { to: '/supermarket', icon: ShoppingCart, label: t.navSupermarket || 'Supermarket' },
    { to: '/intelligence', icon: BarChart3, label: t.navIntelligence || 'Intelligence' },
    { to: '/settings', icon: Settings, label: t.navSettings || 'Settings' },
  ];

  return (
    <div className="layout">
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-brand">F</div>
        <nav className="sidebar-nav">
          {navItems.map(({ to, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`
              }
              onClick={() => setSidebarOpen(false)}
            >
              <span className="sidebar-link-pill">
                <Icon size={22} />
              </span>
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="layout-main">
        <header className="navbar">
          <button
            className="navbar-menu-btn"
            onClick={() => setSidebarOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            <Menu size={24} />
          </button>
          <div className="navbar-logo">FORTRESS</div>
          <div className="navbar-right">
            <LanguageSelector currentLang={lang} onSelect={setLang} />
            <button className="navbar-icon" aria-label="Search">
              <Search size={20} />
            </button>
            <button className="navbar-icon" aria-label="Notifications">
              <Bell size={20} />
            </button>
            <button
              className="navbar-avatar"
              onClick={() => logout().then(() => navigate('/login'))}
              aria-label="User menu"
              title={user?.email}
            >
              <User size={18} />
            </button>
          </div>
        </header>

        <main className="layout-content">
          <Outlet />
        </main>
      </div>

      <nav className="bottom-nav">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `bottom-nav-item ${isActive ? 'bottom-nav-item-active' : ''}`
            }
          >
            <Icon size={20} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
