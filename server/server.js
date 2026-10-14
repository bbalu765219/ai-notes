import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from './db.js';

import authRoutes from './routes/auth.js';
import notesRoutes from './routes/notes.js';
import aiRoutes from './routes/ai.js';
import adminRoutes from './routes/admin.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static uploads folder for serving PDFs
const uploadsPath = path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadsPath));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'ChatGPT Notes Hub API',
    timestamp: new Date().toISOString()
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/admin', adminRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error occurred.'
  });
});

// Initialize database
db.init().catch(err => console.error('DB initialization error:', err));

// Start server if not running in serverless environment
async function startServer() {
  try {
    app.listen(PORT, () => {
      console.log(`===============================================`);
      console.log(`🚀 ChatGPT Notes Hub Backend running on port ${PORT}`);
      console.log(`📁 Uploads directory: ${uploadsPath}`);
      console.log(`🔑 Admin account: ${process.env.ADMIN_EMAIL || 'admin@noteshub.com'}`);
      console.log(`🤖 AI Status: ${process.env.GEMINI_API_KEY ? 'Gemini Active' : 'Fallback Engine Ready'}`);
      console.log(`===============================================`);
    });
  } catch (err) {
    console.error('Fatal initialization error:', err);
    process.exit(1);
  }
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
