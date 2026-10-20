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
  Sparkles,
  QrCode,
  FileEdit,
  Eye,
  RefreshCw,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { MASTER_ROLES } from '@/lib/constants';

export default function Navbar() {
  const pathname = usePathname();
  const { data: session, status, update } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setRoleDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Client-side deduplication safeguard for existing session cookies
  const rawRoles = session?.user?.roles || [];
  const seenRaw = new Set();
  const roles = [];
  for (const r of rawRoles) {
    const code = typeof r === 'string' ? r : r.code;
    const dept = typeof r === 'object' && r.department ? r.department : '';
    const key = `${code}_${dept}`;
    if (!seenRaw.has(key)) {
      seenRaw.add(key);
      roles.push(r);
    }
  }
  const roleCodes = roles.map((r) => (typeof r === 'string' ? r : r.code));
  const isSuperAdmin = roleCodes.includes('ADMIN') || session?.user?.role === 'ADMIN' || session?.user?.activeRole === 'ADMIN' || session?.user?.email === 'sureshmagnolia@gmail.com';
  const activeRole = session?.user?.activeRole || session?.user?.role || (isSuperAdmin ? 'ADMIN' : 'STUDENT');

  // Strict deduplication of available roles
  const seenCodes = new Set();
  const rawList = isSuperAdmin ? MASTER_ROLES : roles;
  const availableRoles = [];

  for (const r of rawList) {
    const code = typeof r === 'string' ? r : r.code;
    const name = typeof r === 'string' ? r : (r.name || r.code);
    const dept = typeof r === 'object' && r.department ? r.department : null;
    const key = `${code}_${dept || ''}`;

    if (!seenCodes.has(key)) {
      seenCodes.add(key);
      availableRoles.push({
        code,
        name,
        department: dept,
        category: r.category || 'ROLE',
      });
    }
  }

  const isSimulatingRole = isSuperAdmin && activeRole !== 'ADMIN';

  async function handleSwitchRole(roleCode) {
    setRoleDropdownOpen(false);
    if (roleCode === activeRole) return;
    await update({ activeRole: roleCode });
  }

  async function handleResetToAdmin() {
    await update({ activeRole: 'ADMIN' });
  }

  const canAccessAdmin = isSuperAdmin || roleCodes.includes('ADMIN') || roleCodes.includes('PRINCIPAL');
  const canAccessFaculty = isSuperAdmin || activeRole === 'FACULTY' || activeRole === 'HOD' || roleCodes.includes('FACULTY') || roleCodes.includes('HOD');
  const canAccessResearch = isSuperAdmin || activeRole === 'RESEARCH_SCHOLAR' || activeRole === 'RESEARCH_SUPERVISOR' || roleCodes.includes('RESEARCH_SCHOLAR') || roleCodes.includes('RESEARCH_SUPERVISOR');
  const canAccessStudent = isSuperAdmin || activeRole === 'STUDENT' || roleCodes.includes('STUDENT');

  return (
    <>
      {/* Admin God Mode Active Banner */}
      {isSimulatingRole && (
        <div className="god-mode-banner">
          <div className="god-mode-content">
            <span className="god-mode-badge">
              <Eye size={14} /> GOD MODE SIMULATION
            </span>
            <span className="god-mode-text">
              Viewing interface as <strong>{activeRole}</strong> ({MASTER_ROLES.find((m) => m.code === activeRole)?.name})
            </span>
            <button onClick={handleResetToAdmin} className="god-mode-reset-btn">
              <RefreshCw size={13} /> Exit & Return to Super Admin
            </button>
          </div>
        </div>
      )}

      <header className="navbar-wrapper">
        <div className="navbar-container">
          {/* Brand Logo */}
          <Link href="/" className="navbar-brand">
            <div className="brand-icon-wrapper">
              <GraduationCap className="brand-icon" size={24} />
            </div>
            <div className="brand-text">
              <span className="brand-title">ERP4Colleges</span>
              <span className="brand-subtitle">
                {isSuperAdmin ? '⚡ God Mode Enabled' : 'Academic ERP & Multi-Role Governance'}
              </span>
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
                <span>Admin Governance</span>
              </Link>
            )}
          </nav>

          {/* User Auth & Role Switcher */}
          <div className="navbar-actions" ref={dropdownRef}>
            {status === 'loading' ? (
              <div className="nav-skeleton-pill" />
            ) : session?.user ? (
              <div className="user-profile-menu">
                {/* Role Switcher Button */}
                <div className="role-switcher-container">
                  <button
                    onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                    className={`role-badge-btn ${isSuperAdmin ? 'god-mode-trigger' : ''}`}
                    title={isSuperAdmin ? 'Admin God Mode: Click to switch and preview any role' : 'Switch active role'}
                  >
                    {isSuperAdmin && <Sparkles size={14} className="god-star" />}
                    <span className="role-badge-text">
                      {isSuperAdmin && isSimulatingRole ? `Simulating: ${activeRole}` : activeRole}
                    </span>
                    <ChevronDown size={14} className={`chevron ${roleDropdownOpen ? 'rotated' : ''}`} />
                  </button>

                  {/* Deduplicated Role Dropdown Menu */}
                  {roleDropdownOpen && (
                    <div className="role-dropdown-menu">
                      <div className="dropdown-header">
                        <span className="dropdown-title">
                          {isSuperAdmin ? '⚡ God Mode Role Simulator' : 'Switch Active Workspace'}
                        </span>
                        <span className="dropdown-desc">
                          {isSuperAdmin
                            ? 'Switch to any institutional role to preview its UI & actions:'
                            : 'Select your active operational role:'}
                        </span>
                      </div>

                      <div className="dropdown-roles-list">
                        {availableRoles.map((r) => {
                          const isSelected = r.code === activeRole;
                          return (
                            <button
                              key={r.code + (r.department || '')}
                              onClick={() => handleSwitchRole(r.code)}
                              className={`role-option-item ${isSelected ? 'selected' : ''}`}
                            >
                              <div className="role-option-info">
                                <span className="role-code-badge">{r.code}</span>
                                <span className="role-option-name">{r.name}</span>
                                {r.department && (
                                  <span className="role-option-dept">({r.department})</span>
                                )}
                              </div>
                              {isSelected && <Check size={16} className="check-icon" />}
                            </button>
                          );
                        })}
                      </div>

                      {isSuperAdmin && isSimulatingRole && (
                        <div className="dropdown-footer">
                          <button onClick={handleResetToAdmin} className="reset-admin-btn">
                            <ShieldCheck size={14} /> Reset View to Super Admin
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* User Avatar & Logout */}
                <div className="user-identity">
                  {session.user.image ? (
                    <img src={session.user.image} alt={session.user.name || 'User'} className="user-avatar-img" />
                  ) : (
                    <div className="user-avatar-fallback">
                      {(session.user.name || session.user.email || 'U')[0].toUpperCase()}
                    </div>
                  )}
                  <span className="user-name-display">{session.user.name?.split(' ')[0] || 'User'}</span>
                  <button onClick={() => signOut({ callbackUrl: '/' })} className="btn-logout" title="Sign Out">
                    <LogOut size={16} />
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={() => signIn('google')} className="btn-signin">
                <GraduationCap size={16} />
                <span>Sign in with Google</span>
              </button>
            )}

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="mobile-menu-btn"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="mobile-nav-panel">
            <Link href="/" onClick={() => setMobileMenuOpen(false)} className="mobile-link">
              <Home size={18} />
              <span>Portal Home</span>
            </Link>
            {canAccessStudent && (
              <Link href="/student" onClick={() => setMobileMenuOpen(false)} className="mobile-link">
                <UserCheck size={18} />
                <span>Student Area</span>
              </Link>
            )}
            {canAccessFaculty && (
              <Link href="/faculty" onClick={() => setMobileMenuOpen(false)} className="mobile-link">
                <BookOpen size={18} />
                <span>Faculty & HoD</span>
              </Link>
            )}
            {canAccessResearch && (
              <Link href="/research" onClick={() => setMobileMenuOpen(false)} className="mobile-link">
                <Microscope size={18} />
                <span>Research Scholars</span>
              </Link>
            )}
            {canAccessAdmin && (
              <Link href="/admin" onClick={() => setMobileMenuOpen(false)} className="mobile-link">
                <ShieldCheck size={18} />
                <span>Admin Governance</span>
              </Link>
            )}
          </div>
        )}
      </header>
    </>
  );
}
