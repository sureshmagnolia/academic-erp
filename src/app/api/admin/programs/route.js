import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createAcademicProgram, deleteAcademicProgram, listAllAcademicPrograms } from '@/lib/db';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const department_id = searchParams.get('department_id');
    const programs = await listAllAcademicPrograms(department_id);
    return NextResponse.json({ programs });
  } catch (err) {
    console.error('Error fetching programs:', err);
    return NextResponse.json({ error: 'Failed to fetch academic programs' }, { status: 500 });
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
    const { department_id, name, code, level, duration_years, total_semesters, intake_capacity } = body;
    if (!department_id || !name || !code) {
      return NextResponse.json({ error: 'Department ID, program name, and code are required' }, { status: 400 });
    }

    const program = await createAcademicProgram({
      department_id,
      name,
      code,
      level: level || 'UG',
      duration_years: parseInt(duration_years, 10) || 3,
      total_semesters: parseInt(total_semesters, 10) || 6,
      intake_capacity: parseInt(intake_capacity, 10) || 60,
    });

    return NextResponse.json({ success: true, program });
  } catch (err) {
    console.error('Error creating program:', err);
    return NextResponse.json({ error: err.message || 'Failed to create academic program' }, { status: 500 });
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
      return NextResponse.json({ error: 'Program ID is required' }, { status: 400 });
    }

    await deleteAcademicProgram(id);
    return NextResponse.json({ success: true, message: 'Program removed successfully' });
  } catch (err) {
    console.error('Error deleting program:', err);
    return NextResponse.json({ error: err.message || 'Failed to delete program' }, { status: 500 });
  }
}
