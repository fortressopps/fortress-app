import React from "react";
import { NavLink } from "react-router-dom";
import "./Sidebar.css";

const Sidebar = () => {
  const menuItems = [
    { name: "Home", icon: "🏠", path: "/dashboard" },
    { name: "Portfolio", icon: "💼", path: "/goals" },
    { name: "Analytics", icon: "📈", path: "/intelligence" },
    { name: "Settings", icon: "⚙️", path: "/settings" },
  ];

  return (
    <aside className="fortress-sidebar light-border animate-entrance">
      <div className="sidebar-brand">
        <div className="brand-circle">
          <div className="circle-inner"></div>
        </div>
        <span className="brand-text text-charcoal">FORTRESS</span>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item, idx) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `nav-item stagger-${idx + 1} ${isActive ? "active" : ""}`
            }
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-name">{item.name}</span>
            {item.name === "INTELIGÊNCIA" && (
              <span className="nav-badge shimmer-bg">L3</span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-persona-card">
          <div className="persona-avatar-circle">👤</div>
          <div className="persona-info">
            <span className="persona-name text-charcoal">OPERADOR</span>
            <span className="persona-status text-forest-green">
              OFFICIAL ACCESS
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
