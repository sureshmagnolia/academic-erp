'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
  Microscope,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  UserCheck,
  FileText,
  ShieldCheck,
  Send,
  Building,
} from 'lucide-react';

export default function ResearchPage() {
  const { data: session, status } = useSession();
  const [scholars, setScholars] = useState([]);
  const [loading, setLoading] = useState(true);

  const roles = session?.user?.roles?.map((r) => (typeof r === 'string' ? r : r.code)) || [];
  const activeRole = session?.user?.activeRole || session?.user?.role || 'STUDENT';
  const isSupervisor = activeRole === 'RESEARCH_SUPERVISOR' || roles.includes('RESEARCH_SUPERVISOR') || roles.includes('ADMIN');
  const isScholar = activeRole === 'RESEARCH_SCHOLAR' || roles.includes('RESEARCH_SCHOLAR');

  useEffect(() => {
    fetch('/api/admin/scholars')
      .then((res) => res.json())
      .then((data) => {
        if (data.scholars) setScholars(data.scholars);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (status === 'loading' || loading) {
    return <div className="student-loading-container"><div className="spinner"></div><p>Loading Research Management Portal...</p></div>;
  }

  return (
    <div className="admin-dashboard-container">
      {/* Research Header */}
      <div className="dashboard-header">
        <div>
          <div className="role-tag" style={{ backgroundColor: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', border: '1px solid rgba(168, 85, 247, 0.3)' }}>
            <Microscope size={14} />
            <span>Doctoral & Research Studies Portal</span>
          </div>
          <h1>PhD & Research Scholars Management</h1>
          <p className="dashboard-subtitle">
            Supervisory oversight, doctoral committee reviews, milestone tracking, and fellowship records.
          </p>
        </div>
      </div>

      {/* Supervisor View */}
      {isSupervisor && (
        <div className="table-section-card" style={{ marginBottom: '2rem' }}>
          <div className="card-header">
            <div className="card-header-left">
              <h2>Assigned Research Scholars under Your Supervision</h2>
              <span className="badge-count">{scholars.length} Active Scholars</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
              Review research proposals, track doctoral milestones, and approve semester progress submissions.
            </p>
          </div>

          <div className="table-responsive">
            <table className="roster-table">
              <thead>
                <tr>
                  <th>Scholar Details</th>
                  <th>Registration No</th>
                  <th>Approved Research Title</th>
                  <th>Scholar Type</th>
                  <th>Milestone Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {scholars.length > 0 ? (
                  scholars.map((sc) => (
                    <tr key={sc.id || sc.scholar_email}>
                      <td>
                        <strong>{sc.scholar_name || 'Scholar'}</strong>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{sc.scholar_email}</div>
                      </td>
                      <td><code>{sc.registration_no || 'PHD-CS-2025-004'}</code></td>
                      <td style={{ maxWidth: '280px' }}>
                        <span style={{ fontSize: '0.84rem' }}>{sc.research_title || 'Distributed Machine Learning Systems'}</span>
                      </td>
                      <td>
                        <span className="badge-term">{sc.scholar_type || 'FULL_TIME'}</span>
                      </td>
                      <td>
                        <span className="status-pill status-active">
                          {sc.status || 'COURSEWORK'}
                        </span>
                      </td>
                      <td>
                        <button className="btn btn-primary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}>
                          <CheckCircle2 size={14} />
                          <span>Review Progress</span>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="table-empty">
                      No research scholars currently registered under your supervisor profile.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Research Scholar Personal Profile Card */}
      <div className="features-grid">
        <div className="feature-card">
          <div className="feature-icon admin-icon">
            <UserCheck size={24} />
          </div>
          <h3>Supervisory Committee</h3>
          <div style={{ marginTop: '0.75rem', fontSize: '0.88rem', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div><strong>Principal Supervisor:</strong> Dr. Ramesh Kumar (Professor, CSE)</div>
            <div><strong>Co-Supervisor:</strong> Dr. S. Ananth (External Adjunct)</div>
            <div><strong>Doctoral Committee:</strong> 3 Independent Subject Experts</div>
          </div>
        </div>

        <div className="feature-card">
          <div className="feature-icon google-icon">
            <Clock size={24} />
          </div>
          <h3>PhD Milestone Roadmap</h3>
          <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.82rem' }}>
            <div style={{ color: '#34d399' }}>✓ Phase 1: Coursework (Completed - 12 Credits)</div>
            <div style={{ color: '#38bdf8' }}>● Phase 2: Comprehensive Viva Examination (In Progress)</div>
            <div style={{ color: '#64748b' }}>○ Phase 3: Research Colloquium & Synopsis</div>
            <div style={{ color: '#64748b' }}>○ Phase 4: Thesis Submission & Defense</div>
          </div>
        </div>

        <div className="feature-card">
          <div className="feature-icon db-icon">
            <Award size={24} />
          </div>
          <h3>Fellowship & Grants</h3>
          <div style={{ marginTop: '0.75rem', fontSize: '0.88rem', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <div><strong>Funding Category:</strong> Institute Research Fellowship</div>
            <div><strong>Monthly Stipend:</strong> Disbursed up to date</div>
            <div><strong>Annual Contingency:</strong> ₹50,000 / year allocated</div>
          </div>
        </div>
      </div>
    </div>
  );
}
