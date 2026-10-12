import React from 'react';
import { Menu, BookOpen } from 'lucide-react';

const PAGE_LABELS = {
  home: 'Home Dashboard',
  library: 'Notes Library',
  upload: 'Share Notes',
};

const PAGE_DESCRIPTIONS = {
  home: 'Welcome back! Here\'s what\'s available.',
  library: 'Browse, search, and download academic notes.',
  upload: 'Upload your notes to help fellow students.',
};

/**
 * TopBar — sticky top navigation bar showing current page title
 * and mobile menu toggle.
 */
const TopBar = ({ currentPage, onMobileMenuToggle }) => {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Mobile hamburger */}
          <button
            className="btn btn-ghost btn-icon"
            onClick={onMobileMenuToggle}
            style={{ display: 'none' }}
            aria-label="Toggle menu"
            id="mobile-menu-btn"
          >
            <Menu size={20} />
          </button>
          <div>
            <h1>{PAGE_LABELS[currentPage] || 'CampusNotes'}</h1>
            <p>{PAGE_DESCRIPTIONS[currentPage]}</p>
          </div>
        </div>
      </div>

      <div className="topbar-right">
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: 'var(--primary-bg)', padding: '6px 12px',
          borderRadius: '100px', fontSize: '13px', color: 'var(--primary)',
          fontWeight: 500
        }}>
          <BookOpen size={14} />
          B.Tech Portal
        </div>
      </div>
    </header>
  );
};

export default TopBar;

