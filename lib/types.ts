export type SessionStatus = 'active' | 'ended' | 'failed';
export type StreamStatus = 'idle' | 'connecting' | 'streaming' | 'stopped';

export interface SessionFile {
  id: string;
  sessionId: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: number;
}

export interface UserSession {
  id: string;
  phoneNumber: string;
  maskedPhoneNumber: string;
  createdAt: number;
  endedAt?: number;
  status: SessionStatus;
  streamStatus: StreamStatus;
  lastHeartbeat: number;
  files?: SessionFile[];
  filesCount?: number;
  requestedFiles?: boolean;
}

export type SignalingMessageType = 
  | 'offer' 
  | 'answer' 
  | 'ice-candidate' 
  | 'client-ready' 
  | 'admin-connected' 
  | 'stream-status' 
  | 'session-ended'
  | 'files-uploaded'
  | 'request-files';

export interface SignalingMessage {
  id: string;
  sessionId: string;
  sender: 'client' | 'admin';
  type: SignalingMessageType;
  payload: any;
  timestamp: number;
}

export interface SmsResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface AdminAuthPayload {
  role: 'admin';
  authenticatedAt: number;
}
