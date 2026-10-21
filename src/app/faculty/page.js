'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
  BookOpen, PlusCircle, Trash2, Filter, RefreshCw, Layers, Tag, AlignLeft, Info,
  Users,
  CheckCircle,
  ShieldCheck,
  Award,
  Calendar,
  Building,
  ShieldAlert,
  ClipboardList,
  Check,
  UserPlus,
  FileEdit,
  XCircle,
  Clock,
  Send,
  ExternalLink,
  Save,
  SlidersHorizontal,
  AlertCircle,
  AlertTriangle,
  GraduationCap,
  Search,
  FileText,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import SeatMatrixModal from '@/components/SeatMatrixModal';
import { DEPARTMENTS_CATALOG, SEAT_RESERVATION_CATEGORIES } from '@/lib/constants';

export default function FacultyPage() {
  const { data: session, status, update } = useSession();

  const [activeTab, setActiveTab] = useState('join_requests');
  const [selectedCourse, setSelectedCourse] = useState('CS601');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Department Approvals State
  const [joinRequests, setJoinRequests] = useState([]);
  const [changeRequests, setChangeRequests] = useState([]);
  const [notes, setNotes] = useState('');

  // Department Admission Verification State (Stage 1)
  const [deptDossiers, setDeptDossiers] = useState([]);
  const [loadingDeptDossiers, setLoadingDeptDossiers] = useState(false);
  const [processingDossierEmail, setProcessingDossierEmail] = useState(null);
  const [deptDossierSearch, setDeptDossierSearch] = useState('');
  const [deptDossierNotes, setDeptDossierNotes] = useState({});
  
  // Courses & Curriculum State
  const [coursesList, setCoursesList] = useState([]);
  const [programsList, setProgramsList] = useState([]);
  const [departmentsList, setDepartmentsList] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [selectedProgForSeatMatrix, setSelectedProgForSeatMatrix] = useState(null);
  const [courseFilterDept, setCourseFilterDept] = useState('ALL');
  const filteredCourses = coursesList.filter((c) => courseFilterDept === 'ALL' || c.department_id === courseFilterDept);

  // New Course Form Fields
  const [newCourseCode, setNewCourseCode] = useState('');
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseDept, setNewCourseDept] = useState('');
  const [newCourseProg, setNewCourseProg] = useState('');
  const [newCourseSem, setNewCourseSem] = useState(1);
  const [newCourseType, setNewCourseType] = useState('CORE');
  const [newCourseCredits, setNewCourseCredits] = useState(3);
  const [newCourseHours, setNewCourseHours] = useState(4);
  const [newCourseDesc, setNewCourseDesc] = useState('');
  const [loadingApprovals, setLoadingApprovals] = useState(true);

  // Class Roster State
  const [studentsList, setStudentsList] = useState([
    { id: 1, name: 'Alex Johnson', roll_no: 'CS-2024-001', present: true, marks: 28 },
    { id: 2, name: 'Priya Sharma', roll_no: 'CS-2024-002', present: true, marks: 29 },
    { id: 3, name: 'Rahul Varma', roll_no: 'CS-2024-003', present: false, marks: 24 },
    { id: 4, name: 'Sneha Patel', roll_no: 'CS-2024-004', present: true, marks: 27 },
  ]);

  const rawRoles = session?.user?.roles || [];
  const roles = rawRoles.map((r) => (typeof r === 'string' ? r : r.code));
  const activeRole = session?.user?.activeRole || session?.user?.role || 'STUDENT';
  const isSuperAdmin = roles.includes('ADMIN') || session?.user?.role === 'ADMIN' || session?.user?.email === 'sureshmagnolia@gmail.com';
  const isSimulatingRole = isSuperAdmin && activeRole !== 'ADMIN';

  // Strict role isolation: when simulating non-faculty role (e.g. STUDENT), restrict access
  const isFaculty = isSimulatingRole
    ? (activeRole === 'FACULTY' || activeRole === 'HOD' || activeRole === 'PRINCIPAL')
    : (activeRole === 'ADMIN' || activeRole === 'HOD' || activeRole === 'FACULTY' || roles.includes('FACULTY') || roles.includes('HOD') || roles.includes('ADMIN') || roles.includes('PRINCIPAL') || isSuperAdmin);
  
  const isHod = isSimulatingRole
    ? (activeRole === 'HOD' || activeRole === 'PRINCIPAL')
    : (activeRole === 'HOD' || roles.includes('HOD') || roles.includes('ADMIN') || isSuperAdmin);

  async function loadDepartmentApprovals() {
    setLoadingApprovals(true);
    try {
      const resJoins = await fetch('/api/join-requests?status=PENDING');
      const dataJoins = await resJoins.json();
      if (dataJoins.requests) setJoinRequests(dataJoins.requests);

      const resChanges = await fetch('/api/change-requests?status=PENDING');
      const dataChanges = await resChanges.json();
      if (dataChanges.changeRequests) setChangeRequests(dataChanges.changeRequests);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingApprovals(false);
    }
  }

  async function loadDeptDossiers() {
    setLoadingDeptDossiers(true);
    try {
      const res = await fetch('/api/admissions/verify?stage=DEPT_LEVEL');
      const data = await res.json();
      if (data.dossiers) setDeptDossiers(data.dossiers);
    } catch (err) {
      console.error('Error loading dept admission dossiers:', err);
    } finally {
      setLoadingDeptDossiers(false);
    }
  }

  async function handleDeptVerify(email, action) {
    setProcessingDossierEmail(email);
    try {
      const res = await fetch('/api/admissions/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          step: 1,
          verification_action: action, // 'APPROVE' or 'REVISE'
          notes: deptDossierNotes[email] || '',
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to verify candidate dossier');
        return;
      }
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
      await loadDeptDossiers();
    } catch (err) {
      console.error('Error verifying dossier:', err);
      alert('Failed to process verification');
    } finally {
      setProcessingDossierEmail(null);
    }
  }

  useEffect(() => {
    if (session?.user && isFaculty) {
      loadDepartmentApprovals();
      loadDeptDossiers();
      loadCoursesData();
    }
  }, [session, isFaculty]);

  
  async function loadCoursesData() {
    setLoadingCourses(true);
    try {
      const [resCrs, resProg, resDept] = await Promise.all([
        fetch('/api/courses').then(r => r.json()).catch(() => ({ courses: [] })),
        fetch('/api/admin/programs').then(r => r.json()).catch(() => ({ programs: [] })),
        fetch('/api/admin/departments').then(r => r.json()).catch(() => ({ departments: [] })),
      ]);
      if (resCrs.courses) setCoursesList(resCrs.courses);
      if (resProg.programs) setProgramsList(resProg.programs);
      if (resDept.departments) {
        setDepartmentsList(resDept.departments);
        if (resDept.departments.length > 0 && !newCourseDept) {
          setNewCourseDept(resDept.departments[0].id);
        }
      }
    } catch (err) {
      console.error('Error loading courses:', err);
    } finally {
      setLoadingCourses(false);
    }
  }

  async function handleCreateCourse(e) {
    e.preventDefault();
    if (!newCourseCode.trim() || !newCourseName.trim() || !newCourseDept) {
      alert('Course Code, Course Name, and Department are required.');
      return;
    }

    try {
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          program_id: newCourseProg || null,
          department_id: newCourseDept,
          code: newCourseCode.trim(),
          name: newCourseName.trim(),
          semester: parseInt(newCourseSem, 10),
          course_type: newCourseType,
          credits: parseInt(newCourseCredits, 10),
          hours_per_week: parseInt(newCourseHours, 10),
          description: newCourseDesc.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setCoursesList([...coursesList, data.course]);
        setShowAddCourseModal(false);
        setNewCourseCode('');
        setNewCourseName('');
        setNewCourseDesc('');
        alert('Course added to program successfully!');
      } else {
        alert(data.error || 'Failed to add course.');
      }
    } catch (err) {
      alert('Network error adding course.');
    }
  }

  async function handleDeleteCourse(courseId, courseName) {
    if (!window.confirm(`Are you sure you want to remove the course "${courseName}"?`)) {
      return;
    }
    try {
      const res = await fetch(`/api/courses?id=${courseId}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok && data.success) {
        setCoursesList(coursesList.filter(c => c.id !== courseId));
        alert('Course removed successfully.');
      } else {
        alert(data.error || 'Failed to delete course.');
      }
    } catch (err) {
      alert('Network error deleting course.');
    }
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
          superior_notes: notes,
        }),
      });
      if (res.ok) {
        setJoinRequests(joinRequests.filter((r) => r.id !== requestId));
        setNotes('');
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  }

  // Review Change Request
  async function handleReviewChange(requestId, action) {
    try {
      const res = await fetch('/api/change-requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          request_id: requestId,
          action,
          reviewer_comments: notes,
        }),
      });
      if (res.ok) {
        setChangeRequests(changeRequests.filter((c) => c.id !== requestId));
        setNotes('');
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  }

  function toggleAttendance(id) {
    setStudentsList((prev) =>
      prev.map((s) => (s.id === id ? { ...s, present: !s.present } : s))
    );
  }

  function handleMarksChange(id, val) {
    setStudentsList((prev) =>
      prev.map((s) => (s.id === id ? { ...s, marks: Number(val) } : s))
    );
  }

  function handleSaveData() {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  }

  if (status === 'loading') {
    return (
      <div className="student-loading-container">
        <Clock size={24} className="spin" />
        <p>Loading Faculty Workspace...</p>
      </div>
    );
  }

  if (!isFaculty) {
    if (isSimulatingRole) {
      return (
        <div className="admin-access-denied god-mode-isolated">
          <div className="simulation-isolation-card">
            <div className="simulation-isolation-badge">
              <ShieldAlert size={18} />
              <span>GOD MODE ISOLATION: {activeRole}</span>
            </div>
            <h2>Faculty & Department Workspace Hidden</h2>
            <p>
              You are currently simulating the <strong>{activeRole}</strong> role in God Mode. The Faculty & HoD Console is hidden to provide the authentic {activeRole} view.
            </p>
            <div className="isolation-action-btns">
              <Link href={activeRole === 'STUDENT' ? '/student' : activeRole.startsWith('RESEARCH') ? '/research' : '/'} className="btn btn-primary">
                Return to {activeRole} Portal
              </Link>
              <button onClick={() => update({ activeRole: 'FACULTY' })} className="btn btn-secondary">
                Switch Simulated Role to Faculty
              </button>
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className="admin-access-denied">
        <ShieldAlert size={56} className="denied-icon" />
        <h2>Faculty & Department Portal</h2>
        <p>This workspace is restricted to Teaching Faculty and Department Heads (HoDs).</p>
        <Link href="/" className="btn btn-primary">Return to Portal Home</Link>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-container">
      {/* Page Header */}
      <div className="admin-page-header">
        <div className="admin-header-titles">
          <div className="admin-badge">
            <BookOpen size={16} />
            <span>Faculty & Department Superior Console</span>
          </div>
          <h1 className="admin-main-title">Academic Delivery & Candidate Verification</h1>
          <p className="admin-subtitle">
            Verify newly scanned student self-enrollments, review profile change requests, mark daily attendance, and record assessments.
          </p>
        </div>

        {savedSuccess && (
          <div className="save-badge-success">
            <CheckCircle size={16} /> Updates Saved to Institutional Master!
          </div>
        )}
      </div>

      {/* Side Panel Dashboard Layout */}
      <div className="admin-sidepanel-layout">
        <aside className="admin-sidebar-nav">
          <div className="sidebar-group-title">DEPARTMENT MODULES</div>
          <div className="sidebar-nav-list">
            <button
              onClick={() => setActiveTab('join_requests')}
              className={`sidebar-nav-item ${activeTab === 'join_requests' ? 'active' : ''}`}
            >
              <div className="sidebar-item-icon">
                <UserPlus size={18} />
              </div>
              <div className="sidebar-item-info">
                <span className="sidebar-item-title">Join Requests</span>
                <span className="sidebar-item-desc">Verify candidates</span>
              </div>
              <span className={`sidebar-item-badge ${joinRequests.length > 0 ? 'highlight' : ''}`}>
                {joinRequests.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('dept_admissions')}
              className={`sidebar-nav-item ${activeTab === 'dept_admissions' ? 'active' : ''}`}
            >
              <div className="sidebar-item-icon">
                <GraduationCap size={18} />
              </div>
              <div className="sidebar-item-info">
                <span className="sidebar-item-title">Stage 1: Admission Desk</span>
                <span className="sidebar-item-desc">Department level audit</span>
              </div>
              <span className={`sidebar-item-badge ${deptDossiers.length > 0 ? 'highlight-emerald' : ''}`}>
                {deptDossiers.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('change_requests')}
              className={`sidebar-nav-item ${activeTab === 'change_requests' ? 'active' : ''}`}
            >
              <div className="sidebar-item-icon">
                <FileEdit size={18} />
              </div>
              <div className="sidebar-item-info">
                <span className="sidebar-item-title">Change Requests</span>
                <span className="sidebar-item-desc">Review student edits</span>
              </div>
              <span className={`sidebar-item-badge ${changeRequests.length > 0 ? 'highlight-amber' : ''}`}>
                {changeRequests.length}
              </span>
            </button>

            
            <button
              onClick={() => setActiveTab('courses')}
              className={`sidebar-nav-item ${activeTab === 'courses' ? 'active' : ''}`}
            >
              <div className="sidebar-item-icon">
                <BookOpen size={18} />
              </div>
              <div className="sidebar-item-info">
                <span className="sidebar-item-title">Program Courses</span>
                <span className="sidebar-item-desc">Curriculum & syllabus</span>
              </div>
              <span className="sidebar-item-badge">{coursesList.length}</span>
            </button>

            <button
              onClick={() => setActiveTab('seat_matrix')}
              className={`sidebar-nav-item ${activeTab === 'seat_matrix' ? 'active' : ''}`}
            >
              <div className="sidebar-item-icon">
                <SlidersHorizontal size={18} />
              </div>
              <div className="sidebar-item-info">
                <span className="sidebar-item-title">Degree Programs & Seat Matrix</span>
                <span className="sidebar-item-desc">Reservation quotas & intake</span>
              </div>
              <span className="sidebar-item-badge">{programsList.length}</span>
            </button>

            <button
              onClick={() => setActiveTab('attendance')}
              className={`sidebar-nav-item ${activeTab === 'attendance' ? 'active' : ''}`}
            >
              <div className="sidebar-item-icon">
                <Calendar size={18} />
              </div>
              <div className="sidebar-item-info">
                <span className="sidebar-item-title">Class Attendance</span>
                <span className="sidebar-item-desc">Daily roll call</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('marks')}
              className={`sidebar-nav-item ${activeTab === 'marks' ? 'active' : ''}`}
            >
              <div className="sidebar-item-icon">
                <Award size={18} />
              </div>
              <div className="sidebar-item-info">
                <span className="sidebar-item-title">Assessment Marks</span>
                <span className="sidebar-item-desc">Internal marks sign-off</span>
              </div>
            </button>
          </div>

          <div className="sidebar-status-card">
            <span className="status-kicker">SUPERIOR ACCESS</span>
            <div className="pillar-item">
              <ShieldCheck size={14} className="pillar-icon" />
              <span>Department Verification Authority</span>
            </div>
            <div className="pillar-item">
              <CheckCircle size={14} className="pillar-icon" />
              <span>Maker-Checker Approval Mode</span>
            </div>
          </div>
        </aside>

        <main className="admin-sidepanel-content">

      {/* ------------------------------------------------------------- */}
      {/* TAB 1: DEPARTMENT JOIN REQUESTS */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'join_requests' && (
        <div className="tab-section-content">
          <div className="admin-card">
            <div className="card-header">
              <UserPlus size={20} className="card-icon" />
              <div>
                <h3 className="card-title">Candidate Join Requests for Department Review</h3>
                <p className="card-desc">
                  Students who scanned the activated departmental QR code and authenticated via Google. Verify their physical admission credentials and approve to unlock their Onboarding Master Profile.
                </p>
              </div>
            </div>

            {joinRequests.length === 0 ? (
              <div className="empty-state-box">
                <CheckCircle size={36} className="text-green" />
                <p>No pending join requests in your departmental queue.</p>
              </div>
            ) : (
              <div className="requests-grid">
                {joinRequests.map((req) => (
                  <div key={req.id} className="request-card">
                    <div className="request-card-header">
                      <div className="applicant-avatar-circle">
                        {(req.applicant_name || 'U')[0].toUpperCase()}
                      </div>
                      <div>
                        <h4 className="applicant-name">{req.applicant_name}</h4>
                        <span className="applicant-email">{req.applicant_email}</span>
                      </div>
                    </div>

                    <div className="request-card-details">
                      <div className="detail-item">
                        <span className="lbl">Role Requested:</span>
                        <span className="val highlight">{req.requested_role}</span>
                      </div>
                      <div className="detail-item">
                        <span className="lbl">Department:</span>
                        <span className="val">
                          {DEPARTMENTS_CATALOG.find((d) => d.id === req.department_id)?.name || req.department_id}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="lbl">Admission Ref No:</span>
                        <span className="val">{req.admission_or_emp_no || 'N/A'}</span>
                      </div>
                      <div className="detail-item">
                        <span className="lbl">Contact Mobile:</span>
                        <span className="val">{req.mobile_number || 'N/A'}</span>
                      </div>
                    </div>

                    <div className="request-actions">
                      <button
                        onClick={() => handleReviewJoin(req.id, 'APPROVE')}
                        className="btn-approve"
                      >
                        <CheckCircle size={15} /> Verify & Unlock Onboarding
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
      {/* TAB: STAGE 1 - DEPARTMENT ADMISSION VERIFICATION DESK */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'dept_admissions' && (
        <div className="tab-section-content">
          <div className="admin-card">
            <div className="card-header" style={{ justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <GraduationCap size={24} className="card-icon text-emerald" />
                <div>
                  <h3 className="card-title">Stage 1: Department Level Admission Verification</h3>
                  <p className="card-desc">
                    Class Tutors and HoD audit submitted student profiles, mark sheets, and quota claims. Approving forwards the dossier to the Central Admission Nodal Officer (Stage 2).
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <div style={{ position: 'relative' }}>
                  <Search size={15} style={{ position: 'absolute', left: '10px', top: '10px', color: '#64748b' }} />
                  <input
                    type="text"
                    placeholder="Search candidate name, CAP ID..."
                    value={deptDossierSearch}
                    onChange={(e) => setDeptDossierSearch(e.target.value)}
                    className="form-input"
                    style={{ paddingLeft: '32px', fontSize: '0.82rem', width: '220px' }}
                  />
                </div>
                <button
                  type="button"
                  onClick={loadDeptDossiers}
                  className="btn-refresh"
                  title="Reload department queue"
                >
                  <RefreshCw size={15} className={loadingDeptDossiers ? 'spin' : ''} />
                </button>
              </div>
            </div>

            {loadingDeptDossiers ? (
              <div className="empty-state-box">
                <Clock size={32} className="spin text-emerald" />
                <p>Loading candidate admission dossiers for departmental audit...</p>
              </div>
            ) : deptDossiers.filter(d => !deptDossierSearch || (d.full_name || '').toLowerCase().includes(deptDossierSearch.toLowerCase()) || (d.cap_id || '').toLowerCase().includes(deptDossierSearch.toLowerCase())).length === 0 ? (
              <div className="empty-state-box">
                <CheckCircle size={36} className="text-green" />
                <p>No candidates currently awaiting Stage 1 Department Level Verification.</p>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  Candidates appear here once their self-enrollment is approved and they submit their master onboarding profile.
                </span>
              </div>
            ) : (
              <div className="requests-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '20px', marginTop: '16px' }}>
                {deptDossiers
                  .filter(d => !deptDossierSearch || (d.full_name || '').toLowerCase().includes(deptDossierSearch.toLowerCase()) || (d.cap_id || '').toLowerCase().includes(deptDossierSearch.toLowerCase()))
                  .map((cand) => (
                    <div key={cand.id || cand.user_email} className="dossier-card">
                      <div className="dossier-card-top">
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                          <div className="applicant-avatar-circle">
                            {(cand.full_name || 'S')[0].toUpperCase()}
                          </div>
                          <div>
                            <h4 style={{ margin: 0, fontSize: '1.05rem', color: '#f8fafc', fontWeight: 700 }}>
                              {cand.full_name || 'Candidate'}
                            </h4>
                            <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{cand.user_email}</span>
                          </div>
                        </div>
                        <span className="stage-badge pending">STAGE 1: DEPT PENDING</span>
                      </div>

                      <div className="dossier-meta-grid">
                        <div className="meta-box">
                          <span className="meta-lbl">CAP / App ID</span>
                          <span className="meta-val highlight">{cand.cap_id || cand.admission_or_emp_no || 'N/A'}</span>
                        </div>
                        <div className="meta-box">
                          <span className="meta-lbl">Program & Dept</span>
                          <span className="meta-val">{cand.program_name || cand.program_code || 'UG Degree'}</span>
                        </div>
                        <div className="meta-box">
                          <span className="meta-lbl">Allotted Quota</span>
                          <span className="meta-val">{cand.admission_quota || 'General Merit'}</span>
                        </div>
                        <div className="meta-box">
                          <span className="meta-lbl">Community / Caste</span>
                          <span className="meta-val">{cand.caste_name || cand.actual_category || 'General'}</span>
                        </div>
                        <div className="meta-box">
                          <span className="meta-lbl">Qualifying Exam</span>
                          <span className="meta-val">{cand.qualifying_percentage ? `${cand.qualifying_percentage}%` : 'Not recorded'}</span>
                        </div>
                        <div className="meta-box">
                          <span className="meta-lbl">Candidate Mobile</span>
                          <span className="meta-val">{cand.mobile_number || 'N/A'}</span>
                        </div>
                      </div>

                      {/* Line-item note / observation for tutor */}
                      <div style={{ marginTop: '12px' }}>
                        <input
                          type="text"
                          placeholder="Verification observations / notes (optional)"
                          value={deptDossierNotes[cand.user_email] || ''}
                          onChange={(e) => setDeptDossierNotes({ ...deptDossierNotes, [cand.user_email]: e.target.value })}
                          className="form-input"
                          style={{ fontSize: '0.8rem', padding: '6px 10px', width: '100%' }}
                        />
                      </div>

                      <div className="dossier-actions" style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
                        <button
                          type="button"
                          disabled={processingDossierEmail === cand.user_email}
                          onClick={() => handleDeptVerify(cand.user_email, 'APPROVE')}
                          className="btn-approve"
                          style={{ flex: 1, justifyContent: 'center' }}
                        >
                          <CheckCircle2 size={15} /> Verify & Send to Nodal Desk
                        </button>
                        <button
                          type="button"
                          disabled={processingDossierEmail === cand.user_email}
                          onClick={() => handleDeptVerify(cand.user_email, 'REVISE')}
                          className="btn-reject"
                          style={{ justifyContent: 'center' }}
                          title="Return to student with correction instructions"
                        >
                          <XCircle size={15} /> Request Corrections
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
      {/* TAB 2: DATA CHANGE REQUESTS */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'change_requests' && (
        <div className="tab-section-content">
          <div className="admin-card">
            <div className="card-header">
              <FileEdit size={20} className="card-icon" />
              <div>
                <h3 className="card-title">Maker-Checker: Student Data Variable Edits</h3>
                <p className="card-desc">
                  Students requesting modification of locked profile items. Review the proposed value and justification before committing.
                </p>
              </div>
            </div>

            {changeRequests.length === 0 ? (
              <div className="empty-state-box">
                <CheckCircle size={36} className="text-green" />
                <p>No pending change requests in your queue.</p>
              </div>
            ) : (
              <div className="change-requests-list">
                {changeRequests.map((c) => (
                  <div key={c.id} className="change-request-card">
                    <div className="change-card-header">
                      <div>
                        <h4 className="user-name">{c.user_name} ({c.user_role})</h4>
                        <span className="user-email">{c.user_email}</span>
                      </div>
                      <span className="badge field-badge">{c.field_label || c.field_name}</span>
                    </div>

                    <div className="change-comparison-box">
                      <div className="val-block old">
                        <span className="val-label">Current Locked Value:</span>
                        <span className="val-text">{c.current_value || 'None'}</span>
                      </div>
                      <div className="val-arrow">&rarr;</div>
                      <div className="val-block new">
                        <span className="val-label">Proposed New Value:</span>
                        <span className="val-text">{c.proposed_value}</span>
                      </div>
                    </div>

                    <div className="justification-box">
                      <span className="just-label">Student Justification:</span>
                      <p className="just-text">{c.justification}</p>
                    </div>

                    <div className="change-actions-row">
                      <button
                        onClick={() => handleReviewChange(c.id, 'APPROVE')}
                        className="btn-approve-change"
                      >
                        <CheckCircle size={15} /> Approve & Update Master Record
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
      {/* ------------------------------------------------------------- */}
      {/* TAB 2.5: PROGRAM COURSES & CURRICULUM MANAGEMENT              */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'courses' && (
        <div className="tab-section-content">
          <div className="admin-card">
            <div className="card-header" style={{ justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <BookOpen size={24} className="card-icon text-indigo" />
                <div>
                  <h3 className="card-title">Program Courses & Curriculum Offerings</h3>
                  <p className="card-desc">
                    Undergraduate (4-Year FYUGP) & Postgraduate course registry. HoDs and Faculty members can register new courses, define credits, and attach courses to degree programs or supporting departments.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddCourseModal(true)}
                className="btn-primary-action"
                style={{ whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <PlusCircle size={16} /> Add Course to Program
              </button>
            </div>

            {/* Filters Row */}
            <div className="courses-filter-bar" style={{ display: 'flex', gap: '14px', margin: '20px 0', flexWrap: 'wrap', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Filter size={15} style={{ color: '#94a3b8' }} />
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#94a3b8' }}>Filter by Department:</span>
                <select
                  value={courseFilterDept}
                  onChange={(e) => setCourseFilterDept(e.target.value)}
                  className="form-select"
                  style={{ width: 'auto', padding: '6px 12px', fontSize: '0.82rem' }}
                >
                  <option value="ALL">All Departments ({departmentsList.length})</option>
                  {departmentsList.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.type === 'SUPPORTING' ? 'Supporting' : 'Degree-Offering'})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginLeft: 'auto', fontSize: '0.82rem', color: '#64748b' }}>
                Showing <strong>{filteredCourses.length}</strong> of {coursesList.length} courses
              </div>
            </div>

            {/* Courses Grid */}
            {loadingCourses ? (
              <div className="empty-state-box">
                <RefreshCw size={28} className="spinner-icon text-indigo" />
                <p>Loading course catalogue & syllabi...</p>
              </div>
            ) : filteredCourses.length === 0 ? (
              <div className="empty-state-box">
                <BookOpen size={36} style={{ color: '#64748b' }} />
                <p>No courses found matching selected filters.</p>
                <button onClick={() => setShowAddCourseModal(true)} className="btn-secondary-action" style={{ marginTop: '12px' }}>
                  <PlusCircle size={15} /> Add First Course
                </button>
              </div>
            ) : (
              <div className="courses-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '18px' }}>
                {filteredCourses.map((crs) => {
                  const dept = departmentsList.find((d) => d.id === crs.department_id);
                  const prog = programsList.find((p) => p.id === crs.program_id);
                  const isSupporting = dept?.type === 'SUPPORTING' || !crs.program_id;

                  return (
                    <div key={crs.id} className="course-card">
                      <div className="course-card-top">
                        <div className="course-badge-row">
                          <span className="course-code-tag">{crs.code}</span>
                          <span className={`course-type-pill ${(crs.course_type || 'CORE').toLowerCase()}`}>
                            {crs.course_type || 'CORE'}
                          </span>
                          <span className="course-sem-pill">Sem {crs.semester || 1}</span>
                        </div>
                        <button
                          onClick={() => handleDeleteCourse(crs.id)}
                          className="btn-delete-course"
                          title="Remove Course from Curriculum"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>

                      <h4 className="course-title">{crs.name}</h4>
                      <p className="course-desc-text">{crs.description || 'No course syllabus overview provided.'}</p>

                      <div className="course-meta-grid">
                        <div className="course-meta-item">
                          <span className="meta-lbl">Department:</span>
                          <span className="meta-val">{dept?.name || crs.department_id}</span>
                        </div>
                        <div className="course-meta-item">
                          <span className="meta-lbl">Program:</span>
                          <span className="meta-val highlight">
                            {prog ? prog.name : isSupporting ? 'Supporting / Multi-Program Elective' : 'Autonomous Offering'}
                          </span>
                        </div>
                        <div className="course-meta-item">
                          <span className="meta-lbl">Credits & Hours:</span>
                          <span className="meta-val">
                            <strong>{crs.credits || 3}</strong> Credits &bull; {crs.hours_per_week || 4} Hrs/Week
                          </span>
                        </div>
                        {crs.faculty_email && (
                          <div className="course-meta-item">
                            <span className="meta-lbl">Course In-Charge:</span>
                            <span className="meta-val">{crs.faculty_email}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB: DEGREE PROGRAMS & SEAT MATRIX */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'seat_matrix' && (
        <div className="tab-section-content">
          <div className="admin-card">
            <div className="card-header" style={{ justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <SlidersHorizontal size={24} className="card-icon text-emerald" />
                <div>
                  <h3 className="card-title">Academic Degree Programs & Pre-Admission Seat Matrix</h3>
                  <p className="card-desc">
                    Configure statutory seat split-ups across OPEN merit and 14 reserved community/special quotas prior to fresh student onboarding. OPEN seats are open to all applicants, while reserved categories are restricted to designated social and economic quotas.
                  </p>
                </div>
              </div>
            </div>

            {/* Department Programs Grid */}
            {programsList.length === 0 ? (
              <div className="empty-state-box">
                <Building size={36} style={{ color: '#64748b' }} />
                <p>No active degree programs found in the institutional catalog.</p>
              </div>
            ) : (
              <div className="programs-seat-matrix-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px', marginTop: '20px' }}>
                {programsList.map((prog) => {
                  const dept = departmentsList.find((d) => d.id === prog.department_id);
                  const matrix = prog.seat_matrix || {};
                  const totalAllotted = Object.values(matrix).reduce((acc, v) => acc + (parseInt(v, 10) || 0), 0);
                  const intake = parseInt(prog.intake_capacity, 10) || 0;
                  const isBalanced = totalAllotted === intake && intake > 0;
                  const isOver = totalAllotted > intake;
                  const isZero = totalAllotted === 0;

                  return (
                    <div key={prog.id} className="program-seat-card" style={{ background: 'rgba(15, 23, 42, 0.75)', border: '1px solid rgba(255, 255, 255, 0.09)', borderRadius: '14px', padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '12px', transition: 'all 0.2s ease' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span className="prog-level-tag">{prog.level}</span>
                          <span className="dept-code-tag">{prog.code}</span>
                        </div>
                        <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                          {dept?.name || prog.department_id}
                        </span>
                      </div>

                      <div>
                        <h4 style={{ margin: '0 0 4px 0', fontSize: '1.05rem', color: '#f8fafc', fontWeight: 700 }}>{prog.name}</h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: '#94a3b8', flexWrap: 'wrap' }}>
                          <span>{prog.duration_years} Years ({prog.total_semesters} Semesters)</span>
                          {prog.level === 'UG' && (
                            <span className="fyugp-exit-badge" title="Four Year Undergraduate Programme with Exit Option">
                              ⚡ FYUGP
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Seat Allocation Status Banner */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(2, 6, 23, 0.6)', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                        <div>
                          <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block', fontWeight: 600, textTransform: 'uppercase' }}>Sanctioned Intake</span>
                          <strong style={{ fontSize: '1.2rem', color: '#ffffff' }}>{intake} Seats</strong>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block', fontWeight: 600, textTransform: 'uppercase' }}>Allotted</span>
                          {isBalanced ? (
                            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#34d399', background: 'rgba(16, 185, 129, 0.15)', padding: '3px 8px', borderRadius: '6px', border: '1px solid rgba(16, 185, 129, 0.3)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <CheckCircle size={12} /> {totalAllotted}/{intake} (Balanced)
                            </span>
                          ) : isOver ? (
                            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f87171', background: 'rgba(239, 68, 68, 0.15)', padding: '3px 8px', borderRadius: '6px', border: '1px solid rgba(239, 68, 68, 0.3)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <AlertCircle size={12} /> {totalAllotted}/{intake} (+{totalAllotted - intake})
                            </span>
                          ) : isZero ? (
                            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', background: 'rgba(148, 163, 184, 0.1)', padding: '3px 8px', borderRadius: '6px' }}>
                              Not Configured
                            </span>
                          ) : (
                            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fbbf24', background: 'rgba(245, 158, 11, 0.15)', padding: '3px 8px', borderRadius: '6px', border: '1px solid rgba(245, 158, 11, 0.3)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <AlertTriangle size={12} /> {totalAllotted}/{intake} ({intake - totalAllotted} left)
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Quota Chips Preview */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '2px' }}>
                        {SEAT_RESERVATION_CATEGORIES.map((cat) => {
                          const seats = matrix[cat.code] || 0;
                          return (
                            <span
                              key={cat.code}
                              title={`${cat.name}: ${seats} seats`}
                              style={{
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                padding: '2px 6px',
                                borderRadius: '5px',
                                background: cat.isOpen
                                  ? 'rgba(16, 185, 129, 0.2)'
                                  : seats > 0
                                  ? 'rgba(99, 102, 241, 0.15)'
                                  : 'rgba(255, 255, 255, 0.04)',
                                color: cat.isOpen
                                  ? '#34d399'
                                  : seats > 0
                                  ? '#c7d2fe'
                                  : '#64748b',
                                border: '1px solid ' + (cat.isOpen ? 'rgba(16, 185, 129, 0.35)' : seats > 0 ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255, 255, 255, 0.05)'),
                              }}
                            >
                              {cat.code}: {seats}
                            </span>
                          );
                        })}
                      </div>

                      {/* Action Button */}
                      <button
                        type="button"
                        onClick={() => setSelectedProgForSeatMatrix({ ...prog, department_name: dept?.name })}
                        className="btn-primary-action"
                        style={{ marginTop: 'auto', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                      >
                        <SlidersHorizontal size={15} />
                        Configure Seat Split-Up
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: ATTENDANCE */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'attendance' && (
        <div className="tab-section-content">
          <div className="admin-card">
            <div className="card-header">
              <Calendar size={20} className="card-icon" />
              <div>
                <h3 className="card-title">Daily Class Attendance Registry</h3>
                <p className="card-desc">CS601: Database Management Systems &bull; B.Sc CS 2024 Batch &bull; Hour 1</p>
              </div>
            </div>

            <div className="academics-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Roll No</th>
                    <th>Student Name</th>
                    <th>Status</th>
                    <th>Attendance Action</th>
                  </tr>
                </thead>
                <tbody>
                  {studentsList.map((s) => (
                    <tr key={s.id}>
                      <td><strong>{s.roll_no}</strong></td>
                      <td>{s.name}</td>
                      <td>
                        <span className={`badge ${s.present ? 'active' : 'expired'}`}>
                          {s.present ? 'PRESENT' : 'ABSENT'}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => toggleAttendance(s.id)}
                          className={`btn-toggle-att ${s.present ? 'mark-absent' : 'mark-present'}`}
                        >
                          {s.present ? 'Mark Absent' : 'Mark Present'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="card-bottom-actions">
              <button onClick={handleSaveData} className="btn-primary-action">
                <Save size={16} /> Save Attendance Records
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 4: MARKS */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'marks' && (
        <div className="tab-section-content">
          <div className="admin-card">
            <div className="card-header">
              <Award size={20} className="card-icon" />
              <div>
                <h3 className="card-title">Internal Assessment Evaluations</h3>
                <p className="card-desc">Maximum Marks: 30 &bull; Continuous Internal Evaluation (CIE-1)</p>
              </div>
            </div>

            <div className="academics-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Roll No</th>
                    <th>Student Name</th>
                    <th>Marks Obtained (Max 30)</th>
                  </tr>
                </thead>
                <tbody>
                  {studentsList.map((s) => (
                    <tr key={s.id}>
                      <td><strong>{s.roll_no}</strong></td>
                      <td>{s.name}</td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          max="30"
                          value={s.marks}
                          onChange={(e) => handleMarksChange(s.id, e.target.value)}
                          className="form-input mark-field"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="card-bottom-actions">
              <button onClick={handleSaveData} className="btn-primary-action">
                <Save size={16} /> Save Internal Marks
              </button>
            </div>
          </div>
        </div>
      )}
        
      {/* ------------------------------------------------------------- */}
      {/* FLOATING POPUP MODAL: ADD COURSE TO PROGRAM                  */}
      {/* ------------------------------------------------------------- */}
      {showAddCourseModal && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowAddCourseModal(false);
          }}
        >
          <div className="modal-card">
            <div className="modal-header">
              <div className="modal-title-row">
                <BookOpen size={20} className="text-indigo" />
                <h3>Add Course to Academic Curriculum</h3>
              </div>
              <button onClick={() => setShowAddCourseModal(false)} className="btn-close-modal">
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateCourse} className="admin-form">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Course Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BOT1B01, ARB1A07, CS1B01"
                    value={newCourseCode}
                    onChange={(e) => setNewCourseCode(e.target.value)}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Course Type *</label>
                  <select
                    value={newCourseType}
                    onChange={(e) => setNewCourseType(e.target.value)}
                    className="form-select"
                  >
                    <option value="CORE">Core Course (Discipline Major)</option>
                    <option value="COMMON">Common Course (Language / Communication)</option>
                    <option value="COMPLEMENTARY">Complementary / Allied Minor</option>
                    <option value="OPEN_ELECTIVE">Open Elective (Inter-Disciplinary)</option>
                    <option value="VALUE_ADDED">Value-Added / Skill Course</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Course Title / Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Angiosperm Anatomy and Microtechnique"
                  value={newCourseName}
                  onChange={(e) => setNewCourseName(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Offering Department *</label>
                  <select
                    value={newCourseDept}
                    onChange={(e) => setNewCourseDept(e.target.value)}
                    className="form-select"
                    required
                  >
                    {departmentsList.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.type === 'SUPPORTING' ? 'Supporting' : 'Degree-Offering'})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Target Academic Program</label>
                  <select
                    value={newCourseProg}
                    onChange={(e) => setNewCourseProg(e.target.value)}
                    className="form-select"
                  >
                    <option value="">None (Common / Supporting across all programs)</option>
                    {programsList.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.level})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Semester (1 - 8)</label>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    value={newCourseSem}
                    onChange={(e) => setNewCourseSem(e.target.value)}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Credits</label>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    value={newCourseCredits}
                    onChange={(e) => setNewCourseCredits(e.target.value)}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Hours / Week</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={newCourseHours}
                    onChange={(e) => setNewCourseHours(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Course Description / Syllabus Overview</label>
                <textarea
                  rows="3"
                  placeholder="Outline unit modules, practical lab requirements, learning outcomes..."
                  value={newCourseDesc}
                  onChange={(e) => setNewCourseDesc(e.target.value)}
                  className="form-textarea"
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setShowAddCourseModal(false)}
                  className="btn-cancel"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary-action">
                  Register Course in Program
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Program Seat Matrix Modal */}
      {selectedProgForSeatMatrix && (
        <SeatMatrixModal
          program={selectedProgForSeatMatrix}
          onClose={() => setSelectedProgForSeatMatrix(null)}
          onSaveSuccess={(progId, newSplit) => {
            setProgramsList((prev) =>
              prev.map((p) => (p.id === progId ? { ...p, seat_matrix: newSplit } : p))
            );
          }}
        />
      )}
        </main>
      </div>
    </div>
  );
}
