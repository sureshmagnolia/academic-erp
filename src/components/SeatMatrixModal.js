'use client';

import { useState, useEffect } from 'react';
import {
  SlidersHorizontal,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Save,
  RotateCcw,
  Sparkles,
  Info,
  X,
  Layers,
  GraduationCap,
  Building,
  Check,
  Percent,
} from 'lucide-react';
import { SEAT_RESERVATION_CATEGORIES } from '@/lib/constants';

export default function SeatMatrixModal({ program, onClose, onSaveSuccess }) {
  const [splitup, setSplitup] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const intakeCapacity = parseInt(program?.intake_capacity, 10) || 60;

  // Initialize from program.seat_matrix or fetch from API
  useEffect(() => {
    async function loadSeatMatrix() {
      if (!program?.id) return;
      setLoading(true);
      setErrorMsg('');

      try {
        const res = await fetch(`/api/seat-matrix?program_id=${encodeURIComponent(program.id)}`);
        const data = await res.json();

        if (res.ok && data.seat_matrix) {
          setSplitup(data.seat_matrix);
        } else {
          // Fallback to program prop or zeros
          const initial = {};
          SEAT_RESERVATION_CATEGORIES.forEach((cat) => {
            initial[cat.code] = program?.seat_matrix?.[cat.code] || 0;
          });
          setSplitup(initial);
        }
      } catch (err) {
        console.error('Error fetching seat matrix:', err);
        const initial = {};
        SEAT_RESERVATION_CATEGORIES.forEach((cat) => {
          initial[cat.code] = program?.seat_matrix?.[cat.code] || 0;
        });
        setSplitup(initial);
      } finally {
        setLoading(false);
      }
    }

    loadSeatMatrix();
  }, [program]);

  // Total seats currently allotted across all 15 categories
  const totalAllotted = Object.values(splitup).reduce(
    (sum, val) => sum + (parseInt(val, 10) || 0),
    0
  );

  const balance = intakeCapacity - totalAllotted;
  const isBalanced = totalAllotted === intakeCapacity;
  const isOverAllotted = totalAllotted > intakeCapacity;

  function handleSeatChange(code, deltaOrValue, isDelta = false) {
    setSplitup((prev) => {
      const current = parseInt(prev[code], 10) || 0;
      let nextVal = isDelta ? current + deltaOrValue : parseInt(deltaOrValue, 10);
      if (isNaN(nextVal) || nextVal < 0) nextVal = 0;
      return {
        ...prev,
        [code]: nextVal,
      };
    });
    setSuccessMsg('');
    setErrorMsg('');
  }

  // Automatic distribution based on statutory percentage guidelines
  function handleAutoDistribute() {
    const next = {};
    let allocatedSum = 0;

    // Distribute reserved categories first based on default percentage
    SEAT_RESERVATION_CATEGORIES.filter((c) => !c.isOpen).forEach((cat) => {
      const seats = Math.round((intakeCapacity * cat.defaultPct) / 100);
      next[cat.code] = seats;
      allocatedSum += seats;
    });

    // OPEN gets the remainder (aiming for ~50%)
    const openSeats = Math.max(0, intakeCapacity - allocatedSum);
    next['OPEN'] = openSeats;

    setSplitup(next);
    setSuccessMsg('Applied standard university reservation model proportions.');
  }

  function handleResetZeros() {
    const zeros = {};
    SEAT_RESERVATION_CATEGORIES.forEach((cat) => {
      zeros[cat.code] = 0;
    });
    setSplitup(zeros);
    setSuccessMsg('All reservation quotas cleared to zero.');
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/seat-matrix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          program_id: program.id,
          splitup,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg(
          `Pre-admission seat matrix for ${program.name} locked successfully (${totalAllotted}/${intakeCapacity} seats).`
        );
        if (onSaveSuccess) {
          onSaveSuccess(program.id, splitup, data);
        }
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setErrorMsg(data.error || 'Failed to save seat matrix');
      }
    } catch (err) {
      console.error('Save matrix error:', err);
      setErrorMsg('Network error saving seat matrix. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget && !saving) onClose();
      }}
    >
      <div className="modal-card seat-matrix-modal-card">
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-row">
            <SlidersHorizontal size={22} className="text-emerald" />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h3 style={{ margin: 0 }}>Pre-Admission Seat Split-Up</h3>
                <span className="prog-level-tag">{program?.level || 'UG'}</span>
                <span className="dept-code-tag">{program?.code}</span>
              </div>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.84rem', color: '#94a3b8' }}>
                {program?.name} &bull; {program?.department_name || program?.department_id}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={saving}
            className="btn-close-modal"
            aria-label="Close Modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Live Allocation Summary Banner */}
        <div className="seat-matrix-summary-banner">
          <div className="metric-box">
            <span className="metric-label">Sanctioned Intake</span>
            <span className="metric-val">{intakeCapacity} Seats</span>
          </div>

          <div className="metric-box">
            <span className="metric-label">Total Allotted</span>
            <span className={`metric-val ${isOverAllotted ? 'text-red' : isBalanced ? 'text-emerald' : 'text-amber'}`}>
              {totalAllotted} Seats
            </span>
          </div>

          <div className="metric-box status-metric">
            <span className="metric-label">Matrix Status</span>
            {isBalanced ? (
              <span className="status-pill balanced">
                <CheckCircle2 size={14} /> 100% Balanced ({intakeCapacity}/{intakeCapacity})
              </span>
            ) : isOverAllotted ? (
              <span className="status-pill overallocated">
                <AlertCircle size={14} /> Overallocated by {Math.abs(balance)} Seats!
              </span>
            ) : (
              <span className="status-pill unallocated">
                <AlertTriangle size={14} /> {balance} Seats Unallocated
              </span>
            )}
          </div>
        </div>

        {/* Visual Allocation Bar */}
        <div className="seat-matrix-progress-bar-container">
          <div
            className={`seat-matrix-progress-bar ${isOverAllotted ? 'over' : isBalanced ? 'perfect' : 'partial'}`}
            style={{ width: `${Math.min(100, (totalAllotted / intakeCapacity) * 100)}%` }}
          />
        </div>

        {/* Quick Toolbar */}
        <div className="matrix-toolbar">
          <span className="toolbar-hint">
            <Info size={14} /> <strong>OPEN</strong> is open to all applicants on pure merit; all other quotas reserve seats for specific social, economic, or affirmative categories.
          </span>
          <div className="toolbar-buttons">
            <button
              type="button"
              onClick={handleAutoDistribute}
              className="btn-toolbar-action"
              title="Auto-fill standard statutory percentages"
            >
              <Sparkles size={13} /> Auto-Distribute (Standard)
            </button>
            <button
              type="button"
              onClick={handleResetZeros}
              className="btn-toolbar-action secondary"
              title="Reset all categories to 0"
            >
              <RotateCcw size={13} /> Clear
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="matrix-alert error">
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="matrix-alert success">
            <CheckCircle2 size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Categories Matrix Form */}
        <form onSubmit={handleSave} className="seat-matrix-form">
          <div className="matrix-grid-container">
            {/* 1. OPEN MERIT CARD (SPECIAL HIGHLIGHT) */}
            {SEAT_RESERVATION_CATEGORIES.filter((c) => c.isOpen).map((cat) => {
              const currentSeats = splitup[cat.code] || 0;
              const pct = intakeCapacity > 0 ? ((currentSeats / intakeCapacity) * 100).toFixed(1) : '0';

              return (
                <div key={cat.code} className="category-card open-merit-card">
                  <div className="card-top-row">
                    <div className="cat-badge-wrap">
                      <span className="cat-code-badge open-badge">{cat.code}</span>
                      <span className="cat-open-tag">★ OPEN TO ALL MERIT</span>
                    </div>
                    <span className="cat-pct-chip">{pct}% of Intake</span>
                  </div>

                  <h4 className="cat-name">{cat.name}</h4>
                  <p className="cat-desc">{cat.desc}</p>

                  <div className="cat-input-stepper-row">
                    <button
                      type="button"
                      onClick={() => handleSeatChange(cat.code, -1, true)}
                      className="btn-stepper minus"
                      disabled={currentSeats <= 0}
                    >
                      &minus;
                    </button>
                    <input
                      type="number"
                      min="0"
                      max={intakeCapacity}
                      value={currentSeats}
                      onChange={(e) => handleSeatChange(cat.code, e.target.value, false)}
                      className="seat-number-input"
                    />
                    <button
                      type="button"
                      onClick={() => handleSeatChange(cat.code, 1, true)}
                      className="btn-stepper plus"
                    >
                      +
                    </button>
                    <span className="seats-unit-label">Seats</span>
                  </div>
                </div>
              );
            })}

            {/* 2. ALL OTHER 14 RESERVED CATEGORIES GRID */}
            <div className="reserved-categories-grid">
              {SEAT_RESERVATION_CATEGORIES.filter((c) => !c.isOpen).map((cat) => {
                const currentSeats = splitup[cat.code] || 0;
                const pct = intakeCapacity > 0 ? ((currentSeats / intakeCapacity) * 100).toFixed(1) : '0';

                return (
                  <div key={cat.code} className={`category-card reserved-card ${currentSeats > 0 ? 'allocated' : ''}`}>
                    <div className="card-top-row">
                      <span className={`cat-code-badge ${cat.badgeClass || 'badge-sebc'}`}>{cat.code}</span>
                      <span className="cat-pct-chip">{pct}%</span>
                    </div>

                    <h4 className="cat-name">{cat.name}</h4>
                    <p className="cat-desc">{cat.desc}</p>

                    <div className="cat-input-stepper-row">
                      <button
                        type="button"
                        onClick={() => handleSeatChange(cat.code, -1, true)}
                        className="btn-stepper minus"
                        disabled={currentSeats <= 0}
                      >
                        &minus;
                      </button>
                      <input
                        type="number"
                        min="0"
                        max={intakeCapacity}
                        value={currentSeats}
                        onChange={(e) => handleSeatChange(cat.code, e.target.value, false)}
                        className="seat-number-input"
                      />
                      <button
                        type="button"
                        onClick={() => handleSeatChange(cat.code, 1, true)}
                        className="btn-stepper plus"
                      >
                        +
                      </button>
                      <span className="seats-unit-label">Seats</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="modal-actions-bar">
            <div className="footer-status-hint">
              {isBalanced ? (
                <span className="hint-text balanced">
                  <Check size={14} /> Total allocated equals sanctioned intake ({intakeCapacity} seats).
                </span>
              ) : isOverAllotted ? (
                <span className="hint-text error">
                  <AlertCircle size={14} /> Warning: Allocated seats exceed sanctioned capacity by {Math.abs(balance)}.
                </span>
              ) : (
                <span className="hint-text warning">
                  <AlertTriangle size={14} /> Note: {balance} seats are unassigned and can be allocated to Open or Quotas.
                </span>
              )}
            </div>

            <div className="footer-button-group">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="btn-cancel"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className={`btn-primary-action ${!isBalanced ? 'btn-warning-action' : ''}`}
              >
                <Save size={16} />
                {saving ? 'Locking Seat Matrix...' : isBalanced ? 'Save & Lock Seat Matrix' : `Save Matrix (${totalAllotted}/${intakeCapacity})`}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
