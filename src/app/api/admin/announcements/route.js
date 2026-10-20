import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getAnnouncements, createAnnouncement } from '@/lib/db';

export async function GET() {
  try {
    const list = await getAnnouncements();
    return NextResponse.json({ announcements: list });
  } catch (err) {
    console.error('Error fetching announcements:', err);
    return NextResponse.json({ error: 'Failed to fetch announcements' }, { status: 500 });
  }
}

export async function POST(req) {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { title, content, category } = body;

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and Content are required' }, { status: 400 });
    }

    const created = await createAnnouncement({
      title,
      content,
      category,
      author_email: session.user.email,
    });

    return NextResponse.json({ success: true, announcement: created });
  } catch (err) {
    console.error('Error creating announcement:', err);
    return NextResponse.json({ error: 'Failed to create announcement' }, { status: 500 });
  }
}
