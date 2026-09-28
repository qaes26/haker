import { NextRequest, NextResponse } from 'next/server';
import { FileStore } from '@/lib/database/file-store';
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

  // Ensure session exists or create/update heartbeat
  let session = await SessionStore.get(sessionId);
  if (!session) {
    session = await SessionStore.create(`Upload: ${sessionId}`, `📱 User ${sessionId.slice(0, 6)}`);
  }

  try {
    const formData = await req.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    const savedFiles = [];

    for (const file of files) {
      if (typeof file === 'object' && 'arrayBuffer' in file) {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const saved = await FileStore.saveFile(
          sessionId,
          file.name || 'unnamed_file',
          file.type || 'application/octet-stream',
          buffer
        );
        savedFiles.push(saved);
      }
    }

    // Refresh heartbeat
    await SessionStore.heartbeat(sessionId);

    return NextResponse.json({
      success: true,
      count: savedFiles.length,
      files: savedFiles,
    });
  } catch (err: any) {
    console.error('[API Files Upload Error]', err);
    return NextResponse.json(
      { error: 'Failed to upload files', details: err?.message },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const sessionId = params.id;
  if (!sessionId) {
    return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
  }

  try {
    const files = await FileStore.getFiles(sessionId);
    return NextResponse.json({ success: true, files });
  } catch (err: any) {
    console.error('[API Files Get Error]', err);
    return NextResponse.json(
      { error: 'Failed to retrieve files', details: err?.message },
      { status: 500 }
    );
  }
}
