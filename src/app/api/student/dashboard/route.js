import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import {
  getStudentByEmail,
  getStudentAcademicRecords,
  getAnnouncements,
} from '@/lib/db';

export async function GET() {
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized: Please log in' }, { status: 401 });
  }

  const email = session.user.email.toLowerCase();

  try {
    const student = await getStudentByEmail(email);
    const records = await getStudentAcademicRecords(email);
    const announcements = await getAnnouncements();

    return NextResponse.json({
      student: student || {
        name: session.user.name || 'Student',
        email: session.user.email,
        role: session.user.role,
        department: 'General Sciences',
        semester: 'Semester 1',
        roll_no: 'PENDING',
        status: 'ACTIVE',
      },
      academicRecords: records || [],
      announcements: announcements || [],
    });
  } catch (err) {
    console.error('Error fetching student dashboard:', err);
    return NextResponse.json({ error: 'Failed to load student dashboard' }, { status: 500 });
  }
}
