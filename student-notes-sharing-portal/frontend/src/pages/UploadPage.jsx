import React from 'react';
import { Upload, BookOpen, CheckCircle } from 'lucide-react';
import UploadModal from '../components/UploadModal';

/**
 * UploadPage — a dedicated page for uploading notes.
 * It renders the UploadModal inline (no overlay) plus some guidance text.
 *
 * Props:
 *  - onSuccess (function): called after a successful upload
 *  - onNavigate (function): navigate to another page
 *  - onShowToast (function): show a toast notification
 */
const UploadPage = ({ onShowToast, onNavigate }) => {
  const [showModal, setShowModal] = React.useState(false);

  const handleSuccess = (note) => {
    setShowModal(false);
    onShowToast(`"${note.title}" uploaded successfully!`, 'success');
    // Navigate to library so the user can see their uploaded note
    onNavigate('library');
  };

  return (
    <div className="page-content">
      <div style={{ maxWidth: '680px', margin: '0 auto' }}>

        {/* Header card */}
        <div className="card card-padding" style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
            <div style={{
              width: '48px', height: '48px', background: 'var(--primary-bg)',
              borderRadius: 'var(--radius-sm)', display: 'flex',
              alignItems: 'center', justifyContent: 'center', color: 'var(--primary)'
            }}>
              <Upload size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>
                Share Your Notes
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                Help fellow students by sharing your study material
              </p>
            </div>
          </div>

          <div className="divider" />

          {/* Guidelines */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              'Upload PDF files only (max 15 MB per note)',
              'Provide a clear, descriptive title so others can find your notes',
              'Mention the correct semester to help students filter effectively',
              'Add a short description to explain what topics are covered',
              'Do not upload copyrighted material or exam papers',
            ].map((tip, i) => (
              <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <CheckCircle size={15} style={{ color: 'var(--success)', flexShrink: 0, marginTop: '2px' }} />
                <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{tip}</span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '24px' }}>
            <button className="btn btn-primary" onClick={() => setShowModal(true)} style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>
              <Upload size={17} />
              Open Upload Form
            </button>
          </div>
        </div>

        {/* Browse hint */}
        <div style={{
          textAlign: 'center', padding: '20px',
          color: 'var(--text-muted)', fontSize: '14px'
        }}>
          <BookOpen size={18} style={{ marginBottom: '6px', display: 'block', margin: '0 auto 8px' }} />
          Want to see what others have shared?{' '}
          <button
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--primary)', fontWeight: 600, fontSize: '14px',
              textDecoration: 'underline', padding: 0
            }}
            onClick={() => onNavigate('library')}
          >
            Browse the Notes Library
          </button>
        </div>
      </div>

      {/* Upload modal */}
      {showModal && (
        <UploadModal
          onClose={() => setShowModal(false)}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
};

export default UploadPage;

