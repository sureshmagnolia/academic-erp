import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import {
  MASTER_ROLES,
  listAllUsers,
  createOrUpdateUser,
  assignRoleToUser,
  removeRoleFromUser,
} from '@/lib/db';

export async function GET() {
  const session = await auth();
  const isAdmin = session?.user?.role === 'ADMIN' || session?.user?.roles?.some((r) => r.code === 'ADMIN' || r.code === 'PRINCIPAL');

  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 });
  }

  try {
    const users = await listAllUsers();
    return NextResponse.json({
      masterRoles: MASTER_ROLES,
      users,
    });
  } catch (err) {
    console.error('Error in /api/admin/roles GET:', err);
    return NextResponse.json({ error: 'Failed to fetch roles & users' }, { status: 500 });
  }
}

export async function POST(req) {
  const session = await auth();
  const isAdmin = session?.user?.role === 'ADMIN' || session?.user?.roles?.some((r) => r.code === 'ADMIN' || r.code === 'PRINCIPAL');

  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      email,
      name,
      phone,
      primary_type,
      department,
      designation,
      role_code,
      scope_entity_type,
      scope_entity_id,
    } = body;

    if (!email || !role_code) {
      return NextResponse.json({ error: 'Email and Role Code are required' }, { status: 400 });
    }

    // 1. Ensure user profile exists
    await createOrUpdateUser({
      email,
      name: name || email.split('@')[0],
      phone,
      primary_type: primary_type || 'FACULTY',
      department,
      designation,
    });

    // 2. Assign the role
    await assignRoleToUser({
      email,
      role_code,
      department,
      scope_entity_type,
      scope_entity_id,
    });

    return NextResponse.json({ success: true, message: `Role ${role_code} assigned to ${email}` });
  } catch (err) {
    console.error('Error assigning role:', err);
    return NextResponse.json({ error: 'Failed to assign role' }, { status: 500 });
  }
}

export async function DELETE(req) {
  const session = await auth();
  const isAdmin = session?.user?.role === 'ADMIN' || session?.user?.roles?.some((r) => r.code === 'ADMIN' || r.code === 'PRINCIPAL');

  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');
    const role_code = searchParams.get('role_code');
    const scope_entity_id = searchParams.get('scope_entity_id');

    if (!email || !role_code) {
      return NextResponse.json({ error: 'Email and role_code are required' }, { status: 400 });
    }

    await removeRoleFromUser(email, role_code, scope_entity_id);
    return NextResponse.json({ success: true, message: `Role ${role_code} removed from ${email}` });
  } catch (err) {
    console.error('Error removing role:', err);
    return NextResponse.json({ error: 'Failed to remove role' }, { status: 500 });
  }
}
