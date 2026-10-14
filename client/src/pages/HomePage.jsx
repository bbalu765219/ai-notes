import React, { useState, useEffect } from 'react';
import {
  Search,
  Sparkles,
  BookOpen,
  ArrowRight,
  TrendingUp,
  Cpu,
  Globe,
  Zap,
  Radio,
  Cog,
  Building,
  GraduationCap,
  Download,
  FileCheck2,
  Users
} from 'lucide-react';
import { api } from '../utils/api';
import NoteCard from '../components/NoteCard';

const branchIcons = {
  CSE: { icon: Cpu, color: '#2563eb', bg: '#eff6ff', desc: 'Algorithms, OS, Cloud, Web' },
  IT: { icon: Globe, color: '#16a34a', bg: '#f0fdf4', desc: 'Software, Networks, Security' },
  EEE: { icon: Zap, color: '#d97706', bg: '#fffbeb', desc: 'Power Systems, Machines, Drives' },
  ECE: { icon: Radio, color: '#9333ea', bg: '#faf5ff', desc: 'DSP, VLSI, Microcontrollers' },
  Mechanical: { icon: Cog, color: '#e11d48', bg: '#fff1f2', desc: 'Thermo, Fluid Dynamics, CAD' },
  Civil: { icon: Building, color: '#059669', bg: '#ecfdf5', desc: 'Structures, Surveying, RCC' },
  Diploma: { icon: GraduationCap, color: '#c026d3', bg: '#fdf4ff', desc: 'Polytechnic Core & Basics' }
};

