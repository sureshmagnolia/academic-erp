'use client';

import { useState, useEffect, Fragment } from 'react';
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
  ChevronDown,
  ChevronRight,
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
  Calendar,
  CalendarPlus,
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
  Key,
  ShieldAlert,
  CheckCircle2,
  Lock,
  Unlock,
  Sliders,
  Settings2,
  FileText,
  RotateCcw,
  Info,
} from 'lucide-react';
import QRCodeSvg from '@/components/QRCodeSvg';
import SeatMatrixModal from '@/components/SeatMatrixModal';
import {
  MASTER_ROLES,
  DEPARTMENTS_CATALOG,
  SYSTEM_PRIVILEGES,
  ROLE_DEFAULT_PRIVILEGES,
  computeEffectivePrivileges,
} from '@/lib/constants';

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

  // Seat Matrix Filters
  const [progLevelFilter, setProgLevelFilter] = useState('ALL');
  const [progDeptFilter, setProgDeptFilter] = useState('ALL');
  const [progSearchTerm, setProgSearchTerm] = useState('');

  // Admissions Multi-Step Verification Desk State
  const [admissionsDossiers, setAdmissionsDossiers] = useState([]);
  const [activeDossierStage, setActiveDossierStage] = useState('ALL');
  const [processingDossierEmail, setProcessingDossierEmail] = useState(null);
  const [actionNotes, setActionNotes] = useState('');
  const [ptaReceiptNo, setPtaReceiptNo] = useState('');
  const [ptaAmount, setPtaAmount] = useState('1850');
  const [officialAdmissionNo, setOfficialAdmissionNo] = useState('');

  // TC Issuance Modal
  const [showTcModal, setShowTcModal] = useState(false);
  const [tcTargetCandidate, setTcTargetCandidate] = useState(null);
  const [tcSerialNo, setTcSerialNo] = useState('');
  const [tcReason, setTcReason] = useState('Course Completed / Relieved upon request');

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

  // Edit Department Form State
  const [showEditDeptModal, setShowEditDeptModal] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [editDeptName, setEditDeptName] = useState('');
  const [editDeptCode, setEditDeptCode] = useState('');
  const [editDeptType, setEditDeptType] = useState('PROGRAM_OFFERING');
  const [editDeptDesc, setEditDeptDesc] = useState('');
  const [editDeptHod, setEditDeptHod] = useState('');
  const [editDeptSubmitting, setEditDeptSubmitting] = useState(false);

  // Edit Program Form State
  const [showEditProgModal, setShowEditProgModal] = useState(false);
  const [editingProg, setEditingProg] = useState(null);
  const [editProgDeptId, setEditProgDeptId] = useState('');
  const [editProgName, setEditProgName] = useState('');
  const [editProgCode, setEditProgCode] = useState('');
  const [editProgLevel, setEditProgLevel] = useState('UG');
  const [editProgDuration, setEditProgDuration] = useState(3);
  const [editProgSems, setEditProgSems] = useState(8);
  const [editProgIntake, setEditProgIntake] = useState(60);
  const [editProgSubmitting, setEditProgSubmitting] = useState(false);

  const [tokens, setTokens] = useState([]);
  const [tokenTitle, setTokenTitle] = useState('');
  const [tokenRole, setTokenRole] = useState('STUDENT');
  const [tokenDept, setTokenDept] = useState('dept_comp_sci');
  const [tokenBatch, setTokenBatch] = useState('batch_bsc_cs_2024');
  const [tokenMaxUses, setTokenMaxUses] = useState(60);
  const [tokenValidityMode, setTokenValidityMode] = useState('date'); // 'date' | 'preset'
  const [tokenExpiryDate, setTokenExpiryDate] = useState(() => {
    const d = new Date(Date.now() + 14 * 86400000);
    return d.toISOString().split('T')[0];
  });
  const [tokenExpiryTime, setTokenExpiryTime] = useState('23:59');
  const [tokenExpiresHours, setTokenExpiresHours] = useState(72);
  const [tokenSubmitting, setTokenSubmitting] = useState(false);
  const [copiedToken, setCopiedToken] = useState(null);

  // Extend Token Validity Modal State
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [extendTargetToken, setExtendTargetToken] = useState(null);
  const [extendNewDate, setExtendNewDate] = useState('');
  const [extendNewTime, setExtendNewTime] = useState('23:59');
  const [extendMaxUses, setExtendMaxUses] = useState(100);
  const [extendReactivate, setExtendReactivate] = useState(true);
  const [extendSubmitting, setExtendSubmitting] = useState(false);

  // 2. Join Requests State
  const [joinRequests, setJoinRequests] = useState([]);
  const [reviewingRequestId, setReviewingRequestId] = useState(null);
  const [superiorNotes, setSuperiorNotes] = useState('');
  const [expandedRequestId, setExpandedRequestId] = useState(null);
  const [joinReviewNotes, setJoinReviewNotes] = useState({});
  const [reviewSubmittingId, setReviewSubmittingId] = useState(null);

  // 3. Data Change Requests State
  const [changeRequests, setChangeRequests] = useState([]);
  const [reviewingChangeId, setReviewingChangeId] = useState(null);
  const [changeComments, setChangeComments] = useState('');

  // 4. Role & Privilege Manager State
  const [usersList, setUsersList] = useState([]);
  const [systemPrivileges, setSystemPrivileges] = useState([]);
  const [roleDefaultPrivileges, setRoleDefaultPrivileges] = useState({});
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('ALL');
  const [userDeptFilter, setUserDeptFilter] = useState('ALL');

  // Assign Role Modal
  const [showAssignRoleModal, setShowAssignRoleModal] = useState(false);
  const [assignTargetUser, setAssignTargetUser] = useState(null);
  const [assignRoleEmail, setAssignRoleEmail] = useState('');
  const [assignRoleName, setAssignRoleName] = useState('');
  const [assignRoleCode, setAssignRoleCode] = useState('FACULTY');
  const [assignRoleDept, setAssignRoleDept] = useState('');
  const [assignRoleScopeId, setAssignRoleScopeId] = useState('');
  const [assignSubmitting, setAssignSubmitting] = useState(false);

  // Manage Privileges Modal
  const [showPrivilegesModal, setShowPrivilegesModal] = useState(false);
  const [privilegeTargetUser, setPrivilegeTargetUser] = useState(null);
  const [userGrantedPrivs, setUserGrantedPrivs] = useState(new Set());
  const [userRevokedPrivs, setUserRevokedPrivs] = useState(new Set());
  const [savingPrivileges, setSavingPrivileges] = useState(false);

  // Privilege Matrix Overview Modal
  const [showMatrixModal, setShowMatrixModal] = useState(false);

  // Scholar & Announcement State
  const [scholars, setScholars] = useState([]);
  const [announcements, setAnnouncements] = useState([]);

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

  const allPrograms = departmentsList.flatMap((d) =>
    (d.programs || []).map((p) => ({
      ...p,
      department_id: d.id,
      department_name: d.name,
      department_code: d.code,
    }))
  );

  const rawRoles = session?.user?.roles || [];
  const roles = rawRoles.map((r) => (typeof r === 'string' ? r : r.code));
  const activeRole = session?.user?.activeRole || session?.user?.role || 'ADMIN';
  const isSuperAdmin = roles.includes('ADMIN') || session?.user?.role === 'ADMIN' || session?.user?.email === 'sureshmagnolia@gmail.com';
  const isSimulatingRole = isSuperAdmin && activeRole !== 'ADMIN';

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

      // 4. Users & Roles & Privileges
      const resUsers = await fetch('/api/admin/roles');
      const dataUsers = await resUsers.json();
      if (dataUsers.users) setUsersList(dataUsers.users);
      if (dataUsers.systemPrivileges) setSystemPrivileges(dataUsers.systemPrivileges);
      if (dataUsers.roleDefaultPrivileges) setRoleDefaultPrivileges(dataUsers.roleDefaultPrivileges);

      // 5. Admissions Multi-Step Dossiers
      try {
        const resDos = await fetch('/api/admissions/verify');
        const dataDos = await resDos.json();
        if (dataDos.dossiers) setAdmissionsDossiers(dataDos.dossiers);
      } catch (e) {
        console.error('Error loading dossiers:', e);
      }

      // 6. Announcements
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
  async function handleProcessVerificationStep(email, step, verification_action) {
    setProcessingDossierEmail(email);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await fetch('/api/admissions/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          step,
          verification_action,
          notes: actionNotes,
          pta_receipt_no: ptaReceiptNo,
          pta_amount: ptaAmount,
          official_admission_no: officialAdmissionNo,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg(data.message || 'Verification step completed successfully!');
        setActionNotes('');
        setPtaReceiptNo('');
        setOfficialAdmissionNo('');
        loadAllData();
      } else {
        setErrorMsg(data.error || 'Failed to complete verification step.');
      }
    } catch {
      setErrorMsg('Network error while processing verification.');
    } finally {
      setProcessingDossierEmail(null);
    }
  }

  async function handleIssueTcSubmit(e) {
    e.preventDefault();
    if (!tcTargetCandidate) return;
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await fetch('/api/admissions/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ISSUE_TC',
          email: tcTargetCandidate.user_email,
          tc_serial_no: tcSerialNo,
          reason: tcReason,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg(data.message || 'Transfer Certificate issued successfully!');
        setShowTcModal(false);
        setTcTargetCandidate(null);
        setTcSerialNo('');
        loadAllData();
      } else {
        setErrorMsg(data.error || 'Failed to issue Transfer Certificate.');
      }
    } catch {
      setErrorMsg('Network error while issuing TC.');
    }
  }

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

  function openEditDeptModal(dept) {
    setEditingDept(dept);
    setEditDeptName(dept.name || '');
    setEditDeptCode(dept.code || '');
    setEditDeptType(dept.type || 'PROGRAM_OFFERING');
    setEditDeptDesc(dept.description || '');
    setEditDeptHod(dept.hod_email || '');
    setShowEditDeptModal(true);
  }

  async function handleUpdateDeptSubmit(e) {
    e.preventDefault();
    if (!editingDept || !editDeptName.trim() || !editDeptCode.trim()) return;

    setEditDeptSubmitting(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/admin/departments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingDept.id,
          name: editDeptName.trim(),
          code: editDeptCode.trim().toUpperCase(),
          type: editDeptType,
          description: editDeptDesc.trim(),
          hod_email: editDeptHod.trim() || null,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg(`Department "${editDeptName}" updated successfully!`);
        setShowEditDeptModal(false);
        setEditingDept(null);
        loadAllData();
      } else {
        setErrorMsg(data.error || 'Failed to update department.');
      }
    } catch {
      setErrorMsg('Network error while updating department.');
    } finally {
      setEditDeptSubmitting(false);
    }
  }

  function openEditProgModal(prog, dept) {
    setEditingProg(prog);
    setEditProgDeptId(dept?.id || prog.department_id || '');
    setEditProgName(prog.name || '');
    setEditProgCode(prog.code || '');
    setEditProgLevel(prog.level || 'UG');
    setEditProgDuration(prog.duration_years || 3);
    setEditProgSems(prog.total_semesters || 8);
    setEditProgIntake(prog.intake_capacity || 60);
    setShowEditProgModal(true);
  }

  async function handleUpdateProgSubmit(e) {
    e.preventDefault();
    if (!editingProg || !editProgName.trim() || !editProgCode.trim()) return;

    setEditProgSubmitting(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/admin/programs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingProg.id,
          department_id: editProgDeptId,
          name: editProgName.trim(),
          code: editProgCode.trim().toUpperCase(),
          level: editProgLevel,
          duration_years: editProgDuration,
          total_semesters: editProgSems,
          intake_capacity: editProgIntake,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg(`Degree Program "${editProgName}" updated successfully!`);
        setShowEditProgModal(false);
        setEditingProg(null);
        loadAllData();
      } else {
        setErrorMsg(data.error || 'Failed to update academic program.');
      }
    } catch {
      setErrorMsg('Network error while updating program.');
    } finally {
      setEditProgSubmitting(false);
    }
  }

  async function handleCreateToken(e) {
    e.preventDefault();
    setTokenSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const expiresAtPayload = tokenValidityMode === 'date' && tokenExpiryDate
        ? new Date(`${tokenExpiryDate}T${tokenExpiryTime || '23:59'}:00`).toISOString()
        : undefined;

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
          expires_at: expiresAtPayload,
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

  // Open Extend Validity Modal
  function handleOpenExtendModal(token) {
    setExtendTargetToken(token);
    const base = new Date(token.expires_at) > new Date() ? new Date(token.expires_at) : new Date();
    const future = new Date(base.getTime() + 14 * 86400000);
    setExtendNewDate(future.toISOString().split('T')[0]);
    setExtendNewTime('23:59');
    setExtendMaxUses(token.max_uses || 100);
    setExtendReactivate(true);
    setShowExtendModal(true);
  }

  // Quick preset extension helper
  function handleApplyExtendPreset(days) {
    const base = extendTargetToken && new Date(extendTargetToken.expires_at) > new Date()
      ? new Date(extendTargetToken.expires_at)
      : new Date();
    const newTarget = new Date(base.getTime() + days * 86400000);
    setExtendNewDate(newTarget.toISOString().split('T')[0]);
    setExtendNewTime('23:59');
  }

  // Save Extended Validity
  async function handleSaveExtendValidity(e) {
    e.preventDefault();
    if (!extendTargetToken || !extendNewDate) return;
    setExtendSubmitting(true);
    setErrorMsg('');
    try {
      const newExpiresAt = new Date(`${extendNewDate}T${extendNewTime || '23:59'}:00`).toISOString();
      const res = await fetch('/api/admin/enrollment-tokens', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tokenId: extendTargetToken.id,
          expiresAt: newExpiresAt,
          isActive: extendReactivate ? true : extendTargetToken.is_active,
          maxUses: extendMaxUses,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setTokens(tokens.map((t) => (t.id === extendTargetToken.id ? {
          ...t,
          expires_at: newExpiresAt,
          is_active: extendReactivate ? true : t.is_active,
          max_uses: Number(extendMaxUses),
        } : t)));
        setShowExtendModal(false);
        setSuccessMsg(`Validity for "${extendTargetToken.title}" extended until ${new Date(newExpiresAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}!`);
      } else {
        setErrorMsg(data.error || 'Failed to extend token validity.');
      }
    } catch (err) {
      setErrorMsg('Network error while extending token validity.');
    } finally {
      setExtendSubmitting(false);
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
  async function handleReviewJoin(requestId, action, customNotes = '') {
    setReviewSubmittingId(requestId);
    setErrorMsg('');
    try {
      const finalNotes = customNotes || joinReviewNotes[requestId] || superiorNotes;
      const res = await fetch('/api/join-requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          request_id: requestId,
          action,
          superior_notes: finalNotes,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setJoinRequests(joinRequests.filter((r) => r.id !== requestId));
        if (expandedRequestId === requestId) setExpandedRequestId(null);
        setReviewingRequestId(null);
        setSuperiorNotes('');
        setSuccessMsg(`Candidate request ${action === 'APPROVE' ? 'approved & onboarding unlocked' : action.toLowerCase()}!`);
        loadAllData();
      } else {
        const msg = data.error || 'Failed to review request.';
        setErrorMsg(msg);
        alert(msg);
      }
    } catch (err) {
      setErrorMsg('Network error while processing join review.');
      alert('Network error while processing join review.');
    } finally {
      setReviewSubmittingId(null);
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

  // Role & Privilege Manager Handlers
  async function handleAssignRoleSubmit(e) {
    e.preventDefault();
    if (!assignRoleEmail.trim() || !assignRoleCode) {
      setErrorMsg('User email and Role Code are required.');
      return;
    }
    setAssignSubmitting(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/admin/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: assignRoleEmail.trim().toLowerCase(),
          name: assignRoleName.trim(),
          role_code: assignRoleCode,
          department: assignRoleDept || null,
          scope_entity_id: assignRoleScopeId || null,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg(data.message || `Role ${assignRoleCode} assigned to ${assignRoleEmail}!`);
        setShowAssignRoleModal(false);
        setAssignTargetUser(null);
        setAssignRoleEmail('');
        setAssignRoleName('');
        setAssignRoleDept('');
        setAssignRoleScopeId('');
        loadAllData();
      } else {
        setErrorMsg(data.error || 'Failed to assign role.');
      }
    } catch {
      setErrorMsg('Network error while assigning role.');
    } finally {
      setAssignSubmitting(false);
    }
  }

  async function handleStripRole(email, roleCode, scopeEntityId) {
    const confirmMsg = `Are you sure you want to strip the role "${roleCode}" from ${email}?`;
    if (!window.confirm(confirmMsg)) return;

    setErrorMsg('');
    try {
      let url = `/api/admin/roles?email=${encodeURIComponent(email)}&role_code=${encodeURIComponent(roleCode)}`;
      if (scopeEntityId) url += `&scope_entity_id=${encodeURIComponent(scopeEntityId)}`;

      const res = await fetch(url, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg(data.message || `Role ${roleCode} stripped from ${email}.`);
        loadAllData();
      } else {
        setErrorMsg(data.error || 'Failed to remove role.');
      }
    } catch {
      setErrorMsg('Network error while stripping role.');
    }
  }

  function handleOpenPrivilegesModal(user) {
    setPrivilegeTargetUser(user);
    setUserGrantedPrivs(new Set(user.granted_privileges || []));
    setUserRevokedPrivs(new Set(user.revoked_privileges || []));
    setShowPrivilegesModal(true);
  }

  function handleSetPrivilegeState(privCode, action) {
    const nextGranted = new Set(userGrantedPrivs);
    const nextRevoked = new Set(userRevokedPrivs);

    if (action === 'GRANT') {
      nextGranted.add(privCode);
      nextRevoked.delete(privCode);
    } else if (action === 'REVOKE') {
      nextRevoked.add(privCode);
      nextGranted.delete(privCode);
    } else if (action === 'RESET') {
      nextGranted.delete(privCode);
      nextRevoked.delete(privCode);
    }

    setUserGrantedPrivs(nextGranted);
    setUserRevokedPrivs(nextRevoked);
  }

  async function handleSavePrivilegesSubmit() {
    if (!privilegeTargetUser) return;
    setSavingPrivileges(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/admin/roles', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: privilegeTargetUser.email,
          granted_privileges: Array.from(userGrantedPrivs),
          revoked_privileges: Array.from(userRevokedPrivs),
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg(`Privileges updated successfully for ${privilegeTargetUser.name || privilegeTargetUser.email}!`);
        setShowPrivilegesModal(false);
        setPrivilegeTargetUser(null);
        loadAllData();
      } else {
        setErrorMsg(data.error || 'Failed to update privileges.');
      }
    } catch {
      setErrorMsg('Network error while saving privileges.');
    } finally {
      setSavingPrivileges(false);
    }
  }

  function openAssignRoleForUser(user) {
    setAssignTargetUser(user);
    setAssignRoleEmail(user.email);
    setAssignRoleName(user.name || '');
    setAssignRoleDept(user.department || '');
    setAssignRoleCode('FACULTY');
    setShowAssignRoleModal(true);
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

  // Strict God Mode Role Isolation: If simulating a non-admin role, completely isolate admin console!
  if (isSimulatingRole && activeRole !== 'ADMIN' && activeRole !== 'PRINCIPAL') {
    return (
      <div className="admin-access-denied god-mode-isolated">
        <div className="simulation-isolation-card">
          <div className="simulation-isolation-badge">
            <Eye size={18} />
            <span>GOD MODE SIMULATION: {activeRole}</span>
          </div>
          <h2>Admin Governance Console is Hidden</h2>
          <p>
            You are currently simulating the <strong>{activeRole}</strong> ({MASTER_ROLES.find((m) => m.code === activeRole)?.name}) role in God Mode.
            Under strict role isolation, administrative governance menus and tools are restricted to ensure you experience the authentic {activeRole} view.
          </p>
          <div className="isolation-action-btns">
            <Link
              href={activeRole === 'STUDENT' ? '/student' : activeRole === 'FACULTY' || activeRole === 'HOD' ? '/faculty' : activeRole.startsWith('RESEARCH') ? '/research' : '/'}
              className="btn btn-primary"
            >
              Go to {activeRole} Portal
            </Link>
            <button onClick={() => handleGodModeSwitch('ADMIN')} className="btn btn-secondary">
              Exit Simulation & Return to Admin Console
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isAdmin = isSuperAdmin || roles.includes('ADMIN') || roles.includes('PRINCIPAL');
  if (!isAdmin) {
    return (
      <div className="admin-access-denied">
        <ShieldCheck size={56} className="denied-icon" />
        <h2>Administrative Authorization Required</h2>
        <p>This governance console is restricted to System Administrators and Principal Executive Officers.</p>
        <Link href="/" className="btn btn-primary">Return Home</Link>
      </div>
    );
  }

  const filteredUsers = usersList.filter((u) => {
    const q = userSearchTerm.trim().toLowerCase();
    const matchSearch =
      !q ||
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.department?.toLowerCase().includes(q) ||
      u.roles?.some((r) => r.code?.toLowerCase().includes(q));

    const matchRole =
      userRoleFilter === 'ALL' ||
      u.primary_type === userRoleFilter ||
      u.roles?.some((r) => r.code === userRoleFilter);

    const matchDept = userDeptFilter === 'ALL' || u.department === userDeptFilter;

    return matchSearch && matchRole && matchDept;
  });

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
                  <span className="sidebar-item-desc">Catalog & Governance</span>
                </div>
                <span className="sidebar-item-badge">{departmentsList.length}</span>
              </button>

              <button
                onClick={() => setActiveAdminTab('seat_matrix')}
                className={`sidebar-nav-item ${activeAdminTab === 'seat_matrix' ? 'active' : ''}`}
              >
                <div className="sidebar-item-icon text-emerald">
                  <SlidersHorizontal size={18} />
                </div>
                <div className="sidebar-item-info">
                  <span className="sidebar-item-title">Seat Split-Up Matrix</span>
                  <span className="sidebar-item-desc">Pre-admission quotas (15)</span>
                </div>
                <span className="sidebar-item-badge">{allPrograms.length}</span>
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

              <button
                onClick={() => setActiveAdminTab('admissions_desk')}
                className={`sidebar-nav-item ${activeAdminTab === 'admissions_desk' ? 'active' : ''}`}
              >
                <div className="sidebar-item-icon text-sky">
                  <CheckCircle2 size={18} />
                </div>
                <div className="sidebar-item-info">
                  <span className="sidebar-item-title">Admissions Multi-Step Desk</span>
                  <span className="sidebar-item-desc">Dept → Nodal → PTA → Principal</span>
                </div>
                <span className={`sidebar-item-badge ${admissionsDossiers.length > 0 ? 'highlight' : ''}`}>
                  {admissionsDossiers.length}
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <button
                            type="button"
                            title="Edit Department"
                            onClick={() => openEditDeptModal(dept)}
                            className="btn-edit-item-sm"
                          >
                            <FileEdit size={13} /> Edit
                          </button>
                          <button
                            type="button"
                            title="Remove Department"
                            onClick={() => handleDeleteDepartment(dept.id, dept.name)}
                            className="btn-delete-item-sm"
                          >
                            <Trash2 size={13} /> Remove
                          </button>
                        </div>
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
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                      <button
                                        type="button"
                                        title="Edit Degree Program"
                                        onClick={() => openEditProgModal(p, dept)}
                                        className="btn-edit-prog-icon"
                                      >
                                        <FileEdit size={12} />
                                      </button>
                                      <button
                                        type="button"
                                        title="Remove Degree Program"
                                        onClick={() => handleDeleteProgram(dept.id, p.id, p.name)}
                                        className="btn-delete-prog-icon"
                                      >
                                        <Trash2 size={12} />
                                      </button>
                                    </div>
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

          {/* Edit Department Modal */}
          {showEditDeptModal && editingDept && (
            <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowEditDeptModal(false); }}>
              <div className="modal-card">
                <div className="modal-header">
                  <div className="modal-title-row">
                    <FileEdit size={20} className="text-purple" />
                    <h3>Edit Academic Department ({editingDept.code})</h3>
                  </div>
                  <button type="button" onClick={() => setShowEditDeptModal(false)} className="btn-close-modal">✕</button>
                </div>

                <form onSubmit={handleUpdateDeptSubmit} className="admin-form">
                  <div className="form-group">
                    <label className="form-label">Department Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Department of Botany"
                      value={editDeptName}
                      onChange={(e) => setEditDeptName(e.target.value)}
                      className="form-input"
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Department Code *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. BOT, CS, ARABIC"
                        value={editDeptCode}
                        onChange={(e) => setEditDeptCode(e.target.value)}
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Department Type *</label>
                      <select
                        value={editDeptType}
                        onChange={(e) => setEditDeptType(e.target.value)}
                        className="form-select"
                      >
                        <option value="PROGRAM_OFFERING">🎓 Degree-Granting (Offers Majors)</option>
                        <option value="SUPPORTING">🤝 Supporting / Allied / Languages</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Academic Description / Mission</label>
                    <textarea
                      rows={2}
                      placeholder="Brief summary of department's academic focus..."
                      value={editDeptDesc}
                      onChange={(e) => setEditDeptDesc(e.target.value)}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">HoD / Faculty In-Charge Email</label>
                    <input
                      type="email"
                      placeholder="hod.dept@college.edu"
                      value={editDeptHod}
                      onChange={(e) => setEditDeptHod(e.target.value)}
                      className="form-input"
                    />
                  </div>

                  <div className="modal-actions">
                    <button type="button" onClick={() => setShowEditDeptModal(false)} className="btn-cancel">
                      Cancel
                    </button>
                    <button type="submit" disabled={editDeptSubmitting} className="btn-primary-action">
                      {editDeptSubmitting ? 'Saving Changes...' : 'Save Department Changes'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Edit Program Modal */}
          {showEditProgModal && editingProg && (
            <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowEditProgModal(false); }}>
              <div className="modal-card">
                <div className="modal-header">
                  <div className="modal-title-row">
                    <FileEdit size={20} className="text-purple" />
                    <h3>Edit Degree Program ({editingProg.code})</h3>
                  </div>
                  <button type="button" onClick={() => setShowEditProgModal(false)} className="btn-close-modal">✕</button>
                </div>

                <form onSubmit={handleUpdateProgSubmit} className="admin-form">
                  <div className="form-group">
                    <label className="form-label">Program Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. B.Sc Botany or M.Sc Botany"
                      value={editProgName}
                      onChange={(e) => setEditProgName(e.target.value)}
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
                        value={editProgCode}
                        onChange={(e) => setEditProgCode(e.target.value)}
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Degree Level *</label>
                      <select
                        value={editProgLevel}
                        onChange={(e) => setEditProgLevel(e.target.value)}
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
                        value={editProgDuration}
                        onChange={(e) => setEditProgDuration(e.target.value)}
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Total Semesters</label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={editProgSems}
                        onChange={(e) => setEditProgSems(e.target.value)}
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Intake Capacity (Seats)</label>
                      <input
                        type="number"
                        min="1"
                        max="500"
                        value={editProgIntake}
                        onChange={(e) => setEditProgIntake(e.target.value)}
                        className="form-input"
                      />
                    </div>
                  </div>

                  <div className="modal-actions">
                    <button type="button" onClick={() => setShowEditProgModal(false)} className="btn-cancel">
                      Cancel
                    </button>
                    <button type="submit" disabled={editProgSubmitting} className="btn-primary-action">
                      {editProgSubmitting ? 'Saving Changes...' : 'Save Program Changes'}
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

      {/* TAB 0.5: PROGRAM SEAT MATRIX & PRE-ADMISSION SPLIT-UP */}
      {/* ------------------------------------------------------------- */}
      {activeAdminTab === 'seat_matrix' && (
        <div className="tab-section-content">
          <div className="dept-header-card">
            <div className="dept-header-info">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <SlidersHorizontal size={22} className="text-emerald" />
                <h2 className="dept-title" style={{ margin: 0 }}>Academic Degree Programs & Seat Split-Up Matrix</h2>
              </div>
              <p className="dept-desc">
                Pre-admission seat matrix governance across all <strong>15 statutory reservation categories</strong> (<code>OPEN</code>, <code>ETB</code>, <code>MU</code>, <code>LC</code>, <code>EWS</code>, <code>OBH</code>, <code>SC</code>, <code>ST</code>, <code>TLM</code>, <code>SP</code>, <code>SSQ</code>, <code>PWD</code>, <code>UTL</code>, <code>OBX</code>, <code>JR</code>). Balance and lock quotas before admission allotments.
              </p>
            </div>
            <button
              onClick={() => {
                if (departmentsList.length > 0) {
                  setTargetDeptForProg(departmentsList[0]);
                  setShowAddProgModal(true);
                }
              }}
              className="btn-add-dept"
            >
              <PlusCircle size={16} /> Add Degree Program
            </button>
          </div>

          {/* Quick Filter Bar */}
          <div className="dept-filter-bar" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                onClick={() => setProgLevelFilter('ALL')}
                className={`dept-filter-pill ${progLevelFilter === 'ALL' ? 'active' : ''}`}
              >
                All Degrees ({allPrograms.length})
              </button>
              <button
                onClick={() => setProgLevelFilter('UG')}
                className={`dept-filter-pill ${progLevelFilter === 'UG' ? 'active' : ''}`}
              >
                Undergraduate (UG)
              </button>
              <button
                onClick={() => setProgLevelFilter('PG')}
                className={`dept-filter-pill ${progLevelFilter === 'PG' ? 'active' : ''}`}
              >
                Postgraduate (PG)
              </button>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <select
                value={progDeptFilter}
                onChange={(e) => setProgDeptFilter(e.target.value)}
                className="form-select"
                style={{ width: '220px', padding: '6px 10px', fontSize: '0.82rem' }}
              >
                <option value="ALL">All Departments</option>
                {departmentsList.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Search program or code..."
                value={progSearchTerm}
                onChange={(e) => setProgSearchTerm(e.target.value)}
                className="form-input"
                style={{ width: '200px', padding: '6px 12px', fontSize: '0.82rem' }}
              />
            </div>
          </div>

          {/* Program Cards Grid */}
          {allPrograms.length === 0 ? (
            <div className="empty-state-box">
              <Building size={36} style={{ color: '#64748b' }} />
              <p>No academic degree programs registered in catalog.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '20px', marginTop: '16px' }}>
              {allPrograms
                .filter(p => progLevelFilter === 'ALL' || p.level === progLevelFilter)
                .filter(p => progDeptFilter === 'ALL' || p.department_id === progDeptFilter)
                .filter(p => !progSearchTerm || p.name.toLowerCase().includes(progSearchTerm.toLowerCase()) || p.code.toLowerCase().includes(progSearchTerm.toLowerCase()))
                .map(prog => {
                  const matrix = prog.seat_matrix || {};
                  const totalAllotted = Object.values(matrix).reduce((acc, v) => acc + (parseInt(v, 10) || 0), 0);
                  const intake = parseInt(prog.intake_capacity, 10) || 0;
                  const isBalanced = totalAllotted === intake && intake > 0;
                  const isOver = totalAllotted > intake;
                  const isZero = totalAllotted === 0;

                  return (
                    <div key={prog.id} className="program-seat-card" style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '14px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                            <span className="prog-level-tag">{prog.level}</span>
                            <span className="dept-code-tag">{prog.code}</span>
                            <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{prog.department_name}</span>
                          </div>
                          <h3 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', color: '#f8fafc', fontWeight: 700 }}>
                            {prog.name}
                          </h3>
                          <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                            {prog.duration_years} Years ({prog.total_semesters} Semesters)
                            {prog.level === 'UG' && <span className="fyugp-exit-badge" style={{ marginLeft: '8px' }}>⚡ FYUGP</span>}
                          </div>
                        </div>
                      </div>

                      {/* Sanctioned Intake vs Allotted Meter */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: 'rgba(2, 6, 23, 0.6)', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                        <div>
                          <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block', fontWeight: 600, textTransform: 'uppercase' }}>Sanctioned Capacity</span>
                          <strong style={{ fontSize: '1.25rem', color: '#ffffff' }}>{intake} Seats</strong>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block', fontWeight: 600, textTransform: 'uppercase' }}>Allotted Matrix</span>
                          {isBalanced ? (
                            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#34d399', background: 'rgba(16, 185, 129, 0.15)', padding: '4px 9px', borderRadius: '6px', border: '1px solid rgba(16, 185, 129, 0.3)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <CheckCircle2 size={13} /> Balanced ({totalAllotted}/{intake})
                            </span>
                          ) : isOver ? (
                            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f87171', background: 'rgba(239, 68, 68, 0.15)', padding: '4px 9px', borderRadius: '6px', border: '1px solid rgba(239, 68, 68, 0.3)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <AlertCircle size={13} /> Over (+{totalAllotted - intake})
                            </span>
                          ) : isZero ? (
                            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#94a3b8', background: 'rgba(148, 163, 184, 0.1)', padding: '4px 9px', borderRadius: '6px' }}>
                              Unconfigured
                            </span>
                          ) : (
                            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fbbf24', background: 'rgba(245, 158, 11, 0.15)', padding: '4px 9px', borderRadius: '6px', border: '1px solid rgba(245, 158, 11, 0.3)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <AlertTriangle size={13} /> {intake - totalAllotted} Seats Left
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Quota Chips Preview */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                        {['OPEN', 'ETB', 'MU', 'LC', 'EWS', 'OBH', 'SC', 'ST', 'TLM', 'SP', 'SSQ', 'PWD', 'UTL', 'OBX', 'JR'].map(code => {
                          const seats = matrix[code] || 0;
                          const isOpen = code === 'OPEN';
                          return (
                            <span
                              key={code}
                              title={`${code}: ${seats} Seats`}
                              style={{
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                padding: '2px 6px',
                                borderRadius: '5px',
                                background: isOpen ? 'rgba(16, 185, 129, 0.2)' : seats > 0 ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                                color: isOpen ? '#34d399' : seats > 0 ? '#c7d2fe' : '#64748b',
                                border: '1px solid ' + (isOpen ? 'rgba(16, 185, 129, 0.35)' : seats > 0 ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255, 255, 255, 0.05)'),
                              }}
                            >
                              {code}: {seats}
                            </span>
                          );
                        })}
                      </div>

                      {/* Primary Configure Button */}
                      <button
                        type="button"
                        onClick={() => setSelectedProgForSeatMatrix(prog)}
                        className="btn-primary-action"
                        style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                      >
                        <SlidersHorizontal size={15} />
                        Configure / Edit Seat Split-Up
                      </button>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* TAB 0.6: ADMISSIONS MULTI-STEP VERIFICATION DESK */}
      {/* ------------------------------------------------------------- */}
      {activeAdminTab === 'admissions_desk' && (
        <div className="tab-section-content admissions-desk-container">
          <div className="admissions-header-banner">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={22} className="text-sky" />
                <h2 className="admissions-header-title">Student Admissions Multi-Step Verification Desk</h2>
              </div>
              <p className="admissions-header-desc">
                Four-stage institutional verification ladder: <strong>Stage 1</strong> Department Level Verification &bull; <strong>Stage 2</strong> Central Nodal Desk (CAP Memo) &bull; <strong>Stage 3</strong> PTA Remittance Verification &bull; <strong>Stage 4</strong> Principal's Office Approval & Permanent Admission Number Allotment &bull; <strong>Stage 5</strong> Transfer Certificate (TC) & Alumni Transition.
              </p>
            </div>
          </div>

          {/* Sub-Stage Filter Tabs */}
          <div className="admissions-subtabs-bar">
            {[
              { id: 'ALL', label: 'All Dossiers', count: admissionsDossiers.length },
              { id: 'DEPT_LEVEL', label: 'Stage 1: Dept Level', count: admissionsDossiers.filter(d => d.verification_stage === 'DEPT_LEVEL').length },
              { id: 'NODAL_DESK', label: 'Stage 2: Nodal Desk', count: admissionsDossiers.filter(d => d.verification_stage === 'NODAL_DESK').length },
              { id: 'PTA_DESK', label: 'Stage 3: PTA Remittance', count: admissionsDossiers.filter(d => d.verification_stage === 'PTA_DESK').length },
              { id: 'PRINCIPAL_DESK', label: 'Stage 4: Principal Desk', count: admissionsDossiers.filter(d => d.verification_stage === 'PRINCIPAL_DESK').length },
              { id: 'COMPLETED', label: 'Admitted (Active)', count: admissionsDossiers.filter(d => d.verification_stage === 'COMPLETED').length },
              { id: 'TC_ISSUED', label: 'TC Issued (Alumni)', count: admissionsDossiers.filter(d => d.verification_stage === 'TC_ISSUED').length },
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveDossierStage(tab.id)}
                className={`admissions-subtab-btn ${activeDossierStage === tab.id ? 'active' : ''}`}
              >
                <span>{tab.label}</span>
                <span className="admissions-subtab-badge">{tab.count}</span>
              </button>
            ))}
          </div>

          {/* Dossiers Grid */}
          {admissionsDossiers.length === 0 ? (
            <div className="empty-state-box">
              <CheckCircle2 size={36} style={{ color: '#64748b' }} />
              <p>No student admission dossiers found matching the selected filter.</p>
            </div>
          ) : (
            <div className="dossiers-grid">
              {admissionsDossiers
                .filter(d => activeDossierStage === 'ALL' || d.verification_stage === activeDossierStage)
                .map(cand => {
                  const stage = cand.verification_stage || 'DEPT_LEVEL';
                  const isDept = stage === 'DEPT_LEVEL';
                  const isNodal = stage === 'NODAL_DESK';
                  const isPta = stage === 'PTA_DESK';
                  const isPrincipal = stage === 'PRINCIPAL_DESK';
                  const isAdmitted = stage === 'COMPLETED';
                  const isTc = stage === 'TC_ISSUED';

                  return (
                    <div key={cand.id || cand.user_email} className="dossier-card">
                      <div className="dossier-top-row">
                        <div>
                          <h4 className="dossier-name">{cand.full_name}</h4>
                          <span className="dossier-cap">{cand.cap_id || 'Direct Onboarding'} &bull; {cand.user_email}</span>
                        </div>
                        <span className={`stage-badge ${isDept ? 'dept' : isNodal ? 'nodal' : isPta ? 'pta' : isPrincipal ? 'principal' : isTc ? 'tc' : 'admitted'}`}>
                          {isDept ? 'Stage 1: Dept Level' : isNodal ? 'Stage 2: Nodal Desk' : isPta ? 'Stage 3: PTA Fee' : isPrincipal ? 'Stage 4: Principal' : isTc ? 'TC Issued (Alumni)' : 'Admitted Active'}
                        </span>
                      </div>

                      <div className="dossier-meta-grid">
                        <div>
                          <span className="meta-field-label">Degree Program</span>
                          <span className="meta-field-val">{cand.program_name || cand.program_id}</span>
                        </div>
                        <div>
                          <span className="meta-field-label">Quota Allotted</span>
                          <span className="meta-field-val">{cand.admission_quota || 'Merit'}</span>
                        </div>
                        <div>
                          <span className="meta-field-label">Category / Caste</span>
                          <span className="meta-field-val">{cand.community_category} &bull; {cand.caste_name || '-'}</span>
                        </div>
                        <div>
                          <span className="meta-field-label">Plus Two / Qual %</span>
                          <span className="meta-field-val">{cand.qualifying_percentage ? `${cand.qualifying_percentage}%` : '-'}</span>
                        </div>
                        <div>
                          <span className="meta-field-label">Family / Poverty</span>
                          <span className="meta-field-val">{cand.family_status || 'APL'} (₹{cand.annual_income || 0})</span>
                        </div>
                        <div>
                          <span className="meta-field-label">Mobile Contact</span>
                          <span className="meta-field-val">{cand.mobile_number}</span>
                        </div>
                      </div>

                      {/* Verification Audit Log */}
                      <div style={{ fontSize: '0.75rem', background: 'rgba(255, 255, 255, 0.03)', padding: '8px 10px', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                        {cand.dept_verified_by && <div style={{ color: '#34d399' }}>✓ Dept: {cand.dept_verified_by} ({cand.dept_notes || 'Approved'})</div>}
                        {cand.nodal_verified_by && <div style={{ color: '#38bdf8' }}>✓ Nodal: {cand.nodal_verified_by} ({cand.nodal_notes || 'Memo Checked'})</div>}
                        {cand.pta_verified_by && <div style={{ color: '#c084fc' }}>✓ PTA: Receipt #{cand.pta_receipt_no} (₹{cand.pta_amount})</div>}
                        {cand.official_admission_no && <div style={{ color: '#fbbf24', fontWeight: 700 }}>★ Permanent Admission No: {cand.official_admission_no}</div>}
                        {cand.tc_serial_no && <div style={{ color: '#f87171', fontWeight: 700 }}>✕ TC Issued: #{cand.tc_serial_no} ({cand.tc_reason})</div>}
                      </div>

                      {/* Stage Specific Action Form */}
                      <div className="dossier-actions">
                        {isDept && (
                          <button
                            type="button"
                            disabled={processingDossierEmail === cand.user_email}
                            onClick={() => handleProcessVerificationStep(cand.user_email, 1, 'APPROVE')}
                            className="btn-primary-action"
                            style={{ width: '100%' }}
                          >
                            <CheckCircle2 size={15} /> Verify & Send to Nodal Desk
                          </button>
                        )}

                        {isNodal && (
                          <button
                            type="button"
                            disabled={processingDossierEmail === cand.user_email}
                            onClick={() => handleProcessVerificationStep(cand.user_email, 2, 'APPROVE')}
                            className="btn-primary-action"
                            style={{ width: '100%' }}
                          >
                            <CheckCircle2 size={15} /> Sign Off Nodal Audit & Forward to PTA
                          </button>
                        )}

                        {isPta && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <input
                                type="text"
                                placeholder="PTA Receipt No (e.g. PTA-2026-091)"
                                defaultValue={`PTA-2026-${Math.floor(100 + Math.random() * 900)}`}
                                onChange={(e) => setPtaReceiptNo(e.target.value)}
                                className="form-input"
                                style={{ flex: 1, fontSize: '0.8rem', padding: '6px' }}
                              />
                              <input
                                type="number"
                                placeholder="Amount"
                                defaultValue="1850"
                                onChange={(e) => setPtaAmount(e.target.value)}
                                className="form-input"
                                style={{ width: '90px', fontSize: '0.8rem', padding: '6px' }}
                              />
                            </div>
                            <button
                              type="button"
                              disabled={processingDossierEmail === cand.user_email}
                              onClick={() => handleProcessVerificationStep(cand.user_email, 3, 'APPROVE')}
                              className="btn-primary-action"
                              style={{ width: '100%' }}
                            >
                              <CheckCircle2 size={15} /> Confirm PTA Remittance & Forward to Principal
                            </button>
                          </div>
                        )}

                        {isPrincipal && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                            <input
                              type="text"
                              placeholder="Official Admission No (e.g. ADM-2026-BOT-042)"
                              defaultValue={`ADM-2026-${cand.program_code || 'PRG'}-${Math.floor(100 + Math.random() * 900)}`}
                              onChange={(e) => setOfficialAdmissionNo(e.target.value)}
                              className="form-input"
                              style={{ fontSize: '0.8rem', padding: '6px' }}
                            />
                            <button
                              type="button"
                              disabled={processingDossierEmail === cand.user_email}
                              onClick={() => handleProcessVerificationStep(cand.user_email, 4, 'APPROVE')}
                              className="btn-primary-action"
                              style={{ width: '100%', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
                            >
                              <Award size={15} /> Approve & Grant Official Admission Number
                            </button>
                          </div>
                        )}

                        {isAdmitted && (
                          <button
                            type="button"
                            onClick={() => {
                              setTcTargetCandidate(cand);
                              setTcSerialNo(`TC/${new Date().getFullYear()}/${Math.floor(100 + Math.random() * 900)}`);
                              setShowTcModal(true);
                            }}
                            className="btn-cancel"
                            style={{ width: '100%', color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.4)' }}
                          >
                            <FileText size={15} /> Principal Office: Issue TC & Relieve Student
                          </button>
                        )}

                        {isTc && (
                          <span style={{ fontSize: '0.8rem', color: '#94a3b8', textAlign: 'center', width: '100%' }}>
                            Student relieved. Active Alumni access.
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
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
                    <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>Validity Cut-off Date *</span>
                      <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Can extend later</span>
                    </label>

                    <div className="validity-mode-toggle">
                      <button
                        type="button"
                        onClick={() => setTokenValidityMode('date')}
                        className={`validity-mode-btn ${tokenValidityMode === 'date' ? 'active' : ''}`}
                      >
                        <Calendar size={13} /> Fixed Cut-off Date
                      </button>
                      <button
                        type="button"
                        onClick={() => setTokenValidityMode('preset')}
                        className={`validity-mode-btn ${tokenValidityMode === 'preset' ? 'active' : ''}`}
                      >
                        <Clock size={13} /> Preset Duration
                      </button>
                    </div>

                    {tokenValidityMode === 'date' ? (
                      <div className="form-row" style={{ marginTop: '0.35rem' }}>
                        <div className="form-group" style={{ flex: 2, marginBottom: 0 }}>
                          <input
                            type="date"
                            required
                            min={new Date().toISOString().split('T')[0]}
                            value={tokenExpiryDate}
                            onChange={(e) => setTokenExpiryDate(e.target.value)}
                            className="form-input"
                          />
                        </div>
                        <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                          <input
                            type="time"
                            value={tokenExpiryTime}
                            onChange={(e) => setTokenExpiryTime(e.target.value)}
                            className="form-input"
                          />
                        </div>
                      </div>
                    ) : (
                      <select
                        value={tokenExpiresHours}
                        onChange={(e) => setTokenExpiresHours(e.target.value)}
                        className="form-select"
                      >
                        <option value="2">2 Hours (On-Spot Event)</option>
                        <option value="24">24 Hours (1 Day)</option>
                        <option value="72">72 Hours (3 Days)</option>
                        <option value="168">7 Days (1 Week)</option>
                        <option value="360">15 Days (Fortnight)</option>
                        <option value="720">30 Days (Full Month)</option>
                        <option value="1440">60 Days (2 Months)</option>
                        <option value="2160">90 Days (Full Quarter)</option>
                      </select>
                    )}
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
                              <span className="stat-label">Valid Until:</span>
                              <span className="stat-val" style={{ color: isExpired ? '#f87171' : 'inherit' }}>
                                {new Date(t.expires_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </span>
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

                            <div className="token-actions-row">
                              <button
                                type="button"
                                onClick={() => handleOpenExtendModal(t)}
                                className="btn-extend-validity"
                                title="Extend URL validity cut-off date"
                              >
                                <CalendarPlus size={14} />
                                <span>Extend Validity</span>
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
              <div className="join-requests-list-container">
                {joinRequests.map((req) => {
                  const isExpanded = expandedRequestId === req.id;
                  const deptObj = DEPARTMENTS_CATALOG.find((d) => d.id === req.department_id);
                  const deptName = deptObj?.name || req.department_id;
                  const noteForReq = joinReviewNotes[req.id] || '';
                  const isSubmitting = reviewSubmittingId === req.id;

                  return (
                    <div
                      key={req.id}
                      className={`join-request-list-card ${isExpanded ? 'expanded' : ''}`}
                    >
                      {/* Collapsed / Main List Row */}
                      <div
                        onClick={() => setExpandedRequestId(isExpanded ? null : req.id)}
                        className="join-request-row-summary"
                        title="Click to view full candidate details"
                      >
                        <div className="req-summary-left">
                          <span className="req-chevron">
                            {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                          </span>

                          <div className="applicant-avatar-circle">
                            {req.applicant_avatar ? (
                              <img src={req.applicant_avatar} alt={req.applicant_name} />
                            ) : (
                              (req.applicant_name || 'U')[0].toUpperCase()
                            )}
                          </div>

                          <div className="req-primary-info">
                            <span className="req-applicant-name">
                              {req.applicant_name}
                            </span>
                            <span className="req-applicant-email">{req.applicant_email}</span>
                          </div>

                          <div className="req-chips-cluster">
                            <span className="chip-tag dept">{deptName}</span>
                            <span className="badge role">{req.requested_role}</span>
                            {req.admission_or_emp_no && (
                              <span className="chip-tag ref">Ref: {req.admission_or_emp_no}</span>
                            )}
                            {req.mobile_number && (
                              <span className="chip-tag phone">📞 {req.mobile_number}</span>
                            )}
                            <span className="chip-tag time">
                              {new Date(req.created_at).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        </div>

                        {/* Direct in-row Approve & Reject buttons */}
                        <div className="req-summary-right" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            disabled={isSubmitting}
                            onClick={() => handleReviewJoin(req.id, 'APPROVE', noteForReq)}
                            className="btn-row-approve"
                            title="Approve & Unlock Onboarding directly from row"
                          >
                            {isSubmitting ? <RefreshCw size={14} className="spin" /> : <CheckCircle size={14} />}
                            <span>Approve</span>
                          </button>
                          <button
                            type="button"
                            disabled={isSubmitting}
                            onClick={() => handleReviewJoin(req.id, 'REJECT', noteForReq)}
                            className="btn-row-reject"
                            title="Reject Join Request directly from row"
                          >
                            <XCircle size={14} />
                            <span>Reject</span>
                          </button>
                        </div>
                      </div>

                      {/* Expanded Student Detail Drawer */}
                      {isExpanded && (
                        <div className="student-detail-drawer">
                          <div className="student-detail-header">
                            <div className="detail-header-left">
                              <div className="applicant-avatar-circle large">
                                {req.applicant_avatar ? (
                                  <img src={req.applicant_avatar} alt={req.applicant_name} />
                                ) : (
                                  (req.applicant_name || 'U')[0].toUpperCase()
                                )}
                              </div>
                              <div>
                                <div className="detail-student-title">
                                  <h4>{req.applicant_name}</h4>
                                  <span className="status-pill pending">Pending Superior Verification</span>
                                </div>
                                <p className="detail-student-subtitle">
                                  Authenticated Google Account: <strong>{req.applicant_email}</strong> &bull; Submitted on {new Date(req.created_at).toLocaleString()}
                                </p>
                              </div>
                            </div>

                            <div className="detail-header-right">
                              <span className="ask-once-badge">
                                🛡️ Maker-Checker Stage 1 of 2
                              </span>
                            </div>
                          </div>

                          <div className="student-detail-grid">
                            <div className="student-info-block">
                              <span className="block-label">Assigned Department</span>
                              <div className="block-value strong">{deptName} ({deptObj?.code || req.department_id})</div>
                            </div>
                            <div className="student-info-block">
                              <span className="block-label">Target Role</span>
                              <div className="block-value role-highlight">{req.requested_role}</div>
                            </div>
                            <div className="student-info-block">
                              <span className="block-label">Admission / Reference No</span>
                              <div className="block-value mono">{req.admission_or_emp_no || 'Not provided'}</div>
                            </div>
                            <div className="student-info-block">
                              <span className="block-label">Contact Mobile Number</span>
                              <div className="block-value">{req.mobile_number || 'Not provided'}</div>
                            </div>
                            <div className="student-info-block">
                              <span className="block-label">Designated Batch / Scope</span>
                              <div className="block-value">{req.batch_id || 'Institutional Baseline Batch'}</div>
                            </div>
                            <div className="student-info-block">
                              <span className="block-label">Enrollment Token Source</span>
                              <div className="block-value mono">{req.token_id ? `#${req.token_id}` : 'Dynamic QR Link / Self-Enrollment'}</div>
                            </div>
                          </div>

                          <div className="student-audit-guideline">
                            <div className="guideline-icon">ℹ️</div>
                            <div className="guideline-text">
                              <strong>Superior Verification Directive ("Ask Once" Architecture):</strong> Cross-verify this applicant against the official admission list or appointment rolls. Approving this request activates their institutional credentials and unlocks the comprehensive master onboarding wizard.
                            </div>
                          </div>

                          <div className="student-detail-footer">
                            <div className="superior-notes-input-wrap">
                              <label className="notes-label">Superior Remarks / Admission Verification Memo (Optional):</label>
                              <input
                                type="text"
                                value={noteForReq}
                                onChange={(e) => setJoinReviewNotes({ ...joinReviewNotes, [req.id]: e.target.value })}
                                placeholder="e.g. Verified against University Allotment memo #742"
                                className="form-input superior-notes-input"
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>

                            <div className="footer-action-buttons">
                              <button
                                type="button"
                                disabled={isSubmitting}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleReviewJoin(req.id, 'APPROVE', noteForReq);
                                }}
                                className="btn-approve"
                              >
                                {isSubmitting ? <RefreshCw size={15} className="spin" /> : <CheckCircle size={15} />}
                                <span>Approve & Unlock Onboarding</span>
                              </button>
                              <button
                                type="button"
                                disabled={isSubmitting}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleReviewJoin(req.id, 'REJECT', noteForReq);
                                }}
                                className="btn-reject"
                              >
                                <XCircle size={15} />
                                <span>Reject Candidate</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
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
      {/* TAB 4: ROLES & PRIVILEGES GOVERNANCE */}
      {/* ------------------------------------------------------------- */}
      {activeAdminTab === 'roles' && (
        <div className="tab-section-content">
          <div className="admin-card">
            {/* Header & Controls */}
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Key size={22} className="text-indigo" />
                  <h3 className="card-title" style={{ margin: 0 }}>Roles & Granular Privileges Governance</h3>
                </div>
                <p className="card-desc" style={{ margin: '4px 0 0 0' }}>
                  Assign or strip operational roles, manage custom permission grants, and audit institutional authority across all users.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setShowMatrixModal(true)}
                  className="btn-secondary-action"
                  title="View standard institutional permission matrix"
                >
                  <Sliders size={16} /> Privilege Catalog Matrix
                </button>
                <button
                  onClick={() => {
                    setAssignTargetUser(null);
                    setAssignRoleEmail('');
                    setAssignRoleName('');
                    setAssignRoleDept('');
                    setAssignRoleCode('FACULTY');
                    setShowAssignRoleModal(true);
                  }}
                  className="btn-primary-action"
                  style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' }}
                >
                  <UserPlus size={16} /> Assign Role / Add User
                </button>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="role-metrics-grid">
              <div className="role-metric-item">
                <span className="metric-val">{usersList.length}</span>
                <span className="metric-lbl">Total Registered Users</span>
              </div>
              <div className="role-metric-item">
                <span className="metric-val">
                  {usersList.reduce((acc, u) => acc + (u.roles?.length || 0), 0)}
                </span>
                <span className="metric-lbl">Active Role Bindings</span>
              </div>
              <div className="role-metric-item">
                <span className="metric-val text-sky">
                  {usersList.filter((u) => u.roles?.some((r) => r.code === 'FACULTY' || r.code === 'HOD')).length}
                </span>
                <span className="metric-lbl">Faculty & HoDs</span>
              </div>
              <div className="role-metric-item">
                <span className="metric-val text-emerald">
                  {usersList.filter((u) => u.roles?.some((r) => r.code === 'STUDENT') || u.primary_type === 'STUDENT').length}
                </span>
                <span className="metric-lbl">Enrolled Students</span>
              </div>
              <div className="role-metric-item">
                <span className="metric-val text-amber">
                  {usersList.filter((u) => u.roles?.some((r) => r.code === 'ADMIN' || r.code === 'PRINCIPAL')).length}
                </span>
                <span className="metric-lbl">Administrators & Principals</span>
              </div>
            </div>

            {/* Search and Filtering Bar */}
            <div className="role-filter-bar">
              <div className="role-search-box">
                <Search size={16} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search user by name, email, department, or role code..."
                  value={userSearchTerm}
                  onChange={(e) => setUserSearchTerm(e.target.value)}
                  className="role-search-input"
                />
                {userSearchTerm && (
                  <button onClick={() => setUserSearchTerm('')} className="search-clear-btn">&times;</button>
                )}
              </div>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <select
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                  className="role-filter-select"
                >
                  <option value="ALL">All Roles ({MASTER_ROLES.length})</option>
                  {MASTER_ROLES.map((r) => (
                    <option key={r.code} value={r.code}>
                      {r.name} ({r.code})
                    </option>
                  ))}
                </select>

                <select
                  value={userDeptFilter}
                  onChange={(e) => setUserDeptFilter(e.target.value)}
                  className="role-filter-select"
                >
                  <option value="ALL">All Departments</option>
                  {departmentsList.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Users Table */}
            <div className="users-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>User & Identity</th>
                    <th>Account Type</th>
                    <th>Department & Designation</th>
                    <th>Assigned Roles & Stripping</th>
                    <th>Granular Privileges</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                        No user accounts match the current filters.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => {
                      const effectivePrivs = u.effective_privileges || [];
                      const hasOverrides = (u.granted_privileges?.length > 0) || (u.revoked_privileges?.length > 0);
                      return (
                        <tr key={u.id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div className="user-avatar-small">
                                {u.avatar_url ? (
                                  <img src={u.avatar_url} alt="" className="avatar-img-sm" />
                                ) : (
                                  <span>{(u.name || u.email || 'U')[0].toUpperCase()}</span>
                                )}
                              </div>
                              <div>
                                <strong>{u.name || 'Unnamed User'}</strong>
                                <div className="table-sub">{u.email}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="badge badge-primary-type">{u.primary_type || 'STUDENT'}</span>
                          </td>
                          <td>
                            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0' }}>
                              {u.department ? (departmentsList.find((d) => d.id === u.department)?.name || u.department) : 'Campus General'}
                            </div>
                            <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                              {u.designation || 'No designation entered'}
                            </div>
                          </td>
                          <td>
                            <div className="roles-pill-wrap">
                              {u.roles?.map((r, i) => (
                                <span key={i} className="role-pill-interactive">
                                  <span>{r.code}</span>
                                  {r.scope_entity_id && (
                                    <span className="scope-tag">({r.scope_entity_id})</span>
                                  )}
                                  <button
                                    onClick={() => handleStripRole(u.email, r.code, r.scope_entity_id)}
                                    className="btn-strip-role"
                                    title={`Strip ${r.code} role from ${u.name || u.email}`}
                                  >
                                    &times;
                                  </button>
                                </span>
                              ))}
                              <button
                                onClick={() => openAssignRoleForUser(u)}
                                className="btn-add-role-chip"
                                title="Assign another role to this user"
                              >
                                + Role
                              </button>
                            </div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span className="privilege-count-badge">
                                  {effectivePrivs.length} Active
                                </span>
                                {hasOverrides && (
                                  <span className="privilege-override-tag">
                                    Override
                                  </span>
                                )}
                              </div>
                              <button
                                onClick={() => handleOpenPrivilegesModal(u)}
                                className="btn-manage-privs"
                              >
                                <Key size={12} /> Manage Privileges
                              </button>
                            </div>
                          </td>
                          <td>
                            <span className={`status-dot ${u.status === 'ACTIVE' ? 'active' : ''}`}>
                              {u.status || 'ACTIVE'}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
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

      {/* Principal Office TC Issuance Modal */}
      {showTcModal && tcTargetCandidate && (
        <div className="modal-overlay" onClick={() => setShowTcModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <div className="modal-title-row">
                <FileText size={22} className="text-red" />
                <div>
                  <h3 style={{ margin: 0 }}>Office of the Principal • Issue Transfer Certificate</h3>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#94a3b8' }}>
                    {tcTargetCandidate.full_name} ({tcTargetCandidate.official_admission_no || tcTargetCandidate.user_email})
                  </p>
                </div>
              </div>
              <button onClick={() => setShowTcModal(false)} className="btn-close-modal">&times;</button>
            </div>

            <form onSubmit={handleIssueTcSubmit} className="admin-form">
              <div className="form-group">
                <label className="form-label">Statutory TC Serial Number *</label>
                <input
                  type="text"
                  required
                  value={tcSerialNo}
                  onChange={(e) => setTcSerialNo(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Reason for Leaving College *</label>
                <select
                  value={tcReason}
                  onChange={(e) => setTcReason(e.target.value)}
                  className="form-select"
                >
                  <option value="Course Completed / Graduated">Course Completed / Graduated</option>
                  <option value="Higher Studies in Another Institution">Higher Studies in Another Institution</option>
                  <option value="Inter-Collegiate Transfer">Inter-Collegiate Transfer</option>
                  <option value="Relieved upon Personal Request">Relieved upon Personal Request</option>
                  <option value="Discontinued Studies">Discontinued Studies</option>
                </select>
              </div>

              <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.08)', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)', fontSize: '0.8rem', color: '#fca5a5' }}>
                <strong>Notice:</strong> Once issued by the Principal's Office, the student's operational privileges (internal mark entry, daily attendance, union voting) are locked. The candidate retains permanent read-only alumni transcript access and can update their alumni activity profile.
              </div>

              <div className="modal-actions" style={{ marginTop: '16px' }}>
                <button type="button" onClick={() => setShowTcModal(false)} className="btn-cancel">
                  Cancel
                </button>
                <button type="submit" className="btn-primary-action" style={{ background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)' }}>
                  <FileText size={16} /> Confirm & Issue TC
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Role / Add User Modal */}
      {showAssignRoleModal && (
        <div className="modal-overlay" onClick={() => setShowAssignRoleModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px' }}>
            <div className="modal-header">
              <div className="modal-title-row">
                <UserPlus size={22} className="text-indigo" />
                <div>
                  <h3 style={{ margin: 0 }}>
                    {assignTargetUser ? `Assign Additional Role • ${assignTargetUser.name || assignTargetUser.email}` : 'Assign Institutional Role / Add User'}
                  </h3>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#94a3b8' }}>
                    Bind statutory operational roles, departmental authority, or batch scopes.
                  </p>
                </div>
              </div>
              <button onClick={() => setShowAssignRoleModal(false)} className="btn-close-modal">&times;</button>
            </div>

            <form onSubmit={handleAssignRoleSubmit} className="admin-form">
              <div className="form-group">
                <label className="form-label">User Email Address *</label>
                <input
                  type="email"
                  required
                  value={assignRoleEmail}
                  onChange={(e) => setAssignRoleEmail(e.target.value)}
                  disabled={!!assignTargetUser}
                  placeholder="user@college.edu or gmail"
                  className="form-input"
                />
              </div>

              {!assignTargetUser && (
                <div className="form-group">
                  <label className="form-label">User Full Name (Optional)</label>
                  <input
                    type="text"
                    value={assignRoleName}
                    onChange={(e) => setAssignRoleName(e.target.value)}
                    placeholder="e.g. Dr. Rajesh Sharma"
                    className="form-input"
                  />
                </div>
              )}

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Role to Assign *</label>
                  <select
                    value={assignRoleCode}
                    onChange={(e) => setAssignRoleCode(e.target.value)}
                    className="form-select"
                  >
                    {MASTER_ROLES.map((r) => (
                      <option key={r.code} value={r.code}>
                        {r.name} ({r.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Department Scope (Optional)</label>
                  <select
                    value={assignRoleDept}
                    onChange={(e) => setAssignRoleDept(e.target.value)}
                    className="form-select"
                  >
                    <option value="">Campus-Wide / All Departments</option>
                    {departmentsList.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Scope Entity ID / Specific Context (Optional)</label>
                <input
                  type="text"
                  value={assignRoleScopeId}
                  onChange={(e) => setAssignRoleScopeId(e.target.value)}
                  placeholder="e.g. batch_bsc_cs_2024 or Sec-A or Hostel-Block-1"
                  className="form-input"
                />
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px', display: 'block' }}>
                  Specify a batch ID for Class Tutors, hostel block for Wardens, or leave blank for department/college-wide authority.
                </span>
              </div>

              <div className="modal-actions" style={{ marginTop: '16px' }}>
                <button type="button" onClick={() => setShowAssignRoleModal(false)} className="btn-cancel">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={assignSubmitting}
                  className="btn-primary-action"
                  style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' }}
                >
                  {assignSubmitting ? <RefreshCw size={16} className="spin" /> : <CheckCircle2 size={16} />}
                  Confirm Role Binding
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Granular Privilege Manager Modal */}
      {showPrivilegesModal && privilegeTargetUser && (
        <div className="modal-overlay" onClick={() => setShowPrivilegesModal(false)}>
          <div className="modal-card modal-card-lg" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '840px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            <div className="modal-header">
              <div className="modal-title-row">
                <Key size={22} className="text-amber" />
                <div>
                  <h3 style={{ margin: 0 }}>
                    Manage Privileges • {privilegeTargetUser.name || 'User'} ({privilegeTargetUser.email})
                  </h3>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px', flexWrap: 'wrap' }}>
                    <span className="badge badge-primary-type">{privilegeTargetUser.primary_type || 'USER'}</span>
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                      Roles: {privilegeTargetUser.roles?.map((r) => r.code).join(', ') || 'None'}
                    </span>
                  </div>
                </div>
              </div>
              <button onClick={() => setShowPrivilegesModal(false)} className="btn-close-modal">&times;</button>
            </div>

            {/* Explanation Banner */}
            <div style={{ padding: '12px 16px', background: 'rgba(99, 102, 241, 0.08)', borderBottom: '1px solid rgba(99, 102, 241, 0.15)', fontSize: '0.8rem', color: '#c7d2fe', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Info size={18} style={{ flexShrink: 0, color: '#818cf8' }} />
              <div>
                <strong>Privilege Hierarchy:</strong> Users inherit statutory baseline privileges from their assigned roles.
                You can <strong>Grant</strong> individual privileges beyond their role, or explicitly <strong>Revoke</strong> an inherited privilege.
              </div>
            </div>

            {/* Privileges List (Scrollable) */}
            <div style={{ overflowY: 'auto', padding: '16px 20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {(systemPrivileges.length > 0 ? systemPrivileges : SYSTEM_PRIVILEGES).map((p) => {
                const userRolesList = privilegeTargetUser.roles || [];
                const roleDefMap = Object.keys(roleDefaultPrivileges).length > 0 ? roleDefaultPrivileges : ROLE_DEFAULT_PRIVILEGES;
                const hasRoleDefault = userRolesList.some((r) => (roleDefMap[r.code] || []).includes(p.code));
                const isExplicitlyGranted = userGrantedPrivs.has(p.code);
                const isExplicitlyRevoked = userRevokedPrivs.has(p.code);
                const isEffective = (hasRoleDefault || isExplicitlyGranted) && !isExplicitlyRevoked;

                return (
                  <div
                    key={p.code}
                    className={`privilege-item-card ${isEffective ? 'effective' : 'inactive'} ${isExplicitlyRevoked ? 'revoked' : ''} ${isExplicitlyGranted ? 'granted' : ''}`}
                  >
                    <div className="privilege-info">
                      <div className="privilege-header-line">
                        <span className="privilege-name">{p.name}</span>
                        <code className="privilege-code">{p.code}</code>
                        <span className="privilege-category-tag">{p.category}</span>
                      </div>
                      <p className="privilege-desc">{p.description}</p>
                      <div className="privilege-status-line">
                        {isExplicitlyRevoked ? (
                          <span className="priv-status-badge revoked">
                            <Lock size={11} /> Explicitly Revoked (Access Denied)
                          </span>
                        ) : isExplicitlyGranted ? (
                          <span className="priv-status-badge granted">
                            <Sparkles size={11} /> Explicitly Granted (Super Override)
                          </span>
                        ) : hasRoleDefault ? (
                          <span className="priv-status-badge inherited">
                            <Check size={11} /> Active via Role Default
                          </span>
                        ) : (
                          <span className="priv-status-badge inactive">
                            &bull; Inactive
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 3-State Action Toggle Button Group */}
                    <div className="privilege-action-toggles">
                      <button
                        type="button"
                        onClick={() => handleSetPrivilegeState(p.code, 'GRANT')}
                        className={`toggle-btn grant ${isExplicitlyGranted ? 'active' : ''}`}
                        title="Explicitly grant this privilege to this user"
                      >
                        <Check size={13} /> Grant
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSetPrivilegeState(p.code, 'RESET')}
                        className={`toggle-btn reset ${!isExplicitlyGranted && !isExplicitlyRevoked ? 'active' : ''}`}
                        title="Reset to statutory role baseline"
                      >
                        <RotateCcw size={13} /> Default
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSetPrivilegeState(p.code, 'REVOKE')}
                        className={`toggle-btn revoke ${isExplicitlyRevoked ? 'active' : ''}`}
                        title="Explicitly strip and deny this privilege"
                      >
                        <Lock size={13} /> Revoke
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="modal-actions" style={{ padding: '16px 20px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', background: '#0f172a' }}>
              <div style={{ fontSize: '0.82rem', color: '#94a3b8', display: 'flex', gap: '14px', alignItems: 'center' }}>
                <span>
                  <strong style={{ color: '#38bdf8' }}>{userGrantedPrivs.size}</strong> Custom Grants
                </span>
                <span>
                  <strong style={{ color: '#f87171' }}>{userRevokedPrivs.size}</strong> Revocations
                </span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button type="button" onClick={() => setShowPrivilegesModal(false)} className="btn-cancel">
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={savingPrivileges}
                  onClick={handleSavePrivilegesSubmit}
                  className="btn-primary-action"
                  style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
                >
                  {savingPrivileges ? <RefreshCw size={16} className="spin" /> : <CheckCircle2 size={16} />}
                  Save Privilege Overrides
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Master Role-Privilege Catalog Matrix Modal */}
      {showMatrixModal && (
        <div className="modal-overlay" onClick={() => setShowMatrixModal(false)}>
          <div className="modal-card modal-card-xl" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '960px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            <div className="modal-header">
              <div className="modal-title-row">
                <Sliders size={22} className="text-sky" />
                <div>
                  <h3 style={{ margin: 0 }}>Institutional Role-Privilege Master Matrix</h3>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#94a3b8' }}>
                    Statutory catalog of default privileges inherited by each institutional role under Maker-Checker governance.
                  </p>
                </div>
              </div>
              <button onClick={() => setShowMatrixModal(false)} className="btn-close-modal">&times;</button>
            </div>

            <div style={{ overflowX: 'auto', overflowY: 'auto', padding: '16px 20px', flex: 1 }}>
              <table className="admin-table matrix-table" style={{ width: '100%', fontSize: '0.8rem' }}>
                <thead>
                  <tr>
                    <th style={{ minWidth: '220px', position: 'sticky', left: 0, background: '#0f172a', zIndex: 2 }}>
                      System Privilege
                    </th>
                    {MASTER_ROLES.map((r) => (
                      <th key={r.code} style={{ textAlign: 'center', minWidth: '85px' }} title={r.name}>
                        <div>{r.code}</div>
                        <div style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 400 }}>{r.name.split(' ')[0]}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(systemPrivileges.length > 0 ? systemPrivileges : SYSTEM_PRIVILEGES).map((p) => {
                    const roleDefMap = Object.keys(roleDefaultPrivileges).length > 0 ? roleDefaultPrivileges : ROLE_DEFAULT_PRIVILEGES;
                    return (
                      <tr key={p.code}>
                        <td style={{ position: 'sticky', left: 0, background: '#0f172a', zIndex: 1 }}>
                          <strong style={{ color: '#f1f5f9' }}>{p.name}</strong>
                          <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{p.code} &bull; {p.category}</div>
                        </td>
                        {MASTER_ROLES.map((r) => {
                          const hasIt = (roleDefMap[r.code] || []).includes(p.code);
                          return (
                            <td key={r.code} style={{ textAlign: 'center', background: hasIt ? 'rgba(16, 185, 129, 0.05)' : 'transparent' }}>
                              {hasIt ? (
                                <span className="matrix-check" title={`${r.code} inherits ${p.name}`}>
                                  <Check size={16} className="text-emerald" style={{ display: 'inline-block' }} />
                                </span>
                              ) : (
                                <span style={{ color: '#334155' }}>&mdash;</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="modal-actions" style={{ padding: '14px 20px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', background: '#0f172a', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setShowMatrixModal(false)} className="btn-secondary-action">
                Close Matrix Catalog
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Extend Token Validity Modal */}
      {showExtendModal && extendTargetToken && (
        <div className="modal-overlay" onClick={() => setShowExtendModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <div className="modal-title-row">
                <CalendarPlus size={22} className="text-indigo" />
                <div>
                  <h3 style={{ margin: 0 }}>Extend URL Validity</h3>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#94a3b8' }}>
                    Update cut-off date and scan capacity for <strong>{extendTargetToken.title}</strong>
                  </p>
                </div>
              </div>
              <button onClick={() => setShowExtendModal(false)} className="btn-close-modal">&times;</button>
            </div>

            <form onSubmit={handleSaveExtendValidity} className="admin-form">
              <div className="current-token-banner" style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                padding: '0.85rem 1rem',
                marginBottom: '1rem',
                fontSize: '0.85rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Target Department:</span>
                  <strong>{DEPARTMENTS_CATALOG.find((d) => d.id === extendTargetToken.department_id)?.name || extendTargetToken.department_id}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Current Status:</span>
                  <span className={`badge status ${new Date(extendTargetToken.expires_at) < new Date() ? 'expired' : 'active'}`}>
                    {new Date(extendTargetToken.expires_at) < new Date() ? 'EXPIRED' : 'ACTIVE'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Current Cut-off:</span>
                  <span>{new Date(extendTargetToken.expires_at).toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Usage:</span>
                  <span>{extendTargetToken.used_count || 0} / {extendTargetToken.max_uses} used</span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Quick Add Extension</label>
                <div className="quick-extend-grid">
                  <button type="button" onClick={() => handleApplyExtendPreset(7)} className="quick-extend-btn">
                    +7 Days
                  </button>
                  <button type="button" onClick={() => handleApplyExtendPreset(15)} className="quick-extend-btn">
                    +15 Days
                  </button>
                  <button type="button" onClick={() => handleApplyExtendPreset(30)} className="quick-extend-btn">
                    +30 Days
                  </button>
                  <button type="button" onClick={() => handleApplyExtendPreset(60)} className="quick-extend-btn">
                    +60 Days
                  </button>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group" style={{ flex: 2 }}>
                  <label className="form-label">New Fixed Expiry Date * (HTML5 Calendar)</label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={extendNewDate}
                    onChange={(e) => setExtendNewDate(e.target.value)}
                    className="form-input"
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Cut-off Time</label>
                  <input
                    type="time"
                    value={extendNewTime}
                    onChange={(e) => setExtendNewTime(e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Max Uses / Scans (Limit)</label>
                <input
                  type="number"
                  min="1"
                  max="5000"
                  value={extendMaxUses}
                  onChange={(e) => setExtendMaxUses(e.target.value)}
                  className="form-input"
                />
                <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>
                  Increase the scan cap if more students in this batch need to enroll.
                </small>
              </div>

              <div className="form-group" style={{ marginTop: '0.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                  <input
                    type="checkbox"
                    checked={extendReactivate}
                    onChange={(e) => setExtendReactivate(e.target.checked)}
                  />
                  <span>Re-activate URL link immediately (if deactivated or expired)</span>
                </label>
              </div>

              <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={() => setShowExtendModal(false)} className="btn-cancel">
                  Cancel
                </button>
                <button type="submit" disabled={extendSubmitting} className="btn-primary-action">
                  {extendSubmitting ? <RefreshCw size={16} className="spin" /> : <CalendarPlus size={16} />}
                  <span>Save & Extend Validity</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
