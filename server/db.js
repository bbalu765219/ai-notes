import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isVercel = Boolean(process.env.VERCEL);
const DATA_DIR = isVercel ? path.join('/tmp', 'data') : path.join(__dirname, 'data');
const UPLOADS_DIR = isVercel ? path.join('/tmp', 'uploads') : path.join(__dirname, 'uploads');

// Ensure data and uploads directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// If on Vercel, copy any existing bundled seed files to /tmp
if (isVercel) {
  const localDataDir = path.join(__dirname, 'data');
  if (fs.existsSync(localDataDir)) {
    try {
      const files = fs.readdirSync(localDataDir);
      for (const file of files) {
        const dest = path.join(DATA_DIR, file);
        if (!fs.existsSync(dest)) {
          fs.copyFileSync(path.join(localDataDir, file), dest);
        }
      }
    } catch (e) {
      console.warn('Seed copy warning on Vercel:', e);
    }
  }
}

const NOTES_FILE = path.join(DATA_DIR, 'notes.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const FAVORITES_FILE = path.join(DATA_DIR, 'favorites.json');
const SUBJECTS_FILE = path.join(DATA_DIR, 'subjects.json');

// Helper to read JSON file safely
const readJson = (filePath, fallback = []) => {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(fallback, null, 2), 'utf-8');
      return fallback;
    }
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content || '[]');
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
    return fallback;
  }
};

// Helper to write JSON file safely
const writeJson = (filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
    return false;
  }
};

