import React, { useState, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import Toast from './components/Toast';
import UploadModal from './components/UploadModal';
import HomePage from './pages/HomePage';
import LibraryPage from './pages/LibraryPage';
import UploadPage from './pages/UploadPage';
import { deleteNote } from './services/api';

/**
 * App — root component.
 *
 * Manages:
 *  - Page routing (simple state-based navigation, no React Router needed)
 *  - Global upload modal
 *  - Global toast notifications
 *  - Mobile sidebar toggle
 */
function App() {
  const [currentPage, setCurrentPage]     = useState('home');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [toast, setToast]                 = useState(null); // { message, type }
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  // Key used to force-refresh the library/home after uploads
  const [refreshKey, setRefreshKey]       = useState(0);

  // -------------------------------------------------------
  // Toast helpers
  // -------------------------------------------------------
  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
  }, []);

  const dismissToast = useCallback(() => {
    setToast(null);
  }, []);

  // -------------------------------------------------------
  // Upload success
  // -------------------------------------------------------
  const handleUploadSuccess = useCallback((note) => {
    setUploadModalOpen(false);
    showToast(`"${note.title}" uploaded successfully!`, 'success');
    setRefreshKey((k) => k + 1);
    setCurrentPage('library');
  }, [showToast]);

  // -------------------------------------------------------
  // Global delete (called from HomePage)
  // -------------------------------------------------------
  const handleDeleteNote = useCallback(async (id) => {
    try {
      await deleteNote(id);
      showToast('Note deleted successfully.', 'success');
      setRefreshKey((k) => k + 1);
    } catch (err) {
      showToast(
        err.response?.data?.message || 'Failed to delete note.',
        'error'
      );
    }
  }, [showToast]);

  // -------------------------------------------------------
  // Render the correct page
  // -------------------------------------------------------
  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return (
          <HomePage
            key={`home-${refreshKey}`}
            onNavigate={setCurrentPage}
            onUploadOpen={() => setUploadModalOpen(true)}
            onDeleteNote={handleDeleteNote}
          />
        );
      case 'library':
        return (
          <LibraryPage
            key={`library-${refreshKey}`}
            onUploadOpen={() => setUploadModalOpen(true)}
            onShowToast={showToast}
          />
        );
      case 'upload':
        return (
          <UploadPage
            onShowToast={showToast}
            onNavigate={setCurrentPage}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <Sidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      {/* Main area */}
      <div className="main-area">
        <TopBar
          currentPage={currentPage}
          onMobileMenuToggle={() => setMobileSidebarOpen((o) => !o)}
        />
        {renderPage()}
      </div>

      {/* Global upload modal (triggered from anywhere) */}
      {uploadModalOpen && (
        <UploadModal
          onClose={() => setUploadModalOpen(false)}
          onSuccess={handleUploadSuccess}
        />
      )}

      {/* Toast notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={dismissToast}
        />
      )}
    </div>
  );
}

export default App;

