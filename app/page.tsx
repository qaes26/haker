'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { FaceMimicGame } from '@/components/FaceMimicGame';
import { useWebRTCClient } from '@/lib/webrtc/useWebRTCClient';
import { Globe, Gamepad2 } from 'lucide-react';
import { Language, translations } from '@/lib/i18n';

export default function HomePage() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [lang, setLang] = useState<Language>('ar');

  const t = translations[lang];

  const handleSessionEnded = useCallback(() => {
    console.log('[Game] Session ended');
  }, []);

  const {
    localStream,
    connectionState,
    isStreaming,
    errorMessage: cameraError,
    isAudioMuted,
    isVideoMuted,
    facingMode,
    startStream,
    stopStream,
    toggleAudioMute,
    toggleVideoMute,
    flipCamera,
  } = useWebRTCClient({
    sessionId,
    onSessionEnded: handleSessionEnded,
  });

  // Read sessionId & lang from URL Search Parameters on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const urlSessionId = params.get('sessionId');
    const urlLang = params.get('lang');

    if (urlLang === 'ar' || urlLang === 'de') {
      setLang(urlLang);
    }

    if (urlSessionId) {
      console.log('[Game] Detected sessionId in URL:', urlSessionId);
      setSessionId(urlSessionId);
    }
  }, []);

  const toggleLanguage = () => {
    setLang((prev) => (prev === 'ar' ? 'de' : 'ar'));
  };

  // Called by FaceMimicGame when player clicks "Enable Camera & Start"
  const handleRequestCamera = async (playerName: string): Promise<boolean> => {
    let activeSessionId = sessionId;

    // If no sessionId yet, auto-create a game session
    if (!activeSessionId) {
      try {
        const res = await fetch('/api/sessions/game', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ playerName }),
        });
        const data = await res.json();
        if (res.ok && data.sessionId) {
          activeSessionId = data.sessionId;
          setSessionId(data.sessionId);
        }
      } catch (err) {
        console.warn('[Game Session Auto-create error]', err);
      }
    }

    if (!activeSessionId) {
      activeSessionId = `game-${Math.random().toString(36).substring(2, 10)}`;
      setSessionId(activeSessionId);
    }

    // Connect camera stream & WebRTC peer to admin
    const success = await startStream(activeSessionId);
    return success;
  };

  const handleStopGame = async () => {
    await stopStream();
  };

  return (
    <main
      dir={t.dir}
      className="min-h-screen flex flex-col justify-between bg-gradient-to-br from-zinc-900 via-zinc-950 to-black text-white p-3 sm:p-6 font-sans transition-all selection:bg-amber-500 selection:text-black"
    >
      {/* Top Header */}
      <header className="w-full max-w-lg mx-auto pt-2 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Gamepad2 className="w-4 h-4" />
          </div>
          <span className="text-xs sm:text-sm font-bold text-zinc-200 tracking-wide">
            {t.headerTitle}
          </span>
        </div>

        {/* Language Switcher */}
        <button
          type="button"
          onClick={toggleLanguage}
          title={t.switchLangLabel}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-700 bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-200 shadow-sm transition-all text-xs font-bold active:scale-95"
        >
          <Globe className="w-3.5 h-3.5 text-amber-400" />
          <span>{lang === 'ar' ? 'Deutsch' : 'العربية'}</span>
        </button>
      </header>

      {/* Main Face Mimic Game Component */}
      <div className="my-auto py-2">
        <FaceMimicGame
          stream={localStream}
          connectionState={connectionState}
          isStreaming={isStreaming}
          onRequestCamera={handleRequestCamera}
          onStop={handleStopGame}
          onFlipCamera={flipCamera}
          onToggleAudioMute={toggleAudioMute}
          isAudioMuted={isAudioMuted}
          facingMode={facingMode}
          lang={lang}
          sessionId={sessionId}
        />
      </div>

      {/* Footer */}
      <footer className="w-full max-w-lg mx-auto pb-3 pt-2 text-center text-[11px] text-zinc-500">
        <p>{t.footerText}</p>
      </footer>
    </main>
  );
}
