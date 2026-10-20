'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
  GraduationCap,
  CheckCircle2,
  AlertTriangle,
  Save,
  Send,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  User,
  Heart,
  MapPin,
  BookOpen,
  Globe,
  Clock,
  Building,
  Info,
  FileText,
  UploadCloud,
  FileCheck,
  Award,
  Users,
  Check,
} from 'lucide-react';
import { FORM_REFERENCE_DATA } from '@/lib/constants';

export default function OnboardingWizardPage() {
  const { data: session, status } = useSession();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // STEP 1: CAP & PROGRAM
  const [capId, setCapId] = useState('');
  const [programLevel, setProgramLevel] = useState('UG');
  const [departmentId, setDepartmentId] = useState('dept_botany');
  const [programId, setProgramId] = useState('');
  const [secondLanguage, setSecondLanguage] = useState('Arabic');
  const [admissionQuota, setAdmissionQuota] = useState('General Merit / Open Quota');
  const [isOpenCategory, setIsOpenCategory] = useState(false);
  const [indexMark, setIndexMark] = useState('');

  // STEP 2: PERSONAL IDENTITY
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('Female');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [aadhaarNo, setAadhaarNo] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [alternateEmail, setAlternateEmail] = useState('');
  const [permanentAddress, setPermanentAddress] = useState('');
  const [stateName, setStateName] = useState('Kerala');
  const [district, setDistrict] = useState('');
  const [pincode, setPincode] = useState('');

  // STEP 3: FAMILY & DEMOGRAPHICS
  const [parentName, setParentName] = useState('');
  const [parentMobile, setParentMobile] = useState('');
  const [religion, setReligion] = useState('Hindu');
  const [actualCategory, setActualCategory] = useState('General');
  const [casteName, setCasteName] = useState('');
  const [familyStatus, setFamilyStatus] = useState('APL (Above Poverty Line)');
  const [annualIncome, setAnnualIncome] = useState('');

  // STEP 4: PREVIOUS EDUCATION & TC
  const [previousInstitution, setPreviousInstitution] = useState('');
  const [qualifyingExam, setQualifyingExam] = useState('Higher Secondary / Plus Two (State Board)');
  const [qualifyingPercentage, setQualifyingPercentage] = useState('');
  const [qualifyingYear, setQualifyingYear] = useState('2024');
  const [tcNo, setTcNo] = useState('');
  const [tcDate, setTcDate] = useState('');
  const [conductStatus, setConductStatus] = useState('Satisfactory (Issued within 6 months)');

  // STEP 5: QUOTAS & WEIGHTAGES
  const [pwdCategory, setPwdCategory] = useState('Not applicable');
  const [coCurricularCategory, setCoCurricularCategory] = useState('Not applicable');
  const [nccCertificateLevel, setNccCertificateLevel] = useState('None');
  const [isExServicemenWard, setIsExServicemenWard] = useState(false);
  const [hasArtsFestivalGrade, setHasArtsFestivalGrade] = useState(false);
  const [sportsQuotaLevel, setSportsQuotaLevel] = useState('Not applicable');

  // STEP 6: DOCUMENT VERIFICATION LINKS & DECLARATION
  const [allotmentMemoUrl, setAllotmentMemoUrl] = useState('');
  const [universityAppUrl, setUniversityAppUrl] = useState('');
  const [feeReceiptUrl, setFeeReceiptUrl] = useState('');
  const [tcDocUrl, setTcDocUrl] = useState('');
  const [qualifyingMarksUrl, setQualifyingMarksUrl] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [communityCertUrl, setCommunityCertUrl] = useState('');
  const [incomeCertUrl, setIncomeCertUrl] = useState('');
  const [declarationChecked, setDeclarationChecked] = useState(false);

  // Load existing profile & department lists
  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated') {
      fetch('/api/admin/departments').then(r => r.json()).then(data => {
        if (data.departments) {
          const degreeDepts = data.departments.filter(d => d.type === 'PROGRAM_OFFERING');
          setDepartments(degreeDepts.length > 0 ? degreeDepts : data.departments);
        }
      }).catch(() => {});
      fetch('/api/admin/programs').then(r => r.json()).then(data => {
        if (data.programs) setPrograms(data.programs);
      }).catch(() => {});
      setLoading(false);
      return;
    }

    async function initData() {
      try {
        // Load Departments & Programs
        const [resDept, resProg, resProf] = await Promise.all([
          fetch('/api/admin/departments').then(r => r.json()).catch(() => ({ departments: [] })),
          fetch('/api/admin/programs').then(r => r.json()).catch(() => ({ programs: [] })),
          fetch('/api/profile').then(r => r.json()).catch(() => ({ profile: null }))
        ]);

        if (resDept.departments) {
          // Filter to degree offering departments for student admission
          const degreeDepts = resDept.departments.filter(d => d.type === 'PROGRAM_OFFERING');
          setDepartments(degreeDepts.length > 0 ? degreeDepts : resDept.departments);
        }
        if (resProg.programs) {
          setPrograms(resProg.programs);
        }

        if (resProf.profile) {
          const p = resProf.profile;
          setProfile(p);
          setCapId(p.cap_id || p.admission_or_emp_no || '');
          setProgramLevel(p.program_level || 'UG');
          setDepartmentId(p.department_id || 'dept_botany');
          setProgramId(p.program_id || '');
          setSecondLanguage(p.second_language || 'Arabic');
          setAdmissionQuota(p.admission_quota || 'General Merit / Open Quota');
          setIsOpenCategory(Boolean(p.is_open_category));
          setIndexMark(p.index_mark ? String(p.index_mark) : '');

          setFullName(p.full_name || session.user.name || '');
          setDob(p.dob ? p.dob.split('T')[0] : '');
          setGender(p.gender || 'Female');
          setBloodGroup(p.blood_group || 'O+');
          setAadhaarNo(p.aadhaar_last4 ? 'XXXXXXXX' + p.aadhaar_last4 : '');
          setMobileNumber(p.mobile_number || '');
          setAlternateEmail(p.alternate_email || '');
          setPermanentAddress(p.permanent_address || '');
          setStateName(p.permanent_state || 'Kerala');
          setDistrict(p.permanent_district || '');
          setPincode(p.permanent_pincode || '');

          setParentName(p.parent_name || p.emergency_contact_name || '');
          setParentMobile(p.parent_mobile || p.emergency_contact_phone || '');
          setReligion(p.religion || 'Hindu');
          setActualCategory(p.actual_category || p.community_category || 'General');
          setCasteName(p.caste_name || '');
          setFamilyStatus(p.family_status || 'APL (Above Poverty Line)');
          setAnnualIncome(p.annual_income ? String(p.annual_income) : '');

          setPreviousInstitution(p.previous_institution || '');
          setQualifyingExam(p.qualifying_exam || 'Higher Secondary / Plus Two (State Board)');
          setQualifyingPercentage(p.qualifying_percentage ? String(p.qualifying_percentage) : '');
          setQualifyingYear(p.qualifying_year ? String(p.qualifying_year) : '2024');
          setTcNo(p.tc_no || '');
          setTcDate(p.tc_date ? p.tc_date.split('T')[0] : '');
          setConductStatus(p.conduct_status || 'Satisfactory (Issued within 6 months)');

          setPwdCategory(p.pwd_category || 'Not applicable');
          setCoCurricularCategory(p.co_curricular_category || 'Not applicable');
          setNccCertificateLevel(p.ncc_certificate_level || 'None');
          setIsExServicemenWard(Boolean(p.is_ex_servicemen_ward));
          setHasArtsFestivalGrade(Boolean(p.has_arts_festival_grade));
          setSportsQuotaLevel(p.sports_quota_level || 'Not applicable');

          if (p.documents) {
            setAllotmentMemoUrl(p.documents.allotment_memo_url || '');
            setUniversityAppUrl(p.documents.university_app_url || '');
            setFeeReceiptUrl(p.documents.fee_receipt_url || '');
            setTcDocUrl(p.documents.tc_doc_url || '');
            setQualifyingMarksUrl(p.documents.qualifying_marks_url || '');
            setPhotoUrl(p.documents.photo_url || '');
            setCommunityCertUrl(p.documents.community_cert_url || '');
            setIncomeCertUrl(p.documents.income_cert_url || '');
          }
        } else {
          setFullName(session.user.name || '');
        }
      } catch (err) {
        console.error('Error loading onboarding data:', err);
      } finally {
        setLoading(false);
      }
    }
    initData();
  }, [session, status]);

  const isLocked = profile?.profile_status === 'APPROVED';
  const isSubmitted = profile?.profile_status === 'SUBMITTED';
  const hasCorrections = profile?.profile_status === 'CORRECTION_REQUIRED';

  // Filter programs based on selected department
  const filteredPrograms = programs.filter(
    p => p.department_id === departmentId && (!programLevel || p.level === programLevel)
  );

  async function handleSave(isSubmitting) {
    setMessage({ type: '', text: '' });

    if (isSubmitting) {
      if (!capId.trim()) {
        setMessage({ type: 'error', text: 'CAP Registration ID is required.' });
        setCurrentStep(1);
        return;
      }
      if (!fullName.trim() || !dob || !mobileNumber.trim()) {
        setMessage({ type: 'error', text: 'Candidate Name, Date of Birth, and Mobile Number are required.' });
        setCurrentStep(2);
        return;
      }
      if (!parentName.trim() || !parentMobile.trim()) {
        setMessage({ type: 'error', text: 'Parent / Guardian details are required.' });
        setCurrentStep(3);
        return;
      }
      if (!declarationChecked) {
        setMessage({ type: 'error', text: 'You must check the statutory declaration before submitting.' });
        setCurrentStep(6);
        return;
      }
    }

    setIsSaving(true);
    try {
      const payload = {
        role_code: 'STUDENT',
        cap_id: capId.trim(),
        admission_or_emp_no: capId.trim(),
        program_level: programLevel,
        department_id: departmentId,
        program_id: programId,
        second_language: secondLanguage,
        admission_quota: admissionQuota,
        is_open_category: isOpenCategory,
        index_mark: indexMark ? parseFloat(indexMark) : null,

        full_name: fullName.trim(),
        dob,
        gender,
        blood_group: bloodGroup,
        aadhaar_last4: aadhaarNo.replace(/\D/g, '').slice(-4),
        mobile_number: mobileNumber.trim(),
        alternate_email: alternateEmail.trim(),
        permanent_address: permanentAddress.trim(),
        permanent_state: stateName,
        permanent_district: district.trim(),
        permanent_pincode: pincode.trim(),

        parent_name: parentName.trim(),
        parent_mobile: parentMobile.trim(),
        emergency_contact_name: parentName.trim(),
        emergency_contact_phone: parentMobile.trim(),
        religion,
        actual_category: actualCategory,
        community_category: actualCategory,
        caste_name: casteName.trim(),
        family_status: familyStatus,
        annual_income: annualIncome ? parseFloat(annualIncome) : null,

        previous_institution: previousInstitution.trim(),
        qualifying_exam: qualifyingExam,
        qualifying_percentage: qualifyingPercentage ? parseFloat(qualifyingPercentage) : null,
        qualifying_year: qualifyingYear ? parseInt(qualifyingYear, 10) : 2024,
        tc_no: tcNo.trim(),
        tc_date: tcDate || null,
        conduct_status: conductStatus,

        pwd_category: pwdCategory,
        co_curricular_category: coCurricularCategory,
        ncc_certificate_level: nccCertificateLevel,
        is_ex_servicemen_ward: isExServicemenWard,
        has_arts_festival_grade: hasArtsFestivalGrade,
        sports_quota_level: sportsQuotaLevel,

        documents: {
          allotment_memo_url: allotmentMemoUrl.trim(),
          university_app_url: universityAppUrl.trim(),
          fee_receipt_url: feeReceiptUrl.trim(),
          tc_doc_url: tcDocUrl.trim(),
          qualifying_marks_url: qualifyingMarksUrl.trim(),
          photo_url: photoUrl.trim(),
          community_cert_url: communityCertUrl.trim(),
          income_cert_url: incomeCertUrl.trim(),
        },
      };

      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isSubmitting, profileData: payload }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setProfile(data.profile);
        setMessage({
          type: 'success',
          text: isSubmitting
            ? 'Admission Dossier submitted successfully! It is now locked under Superior Review.'
            : 'Draft progress saved successfully.',
        });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to save admission records.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Network error occurred while saving records.' });
    } finally {
      setIsSaving(false);
    }
  }

  const steps = [
    { num: 1, label: 'Allotment & Program', icon: Building },
    { num: 2, label: 'Personal & Identity', icon: User },
    { num: 3, label: 'Family & Category', icon: Users },
    { num: 4, label: 'Academics & TC', icon: BookOpen },
    { num: 5, label: 'Quotas & Activities', icon: Award },
    { num: 6, label: 'Documents & Submit', icon: FileCheck },
  ];

  if (loading) {
    return (
      <div className="onboarding-loading">
        <Clock size={28} className="spin" />
        <p>Loading Statutory Admission Dossier & Department Catalog...</p>
      </div>
    );
  }

  return (
    <div className="onboarding-page-container">
      {/* Top Banner */}
      <div className="onboarding-header">
        <div className="onboarding-header-left">
          <span className="onboarding-kicker">
            <ShieldCheck size={16} /> Statutory Onboarding • Architectural Principle: Ask Once
          </span>
          <h1 className="onboarding-title">Student Admission Master Dossier</h1>
          <p className="onboarding-subtitle">
            Provide your 48 statutory admission data points once. Upon institutional review by the Department HoD and College Administration, this record serves as your permanent academic identity.
          </p>
        </div>

        <div className="onboarding-status-pill">
          {isLocked ? (
            <span className="status-badge approved">
              <CheckCircle2 size={16} /> APPROVED & LOCKED
            </span>
          ) : isSubmitted ? (
            <span className="status-badge submitted">
              <Clock size={16} /> UNDER SUPERIOR REVIEW
            </span>
          ) : hasCorrections ? (
            <span className="status-badge correction">
              <AlertTriangle size={16} /> CORRECTIONS REQUIRED
            </span>
          ) : (
            <span className="status-badge draft">
              <Save size={16} /> DRAFT IN PROGRESS
            </span>
          )}
        </div>
      </div>

      {/* Reviewer Feedback Alert */}
      {hasCorrections && profile?.reviewer_notes && (
        <div className="correction-notes-alert">
          <AlertTriangle size={20} className="correction-alert-icon" />
          <div>
            <strong>Superior Action Required: Corrections Requested</strong>
            <p className="reviewer-notes-body">{profile.reviewer_notes}</p>
          </div>
        </div>
      )}

      {/* Status Messages */}
      {message.text && (
        <div className={`onboarding-alert ${message.type}`}>
          {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Step Navigator */}
      <div className="wizard-stepper">
        {steps.map(s => {
          const Icon = s.icon;
          const isActive = currentStep === s.num;
          const isCompleted = currentStep > s.num;
          return (
            <button
              key={s.num}
              type="button"
              className={`wizard-step-btn ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
              onClick={() => setCurrentStep(s.num)}
            >
              <div className="wizard-step-circle">
                {isCompleted ? <Check size={14} /> : <Icon size={14} />}
              </div>
              <span className="wizard-step-label">{s.label}</span>
            </button>
          );
        })}
      </div>

      {/* Wizard Form Card */}
      <div className="onboarding-form-card">
        {/* STEP 1: ALLOTMENT & PROGRAM */}
        {currentStep === 1 && (
          <section className="form-section">
            <div className="section-header">
              <div className="section-icon"><Building size={18} /></div>
              <div>
                <h2 className="section-title">1. University Allotment & Degree Program Enrollment</h2>
                <p className="section-desc">Details from your Centralized Allotment Process (CAP) allotment memo.</p>
              </div>
            </div>

            <div className="fields-grid">
              <div className="form-group">
                <label className="form-label">CAP Registration ID *</label>
                <input
                  type="text"
                  placeholder="e.g. CAP26PG121319 / CAP26UG104521"
                  disabled={isLocked || isSubmitted}
                  value={capId}
                  onChange={(e) => setCapId(e.target.value.toUpperCase())}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Admission Level *</label>
                <select
                  disabled={isLocked || isSubmitted}
                  value={programLevel}
                  onChange={(e) => setProgramLevel(e.target.value)}
                  className="form-input"
                >
                  <option value="UG">Undergraduate (FYUGP - 4 Years / 8 Semesters with 3-Year Exit Option)</option>
                  <option value="PG">Postgraduate (PG / 2-Year Master)</option>
                  <option value="PHD">Doctoral Research (PhD)</option>
                  <option value="DIPLOMA">Diploma / Certificate</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Admitted Department (Degree-Offering) *</label>
                <select
                  disabled={isLocked || isSubmitted}
                  value={departmentId}
                  onChange={(e) => {
                    setDepartmentId(e.target.value);
                    setProgramId('');
                  }}
                  className="form-input"
                >
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Conferred Degree Program *</label>
                <select
                  disabled={isLocked || isSubmitted}
                  value={programId}
                  onChange={(e) => setProgramId(e.target.value)}
                  className="form-input"
                >
                  <option value="">Select Enrolled Program...</option>
                  {filteredPrograms.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.code}) • {p.duration_years} Years
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Second Language (Auxiliary Dept) *</label>
                <select
                  disabled={isLocked || isSubmitted}
                  value={secondLanguage}
                  onChange={(e) => setSecondLanguage(e.target.value)}
                  className="form-input"
                >
                  {FORM_REFERENCE_DATA.secondLanguages.map(lang => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
                <span className="field-hint">Conducted by Supporting Language Departments (e.g. Dept of Arabic).</span>
              </div>

              <div className="form-group">
                <label className="form-label">Admission Quota / Allotment Category *</label>
                <select
                  disabled={isLocked || isSubmitted}
                  value={admissionQuota}
                  onChange={(e) => setAdmissionQuota(e.target.value)}
                  className="form-input"
                >
                  {FORM_REFERENCE_DATA.admissionQuotas.map(q => (
                    <option key={q} value={q}>{q}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Admission Index Mark (Merit Score) *</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="e.g. 1145.50"
                  disabled={isLocked || isSubmitted}
                  value={indexMark}
                  onChange={(e) => setIndexMark(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group form-checkbox-group">
                <label className="form-checkbox-label">
                  <input
                    type="checkbox"
                    disabled={isLocked || isSubmitted}
                    checked={isOpenCategory}
                    onChange={(e) => setIsOpenCategory(e.target.checked)}
                  />
                  <span>Admitted under Open / General Merit Category (merit selection)</span>
                </label>
              </div>
            </div>
          </section>
        )}

        {/* STEP 2: PERSONAL IDENTITY */}
        {currentStep === 2 && (
          <section className="form-section">
            <div className="section-header">
              <div className="section-icon"><User size={18} /></div>
              <div>
                <h2 className="section-title">2. Personal & Identity Verification</h2>
                <p className="section-desc">Statutory identity records exactly matching your SSLC / Matriculation Certificate.</p>
              </div>
            </div>

            <div className="fields-grid">
              <div className="form-group">
                <label className="form-label">Full Name (As per SSLC Certificate) *</label>
                <input
                  type="text"
                  placeholder="Enter complete name as printed on certificate"
                  disabled={isLocked || isSubmitted}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Date of Birth (As per SSLC) *</label>
                <input
                  type="date"
                  disabled={isLocked || isSubmitted}
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Gender *</label>
                <select
                  disabled={isLocked || isSubmitted}
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="form-input"
                >
                  {FORM_REFERENCE_DATA.genders.map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Blood Group *</label>
                <select
                  disabled={isLocked || isSubmitted}
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="form-input"
                >
                  {FORM_REFERENCE_DATA.bloodGroups.map(bg => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Aadhaar Number (12 Digits) *</label>
                <input
                  type="text"
                  maxLength={14}
                  placeholder="XXXX XXXX XXXX"
                  disabled={isLocked || isSubmitted}
                  value={aadhaarNo}
                  onChange={(e) => setAadhaarNo(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Primary Mobile Number (Student WhatsApp) *</label>
                <input
                  type="tel"
                  placeholder="10-digit mobile number"
                  disabled={isLocked || isSubmitted}
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Alternate Email Address</label>
                <input
                  type="email"
                  placeholder="personal.email@gmail.com"
                  disabled={isLocked || isSubmitted}
                  value={alternateEmail}
                  onChange={(e) => setAlternateEmail(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group full-width">
                <label className="form-label">Permanent Postal Address (With House Name / Place) *</label>
                <textarea
                  rows={2}
                  placeholder="House Name, Street / Locality, Post Office"
                  disabled={isLocked || isSubmitted}
                  value={permanentAddress}
                  onChange={(e) => setPermanentAddress(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">District *</label>
                <input
                  type="text"
                  placeholder="e.g. Palakkad / Ernakulam"
                  disabled={isLocked || isSubmitted}
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">PIN Code *</label>
                <input
                  type="text"
                  placeholder="6-digit PIN"
                  maxLength={6}
                  disabled={isLocked || isSubmitted}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="form-input"
                />
              </div>
            </div>
          </section>
        )}

        {/* STEP 3: FAMILY & DEMOGRAPHICS */}
        {currentStep === 3 && (
          <section className="form-section">
            <div className="section-header">
              <div className="section-icon"><Users size={18} /></div>
              <div>
                <h2 className="section-title">3. Family, Socio-Economic & Demographic Profile</h2>
                <p className="section-desc">Parent/Guardian contact line, statutory community reservation, and income records.</p>
              </div>
            </div>

            <div className="fields-grid">
              <div className="form-group">
                <label className="form-label">Parent / Guardian Name *</label>
                <input
                  type="text"
                  placeholder="Full name of father, mother, or guardian"
                  disabled={isLocked || isSubmitted}
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Parent / Guardian Mobile No. *</label>
                <input
                  type="tel"
                  placeholder="Parent phone line"
                  disabled={isLocked || isSubmitted}
                  value={parentMobile}
                  onChange={(e) => setParentMobile(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Religion *</label>
                <select
                  disabled={isLocked || isSubmitted}
                  value={religion}
                  onChange={(e) => setReligion(e.target.value)}
                  className="form-input"
                >
                  {FORM_REFERENCE_DATA.religions.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Actual Community Category *</label>
                <select
                  disabled={isLocked || isSubmitted}
                  value={actualCategory}
                  onChange={(e) => setActualCategory(e.target.value)}
                  className="form-input"
                >
                  {FORM_REFERENCE_DATA.actualCategories.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Caste / Sub-Caste Name</label>
                <input
                  type="text"
                  placeholder="e.g. Nair, Thiyya, Ezhava, Muslim, Pulaya"
                  disabled={isLocked || isSubmitted}
                  value={casteName}
                  onChange={(e) => setCasteName(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Family Economic Status *</label>
                <select
                  disabled={isLocked || isSubmitted}
                  value={familyStatus}
                  onChange={(e) => setFamilyStatus(e.target.value)}
                  className="form-input"
                >
                  {FORM_REFERENCE_DATA.familyStatuses.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Annual Family Income (INR) *</label>
                <input
                  type="number"
                  placeholder="As per Revenue Tahsildar certificate"
                  disabled={isLocked || isSubmitted}
                  value={annualIncome}
                  onChange={(e) => setAnnualIncome(e.target.value)}
                  className="form-input"
                />
              </div>
            </div>
          </section>
        )}

        {/* STEP 4: PREVIOUS ACADEMICS & TC */}
        {currentStep === 4 && (
          <section className="form-section">
            <div className="section-header">
              <div className="section-icon"><BookOpen size={18} /></div>
              <div>
                <h2 className="section-title">4. Previous Academic Record & Transfer Credentials</h2>
                <p className="section-desc">Institution last attended and Transfer Certificate (TC) details.</p>
              </div>
            </div>

            <div className="fields-grid">
              <div className="form-group full-width">
                <label className="form-label">Previous Institution Last Attended *</label>
                <input
                  type="text"
                  placeholder="Name of School / Higher Secondary School or College"
                  disabled={isLocked || isSubmitted}
                  value={previousInstitution}
                  onChange={(e) => setPreviousInstitution(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Qualifying Examination *</label>
                <select
                  disabled={isLocked || isSubmitted}
                  value={qualifyingExam}
                  onChange={(e) => setQualifyingExam(e.target.value)}
                  className="form-input"
                >
                  {FORM_REFERENCE_DATA.qualifyingExams.map(ex => (
                    <option key={ex} value={ex}>{ex}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Qualifying Percentage / CGPA *</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="e.g. 92.50"
                  disabled={isLocked || isSubmitted}
                  value={qualifyingPercentage}
                  onChange={(e) => setQualifyingPercentage(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Transfer Certificate (TC) Number *</label>
                <input
                  type="text"
                  placeholder="TC Serial Number"
                  disabled={isLocked || isSubmitted}
                  value={tcNo}
                  onChange={(e) => setTcNo(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">TC Issue Date *</label>
                <input
                  type="date"
                  disabled={isLocked || isSubmitted}
                  value={tcDate}
                  onChange={(e) => setTcDate(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Conduct Certificate Status *</label>
                <input
                  type="text"
                  disabled={isLocked || isSubmitted}
                  value={conductStatus}
                  onChange={(e) => setConductStatus(e.target.value)}
                  className="form-input"
                />
              </div>
            </div>
          </section>
        )}

        {/* STEP 5: QUOTAS & WEIGHTAGES */}
        {currentStep === 5 && (
          <section className="form-section">
            <div className="section-header">
              <div className="section-icon"><Award size={18} /></div>
              <div>
                <h2 className="section-title">5. Special Quotas, Weightages & Co-Curricular</h2>
                <p className="section-desc">Bonus points for NCC, NSS, Sports, and Differently Abled categories.</p>
              </div>
            </div>

            <div className="fields-grid">
              <div className="form-group full-width">
                <label className="form-label">Person with Disability (PwD) Status</label>
                <select
                  disabled={isLocked || isSubmitted}
                  value={pwdCategory}
                  onChange={(e) => setPwdCategory(e.target.value)}
                  className="form-input"
                >
                  {FORM_REFERENCE_DATA.pwdCategories.map(pwd => (
                    <option key={pwd} value={pwd}>{pwd}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Co-Curricular Participation</label>
                <select
                  disabled={isLocked || isSubmitted}
                  value={coCurricularCategory}
                  onChange={(e) => setCoCurricularCategory(e.target.value)}
                  className="form-input"
                >
                  {FORM_REFERENCE_DATA.coCurricularOptions.map(co => (
                    <option key={co} value={co}>{co}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">NCC Certificate Level</label>
                <select
                  disabled={isLocked || isSubmitted}
                  value={nccCertificateLevel}
                  onChange={(e) => setNccCertificateLevel(e.target.value)}
                  className="form-input"
                >
                  {FORM_REFERENCE_DATA.nccCertificates.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Sports Representation</label>
                <input
                  type="text"
                  placeholder="District / State / National medalist"
                  disabled={isLocked || isSubmitted}
                  value={sportsQuotaLevel}
                  onChange={(e) => setSportsQuotaLevel(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group form-checkbox-group">
                <label className="form-checkbox-label">
                  <input
                    type="checkbox"
                    disabled={isLocked || isSubmitted}
                    checked={isExServicemenWard}
                    onChange={(e) => setIsExServicemenWard(e.target.checked)}
                  />
                  <span>Ward of Defense Personnel / Ex-Servicemen reservation</span>
                </label>
              </div>

              <div className="form-group form-checkbox-group">
                <label className="form-checkbox-label">
                  <input
                    type="checkbox"
                    disabled={isLocked || isSubmitted}
                    checked={hasArtsFestivalGrade}
                    onChange={(e) => setHasArtsFestivalGrade(e.target.checked)}
                  />
                  <span>A-Grade Winner in State-level School Arts Festival (Bonus Points)</span>
                </label>
              </div>
            </div>
          </section>
        )}

        {/* STEP 6: DOCUMENTS & SUBMIT */}
        {currentStep === 6 && (
          <section className="form-section">
            <div className="section-header">
              <div className="section-icon"><FileCheck size={18} /></div>
              <div>
                <h2 className="section-title">6. Statutory Document Uploads & Declaration</h2>
                <p className="section-desc">Provide accessible cloud links (Google Drive, DigiLocker, etc.) for physical verification.</p>
              </div>
            </div>

            <div className="fields-grid">
              <div className="form-group">
                <label className="form-label">University Allotment Memo Link</label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/..."
                  disabled={isLocked || isSubmitted}
                  value={allotmentMemoUrl}
                  onChange={(e) => setAllotmentMemoUrl(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">University CAP Application Form Link</label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/..."
                  disabled={isLocked || isSubmitted}
                  value={universityAppUrl}
                  onChange={(e) => setUniversityAppUrl(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Mandatory Admission Fee Receipt Link</label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/..."
                  disabled={isLocked || isSubmitted}
                  value={feeReceiptUrl}
                  onChange={(e) => setFeeReceiptUrl(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Original Transfer Certificate (TC) Scan Link</label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/..."
                  disabled={isLocked || isSubmitted}
                  value={tcDocUrl}
                  onChange={(e) => setTcDocUrl(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Qualifying Exam Mark List Link (+2 / Degree)</label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/..."
                  disabled={isLocked || isSubmitted}
                  value={qualifyingMarksUrl}
                  onChange={(e) => setQualifyingMarksUrl(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Passport Size Photograph Link</label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/..."
                  disabled={isLocked || isSubmitted}
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Community / Non-Creamy Layer Certificate</label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/..."
                  disabled={isLocked || isSubmitted}
                  value={communityCertUrl}
                  onChange={(e) => setCommunityCertUrl(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Revenue Income / EWS Certificate Link</label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/..."
                  disabled={isLocked || isSubmitted}
                  value={incomeCertUrl}
                  onChange={(e) => setIncomeCertUrl(e.target.value)}
                  className="form-input"
                />
              </div>

              {/* Statutory Declaration */}
              <div className="declaration-container full-width">
                <label className="declaration-label">
                  <input
                    type="checkbox"
                    disabled={isLocked || isSubmitted}
                    checked={declarationChecked}
                    onChange={(e) => setDeclarationChecked(e.target.checked)}
                  />
                  <span>
                    <strong>Statutory Candidate Declaration:</strong> I hereby declare that all 48 data points and documentary links furnished above are authentic, truthful, and verified against my original certificates. I understand that under the college's <em>"Ask Once"</em> data governance policy, these records become permanent upon approval, and any subsequent alteration requires documentary proof and Maker-Checker approval from the Department Head and Principal.
                  </span>
                </label>
              </div>
            </div>
          </section>
        )}

        {/* Wizard Footer Navigation Actions */}
        <div className="wizard-actions-bar">
          <div className="wizard-actions-left">
            {currentStep > 1 && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setCurrentStep(currentStep - 1)}
              >
                <ArrowLeft size={16} /> Previous Section
              </button>
            )}
          </div>

          <div className="wizard-actions-right">
            {!isLocked && !isSubmitted && (
              <button
                type="button"
                className="btn btn-secondary"
                disabled={isSaving}
                onClick={() => handleSave(false)}
              >
                <Save size={16} /> Save Draft Progress
              </button>
            )}

            {currentStep < 6 ? (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setCurrentStep(currentStep + 1)}
              >
                Next Section <ArrowRight size={16} />
              </button>
            ) : (
              !isLocked && !isSubmitted && (
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={isSaving}
                  onClick={() => handleSave(true)}
                >
                  <Send size={16} /> {isSaving ? 'Submitting...' : 'Submit for Superior Verification'}
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
