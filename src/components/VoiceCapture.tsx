'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface VoiceCaptureProps {
  onTranscript: (text: string) => void;
  className?: string;
  locked?: boolean;
}

// Voice-to-text journaling — tap to speak your thoughts
export default function VoiceCapture({ onTranscript, className = '', locked = false }: VoiceCaptureProps) {
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [supported, setSupported] = useState(true);
  const [showLockedTip, setShowLockedTip] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const onTranscriptRef = useRef(onTranscript);

  // Keep callback ref up to date without re-running the effect
  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  }, [onTranscript]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setSupported(false);
      return;
    }
    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    let finalText = '';

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (e: any) => {
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) {
          finalText += t + ' ';
        } else {
          interim = t;
        }
      }
      setTranscript(finalText + interim);
    };

    recognition.onerror = () => {
      setRecording(false);
    };

    recognition.onend = () => {
      setRecording(false);
      if (finalText.trim()) {
        onTranscriptRef.current(finalText.trim());
      }
    };

    recognitionRef.current = recognition;
  }, []); // Initialize once — uses ref for callback

  const toggle = useCallback(() => {
    if (!recognitionRef.current) return;
    if (recording) {
      recognitionRef.current.stop();
    } else {
      setTranscript('');
      recognitionRef.current.start();
      setRecording(true);
    }
  }, [recording]);

  const handleLockedClick = useCallback(() => {
    setShowLockedTip(true);
    setTimeout(() => setShowLockedTip(false), 2000);
  }, []);

  if (!supported) return null;

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={locked ? handleLockedClick : toggle}
        aria-label={locked ? 'Voice is a Pro feature' : recording ? 'Stop recording' : 'Start voice recording'}
        className={`group relative flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
          locked
            ? 'glass-card text-muted/40 cursor-not-allowed opacity-50'
            : recording
              ? 'bg-danger/20 text-danger'
              : 'glass-card text-muted hover:text-foreground'
        }`}
      >
        {/* Locked tooltip */}
        <AnimatePresence>
          {locked && showLockedTip && (
            <motion.div
              key="locked-tip"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              className="absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-card-elevated px-3 py-1.5 text-[10px] font-semibold text-primary shadow-lg border border-primary/20"
            >
              Pro feature
            </motion.div>
          )}
        </AnimatePresence>
        {/* Pulse ring when recording */}
        {recording && (
          <motion.div
            className="absolute inset-0 rounded-xl border-2 border-danger/40"
            animate={{ scale: [1, 1.08, 1], opacity: [0.5, 0.2, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-14 0m7 7v4m-4 0h8M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
        </svg>
        {recording ? 'Listening...' : 'Voice'}
      </button>

      {/* Live transcript preview */}
      <AnimatePresence>
        {recording && transcript && (
          <motion.div
            key="transcript"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2 rounded-xl glass-card p-3"
          >
            <p className="text-xs text-muted mb-1">Hearing you...</p>
            <p role="status" className="text-sm text-foreground/80 leading-relaxed">{transcript}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Type declarations for Web Speech API
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    SpeechRecognition: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    webkitSpeechRecognition: any;
  }
}
