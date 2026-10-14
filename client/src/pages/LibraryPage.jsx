import React, { useState, useEffect } from 'react';
import { Search, Filter, RotateCcw, BookOpen, Layers, CheckCircle2 } from 'lucide-react';
import { api } from '../utils/api';
import NoteCard from '../components/NoteCard';

const BRANCHES = ['All', 'CSE', 'IT', 'EEE', 'ECE', 'Mechanical', 'Civil', 'Diploma'];
const COURSES = ['All', 'B.Tech', 'Diploma', 'M.Tech', 'BCA'];
const YEARS = ['All', '1st Year', '2nd Year', '3rd Year', '4th Year'];
const SEMESTERS = ['All', 'Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 'Semester 5', 'Semester 6', 'Semester 7', 'Semester 8'];
const UNITS = ['All', 'Unit 1', 'Unit 2', 'Unit 3', 'Unit 4', 'Unit 5', 'Complete Syllabus'];

export default function LibraryPage({
  initialBranch = 'All',
  initialSubject = '',
  onPreviewNote,
  onDownloadNote,
  onToggleFavorite,
  favorites = []
}) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [branch, setBranch] = useState(initialBranch);
  const [course, setCourse] = useState('All');
  const [year, setYear] = useState('All');
  const [semester, setSemester] = useState('All');
  const [unit, setUnit] = useState('All');
  const [search, setSearch] = useState(initialSubject);
  const [sort, setSort] = useState('newest');

  useEffect(() => {
    if (initialBranch) setBranch(initialBranch);
  }, [initialBranch]);

  useEffect(() => {
    if (initialSubject) setSearch(initialSubject);
  }, [initialSubject]);

  useEffect(() => {
    fetchFilteredNotes();
  }, [branch, course, year, semester, unit, search, sort]);

  const fetchFilteredNotes = async () => {
    try {
      setLoading(true);
      const params = {};
      if (branch !== 'All') params.branch = branch;
      if (course !== 'All') params.course = course;
      if (year !== 'All') params.year = year;
      if (semester !== 'All') params.semester = semester;
      if (unit !== 'All') params.unit = unit;
      if (search.trim()) params.search = search.trim();
      params.sort = sort;

      const data = await api.getNotes(params);
      setNotes(data.notes || []);
    } catch (err) {
      console.error('Failed to fetch library notes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilters = () => {
    setBranch('All');
    setCourse('All');
    setYear('All');
    setSemester('All');
    setUnit('All');
    setSearch('');
    setSort('newest');
  };

  const hasActiveFilters = branch !== 'All' || course !== 'All' || year !== 'All' ||
    semester !== 'All' || unit !== 'All' || search.trim() !== '' || sort !== 'newest';

  return (
    <div className="container" style={{ padding: '2.5rem 1.25rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--dark)', marginBottom: '0.5rem' }}>
          Student Notes Library
        </h1>
        <p style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>
          Filter through syllabus notes by course, branch, semester, subject, and unit. Read online or download complete PDFs.
        </p>
      </div>

      {/* Filter Box */}
      <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem', background: 'white' }}>
        {/* Search Bar & Sort */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1rem',
          marginBottom: '1.25rem'
        }}>
          {/* Text Search */}
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              className="form-control"
              style={{ paddingLeft: '2.75rem' }}
              placeholder="Search notes, subjects, topics, or keywords..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Sort Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b', whiteSpace: 'nowrap' }}>
              Sort by:
            </span>
            <select
              className="form-control"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="newest">Newest Uploads</option>
              <option value="popular">Most Downloaded</option>
              <option value="views">Most Viewed</option>
            </select>
          </div>
        </div>

        {/* Dropdown Filters Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '0.85rem',
          marginBottom: '1.25rem'
        }}>
          {/* Branch */}
          <div>
            <label className="form-label" style={{ fontSize: '0.775rem' }}>Branch</label>
            <select className="form-control" value={branch} onChange={(e) => setBranch(e.target.value)}>
              {BRANCHES.map(b => <option key={b} value={b}>{b === 'All' ? 'All Branches' : b}</option>)}
            </select>
          </div>

          {/* Course */}
          <div>
            <label className="form-label" style={{ fontSize: '0.775rem' }}>Course</label>
            <select className="form-control" value={course} onChange={(e) => setCourse(e.target.value)}>
              {COURSES.map(c => <option key={c} value={c}>{c === 'All' ? 'All Courses' : c}</option>)}
            </select>
          </div>

          {/* Year */}
          <div>
            <label className="form-label" style={{ fontSize: '0.775rem' }}>Year</label>
            <select className="form-control" value={year} onChange={(e) => setYear(e.target.value)}>
              {YEARS.map(y => <option key={y} value={y}>{y === 'All' ? 'All Years' : y}</option>)}
            </select>
          </div>

          {/* Semester */}
          <div>
            <label className="form-label" style={{ fontSize: '0.775rem' }}>Semester</label>
            <select className="form-control" value={semester} onChange={(e) => setSemester(e.target.value)}>
              {SEMESTERS.map(s => <option key={s} value={s}>{s === 'All' ? 'All Semesters' : s}</option>)}
            </select>
          </div>

          {/* Unit */}
          <div>
            <label className="form-label" style={{ fontSize: '0.775rem' }}>Unit / Topic</label>
            <select className="form-control" value={unit} onChange={(e) => setUnit(e.target.value)}>
              {UNITS.map(u => <option key={u} value={u}>{u === 'All' ? 'All Units' : u}</option>)}
            </select>
          </div>
        </div>

        {/* Filter Summary & Reset */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
            Showing <strong>{notes.length}</strong> available study resource{notes.length === 1 ? '' : 's'}
          </div>

          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.8rem' }}
            >
              <RotateCcw size={13} /> Reset All Filters
            </button>
          )}
        </div>
      </div>

      {/* Notes Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
          <div style={{
            width: 44,
            height: 44,
            border: '3px solid #e2e8f0',
            borderTopColor: '#2563eb',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }} />
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Filtering college notes library...</p>
        </div>
      ) : notes.length > 0 ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '1.5rem'
        }}>
          {notes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onPreview={onPreviewNote}
              onDownload={onDownloadNote}
              onToggleFavorite={onToggleFavorite}
              isFavorited={favorites.some(f => f.id === note.id)}
            />
          ))}
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem', background: 'white' }}>
          <BookOpen size={48} color="#94a3b8" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            No study notes found matching your filters
          </h3>
          <p style={{ color: 'var(--text-muted)', maxWidth: '480px', margin: '0 auto 1.5rem', fontSize: '0.9rem' }}>
            Try clearing some filters, selecting another branch or semester, or use our AI Generator to instantly create notes for this topic!
          </p>
          <button onClick={handleResetFilters} className="btn btn-primary">
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}
