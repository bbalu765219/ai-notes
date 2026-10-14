import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from '../db.js';
import { requireAdmin } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');

const router = express.Router();

// Apply requireAdmin middleware to all admin routes
router.use(requireAdmin);

// GET /api/admin/stats - Admin Dashboard overview
router.get('/stats', (req, res) => {
  const allNotes = db.getNotes();
  const allUsers = db.getUsers();
  const approved = allNotes.filter(n => n.status === 'approved');
  const pending = allNotes.filter(n => n.status === 'pending');
  const rejected = allNotes.filter(n => n.status === 'rejected');
  const totalDownloads = allNotes.reduce((acc, n) => acc + (n.downloads || 0), 0);
  const totalViews = allNotes.reduce((acc, n) => acc + (n.views || 0), 0);

  const branches = ['CSE', 'IT', 'EEE', 'ECE', 'Mechanical', 'Civil', 'Diploma'];
  const branchStats = branches.map(b => ({
    branch: b,
    count: allNotes.filter(n => n.branch === b).length
  }));

  res.json({
    stats: {
      totalNotes: allNotes.length,
      approvedNotes: approved.length,
      pendingNotes: pending.length,
      rejectedNotes: rejected.length,
      totalUsers: allUsers.length,
      totalDownloads,
      totalViews,
      autoApproveEnabled: process.env.AUTO_APPROVE_UPLOADS === 'true'
    },
    branchStats
  });
});

// GET /api/admin/pending - Get pending notes for moderation
router.get('/pending', (req, res) => {
  const allNotes = db.getNotes();
  const pending = allNotes.filter(n => n.status === 'pending');
  res.json({ pending });
});

// GET /api/admin/all-notes - Get all notes with status
router.get('/all-notes', (req, res) => {
  const { status, search } = req.query;
  let notes = db.getNotes();

  if (status && status !== 'all') {
    notes = notes.filter(n => n.status === status);
  }

  if (search && search.trim() !== '') {
    const q = search.toLowerCase().trim();
    notes = notes.filter(n =>
      n.title.toLowerCase().includes(q) ||
      n.subject.toLowerCase().includes(q) ||
      n.uploaderName.toLowerCase().includes(q)
    );
  }

  res.json({ total: notes.length, notes });
});

// PATCH /api/admin/notes/:id/status - Approve or reject note
router.patch('/notes/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['approved', 'rejected', 'pending'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status. Must be approved, rejected, or pending.' });
  }

  const updated = db.updateNote(id, { status });
  if (!updated) {
    return res.status(404).json({ error: 'Note not found.' });
  }

  res.json({
    message: `Note status updated to ${status}.`,
    note: updated
  });
});

// DELETE /api/admin/notes/:id - Delete note and file
router.delete('/notes/:id', (req, res) => {
  const { id } = req.params;
  const note = db.getNoteById(id);

  if (!note) {
    return res.status(404).json({ error: 'Note not found.' });
  }

  // Delete physical file if exists
  if (note.fileUrl) {
    const filename = path.basename(note.fileUrl);
    const filePath = path.join(UPLOADS_DIR, filename);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.warn('Failed to delete file on disk:', err);
      }
    }
  }

  db.deleteNote(id);
  res.json({ message: 'Note deleted successfully.' });
});

// GET /api/admin/subjects - List subjects
router.get('/subjects', (req, res) => {
  const subjects = db.getSubjects();
  res.json({ subjects });
});

// POST /api/admin/subjects - Add subject
router.post('/subjects', (req, res) => {
  const { name, code, branch, semester, credits = 3 } = req.body;
  if (!name || !branch) {
    return res.status(400).json({ error: 'Subject name and branch are required.' });
  }

  const newSubject = {
    id: `sub_${Date.now()}`,
    name: name.trim(),
    code: (code || '').toUpperCase().trim(),
    branch,
    semester: semester || 'Semester 1',
    credits: Number(credits) || 3
  };

  db.addSubject(newSubject);
  res.status(201).json({ message: 'Subject added successfully.', subject: newSubject });
});

// DELETE /api/admin/subjects/:id - Delete subject
router.delete('/subjects/:id', (req, res) => {
  const { id } = req.params;
  db.deleteSubject(id);
  res.json({ message: 'Subject removed successfully.' });
});

export default router;
