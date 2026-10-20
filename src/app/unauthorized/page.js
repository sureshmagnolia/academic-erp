'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { signOut, signIn } from 'next-auth/react';
import Link from 'next/link';
import { AlertTriangle, ArrowLeft, RefreshCw, Mail, ShieldAlert, Settings, Terminal } from 'lucide-react';

function UnauthorizedContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const error = searchParams.get('error');
  const [liveError, setLiveError] = useState(null);

  useEffect(() => {
    fetch('/api/auth/last-error')
      .then((res) => res.json())
      .then((data) => {
        if (data?.lastError) setLiveError(data.lastError);
      })
      .catch(() => {});
  }, []);

  const isConfigurationError = error === 'Configuration';

  if (isConfigurationError) {
    return (
      <div className="unauthorized-card">
        <div
          className="unauthorized-icon-wrapper"
          style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)', borderColor: 'rgba(245, 158, 11, 0.4)' }}
        >
          <Settings size={44} style={{ color: '#f59e0b' }} />
        </div>

        <h1 className="unauthorized-title" style={{ color: '#fbbf24' }}>
          Server Configuration Needed
        </h1>

        <p className="unauthorized-message">
          Google OAuth redirected successfully, but the server encountered a configuration issue.
        </p>

        {liveError && typeof liveError === 'object' && (
          <div
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              padding: '1rem',
              borderRadius: '8px',
              textAlign: 'left',
              marginBottom: '1.5rem',
              fontSize: '0.82rem',
              fontFamily: 'monospace',
              color: '#f87171',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem', color: '#fca5a5', fontWeight: 'bold' }}>
              <Terminal size={14} />
              <span>Exact Server Error Diagnostic:</span>
            </div>
            <div><strong>Name:</strong> {liveError.name}</div>
            <div><strong>Message:</strong> {liveError.message}</div>
            {liveError.cause && <div><strong>Cause:</strong> {liveError.cause}</div>}
          </div>
        )}

        <div className="unauthorized-instructions">
          <h3>Steps to resolve in Vercel:</h3>
          <ol>
            <li>
              Go to your project in the <strong>Vercel Dashboard</strong> &gt; <strong>Settings</strong> &gt; <strong>Environment Variables</strong>.
            </li>
            <li>
              Verify that <strong><code>AUTH_GOOGLE_SECRET</code></strong> is added (starts with <code>GOCSPX-</code>).
            </li>
            <li>
              Verify that <strong><code>AUTH_SECRET</code></strong> is added.
            </li>
            <li>
              Go to <strong>Deployments</strong> &gt; Click <strong>...</strong> on the latest build &gt; <strong>Redeploy</strong>.
            </li>
          </ol>
        </div>

        <div className="unauthorized-actions">
          <Link href="/" className="btn btn-secondary">
            <ArrowLeft size={16} />
            <span>Back to Home</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="unauthorized-card">
      <div className="unauthorized-icon-wrapper">
        <ShieldAlert size={48} className="unauthorized-icon" />
      </div>

      <h1 className="unauthorized-title">Access Restricted</h1>

      <div className="unauthorized-email-box">
        <Mail size={16} />
        <span>{email || 'Your Google Account'}</span>
      </div>

      <p className="unauthorized-message">
        This Gmail account is not currently listed in the accepted students directory.
      </p>

      <div className="unauthorized-instructions">
        <h3>How to gain access:</h3>
        <ol>
          <li>
            Contact the <strong>Academic Administration Office</strong> or your Department Coordinator.
          </li>
          <li>
            Provide your <strong>Official Student ID / Roll Number</strong> and this exact Gmail address.
          </li>
          <li>
            Once the Admin enrolls your Gmail into the accepted list, you will be able to log in immediately.
          </li>
        </ol>
      </div>

      <div className="unauthorized-actions">
        <button
          onClick={() => {
            signOut({ redirect: false });
            signIn('google');
          }}
          className="btn btn-primary"
        >
          <RefreshCw size={16} />
          <span>Try Another Account</span>
        </button>

        <Link href="/" className="btn btn-secondary">
          <ArrowLeft size={16} />
          <span>Back to Home</span>
        </Link>
      </div>

      {error && (
        <p className="unauthorized-debug">
          Error Code: <code>{error}</code>
        </p>
      )}
    </div>
  );
}

export default function UnauthorizedPage() {
  return (
    <div className="unauthorized-container">
      <Suspense fallback={<div className="loading-state">Checking authorization...</div>}>
        <UnauthorizedContent />
      </Suspense>
    </div>
  );
}
