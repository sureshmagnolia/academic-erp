import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import {
  listAdmissionDossiers,
  processAdmissionVerificationStep,
  issueStudentTransferCertificate,
  updateAlumniProfile,
  getUserProfile,
} from '@/lib/db';

export async function GET(req) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const stage = searchParams.get('stage') || 'ALL';
    const department_id = searchParams.get('department_id') || null;
    const status = searchParams.get('status') || null;
    const search = searchParams.get('search') || '';

    const rawRoles = session.user.roles || [];
    const roles = rawRoles.map((r) => (typeof r === 'string' ? r : r.code));
    const isAdmin = session.user.role === 'ADMIN' || roles.includes('ADMIN') || roles.includes('PRINCIPAL');
    const isHodOrFaculty = roles.includes('HOD') || roles.includes('FACULTY');

    // If HoD/Faculty and not admin, scope to their department if stage is DEPT_LEVEL
    let scopedDept = department_id;
    if (!isAdmin && isHodOrFaculty && !scopedDept) {
      scopedDept = session.user.department;
    }

    const dossiers = await listAdmissionDossiers({
      stage,
      department_id: scopedDept,
      status,
      search,
    });

    return NextResponse.json({ dossiers });
  } catch (err) {
    console.error('Error fetching admission dossiers:', err);
    return NextResponse.json({ error: 'Failed to fetch admission dossiers' }, { status: 500 });
  }
}

export async function POST(req) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const rawRoles = session.user.roles || [];
  const roles = rawRoles.map((r) => (typeof r === 'string' ? r : r.code));
  const activeRole = session.user.activeRole || session.user.role || 'STUDENT';
  const isAdminOrPrincipal =
    session.user.role === 'ADMIN' ||
    activeRole === 'ADMIN' ||
    activeRole === 'PRINCIPAL' ||
    roles.includes('ADMIN') ||
    roles.includes('PRINCIPAL');

  try {
    const body = await req.json();
    const { action, email } = body;

    if (!email) {
      return NextResponse.json({ error: 'Candidate email is required' }, { status: 400 });
    }

    // 1. ALUMNI PROFILE UPDATE
    if (action === 'UPDATE_ALUMNI') {
      const isSelf = session.user.email.toLowerCase() === email.toLowerCase();
      if (!isSelf && !isAdminOrPrincipal) {
        return NextResponse.json({ error: 'Unauthorized to update alumni profile' }, { status: 403 });
      }

      const { current_status, organization, higher_studies, city } = body;
      const updated = await updateAlumniProfile({
        email,
        current_status,
        organization,
        higher_studies,
        city,
      });
      return NextResponse.json({ success: true, profile: updated, message: 'Alumni record updated successfully!' });
    }

    // 2. PRINCIPAL'S EXCLUSIVE TC ISSUANCE
    if (action === 'ISSUE_TC') {
      if (!isAdminOrPrincipal) {
        return NextResponse.json(
          { error: 'Unauthorized: Transfer Certificate (TC) can be issued exclusively by the Office of the Principal.' },
          { status: 403 }
        );
      }

      const { tc_serial_no, reason } = body;
      const updated = await issueStudentTransferCertificate({
        email,
        issued_by: session.user.email,
        tc_serial_no: tc_serial_no || '',
        reason: reason || 'Course Completed / Relieved upon request',
      });

      return NextResponse.json({
        success: true,
        profile: updated,
        message: `Transfer Certificate (${updated.tc_serial_no}) issued successfully. Student status transitioned to Alumni.`,
      });
    }

    // 3. MULTI-STEP ADMISSION VERIFICATION (Steps 1 to 4)
    const { step, verification_action, notes, pta_receipt_no, pta_amount, official_admission_no } = body;

    // Check Role Permissions for each specific verification stage:
    if (step === 1 || step === 'DEPT_LEVEL') {
      const isHodOrFaculty = activeRole === 'HOD' || activeRole === 'FACULTY' || roles.includes('HOD') || roles.includes('FACULTY');
      if (!isAdminOrPrincipal && !isHodOrFaculty) {
        return NextResponse.json(
          { error: 'Unauthorized: Department Level Verification requires Department Faculty Advisor, Tutor, or HoD.' },
          { status: 403 }
        );
      }
    } else if (step === 2 || step === 'NODAL_DESK') {
      const isNodal = activeRole === 'ADMISSION_NODAL_OFFICER' || roles.includes('ADMISSION_NODAL_OFFICER');
      if (!isAdminOrPrincipal && !isNodal) {
        return NextResponse.json(
          { error: 'Unauthorized: Admission Nodal Desk verification requires Admission Nodal Officer credentials.' },
          { status: 403 }
        );
      }
    } else if (step === 3 || step === 'PTA_DESK') {
      const isPta = activeRole === 'PTA_OFFICIAL' || roles.includes('PTA_OFFICIAL');
      if (!isAdminOrPrincipal && !isPta) {
        return NextResponse.json(
          { error: 'Unauthorized: PTA Fee Remittance verification requires PTA Official or Cashier credentials.' },
          { status: 403 }
        );
      }
    } else if (step === 4 || step === 'PRINCIPAL_DESK') {
      if (!isAdminOrPrincipal) {
        return NextResponse.json(
          { error: 'Unauthorized: Final executive approval and official admission number allotment requires Office of the Principal.' },
          { status: 403 }
        );
      }
    }

    const updated = await processAdmissionVerificationStep({
      email,
      step,
      action: verification_action || 'APPROVE',
      verified_by: session.user.email,
      notes: notes || '',
      pta_receipt_no: pta_receipt_no || '',
      pta_amount: pta_amount || 0,
      official_admission_no: official_admission_no || '',
    });

    return NextResponse.json({
      success: true,
      profile: updated,
      message:
        verification_action === 'REVISE'
          ? 'Dossier flagged for candidate correction.'
          : step === 4
          ? `Final Admission Approved! Permanent Admission No: ${updated.official_admission_no}`
          : 'Verification step signed off successfully.',
    });
  } catch (err) {
    console.error('Error in admission verification:', err);
    return NextResponse.json({ error: err.message || 'Verification processing failed' }, { status: 500 });
  }
}
