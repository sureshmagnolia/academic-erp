'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signIn, signOut } from 'next-auth/react';
import {
  GraduationCap,
  ShieldCheck,
  UserCheck,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Briefcase,
  BookOpen,
  Microscope,
  Home,
  Check,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const { data: session, status, update } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setRoleDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const roles = session?.user?.roles || [];
  const activeRole = session?.user?.activeRole || session?.user?.role || 'STUDENT';
  const hasMultipleRoles = roles.length > 1;

  async function handleSwitchRole(roleCode) {
    setRoleDropdownOpen(false);
    if (roleCode === activeRole) return;
    await update({ activeRole: roleCode });
  }

  const roleCodes = roles.map((r) => (typeof r === 'string' ? r : r.code));
  const canAccessAdmin = roleCodes.includes('ADMIN') || roleCodes.includes('PRINCIPAL');
  const canAccessFaculty = roleCodes.includes('FACULTY') || roleCodes.includes('HOD');
  const canAccessResearch = roleCodes.includes('RESEARCH_SUPERVISOR') || roleCodes.includes('RESEARCH_SCHOLAR');
  const canAccessStudent = roleCodes.includes('STUDENT') || roleCodes.includes('RESEARCH_SCHOLAR');

  return (
    <header className="navbar-wrapper">
      <div className="navbar-container">
        {/* Brand Logo */}
        <Link href="/" className="navbar-brand">
          <div className="brand-icon-wrapper">
            <GraduationCap className="brand-icon" size={24} />
          </div>
          <div className="brand-text">
            <span className="brand-title">ERP4Colleges</span>
            <span className="brand-subtitle">Academic ERP & Multi-Role Portal</span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="navbar-nav">
          <Link href="/" className={`nav-link ${pathname === '/' ? 'active' : ''}`}>
            <Home size={16} />
            <span>Portal Home</span>
          </Link>

          {canAccessStudent && (
            <Link href="/student" className={`nav-link ${pathname === '/student' ? 'active' : ''}`}>
              <UserCheck size={16} />
              <span>Student Area</span>
            </Link>
          )}

          {canAccessFaculty && (
            <Link href="/faculty" className={`nav-link ${pathname === '/faculty' ? 'active' : ''}`}>
              <BookOpen size={16} />
              <span>Faculty & HoD</span>
            </Link>
          )}

          {canAccessResearch && (
            <Link href="/research" className={`nav-link ${pathname === '/research' ? 'active' : ''}`}>
              <Microscope size={16} />
              <span>Research</span>
            </Link>
          )}

          {canAccessAdmin && (
            <Link href="/admin" className={`nav-link admin-nav-link ${pathname === '/admin' ? 'active' : ''}`}>
              <ShieldCheck size={16} />
              <span>Admin & Roles</span>
            </Link>
          )}
        </nav>

        {/* User Auth & Role Switcher Section */}
        <div className="navbar-auth">
          {status === 'loading' ? (
            <div className="auth-skeleton">Loading...</div>
          ) : session ? (
            <div className="auth-controls-group">
              {/* Contextual Role Switcher Dropdown */}
              {hasMultipleRoles && (
                <div className="role-switcher-container" ref={dropdownRef}>
                  <button
                    onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                    className="role-switcher-btn"
                    title="Switch Operational Role"
                  >
                    <Briefcase size={14} className="role-switcher-icon" />
                    <span className="role-switcher-label">Role:</span>
                    <strong className="role-switcher-active">{activeRole}</strong>
                    <ChevronDown size={14} className={`chevron-icon ${roleDropdownOpen ? 'rotated' : ''}`} />
                  </button>

                  {roleDropdownOpen && (
                    <div className="role-dropdown-menu">
                      <div className="role-dropdown-header">
                        <span>Switch Active Workspace</span>
                      </div>
                      {roles.map((r) => {
                        const code = typeof r === 'string' ? r : r.code;
                        const name = typeof r === 'string' ? r : r.name || r.code;
                        const dept = r.department ? ` (${r.department})` : '';
                        const scope = r.scope_entity_id ? ` • ${r.scope_entity_id}` : '';
                        const isCurrent = code === activeRole;

                        return (
                          <button
                            key={code + (r.scope_entity_id || '')}
                            onClick={() => handleSwitchRole(code)}
                            className={`role-dropdown-item ${isCurrent ? 'item-active' : ''}`}
                          >
                            <div className="role-item-details">
                              <span className="role-item-name">{name}{dept}</span>
                              {scope && <span className="role-item-scope">{scope}</span>}
                            </div>
                            {isCurrent && <Check size={14} className="role-check-icon" />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* User Identity Pill */}
              <div className="user-profile-widget">
                <div className="user-info">
                  <span className="user-name">{session.user.name || 'User'}</span>
                  <span className="user-email">{session.user.email}</span>
                </div>

                <span className={`role-badge ${activeRole.toLowerCase()}`}>
                  {activeRole}
                </span>

                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="btn-signout"
                  title="Sign Out"
                >
                  <LogOut size={16} />
                  <span className="signout-text">Sign Out</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="guest-actions">
              <button onClick={() => signIn('google')} className="btn-google-signin">
                <svg className="google-svg" viewBox="0 0 24 24" width="18" height="18">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Google Login</span>
              </button>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            className="mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-menu">
          <Link href="/" onClick={() => setMobileMenuOpen(false)} className="mobile-link">
            Portal Home
          </Link>
          {canAccessStudent && (
            <Link href="/student" onClick={() => setMobileMenuOpen(false)} className="mobile-link">
              Student Area
            </Link>
          )}
          {canAccessFaculty && (
            <Link href="/faculty" onClick={() => setMobileMenuOpen(false)} className="mobile-link">
              Faculty & HoD
            </Link>
          )}
          {canAccessResearch && (
            <Link href="/research" onClick={() => setMobileMenuOpen(false)} className="mobile-link">
              Research Portal
            </Link>
          )}
          {canAccessAdmin && (
            <Link href="/admin" onClick={() => setMobileMenuOpen(false)} className="mobile-link">
              Admin & Roles
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
