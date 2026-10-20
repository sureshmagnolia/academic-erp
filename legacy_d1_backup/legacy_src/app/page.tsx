import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export const runtime = 'edge';

export default async function Home() {
  const session = await auth();
  
  if (!session || !session.user) {
    redirect('/login');
  }
  
  const role = (session.user as any).role;
  if (role === 'STUDENT') {
    redirect('/student/dashboard');
  } else if (role === 'ADMIN' || role === 'PRINCIPAL') {
    redirect('/admin/approvals');
  } else if (role === 'FACULTY' || role === 'HOD') {
    redirect('/faculty/dashboard');
  } else {
    redirect('/login');
  }
}
