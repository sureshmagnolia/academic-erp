import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getProgramSeatMatrix, updateProgramSeatMatrix, listAllDepartments } from '@/lib/db';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const program_id = searchParams.get('program_id');

    if (!program_id) {
      return NextResponse.json({ error: 'Program ID parameter (program_id) is required' }, { status: 400 });
    }

    const data = await getProgramSeatMatrix(program_id);
    return NextResponse.json(data);
  } catch (err) {
    console.error('Error in GET /api/seat-matrix:', err);
    return NextResponse.json({ error: err.message || 'Failed to fetch program seat matrix' }, { status: 500 });
  }
}

export async function POST(req) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthenticated: Please log in to configure seat matrices' }, { status: 401 });
  }

  const rawRoles = session.user.roles || [];
  const roles = rawRoles.map((r) => (typeof r === 'string' ? r : r.code));
  const isAdminOrPrincipal =
    session.user.role === 'ADMIN' ||
    session.user.primary_type === 'ADMIN' ||
    roles.includes('ADMIN') ||
    roles.includes('PRINCIPAL');

  const isHod = roles.includes('HOD');

  if (!isAdminOrPrincipal && !isHod) {
    return NextResponse.json(
      { error: 'Unauthorized: Only Head of Department (HoD), Principal, or System Administrator can configure seat split-ups.' },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const { program_id, splitup } = body;

    if (!program_id) {
      return NextResponse.json({ error: 'Program ID is required' }, { status: 400 });
    }

    if (!splitup || typeof splitup !== 'object') {
      return NextResponse.json({ error: 'A valid category splitup map is required' }, { status: 400 });
    }

    // HoD Scope Validation: Ensure HoD only updates programs within their assigned department
    if (!isAdminOrPrincipal && isHod) {
      const existing = await getProgramSeatMatrix(program_id);
      const userDept = session.user.department;
      
      // Look for department scope on HOD role entry
      const hodRole = rawRoles.find((r) => (typeof r === 'object' ? r.code === 'HOD' : false));
      const roleDept = hodRole?.department || userDept;

      if (existing.program.department_id !== roleDept && existing.program.department_id !== userDept) {
        return NextResponse.json(
          {
            error: `Access Denied: You are designated HoD of ${roleDept || 'another department'}, but this degree program belongs to ${existing.program.department_id}.`,
          },
          { status: 403 }
        );
      }
    }

    const updated = await updateProgramSeatMatrix(program_id, splitup, session.user.email);

    return NextResponse.json({
      success: true,
      message: 'Pre-admission seat matrix updated and locked for academic allocation.',
      ...updated,
    });
  } catch (err) {
    console.error('Error in POST /api/seat-matrix:', err);
    return NextResponse.json({ error: err.message || 'Failed to update program seat matrix' }, { status: 500 });
  }
}
