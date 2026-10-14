import React, { useState } from 'react';
import { X, Download, FileText, Check, Copy, ExternalLink, Sparkles } from 'lucide-react';
import { exportNotesToPdf } from '../utils/pdfGenerator';
import BranchBadge from './BranchBadge';

export default function PdfViewerModal({ note, onClose, onDownload }) {
  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  if (!note) return null;

  const handleCopy = () => {
    if (note.content) {
      navigator.clipboard.writeText(note.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleExportPdf = async () => {
    setIsExporting(true);
    try {
      if (note.fileUrl) {
        // Physical file download
        if (onDownload) onDownload(note);
        else window.open(note.fileUrl, '_blank');
      } else {
        // Dynamic PDF export
        await exportNotesToPdf({
          title: note.title,
          subject: note.subject,
          topic: note.unit || 'Topic Guide',
          branch: note.branch,
          marks: 'Exam Guide',
          content: note.content || note.description
        });
      }
    } catch (err) {
      console.error('PDF export failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '820px' }}>
        {/* Modal Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border-subtle)',
          background: '#f8fafc'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: note.isAiGenerated ? '#f5f3ff' : '#eff6ff',
              color: note.isAiGenerated ? '#7c3aed' : '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {note.isAiGenerated ? <Sparkles size={18} /> : <FileText size={18} />}
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Note Preview</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                {note.subject} &bull; {note.unit || 'Syllabus'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={handleExportPdf}
              disabled={isExporting}
              className="btn btn-primary btn-sm"
            >
              <Download size={14} />
              {isExporting ? 'Generating...' : 'Download PDF'}
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '0.4rem',
                borderRadius: '6px'
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.5rem' }}>
          {/* Note Info Header */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
              <BranchBadge branch={note.branch} />
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                {note.course || 'B.Tech'} &bull; {note.year || '2nd Year'} &bull; {note.semester || 'Sem 3'}
              </span>
              {note.fileSize && (
                <span style={{ fontSize: '0.8rem', color: '#64748b', background: '#f1f5f9', padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                  {note.fileSize}
                </span>
              )}
            </div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--dark)', marginBottom: '0.4rem' }}>
              {note.title}
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              {note.description}
            </p>
          </div>

          {/* If uploaded physical PDF exists */}
          {note.fileUrl && (
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                background: '#f8fafc',
                height: '420px',
                position: 'relative'
              }}>
                <iframe
                  src={`${note.fileUrl}#toolbar=0`}
                  title={note.title}
                  style={{ width: '100%', height: '100%', border: 'none' }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <a
                  href={note.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-secondary btn-sm"
                >
                  <ExternalLink size={14} /> Open in New Tab
                </a>
              </div>
            </div>
          )}

          {/* If text or AI-generated content exists */}
          {note.content && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Document Contents
                </h4>
                <button onClick={handleCopy} className="btn btn-secondary btn-sm">
                  {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                  {copied ? 'Copied!' : 'Copy Text'}
                </button>
              </div>

              <div className="notes-content-view" style={{ maxHeight: '420px', overflowY: 'auto' }}>
                <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', background: 'transparent', color: 'inherit', padding: 0 }}>
                  {note.content}
                </pre>
              </div>
            </div>
          )}

          {/* Footer Disclaimer */}
          <div style={{
            marginTop: '1.5rem',
            padding: '0.75rem 1rem',
            background: '#f1f5f9',
            borderRadius: 'var(--radius-sm)',
            borderLeft: '4px solid #3b82f6',
            fontSize: '0.8rem',
            color: '#475569'
          }}>
            <strong>Official Syllabus Disclaimer:</strong> All educational study notes should be cross-verified against your university's official curriculum, textbook recommendations, and syllabus guidelines.
          </div>
        </div>
      </div>
    </div>
  );
}
