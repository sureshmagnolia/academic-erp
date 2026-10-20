import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import {
  createDataChangeRequest,
  listDataChangeRequests,
  reviewDataChangeRequest,
} from '@/lib/db';

export async function GET(req) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status') || undefined;
  const user_email = searchParams.get('user_email') || undefined;
  const department_id = searchParams.get('department_id') || undefined;

  const roles = session.user.roles?.map((r) => (typeof r === 'string' ? r : r.code)) || [];
  const isSuperior = roles.some((r) => ['ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY'].includes(r));

  // If regular student or non-superior, only list their own change requests
  if (!isSuperior) {
    const list = await listDataChangeRequests({ user_email: session.user.email });
    return NextResponse.json({ changeRequests: list });
  }

  const list = await listDataChangeRequests({ status, department_id, user_email });
  return NextResponse.json({ changeRequests: list });
}

export async function POST(req) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      field_name,
      field_label,
      current_value,
      proposed_value,
      justification,
      document_proof_url,
    } = body;

    if (!field_name || !proposed_value || !justification) {
      return NextResponse.json({
        error: 'Field, proposed value, and justification are mandatory for change requests',
      }, { status: 400 });
    }

    const created = await createDataChangeRequest({
      user_email: session.user.email,
      user_name: session.user.name,
      user_role: session.user.activeRole || session.user.role || 'STUDENT',
      department_id: session.user.profile?.department || null,
      field_name,
      field_label: field_label || field_name,
      current_value: String(current_value || ''),
      proposed_value: String(proposed_value),
      justification,
      document_proof_url,
    });

    return NextResponse.json({ success: true, changeRequest: created });
  } catch (err) {
    console.error('Error creating change request:', err);
    return NextResponse.json({ error: 'Failed to create change request' }, { status: 500 });
  }
}

export async function PATCH(req) {
  const session = await auth();
  const roles = session?.user?.roles?.map((r) => (typeof r === 'string' ? r : r.code)) || [];
  const isSuperior = roles.some((r) => ['ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY'].includes(r));

  if (!isSuperior) {
    return NextResponse.json({ error: 'Unauthorized: Superior approval required' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { request_id, action, reviewer_comments } = body;

    if (!request_id || !action) {
      return NextResponse.json({ error: 'Request ID and Action are required' }, { status: 400 });
    }

    const updated = await reviewDataChangeRequest({
      request_id,
      action,
      reviewed_by: session.user.email,
      reviewer_comments,
    });

    return NextResponse.json({ success: true, changeRequest: updated });
  } catch (err) {
    console.error('Error reviewing change request:', err);
    return NextResponse.json({ error: 'Failed to review change request' }, { status: 500 });
  }
}
