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
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/dashboard', icon: Home, label: 'Home' },
  { to: '/goals', icon: Target, label: 'Goals' },
  { to: '/supermarket', icon: ShoppingCart, label: 'Supermarket' },
  { to: '/intelligence', icon: BarChart3, label: 'Intelligence' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function MainLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

      {/* Mobile bottom nav */}
      <nav className="bottom-nav">
        {navItems.map(({ to, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `bottom-nav-link ${isActive ? 'bottom-nav-link-active' : ''}`
            }
          >
            <Icon size={22} />
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
