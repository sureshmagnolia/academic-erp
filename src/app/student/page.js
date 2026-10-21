'use client';

import { useState, useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';
import Link from 'next/link';
import {
  GraduationCap,
  BookOpen,
  Award,
  Calendar,
  CheckCircle,
  Clock,
  Bell,
  Mail,
  User,
  ShieldCheck,
  TrendingUp,
  FileEdit,
  AlertTriangle,
  Send,
  X,
  ExternalLink,
  MapPin,
  Heart,
  Phone,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Eye,
  RefreshCw,
  QrCode,
} from 'lucide-react';

export default function StudentPage() {
  const { data: session, status, update } = useSession();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [academicRecords, setAcademicRecords] = useState([]);
  const [myChanges, setMyChanges] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [myJoinRequest, setMyJoinRequest] = useState(null);
  const [inputToken, setInputToken] = useState('');

  // Change Request Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedField, setSelectedField] = useState('mobile_number');
  const [selectedFieldLabel, setSelectedFieldLabel] = useState('Primary Contact Mobile');
  const [currentVal, setCurrentVal] = useState('');
  const [proposedVal, setProposedVal] = useState('');
  const [justification, setJustification] = useState('');
  const [proofUrl, setProofUrl] = useState('');
  const [isSubmittingChange, setIsSubmittingChange] = useState(false);
  const [changeMsg, setChangeMsg] = useState({ type: '', text: '' });

  const editableFields = [
    { name: 'mobile_number', label: 'Primary Contact Mobile', current: profile?.mobile_number },
    { name: 'alternate_email', label: 'Alternate Email', current: profile?.alternate_email },
    { name: 'emergency_contact_phone', label: 'Emergency / Guardian Phone', current: profile?.emergency_contact_phone },
    { name: 'permanent_address', label: 'Permanent Address', current: profile?.permanent_address },
    { name: 'permanent_pincode', label: 'Permanent PIN Code', current: profile?.permanent_pincode },
    { name: 'blood_group', label: 'Blood Group', current: profile?.blood_group },
    { name: 'community_category', label: 'Community / Reservation Category', current: profile?.community_category },
    { name: 'linkedin_url', label: 'LinkedIn Profile URL', current: profile?.linkedin_url },
    { name: 'github_url', label: 'GitHub / Portfolio URL', current: profile?.github_url },
    { name: 'document_proof_url', label: 'Supporting Cloud Proof Folder', current: profile?.document_proof_url },
  ];

  async function loadStudentData() {
    setLoading(true);
    try {
      // 1. Profile
      const resProf = await fetch('/api/profile');
      const dataProf = await resProf.json();
      if (dataProf.profile) setProfile(dataProf.profile);

      // 2. Academic Dashboard (Marks & Attendance)
      const resDash = await fetch('/api/student/dashboard');
      const dataDash = await resDash.json();
      if (dataDash.academicRecords) setAcademicRecords(dataDash.academicRecords);
      if (dataDash.announcements) setAnnouncements(dataDash.announcements);

      // 3. My Change Requests
      const resChanges = await fetch('/api/change-requests');
      const dataChanges = await resChanges.json();
      if (dataChanges.changeRequests) setMyChanges(dataChanges.changeRequests);

      // 4. My Join Request Status
      try {
        const resJoin = await fetch('/api/join-requests?mine=true');
        const dataJoin = await resJoin.json();
        if (dataJoin.requests && dataJoin.requests.length > 0) {
          setMyJoinRequest(dataJoin.requests[0]);
        }
      } catch (e) {
        console.error('Error loading my join request:', e);
      }
    } catch (err) {
      console.error('Error loading student data:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (session?.user) {
      loadStudentData();
    }
  }, [session]);

  function openEditModal(fieldKey, fieldLbl, currVal) {
    setSelectedField(fieldKey);
    setSelectedFieldLabel(fieldLbl);
    setCurrentVal(currVal || '');
    setProposedVal('');
    setJustification('');
    setProofUrl('');
    setChangeMsg({ type: '', text: '' });
    setModalOpen(true);
  }

  async function handleSubmitChange(e) {
    e.preventDefault();
    if (!proposedVal.trim() || !justification.trim()) {
      setChangeMsg({ type: 'error', text: 'Proposed value and mandatory justification are required.' });
      return;
    }

    setIsSubmittingChange(true);
    try {
      const res = await fetch('/api/change-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          field_name: selectedField,
          field_label: selectedFieldLabel,
          current_value: currentVal,
          proposed_value: proposedVal.trim(),
          justification: justification.trim(),
          document_proof_url: proofUrl.trim() || null,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setChangeMsg({
          type: 'success',
          text: 'Data Change Request submitted to Department Superior! Awaiting review.',
        });
        setMyChanges([data.changeRequest, ...myChanges]);
        setTimeout(() => setModalOpen(false), 2000);
      } else {
        setChangeMsg({ type: 'error', text: data.error || 'Failed to submit request.' });
      }
    } catch (err) {
      setChangeMsg({ type: 'error', text: 'Network error submitting change request.' });
    } finally {
      setIsSubmittingChange(false);
    }
  }

  if (status === 'loading' || (session?.user && loading)) {
    return (
      <div className="student-loading-container">
        <Clock size={28} className="spin" />
        <p>Loading Verified Student Profile & Academics...</p>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="student-unauth-container">
        <GraduationCap size={64} className="unauth-icon" />
        <h2>Student Academic Portal</h2>
        <p>Sign in with your registered Google account to view your attendance, grades, and master records.</p>
        <button onClick={() => signIn('google')} className="btn btn-primary">
          Sign In with Google
        </button>
      </div>
    );
  }

  // Strict God Mode Role Isolation: If simulating a non-student role, isolate student portal
  const rawRoles = session?.user?.roles || (session?.user?.role ? [session?.user?.role] : []);
  const roleCodes = rawRoles.map((r) => (typeof r === 'string' ? r : r.code));
  const isSuperAdmin = roleCodes.includes('ADMIN') || session?.user?.email === 'sureshmagnolia@gmail.com' || session?.user?.activeRole === 'ADMIN';
  const activeRole = session?.user?.activeRole || session?.user?.role || (isSuperAdmin ? 'ADMIN' : 'STUDENT');
  const isSimulatingRole = isSuperAdmin && activeRole !== 'ADMIN';

  if (isSimulatingRole && activeRole !== 'STUDENT') {
    return (
      <div className="admin-access-denied god-mode-isolated">
        <div className="simulation-isolation-card">
          <div className="simulation-isolation-badge">
            <Eye size={18} />
            <span>GOD MODE ISOLATION: {activeRole}</span>
          </div>
          <h2>Student Portal Hidden</h2>
          <p>
            You are currently simulating the <strong>{activeRole}</strong> role in God Mode. The Student Academic Workspace is hidden to provide the authentic {activeRole} view.
          </p>
          <div className="isolation-action-btns">
            <Link
              href={activeRole === 'FACULTY' || activeRole === 'HOD' ? '/faculty' : activeRole.startsWith('RESEARCH') ? '/research' : '/admin'}
              className="btn btn-primary"
            >
              Return to {activeRole} Portal
            </Link>
            <button onClick={() => update({ activeRole: 'STUDENT' })} className="btn btn-secondary">
              Switch Simulated Role to Student
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If the user has authenticated with Google, but is not yet an enrolled student
  const isEnrolled = session?.user?.isEnrolled || Boolean(profile && profile.profile_status === 'APPROVED');
  if (!isSuperAdmin && !isEnrolled && !profile) {
    if (myJoinRequest && myJoinRequest.status === 'PENDING') {
      return (
        <div className="student-portal-wrapper">
          <div className="student-pending-join-card">
            <div className="pending-badge">
              <Clock size={18} className="spin" />
              <span>ACADEMIC SELF-ENROLLMENT UNDER SUPERIOR REVIEW</span>
            </div>
            <h2>Join Request Submitted & Awaiting Department Approval</h2>
            <p className="pending-lead">
              Your self-enrollment request has been securely recorded and dispatched to your <strong>Department Superior (Faculty / HoD)</strong> for official admission list verification.
            </p>
            <div className="pending-details-box">
              <div className="detail-item">
                <span className="lbl">Applicant Name:</span>
                <span className="val">{myJoinRequest.applicant_name || session.user.name}</span>
              </div>
              <div className="detail-item">
                <span className="lbl">Verified Google Email:</span>
                <span className="val">{myJoinRequest.applicant_email || session.user.email}</span>
              </div>
              <div className="detail-item">
                <span className="lbl">Application / CAP Ref:</span>
                <span className="val">{myJoinRequest.admission_or_emp_no || 'Pending Assignment'}</span>
              </div>
              <div className="detail-item">
                <span className="lbl">Target Department:</span>
                <span className="val">{myJoinRequest.department_id}</span>
              </div>
              <div className="detail-item">
                <span className="lbl">Submission Timestamp:</span>
                <span className="val">{new Date(myJoinRequest.created_at).toLocaleString()}</span>
              </div>
              <div className="detail-item">
                <span className="lbl">Current Status:</span>
                <span className="val status-pill-pending">⏳ PENDING PHYSICAL AUDIT</span>
              </div>
            </div>
            <p className="pending-hint">
              Once your Superior approves your request, your student profile will activate and you will be directed to complete the Master Onboarding Wizard (Ask Once).
            </p>
            <div className="pending-actions-row">
              <button onClick={loadStudentData} className="btn btn-primary">
                <RefreshCw size={16} /> Refresh Verification Status
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (myJoinRequest && myJoinRequest.status === 'CORRECTION_REQUESTED') {
      return (
        <div className="student-portal-wrapper">
          <div className="student-pending-join-card">
            <div className="pending-badge warning">
              <AlertTriangle size={18} />
              <span>ACTION REQUIRED: CORRECTIONS REQUESTED BY SUPERIOR</span>
            </div>
            <h2>Department Superior Requested Corrections</h2>
            <p>
              Your Department Superior reviewed your join request and requested corrections before approval:
            </p>
            <div className="superior-notes-box">
              <strong>Superior Note:</strong> {myJoinRequest.superior_notes || 'Please verify your application details and re-submit.'}
            </div>
            <Link href="/join" className="btn btn-primary">
              Re-submit Join Request
            </Link>
          </div>
        </div>
      );
    }

    return (
      <div className="student-portal-wrapper">
        <div className="student-pending-join-card">
          <div className="pending-badge warning">
            <QrCode size={18} />
            <span>SELF-ENROLLMENT REQUIRED</span>
          </div>
          <h2>Academic Self-Enrollment Required</h2>
          <p className="pending-lead">
            Welcome, <strong>{session.user.name}</strong> ({session.user.email}). You are authenticated via Google, but your account is not yet enrolled in any academic department or degree program.
          </p>
          <p>
            To gain access, please scan the official <strong>Dynamic QR Code</strong> or open the <strong>Self-Enrollment Link</strong> provided by your Department Superior / Admission Cell.
          </p>
          <div className="token-enter-container">
            <label className="lbl">Have an Enrollment Token or Link?</label>
            <div className="token-input-group">
              <input
                type="text"
                placeholder="Paste token or link (e.g. enr_... or https://.../join/enr_...)"
                value={inputToken}
                onChange={(e) => setInputToken(e.target.value)}
                className="token-input"
              />
              <button
                type="button"
                onClick={() => {
                  const clean = inputToken.trim().split('/').pop();
                  if (clean) window.location.href = `/join/${clean}`;
                }}
                className="btn btn-primary"
              >
                Join Program <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isApproved = profile?.profile_status === 'APPROVED';
  const needsOnboarding = !profile || profile.profile_status === 'ONBOARDING_PENDING' || profile.profile_status === 'NOT_STARTED';
  const avgAttendance = academicRecords.length > 0
    ? (academicRecords.reduce((acc, curr) => acc + Number(curr.attendance_pct || 0), 0) / academicRecords.length).toFixed(1)
    : '91.2';

  return (
    <div className="student-portal-wrapper">
      {/* Top Banner if Onboarding Pending */}
      {needsOnboarding && (
        <div className="onboarding-alert-banner">
          <div className="banner-left">
            <Sparkles size={24} className="text-amber" />
            <div>
              <h3>Action Required: Complete Your Master Onboarding Profile</h3>
              <p>
                Our system enforces the <strong>&ldquo;Ask Once&rdquo;</strong> principle. Fill your master details once to unlock permanent profile locking and institutional access.
              </p>
            </div>
          </div>
          <Link href="/onboarding" className="btn-start-onboarding">
            Open Onboarding Wizard <ArrowRight size={16} />
          </Link>
        </div>
      )}

      {/* Profile Header */}
      <div className="student-hero-card">
        <div className="hero-left">
          <div className="student-avatar-lg">
            {session.user.image ? (
              <img src={session.user.image} alt={session.user.name} />
            ) : (
              (session.user.name || 'S')[0].toUpperCase()
            )}
          </div>
          <div className="student-meta">
            <div className="meta-tag-row">
              <span className="student-badge role">STUDENT</span>
              <span className={`student-badge status ${isApproved ? 'locked' : 'pending'}`}>
                <ShieldCheck size={14} /> {isApproved ? 'MASTER PROFILE LOCKED & VERIFIED' : 'UNDER VERIFICATION'}
              </span>
            </div>
            <h1 className="student-name">{profile?.full_name || session.user.name}</h1>
            <p className="student-roll">
              Admission Ref: <strong>{profile?.admission_or_emp_no || 'ADM-2024-CS-001'}</strong> &bull; {session.user.email}
            </p>
          </div>
        </div>

        <div className="hero-stats">
          <div className="stat-pill">
            <span className="stat-val text-green">{avgAttendance}%</span>
            <span className="stat-lbl">Overall Attendance</span>
          </div>
          <div className="stat-pill">
            <span className="stat-val text-blue">8.9</span>
            <span className="stat-lbl">Semester CGPA</span>
          </div>
          <div className="stat-pill">
            <span className="stat-val text-purple">{academicRecords.length || 4}</span>
            <span className="stat-lbl">Active Courses</span>
          </div>
        </div>
      </div>

      {/* Tabs / Sections */}
      <div className="student-sections-grid">
        {/* Left Column: Master Profile (Ask Once Single Source of Truth) */}
        <div className="student-column-main">
          <div className="content-card">
            <div className="card-header-flex">
              <div>
                <h3 className="card-heading">Master Profile (Single Source of Truth)</h3>
                <p className="card-subheading">
                  All institutional modules consume these verified data points. Fields are locked against arbitrary edits.
                </p>
              </div>
              <button
                onClick={() => openEditModal(editableFields[0].name, editableFields[0].label, editableFields[0].current)}
                className="btn-request-edit"
              >
                <FileEdit size={15} /> Request Data Edit
              </button>
            </div>

            {/* Profile Grid */}
            <div className="profile-details-grid">
              <div className="profile-card-group">
                <div className="group-title">
                  <User size={15} /> Personal & Demographics
                </div>
                <div className="prop-row">
                  <span className="prop-name">Date of Birth:</span>
                  <span className="prop-val">{profile?.dob ? profile.dob.split('T')[0] : '2004-06-14'}</span>
                </div>
                <div className="prop-row">
                  <span className="prop-name">Gender:</span>
                  <span className="prop-val">{profile?.gender || 'Male'}</span>
                </div>
                <div className="prop-row">
                  <span className="prop-name">Blood Group:</span>
                  <span className="prop-val highlight">{profile?.blood_group || 'B+'}</span>
                </div>
                <div className="prop-row">
                  <span className="prop-name">Marital Status:</span>
                  <span className="prop-val">{profile?.marital_status || 'Single'}</span>
                </div>
              </div>

              <div className="profile-card-group">
                <div className="group-title">
                  <Heart size={15} /> Social & Reservations
                </div>
                <div className="prop-row">
                  <span className="prop-name">Religion:</span>
                  <span className="prop-val">{profile?.religion || 'Christian'}</span>
                </div>
                <div className="prop-row">
                  <span className="prop-name">Category:</span>
                  <span className="prop-val">{profile?.community_category || 'General'}</span>
                </div>
                <div className="prop-row">
                  <span className="prop-name">Sub-Caste:</span>
                  <span className="prop-val">{profile?.caste_name || 'Anglo-Indian'}</span>
                </div>
                <div className="prop-row">
                  <span className="prop-name">Special Quotas:</span>
                  <span className="prop-val">
                    {profile?.reservations && profile.reservations.length > 0
                      ? profile.reservations.join(', ')
                      : 'None'}
                  </span>
                </div>
              </div>

              <div className="profile-card-group">
                <div className="group-title">
                  <Phone size={15} /> Contact & Emergency
                </div>
                <div className="prop-row">
                  <span className="prop-name">Primary Mobile:</span>
                  <span className="prop-val">{profile?.mobile_number || '+91 98765 43210'}</span>
                </div>
                <div className="prop-row">
                  <span className="prop-name">Alternate Email:</span>
                  <span className="prop-val">{profile?.alternate_email || 'alex.personal@gmail.com'}</span>
                </div>
                <div className="prop-row">
                  <span className="prop-name">Emergency Contact:</span>
                  <span className="prop-val">{profile?.emergency_contact_name || 'David Johnson (Father)'}</span>
                </div>
                <div className="prop-row">
                  <span className="prop-name">Guardian Phone:</span>
                  <span className="prop-val">{profile?.emergency_contact_phone || '9876500009'}</span>
                </div>
              </div>

              <div className="profile-card-group">
                <div className="group-title">
                  <MapPin size={15} /> Permanent Residence
                </div>
                <div className="prop-row">
                  <span className="prop-name">State:</span>
                  <span className="prop-val">{profile?.permanent_state || 'Kerala'}</span>
                </div>
                <div className="prop-row">
                  <span className="prop-name">District:</span>
                  <span className="prop-val">{profile?.permanent_district || 'Ernakulam'}</span>
                </div>
                <div className="prop-row">
                  <span className="prop-name">PIN Code:</span>
                  <span className="prop-val">{profile?.permanent_pincode || '682016'}</span>
                </div>
                <div className="prop-row">
                  <span className="prop-name">Address:</span>
                  <span className="prop-val">{profile?.permanent_address || '42 Palm Grove Avenue'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Academic Records & Timetable */}
          <div className="content-card">
            <h3 className="card-heading">Semester Academic Performance & Attendance</h3>
            <div className="academics-table-wrap">
              <table className="student-table">
                <thead>
                  <tr>
                    <th>Subject Code & Title</th>
                    <th>Internal (30)</th>
                    <th>External (70)</th>
                    <th>Total</th>
                    <th>Grade</th>
                    <th>Attendance</th>
                  </tr>
                </thead>
                <tbody>
                  {academicRecords.map((r) => (
                    <tr key={r.id}>
                      <td>
                        <strong>{r.subject_code}</strong>
                        <div className="table-sub">{r.subject_name}</div>
                      </td>
                      <td>{r.internal_marks}</td>
                      <td>{r.external_marks}</td>
                      <td><strong>{r.total_marks}</strong></td>
                      <td><span className="grade-badge">{r.grade}</span></td>
                      <td>
                        <span className={`attendance-tag ${r.attendance_pct >= 85 ? 'good' : 'warning'}`}>
                          {r.attendance_pct}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Maker-Checker Change Requests History */}
        <div className="student-column-side">
          <div className="content-card">
            <h3 className="card-heading">My Data Change Requests ({myChanges.length})</h3>
            <p className="card-subheading">
              Track the progress of changes requested to your locked profile.
            </p>

            {myChanges.length === 0 ? (
              <p className="empty-side-text">No edit requests submitted. Your master profile is currently synchronized.</p>
            ) : (
              <div className="changes-timeline">
                {myChanges.map((c) => (
                  <div key={c.id} className="change-item">
                    <div className="change-item-top">
                      <span className="change-field">{c.field_label || c.field_name}</span>
                      <span className={`status-chip ${c.status.toLowerCase()}`}>{c.status}</span>
                    </div>
                    <div className="change-vals">
                      <span className="old-val">{c.current_value || 'None'}</span> &rarr;{' '}
                      <span className="new-val">{c.proposed_value}</span>
                    </div>
                    <div className="change-reason">
                      <strong>Reason:</strong> {c.justification}
                    </div>
                    {c.reviewer_comments && (
                      <div className="reviewer-feedback">
                        <strong>Superior Note:</strong> {c.reviewer_comments}
                      </div>
                    )}
                    <span className="change-date">{new Date(c.created_at).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Announcements Card */}
          <div className="content-card">
            <h3 className="card-heading">Institutional Notices</h3>
            <div className="notices-list">
              {announcements.map((a) => (
                <div key={a.id} className="notice-box">
                  <h4>{a.title}</h4>
                  <p>{a.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Maker-Checker Request Edit Modal */}
      {modalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <div className="modal-title-wrap">
                <FileEdit size={20} className="modal-icon" />
                <div>
                  <h3>Request Data Variable Update</h3>
                  <p>Changes require verification & approval by your Department Superior.</p>
                </div>
              </div>
              <button onClick={() => setModalOpen(false)} className="btn-close-modal">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitChange} className="modal-form">
              {changeMsg.text && (
                <div className={`modal-alert ${changeMsg.type}`}>
                  {changeMsg.type === 'success' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
                  <span>{changeMsg.text}</span>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Select Field to Modify *</label>
                <select
                  value={selectedField}
                  onChange={(e) => {
                    const f = editableFields.find((item) => item.name === e.target.value);
                    setSelectedField(e.target.value);
                    setSelectedFieldLabel(f?.label || e.target.value);
                    setCurrentVal(f?.current || '');
                  }}
                  className="form-select"
                >
                  {editableFields.map((f) => (
                    <option key={f.name} value={f.name}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Current Locked Value (Read Only)</label>
                <input type="text" readOnly value={currentVal || 'None / Blank'} className="form-input read-only-input" />
              </div>

              <div className="form-group">
                <label className="form-label">Proposed New Value *</label>
                <input
                  type="text"
                  required
                  value={proposedVal}
                  onChange={(e) => setProposedVal(e.target.value)}
                  placeholder="Enter corrected / updated data value"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Mandatory Justification / Reason *</label>
                <textarea
                  required
                  rows={2}
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  placeholder="Explain why this data point needs updating (e.g. SIM card replacement, residential shift, certificate update)"
                  className="form-textarea"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Supporting Proof Cloud Link (Optional / Recommended)</label>
                <input
                  type="url"
                  value={proofUrl}
                  onChange={(e) => setProofUrl(e.target.value)}
                  placeholder="https://drive.google.com/file/d/your-proof"
                  className="form-input"
                />
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setModalOpen(false)} className="btn-cancel">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmittingChange} className="btn-submit-change">
                  {isSubmittingChange ? <Clock size={16} className="spin" /> : <Send size={16} />}
                  <span>Submit Request to Superior</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
