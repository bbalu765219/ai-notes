import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Download,
  Copy,
  Check,
  BookmarkPlus,
  AlertTriangle,
  Info,
  BookOpen,
  ArrowRight,
  Layers,
  Settings,
  HelpCircle
} from 'lucide-react';
import { api } from '../utils/api';
import { exportNotesToPdf } from '../utils/pdfGenerator';

const BRANCHES = ['CSE', 'IT', 'EEE', 'ECE', 'Mechanical', 'Civil', 'Diploma'];
const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
const SEMESTERS = ['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 'Semester 5', 'Semester 6', 'Semester 7', 'Semester 8'];
const MARK_OPTIONS = [
  { value: '2', label: '2 Marks', desc: 'Concise definitions & key principles' },
  { value: '5', label: '5 Marks', desc: 'Core theory, points & examples' },
  { value: '8', label: '8 Marks', desc: 'In-depth derivation & questions' },
  { value: '10', label: '10 Marks', desc: 'Comprehensive master-level guide' }
];

export default function AiGeneratorPage({ onSaveSuccess, onNavigate }) {
  // Form State
  const [branch, setBranch] = useState('CSE');
  const [course, setCourse] = useState('B.Tech');
  const [year, setYear] = useState('2nd Year');
  const [semester, setSemester] = useState('Semester 3');
  const [subject, setSubject] = useState('Data Structures & Algorithms');
  const [topic, setTopic] = useState('Binary Search Trees & AVL Rotations');
  const [marks, setMarks] = useState('8');
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [language, setLanguage] = useState('English');

  // Generator & Output State
  const [loading, setLoading] = useState(false);
  const [generatedResult, setGeneratedResult] = useState(null);
  const [aiStatus, setAiStatus] = useState(null);
  const [copied, setCopied] = useState(false);
  const [savingToLibrary, setSavingToLibrary] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  useEffect(() => {
    checkBackendAiStatus();
  }, []);

  const checkBackendAiStatus = async () => {
    try {
      const status = await api.checkAiStatus();
      setAiStatus(status);
    } catch (err) {
      console.warn('Could not check AI status:', err);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !topic.trim()) {
      alert('Please provide both Subject Name and Unit / Topic.');
      return;
    }

    setLoading(true);
    setGeneratedResult(null);
    setSaveSuccessMsg(null);

    try {
      const response = await api.generateAiNotes({
        branch,
        course,
        year,
        semester,
        subject: subject.trim(),
        topic: topic.trim(),
        marks,
        difficulty,
        language
      });

      setGeneratedResult(response);
    } catch (err) {
      console.error('Generation error:', err);
      alert('Failed to generate notes: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (generatedResult?.content) {
      navigator.clipboard.writeText(generatedResult.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleExportPdf = async () => {
    if (!generatedResult?.content) return;
    setIsExportingPdf(true);
    try {
      await exportNotesToPdf({
        elementId: 'ai-notes-print-container',
        title: `${subject} - ${topic}`,
        subject,
        topic,
        branch,
        marks,
        difficulty,
        language,
        content: generatedResult.content
      });
    } catch (err) {
      console.error('PDF export failed:', err);
      alert('Failed to export PDF: ' + err.message);
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleSaveToLibrary = async () => {
    if (!generatedResult?.content) return;
    setSavingToLibrary(true);
    try {
      await api.saveAiNote({
        title: `${subject}: ${topic} (${marks} Marks Study Notes)`,
        branch,
        course,
        year,
        semester,
        subject,
        unit: topic,
        content: generatedResult.content,
        marks,
        difficulty,
        language
      });
      setSaveSuccessMsg('Note saved directly to the Student Notes Library!');
      if (onSaveSuccess) onSaveSuccess();
    } catch (err) {
      console.error('Save to library failed:', err);
      alert('Failed to save to library: ' + err.message);
    } finally {
      setSavingToLibrary(false);
    }
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1.25rem' }}>
      {/* Page Title */}
      <div style={{ marginBottom: '2rem', textAlign: 'center', maxWidth: '780px', margin: '0 auto 2.5rem' }}>
        <div className="hero-badge" style={{ margin: '0 auto 1rem' }}>
          <Sparkles size={16} />
          <span>Curriculum-Aligned AI Generator</span>
        </div>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--dark)', marginBottom: '0.75rem' }}>
          AI Educational Notes Generator
        </h1>
        <p style={{ fontSize: '1.05rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
          Generate customized college study material with formal explanations, key definitions, real-world examples, and expected exam questions for <strong>2, 5, 8, or 10 marks</strong> in English or Telugu.
        </p>
      </div>

      {/* AI API Status Banner */}
      {aiStatus && !aiStatus.isConfigured && (
        <div style={{
          background: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem 1.5rem',
          marginBottom: '2rem',
          display: 'flex',
          gap: '1rem',
          alignItems: 'flex-start'
        }}>
          <Info size={24} color="#2563eb" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e40af', marginBottom: '0.35rem' }}>
              Sample Educational Mode Active (No AI API Key Configured)
            </h4>
            <p style={{ fontSize: '0.875rem', color: '#1e3a8a', lineHeight: 1.5, margin: 0 }}>
              The backend is currently running our <strong>Curriculum-Aligned Educational Notes Engine</strong>. You will receive structured notes, definitions, examples, and exam questions immediately. To enable real-time generative AI, add your free Gemini API key to <code>server/.env</code>:
            </p>
            <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', background: '#dbeafe', padding: '0.35rem 0.75rem', borderRadius: '4px', display: 'inline-block', fontFamily: 'monospace' }}>
              GEMINI_API_KEY=your_key_here (Free from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" style={{ textDecoration: 'underline' }}>Google AI Studio</a>)
            </div>
          </div>
        </div>
      )}

      {/* Generator Form Card */}
      <div className="card" style={{ padding: '2rem', maxWidth: '880px', margin: '0 auto 2.5rem', background: 'white' }}>
        <form onSubmit={handleGenerate}>
          {/* Row 1: Branch & Course */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Course / Degree</label>
              <select className="form-control" value={course} onChange={(e) => setCourse(e.target.value)}>
                <option value="B.Tech">B.Tech (Bachelor of Technology)</option>
                <option value="Diploma">Diploma / Polytechnic</option>
                <option value="BCA">BCA (Computer Applications)</option>
                <option value="M.Tech">M.Tech / Post-Graduate</option>
              </select>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Engineering Branch</label>
              <select className="form-control" value={branch} onChange={(e) => setBranch(e.target.value)}>
                {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Academic Year</label>
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

          {/* Row 2: Subject & Unit/Topic */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Subject Name *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Operating Systems, Thermodynamics"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Unit or Specific Topic *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Deadlocks & Banker's Algorithm, Carnot Cycle"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Row 3: Exam Marks Selection */}
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">
              Target Exam Marks Weightage (Affects Answer Depth & Question Format)
            </label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: '0.75rem'
            }}>
              {MARK_OPTIONS.map((opt) => {
                const isSelected = marks === opt.value;
                return (
                  <div
                    key={opt.value}
                    onClick={() => setMarks(opt.value)}
                    style={{
                      border: `2px solid ${isSelected ? 'var(--primary)' : 'var(--border-subtle)'}`,
                      background: isSelected ? 'var(--primary-light)' : 'white',
                      borderRadius: 'var(--radius-md)',
                      padding: '0.85rem 1rem',
                      cursor: 'pointer',
                      transition: 'all 0.15s'
                    }}
                  >
                    <div style={{
                      fontWeight: 700,
                      fontSize: '1rem',
                      color: isSelected ? 'var(--primary-dark)' : 'var(--dark)',
                      marginBottom: '0.2rem'
                    }}>
                      {opt.label}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', lineHeight: 1.3 }}>
                      {opt.desc}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Row 4: Difficulty & Language */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '2rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Difficulty Level</label>
              <select className="form-control" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                <option value="Beginner">Beginner (Foundational intuition & simple terms)</option>
                <option value="Intermediate">Intermediate (Standard university exam syllabus)</option>
                <option value="Advanced">Advanced (Rigorous derivations & competitive depth)</option>
              </select>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Language</label>
              <select className="form-control" value={language} onChange={(e) => setLanguage(e.target.value)}>
                <option value="English">English</option>
                <option value="Telugu">Telugu (తెలుగు మీడియం విద్యార్థుల కోసం)</option>
              </select>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-lg"
            style={{ width: '100%', gap: '0.65rem' }}
          >
            <Sparkles size={20} />
            {loading ? 'Synthesizing Educational Notes with AI...' : `Generate ${marks} Marks Study Notes`}
          </button>
        </form>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="card" style={{ padding: '3rem 2rem', textAlign: 'center', maxWidth: '880px', margin: '0 auto 2.5rem', background: 'white' }}>
          <div style={{
            width: 50,
            height: 50,
            border: '4px solid #e2e8f0',
            borderTopColor: '#2563eb',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1.5rem'
          }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            Generating {marks}-Mark Educational Notes for {topic}
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '520px', margin: '0 auto' }}>
            Synthesizing conceptual overview, formal mathematical definitions, step-by-step algorithms, real-world examples, and probable university exam questions...
          </p>
        </div>
      )}

      {/* Generated Notes Output Review Card */}
      {generatedResult && (
        <div style={{ maxWidth: '880px', margin: '0 auto' }}>
          {/* Status Alert if Sample or Live */}
          <div style={{
            background: generatedResult.isLiveAi ? '#f0fdf4' : '#fffbeb',
            border: `1px solid ${generatedResult.isLiveAi ? '#bbf7d0' : '#fde68a'}`,
            borderRadius: 'var(--radius-md)',
            padding: '1rem 1.25rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {generatedResult.isLiveAi ? <Check size={18} color="#16a34a" /> : <AlertTriangle size={18} color="#d97706" />}
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: generatedResult.isLiveAi ? '#166534' : '#92400e' }}>
                {generatedResult.isLiveAi ? `Generated via live ${generatedResult.provider}` : `Verified Sample Notes: ${generatedResult.message || 'Ready for exam revision'}`}
              </span>
            </div>

            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Format: <strong>{marks} Marks</strong> &bull; {language}
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="card" style={{ padding: '1rem 1.5rem', marginBottom: '1.25rem', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Review Notes</h3>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
              {/* Copy Button */}
              <button onClick={handleCopy} className="btn btn-secondary btn-sm">
                {copied ? <Check size={14} color="#16a34a" /> : <Copy size={14} />}
                {copied ? 'Copied' : 'Copy'}
              </button>

              {/* Save To Library Button */}
              <button
                onClick={handleSaveToLibrary}
                disabled={savingToLibrary}
                className="btn btn-secondary btn-sm"
              >
                <BookmarkPlus size={14} />
                {savingToLibrary ? 'Saving...' : 'Add to Notes Library'}
              </button>

              {/* Download PDF Button */}
              <button
                onClick={handleExportPdf}
                disabled={isExportingPdf}
                className="btn btn-primary btn-sm"
              >
                <Download size={14} />
                {isExportingPdf ? 'Exporting PDF...' : 'Export as PDF'}
              </button>
            </div>
          </div>

          {/* Save Success Notice */}
          {saveSuccessMsg && (
            <div style={{ background: '#f0fdf4', border: '1px solid #86efac', color: '#166534', padding: '0.85rem 1.25rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
              <Check size={16} /> {saveSuccessMsg}
            </div>
          )}

          {/* Structured Notes Container */}
          <div
            id="ai-notes-print-container"
            className="notes-content-view"
            style={{
              boxShadow: 'var(--shadow-lg)',
              fontFamily: language === 'Telugu' ? "'Noto Sans Telugu', sans-serif" : 'inherit'
            }}
          >
            <div style={{ whiteSpace: 'pre-wrap' }}>
              {generatedResult.content}
            </div>

            {/* Mandatory Disclaimer Footer */}
            <div style={{
              marginTop: '2.5rem',
              paddingTop: '1.25rem',
              borderTop: '2px dashed #cbd5e1',
              fontSize: '0.8rem',
              color: '#64748b',
              textAlign: 'center'
            }}>
              <strong>Official Disclaimer:</strong> AI-generated study material should always be checked against your college syllabus and prescribed university textbooks before examination.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
