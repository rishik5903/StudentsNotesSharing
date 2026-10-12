import axios from 'axios';

const API_BASE_URL =
  `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/api`;

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

// Fetch all notes or filter/search
export const fetchNotes = (params = {}) =>
  api.get('/notes', { params });

// Fetch a single note
export const fetchNoteById = (id) =>
  api.get(`/notes/${id}`);

// Upload a note
export const uploadNote = (formData, onUploadProgress) =>
  api.post('/notes', formData, {
    onUploadProgress,
  });

// Delete a note
export const deleteNote = (id) =>
  api.delete(`/notes/${id}`);

// Get subjects
export const fetchSubjects = () =>
  api.get('/notes/subjects');

// Get dashboard statistics
export const fetchStats = () =>
  api.get('/notes/stats');

// Download a note
export const getDownloadUrl = (id) =>
  `${API_BASE_URL}/notes/${id}/download`;
