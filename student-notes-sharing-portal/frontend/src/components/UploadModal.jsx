import React, { useState, useRef } from 'react';
import { X, Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { uploadNote } from '../services/api';

const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];
const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15 MB

const initialForm = {
  title: '',
  subject: '',
  semester: '',
  uploaderName: '',
  description: '',
};

/**
 * UploadModal — a dialog for uploading a new note.
 *
 * Props:
 *  - onClose  (function): called to dismiss the modal
 *  - onSuccess (function): called with the newly created note after upload
 */
const UploadModal = ({ onClose, onSuccess }) => {
  const [form, setForm] = useState(initialForm);
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  // -------------------------------------------------------
  // Handlers
  // -------------------------------------------------------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field on change
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleFileChange = (selectedFile) => {
    setErrors((prev) => ({ ...prev, file: '' }));

    if (!selectedFile) return;

    if (!selectedFile.name.toLowerCase().endsWith('.pdf')) {
      setErrors((prev) => ({ ...prev, file: 'Only PDF files are accepted.' }));
      return;
    }
    if (selectedFile.size > MAX_FILE_SIZE) {
      setErrors((prev) => ({
        ...prev,
        file: `File too large (${(selectedFile.size / 1048576).toFixed(1)} MB). Max is 15 MB.`
      }));
      return;
    }

    setFile(selectedFile);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleFileChange(dropped);
  };

  // -------------------------------------------------------
  // Validation
  // -------------------------------------------------------
  const validate = () => {
    const newErrors = {};
    if (!form.title.trim())        newErrors.title        = 'Title is required.';
    if (!form.subject.trim())      newErrors.subject      = 'Subject is required.';
    if (!form.semester)            newErrors.semester     = 'Please select a semester.';
    if (!form.uploaderName.trim()) newErrors.uploaderName = 'Your name is required.';
    if (!file)                     newErrors.file         = 'Please select a PDF file.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // -------------------------------------------------------
  // Submit
  // -------------------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const formData = new FormData();
    formData.append('title',        form.title.trim());
    formData.append('subject',      form.subject.trim());
    formData.append('semester',     form.semester);
    formData.append('uploaderName', form.uploaderName.trim());
    if (form.description.trim()) {
      formData.append('description', form.description.trim());
    }
    formData.append('file', file);

    setUploading(true);
    setUploadProgress(0);

    try {
      const response = await uploadNote(formData, (progressEvent) => {
        const percent = Math.round(
          (progressEvent.loaded * 100) / (progressEvent.total || 1)
        );
        setUploadProgress(percent);
      });
      onSuccess(response.data);
    } catch (err) {
      const msg = err.response?.data?.message || 'Upload failed. Please try again.';
      setErrors((prev) => ({ ...prev, submit: msg }));
    } finally {
      setUploading(false);
    }
  };

  // -------------------------------------------------------
  // Render
  // -------------------------------------------------------
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="upload-modal-title">
        {/* Header */}
        <div className="modal-header">
          <h2 id="upload-modal-title">Share Your Notes</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Submit error banner */}
            {errors.submit && (
              <div style={{
                background: 'var(--error-bg)', border: '1px solid #fecaca',
                borderRadius: 'var(--radius-sm)', padding: '10px 14px',
                display: 'flex', gap: '8px', alignItems: 'center',
                color: 'var(--error)', fontSize: '14px', marginBottom: '16px'
              }}>
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                {errors.submit}
              </div>
            )}

            {/* Title */}
            <div className="form-group">
              <label className="form-label" htmlFor="title">
                Note Title <span>*</span>
              </label>
              <input
                id="title" name="title" type="text"
                className={`form-input ${errors.title ? 'error' : ''}`}
                placeholder="e.g. Data Structures Unit 3 Notes"
                value={form.title} onChange={handleChange}
                disabled={uploading} maxLength={255}
              />
              {errors.title && <p className="form-error">{errors.title}</p>}
            </div>

            {/* Subject + Semester (side by side) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="subject">
                  Subject <span>*</span>
                </label>
                <input
                  id="subject" name="subject" type="text"
                  className={`form-input ${errors.subject ? 'error' : ''}`}
                  placeholder="e.g. Data Structures"
                  value={form.subject} onChange={handleChange}
                  disabled={uploading} maxLength={255}
                />
                {errors.subject && <p className="form-error">{errors.subject}</p>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="semester">
                  Semester <span>*</span>
                </label>
                <select
                  id="semester" name="semester"
                  className={`form-select ${errors.semester ? 'error' : ''}`}
                  value={form.semester} onChange={handleChange}
                  disabled={uploading}
                >
                  <option value="">Select semester</option>
                  {SEMESTERS.map((s) => (
                    <option key={s} value={s}>Semester {s}</option>
                  ))}
                </select>
                {errors.semester && <p className="form-error">{errors.semester}</p>}
              </div>
            </div>

            {/* Uploader name */}
            <div className="form-group">
              <label className="form-label" htmlFor="uploaderName">
                Your Name <span>*</span>
              </label>
              <input
                id="uploaderName" name="uploaderName" type="text"
                className={`form-input ${errors.uploaderName ? 'error' : ''}`}
                placeholder="e.g. Rishik Sharma"
                value={form.uploaderName} onChange={handleChange}
                disabled={uploading} maxLength={255}
              />
              {errors.uploaderName && <p className="form-error">{errors.uploaderName}</p>}
            </div>

            {/* Description (optional) */}
            <div className="form-group">
              <label className="form-label" htmlFor="description">
                Description <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span>
              </label>
              <textarea
                id="description" name="description"
                className="form-textarea"
                placeholder="Briefly describe what these notes cover..."
                value={form.description} onChange={handleChange}
                disabled={uploading} rows={3} maxLength={1000}
              />
            </div>

            {/* PDF file upload */}
            <div className="form-group">
              <label className="form-label">
                PDF File <span>*</span>
              </label>
              <div
                className={`file-upload-area
                  ${dragOver ? 'drag-over' : ''}
                  ${file ? 'has-file' : ''}
                  ${errors.file ? 'error-state' : ''}`}
                onClick={() => !uploading && fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                role="button" tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef} type="file" accept=".pdf"
                  style={{ display: 'none' }}
                  onChange={(e) => handleFileChange(e.target.files[0])}
                  disabled={uploading}
                />

                {file ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle size={28} color="var(--success)" />
                    <p className="file-upload-text">
                      <strong>{file.name}</strong>
                    </p>
                    <p className="file-upload-hint">
                      {(file.size / 1048576).toFixed(2)} MB — click to change
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                    <Upload size={28} className="file-upload-icon" />
                    <p className="file-upload-text">
                      <strong>Click to browse</strong> or drag &amp; drop
                    </p>
                    <p className="file-upload-hint">PDF only · max 15 MB</p>
                  </div>
                )}
              </div>
              {errors.file && <p className="form-error">{errors.file}</p>}

              {/* Upload progress bar */}
              {uploading && (
                <div className="progress-wrap" style={{ marginTop: '8px' }}>
                  <div className="progress-bar" style={{ width: `${uploadProgress}%` }} />
                </div>
              )}
            </div>
          </div>

          {/* Footer actions */}
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={uploading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={uploading}>
              {uploading
                ? (<><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                     Uploading {uploadProgress}%</>)
                : (<><Upload size={16} /> Upload Notes</>)
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadModal;

