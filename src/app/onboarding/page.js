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
  ShieldCheck,
  User,
  Heart,
  MapPin,
  BookOpen,
  Globe,
  Clock,
  Building,
  Info,
} from 'lucide-react';
import { FORM_REFERENCE_DATA, DEPARTMENTS_CATALOG } from '@/lib/constants';

export default function OnboardingWizardPage() {
  const { data: session, status } = useSession();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isSaving, setIsSaving] = useState(false);

  // Form Fields (Ask Once)
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [maritalStatus, setMaritalStatus] = useState('Single');
  const [religion, setReligion] = useState('');
  const [category, setCategory] = useState('');
  const [casteName, setCasteName] = useState('');
  const [reservations, setReservations] = useState([]);
  const [alternateEmail, setAlternateEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [permanentAddress, setPermanentAddress] = useState('');
  const [stateName, setStateName] = useState('');
  const [district, setDistrict] = useState('');
  const [pincode, setPincode] = useState('');
  const [admissionNo, setAdmissionNo] = useState('');
  const [aadhaarLast4, setAadhaarLast4] = useState('');
  const [qualifyingExam, setQualifyingExam] = useState('');
  const [qualifyingPercentage, setQualifyingPercentage] = useState('');
  const [qualifyingYear, setQualifyingYear] = useState('2024');
  const [campusPreference, setCampusPreference] = useState('DAY_SCHOLAR');
  const [busRequired, setBusRequired] = useState(false);
  const [busStop, setBusStop] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [proofUrl, setProofUrl] = useState('');
  const [declarationChecked, setDeclarationChecked] = useState(false);

  // Load existing profile
  useEffect(() => {
    async function loadProfile() {
      if (!session?.user?.email) return;
      try {
        const res = await fetch('/api/profile');
        const data = await res.json();
        if (data.profile) {
          const p = data.profile;
          setProfile(p);
          setFullName(p.full_name || session.user.name || '');
          setDob(p.dob ? p.dob.split('T')[0] : '');
          setGender(p.gender || '');
          setBloodGroup(p.blood_group || '');
          setMaritalStatus(p.marital_status || 'Single');
          setReligion(p.religion || '');
          setCategory(p.community_category || '');
          setCasteName(p.caste_name || '');
          setReservations(Array.isArray(p.reservations) ? p.reservations : []);
          setAlternateEmail(p.alternate_email || '');
          setMobileNumber(p.mobile_number || '');
          setEmergencyName(p.emergency_contact_name || '');
          setEmergencyPhone(p.emergency_contact_phone || '');
          setPermanentAddress(p.permanent_address || '');
          setStateName(p.permanent_state || '');
          setDistrict(p.permanent_district || '');
          setPincode(p.permanent_pincode || '');
          setAdmissionNo(p.admission_or_emp_no || '');
          setAadhaarLast4(p.aadhaar_last4 || '');
          setQualifyingExam(p.qualifying_exam || '');
          setQualifyingPercentage(p.qualifying_percentage || '');
          setQualifyingYear(p.qualifying_year || '2024');
          setCampusPreference(p.campus_preference || 'DAY_SCHOLAR');
          setBusRequired(Boolean(p.bus_required));
          setBusStop(p.bus_stop || '');
          setLinkedinUrl(p.linkedin_url || '');
          githubUrl && setGithubUrl(p.github_url || '');
          setProofUrl(p.document_proof_url || '');
        } else {
          setFullName(session.user.name || '');
        }
      } catch (err) {
        console.error('Error loading profile:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [session]);

  const isLocked = profile?.profile_status === 'APPROVED';
  const isSubmitted = profile?.profile_status === 'SUBMITTED';
  const hasCorrections = profile?.profile_status === 'CORRECTION_REQUIRED';

  function toggleReservation(code) {
    if (reservations.includes(code)) {
      setReservations(reservations.filter((c) => c !== code));
    } else {
      setReservations([...reservations, code]);
    }
  }

  async function handleSave(isSubmitting) {
    setMessage({ type: '', text: '' });

    if (isSubmitting) {
      // Validate mandatory fields
      if (!fullName.trim() || !dob || !gender || !bloodGroup || !category || !stateName) {
        setMessage({ type: 'error', text: 'Please complete all required demographic and personal fields.' });
        return;
      }
      const phoneRegex = /^[6-9]\d{9}$/;
      if (!phoneRegex.test(mobileNumber.trim())) {
        setMessage({ type: 'error', text: 'Primary mobile number must be a valid 10-digit number.' });
        return;
      }
      if (!declarationChecked) {
        setMessage({ type: 'error', text: 'You must check the statutory declaration before submitting.' });
        return;
      }
    }

    setIsSaving(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isSubmitting,
          profileData: {
            role_code: session.user.activeRole || 'STUDENT',
            full_name: fullName.trim(),
            dob,
            gender,
            blood_group: bloodGroup,
            marital_status: maritalStatus,
            religion,
            community_category: category,
            caste_name: casteName.trim(),
            reservations,
            alternate_email: alternateEmail.trim(),
            mobile_number: mobileNumber.trim(),
            emergency_contact_name: emergencyName.trim(),
            emergency_contact_phone: emergencyPhone.trim(),
            permanent_address: permanentAddress.trim(),
            permanent_state: stateName,
            permanent_district: district.trim(),
            permanent_pincode: pincode.trim(),
            admission_or_emp_no: admissionNo.trim(),
            aadhaar_last4: aadhaarLast4.trim(),
            qualifying_exam: qualifyingExam,
            qualifying_percentage: qualifyingPercentage ? parseFloat(qualifyingPercentage) : null,
            qualifying_year: qualifyingYear ? parseInt(qualifyingYear, 10) : null,
            campus_preference: campusPreference,
            bus_required: busRequired,
            bus_stop: busStop.trim(),
            linkedin_url: linkedinUrl.trim(),
            github_url: githubUrl.trim(),
            document_proof_url: proofUrl.trim(),
          },
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setProfile(data.profile);
        setMessage({
          type: 'success',
          text: isSubmitting
            ? 'Profile successfully submitted for Superior Verification! It is now locked under review.'
            : 'Draft saved successfully.',
        });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to save profile.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Network error occurred while saving profile.' });
    } finally {
      setIsSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="onboarding-loading">
        <Clock size={24} className="spin" /> Loading Onboarding Master Records...
      </div>
    );
  }

  return (
    <div className="onboarding-page-container">
      {/* Header */}
      <div className="onboarding-header">
        <div className="onboarding-header-left">
          <span className="onboarding-kicker">
            <ShieldCheck size={16} /> Architectural Principle: Ask Once
          </span>
          <h1 className="onboarding-title">Master Stakeholder Profile</h1>
          <p className="onboarding-subtitle">
            Provide your comprehensive credentials once. Once approved by your Department Superior, this profile becomes the immutable single source of truth across all college modules.
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

      {/* Reviewer Feedback Alert if corrections requested */}
      {hasCorrections && profile?.reviewer_notes && (
        <div className="correction-notes-alert">
          <div className="correction-alert-icon">
            <AlertTriangle size={20} />
          </div>
          <div>
            <strong>Superior Action Required: Corrections Requested</strong>
            <p className="reviewer-notes-body">{profile.reviewer_notes}</p>
          </div>
        </div>
      )}

      {/* Status Messages */}
      {message.text && (
        <div className={`onboarding-alert ${message.type}`}>
          {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
          <span>{message.text}</span>
        </div>
      )}

      {/* The Master Form */}
      <div className="onboarding-form-card">
        {/* Section 1: Demographics */}
        <section className="form-section">
          <div className="section-header">
            <div className="section-icon">
              <User size={18} />
            </div>
            <div>
              <h2 className="section-title">1. Personal & Identity Demographics</h2>
              <p className="section-desc">Official identity details matching Matriculation / Government records.</p>
            </div>
          </div>

          <div className="fields-grid">
            <div className="form-group">
              <label className="form-label">Full Name (Official) *</label>
              <input
                type="text"
                disabled={isLocked || isSubmitted}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Date of Birth (Calendar Picker) *</label>
              <input
                type="date"
                disabled={isLocked || isSubmitted}
                max="2012-12-31"
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
                className="form-select"
              >
                <option value="">-- Select Gender --</option>
                {FORM_REFERENCE_DATA.genders.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Blood Group *</label>
              <select
                disabled={isLocked || isSubmitted}
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="form-select"
              >
                <option value="">-- Select Blood Group --</option>
                {FORM_REFERENCE_DATA.bloodGroups.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Marital Status</label>
              <select
                disabled={isLocked || isSubmitted}
                value={maritalStatus}
                onChange={(e) => setMaritalStatus(e.target.value)}
                className="form-select"
              >
                {FORM_REFERENCE_DATA.maritalStatuses.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Section 2: Social & Reservations */}
        <section className="form-section">
          <div className="section-header">
            <div className="section-icon">
              <Heart size={18} />
            </div>
            <div>
              <h2 className="section-title">2. Social Classification & Statutory Reservations</h2>
              <p className="section-desc">Required for NAAC, NIRF, and State Scholarship accreditations.</p>
            </div>
          </div>

          <div className="fields-grid">
            <div className="form-group">
              <label className="form-label">Religion</label>
              <select
                disabled={isLocked || isSubmitted}
                value={religion}
                onChange={(e) => setReligion(e.target.value)}
                className="form-select"
              >
                <option value="">-- Select Religion --</option>
                {FORM_REFERENCE_DATA.religions.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Community Category *</label>
              <select
                disabled={isLocked || isSubmitted}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="form-select"
              >
                <option value="">-- Select Category --</option>
                {FORM_REFERENCE_DATA.categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Sub-Caste / Community Name</label>
              <input
                type="text"
                disabled={isLocked || isSubmitted}
                value={casteName}
                onChange={(e) => setCasteName(e.target.value)}
                placeholder="e.g. Nair, Ezhava, Brahmin, etc."
                className="form-input"
              />
            </div>
          </div>

          <div className="checkboxes-wrapper">
            <label className="form-label">Special Reservation / Quota Eligibility (Select all that apply):</label>
            <div className="checkbox-grid">
              {FORM_REFERENCE_DATA.specialReservations.map((item) => (
                <label key={item.code} className="checkbox-item">
                  <input
                    type="checkbox"
                    disabled={isLocked || isSubmitted}
                    checked={reservations.includes(item.code)}
                    onChange={() => toggleReservation(item.code)}
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
          </div>
        </section>

        {/* Section 3: Contact & Address */}
        <section className="form-section">
          <div className="section-header">
            <div className="section-icon">
              <MapPin size={18} />
            </div>
            <div>
              <h2 className="section-title">3. Contact & Permanent Residence</h2>
              <p className="section-desc">Validated communication channels and emergency guardian contacts.</p>
            </div>
          </div>

          <div className="fields-grid">
            <div className="form-group">
              <label className="form-label">Primary Email (Verified Google Auth)</label>
              <input type="email" disabled value={session?.user?.email || ''} className="form-input disabled-input" />
            </div>

            <div className="form-group">
              <label className="form-label">Primary Mobile Number (10-Digit) *</label>
              <input
                type="tel"
                disabled={isLocked || isSubmitted}
                maxLength={10}
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                placeholder="9876543210"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Emergency / Guardian Contact Name</label>
              <input
                type="text"
                disabled={isLocked || isSubmitted}
                value={emergencyName}
                onChange={(e) => setEmergencyName(e.target.value)}
                placeholder="Parent / Guardian Name"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Emergency Contact Phone</label>
              <input
                type="tel"
                disabled={isLocked || isSubmitted}
                maxLength={10}
                value={emergencyPhone}
                onChange={(e) => setEmergencyPhone(e.target.value.replace(/\D/g, ''))}
                placeholder="Guardian Mobile Number"
                className="form-input"
              />
            </div>

            <div className="form-group full-col">
              <label className="form-label">Permanent Residential Address *</label>
              <textarea
                rows={2}
                disabled={isLocked || isSubmitted}
                value={permanentAddress}
                onChange={(e) => setPermanentAddress(e.target.value)}
                placeholder="Door No, House Name, Street, Landmark"
                className="form-textarea"
              />
            </div>

            <div className="form-group">
              <label className="form-label">State / Union Territory *</label>
              <select
                disabled={isLocked || isSubmitted}
                value={stateName}
                onChange={(e) => setStateName(e.target.value)}
                className="form-select"
              >
                <option value="">-- Choose Indian State --</option>
                {FORM_REFERENCE_DATA.states.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">District</label>
              <input
                type="text"
                disabled={isLocked || isSubmitted}
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="e.g. Ernakulam, Bangalore, Chennai"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">PIN Code (6-Digit)</label>
              <input
                type="text"
                disabled={isLocked || isSubmitted}
                maxLength={6}
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                placeholder="682016"
                className="form-input"
              />
            </div>
          </div>
        </section>

        {/* Section 4: Academic History & Campus Facilities */}
        <section className="form-section">
          <div className="section-header">
            <div className="section-icon">
              <BookOpen size={18} />
            </div>
            <div>
              <h2 className="section-title">4. Academic History & Campus Facilities</h2>
              <p className="section-desc">Qualifying examination and transit/hostel preferences.</p>
            </div>
          </div>

          <div className="fields-grid">
            <div className="form-group">
              <label className="form-label">Qualifying Examination</label>
              <select
                disabled={isLocked || isSubmitted}
                value={qualifyingExam}
                onChange={(e) => setQualifyingExam(e.target.value)}
                className="form-select"
              >
                <option value="">-- Choose Qualifying Degree --</option>
                {FORM_REFERENCE_DATA.qualifyingExams.map((q) => (
                  <option key={q} value={q}>
                    {q}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Qualifying Percentage / CGPA</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                disabled={isLocked || isSubmitted}
                value={qualifyingPercentage}
                onChange={(e) => setQualifyingPercentage(e.target.value)}
                placeholder="e.g. 92.50"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Campus Facility Preference</label>
              <select
                disabled={isLocked || isSubmitted}
                value={campusPreference}
                onChange={(e) => setCampusPreference(e.target.value)}
                className="form-select"
              >
                {FORM_REFERENCE_DATA.campusPreferences.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Section 5: Web Presence & Supporting Documents */}
        <section className="form-section">
          <div className="section-header">
            <div className="section-icon">
              <Globe size={18} />
            </div>
            <div>
              <h2 className="section-title">5. Web Presence & Document Proofs</h2>
              <p className="section-desc">Strictly validated URLs for portfolios and cloud document repositories.</p>
            </div>
          </div>

          <div className="fields-grid">
            <div className="form-group">
              <label className="form-label">LinkedIn Profile URL</label>
              <input
                type="url"
                disabled={isLocked || isSubmitted}
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                placeholder="https://linkedin.com/in/username"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">GitHub / Portfolio URL</label>
              <input
                type="url"
                disabled={isLocked || isSubmitted}
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/username"
                className="form-input"
              />
            </div>

            <div className="form-group full-col">
              <label className="form-label">Supporting Documents Google Drive / Cloud Link</label>
              <input
                type="url"
                disabled={isLocked || isSubmitted}
                value={proofUrl}
                onChange={(e) => setProofUrl(e.target.value)}
                placeholder="https://drive.google.com/drive/folders/your-proofs"
                className="form-input"
              />
              <span className="input-hint">
                Folder containing scanned copies of 10th/12th certificate, Aadhaar, and category certificates.
              </span>
            </div>
          </div>

          {!isLocked && !isSubmitted && (
            <div className="statutory-declaration">
              <label className="declaration-label">
                <input
                  type="checkbox"
                  checked={declarationChecked}
                  onChange={(e) => setDeclarationChecked(e.target.checked)}
                />
                <span>
                  I hereby solemnly affirm that the particulars stated above are true and complete. I understand that once verified and approved by the Department Superior, these details are locked and can only be altered through a formal <strong>Data Change Request</strong> subject to superior sanction.
                </span>
              </label>
            </div>
          )}
        </section>

        {/* Form Actions */}
        {!isLocked && !isSubmitted && (
          <div className="onboarding-actions-bar">
            <button
              type="button"
              disabled={isSaving}
              onClick={() => handleSave(false)}
              className="btn-save-draft"
            >
              <Save size={16} /> Save Progress as Draft
            </button>

            <button
              type="button"
              disabled={isSaving}
              onClick={() => handleSave(true)}
              className="btn-submit-final"
            >
              <Send size={16} /> Submit to Superior for Final Approval
            </button>
          </div>
        )}

        {isSubmitted && (
          <div className="locked-notice">
            <Info size={18} />
            <span>
              Your profile is currently under review by your Department Faculty Advisor / HoD. You will receive an alert if any corrections are requested.
            </span>
          </div>
        )}

        {isLocked && (
          <div className="locked-notice approved">
            <CheckCircle2 size={18} />
            <span>
              This profile is verified and active in the system. Need to change any detail? Submit a formal{' '}
              <Link href="/student#change-requests" className="underline">
                Data Change Request
              </Link>{' '}
              for superior sign-off.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

