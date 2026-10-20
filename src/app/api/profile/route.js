import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import {
  getUserProfile,
  saveUserProfile,
  reviewUserProfile,
  FORM_REFERENCE_DATA,
  DEPARTMENTS_CATALOG,
} from '@/lib/db';

export async function GET(req) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const targetEmail = searchParams.get('email') || session.user.email;

  const profile = await getUserProfile(targetEmail);

  return NextResponse.json({
    profile,
    referenceData: FORM_REFERENCE_DATA,
    departments: DEPARTMENTS_CATALOG,
  });
}

export async function POST(req) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { profileData, isSubmitting } = body;

    const email = session.user.email;
    const current = await getUserProfile(email);

    // If profile is already locked/APPROVED, direct updates are rejected! Must use Change Request.
    if (current && current.profile_status === 'APPROVED' && !session.user.roles?.some((r) => r.code === 'ADMIN')) {
      return NextResponse.json({
        error: 'Profile is locked and approved. You must submit a Data Change Request with superior approval to modify data.',
      }, { status: 403 });
    }

    const saved = await saveUserProfile(email, profileData, Boolean(isSubmitting));
    return NextResponse.json({ success: true, profile: saved });
  } catch (err) {
    console.error('Error saving user profile:', err);
    return NextResponse.json({ error: 'Failed to save profile' }, { status: 500 });
  }
}

export async function PATCH(req) {
  const session = await auth();
  const roles = session?.user?.roles?.map((r) => (typeof r === 'string' ? r : r.code)) || [];
  const isSuperior = roles.some((r) => ['ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY'].includes(r));

  if (!isSuperior) {
    return NextResponse.json({ error: 'Unauthorized: Superior approval required' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { email, action, reviewer_notes } = body;

    if (!email || !action) {
      return NextResponse.json({ error: 'Email and Action are required' }, { status: 400 });
    }

    const reviewed = await reviewUserProfile({
      email,
      action,
      reviewed_by: session.user.email,
      reviewer_notes,
    });

    return NextResponse.json({ success: true, profile: reviewed });
  } catch (err) {
    console.error('Error reviewing profile:', err);
    return NextResponse.json({ error: 'Failed to review profile' }, { status: 500 });
  }
}
