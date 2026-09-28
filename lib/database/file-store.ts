import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { SessionFile } from '@/lib/types';
import { SessionStore } from './session-store';

export class FileStore {
  private static getUploadDir(sessionId: string): string {
    const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
    const baseDir = isServerless
      ? path.join('/tmp', 'sms_uploads', sessionId)
      : path.join(process.cwd(), '.data', 'uploads', sessionId);

    if (!fs.existsSync(baseDir)) {
      try {
        fs.mkdirSync(baseDir, { recursive: true });
      } catch (err) {
        console.warn('[FileStore] Failed to create directory:', err);
      }
    }
    return baseDir;
  }

  /**
   * Saves a file buffer for a specific session and updates the session store
   */
  static async saveFile(
    sessionId: string,
    originalName: string,
    mimeType: string,
    buffer: Buffer
  ): Promise<SessionFile> {
    const fileId = crypto.randomBytes(12).toString('hex');
    const sanitizedName = originalName.replace(/[^a-zA-Z0-9._\- \u0600-\u06FF]/g, '_');
    const diskFileName = `${fileId}_${sanitizedName}`;
    const uploadDir = this.getUploadDir(sessionId);
    const filePath = path.join(uploadDir, diskFileName);

    try {
      fs.writeFileSync(filePath, buffer);
    } catch (err) {
      console.error('[FileStore] Error saving file to disk:', err);
    }

    const sessionFile: SessionFile = {
      id: fileId,
      sessionId,
      name: originalName,
      size: buffer.length,
      type: mimeType || 'application/octet-stream',
      url: `/api/sessions/${sessionId}/files/${fileId}`,
      uploadedAt: Date.now(),
    };

    // Update session store
    try {
      const session = await SessionStore.get(sessionId);
      if (session) {
        const currentFiles = session.files || [];
        const updatedFiles = [...currentFiles, sessionFile];
        await SessionStore.update(sessionId, {
          files: updatedFiles,
          filesCount: updatedFiles.length,
        });
      }
    } catch (err) {
      console.warn('[FileStore] Failed to update session with file metadata:', err);
    }

    return sessionFile;
  }

  /**
   * Get all files metadata for a session
   */
  static async getFiles(sessionId: string): Promise<SessionFile[]> {
    const session = await SessionStore.get(sessionId);
    return session?.files || [];
  }

  /**
   * Get a specific file buffer and metadata
   */
  static async getFile(
    sessionId: string,
    fileId: string
  ): Promise<{ buffer: Buffer; metadata: SessionFile } | null> {
    const session = await SessionStore.get(sessionId);
    const metadata = session?.files?.find((f) => f.id === fileId);

    if (!metadata) return null;

    const uploadDir = this.getUploadDir(sessionId);
    try {
      const dirFiles = fs.readdirSync(uploadDir);
      const matched = dirFiles.find((f) => f.startsWith(`${fileId}_`));
      if (!matched) return null;

      const filePath = path.join(uploadDir, matched);
      if (!fs.existsSync(filePath)) return null;

      const buffer = fs.readFileSync(filePath);
      return { buffer, metadata };
    } catch (err) {
      console.error('[FileStore] Error reading file:', err);
      return null;
    }
  }

  /**
   * Delete a file
   */
  static async deleteFile(sessionId: string, fileId: string): Promise<boolean> {
    const uploadDir = this.getUploadDir(sessionId);
    try {
      if (fs.existsSync(uploadDir)) {
        const dirFiles = fs.readdirSync(uploadDir);
        const matched = dirFiles.find((f) => f.startsWith(`${fileId}_`));
        if (matched) {
          fs.unlinkSync(path.join(uploadDir, matched));
        }
      }
    } catch (err) {
      console.warn('[FileStore] Error deleting file from disk:', err);
    }

    try {
      const session = await SessionStore.get(sessionId);
      if (session && session.files) {
        const updatedFiles = session.files.filter((f) => f.id !== fileId);
        await SessionStore.update(sessionId, {
          files: updatedFiles,
          filesCount: updatedFiles.length,
        });
      }
      return true;
    } catch (err) {
      console.warn('[FileStore] Error updating session after deletion:', err);
      return false;
    }
  }
}
