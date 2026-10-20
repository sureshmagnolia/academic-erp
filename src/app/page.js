'use client';

import { useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import Link from 'next/link';
import {
  GraduationCap,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Search,
  ArrowRight,
  Database,
  Lock,
  Sparkles,
} from 'lucide-react';

export default function HomePage() {
  const { data: session } = useSession();
  const [checkEmail, setCheckEmail] = useState('');
  const [checkResult, setCheckResult] = useState(null);
  const [checking, setChecking] = useState(false);

  // Demo login handler for rapid local testing
  const [demoEmail, setDemoEmail] = useState('student.demo@gmail.com');
  const [demoRole, setDemoRole] = useState('STUDENT');
  const [demoLoading, setDemoLoading] = useState(false);

  async function handleCheckEmail(e) {
    e.preventDefault();
    if (!checkEmail.trim()) return;

    setChecking(true);
    setCheckResult(null);

    try {
      const res = await fetch(`/api/check-whitelist?email=${encodeURIComponent(checkEmail.trim())}`);
      const data = await res.json();
      setCheckResult(data);
    } catch {
      setCheckResult({
        allowed: false,
        message: 'Could not contact whitelist server. Please try again.',
      });
    } finally {
      setChecking(false);
    }
  }

  async function handleDemoLogin(email, role) {
    setDemoLoading(true);
    await signIn('demo-login', {
      email,
      role,
      callbackUrl: role === 'ADMIN' ? '/admin' : '/student',
    });
    setDemoLoading(false);
  }

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-badge">
          <Sparkles size={14} className="hero-badge-icon" />
          <span>Next-Generation Academic ERP</span>
        </div>

        <h1 className="hero-title">
          Secure College Student Management & <span className="highlight-text">Google Auth Portal</span>
        </h1>

        <p className="hero-description">
          Administrators add student Gmail addresses to the accepted list. Only verified, enrolled
          students can authenticate via their Google Account to view marks, attendance, and records.
        </p>

        {/* Hero CTA */}
        <div className="hero-actions">
          {session ? (
            <div className="logged-in-box">
              <p className="logged-in-welcome">
                Signed in as <strong>{session.user.name}</strong> ({session.user.email})
              </p>
              <div className="logged-in-buttons">
                {session.user.role === 'ADMIN' ? (
                  <Link href="/admin" className="btn btn-primary">
                    <ShieldCheck size={18} />
                    <span>Go to Admin Console</span>
                    <ArrowRight size={16} />
                  </Link>
                ) : (
                  <Link href="/student" className="btn btn-primary">
                    <GraduationCap size={18} />
                    <span>Go to Student Portal</span>
                    <ArrowRight size={16} />
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <div className="guest-hero-cta">
              <button
                onClick={() => signIn('google', { callbackUrl: '/student' })}
                className="btn btn-google-hero"
              >
                <svg className="google-svg" viewBox="0 0 24 24" width="20" height="20">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Sign in with Google</span>
              </button>
              <p className="cta-note">Only accepted student & admin accounts will be granted entry.</p>
            </div>
          )}
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section className="features-grid">
        <div className="feature-card">
          <div className="feature-icon admin-icon">
            <ShieldCheck size={26} />
          </div>
          <h3>Admin Whitelist Control</h3>
          <p>
            Admins have total authority to add, update, suspend, or remove student Gmail addresses from
            the accepted roster.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon google-icon">
            <Lock size={26} />
          </div>
          <h3>Secure OAuth 2.0 Login</h3>
          <p>
            Zero passwords to remember. Students authenticate seamlessly via Google Sign-In with instant
            roster verification.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon db-icon">
            <Database size={26} />
          </div>
          <h3>Vercel Postgres Ready</h3>
          <p>
            Built for serverless PostgreSQL deployment on Vercel with automatic table provisioning and
            resilient data persistence.
          </p>
        </div>
      </section>

      {/* Interactive Whitelist Checker Tool */}
      <section className="checker-section">
        <div className="checker-card">
          <div className="checker-header">
            <Search className="checker-title-icon" size={22} />
            <div>
              <h3>Check Whitelist Verification Status</h3>
              <p>Type any Gmail address to verify if it is enrolled in the accepted database.</p>
            </div>
          </div>

          <form onSubmit={handleCheckEmail} className="checker-form">
            <input
              type="email"
              value={checkEmail}
              onChange={(e) => setCheckEmail(e.target.value)}
              placeholder="e.g. student.demo@gmail.com"
              className="checker-input"
              required
            />
            <button type="submit" disabled={checking} className="btn btn-secondary">
              {checking ? 'Checking...' : 'Verify Email'}
            </button>
          </form>

          {checkResult && (
            <div className={`checker-result ${checkResult.allowed ? 'result-success' : 'result-denied'}`}>
              <div className="result-header">
                {checkResult.allowed ? (
                  <CheckCircle2 size={24} className="result-icon-success" />
                ) : (
                  <XCircle size={24} className="result-icon-denied" />
                )}
                <div>
                  <h4>{checkResult.allowed ? 'Access Permitted' : 'Access Restricted'}</h4>
                  <p>{checkResult.message}</p>
                </div>
              </div>
              {checkResult.allowed && checkResult.name && (
                <div className="result-details">
                  <span>
                    <strong>Student:</strong> {checkResult.name}
                  </span>
                  <span>
                    <strong>Roll No:</strong> {checkResult.roll_no || 'Pending'}
                  </span>
                  <span>
                    <strong>Department:</strong> {checkResult.department || 'General'}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Local Testing & Demo Simulation Helper */}
      <section className="demo-helper-section">
        <div className="demo-helper-card">
          <div className="demo-header">
            <span className="demo-tag">Quick Dev Test</span>
            <h3>Immediate Local Testing</h3>
            <p>
              Test the application workflows immediately without waiting for Google OAuth credentials:
            </p>
          </div>

          <div className="demo-actions">
            <button
              onClick={() => handleDemoLogin('student.demo@gmail.com', 'STUDENT')}
              disabled={demoLoading}
              className="btn btn-outline"
            >
              Sign In as Demo Student (Alex Johnson)
            </button>
            <button
              onClick={() => handleDemoLogin('admin@college.edu', 'ADMIN')}
              disabled={demoLoading}
              className="btn btn-outline admin-outline"
            >
              Sign In as Demo Administrator
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
