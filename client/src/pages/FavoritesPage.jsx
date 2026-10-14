import React, { useState, useEffect } from 'react';
import { Heart, Upload, BookOpen, User, CheckCircle2, Clock, AlertTriangle, ArrowRight } from 'lucide-react';
import { api } from '../utils/api';
import NoteCard from '../components/NoteCard';

export default function FavoritesPage({
  user,
  onOpenAuth,
  onPreviewNote,
  onDownloadNote,
  onToggleFavorite,
  onNavigate
}) {
  const [activeTab, setActiveTab] = useState('favorites');
  const [favorites, setFavorites] = useState([]);
  const [myUploads, setMyUploads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const [favRes, uploadRes] = await Promise.all([
        api.getFavorites().catch(() => ({ favorites: [] })),
        api.getMyUploads().catch(() => ({ uploads: [] }))
      ]);
      setFavorites(favRes.favorites || []);
      setMyUploads(uploadRes.uploads || []);
    } catch (err) {
      console.error('Failed to load user favorites & uploads:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (noteId) => {
    if (onToggleFavorite) {
      await onToggleFavorite(noteId);
      setFavorites(prev => prev.filter(f => f.id !== noteId));
    }
  };

  if (!user) {
    return (
      <div className="container" style={{ padding: '4rem 1.25rem', textAlign: 'center', maxWidth: '580px' }}>
        <div className="card" style={{ padding: '3rem 2rem', background: 'white' }}>
          <div style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: '#eff6ff',
            color: '#2563eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem'
          }}>
            <Heart size={28} />
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.75rem' }}>
            Save Your Favorite Notes
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.75rem' }}>
            Please sign in to bookmark notes, save AI-generated study material to your personal collection, and track your upload history.
          </p>
          <button onClick={onOpenAuth} className="btn btn-primary btn-lg">
            <User size={18} /> Sign In to Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2.5rem 1.25rem' }}>
      {/* Student Profile Card */}
      <div className="card" style={{ padding: '1.75rem 2rem', marginBottom: '2rem', background: 'white' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '1.3rem'
            }}>
              {user.name?.charAt(0).toUpperCase() || 'S'}
            </div>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--dark)', margin: '0 0 0.2rem' }}>
                {user.name}
              </h2>
              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
                {user.email} &bull; {user.branch} ({user.year}) {user.college && `&bull; ${user.college}`}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ textAlign: 'center', padding: '0.5rem 1rem', background: '#f8fafc', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>{favorites.length}</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Favorites</div>
            </div>
            <div style={{ textAlign: 'center', padding: '0.5rem 1rem', background: '#f8fafc', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#16a34a' }}>{myUploads.length}</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Uploads</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.75rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
        <button
          onClick={() => setActiveTab('favorites')}
          className={`btn ${activeTab === 'favorites' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '0.5rem 1.25rem', fontSize: '0.9rem' }}
        >
          <Heart size={16} /> Saved Favorites ({favorites.length})
        </button>
        <button
          onClick={() => setActiveTab('uploads')}
          className={`btn ${activeTab === 'uploads' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '0.5rem 1.25rem', fontSize: '0.9rem' }}
        >
          <Upload size={16} /> Upload History ({myUploads.length})
        </button>
      </div>

      {/* Tab 1: Favorites Grid */}
      {activeTab === 'favorites' && (
        <div>
          {loading ? (
            <p style={{ color: 'var(--text-muted)' }}>Loading favorites...</p>
          ) : favorites.length > 0 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '1.5rem'
            }}>
              {favorites.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onPreview={onPreviewNote}
                  onDownload={onDownloadNote}
                  onToggleFavorite={handleRemoveFavorite}
                  isFavorited={true}
                />
              ))}
            </div>
          ) : (
            <div className="card" style={{ padding: '3.5rem 2rem', textAlign: 'center', background: 'white' }}>
              <Heart size={44} color="#cbd5e1" style={{ margin: '0 auto 1rem' }} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                You have not saved any notes yet
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '440px', margin: '0 auto 1.5rem' }}>
                Click the heart icon on any note in the Library or Home page to save it here for offline study and quick exam access.
              </p>
              <button onClick={() => onNavigate('library')} className="btn btn-primary">
                Browse Notes Library <ArrowRight size={16} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Uploads List */}
      {activeTab === 'uploads' && (
        <div>
          {loading ? (
            <p style={{ color: 'var(--text-muted)' }}>Loading upload history...</p>
          ) : myUploads.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {myUploads.map((note) => {
                const isApproved = note.status === 'approved';
                const isPending = note.status === 'pending';
                return (
                  <div key={note.id} className="card" style={{ padding: '1.25rem 1.5rem', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{
                        width: 42,
                        height: 42,
                        borderRadius: 8,
                        background: isApproved ? '#dcfce7' : isPending ? '#fef3c7' : '#fee2e2',
                        color: isApproved ? '#16a34a' : isPending ? '#d97706' : '#dc2626',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {isApproved ? <CheckCircle2 size={22} /> : <Clock size={22} />}
                      </div>
                      <div>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.25rem' }}>
                          {note.title}
                        </h4>
                        <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
                          <span><strong>{note.branch}</strong> &bull; {note.subject}</span>
                          <span>&bull; {new Date(note.createdAt).toLocaleDateString()}</span>
                          <span>&bull; {note.downloads || 0} Downloads</span>
                          {note.fileSize && <span>&bull; {note.fileSize}</span>}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        padding: '0.3rem 0.75rem',
                        borderRadius: '9999px',
                        background: isApproved ? '#dcfce7' : isPending ? '#fef3c7' : '#fee2e2',
                        color: isApproved ? '#166534' : isPending ? '#92400e' : '#991b1b'
                      }}>
                        {note.status || 'Approved'}
                      </span>

                      <button
                        onClick={() => onPreviewNote(note)}
                        className="btn btn-secondary btn-sm"
                      >
                        Preview
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="card" style={{ padding: '3.5rem 2rem', textAlign: 'center', background: 'white' }}>
              <Upload size={44} color="#cbd5e1" style={{ margin: '0 auto 1rem' }} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                You have not uploaded any PDF notes yet
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '440px', margin: '0 auto 1.5rem' }}>
                Share your lecture notes, previous question papers, or solved assignments with students.
              </p>
              <button onClick={() => onNavigate('upload')} className="btn btn-primary">
                Upload Your First Note <ArrowRight size={16} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
