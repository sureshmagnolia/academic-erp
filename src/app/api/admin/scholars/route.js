import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import {
  saveResearchScholarProfile,
  createOrUpdateUser,
  getScholarsForSupervisor,
} from '@/lib/db';

export async function GET(req) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const supervisorEmail = searchParams.get('supervisor') || session.user.email;

  try {
    const scholars = await getScholarsForSupervisor(supervisorEmail);
    return NextResponse.json({ scholars });
  } catch (err) {
    console.error('Error fetching scholars:', err);
    return NextResponse.json({ error: 'Failed to fetch scholars' }, { status: 500 });
  }
}

export async function POST(req) {
  const session = await auth();
  const isAdmin = session?.user?.role === 'ADMIN' || session?.user?.roles?.some((r) => r.code === 'ADMIN' || r.code === 'PRINCIPAL');

  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized: Admin or Principal access required' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      scholar_email,
      scholar_name,
      scholar_phone,
      department,
      supervisor_email,
      co_supervisor_email,
      research_title,
      registration_no,
      scholar_type,
      funding_source,
      admission_date,
    } = body;

    if (!scholar_email || !supervisor_email) {
      return NextResponse.json({ error: 'Scholar Gmail and Supervisor Gmail are required' }, { status: 400 });
    }

    // 1. Ensure Scholar user exists in users table
    await createOrUpdateUser({
      email: scholar_email,
      name: scholar_name || scholar_email.split('@')[0],
      phone: scholar_phone,
      primary_type: 'STUDENT',
      department: department || 'Research & Doctoral Studies',
      designation: 'Research Scholar (PhD)',
      roll_no: registration_no,
    });

    // 2. Save Research Scholar Profile & link to supervisor
    const profile = await saveResearchScholarProfile({
      scholar_email,
      supervisor_email,
      co_supervisor_email,
      research_title,
      registration_no,
      scholar_type,
      funding_source,
      admission_date,
    });

    return NextResponse.json({ success: true, profile });
  } catch (err) {
    console.error('Error enrolling research scholar:', err);
    return NextResponse.json({ error: 'Failed to enroll research scholar' }, { status: 500 });
  }
}
