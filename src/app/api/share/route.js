import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  return NextResponse.json({ success: true, message: 'Share endpoint ready (Phase 5)' });
}