export default function HomePage({
  onNavigate,
  onSelectBranch,
  onSelectSubject,
  onPreviewNote,
  onDownloadNote,
  onToggleFavorite,
  favorites = []
}) {
  const [stats, setStats] = useState({
    totalNotes: 10,
    totalDownloads: 3200,
    branchCounts: [],
    popularSubjects: [],
    recentNotes: []
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    try {
      setLoading(true);
      const data = await api.getStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load home stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      if (onSelectSubject) onSelectSubject(searchQuery.trim());
      onNavigate('library');
    }
  };

  const handleBranchClick = (branchName) => {
    if (onSelectBranch) onSelectBranch(branchName);
    onNavigate('library');
  };

  const handleSubjectClick = (subjName) => {
    if (onSelectSubject) onSelectSubject(subjName);
    onNavigate('library');
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* Badge */}
          <div className="hero-badge">
            <Sparkles size={16} />
            <span>AI-Powered Study Material & University Notes Hub</span>
          </div>

          {/* Heading */}
          <h1 className="hero-title">
            Pass Semester Exams With Confidence.<br />
            <span className="hero-title-gradient">College Notes & AI Study Guides</span>
          </h1>

          {/* Subtitle */}
          <p className="hero-subtitle">
            Access curated lecture notes, download verified PDF resources, and generate structured 2, 5, 8, and 10 mark exam answers for all engineering branches.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="search-wrapper" style={{ width: '100%' }}>
            <Search className="search-icon" size={20} />
            <input
              type="text"
              className="search-input"
              placeholder="Search by subject (e.g. Data Structures, Thermodynamics, VLSI) or topic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              type="submit"
              className="btn btn-primary"
              style={{
                position: 'absolute',
                right: '8px',
                top: '8px',
                bottom: '8px',
                borderRadius: 'var(--radius-md)'
              }}
            >
              Search
            </button>
          </form>

          {/* Quick Stats Banner */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '2rem',
            flexWrap: 'wrap',
            color: 'var(--text-muted)',
            fontSize: '0.9rem',
            fontWeight: 500
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <BookOpen size={16} color="#2563eb" /> <strong>{stats.totalNotes || 10}+</strong> Verified Notes
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Download size={16} color="#16a34a" /> <strong>{stats.totalDownloads || '3.2k'}+</strong> Downloads
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Sparkles size={16} color="#9333ea" /> <strong>AI-Powered</strong> 2/5/8/10 Mark Notes
            </span>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="container" style={{ padding: '2rem 1.25rem' }}>
        {/* Branch Cards Section */}
        <section style={{ marginBottom: '3.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--dark)' }}>
                Select Your Engineering Branch
              </h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                Browse verified semester notes, question banks, and syllabus tailored for your branch
              </p>
            </div>
            <button
              onClick={() => {
                if (onSelectBranch) onSelectBranch('All');
                onNavigate('library');
              }}
              className="btn btn-outline-primary btn-sm"
            >
              View All <ArrowRight size={14} />
            </button>
          </div>

          <div className="branch-grid">
            {Object.entries(branchIcons).map(([branchName, info]) => {
              const Icon = info.icon;
              const countItem = stats.branchCounts?.find(b => b.name === branchName);
              const count = countItem ? countItem.count : 0;

              return (
                <div
                  key={branchName}
                  className="branch-card"
                  onClick={() => handleBranchClick(branchName)}
                >
                  <div className="branch-icon-box" style={{ background: info.bg, color: info.color }}>
                    <Icon size={26} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 0.2rem' }}>
                      {branchName}
                    </h3>
                    <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0 0 0.4rem', lineHeight: 1.2 }}>
                      {info.desc}
                    </p>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: info.color,
                      background: info.bg,
                      padding: '0.15rem 0.6rem',
                      borderRadius: '9999px',
                      display: 'inline-block'
                    }}>
                      {count} Notes Available
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* AI Notes Generator Callout Card */}
        <section style={{ marginBottom: '3.5rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #312e81 100%)',
            borderRadius: 'var(--radius-xl)',
            padding: '2.5rem',
            color: 'white',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '2rem',
            boxShadow: 'var(--shadow-xl)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ maxWidth: '650px', zIndex: 1 }}>
              <span style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                background: 'rgba(255, 255, 255, 0.15)',
                color: '#93c5fd',
                padding: '0.3rem 0.8rem',
                borderRadius: '9999px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                marginBottom: '1rem'
              }}>
                <Sparkles size={14} color="#60a5fa" /> Instant Exam Preparation Tool
              </span>
              <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 800, color: 'white', marginBottom: '0.75rem', lineHeight: 1.2 }}>
                Need Custom Notes For Your Exam Tomorrow?
              </h2>
              <p style={{ fontSize: '1rem', color: '#cbd5e1', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                Use our AI Notes Generator to produce syllabus-aligned study material tailored to <strong>2, 5, 8, or 10 marks</strong> questions in English or Telugu. Complete with definitions, step-by-step concepts, examples, and downloadable PDF!
              </p>
              <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap' }}>
                <button
                  onClick={() => onNavigate('ai')}
                  className="btn btn-accent btn-lg"
                >
                  <Sparkles size={18} /> Launch AI Notes Generator
                </button>
                <button
                  onClick={() => onNavigate('library')}
                  className="btn btn-secondary btn-lg"
                  style={{ background: 'rgba(255, 255, 255, 0.1)', color: 'white', borderColor: 'rgba(255, 255, 255, 0.2)' }}
                >
                  Browse Library
                </button>
              </div>
            </div>

            <div style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.5rem',
              minWidth: '280px',
              backdropFilter: 'blur(8px)',
              zIndex: 1
            }}>
              <h4 style={{ color: '#93c5fd', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
                Exam Mark Formats
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                  <span style={{ background: '#2563eb', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: 700 }}>2M</span> Concise definitions & core tips
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                  <span style={{ background: '#059669', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: 700 }}>5M</span> Core explanations & practical examples
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                  <span style={{ background: '#7c3aed', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: 700 }}>8/10M</span> Full derivations, diagrams & model answers
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Popular Subjects */}
        {stats.popularSubjects && stats.popularSubjects.length > 0 && (
          <section style={{ marginBottom: '3.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <TrendingUp size={22} color="var(--primary)" />
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--dark)', margin: 0 }}>
                Popular Subjects This Semester
              </h2>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem' }}>
              {stats.popularSubjects.map((sub) => (
                <button
                  key={sub.name}
                  onClick={() => handleSubjectClick(sub.name)}
                  style={{
                    background: 'white',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-full)',
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: '#334155',
                    cursor: 'pointer',
                    boxShadow: 'var(--shadow-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.15s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#2563eb';
                    e.currentTarget.style.color = '#2563eb';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-subtle)';
                    e.currentTarget.style.color = '#334155';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <BookOpen size={14} color="#64748b" />
                  <span>{sub.name}</span>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', background: '#f1f5f9', padding: '0.1rem 0.4rem', borderRadius: '9999px' }}>
                    {sub.count}
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Recently Added Notes */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--dark)' }}>
                Recently Added Lecture Notes
              </h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                Fresh study materials uploaded by students and verified academic contributors
              </p>
            </div>
            <button
              onClick={() => onNavigate('library')}
              className="btn btn-outline-primary btn-sm"
            >
              Explore All Notes <ArrowRight size={14} />
            </button>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.5rem'
          }}>
            {stats.recentNotes && stats.recentNotes.length > 0 ? (
              stats.recentNotes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onPreview={onPreviewNote}
                  onDownload={onDownloadNote}
                  onToggleFavorite={onToggleFavorite}
                  isFavorited={favorites.some(f => f.id === note.id)}
                />
              ))
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Loading verified lecture notes...
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
