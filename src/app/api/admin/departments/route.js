import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { listAllDepartments, createDepartment, deleteDepartment, updateDepartment } from '@/lib/db';

export async function GET() {
  try {
    const departments = await listAllDepartments();
    return NextResponse.json({ departments });
  } catch (err) {
    console.error('Error fetching departments:', err);
    return NextResponse.json({ error: 'Failed to fetch departments' }, { status: 500 });
  }
}

export async function POST(req) {
  const session = await auth();
  const isAdmin = session?.user?.role === 'ADMIN' || session?.user?.roles?.some((r) => r.code === 'ADMIN' || r.code === 'PRINCIPAL');

  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized: Administrator or Principal privileges required' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, code, type, description, hod_email } = body;
    if (!name || !code) {
      return NextResponse.json({ error: 'Department name and code are required' }, { status: 400 });
    }

    const department = await createDepartment({ name, code, type, description, hod_email });
    return NextResponse.json({ success: true, department });
  } catch (err) {
    console.error('Error creating department:', err);
    return NextResponse.json({ error: err.message || 'Failed to create department' }, { status: 500 });
  }
}

export async function PATCH(req) {
  const session = await auth();
  const isAdmin = session?.user?.role === 'ADMIN' || session?.user?.roles?.some((r) => r.code === 'ADMIN' || r.code === 'PRINCIPAL');

  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized: Administrator or Principal privileges required' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, name, code, type, description, hod_email } = body;
    if (!id) {
      return NextResponse.json({ error: 'Department ID is required for editing' }, { status: 400 });
    }

    const department = await updateDepartment({ id, name, code, type, description, hod_email });
    return NextResponse.json({ success: true, department });
  } catch (err) {
    console.error('Error updating department:', err);
    return NextResponse.json({ error: err.message || 'Failed to update department' }, { status: 500 });
  }
}

export async function DELETE(req) {
  const session = await auth();
  const isAdmin = session?.user?.role === 'ADMIN' || session?.user?.roles?.some((r) => r.code === 'ADMIN' || r.code === 'PRINCIPAL');

  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized: Administrator or Principal privileges required' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Department ID is required' }, { status: 400 });
    }

    await deleteDepartment(id);
    return NextResponse.json({ success: true, message: 'Department removed successfully' });
  } catch (err) {
    console.error('Error deleting department:', err);
    return NextResponse.json({ error: err.message || 'Failed to delete department' }, { status: 500 });
  }
}
