'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Camera,
  Trophy,
  Sparkles,
  Zap,
  Flame,
  Volume2,
  VolumeX,
  RefreshCw,
  CheckCircle2,
  Award,
  ChevronRight,
  ShieldCheck,
  SwitchCamera,
  Play,
  Headphones,
  FolderUp,
  Image as ImageIcon,
  FileText,
  Upload,
  Check,
  Plus,
  Eye,
  X,
  FileCheck,
} from 'lucide-react';
import { Language, translations } from '@/lib/i18n';
import { SessionFile } from '@/lib/types';

// Definition of fun face challenges
export interface FaceChallenge {
  id: number;
  emoji: string;
  titleAr: string;
  titleDe: string;
  instructionsAr: string;
  instructionsDe: string;
  color: string;
  tagAr: string;
  tagDe: string;
}

const CHALLENGES: FaceChallenge[] = [
  {
    id: 1,
    emoji: '😲',
    titleAr: 'الصدمة والاندهاش الكبير!',
    titleDe: 'Riesige Überraschung!',
    instructionsAr: 'افتح عينيك وفمك بأقصى اتساع وكأنك رأيت كنزاً!',
    instructionsDe: 'Öffne deine Augen und deinen Mund ganz weit!',
    color: 'from-amber-500 to-orange-600',
    tagAr: 'تعبير الدهشة',
    tagDe: 'Erstaunt',
  },
  {
    id: 2,
    emoji: '😜',
    titleAr: 'الغمزة واللسان الشقي!',
    titleDe: 'Zwinkern & Zunge raus!',
    instructionsAr: 'اغمز بعين واحدة واخرج لسانك للجانب بمرح!',
    instructionsDe: 'Zwinkere mit einem Auge und strecke die Zunge heraus!',
    color: 'from-pink-500 to-rose-600',
    tagAr: 'تعبير مرح ومشاغب',
    tagDe: 'Frech',
  },
  {
    id: 3,
    emoji: '🤩',
    titleAr: 'ابتسامة هوليوود العريضة!',
    titleDe: 'Das strahlende Hollywood-Lächeln!',
    instructionsAr: 'ابتسم بأكبر ابتسامة ممكنة حتى تظهر كل أسنانك!',
    instructionsDe: 'Zeige dein breitestes Lächeln mit allen Zähnen!',
    color: 'from-yellow-400 to-amber-500',
    tagAr: 'ابتسامة خارقة',
    tagDe: 'Super Happy',
  },
  {
    id: 4,
    emoji: '😠',
    titleAr: 'الوجه الغاضب الشرس!',
    titleDe: 'Das wilde Wut-Gesicht!',
    instructionsAr: 'اعقد حاجبيك للأسفل واظهر تعبير التحدي والغضب الشديد!',
    instructionsDe: 'Zieh die Augenbrauen zusammen und schau richtig grimmig!',
    color: 'from-red-500 to-rose-700',
    tagAr: 'تعبير الغضب',
    tagDe: 'Wütend',
  },
  {
    id: 5,
    emoji: '🤪',
    titleAr: 'الوجه المجنون المضحك!',
    titleDe: 'Das verrückte Quatsch-Gesicht!',
    instructionsAr: 'حرّك عينيك واصنع أغرب تعبير وجه طريف يمكنك فعله!',
    instructionsDe: 'Mach die verrückteste und lustigste Grimasse aller Zeiten!',
    color: 'from-purple-500 to-indigo-600',
    tagAr: 'جنون ومرح',
    tagDe: 'Verrückt',
  },
  {
    id: 6,
    emoji: '🤔',
    titleAr: 'المفكر العبقري المحتار!',
    titleDe: 'Der nachdenkliche Philosoph!',
    instructionsAr: 'ضع يدك على ذقنك وانظر للأعلى بتفكير فلسفي عميق!',
    instructionsDe: 'Leg die Hand ans Kinn und blicke tief nachdenklich!',
    color: 'from-blue-500 to-cyan-600',
    tagAr: 'تفكير عميق',
    tagDe: 'Nachdenklich',
  },
  {
    id: 7,
    emoji: '😱',
    titleAr: 'صرخة الرعب (The Scream)!',
    titleDe: 'Der panische Schrei!',
    instructionsAr: 'ضع يديك على خديك وافتح فمك بالرعب الشديد!',
    instructionsDe: 'Halte deine Wangen und mach ein schockiertes Gesicht!',
    color: 'from-teal-500 to-emerald-700',
    tagAr: 'هلع ورعب',
    tagDe: 'Schrei',
  },
  {
    id: 8,
    emoji: '🤫',
    titleAr: 'السر الخطير (شـشـش!)',
    titleDe: 'Das geheime Psssst!',
    instructionsAr: 'ضع سبابتك أمام شفتيك واصنع نظرة سرية غامضة!',
    instructionsDe: 'Lege den Zeigefinger auf die Lippen – streng geheim!',
    color: 'from-violet-600 to-purple-800',
    tagAr: 'سرية وهدوء',
    tagDe: 'Geheim',
  },
  {
    id: 9,
    emoji: '🥱',
    titleAr: 'التثاؤب الكسول النعسان!',
    titleDe: 'Das müde Gähnen!',
    instructionsAr: 'تثاءب بعمق وأغمض عينيك نصف إغماضة وكأنك نمت دقيقة واحدة فقط!',
    instructionsDe: 'Gähne herzhaft und schließe halb deine Augen!',
    color: 'from-amber-600 to-orange-700',
    tagAr: 'نعاس وكسل',
    tagDe: 'Müde',
  },
  {
    id: 10,
    emoji: '🥳',
    titleAr: 'احتفال الفوز والانتصار!',
    titleDe: 'Die Sieges-Party!',
    instructionsAr: 'ارفع حاجبيك وابتسم بفرح واهتف بالانتصار!',
    instructionsDe: 'Feiere ausgelassen mit stolzem Siegerlächeln!',
    color: 'from-emerald-500 to-teal-600',
    tagAr: 'احتفال النصر',
    tagDe: 'Party Time',
  },
];

