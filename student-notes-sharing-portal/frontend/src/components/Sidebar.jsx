import React from 'react';
import {
  BookOpen, Home, Library, Upload, Menu, X
} from 'lucide-react';

/**
 * Sidebar — fixed left navigation panel.
 * Shows logo + navigation items.
 * On mobile, can be toggled open/closed.
 */
const Sidebar = ({ currentPage, onNavigate, mobileOpen, onMobileClose }) => {
  const navItems = [
    { id: 'home',    icon: Home,    label: 'Home' },
    { id: 'library', icon: Library, label: 'Notes Library' },
    { id: 'upload',  icon: Upload,  label: 'Share Notes' },
  ];

  return (
    <>
      {/* Mobile overlay — closes sidebar when tapping outside */}
      {mobileOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)',
            zIndex: 99, display: 'none'
          }}
          className="mobile-overlay"
          onClick={onMobileClose}
        />
      )}

      <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <BookOpen size={18} />
          </div>
          <div className="sidebar-logo-text">
            <h2>CampusNotes</h2>
            <p>Notes Sharing Portal</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <div className="nav-section-label">Menu</div>
          {navItems.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              className={`nav-item ${currentPage === id ? 'active' : ''}`}
              onClick={() => { onNavigate(id); onMobileClose?.(); }}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </nav>

        {/* Footer note */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)' }}>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            Academic use only.<br />
            No authentication required for this demo version.
          </p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

