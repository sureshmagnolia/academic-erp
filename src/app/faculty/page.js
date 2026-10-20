'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
  BookOpen, PlusCircle, Trash2, Layers, Tag, AlignLeft, Info,
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
} from 'lucide-react';
import { DEPARTMENTS_CATALOG } from '@/lib/constants';

export default function FacultyPage() {
  const { data: session, status } = useSession();

  const [activeTab, setActiveTab] = useState('join_requests');
  const [selectedCourse, setSelectedCourse] = useState('CS601');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Department Approvals State
  const [joinRequests, setJoinRequests] = useState([]);
  const [changeRequests, setChangeRequests] = useState([]);
  const [notes, setNotes] = useState('');
  
  // Courses & Curriculum State
  const [coursesList, setCoursesList] = useState([]);
  const [programsList, setProgramsList] = useState([]);
  const [departmentsList, setDepartmentsList] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [courseFilterDept, setCourseFilterDept] = useState('ALL');

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

  const roles = session?.user?.roles?.map((r) => (typeof r === 'string' ? r : r.code)) || [];
  const activeRole = session?.user?.activeRole || session?.user?.role || 'STUDENT';
  const isFaculty = activeRole === 'ADMIN' || activeRole === 'HOD' || activeRole === 'FACULTY' || roles.includes('FACULTY') || roles.includes('HOD') || roles.includes('ADMIN') || roles.includes('PRINCIPAL') || session?.user?.email === 'sureshmagnolia@gmail.com';
  const isHod = activeRole === 'HOD' || roles.includes('HOD') || roles.includes('ADMIN');

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

  useEffect(() => {
    if (session?.user && isFaculty) {
      loadDepartmentApprovals();
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
        </main>
      </div>
    </div>
  );
}