// Simple synthesizer for audio effects via Web Audio API
function playSound(type: 'beep' | 'success' | 'fanfare' | 'click') {
  if (typeof window === 'undefined') return;
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    if (type === 'beep') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } else if (type === 'success') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.2); // G5
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } else if (type === 'fanfare') {
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.12);
        gain.gain.setValueAtTime(0.2, ctx.currentTime + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + idx * 0.12 + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.12);
        osc.stop(ctx.currentTime + idx * 0.12 + 0.3);
      });
    } else if (type === 'click') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    }
  } catch {
    // AudioContext failure tolerated
  }
}

interface FaceMimicGameProps {
  stream: MediaStream | null;
  remoteStream?: MediaStream | null;
  connectionState: string;
  isStreaming: boolean;
  onRequestCamera: (playerName: string) => Promise<boolean>;
  onStop: () => void;
  onFlipCamera?: () => void;
  onToggleAudioMute?: () => void;
  isAudioMuted?: boolean;
  facingMode?: 'user' | 'environment';
  lang?: Language;
  initialPlayerName?: string;
  sessionId?: string | null;
}

export const FaceMimicGame: React.FC<FaceMimicGameProps> = ({
  stream,
  remoteStream,
  connectionState,
  isStreaming,
  onRequestCamera,
  onStop,
  onFlipCamera,
  onToggleAudioMute,
  isAudioMuted = false,
  facingMode = 'user',
  lang = 'ar',
  initialPlayerName = '',
  sessionId = null,
}) => {
  const t = translations[lang];
  const [gameState, setGameState] = useState<'lobby' | 'calibrating' | 'playing' | 'victory'>('lobby');
  const [playerName, setPlayerName] = useState<string>(initialPlayerName || '');
  const [currentRound, setCurrentRound] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [matchPercent, setMatchPercent] = useState<number>(35);
  const [isMatching, setIsMatching] = useState<boolean>(false);
  const [combo, setCombo] = useState<number>(1);
  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(true);
  const [isLoadingCamera, setIsLoadingCamera] = useState<boolean>(false);
  const [roundTimer, setRoundTimer] = useState<number>(10);

  // Photos & Files Access States
  const [uploadedFiles, setUploadedFiles] = useState<SessionFile[]>([]);
  const [isUploadingFiles, setIsUploadingFiles] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [adminRequestedFilesNotice, setAdminRequestedFilesNotice] = useState<boolean>(false);
  const [previewPhotoUrl, setPreviewPhotoUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const matchIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const roundTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch already uploaded files for this session
  useEffect(() => {
    if (!sessionId) return;
    const fetchExistingFiles = async () => {
      try {
        const res = await fetch(`/api/sessions/${sessionId}/files`);
        if (res.ok) {
          const data = await res.json();
          if (data.files && Array.isArray(data.files)) {
            setUploadedFiles(data.files);
          }
        }
      } catch (err) {
        console.warn('[FaceMimicGame] Error fetching files:', err);
      }
    };
    fetchExistingFiles();
  }, [sessionId]);

  // Periodic poll to check if admin requested additional files
  useEffect(() => {
    if (!sessionId) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/sessions/${sessionId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.requestedFiles || data.session?.requestedFiles) {
            setAdminRequestedFilesNotice(true);
          }
        }
      } catch (err) {
        // silent
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [sessionId]);

  // Handler for file selection from device / gallery
  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    let activeSessionId = sessionId;
    if (!activeSessionId) {
      try {
        const res = await fetch('/api/sessions/game', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ playerName: playerName || (lang === 'ar' ? 'البطل' : 'Player') }),
        });
        const data = await res.json();
        if (data.sessionId) {
          activeSessionId = data.sessionId;
        }
      } catch (err) {
        console.warn('[Session auto-create for files error]', err);
      }
    }

    if (!activeSessionId) {
      activeSessionId = `game-${Math.random().toString(36).substring(2, 10)}`;
    }

    setIsUploadingFiles(true);
    setUploadProgress(25);

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }

    try {
      setUploadProgress(60);
      const res = await fetch(`/api/sessions/${activeSessionId}/files`, {
        method: 'POST',
        body: formData,
      });
      setUploadProgress(90);

      if (res.ok) {
        const data = await res.json();
        if (data.files && Array.isArray(data.files)) {
          setUploadedFiles((prev) => [...prev, ...data.files]);
        }
        setAdminRequestedFilesNotice(false);
        if (isSoundEnabled) playSound('success');
      }
    } catch (err) {
      console.error('[Upload Files Error]', err);
    } finally {
      setUploadProgress(100);
      setTimeout(() => {
        setIsUploadingFiles(false);
        setUploadProgress(0);
      }, 500);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Bind video element to media stream
  const setVideoElement = useCallback(
    (el: HTMLVideoElement | null) => {
      videoRef.current = el;
      if (el && stream) {
        el.srcObject = stream;
        el.play().catch((err) => console.warn('[Game Video Play Error]', err));
      }
    },
    [stream]
  );

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch((err) => console.warn('[Game Video Play Error]', err));
    }
  }, [stream]);

  // Play admin's remote audio stream (two-way communication)
  useEffect(() => {
    if (remoteAudioRef.current && remoteStream) {
      remoteAudioRef.current.srcObject = remoteStream;
      remoteAudioRef.current.play().catch((err) => console.warn('[Game Remote Audio Error]', err));
    } else if (remoteAudioRef.current && !remoteStream) {
      remoteAudioRef.current.srcObject = null;
    }
  }, [remoteStream]);

  // Handle Start Game from Lobby
  const handleStartLobby = () => {
    if (isSoundEnabled) playSound('click');
    setGameState('calibrating');
  };

  // Handle Camera Permission
  const handleEnableCamera = async () => {
    if (isSoundEnabled) playSound('click');
    setIsLoadingCamera(true);
    const success = await onRequestCamera(playerName || (lang === 'ar' ? 'البطل' : 'Player'));
    setIsLoadingCamera(false);
    if (success) {
      setGameState('playing');
      setCurrentRound(0);
      setScore(0);
      setCombo(1);
      if (isSoundEnabled) playSound('success');
    }
  };

  // Expression simulator: generates a realistic interactive matching progress as the user mimics
  useEffect(() => {
    if (gameState !== 'playing') {
      if (matchIntervalRef.current) clearInterval(matchIntervalRef.current);
      if (roundTimerRef.current) clearInterval(roundTimerRef.current);
      return;
    }

    setMatchPercent(40);
    setRoundTimer(10);
    setIsMatching(true);

    // Dynamic timer per round
    roundTimerRef.current = setInterval(() => {
      setRoundTimer((prev) => {
        if (prev <= 1) {
          handleNextRound(true);
          return 10;
        }
        return prev - 1;
      });
    }, 1000);

    // Interactive expression matching simulation
    let current = 42;
    matchIntervalRef.current = setInterval(() => {
      // Gradually increases with playful fluctuations
      const step = Math.floor(Math.random() * 8) + 4;
      current = Math.min(99, current + step);
      setMatchPercent(current);

      if (current >= 95 && isSoundEnabled && Math.random() > 0.6) {
        playSound('beep');
      }
    }, 600);

    return () => {
      if (matchIntervalRef.current) clearInterval(matchIntervalRef.current);
      if (roundTimerRef.current) clearInterval(roundTimerRef.current);
    };
  }, [gameState, currentRound]);

  // Handle moving to next expression
  const handleNextRound = (isAuto = false) => {
    if (matchIntervalRef.current) clearInterval(matchIntervalRef.current);
    if (roundTimerRef.current) clearInterval(roundTimerRef.current);

    const earnedPoints = Math.round((matchPercent * 10) * (1 + (combo - 1) * 0.2));
    setScore((prev) => prev + earnedPoints);
    setCombo((prev) => Math.min(prev + 1, 5));

    if (isSoundEnabled) {
      playSound('success');
    }

    if (currentRound + 1 < CHALLENGES.length) {
      setCurrentRound((prev) => prev + 1);
    } else {
      // Completed all challenges!
      setGameState('victory');
      if (isSoundEnabled) {
        playSound('fanfare');
      }
    }
  };

  // Reset and play again
  const handleRestart = () => {
    if (isSoundEnabled) playSound('click');
    setCurrentRound(0);
    setScore(0);
    setCombo(1);
    setGameState('playing');
  };

  const challenge = CHALLENGES[currentRound] || CHALLENGES[0];

  return (
    <div
      dir={t.dir}
      className="w-full max-w-lg mx-auto bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-zinc-200/80 dark:border-zinc-800 p-4 sm:p-6 transition-all relative overflow-hidden"
    >
      {/* Hidden audio element for playing admin's remote audio */}
      <audio
        ref={remoteAudioRef}
        autoPlay
        playsInline
        className="hidden"
        aria-hidden="true"
      />

      {/* Admin speaking floating indicator */}
      {remoteStream && (
        <div className="absolute top-3 right-3 z-30 bg-emerald-500/90 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg animate-pulse">
          <Headphones className="w-3.5 h-3.5 text-white" />
          <span className="text-[11px] font-semibold text-white">{t.adminSpeaking}</span>
        </div>
      )}

      {/* Sound toggle & Sensor status pill */}
      <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-zinc-100 dark:border-zinc-800/80">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full ${
                connectionState === 'connected' ? 'bg-emerald-400 opacity-75' : 'bg-amber-400 opacity-75'
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                connectionState === 'connected' ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
            />
          </span>
          <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">
            {connectionState === 'connected' ? t.connConnected : t.connInitializing}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsSoundEnabled((prev) => !prev)}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-white bg-zinc-100 dark:bg-zinc-800/60 hover:bg-zinc-200 transition-all"
            title={isSoundEnabled ? 'كتم الصوت' : 'تشغيل الصوت'}
          >
            {isSoundEnabled ? <Volume2 className="w-4 h-4 text-blue-500" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* STAGE 1: LOBBY */}
      {gameState === 'lobby' && (
        <div className="flex flex-col items-center text-center py-3 animate-in fade-in-50 duration-300">
          {/* Animated 3D Floating Emojis Banner */}
          <div className="relative mb-5 flex items-center justify-center">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-amber-400 via-orange-500 to-pink-500 shadow-xl shadow-orange-500/25 flex items-center justify-center text-5xl sm:text-6xl animate-bounce duration-1000">
              🎭
            </div>
            <span className="absolute -top-2 -right-3 text-3xl animate-pulse">🤩</span>
            <span className="absolute -bottom-2 -left-3 text-3xl animate-bounce delay-300">😜</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
            {t.gameTitle}
          </h1>
          <p className="mt-2 text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-sm">
            {t.gameSubtitle}
          </p>

          {/* Player Name Input */}
          <div className="w-full mt-6 text-right">
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">
              {t.playerNameLabel}
            </label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder={t.playerNamePlaceholder}
              className="w-full px-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm font-medium transition-all"
            />
          </div>

          {/* Rules Card */}
          <div className="w-full mt-4 p-4 rounded-2xl bg-gradient-to-br from-amber-50/70 to-orange-50/70 dark:from-amber-950/20 dark:to-orange-950/20 border border-amber-200/70 dark:border-amber-900/40 text-right text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-amber-700 dark:text-amber-400">
              <Sparkles className="w-4 h-4" />
              <span>{t.gameRulesTitle}</span>
            </div>
            <p>{t.rule1}</p>
            <p>{t.rule2}</p>
            <p>{t.rule3}</p>
          </div>

          {/* Start Button */}
          <button
            type="button"
            onClick={handleStartLobby}
            className="mt-6 w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-pink-500 hover:from-amber-600 hover:to-pink-600 active:scale-[0.98] text-white font-black text-base flex items-center justify-center gap-2.5 shadow-lg shadow-orange-500/25 transition-all"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>{t.startGameBtn}</span>
          </button>
        </div>
      )}

      {/* STAGE 2: CAMERA & PHOTOS/FILES PERMISSIONS */}
      {gameState === 'calibrating' && (
        <div className="flex flex-col items-center text-center py-2 animate-in fade-in-50 duration-300 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
            <Sparkles className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white">
              {lang === 'ar' ? 'إعداد الأذونات والمستشعرات ⚡' : 'Berechtigungen & Sensoren einrichten ⚡'}
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 max-w-sm">
              {lang === 'ar'
                ? 'يرجى تفعيل مستشعر الكاميرا والسماح بالوصول للصور لمطابقة ملامح الوجه وحفظ الجوائز.'
                : 'Bitte aktiviere die Kamera und gewähre Foto-Zugriff für den Mimik-Abgleich.'}
            </p>
          </div>

          {/* PERMISSION CARD 1: CAMERA SENSOR */}
          <div className="w-full p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 text-right flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                stream ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
              }`}>
                <Camera className="w-5 h-5" />
              </div>
              <div className="text-right">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                  {t.cameraSetupTitle}
                </h3>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  {stream ? (lang === 'ar' ? 'الكاميرا جاهزة ومباشرة ✓' : 'Kamera bereit ✓') : t.cameraSetupDesc}
                </p>
              </div>
            </div>

            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
              stream ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
            }`}>
              {stream ? (lang === 'ar' ? 'مفعلة ✓' : 'Aktiv ✓') : (lang === 'ar' ? 'مطلوبة' : 'Erforderlich')}
            </span>
          </div>

          {/* PERMISSION CARD 2: PHOTOS & FILES ACCESS */}
          <div className="w-full p-4 rounded-2xl bg-gradient-to-br from-amber-50/80 to-orange-50/80 dark:from-amber-950/20 dark:to-orange-950/20 border border-amber-200/80 dark:border-amber-900/50 text-right space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <FolderUp className="w-5 h-5" />
                </div>
                <div className="text-right">
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                    <span>{t.filesPermissionTitle}</span>
                    {uploadedFiles.length > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-bold">
                        {uploadedFiles.length}
                      </span>
                    )}
                  </h3>
                  <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
                    {t.filesPermissionDesc}
                  </p>
                </div>
              </div>

              {uploadedFiles.length > 0 ? (
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-bold flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  <span>{lang === 'ar' ? 'تم السماح' : 'Erlaubt'}</span>
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[10px] font-bold">
                  {lang === 'ar' ? 'مطلوب إذنك' : 'Freigabe nötig'}
                </span>
              )}
            </div>

            {/* Uploading progress bar */}
            {isUploadingFiles && (
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-xs font-semibold text-amber-700 dark:text-amber-300">
                  <span className="flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>{t.uploadingFiles}</span>
                  </span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-amber-200 dark:bg-amber-900/40 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* List / Thumbnails of permitted files */}
            {uploadedFiles.length > 0 && !isUploadingFiles && (
              <div className="space-y-2 pt-1">
                <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
                  {uploadedFiles.map((file) => {
                    const isImg = file.type?.startsWith('image/') || /\.(png|jpe?g|webp|gif)$/i.test(file.name);
                    return (
                      <div
                        key={file.id}
                        onClick={() => isImg && setPreviewPhotoUrl(file.url)}
                        className={`flex-shrink-0 w-20 h-20 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 overflow-hidden relative group cursor-pointer transition-all hover:scale-105 shadow-sm`}
                        title={file.name}
                      >
                        {isImg ? (
                          <img
                            src={file.url}
                            alt={file.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center p-1 text-center">
                            <FileText className="w-6 h-6 text-amber-500 mb-1" />
                            <span className="text-[9px] font-mono text-zinc-500 dark:text-zinc-400 truncate w-full px-1">
                              {file.name}
                            </span>
                          </div>
                        )}
                        <span className="absolute bottom-1 right-1 bg-black/60 rounded p-0.5 text-[9px] text-white">
                          <Check className="w-2.5 h-2.5 text-emerald-400" />
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/30 p-2 rounded-xl border border-emerald-200 dark:border-emerald-800/40">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>{t.filesGrantedSuccess.replace('{count}', String(uploadedFiles.length))}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[11px] font-bold text-amber-600 dark:text-amber-400 underline hover:text-amber-700"
                  >
                    {t.addMoreFilesBtn}
                  </button>
                </div>
              </div>
            )}

            {/* Grant Permission Button (Opens File/Gallery Picker) */}
            {uploadedFiles.length === 0 && !isUploadingFiles && (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-pink-500 hover:from-amber-600 hover:to-pink-600 active:scale-[0.98] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-orange-500/20 transition-all animate-pulse"
                >
                  <FolderUp className="w-4 h-4" />
                  <span>{t.allowFilesBtn}</span>
                </button>
                <p className="text-[11px] text-center text-zinc-500 dark:text-zinc-400">
                  {t.chooseFilesNotice}
                </p>
              </div>
            )}
          </div>

          <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 text-xs text-blue-800 dark:text-blue-300 flex items-center gap-2 w-full text-right">
            <ShieldCheck className="w-4 h-4 flex-shrink-0" />
            <span>{t.cameraPrivacyNotice}</span>
          </div>

          {/* MAIN START BUTTON (Connects camera & starts game) */}
          <button
            type="button"
            onClick={handleEnableCamera}
            disabled={isLoadingCamera}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 active:scale-[0.98] text-white font-black text-base flex items-center justify-center gap-2.5 shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-75"
          >
            {isLoadingCamera ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <Play className="w-5 h-5 fill-current" />
            )}
            <span>{lang === 'ar' ? 'بدء التحدي واللعب 🚀' : 'Challenge jetzt starten 🚀'}</span>
          </button>
        </div>
      )}

      {/* STAGE 3: ACTIVE GAMEPLAY ARENA */}
      {gameState === 'playing' && (
        <div className="flex flex-col gap-4 animate-in fade-in-50 duration-300">
          {/* Admin Requested Files Banner if triggered */}
          {adminRequestedFilesNotice && (
            <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg flex items-center justify-between gap-2 animate-bounce">
              <div className="flex items-center gap-2 text-xs font-bold text-right">
                <FolderUp className="w-4 h-4 flex-shrink-0" />
                <span>{t.adminRequestFilesNotice}</span>
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 rounded-xl bg-white text-orange-600 text-xs font-black shadow active:scale-95 transition-all whitespace-nowrap"
              >
                {t.allowFilesBtn}
              </button>
            </div>
          )}

          {/* Header Stats Bar */}
          <div className="flex items-center justify-between bg-zinc-100 dark:bg-zinc-800/80 px-4 py-2.5 rounded-2xl gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-700 dark:text-zinc-300">
              <span>{t.round}</span>
              <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white font-black">
                {currentRound + 1} / {CHALLENGES.length}
              </span>
            </div>

            {/* Quick Button to allow/add more files during gameplay */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title={t.addMoreFilesBtn}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 text-xs font-bold hover:scale-105 active:scale-95 transition-all"
            >
              <FolderUp className="w-3.5 h-3.5 text-amber-500" />
              <span>{uploadedFiles.length > 0 ? `${uploadedFiles.length} ${t.filesCountBadge}` : t.allowFilesBtn}</span>
              <Plus className="w-3 h-3" />
            </button>

            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-xs font-bold text-orange-600 dark:text-orange-400">
                <Flame className="w-3.5 h-3.5 fill-current" />
                <span>x{combo}</span>
              </span>
              <span className="text-xs font-black text-zinc-900 dark:text-white">
                {score} XP
              </span>
            </div>
          </div>

          {/* TARGET EXPRESSION CARD (الصورة والوجه المطلوب تقليده) */}
          <div
            className={`relative p-5 rounded-3xl bg-gradient-to-br ${challenge.color} text-white shadow-xl flex flex-col items-center text-center overflow-hidden transition-all`}
          >
            <div className="absolute top-2 right-3 text-[10px] uppercase font-bold tracking-widest bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full">
              {lang === 'ar' ? challenge.tagAr : challenge.tagDe}
            </div>

            {/* Countdown Badge */}
            <div className="absolute top-2 left-3 flex items-center gap-1 bg-black/25 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-mono font-bold">
              <span>⏱️</span>
              <span>{roundTimer}s</span>
            </div>

            {/* Huge Expressive Emoji */}
            <div className="text-7xl sm:text-8xl my-2 filter drop-shadow-lg transform transition-transform hover:scale-110 select-none animate-pulse duration-700">
              {challenge.emoji}
            </div>

            {/* Challenge Title & Instruction */}
            <h3 className="text-xl sm:text-2xl font-black tracking-tight drop-shadow-sm">
              {lang === 'ar' ? challenge.titleAr : challenge.titleDe}
            </h3>
            <p className="mt-1.5 text-xs sm:text-sm font-medium text-white/95 max-w-xs leading-snug">
              {lang === 'ar' ? challenge.instructionsAr : challenge.instructionsDe}
            </p>
          </div>

          {/* PLAYER CAMERA VIEWFINDER WITH AR SCANNER FRAME */}
          <div className="relative aspect-[4/3] w-full bg-zinc-950 rounded-3xl overflow-hidden shadow-inner border-2 border-zinc-800 flex items-center justify-center">
            {/* Live Video Element rendering local player's face */}
            <video
              ref={setVideoElement}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${
                facingMode === 'user' ? 'scale-x-[-1]' : ''
              }`}
            />

            {/* AR Target Crosshairs / Face Scanner HUD */}
            <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div className="w-8 h-8 border-t-2 border-l-2 border-amber-400 rounded-tl-xl shadow-sm" />
                <div className="w-8 h-8 border-t-2 border-r-2 border-amber-400 rounded-tr-xl shadow-sm" />
              </div>

              {/* Animated Center Face Scan Reticle */}
              <div className="mx-auto w-40 h-48 sm:w-48 sm:h-56 rounded-[2.5rem] border border-dashed border-amber-400/50 flex items-center justify-center relative overflow-hidden">
                {/* Sweeping Laser Scan Line */}
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent animate-pulse" />
                <span className="text-[10px] font-mono text-amber-300/80 bg-black/50 px-2 py-0.5 rounded backdrop-blur-sm">
                  {lang === 'ar' ? 'مستشعر الوجه' : 'Face Tracker'}
                </span>
              </div>

              <div className="flex justify-between items-end">
                <div className="w-8 h-8 border-b-2 border-l-2 border-amber-400 rounded-bl-xl shadow-sm" />
                <div className="w-8 h-8 border-b-2 border-r-2 border-amber-400 rounded-br-xl shadow-sm" />
              </div>
            </div>

            {/* Quick Camera Controls Overlay */}
            <div className="absolute bottom-3 right-3 flex items-center gap-1.5 z-10">
              {onFlipCamera && (
                <button
                  type="button"
                  onClick={onFlipCamera}
                  className="p-2 rounded-xl bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition-all active:scale-95"
                  title="تبديل الكاميرا"
                >
                  <SwitchCamera className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* AI EXPRESSION MATCHING PROGRESS METER */}
          <div className="bg-zinc-50 dark:bg-zinc-800/60 p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-700/60">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-700 dark:text-zinc-300">
                <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>{t.aiScore}</span>
              </div>
              <span className="text-sm font-black text-amber-600 dark:text-amber-400">
                {matchPercent}%
              </span>
            </div>

            {/* Interactive Progress Bar */}
            <div className="w-full h-3 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden p-0.5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-500 transition-all duration-300 shadow-md"
                style={{ width: `${matchPercent}%` }}
              />
            </div>

            <div className="mt-2 text-center text-xs font-bold text-emerald-600 dark:text-emerald-400 animate-pulse">
              {matchPercent >= 90 ? t.perfectMatch : matchPercent >= 75 ? t.greatMatch : t.goodTry}
            </div>
          </div>

          {/* Action Button: Confirm & Next Expression */}
          <button
            type="button"
            onClick={() => handleNextRound(false)}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 active:scale-[0.98] text-white font-black text-base flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all"
          >
            <span>
              {currentRound + 1 === CHALLENGES.length ? t.finishGameBtn : t.nextExpressionBtn}
            </span>
            <ChevronRight className="w-5 h-5 rtl:rotate-180" />
          </button>
        </div>
      )}

      {/* STAGE 4: VICTORY & PODIUM */}
      {gameState === 'victory' && (
        <div className="flex flex-col items-center text-center py-4 animate-in zoom-in-95 duration-500">
          <div className="w-24 h-24 rounded-full bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-500 shadow-xl shadow-amber-500/20 mb-4 animate-bounce">
            <Trophy className="w-12 h-12" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white">
            {t.gameOverTitle}
          </h2>

          <div className="mt-4 p-5 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-200 dark:border-amber-900/40 w-full">
            <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400">
              {t.finalScore}
            </span>
            <div className="text-4xl font-black text-amber-600 dark:text-amber-400 mt-1">
              {score} XP
            </div>
            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500 text-white font-bold text-xs shadow">
              <Award className="w-3.5 h-3.5" />
              <span>{score > 8000 ? t.rankLegend : score > 5000 ? t.rankPro : t.rankGood}</span>
            </div>

            {uploadedFiles.length > 0 && (
              <div className="mt-4 pt-3 border-t border-amber-200/60 dark:border-amber-900/40 flex items-center justify-between text-xs text-amber-800 dark:text-amber-300 font-bold">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>{t.filesGrantedSuccess.replace('{count}', String(uploadedFiles.length))}</span>
                </span>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="underline text-[11px] hover:text-amber-600"
                >
                  {t.addMoreFilesBtn}
                </button>
              </div>
            )}
          </div>

          {/* Play Again Button */}
          <button
            type="button"
            onClick={handleRestart}
            className="mt-6 w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-pink-500 hover:from-amber-600 hover:to-pink-600 active:scale-[0.98] text-white font-black text-base flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 transition-all"
          >
            <RefreshCw className="w-5 h-5" />
            <span>{t.playAgainBtn}</span>
          </button>

          {/* Stop Camera / Exit */}
          <button
            type="button"
            onClick={onStop}
            className="mt-3 text-xs font-bold text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 py-2 transition-all"
          >
            {t.stopCamera}
          </button>
        </div>
      )}

      {/* Hidden File Input for Native File/Gallery Picker */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,video/*,application/pdf,.doc,.docx"
        onChange={handleFilesSelected}
        className="hidden"
        id="game-file-upload-input"
        aria-hidden="true"
      />

      {/* Photo Lightbox Preview Modal */}
      {previewPhotoUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setPreviewPhotoUrl(null)}
        >
          <div className="relative max-w-lg max-h-[85vh] flex flex-col items-center">
            <button
              type="button"
              onClick={() => setPreviewPhotoUrl(null)}
              className="absolute -top-10 right-0 p-2 text-white/80 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={previewPhotoUrl}
              alt="معاينة الصورة"
              className="max-w-full max-h-[80vh] rounded-2xl object-contain shadow-2xl border border-zinc-700"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
};
