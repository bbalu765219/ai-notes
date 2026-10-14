import React, { useState } from 'react';
import {
  BookOpen,
  Sparkles,
  Upload,
  Heart,
  ShieldAlert,
  User,
  LogOut,
  Menu,
  X,
  Library
} from 'lucide-react';

export default function Navbar({
  currentPage,
  onNavigate,
  user,
  onLogout,
  onOpenAuth,
  favoritesCount = 0
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home', icon: BookOpen },
    { id: 'library', label: 'Notes Library', icon: Library },
    { id: 'ai', label: 'AI Notes Generator', icon: Sparkles, badge: 'AI' },
    { id: 'upload', label: 'Upload PDF', icon: Upload },
    { id: 'favorites', label: 'Favorites', icon: Heart, count: favoritesCount }
  ];

  if (user && user.role === 'admin') {
    navItems.push({ id: 'admin', label: 'Admin Dashboard', icon: ShieldAlert, badge: 'Admin' });
  }

  const handleNavClick = (id) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="navbar">
      <div className="container nav-container">
        {/* Brand Logo */}
        <div className="nav-brand" onClick={() => handleNavClick('home')}>
          <div className="nav-brand-logo">
            <Sparkles size={20} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '1.15rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#0f172a', lineHeight: 1.1 }}>
              ChatGPT <span style={{ color: 'var(--primary)' }}>Notes Hub</span>
            </span>
            <span style={{ fontSize: '0.65rem', fontWeight: 600, color: '#64748b', letterSpacing: '0.04em' }}>
              COLLEGE STUDY PLATFORM
            </span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="nav-links">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`nav-link ${isActive ? 'active' : ''}`}
                style={{ background: 'transparent', border: 'none' }}
              >
                <Icon size={16} />
                <span>{item.label}</span>
                {item.badge && (
                  <span style={{
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    padding: '0.1rem 0.4rem',
                    borderRadius: '9999px',
                    background: item.badge === 'Admin' ? '#fee2e2' : '#f5f3ff',
                    color: item.badge === 'Admin' ? '#dc2626' : '#7c3aed'
                  }}>
                    {item.badge}
                  </span>
                )}
                {item.count > 0 && (
                  <span style={{
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    padding: '0.1rem 0.4rem',
                    borderRadius: '9999px',
                    background: '#eff6ff',
                    color: '#2563eb'
                  }}>
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Section: Auth & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.35rem 0.75rem',
                borderRadius: 'var(--radius-full)',
                background: '#f1f5f9',
                fontSize: '0.85rem',
                fontWeight: 600,
                color: '#1e293b'
              }}>
                <User size={14} color="#2563eb" />
                <span>{user.name?.split(' ')[0] || 'Student'}</span>
                {user.role === 'admin' && (
                  <span style={{ fontSize: '0.7rem', color: '#dc2626', fontWeight: 700 }}>(Admin)</span>
                )}
              </div>
              <button
                onClick={onLogout}
                title="Sign Out"
                className="btn btn-secondary btn-sm"
                style={{ padding: '0.4rem 0.6rem' }}
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                onClick={onOpenAuth}
                className="btn btn-primary btn-sm"
              >
                <User size={14} /> Sign In
              </button>
            </div>
          )}

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="nav-mobile-toggle"
            style={{
              background: 'transparent',
              border: 'none',
              padding: '0.4rem',
              cursor: 'pointer',
              color: '#334155',
              display: 'none'
            }}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Flyout Menu */}
      {mobileMenuOpen && (
        <div style={{
          position: 'absolute',
          top: '72px',
          left: 0,
          right: 0,
          background: 'white',
          borderBottom: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-xl)',
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          zIndex: 99
        }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`nav-link ${isActive ? 'active' : ''}`}
                style={{
                  background: isActive ? 'var(--primary-light)' : 'transparent',
                  border: 'none',
                  width: '100%',
                  justifyContent: 'flex-start',
                  padding: '0.75rem 1rem'
                }}
              >
                <Icon size={18} />
                <span style={{ flex: 1, textAlign: 'left' }}>{item.label}</span>
                {item.count > 0 && (
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.1rem 0.5rem', borderRadius: '9999px', background: '#eff6ff', color: '#2563eb' }}>
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
}
