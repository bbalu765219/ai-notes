import React from 'react';
import { Download, Eye, Heart, FileText, Sparkles, User, ArrowDownToLine } from 'lucide-react';
import BranchBadge from './BranchBadge';

export default function NoteCard({
  note,
  onPreview,
  onDownload,
  onToggleFavorite,
  isFavorited = false
}) {
  return (
    <div className="card card-interactive" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '1.25rem' }}>
      {/* Top Header: Badges & Favorite Heart */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
          <BranchBadge branch={note.branch} />
          {note.unit && (
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              background: '#f1f5f9',
              color: '#475569',
              padding: '0.2rem 0.5rem',
              borderRadius: '9999px',
              border: '1px solid #e2e8f0'
            }}>
              {note.unit}
            </span>
          )}
          {note.isAiGenerated ? (
            <span style={{
              fontSize: '0.72rem',
              fontWeight: 600,
              background: '#fdf4ff',
              color: '#9333ea',
              padding: '0.2rem 0.5rem',
              borderRadius: '9999px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}>
              <Sparkles size={11} /> AI Notes
            </span>
          ) : note.hasPdf ? (
            <span style={{
              fontSize: '0.72rem',
              fontWeight: 600,
              background: '#f0fdf4',
              color: '#16a34a',
              padding: '0.2rem 0.5rem',
              borderRadius: '9999px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}>
              <FileText size={11} /> PDF Available
            </span>
          ) : null}
        </div>

        {/* Favorite Bookmark Button */}
        {onToggleFavorite && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(note.id);
            }}
            title={isFavorited ? 'Remove from favorites' : 'Save to favorites'}
            style={{
              background: isFavorited ? '#fee2e2' : 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: isFavorited ? '#ef4444' : '#94a3b8',
              padding: '0.4rem',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s'
            }}
          >
            <Heart size={18} fill={isFavorited ? '#ef4444' : 'none'} />
          </button>
        )}
      </div>

      {/* Note Subject & Title */}
      <div style={{ marginBottom: '0.65rem' }}>
        <p style={{
          fontSize: '0.8rem',
          fontWeight: 700,
          color: 'var(--primary)',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          marginBottom: '0.25rem'
        }}>
          {note.subject}
        </p>
        <h3 style={{
          fontSize: '1.05rem',
          fontWeight: 700,
          color: 'var(--dark)',
          lineHeight: 1.35,
          marginBottom: '0.5rem'
        }}>
          {note.title}
        </h3>
      </div>

      {/* Description Snippet */}
      <p style={{
        fontSize: '0.85rem',
        color: 'var(--text-muted)',
        lineHeight: 1.5,
        marginBottom: '1rem',
        flex: 1,
        display: '-webkit-box',
        WebkitLineClamp: 3,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden'
      }}>
        {note.description || 'Comprehensive verified study material with definitions, examples, and exam practice questions.'}
      </p>

      {/* Metadata Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: '0.75rem',
        borderTop: '1px solid var(--border-subtle)',
        fontSize: '0.775rem',
        color: '#64748b',
        marginBottom: '0.85rem'
      }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
          <User size={13} /> {note.uploaderName || 'Verified Faculty'}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span title="Total Downloads" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            <ArrowDownToLine size={13} /> {note.downloads || 0}
          </span>
          {note.fileSize && <span>{note.fileSize}</span>}
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
        <button
          onClick={() => onPreview && onPreview(note)}
          className="btn btn-secondary btn-sm"
          style={{ width: '100%' }}
        >
          <Eye size={14} /> Preview
        </button>
        <button
          onClick={() => onDownload && onDownload(note)}
          className="btn btn-primary btn-sm"
          style={{ width: '100%' }}
        >
          <Download size={14} /> Download
        </button>
      </div>
    </div>
  );
}
