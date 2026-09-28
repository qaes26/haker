import { NextRequest, NextResponse } from 'next/server';
import { FileStore } from '@/lib/database/file-store';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string; fileId: string } }
) {
  const { id: sessionId, fileId } = params;

  if (!sessionId || !fileId) {
    return NextResponse.json({ error: 'Missing sessionId or fileId' }, { status: 400 });
  }

  try {
    const fileData = await FileStore.getFile(sessionId, fileId);
    if (!fileData) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const { buffer, metadata } = fileData;
    const download = req.nextUrl.searchParams.get('download') === '1';

    // Encode filename safely for Content-Disposition
    const safeName = encodeURIComponent(metadata.name);

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': metadata.type || 'application/octet-stream',
        'Content-Length': buffer.length.toString(),
        'Content-Disposition': download
          ? `attachment; filename="${safeName}"; filename*=UTF-8''${safeName}`
          : `inline; filename="${safeName}"; filename*=UTF-8''${safeName}`,
        'Cache-Control': 'public, max-age=86400, immutable',
      },
    });
  } catch (err: any) {
    console.error('[API File Stream Error]', err);
    return NextResponse.json(
      { error: 'Failed to retrieve file', details: err?.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; fileId: string } }
) {
  const { id: sessionId, fileId } = params;

  if (!sessionId || !fileId) {
    return NextResponse.json({ error: 'Missing sessionId or fileId' }, { status: 400 });
  }

  try {
    const success = await FileStore.deleteFile(sessionId, fileId);
    return NextResponse.json({ success });
  } catch (err: any) {
    console.error('[API File Delete Error]', err);
    return NextResponse.json(
      { error: 'Failed to delete file', details: err?.message },
      { status: 500 }
    );
  }
}
