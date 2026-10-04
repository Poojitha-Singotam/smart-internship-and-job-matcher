import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, LogOut, ShieldCheck, Briefcase, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar = ({ sidebarOpen, setSidebarOpen }) => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="app-navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {/* Mobile Sidebar Hamburger Toggle */}
        {isAuthenticated && (
          <button
            onClick={() => setSidebarOpen && setSidebarOpen(!sidebarOpen)}
            className="btn btn-secondary btn-sm mobile-menu-btn"
            aria-label="Toggle navigation menu"
            style={{ padding: '0.4rem', display: 'none' }}
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        )}

        {/* Brand */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', textDecoration: 'none' }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: 'var(--radius-sm)',
            background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 2px 8px rgba(99, 102, 241, 0.4)',
            flexShrink: 0
          }}>
            <Sparkles size={17} />
          </div>
          <div>
            <span style={{ fontSize: '1.05rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff' }}>
              SMART<span style={{ color: 'var(--primary)' }}>MATCHER</span>
            </span>
            <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: -2 }}>
              Internship & Job Engine
            </span>
          </div>
        </Link>
      </div>

      {/* Right controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {isAuthenticated ? (
          <>
            {/* User Profile Pill */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.3rem 0.65rem',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-subtle)'
            }}>
              <div style={{
                width: 26,
                height: 26,
                borderRadius: '50%',
                background: isAdmin ? 'linear-gradient(135deg, #f59e0b, #ef4444)' : 'linear-gradient(135deg, #6366f1, #06b6d4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: '#ffffff',
                flexShrink: 0
              }}>
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="nav-user-text" style={{ lineHeight: 1.15 }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#ffffff', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.name}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                  {isAdmin ? <ShieldCheck size={10} color="#f59e0b" /> : <Briefcase size={10} color="#6366f1" />}
                  <span style={{ textTransform: 'uppercase', letterSpacing: '0.04em' }}>{user?.role}</span>
                </div>
              </div>
            </div>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="btn btn-secondary btn-sm"
              title="Sign Out"
              style={{ padding: '0.35rem 0.65rem' }}
            >
              <LogOut size={15} />
              <span className="logout-text">Logout</span>
            </button>
          </>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Link to="/login" className="btn btn-secondary btn-sm">
              Sign In
            </Link>
            <Link to="/register" className="btn btn-primary btn-sm">
              Register Free
            </Link>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .mobile-menu-btn {
            display: inline-flex !important;
          }
        }
        @media (max-width: 640px) {
          .nav-user-text {
            display: none !important;
          }
          .logout-text {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
};

export default Navbar;
