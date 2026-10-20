import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { listAllDepartments, createDepartment } from '@/lib/db';

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
