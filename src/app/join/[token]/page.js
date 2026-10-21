'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useSearchParams, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  QrCode,
  GraduationCap,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowRight,
  User,
  Phone,
  Building,
  Hash,
  Send,
  Sparkles,
} from 'lucide-react';
import { DEPARTMENTS_CATALOG } from '@/lib/constants';

function JoinEnrollmentContent() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const params = useParams();

  const tokenString = params?.token || searchParams.get('token') || '';

  const [tokenData, setTokenData] = useState(null);
  const [tokenLoading, setTokenLoading] = useState(true);
  const [tokenError, setTokenError] = useState('');

  // Form State
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [admissionNo, setAdmissionNo] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [batchId, setBatchId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (session?.user?.name) {
      setFullName(session.user.name);
    }
  }, [session]);

  useEffect(() => {
    async function fetchTokenInfo() {
      if (!tokenString) {
        setTokenLoading(false);
        return;
      }
      try {
        const res = await fetch(`/api/admin/enrollment-tokens?token=${encodeURIComponent(tokenString)}`);
        const data = await res.json();
        if (res.ok && data.token) {
          setTokenData(data.token);
          setDepartmentId(data.token.department_id || '');
          setBatchId(data.token.batch_id || '');
        } else {
          setTokenError(data.error || 'Invalid or inactive enrollment token.');
        }
      } catch (err) {
        setTokenError('Failed to verify enrollment link.');
      } finally {
        setTokenLoading(false);
      }
    }
    fetchTokenInfo();
  }, [tokenString]);

  async function handleSubmitJoin(e) {
    e.preventDefault();
    setSubmitError('');

    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(mobileNumber.trim())) {
      setSubmitError('Please enter a valid 10-digit Indian mobile number (starting with 6, 7, 8, or 9).');
      return;
    }

    if (!fullName.trim() || !departmentId) {
      setSubmitError('Full name and department are mandatory.');
      return;
    }

    const applicationRef = admissionNo.trim() || `APP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/join-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token_string: tokenString,
          applicant_email: session.user.email,
          applicant_name: fullName.trim(),
          applicant_avatar: session.user.image || null,
          mobile_number: mobileNumber.trim(),
          requested_role: tokenData?.target_role || 'STUDENT',
          department_id: departmentId,
          batch_id: batchId,
          admission_or_emp_no: applicationRef,
        }),
      });

      const result = await res.json();
      if (res.ok && result.success) {
        setSubmitSuccess(true);
      } else {
        setSubmitError(result.error || 'Failed to submit join request.');
      }
    } catch (err) {
      setSubmitError('Network error while submitting join request.');
    } finally {
      setIsSubmitting(false);
    }
  }

  const deptMeta = DEPARTMENTS_CATALOG.find((d) => d.id === departmentId);

  return (
    <div className="join-page-wrapper">
      <div className="join-card">
        <div className="join-header">
          <div className="join-badge">
            <QrCode size={18} />
            <span>Official Candidate Self-Enrollment</span>
          </div>
          <h1 className="join-title">Academic Self-Enrollment</h1>
          <p className="join-subtitle">
            Authenticated via Google Workspace. Verify your identity once to request access from your Department Superior.
          </p>
        </div>

        {tokenLoading ? (
          <div className="join-token-alert loading">
            <Clock size={16} className="spin" /> Verifying enrollment authorization token...
          </div>
        ) : tokenError ? (
          <div className="join-token-alert error">
            <AlertCircle size={16} /> {tokenError}
          </div>
        ) : tokenData ? (
          <div className="join-token-alert success">
            <CheckCircle2 size={16} />
            <div>
              <strong>Authorized Program:</strong> {tokenData.title}
              <div className="token-submeta">
                Role: <strong>{tokenData.target_role}</strong> | Dept: <strong>{deptMeta?.name || tokenData.department_id}</strong>
              </div>
            </div>
          </div>
        ) : null}

        {status === 'loading' ? (
          <div className="join-loading-state">
            <Clock size={20} className="spin" /> Checking Google authentication...
          </div>
        ) : !session?.user ? (
          <div className="join-auth-prompt">
            <div className="auth-step-circle">1</div>
            <h3>Sign in with your Google Account</h3>
            <p>
              To uphold our <strong>&ldquo;Ask Once&rdquo;</strong> single source of truth, please authenticate with your official or personal Gmail address.
            </p>
            <button
              onClick={() => signIn('google', { callbackUrl: typeof window !== 'undefined' ? window.location.href : '/' })}
              className="btn-google-join"
            >
              <GraduationCap size={18} /> Sign In with Google to Continue
            </button>
          </div>
        ) : submitSuccess ? (
          <div className="join-success-view">
            <div className="success-icon-wrap">
              <CheckCircle2 size={48} />
            </div>
            <h2>Join Request Submitted!</h2>
            <p className="success-msg">
              Your enrollment request has been securely dispatched to the <strong>Department Superior (Faculty / HoD)</strong> for physical and document verification.
            </p>

            <div className="workflow-steps-box">
              <div className="wf-step done">
                <span className="wf-num">1</span>
                <span>Google Authentication Verified ({session.user.email})</span>
              </div>
              <div className="wf-step current">
                <span className="wf-num">2</span>
                <span>Department Superior Review & Approval (In Progress)</span>
              </div>
              <div className="wf-step pending">
                <span className="wf-num">3</span>
                <span>Master Onboarding Wizard (Ask Once Profile Lock)</span>
              </div>
            </div>

            <div className="success-actions">
              <Link href="/student" className="btn-primary">
                Go to Student Portal <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmitJoin} className="join-form">
            <div className="auth-user-bar">
              <div className="auth-avatar">
                {session.user.image ? (
                  <img src={session.user.image} alt={session.user.name} />
                ) : (
                  (session.user.name || session.user.email)[0].toUpperCase()
                )}
              </div>
              <div className="auth-details">
                <span className="auth-name">{session.user.name || 'Google User'}</span>
                <span className="auth-email">{session.user.email} (Verified Google ID)</span>
              </div>
            </div>

            {submitError && (
              <div className="form-error-alert">
                <AlertCircle size={16} /> {submitError}
              </div>
            )}

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">
                  <User size={15} /> Candidate Full Name (Official)
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="As per 10th / 12th Certificate"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Phone size={15} /> Mobile Number (10-Digit)
                </label>
                <div className="phone-input-wrap">
                  <span className="phone-prefix">+91</span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                    placeholder="9876543210"
                    className="form-input phone-field"
                  />
                </div>
                <span className="input-hint">Must be a valid 10-digit Indian mobile number.</span>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Hash size={15} /> Application Ref / CAP ID (Optional)
                </label>
                <input
                  type="text"
                  value={admissionNo}
                  onChange={(e) => setAdmissionNo(e.target.value)}
                  placeholder="e.g. CAP2026-BOT-8821 (Leave blank if not yet allotted)"
                  className="form-input"
                />
                <span className="input-hint">Official Permanent Admission Number will be granted by Principal's Office upon final approval.</span>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Building size={15} /> Department
                </label>
                <select
                  required
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                  className="form-select"
                >
                  <option value="">-- Choose Academic Department --</option>
                  {DEPARTMENTS_CATALOG.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button type="submit" disabled={isSubmitting} className="btn-submit-join">
              {isSubmitting ? (
                <>
                  <Clock size={16} className="spin" /> Dispatching Request...
                </>
              ) : (
                <>
                  <Send size={16} /> Submit Join Request to Superior
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function JoinEnrollmentPage() {
  return (
    <Suspense
      fallback={
        <div className="join-page-wrapper">
          <div className="join-card">
            <div className="join-loading-state">
              <Clock size={24} className="spin" /> Loading Enrollment Portal...
            </div>
          </div>
        </div>
      }
    >
      <JoinEnrollmentContent />
    </Suspense>
  );
}