// Create a minimal sample PDF file so sample notes have real downloadable PDFs
const createSamplePdf = (filename, title, subject) => {
  const filePath = path.join(UPLOADS_DIR, filename);
  if (!fs.existsSync(filePath)) {
    // Generate a valid minimal PDF buffer
    const pdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length 120 >>
stream
BT
/F1 20 Tf
50 720 Td
(ChatGPT Notes Hub: ${title.replace(/[()]/g, '')}) Tj
/F1 12 Tf
0 -30 Td
(Subject: ${subject.replace(/[()]/g, '')} - Verified Educational Material) Tj
0 -25 Td
(Official educational notes prepared for college semester exams.) Tj
0 -20 Td
(Disclaimer: AI-generated material should be checked against syllabus.) Tj
ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000244 00000 n 
0000000416 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
498
%%EOF`;
    fs.writeFileSync(filePath, pdfContent, 'utf-8');
  }
};

// Seed initial users if empty
const seedUsers = async () => {
  const users = readJson(USERS_FILE, []);
  if (users.length === 0) {
    const adminPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 10);
    const studentPassword = await bcrypt.hash('student123', 10);

    const initialUsers = [
      {
        id: 'usr_admin',
        name: 'Head Administrator',
        email: process.env.ADMIN_EMAIL || 'admin@noteshub.com',
        password: adminPassword,
        role: 'admin',
        branch: 'CSE',
        year: 'Faculty/Admin',
        college: 'State Technical University',
        createdAt: new Date().toISOString()
      },
      {
        id: 'usr_student1',
        name: 'Rahul Sharma',
        email: 'student@college.edu',
        password: studentPassword,
        role: 'student',
        branch: 'CSE',
        year: '3rd Year',
        college: 'Government Engineering College',
        createdAt: new Date().toISOString()
      }
    ];
    writeJson(USERS_FILE, initialUsers);
    console.log('✔ Initial users seeded (Admin: admin@noteshub.com / admin123)');
  }
};

// Seed initial rich subject list
const seedSubjects = () => {
  const subjects = readJson(SUBJECTS_FILE, []);
  if (subjects.length === 0) {
    const initialSubjects = [
      { id: 'sub_1', name: 'Data Structures & Algorithms', code: 'CS301', branch: 'CSE', semester: 'Semester 3', credits: 4 },
      { id: 'sub_2', name: 'Database Management Systems', code: 'CS402', branch: 'CSE', semester: 'Semester 4', credits: 4 },
      { id: 'sub_3', name: 'Operating Systems', code: 'CS403', branch: 'CSE', semester: 'Semester 4', credits: 3 },
      { id: 'sub_4', name: 'Artificial Intelligence & Machine Learning', code: 'CS601', branch: 'CSE', semester: 'Semester 6', credits: 4 },
      { id: 'sub_5', name: 'Cloud Computing & DevOps', code: 'IT502', branch: 'IT', semester: 'Semester 5', credits: 3 },
      { id: 'sub_6', name: 'Web Technologies & Full Stack', code: 'IT401', branch: 'IT', semester: 'Semester 4', credits: 4 },
      { id: 'sub_7', name: 'Power Systems Analysis', code: 'EE501', branch: 'EEE', semester: 'Semester 5', credits: 4 },
      { id: 'sub_8', name: 'Electrical Machines & Transformers', code: 'EE302', branch: 'EEE', semester: 'Semester 3', credits: 4 },
      { id: 'sub_9', name: 'Digital Signal Processing (DSP)', code: 'EC501', branch: 'ECE', semester: 'Semester 5', credits: 4 },
      { id: 'sub_10', name: 'VLSI Design & Embedded Systems', code: 'EC602', branch: 'ECE', semester: 'Semester 6', credits: 4 },
      { id: 'sub_11', name: 'Thermodynamics & Heat Transfer', code: 'ME301', branch: 'Mechanical', semester: 'Semester 3', credits: 4 },
      { id: 'sub_12', name: 'Fluid Mechanics & Hydraulic Machinery', code: 'ME402', branch: 'Mechanical', semester: 'Semester 4', credits: 3 },
      { id: 'sub_13', name: 'Structural Engineering & RCC', code: 'CE501', branch: 'Civil', semester: 'Semester 5', credits: 4 },
      { id: 'sub_14', name: 'Surveying & Geomatics', code: 'CE302', branch: 'Civil', semester: 'Semester 3', credits: 3 },
      { id: 'sub_15', name: 'Applied Mathematics & Engineering Physics', code: 'DIP101', branch: 'Diploma', semester: 'Semester 1', credits: 3 },
      { id: 'sub_16', name: 'Fundamentals of C Programming', code: 'DIP201', branch: 'Diploma', semester: 'Semester 2', credits: 3 }
    ];
    writeJson(SUBJECTS_FILE, initialSubjects);
  }
};

// Seed initial notes for library
const seedNotes = () => {
  const notes = readJson(NOTES_FILE, []);
  if (notes.length === 0) {
    // Generate sample PDF files
    createSamplePdf('dsa_unit2_trees.pdf', 'Binary Search Trees & AVL Trees', 'Data Structures & Algorithms');
    createSamplePdf('dbms_unit3_sql.pdf', 'Relational Algebra & SQL Normalization', 'Database Management Systems');
    createSamplePdf('os_unit2_scheduling.pdf', 'CPU Scheduling & Deadlocks', 'Operating Systems');
    createSamplePdf('ai_unit4_ml.pdf', 'Supervised Learning & Neural Networks', 'Artificial Intelligence & Machine Learning');
    createSamplePdf('web_unit1_react.pdf', 'Modern React Hooks & Architecture', 'Web Technologies & Full Stack');
    createSamplePdf('power_unit1_transmission.pdf', 'Transmission Line Parameters & Modeling', 'Power Systems Analysis');
    createSamplePdf('dsp_unit3_fft.pdf', 'Fast Fourier Transform (FFT) & Filters', 'Digital Signal Processing');
    createSamplePdf('thermo_unit2_carnot.pdf', 'Second Law of Thermodynamics & Entropy', 'Thermodynamics & Heat Transfer');
    createSamplePdf('rcc_unit1_beams.pdf', 'Limit State Design of Singly Reinforced Beams', 'Structural Engineering & RCC');
    createSamplePdf('diploma_c_programming.pdf', 'Pointers, Arrays & File Handling in C', 'Fundamentals of C Programming');

    const initialNotes = [
      {
        id: 'note_1',
        title: 'Complete Binary Search Trees, AVL Trees & Red-Black Trees',
        branch: 'CSE',
        course: 'B.Tech',
        year: '2nd Year',
        semester: 'Semester 3',
        subject: 'Data Structures & Algorithms',
        unit: 'Unit 2',
        description: 'Comprehensive handwritten & typed lecture notes covering BST rotations, AVL balance factors, search complexity O(log n), and past university question solutions.',
        tags: ['Trees', 'AVL Tree', 'BST', 'Complexity', 'Exam Special'],
        hasPdf: true,
        fileName: 'dsa_unit2_trees.pdf',
        fileUrl: '/uploads/dsa_unit2_trees.pdf',
        fileSize: '2.8 MB',
        uploaderId: 'usr_student1',
        uploaderName: 'Rahul Sharma',
        status: 'approved',
        downloads: 342,
        views: 890,
        isAiGenerated: false,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'note_2',
        title: 'Relational Algebra, SQL Joins & Normalization (1NF, 2NF, 3NF, BCNF)',
        branch: 'CSE',
        course: 'B.Tech',
        year: '2nd Year',
        semester: 'Semester 4',
        subject: 'Database Management Systems',
        unit: 'Unit 3',
        description: 'Detailed explanation of Functional Dependencies, Armstrong axioms, Lossless Join decomposition, and step-by-step 3NF & BCNF conversion examples with exam tricks.',
        tags: ['DBMS', 'Normalization', 'SQL', 'BCNF', 'Database'],
        hasPdf: true,
        fileName: 'dbms_unit3_sql.pdf',
        fileUrl: '/uploads/dbms_unit3_sql.pdf',
        fileSize: '3.1 MB',
        uploaderId: 'usr_admin',
        uploaderName: 'Prof. K. Rao (Faculty)',
        status: 'approved',
        downloads: 512,
        views: 1240,
        isAiGenerated: false,
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'note_3',
        title: 'CPU Scheduling Algorithms, Process Sync & Banker\'s Algorithm for Deadlocks',
        branch: 'CSE',
        course: 'B.Tech',
        year: '2nd Year',
        semester: 'Semester 4',
        subject: 'Operating Systems',
        unit: 'Unit 2',
        description: 'Covers FCFS, SJF, Round Robin, Priority Scheduling Gantt charts, Peterson solution, Semaphores, and Banker\'s Safety & Resource Request algorithm numerical problems.',
        tags: ['OS', 'Deadlocks', 'Semaphores', 'CPU Scheduling', 'Bankers Algorithm'],
        hasPdf: true,
        fileName: 'os_unit2_scheduling.pdf',
        fileUrl: '/uploads/os_unit2_scheduling.pdf',
        fileSize: '1.9 MB',
        uploaderId: 'usr_admin',
        uploaderName: 'Head Administrator',
        status: 'approved',
        downloads: 289,
        views: 750,
        isAiGenerated: false,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'note_4',
        title: 'Supervised Learning: Linear Regression, Decision Trees & Artificial Neural Nets',
        branch: 'CSE',
        course: 'B.Tech',
        year: '3rd Year',
        semester: 'Semester 6',
        subject: 'Artificial Intelligence & Machine Learning',
        unit: 'Unit 4',
        description: 'Clear intuition, mathematical formulations, cost functions, gradient descent derivation, activation functions (ReLU, Sigmoid), and Backpropagation algorithm.',
        tags: ['AI', 'Machine Learning', 'Neural Networks', 'Regression', 'Gradient Descent'],
        hasPdf: true,
        fileName: 'ai_unit4_ml.pdf',
        fileUrl: '/uploads/ai_unit4_ml.pdf',
        fileSize: '4.2 MB',
        uploaderId: 'usr_student1',
        uploaderName: 'Rahul Sharma',
        status: 'approved',
        downloads: 418,
        views: 990,
        isAiGenerated: false,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'note_5',
        title: 'Full Stack Web Architecture: React Components, State, Hooks & REST APIs',
        branch: 'IT',
        course: 'B.Tech',
        year: '2nd Year',
        semester: 'Semester 4',
        subject: 'Web Technologies & Full Stack',
        unit: 'Unit 1',
        description: 'Complete guide to modern front-end development, Virtual DOM, React lifecycle, useEffect, Custom Hooks, Async/Await fetch patterns, and JWT token authorization.',
        tags: ['React', 'JavaScript', 'Web Dev', 'REST API', 'Frontend'],
        hasPdf: true,
        fileName: 'web_unit1_react.pdf',
        fileUrl: '/uploads/web_unit1_react.pdf',
        fileSize: '2.4 MB',
        uploaderId: 'usr_admin',
        uploaderName: 'Head Administrator',
        status: 'approved',
        downloads: 380,
        views: 860,
        isAiGenerated: false,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'note_6',
        title: 'Transmission Line Parameters, Ferranti Effect & Surge Impedance Loading',
        branch: 'EEE',
        course: 'B.Tech',
        year: '3rd Year',
        semester: 'Semester 5',
        subject: 'Power Systems Analysis',
        unit: 'Unit 1',
        description: 'Resistance, inductance of single and 3-phase lines, transposition, GMD & GMR calculations, ABCD parameters, Ferranti effect, and voltage regulation formulas.',
        tags: ['Power Systems', 'Transmission', 'Ferranti Effect', 'GMD', 'Electrical'],
        hasPdf: true,
        fileName: 'power_unit1_transmission.pdf',
        fileUrl: '/uploads/power_unit1_transmission.pdf',
        fileSize: '3.5 MB',
        uploaderId: 'usr_admin',
        uploaderName: 'Prof. Anitha (EEE)',
        status: 'approved',
        downloads: 215,
        views: 610,
        isAiGenerated: false,
        createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'note_7',
        title: 'Radix-2 FFT Algorithms (DIT & DIF) & FIR/IIR Butterworth Filter Design',
        branch: 'ECE',
        course: 'B.Tech',
        year: '3rd Year',
        semester: 'Semester 5',
        subject: 'Digital Signal Processing (DSP)',
        unit: 'Unit 3',
        description: 'Step-by-step 8-point Decimation-In-Time (DIT) and Decimation-In-Frequency (DIF) butterfly diagrams, Twiddle factors, and bilinear transformation filter design.',
        tags: ['DSP', 'FFT', 'Butterfly Diagram', 'IIR Filter', 'ECE'],
        hasPdf: true,
        fileName: 'dsp_unit3_fft.pdf',
        fileUrl: '/uploads/dsp_unit3_fft.pdf',
        fileSize: '3.8 MB',
        uploaderId: 'usr_admin',
        uploaderName: 'Dr. V. Prasad',
        status: 'approved',
        downloads: 310,
        views: 740,
        isAiGenerated: false,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'note_8',
        title: 'Second Law of Thermodynamics, Clausius Inequality & Entropy Principle',
        branch: 'Mechanical',
        course: 'B.Tech',
        year: '2nd Year',
        semester: 'Semester 3',
        subject: 'Thermodynamics & Heat Transfer',
        unit: 'Unit 2',
        description: 'Kelvin-Planck & Clausius statements, Carnot cycle efficiency, reversible vs irreversible processes, entropy generation, and T-s/P-v property diagrams.',
        tags: ['Thermodynamics', 'Carnot Cycle', 'Entropy', 'Mechanical', 'Heat Engine'],
        hasPdf: true,
        fileName: 'thermo_unit2_carnot.pdf',
        fileUrl: '/uploads/thermo_unit2_carnot.pdf',
        fileSize: '2.6 MB',
        uploaderId: 'usr_student1',
        uploaderName: 'K. Sridhar (Mech)',
        status: 'approved',
        downloads: 245,
        views: 580,
        isAiGenerated: false,
        createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'note_9',
        title: 'Limit State Design of Singly & Doubly Reinforced Concrete Beams (IS 456:2000)',
        branch: 'Civil',
        course: 'B.Tech',
        year: '3rd Year',
        semester: 'Semester 5',
        subject: 'Structural Engineering & RCC',
        unit: 'Unit 1',
        description: 'Neutral axis depth, moment of resistance formulas, under-reinforced vs over-reinforced sections, shear reinforcement, and IS 456 codal provisions with solved numericals.',
        tags: ['RCC', 'Civil Engineering', 'IS 456', 'Beam Design', 'Limit State'],
        hasPdf: true,
        fileName: 'rcc_unit1_beams.pdf',
        fileUrl: '/uploads/rcc_unit1_beams.pdf',
        fileSize: '4.0 MB',
        uploaderId: 'usr_admin',
        uploaderName: 'Civil Dept. Faculty',
        status: 'approved',
        downloads: 198,
        views: 530,
        isAiGenerated: false,
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'note_10',
        title: 'Mastering C Pointers, Dynamic Memory Allocation & File Operations',
        branch: 'Diploma',
        course: 'Diploma',
        year: '1st Year',
        semester: 'Semester 2',
        subject: 'Fundamentals of C Programming',
        unit: 'Unit 3',
        description: 'Pointer arithmetic, malloc/calloc/free, passing pointers to functions, structures vs unions, and file read/write operations with full code examples.',
        tags: ['C Programming', 'Pointers', 'Diploma', 'Memory Allocation', 'Code'],
        hasPdf: true,
        fileName: 'diploma_c_programming.pdf',
        fileUrl: '/uploads/diploma_c_programming.pdf',
        fileSize: '1.7 MB',
        uploaderId: 'usr_student1',
        uploaderName: 'Rahul Sharma',
        status: 'approved',
        downloads: 440,
        views: 1100,
        isAiGenerated: false,
        createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
    writeJson(NOTES_FILE, initialNotes);
    console.log('✔ Initial study notes seeded successfully.');
  }
};

// Database interface
export const db = {
  // Notes operations
  getNotes: () => readJson(NOTES_FILE, []),
  saveNotes: (notes) => writeJson(NOTES_FILE, notes),
  getNoteById: (id) => readJson(NOTES_FILE, []).find(n => n.id === id),
  addNote: (note) => {
    const notes = readJson(NOTES_FILE, []);
    notes.unshift(note);
    writeJson(NOTES_FILE, notes);
    return note;
  },
  updateNote: (id, updates) => {
    const notes = readJson(NOTES_FILE, []);
    const index = notes.findIndex(n => n.id === id);
    if (index === -1) return null;
    notes[index] = { ...notes[index], ...updates, updatedAt: new Date().toISOString() };
    writeJson(NOTES_FILE, notes);
    return notes[index];
  },
  deleteNote: (id) => {
    const notes = readJson(NOTES_FILE, []);
    const filtered = notes.filter(n => n.id !== id);
    writeJson(NOTES_FILE, filtered);
    // Also remove from favorites
    const favs = readJson(FAVORITES_FILE, []).filter(f => f.noteId !== id);
    writeJson(FAVORITES_FILE, favs);
    return true;
  },

  // Users operations
  getUsers: () => readJson(USERS_FILE, []),
  getUserById: (id) => readJson(USERS_FILE, []).find(u => u.id === id),
  getUserByEmail: (email) => readJson(USERS_FILE, []).find(u => u.email.toLowerCase() === email.toLowerCase().trim()),
  addUser: (user) => {
    const users = readJson(USERS_FILE, []);
    users.push(user);
    writeJson(USERS_FILE, users);
    return user;
  },

  // Favorites operations
  getFavorites: (userId) => {
    const favs = readJson(FAVORITES_FILE, []).filter(f => f.userId === userId);
    const notes = readJson(NOTES_FILE, []);
    // Join with notes
    return favs.map(f => {
      const note = notes.find(n => n.id === f.noteId);
      return note ? { ...note, favoritedAt: f.createdAt } : null;
    }).filter(Boolean);
  },
  isFavorited: (userId, noteId) => {
    const favs = readJson(FAVORITES_FILE, []);
    return favs.some(f => f.userId === userId && f.noteId === noteId);
  },
  toggleFavorite: (userId, noteId) => {
    const favs = readJson(FAVORITES_FILE, []);
    const index = favs.findIndex(f => f.userId === userId && f.noteId === noteId);
    if (index >= 0) {
      favs.splice(index, 1);
      writeJson(FAVORITES_FILE, favs);
      return { favorited: false };
    } else {
      favs.push({
        id: `fav_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        userId,
        noteId,
        createdAt: new Date().toISOString()
      });
      writeJson(FAVORITES_FILE, favs);
      return { favorited: true };
    }
  },

  // Subjects operations
  getSubjects: () => readJson(SUBJECTS_FILE, []),
  addSubject: (subject) => {
    const subs = readJson(SUBJECTS_FILE, []);
    subs.push(subject);
    writeJson(SUBJECTS_FILE, subs);
    return subject;
  },
  deleteSubject: (id) => {
    const subs = readJson(SUBJECTS_FILE, []).filter(s => s.id !== id);
    writeJson(SUBJECTS_FILE, subs);
    return true;
  },

  // Initializer
  init: async () => {
    await seedUsers();
    seedSubjects();
    seedNotes();
  }
};
