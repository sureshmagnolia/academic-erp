import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import {
  listEnrollmentTokens,
  createEnrollmentToken,
  toggleEnrollmentToken,
  getEnrollmentToken,
} from '@/lib/db';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');

  if (token) {
    const record = await getEnrollmentToken(token);
    if (!record) {
      return NextResponse.json({ error: 'Token not found or expired' }, { status: 404 });
    }
    return NextResponse.json({ token: record });
  }

  const session = await auth();
  const roles = session?.user?.roles?.map((r) => (typeof r === 'string' ? r : r.code)) || [];
  const isSuperior = roles.some((r) => ['ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY'].includes(r));

  if (!isSuperior) {
    return NextResponse.json({ error: 'Unauthorized: Superior or Admin privilege required' }, { status: 403 });
  }

  const tokens = await listEnrollmentTokens();
  return NextResponse.json({ tokens });
}

export async function POST(req) {
  const session = await auth();
  const roles = session?.user?.roles?.map((r) => (typeof r === 'string' ? r : r.code)) || [];
  const isSuperior = roles.some((r) => ['ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY'].includes(r));

  if (!isSuperior) {
    return NextResponse.json({ error: 'Unauthorized: Superior or Admin privilege required' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { title, target_role, department_id, batch_id, max_uses, expires_hours } = body;

    if (!title || !department_id) {
      return NextResponse.json({ error: 'Title and Department are required' }, { status: 400 });
    }

    const created = await createEnrollmentToken({
      title,
      target_role: target_role || 'STUDENT',
      department_id,
      batch_id: batch_id || null,
      max_uses: parseInt(max_uses, 10) || 100,
      expires_hours: parseInt(expires_hours, 10) || 72,
      created_by: session.user.email,
    });

    return NextResponse.json({ success: true, token: created });
  } catch (err) {
    console.error('Error creating enrollment token:', err);
    return NextResponse.json({ error: 'Failed to create enrollment token' }, { status: 500 });
  }
}

export async function PATCH(req) {
  const session = await auth();
  const roles = session?.user?.roles?.map((r) => (typeof r === 'string' ? r : r.code)) || [];
  const isSuperior = roles.some((r) => ['ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY'].includes(r));

  if (!isSuperior) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { tokenId, isActive } = body;

    if (!tokenId || isActive === undefined) {
      return NextResponse.json({ error: 'Token ID and active status required' }, { status: 400 });
    }

    await toggleEnrollmentToken(tokenId, isActive);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Error updating enrollment token:', err);
    return NextResponse.json({ error: 'Failed to update token' }, { status: 500 });
  }
}
