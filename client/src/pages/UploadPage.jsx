import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, X, ArrowRight, ShieldCheck } from 'lucide-react';
import { api } from '../utils/api';

const BRANCHES = ['CSE', 'IT', 'EEE', 'ECE', 'Mechanical', 'Civil', 'Diploma'];
const COURSES = ['B.Tech', 'Diploma', 'BCA', 'M.Tech'];
const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
const SEMESTERS = ['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 'Semester 5', 'Semester 6', 'Semester 7', 'Semester 8'];
const UNITS = ['Unit 1', 'Unit 2', 'Unit 3', 'Unit 4', 'Unit 5', 'Complete Syllabus'];

export default function UploadPage({ user, onUploadSuccess, onNavigate }) {
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [dragActive, setDragActive] = useState(false);

  // Form Fields
  const [title, setTitle] = useState('');
  const [branch, setBranch] = useState(user?.branch || 'CSE');
  const [course, setCourse] = useState('B.Tech');
  const [year, setYear] = useState(user?.year || '2nd Year');
  const [semester, setSemester] = useState('Semester 3');
  const [subject, setSubject] = useState('');
  const [unit, setUnit] = useState('Unit 1');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [authorName, setAuthorName] = useState(user?.name || '');

  // Upload Status
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const fileInputRef = useRef(null);

  const validateAndSetFile = (selectedFile) => {
    setFileError('');
    if (!selectedFile) return;

    if (!selectedFile.name.toLowerCase().endsWith('.pdf') && selectedFile.type !== 'application/pdf') {
      setFileError('Invalid file format. Only PDF files (.pdf) are allowed.');
      return;
    }

    // 15 MB limit check
    if (selectedFile.size > 15 * 1024 * 1024) {
      setFileError('File size exceeds 15MB limit. Please upload a compressed or smaller PDF file.');
      return;
    }

    setFile(selectedFile);
    if (!title) {
      // Auto-suggest title from filename
      const cleanName = selectedFile.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!file) {
      setFileError('Please select a PDF file to upload.');
      return;
    }

    if (!title.trim() || !subject.trim()) {
      setErrorMessage('Please fill in both the Note Title and Subject Name.');
      return;
    }

    const formData = new FormData();
    formData.append('pdfFile', file);
    formData.append('title', title.trim());
    formData.append('branch', branch);
    formData.append('course', course);
    formData.append('year', year);
    formData.append('semester', semester);
    formData.append('subject', subject.trim());
    formData.append('unit', unit);
    formData.append('description', description.trim());
    formData.append('tags', tags);
    if (authorName.trim()) {
      formData.append('authorName', authorName.trim());
    }

    setUploading(true);

    try {
      const response = await api.uploadNote(formData);
      setUploadResult(response);
      if (onUploadSuccess) onUploadSuccess(response.note);
    } catch (err) {
      console.error('Upload error:', err);
      setErrorMessage(err.message || 'Failed to upload PDF note.');
    } finally {
      setUploading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setTitle('');
    setSubject('');
    setDescription('');
    setTags('');
    setUploadResult(null);
    setErrorMessage('');
    setFileError('');
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1.25rem', maxWidth: '840px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--dark)', marginBottom: '0.5rem' }}>
          Upload Educational PDF Notes
        </h1>
        <p style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>
          Share your class lecture notes, solved question banks, and syllabus guides with college peers.
        </p>
      </div>

      {uploadResult ? (
        /* Success Card */
        <div className="card" style={{ padding: '3rem 2rem', textAlign: 'center', background: 'white' }}>
          <div style={{
            width: 60,
            height: 60,
            borderRadius: '50%',
            background: '#dcfce7',
            color: '#16a34a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem'
          }}>
            <CheckCircle2 size={36} />
          </div>

          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.75rem', color: '#166534' }}>
            {uploadResult.message || 'Note Uploaded Successfully!'}
          </h2>

          <p style={{ color: 'var(--text-muted)', maxWidth: '540px', margin: '0 auto 2rem', fontSize: '0.95rem', lineHeight: 1.6 }}>
            {uploadResult.isPending
              ? 'Your PDF has been saved and submitted to the moderation queue. An administrator will review and publish it to the student library shortly.'
              : 'Your PDF is now permanently saved in the database and immediately available in the Student Notes Library!'}
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <button onClick={() => onNavigate('library')} className="btn btn-primary">
              View in Notes Library <ArrowRight size={16} />
            </button>
            <button onClick={handleReset} className="btn btn-secondary">
              Upload Another Note
            </button>
          </div>
        </div>
      ) : (
        /* Upload Form */
        <div className="card" style={{ padding: '2.25rem', background: 'white' }}>
          {errorMessage && (
            <div style={{
              background: '#fee2e2',
              border: '1px solid #fca5a5',
              borderRadius: 'var(--radius-md)',
              padding: '0.85rem 1.25rem',
              color: '#991b1b',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.9rem'
            }}>
              <AlertCircle size={18} /> {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* File Dropzone */}
            <div className="form-group" style={{ marginBottom: '1.75rem' }}>
              <label className="form-label">Upload PDF File (Max 15 MB) *</label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                style={{ display: 'none' }}
                onChange={(e) => e.target.files && validateAndSetFile(e.target.files[0])}
              />

              {!file ? (
                <div
                  className={`dropzone ${dragActive ? 'drag-active' : ''}`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div style={{
                    width: 48,
                    height: 48,
                    borderRadius: '12px',
                    background: '#eff6ff',
                    color: '#2563eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 0.85rem'
                  }}>
                    <Upload size={24} />
                  </div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                    Click to select PDF or drag and drop file here
                  </h4>
                  <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
                    Supports single PDF files up to 15MB with verified educational content
                  </p>
                </div>
              ) : (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1rem 1.25rem',
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: 'var(--radius-md)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: 40, height: 40, borderRadius: 8, background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FileText size={20} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>{file.name}</h4>
                      <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
                        {(file.size / (1024 * 1024)).toFixed(2)} MB &bull; PDF Document
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '0.4rem' }}
                  >
                    <X size={18} />
                  </button>
                </div>
              )}

              {fileError && (
                <div style={{ color: '#dc2626', fontSize: '0.8rem', marginTop: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <AlertCircle size={14} /> {fileError}
                </div>
              )}
            </div>

            {/* Title */}
            <div className="form-group">
              <label className="form-label">Note Title *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Complete Unit 2 Notes on Relational Algebra & SQL Normalization"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            {/* Course, Branch, Year, Semester */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Branch *</label>
                <select className="form-control" value={branch} onChange={(e) => setBranch(e.target.value)}>
                  {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Course</label>
                <select className="form-control" value={course} onChange={(e) => setCourse(e.target.value)}>
                  {COURSES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Year</label>
                <select className="form-control" value={year} onChange={(e) => setYear(e.target.value)}>
                  {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Semester</label>
                <select className="form-control" value={semester} onChange={(e) => setSemester(e.target.value)}>
                  {SEMESTERS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            {/* Subject & Unit */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Subject Name *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Database Management Systems"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Unit / Module</label>
                <select className="form-control" value={unit} onChange={(e) => setUnit(e.target.value)}>
                  {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label">Description & Topic Coverage</label>
              <textarea
                className="form-control"
                rows="3"
                placeholder="Briefly describe what chapters, derivations, or solved exam problems are included in this PDF..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Tags & Contributor */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Tags (comma-separated)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. SQL, 3NF, BCNF, Solved Exam Questions"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Contributor / Faculty Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Rahul Sharma or Prof. Kumar"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={uploading}
              className="btn btn-primary btn-lg"
              style={{ width: '100%', gap: '0.65rem' }}
            >
              <Upload size={18} />
              {uploading ? 'Uploading & Processing PDF...' : 'Publish PDF Note to Hub'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
