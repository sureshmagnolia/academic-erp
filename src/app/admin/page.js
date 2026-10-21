'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
  Users,
  BookOpen,
  Layers,
  FolderPlus,
  UserPlus,
  UserCheck,
  Sparkles,
  ShieldCheck,
  Search,
  Trash2,
  CheckCircle,
  XCircle,
  Bell,
  RefreshCw,
  PlusCircle,
  Copy,
  Check,
  Building,
  GraduationCap,
  Briefcase,
  Microscope,
  Award,
  QrCode,
  FileEdit,
  Clock,
  ExternalLink,
  AlertTriangle,
  Eye,
  Send,
  ToggleLeft,
  ToggleRight,
  Filter,
  SlidersHorizontal,
} from 'lucide-react';
import QRCodeSvg from '@/components/QRCodeSvg';
import SeatMatrixModal from '@/components/SeatMatrixModal';
import { MASTER_ROLES, DEPARTMENTS_CATALOG } from '@/lib/constants';

export default function AdminPage() {
  const { data: session, status, update } = useSession();

  // Active Tab
  const [activeAdminTab, setActiveAdminTab] = useState('qr_enrollment');
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // 1. QR Enrollment Tokens State
  // 0. Academic Structure State (Departments & Programs)
  const [departmentsList, setDepartmentsList] = useState([]);
  const [deptFilter, setDeptFilter] = useState('ALL'); // 'ALL', 'PROGRAM_OFFERING', 'SUPPORTING'
  const [showAddDeptModal, setShowAddDeptModal] = useState(false);
  const [showAddProgModal, setShowAddProgModal] = useState(false);
  const [targetDeptForProg, setTargetDeptForProg] = useState(null);
  const [selectedProgForSeatMatrix, setSelectedProgForSeatMatrix] = useState(null);

  // New Department Form
  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptCode, setNewDeptCode] = useState('');
  const [newDeptType, setNewDeptType] = useState('PROGRAM_OFFERING');
  const [newDeptDesc, setNewDeptDesc] = useState('');
  const [newDeptHod, setNewDeptHod] = useState('');
  const [deptSubmitting, setDeptSubmitting] = useState(false);

  // New Program Form
  const [newProgName, setNewProgName] = useState('');
  const [newProgCode, setNewProgCode] = useState('');
  const [newProgLevel, setNewProgLevel] = useState('UG');
  const [newProgDuration, setNewProgDuration] = useState(3);
  const [newProgSems, setNewProgSems] = useState(8);
  const [newProgIntake, setNewProgIntake] = useState(60);
  const [progSubmitting, setProgSubmitting] = useState(false);

  const [tokens, setTokens] = useState([]);
  const [tokenTitle, setTokenTitle] = useState('');
  const [tokenRole, setTokenRole] = useState('STUDENT');
  const [tokenDept, setTokenDept] = useState('dept_comp_sci');
  const [tokenBatch, setTokenBatch] = useState('batch_bsc_cs_2024');
  const [tokenMaxUses, setTokenMaxUses] = useState(60);
  const [tokenExpiresHours, setTokenExpiresHours] = useState(72);
  const [tokenSubmitting, setTokenSubmitting] = useState(false);
  const [copiedToken, setCopiedToken] = useState(null);

  // 2. Join Requests State
  const [joinRequests, setJoinRequests] = useState([]);
  const [reviewingRequestId, setReviewingRequestId] = useState(null);
  const [superiorNotes, setSuperiorNotes] = useState('');

  // 3. Data Change Requests State
  const [changeRequests, setChangeRequests] = useState([]);
  const [reviewingChangeId, setReviewingChangeId] = useState(null);
  const [changeComments, setChangeComments] = useState('');

  // 4. Existing State (Roles, Users, Announcements)
  const [usersList, setUsersList] = useState([]);
  const [students, setStudents] = useState([]);
  const [scholars, setScholars] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Role Form
  const [roleUserEmail, setRoleUserEmail] = useState('');
  const [roleUserName, setRoleUserName] = useState('');
  const [roleCode, setRoleCode] = useState('FACULTY');
  const [roleDept, setRoleDept] = useState('Computer Science');
  const [roleScopeType, setRoleScopeType] = useState('NONE');
  const [roleScopeId, setRoleScopeId] = useState('');
  const [roleSubmitting, setRoleSubmitting] = useState(false);

  // Scholar Form
  const [scholarEmail, setScholarEmail] = useState('');
  const [scholarName, setScholarName] = useState('');
  const [scholarTopic, setScholarTopic] = useState('');
  const [scholarSupervisor, setScholarSupervisor] = useState('');
  const [scholarRegNo, setScholarRegNo] = useState('');
  const [scholarType, setScholarType] = useState('FULL_TIME');
  const [scholarSubmitting, setScholarSubmitting] = useState(false);

  // Announcement Form
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annCategory, setAnnCategory] = useState('General');
  const [annSubmitting, setAnnSubmitting] = useState(false);

  const activeRole = session?.user?.activeRole || session?.user?.role || 'ADMIN';
  const isSuperAdmin = session?.user?.roles?.some((r) => (typeof r === 'string' ? r === 'ADMIN' : r.code === 'ADMIN'));

  // Load All Data
  async function loadAllData() {
    setLoading(true);
    setErrorMsg('');
    try {
      // 1. Enrollment Tokens
      // 0. Departments & Academic Structure
      const resDepts = await fetch('/api/admin/departments');
      const dataDepts = await resDepts.json();
      if (dataDepts.departments) setDepartmentsList(dataDepts.departments);

      const resTokens = await fetch('/api/admin/enrollment-tokens');
      const dataTokens = await resTokens.json();
      if (dataTokens.tokens) setTokens(dataTokens.tokens);

      // 2. Join Requests
      const resJoins = await fetch('/api/join-requests?status=PENDING');
      const dataJoins = await resJoins.json();
      if (dataJoins.requests) setJoinRequests(dataJoins.requests);

      // 3. Change Requests
      const resChanges = await fetch('/api/change-requests?status=PENDING');
      const dataChanges = await resChanges.json();
      if (dataChanges.changeRequests) setChangeRequests(dataChanges.changeRequests);

      // 4. Users & Roles
      const resUsers = await fetch('/api/admin/roles');
      const dataUsers = await resUsers.json();
      if (dataUsers.users) setUsersList(dataUsers.users);

      // 5. Announcements
      const resAnn = await fetch('/api/admin/announcements');
      const dataAnn = await resAnn.json();
      if (dataAnn.announcements) setAnnouncements(dataAnn.announcements);

      const resScholars = await fetch('/api/admin/scholars');
      const dataScholars = await resScholars.json();
      if (dataScholars.scholars) setScholars(dataScholars.scholars);
    } catch (err) {
      setErrorMsg('Failed to load administrative governance data.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (session?.user) {
      loadAllData();
    }
  }, [session]);

  // Create Enrollment Token
  // Create New Department
  
  async function handleDeleteDepartment(deptId, deptName) {
    if (!window.confirm(`Are you sure you want to remove ${deptName}? This will permanently remove all attached degree programs and curriculum records.`)) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/departments?id=${deptId}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok && data.success) {
        setDepartmentsList(departmentsList.filter((d) => d.id !== deptId));
        alert(`Department "${deptName}" removed successfully.`);
      } else {
        alert(data.error || 'Failed to remove department.');
      }
    } catch (err) {
      alert('Network error deleting department.');
    }
  }

  async function handleDeleteProgram(deptId, progId, progName) {
    if (!window.confirm(`Are you sure you want to remove the degree program "${progName}"?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/programs?id=${progId}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok && data.success) {
        setDepartmentsList(departmentsList.map(d => {
          if (d.id === deptId) {
            return {
              ...d,
              programs: (d.programs || []).filter(p => p.id !== progId)
            };
          }
          return d;
        }));
        alert(`Program "${progName}" removed successfully.`);
      } else {
        alert(data.error || 'Failed to remove program.');
      }
    } catch (err) {
      alert('Network error deleting program.');
    }
  }

  async function handleCreateDepartment(e) {
    e.preventDefault();
    if (!newDeptName.trim() || !newDeptCode.trim()) return;

    setDeptSubmitting(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/admin/departments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newDeptName.trim(),
          code: newDeptCode.trim().toUpperCase(),
          type: newDeptType,
          description: newDeptDesc.trim(),
          hod_email: newDeptHod.trim() || null,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg(`Department "${newDeptName}" registered successfully!`);
        setShowAddDeptModal(false);
        setNewDeptName('');
        setNewDeptCode('');
        setNewDeptDesc('');
        setNewDeptHod('');
        loadAllData();
      } else {
        setErrorMsg(data.error || 'Failed to create department.');
      }
    } catch {
      setErrorMsg('Network error while creating department.');
    } finally {
      setDeptSubmitting(false);
    }
  }

  // Create Academic Program under a Department
  async function handleCreateProgram(e) {
    e.preventDefault();
    if (!targetDeptForProg || !newProgName.trim() || !newProgCode.trim()) return;

    setProgSubmitting(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/admin/programs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          department_id: targetDeptForProg.id,
          name: newProgName.trim(),
          code: newProgCode.trim().toUpperCase(),
          level: newProgLevel,
          duration_years: newProgDuration,
          total_semesters: newProgSems,
          intake_capacity: newProgIntake,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg(`Program "${newProgName}" added to ${targetDeptForProg.name}!`);
        setShowAddProgModal(false);
        setNewProgName('');
        setNewProgCode('');
        loadAllData();
      } else {
        setErrorMsg(data.error || 'Failed to create academic program.');
      }
    } catch {
      setErrorMsg('Network error while creating program.');
    } finally {
      setProgSubmitting(false);
    }
  }

  async function handleCreateToken(e) {
    e.preventDefault();
    setTokenSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await fetch('/api/admin/enrollment-tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: tokenTitle,
          target_role: tokenRole,
          department_id: tokenDept,
          batch_id: tokenBatch,
          max_uses: tokenMaxUses,
          expires_hours: tokenExpiresHours,
        }),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        setTokens([data.token, ...tokens]);
        setTokenTitle('');
        setSuccessMsg('Enrollment token & dynamic QR code activated successfully!');
      } else {
        setErrorMsg(data.error || 'Failed to create token.');
      }
    } catch (err) {
      setErrorMsg('Network error while activating token.');
    } finally {
      setTokenSubmitting(false);
    }
  }

  // Toggle Token Active/Inactive
  async function handleToggleToken(tokenId, currentState) {
    try {
      const res = await fetch('/api/admin/enrollment-tokens', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tokenId, isActive: !currentState }),
      });
      if (res.ok) {
        setTokens(tokens.map((t) => (t.id === tokenId ? { ...t, is_active: !currentState } : t)));
      }
    } catch (err) {
      console.error(err);
    }
  }

  // Copy QR URL
  function handleCopyUrl(tokenStr) {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const url = `${origin}/join/${tokenStr}`;
    navigator.clipboard.writeText(url);
    setCopiedToken(tokenStr);
    setTimeout(() => setCopiedToken(null), 3000);
  }

  // Review Join Request
  async function handleReviewJoin(requestId, action) {
    try {
      const res = await fetch('/api/join-requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          request_id: requestId,
          action,
          superior_notes: superiorNotes,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setJoinRequests(joinRequests.filter((r) => r.id !== requestId));
        setReviewingRequestId(null);
        setSuperiorNotes('');
        setSuccessMsg(`Candidate request ${action === 'APPROVE' ? 'approved & onboarding unlocked' : action.toLowerCase()}!`);
        loadAllData();
      } else {
        setErrorMsg(data.error || 'Failed to review request.');
      }
    } catch (err) {
      setErrorMsg('Network error while processing join review.');
    }
  }

  // Review Data Change Request
  async function handleReviewChange(requestId, action) {
    try {
      const res = await fetch('/api/change-requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          request_id: requestId,
          action,
          reviewer_comments: changeComments,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setChangeRequests(changeRequests.filter((c) => c.id !== requestId));
        setReviewingChangeId(null);
        setChangeComments('');
        setSuccessMsg(`Data change request ${action === 'APPROVE' ? 'approved & live master record updated' : action.toLowerCase()}!`);
      } else {
        setErrorMsg(data.error || 'Failed to review change request.');
      }
    } catch (err) {
      setErrorMsg('Network error while reviewing change request.');
    }
  }

  // Switch Role in God Mode
  async function handleGodModeSwitch(roleCode) {
    await update({ activeRole: roleCode });
    setSuccessMsg(`God Mode View changed: Now simulating ${roleCode}.`);
  }

  if (status === 'loading') {
    return (
      <div className="admin-loading-container">
        <RefreshCw size={24} className="spin" />
        <p>Loading Admin Governance Systems...</p>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="admin-access-denied">
        <ShieldCheck size={56} className="denied-icon" />
        <h2>Authentication Required</h2>
        <p>Sign in with your administrator Google Account to access institutional governance.</p>
        <Link href="/" className="btn btn-primary">Return Home</Link>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-container">
      {/* Header */}
      <div className="admin-page-header">
        <div className="admin-header-titles">
          <div className="admin-badge">
            <ShieldCheck size={16} />
            <span>Master Governance Console</span>
          </div>
          <h1 className="admin-main-title">Institution Administration & Data Governance</h1>
          <p className="admin-subtitle">
            Orchestrate &ldquo;Ask Once&rdquo; onboarding, dynamic QR tokens, Maker-Checker approvals, and multi-role operations.
          </p>
        </div>

        {/* Global Action Tools */}
        <div className="admin-header-actions">
          <button onClick={loadAllData} className="btn-refresh" title="Reload Records">
            <RefreshCw size={16} className={loading ? 'spin' : ''} />
            <span>Refresh Data</span>
          </button>
        </div>
      </div>

      {/* Alerts */}
      {errorMsg && (
        <div className="admin-alert error">
          <XCircle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}
      {successMsg && (
        <div className="admin-alert success">
          <CheckCircle size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Side Panel Dashboard Layout */}
      <div className="admin-sidepanel-layout">
        <aside className="admin-sidebar-nav">
          {/* GROUP 1: ACADEMIC STRUCTURE */}
          <div className="sidebar-group">
            <div className="sidebar-group-title">ACADEMIC STRUCTURE</div>
            <div className="sidebar-nav-list">
              <button
                onClick={() => setActiveAdminTab('departments')}
                className={`sidebar-nav-item ${activeAdminTab === 'departments' ? 'active' : ''}`}
              >
                <div className="sidebar-item-icon">
                  <Building size={18} />
                </div>
                <div className="sidebar-item-info">
                  <span className="sidebar-item-title">Departments & Programs</span>
                  <span className="sidebar-item-desc">Botany, Arabic, CS & Degrees</span>
                </div>
                <span className="sidebar-item-badge">{departmentsList.length}</span>
              </button>
            </div>
          </div>

          {/* GROUP 2: ADMISSIONS & ONBOARDING */}
          <div className="sidebar-group">
            <div className="sidebar-group-title">ADMISSIONS & ONBOARDING</div>
            <div className="sidebar-nav-list">
              <button
                onClick={() => setActiveAdminTab('qr_enrollment')}
                className={`sidebar-nav-item ${activeAdminTab === 'qr_enrollment' ? 'active' : ''}`}
              >
                <div className="sidebar-item-icon">
                  <QrCode size={18} />
                </div>
                <div className="sidebar-item-info">
                  <span className="sidebar-item-title">QR & Link Hub</span>
                  <span className="sidebar-item-desc">Onboarding tokens</span>
                </div>
                <span className="sidebar-item-badge">{tokens.length}</span>
              </button>

              <button
                onClick={() => setActiveAdminTab('join_requests')}
                className={`sidebar-nav-item ${activeAdminTab === 'join_requests' ? 'active' : ''}`}
              >
                <div className="sidebar-item-icon">
                  <UserPlus size={18} />
                </div>
                <div className="sidebar-item-info">
                  <span className="sidebar-item-title">Join Requests</span>
                  <span className="sidebar-item-desc">Candidate verification</span>
                </div>
                <span className={`sidebar-item-badge ${joinRequests.length > 0 ? 'highlight' : ''}`}>
                  {joinRequests.length}
                </span>
              </button>
            </div>
          </div>

          {/* GROUP 3: DATA GOVERNANCE */}
          <div className="sidebar-group">
            <div className="sidebar-group-title">DATA GOVERNANCE</div>
            <div className="sidebar-nav-list">
              <button
                onClick={() => setActiveAdminTab('change_requests')}
                className={`sidebar-nav-item ${activeAdminTab === 'change_requests' ? 'active' : ''}`}
              >
                <div className="sidebar-item-icon">
                  <FileEdit size={18} />
                </div>
                <div className="sidebar-item-info">
                  <span className="sidebar-item-title">Change Requests</span>
                  <span className="sidebar-item-desc">Maker-checker edits</span>
                </div>
                <span className={`sidebar-item-badge ${changeRequests.length > 0 ? 'highlight-amber' : ''}`}>
                  {changeRequests.length}
                </span>
              </button>

              <button
                onClick={() => setActiveAdminTab('roles')}
                className={`sidebar-nav-item ${activeAdminTab === 'roles' ? 'active' : ''}`}
              >
                <div className="sidebar-item-icon">
                  <Briefcase size={18} />
                </div>
                <div className="sidebar-item-info">
                  <span className="sidebar-item-title">Roles & Scopes</span>
                  <span className="sidebar-item-desc">Multi-role privileges</span>
                </div>
                <span className="sidebar-item-badge">{usersList.length}</span>
              </button>
            </div>
          </div>

          {/* GROUP 4: RESEARCH & DOCTORAL */}
          <div className="sidebar-group">
            <div className="sidebar-group-title">RESEARCH & DOCTORAL</div>
            <div className="sidebar-nav-list">
              <button
                onClick={() => setActiveAdminTab('scholars')}
                className={`sidebar-nav-item ${activeAdminTab === 'scholars' ? 'active' : ''}`}
              >
                <div className="sidebar-item-icon">
                  <Microscope size={18} />
                </div>
                <div className="sidebar-item-info">
                  <span className="sidebar-item-title">Research Scholars</span>
                  <span className="sidebar-item-desc">PhD & supervisor link</span>
                </div>
                <span className="sidebar-item-badge">{scholars.length}</span>
              </button>
            </div>
          </div>

          {/* GROUP 5: CAMPUS LIFE */}
          <div className="sidebar-group">
            <div className="sidebar-group-title">CAMPUS LIFE</div>
            <div className="sidebar-nav-list">
              <button
                onClick={() => setActiveAdminTab('announcements')}
                className={`sidebar-nav-item ${activeAdminTab === 'announcements' ? 'active' : ''}`}
              >
                <div className="sidebar-item-icon">
                  <Bell size={18} />
                </div>
                <div className="sidebar-item-info">
                  <span className="sidebar-item-title">Circulars</span>
                  <span className="sidebar-item-desc">Campus notices</span>
                </div>
                <span className="sidebar-item-badge">{announcements.length}</span>
              </button>
            </div>
          </div>

          <div className="sidebar-status-card">
            <span className="status-kicker">GOVERNANCE PILLARS</span>
            <div className="pillar-item">
              <ShieldCheck size={14} className="pillar-icon" />
              <span>Ask Once Master</span>
            </div>
            <div className="pillar-item">
              <UserCheck size={14} className="pillar-icon" />
              <span>Maker-Checker Approval</span>
            </div>
            <div className="pillar-item">
              <Sparkles size={14} className="pillar-icon" />
              <span>Admin God Mode</span>
            </div>
          </div>
        </aside>

        <main className="admin-sidepanel-content">

      {/* ------------------------------------------------------------- */}
      {/* ------------------------------------------------------------- */}
      {/* TAB 0: ACADEMIC STRUCTURE - DEPARTMENTS & PROGRAMS */}
      {/* ------------------------------------------------------------- */}
      {activeAdminTab === 'departments' && (
        <div className="tab-section-content">
          <div className="dept-header-card">
            <div className="dept-header-info">
              <h2 className="dept-title">Academic Departments & Degree Program Governance</h2>
              <p className="dept-desc">
                Configure <strong>Program-Offering Departments</strong> (conducting independent degree programs like B.Sc Botany, M.Sc Botany, Computer Science) and <strong>Supporting / Auxiliary Departments</strong> (offering second languages, open electives, and allied courses like Arabic, English, Mathematics to other degrees).
              </p>
            </div>
            <button
              onClick={() => setShowAddDeptModal(true)}
              className="btn-add-dept"
            >
              <PlusCircle size={16} /> Add New Department
            </button>
          </div>

          {/* Department Filter Tabs */}
          <div className="dept-filter-bar">
            <button
              onClick={() => setDeptFilter('ALL')}
              className={`dept-filter-pill ${deptFilter === 'ALL' ? 'active' : ''}`}
            >
              All Departments ({departmentsList.length})
            </button>
            <button
              onClick={() => setDeptFilter('PROGRAM_OFFERING')}
              className={`dept-filter-pill ${deptFilter === 'PROGRAM_OFFERING' ? 'active' : ''}`}
            >
              🎓 Degree-Granting ({departmentsList.filter((d) => d.type === 'PROGRAM_OFFERING').length})
            </button>
            <button
              onClick={() => setDeptFilter('SUPPORTING')}
              className={`dept-filter-pill ${deptFilter === 'SUPPORTING' ? 'active' : ''}`}
            >
              🤝 Supporting / Auxiliary ({departmentsList.filter((d) => d.type === 'SUPPORTING').length})
            </button>
          </div>

          {/* Departments Grid */}
          <div className="departments-grid">
            {departmentsList
              .filter((d) => deptFilter === 'ALL' || d.type === deptFilter)
              .map((dept) => {
                const isOffering = dept.type === 'PROGRAM_OFFERING';
                const programs = dept.programs || [];

                return (
                  <div key={dept.id} className="dept-card">
                    <div className="dept-card-top">
                      <div className="dept-badge-row">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span className="dept-code-tag">{dept.code}</span>
                          <span className={`dept-type-badge ${isOffering ? 'offering' : 'supporting'}`}>
                            {isOffering ? '🎓 DEGREE-GRANTING' : '🤝 SUPPORTING / ALLIED'}
                          </span>
                        </div>
                        <button
                          type="button"
                          title="Remove Department"
                          onClick={() => handleDeleteDepartment(dept.id, dept.name)}
                          className="btn-delete-item-sm"
                        >
                          <Trash2 size={13} /> Remove
                        </button>
                      </div>
                      <h3 className="dept-name">{dept.name}</h3>
                      <p className="dept-desc-text">{dept.description}</p>

                      <div className="dept-hod-info">
                        <span className="lbl">HoD / Faculty Head:</span>
                        <span className="val">{dept.hod_email || 'Not Designated'}</span>
                      </div>
                    </div>

                    <div className="dept-card-bottom">
                      {isOffering ? (
                        <div className="dept-programs-section">
                          <div className="programs-header">
                            <span className="programs-label">Conferred Degree Programs ({programs.length}):</span>
                            <button
                              onClick={() => {
                                setTargetDeptForProg(dept);
                                setShowAddProgModal(true);
                              }}
                              className="btn-add-prog-sm"
                            >
                              <PlusCircle size={13} /> Add Program
                            </button>
                          </div>

                          {programs.length === 0 ? (
                            <div className="no-programs-hint">No active degree programs added yet.</div>
                          ) : (
                            <div className="programs-chips-list">
                              {programs.map((p) => (
                                <div key={p.id} className="program-chip">
                                  <div className="prog-title-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                      <span className="prog-level-tag">{p.level}</span>
                                      <span className="prog-name-text">{p.name}</span>
                                    </div>
                                    <button
                                      type="button"
                                      title="Remove Degree Program"
                                      onClick={() => handleDeleteProgram(dept.id, p.id, p.name)}
                                      className="btn-delete-prog-icon"
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  </div>
                                  <div className="prog-meta-sub" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                      <span>{p.duration_years} Years ({p.total_semesters} Sems)</span>
                                      {p.level === 'UG' && (
                                        <span className="fyugp-exit-badge" title="Four Year Undergraduate Programme with Exit Option at 3rd Year">
                                          ⚡ FYUGP (Exit at 3rd Yr)
                                        </span>
                                      )}
                                      <span>&bull;</span>
                                      <span>Intake: <strong>{p.intake_capacity}</strong> Seats</span>
                                    </div>

                                    <button
                                      type="button"
                                      onClick={() => setSelectedProgForSeatMatrix({ ...p, department_id: dept.id, department_name: dept.name })}
                                      className="btn-seat-matrix-sm"
                                      title="Configure Pre-Admission Quota Seat Matrix"
                                    >
                                      <SlidersHorizontal size={12} />
                                      <span>Seat Matrix {(() => {
                                        if (!p.seat_matrix) return '';
                                        const tot = Object.values(p.seat_matrix).reduce((acc, v) => acc + (parseInt(v, 10) || 0), 0);
                                        return tot > 0 ? `(${tot}/${p.intake_capacity})` : '(Configure)';
                                      })()}</span>
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="supporting-dept-notice">
                          <span className="notice-icon">ℹ️</span>
                          <div className="notice-text">
                            <strong>Auxiliary Curriculum Provider</strong>
                            <p>Runs common courses, second languages (e.g. Arabic), and allied electives for students enrolled across other degree programs.</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Add Department Modal */}
          {showAddDeptModal && (
            <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowAddDeptModal(false); }}>
              <div className="modal-card">
                <div className="modal-header">
                  <div className="modal-title-row">
                    <Building size={20} className="text-purple" />
                    <h3>Add Academic Department</h3>
                  </div>
                  <button onClick={() => setShowAddDeptModal(false)} className="btn-close-modal">&times;</button>
                </div>

                <form onSubmit={handleCreateDepartment} className="admin-form">
                  <div className="form-group">
                    <label className="form-label">Department Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Department of Botany or Department of Arabic"
                      value={newDeptName}
                      onChange={(e) => setNewDeptName(e.target.value)}
                      className="form-input"
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Department Code *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. BOT, ARB, ENG"
                        value={newDeptCode}
                        onChange={(e) => setNewDeptCode(e.target.value)}
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Classification / Role *</label>
                      <select
                        value={newDeptType}
                        onChange={(e) => setNewDeptType(e.target.value)}
                        className="form-select"
                      >
                        <option value="PROGRAM_OFFERING">Degree-Granting (Runs Own UG/PG Programs)</option>
                        <option value="SUPPORTING">Supporting / Auxiliary (Offers Courses for Other Programs)</option>
                        <option value="RESEARCH_CENTER">Specialized Research Center</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Head of Department (HoD) Email</label>
                    <input
                      type="email"
                      placeholder="e.g. hod.botany@college.edu"
                      value={newDeptHod}
                      onChange={(e) => setNewDeptHod(e.target.value)}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Department Mandate & Description</label>
                    <textarea
                      rows="3"
                      placeholder="e.g. Offers Common Arabic Language & Open Electives across undergraduate degree programmes."
                      value={newDeptDesc}
                      onChange={(e) => setNewDeptDesc(e.target.value)}
                      className="form-textarea"
                    />
                  </div>

                  <div className="modal-actions">
                    <button type="button" onClick={() => setShowAddDeptModal(false)} className="btn-cancel">
                      Cancel
                    </button>
                    <button type="submit" disabled={deptSubmitting} className="btn-primary-action">
                      {deptSubmitting ? 'Registering Department...' : 'Register Department'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Add Program Modal */}
          {showAddProgModal && targetDeptForProg && (
            <div className="modal-overlay">
              <div className="modal-card">
                <div className="modal-header">
                  <div className="modal-title-row">
                    <GraduationCap size={20} className="text-green" />
                    <h3>Add Degree Program to {targetDeptForProg.name}</h3>
                  </div>
                  <button onClick={() => setShowAddProgModal(false)} className="btn-close-modal">&times;</button>
                </div>

                <form onSubmit={handleCreateProgram} className="admin-form">
                  <div className="form-group">
                    <label className="form-label">Program Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. B.Sc Botany or M.Sc Botany"
                      value={newProgName}
                      onChange={(e) => setNewProgName(e.target.value)}
                      className="form-input"
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Program Code *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. BSC_BOT, MSC_BOT"
                        value={newProgCode}
                        onChange={(e) => setNewProgCode(e.target.value)}
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Degree Level *</label>
                      <select
                        value={newProgLevel}
                        onChange={(e) => setNewProgLevel(e.target.value)}
                        className="form-select"
                      >
                        <option value="UG">Undergraduate (UG)</option>
                        <option value="PG">Postgraduate (PG)</option>
                        <option value="PHD">Doctoral (Ph.D)</option>
                        <option value="DIPLOMA">Diploma</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Duration (Years)</label>
                      <input
                        type="number"
                        min="1"
                        max="5"
                        value={newProgDuration}
                        onChange={(e) => setNewProgDuration(e.target.value)}
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Total Semesters</label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={newProgSems}
                        onChange={(e) => setNewProgSems(e.target.value)}
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Intake Capacity (Seats)</label>
                      <input
                        type="number"
                        min="1"
                        max="500"
                        value={newProgIntake}
                        onChange={(e) => setNewProgIntake(e.target.value)}
                        className="form-input"
                      />
                    </div>
                  </div>

                  <div className="modal-actions">
                    <button type="button" onClick={() => setShowAddProgModal(false)} className="btn-cancel">
                      Cancel
                    </button>
                    <button type="submit" disabled={progSubmitting} className="btn-primary-action">
                      {progSubmitting ? 'Adding Program...' : 'Add Program'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Seat Matrix Modal */}
          {selectedProgForSeatMatrix && (
            <SeatMatrixModal
              program={selectedProgForSeatMatrix}
              onClose={() => setSelectedProgForSeatMatrix(null)}
              onSaveSuccess={(progId, newSplit) => {
                setDepartmentsList((prev) =>
                  prev.map((d) => ({
                    ...d,
                    programs: (d.programs || []).map((prog) =>
                      prog.id === progId ? { ...prog, seat_matrix: newSplit } : prog
                    ),
                  }))
                );
              }}
            />
          )}
        </div>
      )}

      {/* TAB 1: DYNAMIC QR & LINK ENROLLMENT HUB */}
      {/* ------------------------------------------------------------- */}
      {activeAdminTab === 'qr_enrollment' && (
        <div className="tab-section-content">
          <div className="grid-split">
            {/* Left: Activation Form */}
            <div className="admin-card">
              <div className="card-header">
                <QrCode size={20} className="card-icon" />
                <div>
                  <h3 className="card-title">Activate New Enrollment QR / URL</h3>
                  <p className="card-desc">
                    Superior or Admin activates time-bounded self-enrollment links for new admissions or appointments.
                  </p>
                </div>
              </div>

              <form onSubmit={handleCreateToken} className="admin-form">
                <div className="form-group">
                  <label className="form-label">Enrollment Title / Purpose *</label>
                  <input
                    type="text"
                    required
                    value={tokenTitle}
                    onChange={(e) => setTokenTitle(e.target.value)}
                    placeholder="e.g. 2024 Computer Science Freshers Onboarding"
                    className="form-input"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Target Role *</label>
                    <select
                      value={tokenRole}
                      onChange={(e) => setTokenRole(e.target.value)}
                      className="form-select"
                    >
                      <option value="STUDENT">STUDENT (UG / PG)</option>
                      <option value="FACULTY">FACULTY (Teaching Staff)</option>
                      <option value="NON_TEACHING_STAFF">NON-TEACHING STAFF</option>
                      <option value="RESEARCH_SCHOLAR">RESEARCH SCHOLAR</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Department *</label>
                    <select
                      value={tokenDept}
                      onChange={(e) => setTokenDept(e.target.value)}
                      className="form-select"
                    >
                      {DEPARTMENTS_CATALOG.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Max Uses / Scans</label>
                    <input
                      type="number"
                      min="1"
                      max="1000"
                      value={tokenMaxUses}
                      onChange={(e) => setTokenMaxUses(e.target.value)}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Validity Window</label>
                    <select
                      value={tokenExpiresHours}
                      onChange={(e) => setTokenExpiresHours(e.target.value)}
                      className="form-select"
                    >
                      <option value="2">2 Hours (On-Spot Event)</option>
                      <option value="24">24 Hours (1 Day)</option>
                      <option value="72">72 Hours (3 Days)</option>
                      <option value="168">7 Days (1 Week)</option>
                      <option value="720">30 Days (Full Month)</option>
                    </select>
                  </div>
                </div>

                <button type="submit" disabled={tokenSubmitting} className="btn-primary-action">
                  {tokenSubmitting ? <RefreshCw size={16} className="spin" /> : <PlusCircle size={16} />}
                  <span>Generate & Activate QR Link</span>
                </button>
              </form>
            </div>

            {/* Right: Active Tokens List with QR Codes */}
            <div className="admin-card">
              <div className="card-header">
                <CheckCircle size={20} className="card-icon" />
                <div>
                  <h3 className="card-title">Active QR Codes & Portals ({tokens.length})</h3>
                  <p className="card-desc">Candidates scan with mobile camera or open the activation link.</p>
                </div>
              </div>

              <div className="tokens-list">
                {tokens.length === 0 ? (
                  <p className="empty-state-text">No enrollment tokens active. Create one to enable self-registration.</p>
                ) : (
                  tokens.map((t) => {
                    const origin = typeof window !== 'undefined' ? window.location.origin : '';
                    const fullUrl = `${origin}/join/${t.token}`;
                    const isExpired = new Date(t.expires_at) < new Date();

                    return (
                      <div key={t.id} className={`token-card-item ${!t.is_active || isExpired ? 'inactive' : ''}`}>
                        <div className="token-card-top">
                          <div>
                            <h4 className="token-title">{t.title}</h4>
                            <div className="token-meta-row">
                              <span className="badge role">{t.target_role}</span>
                              <span className="badge dept">
                                {DEPARTMENTS_CATALOG.find((d) => d.id === t.department_id)?.name || t.department_id}
                              </span>
                              <span className={`badge status ${t.is_active && !isExpired ? 'active' : 'expired'}`}>
                                {isExpired ? 'EXPIRED' : t.is_active ? 'ACTIVE' : 'DEACTIVATED'}
                              </span>
                            </div>
                          </div>

                          <button
                            onClick={() => handleToggleToken(t.id, t.is_active)}
                            className="btn-toggle-token"
                            title={t.is_active ? 'Deactivate link' : 'Activate link'}
                          >
                            {t.is_active ? (
                              <span className="text-green"><ToggleRight size={26} /></span>
                            ) : (
                              <span className="text-gray"><ToggleLeft size={26} /></span>
                            )}
                          </button>
                        </div>

                        <div className="token-card-body">
                          {/* Live Rendered SVG QR Code */}
                          <div className="token-qr-col">
                            <QRCodeSvg value={fullUrl} size={130} />
                          </div>

                          <div className="token-info-col">
                            <div className="token-stat">
                              <span className="stat-label">Scans / Uses:</span>
                              <span className="stat-val">
                                {t.used_count || 0} / {t.max_uses}
                              </span>
                            </div>
                            <div className="token-stat">
                              <span className="stat-label">Expires At:</span>
                              <span className="stat-val">{new Date(t.expires_at).toLocaleString()}</span>
                            </div>

                            <div className="token-url-box">
                              <input type="text" readOnly value={fullUrl} className="token-url-input" />
                              <button
                                onClick={() => handleCopyUrl(t.token)}
                                className="btn-copy-url"
                                title="Copy Enrollment Link"
                              >
                                {copiedToken === t.token ? <Check size={16} className="text-green" /> : <Copy size={16} />}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 2: JOIN REQUESTS QUEUE (SUPERIOR VERIFICATION) */}
      {/* ------------------------------------------------------------- */}
      {activeAdminTab === 'join_requests' && (
        <div className="tab-section-content">
          <div className="admin-card">
            <div className="card-header">
              <UserPlus size={20} className="card-icon" />
              <div>
                <h3 className="card-title">Pending Join Requests ({joinRequests.length})</h3>
                <p className="card-desc">
                  Candidates who authenticated via Google and submitted access requests through the dynamic enrollment link.
                </p>
              </div>
            </div>

            {joinRequests.length === 0 ? (
              <div className="empty-state-box">
                <CheckCircle size={36} className="text-green" />
                <p>No pending join requests. All applicants have been reviewed!</p>
              </div>
            ) : (
              <div className="requests-grid">
                {joinRequests.map((req) => (
                  <div key={req.id} className="request-card">
                    <div className="request-card-header">
                      <div className="applicant-avatar-circle">
                        {req.applicant_avatar ? (
                          <img src={req.applicant_avatar} alt={req.applicant_name} />
                        ) : (
                          (req.applicant_name || 'U')[0].toUpperCase()
                        )}
                      </div>
                      <div>
                        <h4 className="applicant-name">{req.applicant_name}</h4>
                        <span className="applicant-email">{req.applicant_email}</span>
                      </div>
                    </div>

                    <div className="request-card-details">
                      <div className="detail-item">
                        <span className="lbl">Requested Role:</span>
                        <span className="val highlight">{req.requested_role}</span>
                      </div>
                      <div className="detail-item">
                        <span className="lbl">Department:</span>
                        <span className="val">
                          {DEPARTMENTS_CATALOG.find((d) => d.id === req.department_id)?.name || req.department_id}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="lbl">Admission / Ref No:</span>
                        <span className="val">{req.admission_or_emp_no || 'N/A'}</span>
                      </div>
                      <div className="detail-item">
                        <span className="lbl">Contact Mobile:</span>
                        <span className="val">{req.mobile_number || 'N/A'}</span>
                      </div>
                      <div className="detail-item">
                        <span className="lbl">Submitted:</span>
                        <span className="val">{new Date(req.created_at).toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Review Actions */}
                    <div className="request-actions">
                      <button
                        onClick={() => handleReviewJoin(req.id, 'APPROVE')}
                        className="btn-approve"
                      >
                        <CheckCircle size={15} /> Approve & Unlock Onboarding
                      </button>
                      <button
                        onClick={() => handleReviewJoin(req.id, 'REJECT')}
                        className="btn-reject"
                      >
                        <XCircle size={15} /> Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 3: DATA CHANGE REQUESTS (MAKER-CHECKER SUPERIOR APPROVAL) */}
      {/* ------------------------------------------------------------- */}
      {activeAdminTab === 'change_requests' && (
        <div className="tab-section-content">
          <div className="admin-card">
            <div className="card-header">
              <FileEdit size={20} className="card-icon" />
              <div>
                <h3 className="card-title">Maker-Checker: Data Change Requests ({changeRequests.length})</h3>
                <p className="card-desc">
                  Students and staff requesting updates to locked master fields. Changes require superior review before committing to the live single-source database.
                </p>
              </div>
            </div>

            {changeRequests.length === 0 ? (
              <div className="empty-state-box">
                <CheckCircle size={36} className="text-green" />
                <p>No pending data change requests. All profile records are current and synchronized!</p>
              </div>
            ) : (
              <div className="change-requests-list">
                {changeRequests.map((c) => (
                  <div key={c.id} className="change-request-card">
                    <div className="change-card-header">
                      <div>
                        <h4 className="user-name">{c.user_name || 'Stakeholder'} ({c.user_role})</h4>
                        <span className="user-email">{c.user_email}</span>
                      </div>
                      <span className="badge field-badge">{c.field_label || c.field_name}</span>
                    </div>

                    <div className="change-comparison-box">
                      <div className="val-block old">
                        <span className="val-label">Current Locked Value:</span>
                        <span className="val-text">{c.current_value || 'None / Blank'}</span>
                      </div>
                      <div className="val-arrow">&rarr;</div>
                      <div className="val-block new">
                        <span className="val-label">Proposed New Value:</span>
                        <span className="val-text">{c.proposed_value}</span>
                      </div>
                    </div>

                    <div className="justification-box">
                      <span className="just-label">Mandatory Justification / Reason:</span>
                      <p className="just-text">{c.justification}</p>
                    </div>

                    {c.document_proof_url && (
                      <div className="proof-link-wrap">
                        <span className="just-label">Supporting Document Proof:</span>
                        <a href={c.document_proof_url} target="_blank" rel="noopener noreferrer" className="proof-link">
                          <ExternalLink size={14} /> Open Verified Drive Proof
                        </a>
                      </div>
                    )}

                    <div className="change-actions-row">
                      <button
                        onClick={() => handleReviewChange(c.id, 'APPROVE')}
                        className="btn-approve-change"
                      >
                        <CheckCircle size={15} /> Approve & Commit to Live Master Record
                      </button>
                      <button
                        onClick={() => handleReviewChange(c.id, 'REJECT')}
                        className="btn-reject-change"
                      >
                        <XCircle size={15} /> Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 4: ROLES & ASSIGNMENTS */}
      {/* ------------------------------------------------------------- */}
      {activeAdminTab === 'roles' && (
        <div className="tab-section-content">
          <div className="admin-card">
            <h3 className="card-title">User Accounts & Assigned Operational Roles ({usersList.length})</h3>
            <div className="users-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Primary Type</th>
                    <th>Department</th>
                    <th>Assigned Roles & Scopes</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {usersList.map((u) => (
                    <tr key={u.id}>
                      <td>
                        <strong>{u.name}</strong>
                        <div className="table-sub">{u.email}</div>
                      </td>
                      <td><span className="badge">{u.primary_type}</span></td>
                      <td>{u.department || 'N/A'}</td>
                      <td>
                        <div className="roles-pill-wrap">
                          {u.roles?.map((r, i) => (
                            <span key={i} className="role-pill">
                              {r.code} {r.scope_entity_id ? `(${r.scope_entity_id})` : ''}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td>
                        <span className={`status-dot ${u.status === 'ACTIVE' ? 'active' : ''}`}>
                          {u.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 5: RESEARCH SCHOLARS */}
      {/* ------------------------------------------------------------- */}
      {activeAdminTab === 'scholars' && (
        <div className="tab-section-content">
          <div className="admin-card">
            <h3 className="card-title">Research Scholar Registry & PhD Supervisions</h3>
            <p className="card-desc">Scholars hold dual student-researcher privileges under designated faculty guides.</p>
            <div className="scholars-info-note">
              <Microscope size={24} />
              <span>
                To inspect doctoral milestones, DC reviews, and research scholar records, visit the dedicated{' '}
                <Link href="/research" className="underline font-semibold">
                  Research Portal
                </Link>.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 6: CIRCULARS */}
      {/* ------------------------------------------------------------- */}
      {activeAdminTab === 'announcements' && (
        <div className="tab-section-content">
          <div className="admin-card">
            <h3 className="card-title">Campus Circulars & Notifications</h3>
            <div className="announcements-list">
              {announcements.map((a) => (
                <div key={a.id} className="announcement-item">
                  <h4>{a.title}</h4>
                  <p>{a.content}</p>
                  <span className="ann-meta">{a.category} &bull; {new Date(a.created_at).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
        </main>
      </div>
    </div>
  );
}
