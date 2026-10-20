import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import {
  listAllStudents,
  addStudent,
  removeStudent,
  updateStudentStatus,
} from '@/lib/db';

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 });
  }

  try {
    const students = await listAllStudents();
    return NextResponse.json({ students });
  } catch (err) {
    console.error('Error fetching students:', err);
    return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 });
  }
}

export async function POST(req) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { email, name, roll_no, department, semester, phone } = body;

    if (!email || !name) {
      return NextResponse.json({ error: 'Email and Name are required fields' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email address format' }, { status: 400 });
    }

    const student = await addStudent({
      email,
      name,
      roll_no,
      department,
      semester,
      phone,
    });

    return NextResponse.json({ success: true, student });
  } catch (err) {
    console.error('Error adding student:', err);
    return NextResponse.json({ error: 'Failed to add student' }, { status: 500 });
  }
}

export async function DELETE(req) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email parameter is required' }, { status: 400 });
    }

    await removeStudent(email);
    return NextResponse.json({ success: true, message: `Student ${email} removed from accepted list` });
  } catch (err) {
    console.error('Error deleting student:', err);
    return NextResponse.json({ error: 'Failed to delete student' }, { status: 500 });
  }
}

export async function PATCH(req) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { email, status } = body;

    if (!email || !['ACTIVE', 'SUSPENDED'].includes(status)) {
      return NextResponse.json({ error: 'Valid email and status (ACTIVE/SUSPENDED) are required' }, { status: 400 });
    }

    const updated = await updateStudentStatus(email, status);
    return NextResponse.json({ success: true, student: updated });
  } catch (err) {
    console.error('Error updating student status:', err);
    return NextResponse.json({ error: 'Failed to update student' }, { status: 500 });
  }
}
