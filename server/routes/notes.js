import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { db } from '../db.js';
import { optionalAuth, authenticateToken } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');

const router = express.Router();

// Configure Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    }
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const cleanOriginalName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}-${cleanOriginalName}`);
  }
});

// PDF file filter & size limit (15MB)
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ext !== '.pdf' && file.mimetype !== 'application/pdf') {
    return cb(new Error('Only PDF files (.pdf) are allowed!'), false);
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 15 * 1024 * 1024 } // 15 MB
});

// Format file size
const formatBytes = (bytes) => {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

// GET /api/notes - Browse, search, filter
router.get('/', optionalAuth, (req, res) => {
  try {
    const {
      branch,
      course,
      year,
      semester,
      subject,
      unit,
      search,
      status = 'approved',
      sort = 'newest'
    } = req.query;

    let notes = db.getNotes();

    // Role-based visibility
    const isAdmin = req.user && req.user.role === 'admin';
    if (!isAdmin && status !== 'all') {
      notes = notes.filter(n => n.status === 'approved');
    } else if (isAdmin && status && status !== 'all') {
      notes = notes.filter(n => n.status === status);
    }

    // Filter by branch
    if (branch && branch !== 'All') {
      notes = notes.filter(n => n.branch.toLowerCase() === branch.toLowerCase());
    }

    // Filter by course
    if (course && course !== 'All') {
      notes = notes.filter(n => n.course && n.course.toLowerCase() === course.toLowerCase());
    }

    // Filter by year
    if (year && year !== 'All') {
      notes = notes.filter(n => n.year && n.year.toLowerCase() === year.toLowerCase());
    }

    // Filter by semester
    if (semester && semester !== 'All') {
      notes = notes.filter(n => n.semester && n.semester.toLowerCase() === semester.toLowerCase());
    }

    // Filter by subject
    if (subject && subject !== 'All') {
      notes = notes.filter(n => n.subject && n.subject.toLowerCase() === subject.toLowerCase());
    }

    // Filter by unit
    if (unit && unit !== 'All') {
      notes = notes.filter(n => n.unit && n.unit.toLowerCase() === unit.toLowerCase());
    }

    // Search term query
    if (search && search.trim() !== '') {
      const q = search.toLowerCase().trim();
      notes = notes.filter(n =>
        n.title.toLowerCase().includes(q) ||
        n.subject.toLowerCase().includes(q) ||
        (n.description && n.description.toLowerCase().includes(q)) ||
        (n.tags && n.tags.some(tag => tag.toLowerCase().includes(q)))
      );
    }

    // Sorting
    if (sort === 'popular') {
      notes.sort((a, b) => (b.downloads || 0) - (a.downloads || 0));
    } else if (sort === 'views') {
      notes.sort((a, b) => (b.views || 0) - (a.views || 0));
    } else {
      // newest
      notes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    // Add isFavorited flag if authenticated
    if (req.user) {
      notes = notes.map(n => ({
        ...n,
        isFavorited: db.isFavorited(req.user.id, n.id)
      }));
    }

    res.json({
      total: notes.length,
      notes
    });
  } catch (err) {
    console.error('Error fetching notes:', err);
    res.status(500).json({ error: 'Failed to retrieve notes.' });
  }
});

// GET /api/notes/stats/summary - Dashboard & Home Page statistics
router.get('/stats/summary', (req, res) => {
  const allNotes = db.getNotes();
  const approved = allNotes.filter(n => n.status === 'approved');
  const pending = allNotes.filter(n => n.status === 'pending');
  const totalDownloads = allNotes.reduce((acc, n) => acc + (n.downloads || 0), 0);

  // Group by branch
  const branches = ['CSE', 'IT', 'EEE', 'ECE', 'Mechanical', 'Civil', 'Diploma'];
  const branchCounts = branches.map(b => ({
    name: b,
    count: approved.filter(n => n.branch === b).length
  }));

  // Popular subjects
  const subjectMap = {};
  approved.forEach(n => {
    if (n.subject) {
      subjectMap[n.subject] = (subjectMap[n.subject] || 0) + 1;
    }
  });
  const popularSubjects = Object.entries(subjectMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, count]) => ({ name, count }));

  // Recently added notes
  const recentNotes = [...approved]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 6);

  res.json({
    totalNotes: approved.length,
    pendingNotes: pending.length,
    totalDownloads,
    branchCounts,
    popularSubjects,
    recentNotes
  });
});

// GET /api/notes/:id - Single note details & preview
router.get('/:id', optionalAuth, (req, res) => {
  const { id } = req.params;
  const note = db.getNoteById(id);

  if (!note) {
    return res.status(404).json({ error: 'Note not found.' });
  }

  // Increment view counter
  const updatedNote = db.updateNote(id, { views: (note.views || 0) + 1 });

  res.json({
    note: {
      ...updatedNote,
      isFavorited: req.user ? db.isFavorited(req.user.id, id) : false
    }
  });
});

// POST /api/notes/upload - Upload a PDF note
router.post('/upload', optionalAuth, (req, res) => {
  upload.single('pdfFile')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File size exceeds 15MB limit. Please upload a smaller PDF.' });
      }
      return res.status(400).json({ error: `Upload error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }

    try {
      const {
        title,
        branch = 'CSE',
        course = 'B.Tech',
        year = '1st Year',
        semester = 'Semester 1',
        subject,
        unit = 'Unit 1',
        description = '',
        tags = ''
      } = req.body;

      if (!title || !subject) {
        // Remove uploaded file if required validation fails
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(400).json({ error: 'Title and Subject are required fields.' });
      }

      if (!req.file) {
        return res.status(400).json({ error: 'Please select a valid PDF file to upload.' });
      }

      // Check auto-approve setting
      const autoApprove = process.env.AUTO_APPROVE_UPLOADS === 'true' || (req.user && req.user.role === 'admin');

      const tagArray = typeof tags === 'string'
        ? tags.split(',').map(t => t.trim()).filter(Boolean)
        : Array.isArray(tags) ? tags : [];

      const newNote = {
        id: `note_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        title: title.trim(),
        branch,
        course,
        year,
        semester,
        subject: subject.trim(),
        unit,
        description: description.trim(),
        tags: tagArray.length > 0 ? tagArray : [branch, subject, unit],
        hasPdf: true,
        fileName: req.file.originalname,
        fileUrl: `/uploads/${req.file.filename}`,
        fileSize: formatBytes(req.file.size),
        uploaderId: req.user ? req.user.id : 'guest',
        uploaderName: req.user ? req.user.name : (req.body.authorName || 'Guest Student'),
        status: autoApprove ? 'approved' : 'pending',
        downloads: 0,
        views: 1,
        isAiGenerated: false,
        createdAt: new Date().toISOString()
      };

      db.addNote(newNote);

      res.status(201).json({
        message: autoApprove
          ? 'Note published successfully!'
          : 'Note submitted successfully! It will be visible in the library after admin approval.',
        note: newNote,
        isPending: !autoApprove
      });
    } catch (saveErr) {
      console.error('Note save error:', saveErr);
      res.status(500).json({ error: 'Failed to save note record.' });
    }
  });
});

// POST /api/notes/save-ai - Save AI-generated note directly into the library
router.post('/save-ai', optionalAuth, (req, res) => {
  try {
    const { title, branch, course, year, semester, subject, unit, content, marks, difficulty, language } = req.body;

    if (!title || !subject || !content) {
      return res.status(400).json({ error: 'Title, Subject, and Note Content are required.' });
    }

    const newNote = {
      id: `ai_note_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: title.trim(),
      branch: branch || 'CSE',
      course: course || 'B.Tech',
      year: year || '2nd Year',
      semester: semester || 'Semester 3',
      subject: subject.trim(),
      unit: unit || 'Topic Guide',
      description: `AI-Generated Study Notes (${marks || 'General'} Marks, ${difficulty || 'Standard'} level, ${language || 'English'}). Includes structured explanation, definitions, examples, and exam questions.`,
      tags: ['AI Generated', branch || 'Engineering', subject, marks ? `${marks} Marks` : 'Study Material'],
      hasPdf: false, // Can be downloaded via dynamic client/server PDF export
      content,
      uploaderId: req.user ? req.user.id : 'ai_assistant',
      uploaderName: req.user ? `${req.user.name} (via AI)` : 'ChatGPT Notes Hub AI',
      status: 'approved', // AI notes generated directly are approved
      downloads: 0,
      views: 1,
      isAiGenerated: true,
      createdAt: new Date().toISOString()
    };

    db.addNote(newNote);

    res.status(201).json({
      message: 'AI Notes saved to library successfully!',
      note: newNote
    });
  } catch (err) {
    console.error('Error saving AI note:', err);
    res.status(500).json({ error: 'Failed to save AI-generated note.' });
  }
});

// GET /api/notes/download/:id - Download file & increment count
router.get('/download/:id', (req, res) => {
  const { id } = req.params;
  const note = db.getNoteById(id);

  if (!note) {
    return res.status(404).json({ error: 'Note not found.' });
  }

  // Increment download counter
  db.updateNote(id, { downloads: (note.downloads || 0) + 1 });

  if (note.fileUrl) {
    const filename = path.basename(note.fileUrl);
    const filePath = path.join(UPLOADS_DIR, filename);

    if (fs.existsSync(filePath)) {
      return res.download(filePath, note.fileName || `${note.title}.pdf`);
    }
  }

  // If no physical file (e.g. AI note), return metadata so frontend can export PDF
  res.json({
    message: 'Dynamic note download requested.',
    note
  });
});

export default router;
