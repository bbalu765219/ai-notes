import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import PdfViewerModal from './components/PdfViewerModal';
import Toast from './components/Toast';

import HomePage from './pages/HomePage';
import LibraryPage from './pages/LibraryPage';
import AiGeneratorPage from './pages/AiGeneratorPage';
import UploadPage from './pages/UploadPage';
import AuthPage from './pages/AuthPage';
import FavoritesPage from './pages/FavoritesPage';
import AdminDashboardPage from './pages/AdminDashboardPage';

import { api, getStoredUser, setStoredUser, setAuthToken } from './utils/api';
import { exportNotesToPdf } from './utils/pdfGenerator';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedBranch, setSelectedBranch] = useState('All');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [user, setUser] = useState(getStoredUser());
  const [favorites, setFavorites] = useState([]);
  const [activePreviewNote, setActivePreviewNote] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Add toast helper
  const addToast = (message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    if (user) {
      loadFavorites();
    }
  }, [user]);

  const loadFavorites = async () => {
    try {
      const data = await api.getFavorites();
      setFavorites(data.favorites || []);
    } catch {
      setFavorites([]);
    }
  };

  const handleNavigate = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectBranch = (branch) => {
    setSelectedBranch(branch);
    setSelectedSubject('');
    setCurrentPage('library');
  };

  const handleSelectSubject = (subject) => {
    setSelectedSubject(subject);
    setSelectedBranch('All');
    setCurrentPage('library');
  };

  const handleAuthSuccess = (userData) => {
    setUser(userData);
    setAuthModalOpen(false);
    addToast(`Welcome back, ${userData.name}!`, 'success');
    if (currentPage === 'auth') {
      setCurrentPage('home');
    }
  };

  const handleLogout = () => {
    api.logout();
    setUser(null);
    setFavorites([]);
    addToast('Signed out successfully.', 'info');
    if (currentPage === 'admin' || currentPage === 'favorites') {
      setCurrentPage('home');
    }
  };

  const handleToggleFavorite = async (noteId) => {
    if (!user) {
      setAuthModalOpen(true);
      addToast('Please sign in to save favorite notes.', 'info');
      return;
    }

    try {
      const res = await api.toggleFavorite(noteId);
      if (res.favorited) {
        addToast('Saved to your favorites!', 'success');
      } else {
        addToast('Removed from favorites.', 'info');
      }
      loadFavorites();
    } catch (err) {
      addToast('Failed to update favorite: ' + err.message, 'error');
    }
  };

  const handleDownloadNote = async (note) => {
    try {
      if (note.fileUrl) {
        // Direct file download via browser anchor
        const link = document.createElement('a');
        link.href = `/api/notes/download/${note.id}`;
        link.download = note.fileName || `${note.title}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        addToast(`Downloading ${note.title}...`, 'success');
      } else if (note.content) {
        // Dynamic PDF export from note content
        addToast('Generating formatted PDF note...', 'info');
        await exportNotesToPdf({
          title: note.title,
          subject: note.subject,
          topic: note.unit || 'Topic Guide',
          branch: note.branch,
          marks: 'Exam Guide',
          content: note.content
        });
        addToast('PDF downloaded successfully!', 'success');
      }
    } catch (err) {
      console.error('Download error:', err);
      addToast('Download failed: ' + err.message, 'error');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Navigation Bar */}
      <Navbar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        user={user}
        onLogout={handleLogout}
        onOpenAuth={() => setAuthModalOpen(true)}
        favoritesCount={favorites.length}
      />

      {/* Main Content View */}
      <main style={{ flex: 1 }}>
        {currentPage === 'home' && (
          <HomePage
            onNavigate={handleNavigate}
            onSelectBranch={handleSelectBranch}
            onSelectSubject={handleSelectSubject}
            onPreviewNote={(note) => setActivePreviewNote(note)}
            onDownloadNote={handleDownloadNote}
            onToggleFavorite={handleToggleFavorite}
            favorites={favorites}
          />
        )}

        {currentPage === 'library' && (
          <LibraryPage
            initialBranch={selectedBranch}
            initialSubject={selectedSubject}
            onPreviewNote={(note) => setActivePreviewNote(note)}
            onDownloadNote={handleDownloadNote}
            onToggleFavorite={handleToggleFavorite}
            favorites={favorites}
          />
        )}

        {currentPage === 'ai' && (
          <AiGeneratorPage
            onSaveSuccess={() => {
              addToast('AI study notes saved to library!', 'success');
            }}
            onNavigate={handleNavigate}
          />
        )}

        {currentPage === 'upload' && (
          <UploadPage
            user={user}
            onUploadSuccess={(note) => {
              addToast('PDF note uploaded successfully!', 'success');
            }}
            onNavigate={handleNavigate}
          />
        )}

        {currentPage === 'favorites' && (
          <FavoritesPage
            user={user}
            onOpenAuth={() => setAuthModalOpen(true)}
            onPreviewNote={(note) => setActivePreviewNote(note)}
            onDownloadNote={handleDownloadNote}
            onToggleFavorite={handleToggleFavorite}
            onNavigate={handleNavigate}
          />
        )}

        {currentPage === 'admin' && (
          <AdminDashboardPage
            user={user}
            onPreviewNote={(note) => setActivePreviewNote(note)}
          />
        )}

        {currentPage === 'auth' && (
          <AuthPage
            onAuthSuccess={handleAuthSuccess}
            onClose={() => setCurrentPage('home')}
          />
        )}
      </main>

      {/* Auth Modal when triggered via Navbar or Actions */}
      {authModalOpen && (
        <div className="modal-overlay" onClick={() => setAuthModalOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: '480px' }}>
            <AuthPage
              onAuthSuccess={handleAuthSuccess}
              onClose={() => setAuthModalOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Note PDF Preview Modal */}
      {activePreviewNote && (
        <PdfViewerModal
          note={activePreviewNote}
          onClose={() => setActivePreviewNote(null)}
          onDownload={handleDownloadNote}
        />
      )}

      {/* Toast Notifications */}
      <Toast toasts={toasts} onDismiss={removeToast} />

      {/* Global Footer */}
      <Footer
        onSelectBranch={handleSelectBranch}
        onNavigate={handleNavigate}
      />
    </div>
  );
}
