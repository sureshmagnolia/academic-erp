import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import {
  listEnrollmentTokens,
  createEnrollmentToken,
  toggleEnrollmentToken,
  updateEnrollmentToken,
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
    const { title, target_role, department_id, batch_id, max_uses, expires_hours, expires_at } = body;

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
      expires_at: expires_at || null,
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
    const { tokenId, isActive, expiresAt, additionalHours, maxUses } = body;

    if (!tokenId) {
      return NextResponse.json({ error: 'Token ID is required' }, { status: 400 });
    }

    let finalExpiresAt = expiresAt ? new Date(expiresAt).toISOString() : undefined;
    if (!finalExpiresAt && additionalHours) {
      const existing = await getEnrollmentToken(tokenId);
      const base = existing && new Date(existing.expires_at) > new Date() ? new Date(existing.expires_at) : new Date();
      finalExpiresAt = new Date(base.getTime() + parseInt(additionalHours, 10) * 3600000).toISOString();
    }

    const updates = {};
    if (finalExpiresAt !== undefined) {
      updates.expires_at = finalExpiresAt;
      // Extending validity re-activates the token unless specifically deactivated
      if (isActive === undefined) {
        updates.is_active = true;
      }
    }
    if (isActive !== undefined) {
      updates.is_active = isActive;
    }
    if (maxUses !== undefined) {
      updates.max_uses = parseInt(maxUses, 10);
    }

    const updated = await updateEnrollmentToken(tokenId, updates);
    return NextResponse.json({ success: true, token: updated });
  } catch (err) {
    console.error('Error updating enrollment token:', err);
    return NextResponse.json({ error: 'Failed to update token' }, { status: 500 });
  }
}
