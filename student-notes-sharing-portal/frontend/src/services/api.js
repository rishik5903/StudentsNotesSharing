import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

// -------------------------------------------------------
// Notes API
// -------------------------------------------------------

/** Fetch all notes, or filter/search by query params */
export const fetchNotes = (params = {}) => {
  return api.get('/notes', { params });
};

/** Fetch a single note by id */
export const fetchNoteById = (id) => {
  return api.get(`/notes/${id}`);
};

/** Upload a new note (multipart/form-data) */
export const uploadNote = (formData, onUploadProgress) => {
  return api.post('/notes', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress,
  });
};

/** Delete a note by id */
export const deleteNote = (id) => {
  return api.delete(`/notes/${id}`);
};

/** Get all distinct subject names */
export const fetchSubjects = () => {
  return api.get('/notes/subjects');
};

/** Get dashboard stats */
export const fetchStats = () => {
  return api.get('/notes/stats');
};

/** Return the download URL for a note (used as href) */
export const getDownloadUrl = (id) => {
  return `${API_BASE_URL}/notes/${id}/download`;
};

