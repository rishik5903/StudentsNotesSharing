import React, { useEffect, useState, useCallback } from 'react';
import {
  Search, Filter, X, BookOpen, SlidersHorizontal, AlertCircle, RefreshCw
} from 'lucide-react';
import { fetchNotes, fetchSubjects, deleteNote } from '../services/api';
import NoteCard from '../components/NoteCard';

const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

/**
 * LibraryPage — the full notes library with search and filters.
 */
const LibraryPage = ({ onUploadOpen, onShowToast }) => {
  const [notes, setNotes] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter state
  const [search, setSearch]     = useState('');
  const [subject, setSubject]   = useState('');
  const [semester, setSemester] = useState('');

  // -------------------------------------------------------
  // Data fetching
  // -------------------------------------------------------
  const loadSubjects = async () => {
    try {
      const res = await fetchSubjects();
      setSubjects(res.data);
    } catch {
      // Subjects are optional — don't block the page
    }
  };

  const loadNotes = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (search.trim())   params.search   = search.trim();
      if (subject)         params.subject  = subject;
      if (semester)        params.semester = semester;

      const res = await fetchNotes(params);
      setNotes(res.data);
    } catch (err) {
      setError(
        err.code === 'ERR_NETWORK'
          ? 'Cannot connect to the backend. Make sure Spring Boot is running on port 8080.'
          : `Error: ${err.response?.data?.message || err.message}`
      );
    } finally {
      setLoading(false);
    }
  }, [search, subject, semester]);

  useEffect(() => {
    loadSubjects();
  }, []);

  // Debounced search — wait 400 ms after the user stops typing
  useEffect(() => {
    const timer = setTimeout(() => loadNotes(), 400);
    return () => clearTimeout(timer);
  }, [loadNotes]);

  // -------------------------------------------------------
  // Actions
  // -------------------------------------------------------
  const handleDelete = async (id) => {
    try {
      await deleteNote(id);
      setNotes((prev) => prev.filter((n) => n.id !== id));
      onShowToast('Note deleted successfully.', 'success');
    } catch (err) {
      onShowToast(
        err.response?.data?.message || 'Failed to delete note.',
        'error'
      );
    }
  };

  const clearFilters = () => {
    setSearch('');
    setSubject('');
    setSemester('');
  };

  const hasActiveFilters = search || subject || semester;

  // -------------------------------------------------------
  // Render
  // -------------------------------------------------------
  return (
    <div className="page-content">

      {/* ---- Filter bar ---- */}
      <div className="filters-bar">
        {/* Search */}
        <div className="search-input-wrap">
          <Search size={15} />
          <input
            type="text"
            className="search-input"
            placeholder="Search by title, subject, or contributor…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search notes"
          />
        </div>

        {/* Subject filter */}
        <select
          className="filter-select"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          aria-label="Filter by subject"
        >
          <option value="">All Subjects</option>
          {subjects.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        {/* Semester filter */}
        <select
          className="filter-select"
          value={semester}
          onChange={(e) => setSemester(e.target.value)}
          aria-label="Filter by semester"
        >
          <option value="">All Semesters</option>
          {SEMESTERS.map((s) => (
            <option key={s} value={s}>Semester {s}</option>
          ))}
        </select>

        {/* Clear filters */}
        {hasActiveFilters && (
          <button className="btn btn-ghost btn-sm" onClick={clearFilters}>
            <X size={14} /> Clear
          </button>
        )}

        {/* Refresh */}
        <button
          className="btn btn-ghost btn-sm btn-icon"
          onClick={loadNotes}
          title="Refresh"
          aria-label="Refresh notes"
        >
          <RefreshCw size={15} />
        </button>
      </div>

      {/* ---- Results header ---- */}
      <div className="section-header">
        <div>
          <h2>
            {hasActiveFilters ? 'Filtered Results' : 'All Notes'}
          </h2>
          {!loading && !error && (
            <p>
              {notes.length === 0
                ? 'No notes found'
                : `${notes.length} note${notes.length !== 1 ? 's' : ''} available`}
            </p>
          )}
        </div>
      </div>

      {/* ---- Error ---- */}
      {error && (
        <div style={{
          background: 'var(--error-bg)', border: '1px solid #fecaca',
          borderRadius: 'var(--radius)', padding: '16px 20px',
          display: 'flex', gap: '10px', alignItems: 'flex-start',
          color: 'var(--error)', fontSize: '14px', marginBottom: '24px'
        }}>
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <div>
            <strong>Error loading notes</strong>
            <p style={{ marginTop: '4px', opacity: 0.85 }}>{error}</p>
            <button
              className="btn btn-secondary btn-sm"
              onClick={loadNotes}
              style={{ marginTop: '10px' }}
            >
              <RefreshCw size={13} /> Retry
            </button>
          </div>
        </div>
      )}

      {/* ---- Loading ---- */}
      {loading && (
        <div className="loading-wrap">
          <div className="spinner" />
          <span>Loading notes…</span>
        </div>
      )}

      {/* ---- Empty state ---- */}
      {!loading && !error && notes.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">
            {hasActiveFilters ? <SlidersHorizontal size={28} /> : <BookOpen size={28} />}
          </div>
          <h3>
            {hasActiveFilters ? 'No matching notes' : 'No notes available yet'}
          </h3>
          <p>
            {hasActiveFilters
              ? 'Try adjusting your search terms or clearing the filters.'
              : 'Be the first to share study material with your classmates!'}
          </p>
          {hasActiveFilters
            ? <button className="btn btn-secondary" onClick={clearFilters}>
                <X size={14} /> Clear Filters
              </button>
            : <button className="btn btn-primary" onClick={onUploadOpen}>
                Upload First Note
              </button>
          }
        </div>
      )}

      {/* ---- Notes grid ---- */}
      {!loading && !error && notes.length > 0 && (
        <div className="notes-grid">
          {notes.map((note) => (
            <NoteCard key={note.id} note={note} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
};

export default LibraryPage;

