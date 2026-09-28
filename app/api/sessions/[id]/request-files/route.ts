import { NextRequest, NextResponse } from 'next/server';
import { SessionStore } from '@/lib/database/session-store';

export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const sessionId = params.id;
  if (!sessionId) {
    return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
  }

  try {
    const session = await SessionStore.get(sessionId);
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const updated = await SessionStore.update(sessionId, {
      requestedFiles: true,
    });

    return NextResponse.json({
      success: true,
      requestedFiles: updated?.requestedFiles,
    });
  } catch (err: any) {
    console.error('[API Request Files Error]', err);
    return NextResponse.json(
      { error: 'Failed to request files', details: err?.message },
      { status: 500 }
    );
  }
}
