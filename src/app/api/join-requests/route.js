import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import {
  createJoinRequest,
  listJoinRequests,
  reviewJoinRequest,
  getEnrollmentToken,
  getJoinRequestsByEmail,
} from '@/lib/db';

export async function GET(req) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const myRequestsOnly = searchParams.get('mine') === 'true';

  const roles = session?.user?.roles?.map((r) => (typeof r === 'string' ? r : r.code)) || [];
  const isSuperior = roles.some((r) => ['ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY'].includes(r));

  if (myRequestsOnly || !isSuperior) {
    const myRequests = await getJoinRequestsByEmail(session.user.email);
    return NextResponse.json({ requests: myRequests });
  }

  const status = searchParams.get('status') || 'PENDING';
  const department_id = searchParams.get('department_id') || undefined;

  const requests = await listJoinRequests({ status, department_id });
  return NextResponse.json({ requests });
}

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      token_string,
      applicant_email,
      applicant_name,
      applicant_avatar,
      mobile_number,
      requested_role,
      department_id,
      batch_id,
      admission_or_emp_no,
    } = body;

    if (!applicant_email || !applicant_name || !department_id) {
      return NextResponse.json({ error: 'Email, Name, and Department are required' }, { status: 400 });
    }

    // Verify token if provided
    let tokenId = null;
    if (token_string) {
      const tokenRec = await getEnrollmentToken(token_string);
      if (!tokenRec || !tokenRec.is_active) {
        return NextResponse.json({ error: 'Enrollment QR / Link is inactive or invalid' }, { status: 400 });
      }
      if (new Date(tokenRec.expires_at) < new Date()) {
        return NextResponse.json({ error: 'Enrollment QR / Link has expired' }, { status: 400 });
      }
      if (tokenRec.used_count >= tokenRec.max_uses) {
        return NextResponse.json({ error: 'Maximum enrollment limit reached for this QR / Link' }, { status: 400 });
      }
      tokenId = tokenRec.id;
    }

    const created = await createJoinRequest({
      token_id: tokenId,
      applicant_email,
      applicant_name,
      applicant_avatar,
      mobile_number,
      requested_role: requested_role || 'STUDENT',
      department_id,
      batch_id,
      admission_or_emp_no,
    });

    return NextResponse.json({ success: true, request: created });
  } catch (err) {
    console.error('Error creating join request:', err);
    return NextResponse.json({ error: 'Failed to submit join request' }, { status: 500 });
  }
}

export async function PATCH(req) {
  const session = await auth();
  const roles = session?.user?.roles?.map((r) => (typeof r === 'string' ? r : r.code)) || [];
  const isSuperior = roles.some((r) => ['ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY'].includes(r));

  if (!isSuperior) {
    return NextResponse.json({ error: 'Unauthorized: Superior review required' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { request_id, action, superior_notes } = body;

    if (!request_id || !action) {
      return NextResponse.json({ error: 'Request ID and Action are required' }, { status: 400 });
    }

    const updated = await reviewJoinRequest({
      request_id,
      action,
      reviewed_by: session.user.email,
      superior_notes,
    });

    return NextResponse.json({ success: true, request: updated });
  } catch (err) {
    console.error('Error reviewing join request:', err);
    return NextResponse.json({ error: 'Failed to review request' }, { status: 500 });
  }
}
