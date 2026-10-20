import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { listAllCourses, createCourse, deleteCourse } from '@/lib/db';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const department_id = searchParams.get('department_id');
    const program_id = searchParams.get('program_id');
    const courses = await listAllCourses({ department_id, program_id });
    return NextResponse.json({ courses });
  } catch (err) {
    console.error('Error fetching courses:', err);
    return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 });
  }
}

export async function POST(req) {
  const session = await auth();
  const roles = session?.user?.roles?.map((r) => (typeof r === 'string' ? r : r.code)) || [];
  const canManageCourses = roles.some((r) => ['FACULTY', 'HOD', 'ADMIN', 'PRINCIPAL'].includes(r));

  if (!canManageCourses) {
    return NextResponse.json({ error: 'Unauthorized: Faculty, HoD, or Admin privileges required to manage courses' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { program_id, department_id, code, name, semester, course_type, credits, hours_per_week, description } = body;

    if (!department_id || !code || !name) {
      return NextResponse.json({ error: 'Department ID, Course Code, and Course Name are required' }, { status: 400 });
    }

    const course = await createCourse({
      program_id: program_id || null,
      department_id,
      code,
      name,
      semester,
      course_type,
      credits,
      hours_per_week,
      description,
      faculty_email: session.user.email,
    });

    return NextResponse.json({ success: true, course });
  } catch (err) {
    console.error('Error creating course:', err);
    return NextResponse.json({ error: err.message || 'Failed to add course to program' }, { status: 500 });
  }
}

export async function DELETE(req) {
  const session = await auth();
  const roles = session?.user?.roles?.map((r) => (typeof r === 'string' ? r : r.code)) || [];
  const canManageCourses = roles.some((r) => ['FACULTY', 'HOD', 'ADMIN', 'PRINCIPAL'].includes(r));

  if (!canManageCourses) {
    return NextResponse.json({ error: 'Unauthorized: Faculty, HoD, or Admin privileges required' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Course ID is required' }, { status: 400 });
    }

    await deleteCourse(id);
    return NextResponse.json({ success: true, message: 'Course deleted successfully' });
  } catch (err) {
    console.error('Error deleting course:', err);
    return NextResponse.json({ error: err.message || 'Failed to delete course' }, { status: 500 });
  }
}
