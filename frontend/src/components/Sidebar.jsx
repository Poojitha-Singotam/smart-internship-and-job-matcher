import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Briefcase, 
  UserCheck, 
  Send, 
  Bookmark, 
  Users, 
  FolderKanban,
  FileCheck2,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar = ({ isOpen, onClose }) => {
  const { isAdmin } = useAuth();

  const studentLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Browse Jobs', path: '/jobs', icon: Briefcase },
    { name: 'Profile & Skills', path: '/profile', icon: UserCheck },
    { name: 'Applications', path: '/applications', icon: Send },
    { name: 'Saved Jobs', path: '/saved-jobs', icon: Bookmark },
  ];

  const adminLinks = [
    { name: 'Admin Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Manage Listings', path: '/admin/jobs', icon: FolderKanban },
    { name: 'Student Directory', path: '/admin/students', icon: Users },
    { name: 'Applications Review', path: '/admin/applications', icon: FileCheck2 },
  ];

  const links = isAdmin ? adminLinks : studentLinks;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="sidebar-backdrop" 
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside className={`app-sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        <div style={{
          fontSize: '0.675rem',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          color: 'var(--text-dim)',
          padding: '0 0.6rem',
          marginBottom: '0.6rem',
          fontWeight: 700
        }}>
          {isAdmin ? 'ADMINISTRATION' : 'STUDENT PORTAL'}
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={() => onClose && onClose()}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  padding: '0.55rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.875rem',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? '#ffffff' : 'var(--text-muted)',
                  backgroundColor: isActive ? 'var(--primary-light)' : 'transparent',
                  border: isActive ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent',
                  textDecoration: 'none',
                  transition: 'var(--transition)'
                })}
              >
                <Icon size={16} />
                <span>{link.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Explainability Info Callout at bottom */}
        <div style={{
          marginTop: 'auto',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-sm)',
          padding: '0.75rem',
          fontSize: '0.725rem',
          color: 'var(--text-dim)',
          lineHeight: 1.4
        }}>
          <div style={{ fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Sparkles size={12} color="var(--primary)" /> Transparent Matching
          </div>
          Calculates transparent 0–100 scores based on skills, eligibility, and preferences.
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
