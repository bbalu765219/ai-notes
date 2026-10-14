import React from 'react';
import { Sparkles, BookOpen, ShieldCheck, Heart } from 'lucide-react';

export default function Footer({ onSelectBranch, onNavigate }) {
  const branches = ['CSE', 'IT', 'EEE', 'ECE', 'Mechanical', 'Civil', 'Diploma'];

  return (
    <footer className="footer">
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '2.5rem',
          marginBottom: '3rem'
        }}>
          {/* Brand Col */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1rem' }}>
              <div style={{
                width: 34,
                height: 34,
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white'
              }}>
                <Sparkles size={18} />
              </div>
              <h3 style={{ fontSize: '1.2rem', color: 'white', fontWeight: 800 }}>
                ChatGPT <span style={{ color: '#60a5fa' }}>Notes Hub</span>
              </h3>
            </div>
            <p style={{ fontSize: '0.875rem', lineHeight: 1.6, color: '#94a3b8', marginBottom: '1.25rem' }}>
              A unified open education platform for university students. Access verified semester notes, generate targeted 2, 5, 8, and 10 mark study guides with AI, and download formatted PDFs.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#64748b' }}>
              <ShieldCheck size={16} color="#34d399" /> Peer Reviewed & Community Driven
            </div>
          </div>

          {/* Branches Col */}
          <div>
            <h4 style={{ color: 'white', fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Engineering Branches
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {branches.map((b) => (
                <button
                  key={b}
                  onClick={() => {
                    if (onSelectBranch) onSelectBranch(b);
                    if (onNavigate) onNavigate('library');
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#94a3b8',
                    textAlign: 'left',
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    padding: 0,
                    transition: 'color 0.15s'
                  }}
                  onMouseEnter={(e) => e.target.style.color = '#60a5fa'}
                  onMouseLeave={(e) => e.target.style.color = '#94a3b8'}
                >
                  &rarr; {b} Notes & Syllabus
                </button>
              ))}
            </div>
          </div>

          {/* Quick Tools */}
          <div>
            <h4 style={{ color: 'white', fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Academic Tools
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
              <button
                onClick={() => onNavigate && onNavigate('library')}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', textAlign: 'left', cursor: 'pointer', padding: 0 }}
              >
                &bull; Semester Notes Library
              </button>
              <button
                onClick={() => onNavigate && onNavigate('ai')}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', textAlign: 'left', cursor: 'pointer', padding: 0 }}
              >
                &bull; AI Exam Notes Generator (2, 5, 8, 10 Marks)
              </button>
              <button
                onClick={() => onNavigate && onNavigate('upload')}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', textAlign: 'left', cursor: 'pointer', padding: 0 }}
              >
                &bull; Upload PDF Notes
              </button>
              <button
                onClick={() => onNavigate && onNavigate('favorites')}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', textAlign: 'left', cursor: 'pointer', padding: 0 }}
              >
                &bull; My Saved Favorites
              </button>
            </div>
          </div>

          {/* Official Disclaimer Box */}
          <div>
            <h4 style={{ color: 'white', fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Academic Disclaimer
            </h4>
            <div style={{
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: 'var(--radius-md)',
              padding: '1rem',
              fontSize: '0.8rem',
              lineHeight: 1.6,
              color: '#cbd5e1'
            }}>
              <strong>Important Notice:</strong> AI-generated material should always be cross-checked against your university's official syllabus, prescribed textbook editions, and lecturer recommendations.
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{
          borderTop: '1px solid #1e293b',
          paddingTop: '1.75rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          fontSize: '0.8rem',
          color: '#64748b'
        }}>
          <div>
            &copy; {new Date().getFullYear()} ChatGPT Notes Hub. Built for college students worldwide.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            Designed with <Heart size={14} color="#f43f5e" fill="#f43f5e" /> for engineering & higher education
          </div>
        </div>
      </div>
    </footer>
  );
}
