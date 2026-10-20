import { NextResponse } from 'next/server';
import { getStudentByEmail } from '@/lib/db';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.json({ error: 'Email parameter is required' }, { status: 400 });
  }

  const cleanEmail = email.trim().toLowerCase();
  const adminEmails = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase());

  if (adminEmails.includes(cleanEmail)) {
    return NextResponse.json({
      allowed: true,
      role: 'ADMIN',
      message: 'This email is recognized as a System Administrator.',
    });
  }

  const student = await getStudentByEmail(cleanEmail);
  if (student && student.status === 'ACTIVE') {
    return NextResponse.json({
      allowed: true,
      role: 'STUDENT',
      name: student.name,
      department: student.department,
      roll_no: student.roll_no,
      message: 'Student account is enrolled and active. You can sign in with Google.',
    });
  }

  if (student && student.status === 'SUSPENDED') {
    return NextResponse.json({
      allowed: false,
      role: 'STUDENT',
      message: 'Your student account is suspended. Please contact the college administration.',
    });
  }

  return NextResponse.json({
    allowed: false,
    message: 'This Gmail address is not in the accepted students directory.',
  });
}
