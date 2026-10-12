import React from 'react';
import {
  BookOpen, User, Calendar, Download, Trash2, FileText, GraduationCap
} from 'lucide-react';
import { getDownloadUrl } from '../services/api';

/**
 * Format bytes to a human-readable string (e.g. "1.2 MB").
 */
const formatFileSize = (bytes) => {
  if (!bytes) return '';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
};

/**
 * Format an ISO date string to a readable date (e.g. "Oct 12, 2026").
 */
const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  });
};

/**
 * NoteCard — displays metadata for a single note with download and delete actions.
 *
 * Props:
 *  - note (object): the note data from the API
 *  - onDelete (function): called with note.id when the user confirms deletion
 */
const NoteCard = ({ note, onDelete }) => {
  const [confirmDelete, setConfirmDelete] = React.useState(false);

  return (
    <div className="note-card">
      {/* Header: title + semester badge */}
      <div className="note-card-header">
        <h3 className="note-card-title">{note.title}</h3>
        <span className="badge badge-purple">Sem {note.semester}</span>
      </div>

      {/* Meta information */}
      <div className="note-meta">
        <div className="note-meta-row">
          <BookOpen size={14} />
          <span>{note.subject}</span>
        </div>
        <div className="note-meta-row">
          <User size={14} />
          <span>{note.uploaderName}</span>
        </div>
        <div className="note-meta-row">
          <Calendar size={14} />
          <span>{formatDate(note.uploadedAt)}</span>
        </div>
      </div>

      {/* Description (optional) */}
      {note.description && (
        <p className="note-description">{note.description}</p>
      )}

      {/* Footer: filename + actions */}
      <div className="note-card-footer">
        <div className="note-file-name">
          <FileText size={12} />
          <span title={note.originalFileName}>{note.originalFileName}</span>
          {note.fileSize && (
            <span style={{ color: 'var(--text-muted)', marginLeft: '4px' }}>
              ({formatFileSize(note.fileSize)})
            </span>
          )}
        </div>

        <div className="note-actions">
          {/* Download — opens PDF as download */}
          <a
            href={getDownloadUrl(note.id)}
            download={note.originalFileName}
            className="btn btn-primary btn-sm"
            title="Download PDF"
          >
            <Download size={14} />
            Download
          </a>

          {/* Delete */}
          {!confirmDelete ? (
            <button
              className="btn btn-ghost btn-sm btn-icon"
              onClick={() => setConfirmDelete(true)}
              title="Delete note"
              aria-label="Delete note"
            >
              <Trash2 size={14} />
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: 'var(--error)', whiteSpace: 'nowrap' }}>
                Delete?
              </span>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => { onDelete(note.id); setConfirmDelete(false); }}
              >
                Yes
              </button>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setConfirmDelete(false)}
              >
                No
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NoteCard;

