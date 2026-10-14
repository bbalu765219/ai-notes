import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Trash2,
  FileText,
  Search,
  Plus,
  Eye,
  RefreshCw,
  BookOpen,
  ArrowDownToLine,
  Users,
  Layers
} from 'lucide-react';
import { api } from '../utils/api';
import BranchBadge from '../components/BranchBadge';

export default function AdminDashboardPage({ user, onPreviewNote }) {
  const [stats, setStats] = useState(null);
  const [pendingNotes, setPendingNotes] = useState([]);
  const [allNotes, setAllNotes] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [activeTab, setActiveTab] = useState('pending');
  const [loading, setLoading] = useState(true);

  // Search & Filter in All Notes
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Add Subject Form
  const [newSubName, setNewSubName] = useState('');
  const [newSubCode, setNewSubCode] = useState('');
  const [newSubBranch, setNewSubBranch] = useState('CSE');
  const [newSubSem, setNewSubSem] = useState('Semester 3');
  const [addingSubject, setAddingSubject] = useState(false);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, pendingRes, notesRes, subsRes] = await Promise.all([
        api.getAdminStats(),
        api.getPendingNotes(),
        api.getAllNotesAdmin({ status: 'all' }),
        api.getSubjects()
      ]);
      setStats(statsRes.stats);
      setPendingNotes(pendingRes.pending || []);
      setAllNotes(notesRes.notes || []);
      setSubjects(subsRes.subjects || []);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (noteId, newStatus) => {
    try {
      await api.updateNoteStatus(noteId, newStatus);
      // Update local state
      setPendingNotes(prev => prev.filter(n => n.id !== noteId));
      setAllNotes(prev => prev.map(n => n.id === noteId ? { ...n, status: newStatus } : n));
      const statsRes = await api.getAdminStats();
      setStats(statsRes.stats);
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm('Are you sure you want to permanently delete this note and its file?')) {
      return;
    }
    try {
      await api.deleteNoteAdmin(noteId);
      setPendingNotes(prev => prev.filter(n => n.id !== noteId));
      setAllNotes(prev => prev.filter(n => n.id !== noteId));
      const statsRes = await api.getAdminStats();
      setStats(statsRes.stats);
    } catch (err) {
      alert('Failed to delete note: ' + err.message);
    }
  };

  const handleAddSubject = async (e) => {
    e.preventDefault();
    if (!newSubName.trim()) return;
    setAddingSubject(true);
    try {
      const res = await api.addSubject({
        name: newSubName.trim(),
        code: newSubCode.trim(),
        branch: newSubBranch,
        semester: newSubSem
      });
      setSubjects(prev => [...prev, res.subject]);
      setNewSubName('');
      setNewSubCode('');
      alert('Subject added successfully!');
    } catch (err) {
      alert('Failed to add subject: ' + err.message);
    } finally {
      setAddingSubject(false);
    }
  };

  const handleDeleteSubject = async (subId) => {
    if (!window.confirm('Delete this subject from curriculum catalogue?')) return;
    try {
      await api.deleteSubject(subId);
      setSubjects(prev => prev.filter(s => s.id !== subId));
    } catch (err) {
      alert('Failed to delete subject: ' + err.message);
    }
  };

  const filteredAllNotes = allNotes.filter(n => {
    const matchesSearch = !searchTerm ||
      n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.uploaderName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || n.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (!user || user.role !== 'admin') {
    return (
      <div className="container" style={{ padding: '4rem 1.25rem', textAlign: 'center' }}>
        <div className="card" style={{ padding: '3rem 2rem', maxWidth: '480px', margin: '0 auto', background: 'white' }}>
          <ShieldAlert size={48} color="#dc2626" style={{ margin: '0 auto 1rem' }} />
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            Administrator Access Only
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            Please sign in with an administrator account to access moderations and hub settings.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2.5rem 1.25rem' }}>
      {/* Dashboard Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '9999px', background: '#fee2e2', color: '#dc2626' }}>
              ADMINISTRATOR
            </span>
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>System Moderation & Management</span>
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--dark)' }}>
            Admin Dashboard
          </h1>
        </div>

        <button onClick={loadAdminData} className="btn btn-secondary btn-sm">
          <RefreshCw size={14} /> Refresh Data
        </button>
      </div>

      {/* Stats Cards Grid */}
      {stats && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <div className="card" style={{ padding: '1.25rem', background: 'white' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
              <span>Total Uploads</span>
              <FileText size={18} color="#2563eb" />
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>{stats.totalNotes}</div>
            <div style={{ fontSize: '0.75rem', color: '#16a34a', marginTop: '0.25rem' }}>{stats.approvedNotes} Published</div>
          </div>

          <div className="card" style={{ padding: '1.25rem', background: stats.pendingNotes > 0 ? '#fffbeb' : 'white', borderColor: stats.pendingNotes > 0 ? '#fde68a' : 'var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: stats.pendingNotes > 0 ? '#b45309' : '#64748b', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
              <span>Pending Review</span>
              <ShieldAlert size={18} color={stats.pendingNotes > 0 ? '#d97706' : '#94a3b8'} />
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: stats.pendingNotes > 0 ? '#b45309' : '#0f172a' }}>
              {stats.pendingNotes}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#d97706', marginTop: '0.25rem' }}>Requires Moderation</div>
          </div>

          <div className="card" style={{ padding: '1.25rem', background: 'white' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
              <span>Total Downloads</span>
              <ArrowDownToLine size={18} color="#16a34a" />
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>{stats.totalDownloads}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>{stats.totalViews} Total Views</div>
          </div>

          <div className="card" style={{ padding: '1.25rem', background: 'white' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
              <span>Registered Users</span>
              <Users size={18} color="#7c3aed" />
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>{stats.totalUsers}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>Students & Faculty</div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.75rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
        <button
          onClick={() => setActiveTab('pending')}
          className={`btn ${activeTab === 'pending' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <ShieldAlert size={16} /> Pending Queue ({pendingNotes.length})
        </button>
        <button
          onClick={() => setActiveTab('manage')}
          className={`btn ${activeTab === 'manage' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <FileText size={16} /> Manage All Notes ({allNotes.length})
        </button>
        <button
          onClick={() => setActiveTab('subjects')}
          className={`btn ${activeTab === 'subjects' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <BookOpen size={16} /> Manage Subjects ({subjects.length})
        </button>
      </div>

      {/* Tab 1: Pending Queue */}
      {activeTab === 'pending' && (
        <div>
          {pendingNotes.length === 0 ? (
            <div className="card" style={{ padding: '3.5rem 2rem', textAlign: 'center', background: 'white' }}>
              <CheckCircle2 size={44} color="#16a34a" style={{ margin: '0 auto 1rem' }} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                All clear! No notes awaiting moderation
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                When students upload PDF notes, they will appear here for verification and approval.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {pendingNotes.map((note) => (
                <div key={note.id} className="card" style={{ padding: '1.5rem', background: 'white' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.75rem' }}>
                    <div>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.4rem' }}>
                        <BranchBadge branch={note.branch} />
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, background: '#fef3c7', color: '#b45309', padding: '0.15rem 0.5rem', borderRadius: '9999px' }}>
                          Pending Review
                        </span>
                        {note.unit && <span style={{ fontSize: '0.75rem', color: '#64748b' }}>&bull; {note.unit}</span>}
                      </div>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 0.35rem' }}>{note.title}</h3>
                      <p style={{ fontSize: '0.85rem', color: '#2563eb', fontWeight: 600, margin: '0 0 0.5rem' }}>{note.subject}</p>
                      <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.5, margin: 0 }}>{note.description}</p>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => onPreviewNote && onPreviewNote(note)}
                        className="btn btn-secondary btn-sm"
                      >
                        <Eye size={14} /> Preview
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(note.id, 'approved')}
                        className="btn btn-primary btn-sm"
                        style={{ background: '#16a34a' }}
                      >
                        <CheckCircle2 size={14} /> Approve & Publish
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(note.id, 'rejected')}
                        className="btn btn-danger btn-sm"
                      >
                        <XCircle size={14} /> Reject
                      </button>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.775rem', color: '#94a3b8', display: 'flex', gap: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)' }}>
                    <span>Uploaded by: <strong>{note.uploaderName}</strong></span>
                    <span>File: {note.fileName} ({note.fileSize})</span>
                    <span>Date: {new Date(note.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Manage All Notes */}
      {activeTab === 'manage' && (
        <div>
          {/* Search & Filter Bar */}
          <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem', background: 'white', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, position: 'relative', minWidth: '240px' }}>
              <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                className="form-control"
                style={{ paddingLeft: '2.5rem' }}
                placeholder="Search notes to moderate or remove..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="form-control"
              style={{ width: '160px' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {filteredAllNotes.map((note) => (
              <div key={note.id} className="card" style={{ padding: '1rem 1.25rem', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <BranchBadge branch={note.branch} />
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 0.15rem' }}>
                      {note.title}
                    </h4>
                    <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
                      {note.subject} &bull; {note.downloads || 0} Downloads &bull; By {note.uploaderName}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '9999px',
                    background: note.status === 'approved' ? '#dcfce7' : note.status === 'pending' ? '#fef3c7' : '#fee2e2',
                    color: note.status === 'approved' ? '#166534' : note.status === 'pending' ? '#92400e' : '#991b1b'
                  }}>
                    {note.status}
                  </span>

                  <button onClick={() => onPreviewNote(note)} className="btn btn-secondary btn-sm" title="Preview">
                    <Eye size={13} />
                  </button>

                  {note.status !== 'approved' && (
                    <button
                      onClick={() => handleUpdateStatus(note.id, 'approved')}
                      className="btn btn-secondary btn-sm"
                      title="Approve"
                    >
                      <CheckCircle2 size={13} color="#16a34a" />
                    </button>
                  )}

                  <button
                    onClick={() => handleDeleteNote(note.id)}
                    className="btn btn-danger btn-sm"
                    title="Delete Permanently"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Manage Subjects */}
      {activeTab === 'subjects' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
          {/* Add Subject Card */}
          <div className="card" style={{ padding: '1.5rem', background: 'white' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.25rem' }}>
              Add New Subject
            </h3>
            <form onSubmit={handleAddSubject}>
              <div className="form-group">
                <label className="form-label">Subject Name *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Distributed Systems"
                  value={newSubName}
                  onChange={(e) => setNewSubName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Course Code</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. CS601"
                  value={newSubCode}
                  onChange={(e) => setNewSubCode(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Branch</label>
                <select className="form-control" value={newSubBranch} onChange={(e) => setNewSubBranch(e.target.value)}>
                  {['CSE', 'IT', 'EEE', 'ECE', 'Mechanical', 'Civil', 'Diploma'].map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Semester</label>
                <select className="form-control" value={newSubSem} onChange={(e) => setNewSubSem(e.target.value)}>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                    <option key={s} value={`Semester ${s}`}>Semester {s}</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={addingSubject}
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '0.5rem' }}
              >
                <Plus size={16} /> Add to Curriculum
              </button>
            </form>
          </div>

          {/* Subjects List */}
          <div className="card" style={{ padding: '1.5rem', background: 'white' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.25rem' }}>
              Active Curriculum Subjects ({subjects.length})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '500px', overflowY: 'auto' }}>
              {subjects.map((sub) => (
                <div key={sub.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{sub.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      {sub.code && <span style={{ fontWeight: 600 }}>[{sub.code}] </span>}
                      {sub.branch} &bull; {sub.semester}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteSubject(sub.id)}
                    className="btn btn-danger btn-sm"
                    style={{ padding: '0.35rem 0.6rem' }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
