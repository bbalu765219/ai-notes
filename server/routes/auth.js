import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'notes_hub_jwt_super_secret_key_2026';

// Register a new student
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, branch = 'CSE', year = '1st Year', college = '' } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const existingUser = db.getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: 'student',
      branch,
      year,
      college: college.trim(),
      createdAt: new Date().toISOString()
    };

    db.addUser(newUser);

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Account created successfully!',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        branch: newUser.branch,
        year: newUser.year,
        college: newUser.college
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Server error during registration.' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = db.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Logged in successfully!',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        branch: user.branch,
        year: user.year,
        college: user.college
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login.' });
  }
});

// Get current user profile
router.get('/me', authenticateToken, (req, res) => {
  const user = db.getUserById(req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }

  const favorites = db.getFavorites(user.id);
  const userUploads = db.getNotes().filter(n => n.uploaderId === user.id);

  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      branch: user.branch,
      year: user.year,
      college: user.college,
      createdAt: user.createdAt
    },
    favoritesCount: favorites.length,
    uploadsCount: userUploads.length
  });
});

// Get user favorite notes
router.get('/favorites', authenticateToken, (req, res) => {
  const favorites = db.getFavorites(req.user.id);
  res.json({ favorites });
});

// Toggle favorite note
router.post('/favorites/toggle/:noteId', authenticateToken, (req, res) => {
  const { noteId } = req.params;
  const note = db.getNoteById(noteId);
  if (!note) {
    return res.status(404).json({ error: 'Note not found.' });
  }

  const result = db.toggleFavorite(req.user.id, noteId);
  res.json({
    success: true,
    favorited: result.favorited,
    message: result.favorited ? 'Added to favorites!' : 'Removed from favorites.'
  });
});

// Get user's uploaded notes history
router.get('/my-uploads', authenticateToken, (req, res) => {
  const notes = db.getNotes().filter(n => n.uploaderId === req.user.id);
  res.json({ uploads: notes });
});

export default router;
