import React, { useEffect, useState } from 'react';
import {
  BookOpen, Users, Upload, Clock, ArrowRight,
  FileText, AlertCircle
} from 'lucide-react';
import { fetchStats, fetchNotes } from '../services/api';
import NoteCard from '../components/NoteCard';

/**
 * HomePage — the main dashboard.
 *
 * Displays:
 *  - Stats (total notes + total subjects)
 *  - Welcome banner with a "Share Notes" CTA
 *  - Recent notes (up to 6, newest first)
 */
const HomePage = ({ onNavigate, onUploadOpen, onDeleteNote }) => {
  const [stats, setStats] = useState({ totalNotes: 0, totalSubjects: 0 });
  const [recentNotes, setRecentNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [statsRes, notesRes] = await Promise.all([
        fetchStats(),
        fetchNotes(),
      ]);
      setStats(statsRes.data);
      // Show only the 6 most recent notes on the home page
      setRecentNotes(notesRes.data.slice(0, 6));
    } catch (err) {
      setError(
        err.code === 'ERR_NETWORK'
          ? 'Cannot connect to the backend. Make sure the Spring Boot server is running on port 8080.'
          : `Failed to load data: ${err.response?.data?.message || err.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    await onDeleteNote(id);
    // Refresh local data after deletion
    loadData();
  };

  return (
    <div className="page-content">
      {/* ---- Stats grid ---- */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon purple">
            <FileText size={20} />
          </div>
          <div className="stat-info">
            <h3>{stats.totalNotes}</h3>
            <p>Total Notes</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue">
            <BookOpen size={20} />
          </div>
          <div className="stat-info">
            <h3>{stats.totalSubjects}</h3>
            <p>Subjects Covered</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">
            <Users size={20} />
          </div>
          <div className="stat-info">
            <h3>∞</h3>
            <p>Students Helped</p>
          </div>
        </div>
      </div>

      {/* ---- Welcome banner ---- */}
      <div style={{
        background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)',
        borderRadius: 'var(--radius)',
        padding: '28px 32px',
        color: 'white',
        marginBottom: '28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '6px' }}>
            Welcome to CampusNotes 📚
          </h2>
          <p style={{ opacity: 0.9, fontSize: '14px', maxWidth: '420px' }}>
            A community-driven platform where B.Tech students share study materials,
            notes, and resources to help each other succeed.
          </p>
        </div>
        <button
          className="btn"
          style={{
            background: 'white', color: 'var(--primary)',
            fontWeight: 600, padding: '11px 22px'
          }}
          onClick={onUploadOpen}
        >
          <Upload size={16} />
          Share Notes
          <ArrowRight size={16} />
        </button>
      </div>

      {/* ---- Error state ---- */}
      {error && (
        <div style={{
          background: 'var(--error-bg)', border: '1px solid #fecaca',
          borderRadius: 'var(--radius)', padding: '16px 20px',
          display: 'flex', gap: '10px', alignItems: 'flex-start',
          color: 'var(--error)', fontSize: '14px', marginBottom: '24px'
        }}>
          <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '1px' }} />
          <div>
            <strong>Connection Error</strong>
            <p style={{ marginTop: '4px', color: 'var(--error)', opacity: 0.85 }}>{error}</p>
          </div>
        </div>
      )}

      {/* ---- Recent notes ---- */}
      <div className="section-header">
        <div>
          <h2>Recently Added</h2>
          <p>Latest notes shared by your classmates</p>
        </div>
        {recentNotes.length > 0 && (
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => onNavigate('library')}
          >
            View All <ArrowRight size={14} />
          </button>
        )}
      </div>

      {loading ? (
        <div className="loading-wrap">
          <div className="spinner" />
          <span>Loading notes…</span>
        </div>
      ) : recentNotes.length === 0 && !error ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <BookOpen size={28} />
          </div>
          <h3>No notes yet</h3>
          <p>Be the first one to share study material with your classmates!</p>
          <button className="btn btn-primary" onClick={onUploadOpen}>
            <Upload size={16} /> Share First Note
          </button>
        </div>
      ) : (
        <div className="notes-grid">
          {recentNotes.map((note) => (
            <NoteCard key={note.id} note={note} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {/* Quick tip */}
      {!loading && recentNotes.length > 0 && (
        <div style={{
          marginTop: '24px', padding: '14px 18px',
          background: 'var(--primary-bg)', borderRadius: 'var(--radius-sm)',
          fontSize: '13px', color: 'var(--primary)', display: 'flex', gap: '8px'
        }}>
          <Clock size={15} style={{ flexShrink: 0, marginTop: '1px' }} />
          <span>
            Showing the {recentNotes.length} most recent notes.{' '}
            <button
              style={{ background: 'none', border: 'none', cursor: 'pointer',
                       color: 'var(--primary)', fontWeight: 600, fontSize: '13px',
                       textDecoration: 'underline', padding: 0 }}
              onClick={() => onNavigate('library')}
            >
              Browse the full library →
            </button>
          </span>
        </div>
      )}
    </div>
  );
};

export default HomePage;

