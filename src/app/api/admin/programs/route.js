import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createAcademicProgram } from '@/lib/db';

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
