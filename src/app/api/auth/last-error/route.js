import { NextResponse } from 'next/server';
import { getLastAuthError } from '@/auth';

export async function GET() {
  const err = getLastAuthError();
  return NextResponse.json({
    lastError: err || 'No error recorded yet since server start.',
  });
}
