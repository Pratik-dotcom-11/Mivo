import React, { useState } from 'react';
import { Modal, Button, AudioWaveform, AudioPlayer, Badge, Spinner } from '@/components/common';
import { formatDuration } from '@/utils/formatters';
import {
  transcriptionService,
  getStoredOpenAIApiKey,
  setStoredOpenAIApiKey,
} from '@/services/transcriptionService';
import {
  Mic,
  Square,
  Tag,
  Check,
  Pause,
  Play,
  RotateCcw,
  AlertTriangle,
  FileText,
  Key,
} from 'lucide-react';
import type { Category, AudioRecordResult, VoiceNoteCategory } from '@/types';

export interface VoiceRecorderModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onSaveNote: (note: {
    title: string;
    transcription: string;
    category: VoiceNoteCategory;
    duration: number;
    audioBlob?: Blob;
  }) => Promise<void>;
  recorderHook: {
    state: 'inactive' | 'recording' | 'paused' | 'processing';
    duration: number;
    audioLevel: number;
    error: string | null;
    startRecording: () => Promise<void>;
    pauseRecording: () => void;
    resumeRecording: () => void;
    stopRecording: () => Promise<AudioRecordResult | null>;
    cancelRecording: () => void;
  };
}

export const VoiceRecorderModal: React.FC<VoiceRecorderModalProps> = ({
  isOpen,
  onClose,
  categories,
  onSaveNote,
  recorderHook,
}) => {
  const {
    state: recordState,
    duration,
    audioLevel,
    error: recorderError,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    cancelRecording,
  } = recorderHook;

  const [recordedAudio, setRecordedAudio] = useState<AudioRecordResult | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<VoiceNoteCategory>('Ideas');
  const [noteTitle, setNoteTitle] = useState('');
  const [noteText, setNoteText] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionError, setTranscriptionError] = useState<string | null>(null);
  const [transcriptionEngine, setTranscriptionEngine] = useState<'whisper' | 'browser' | 'manual' | null>(null);
  const [apiKeyInput, setApiKeyInput] = useState(() => getStoredOpenAIApiKey());
  const [showKeyConfig, setShowKeyConfig] = useState(false);
  const [keySavedSuccess, setKeySavedSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Trigger speech-to-text with multi-engine fallback
  const processTranscription = async (blob: Blob, durationSeconds: number, liveTranscript?: string) => {
    setIsTranscribing(true);
    setTranscriptionError(null);

    const res = await transcriptionService.transcribeAudio(blob, durationSeconds, liveTranscript);
    setIsTranscribing(false);

    if (res.transcription) {
      setNoteText(res.transcription);
      setNoteTitle(res.title || `Voice Note (${formatDuration(durationSeconds)})`);
      setTranscriptionEngine(res.engine || 'whisper');
      setTranscriptionError(null);
    } else if (res.error) {
      setTranscriptionError(res.error);
      setNoteTitle(`Voice Note (${formatDuration(durationSeconds)})`);
      setTranscriptionEngine(res.engine || 'manual');
    }
  };

  const handleSaveApiKey = async () => {
    setStoredOpenAIApiKey(apiKeyInput);
    setKeySavedSuccess(true);
    setTimeout(() => setKeySavedSuccess(false), 3000);
    if (recordedAudio) {
      await processTranscription(recordedAudio.blob, recordedAudio.durationSeconds);
    }
  };

  const handleStart = async () => {
    setRecordedAudio(null);
    setTranscriptionError(null);
    setTranscriptionEngine(null);
    setNoteText('');
    setNoteTitle('');
    await startRecording();
  };

  const handleStop = async () => {
    const res = await stopRecording();
    if (res) {
      setRecordedAudio(res);
      await processTranscription(res.blob, res.durationSeconds, res.liveTranscript);
    }
  };

  const handleCancel = () => {
    cancelRecording();
    setRecordedAudio(null);
    setTranscriptionError(null);
    setNoteText('');
    setNoteTitle('');
    onClose();
  };

  const handleRecordAgain = async () => {
    cancelRecording();
    setRecordedAudio(null);
    setTranscriptionError(null);
    setNoteText('');
    setNoteTitle('');
    await startRecording();
  };

  const handleSave = async () => {
    if (!recordedAudio) return;
    setIsSaving(true);

    try {
      const fallbackTitle = `Voice Note (${formatDuration(recordedAudio.durationSeconds)})`;
      await onSaveNote({
        title: noteTitle.trim() || fallbackTitle,
        transcription: noteText.trim(),
        category: selectedCategory,
        duration: recordedAudio.durationSeconds,
        audioBlob: recordedAudio.blob,
      });

      setRecordedAudio(null);
      setNoteText('');
      setNoteTitle('');
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      title={
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-terracotta-600 to-glowOrange-500 flex items-center justify-center text-white text-xs shadow-soft-sm">
            <Mic className="w-4 h-4" />
          </div>
          <span className="font-bold text-charcoal-900 dark:text-white">
            {recordedAudio ? 'Review Voice Note' : 'Record Voice Note'}
          </span>
        </div>
      }
      description={
        recordedAudio
          ? 'Preview your audio, edit the OpenAI Whisper transcription, and assign a category.'
          : 'Speak your thoughts clearly. Mivo transcribes and organizes your notes.'
      }
      size="lg"
    >
      <div className="py-2 space-y-5">
        {/* Hardware or Permission Error Banner */}
        {recorderError && (
          <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 space-y-1">
              <p className="font-semibold">Microphone Notice</p>
              <p className="leading-relaxed">{recorderError}</p>
            </div>
          </div>
        )}

        {/* Phase 1: Recording Interface (Idle or Live Recording) */}
        {!recordedAudio ? (
          <div className="flex flex-col items-center justify-center text-center">
            {/* Cinematic dark atmospheric panel */}
            <div
              className="w-full rounded-3xl px-6 py-8 relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #0D0A1A 0%, #1A0D2E 35%, #0A1520 70%, #0D1A0A 100%)' }}
            >
              {/* Subtle ambient glow blobs in background */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
                <div
                  className="absolute -top-10 -left-10 w-48 h-48 rounded-full opacity-30 animate-orb-float"
                  style={{ background: 'radial-gradient(circle, rgba(249,115,22,0.6) 0%, transparent 70%)' }}
                />
                <div
                  className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full opacity-25 animate-orb-float-delay"
                  style={{ background: 'radial-gradient(circle, rgba(20,184,166,0.5) 0%, transparent 70%)' }}
                />
                <div
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-32 rounded-full opacity-15"
                  style={{ background: 'radial-gradient(ellipse, rgba(236,72,153,0.4) 0%, transparent 70%)' }}
                />
              </div>

              {/* Central 3D Holographic AI Orb */}
              <div className="relative flex items-center justify-center mb-6">
                {/* Sonar rings — always present, faster when recording */}
                <div
                  className="absolute rounded-full border border-orange-400/20 pointer-events-none animate-sonar-ring-1"
                  style={{ width: '200px', height: '200px' }}
                />
                <div
                  className="absolute rounded-full border border-pink-400/15 pointer-events-none animate-sonar-ring-2"
                  style={{ width: '170px', height: '170px' }}
                />
                {recordState === 'recording' && (
                  <>
                    <div
                      className="absolute rounded-full border border-teal-400/20 pointer-events-none animate-sonar-ring-3"
                      style={{ width: '140px', height: '140px' }}
                    />
                    <div
                      className="absolute rounded-full border-2 border-orange-500/30 pointer-events-none animate-ping"
                      style={{ width: '110px', height: '110px' }}
                    />
                  </>
                )}

                {/* Outer glow aura */}
                <div
                  className="absolute w-28 h-28 rounded-full pointer-events-none animate-orb-pulse"
                  style={{
                    background: recordState === 'recording'
                      ? 'radial-gradient(circle, rgba(249,115,22,0.5) 0%, rgba(236,72,153,0.3) 50%, transparent 70%)'
                      : 'radial-gradient(circle, rgba(249,115,22,0.3) 0%, rgba(20,184,166,0.2) 50%, transparent 70%)',
                    filter: 'blur(16px)',
                  }}
                />

                {/* The orb itself — glass sphere with radial gradient */}
                <div
                  className="relative w-24 h-24 rounded-full animate-orb-float flex items-center justify-center cursor-pointer select-none"
                  style={{
                    background: recordState === 'recording'
                      ? 'radial-gradient(circle at 32% 28%, rgba(255,255,255,0.75) 0%, rgba(249,115,22,0.95) 18%, rgba(236,72,153,0.85) 48%, rgba(20,184,166,0.9) 78%, rgba(13,148,136,0.7) 100%)'
                      : 'radial-gradient(circle at 32% 28%, rgba(255,255,255,0.65) 0%, rgba(249,115,22,0.75) 20%, rgba(236,72,153,0.70) 50%, rgba(20,184,166,0.80) 80%, rgba(13,148,136,0.60) 100%)',
                    boxShadow: recordState === 'recording'
                      ? '0 0 60px rgba(249,115,22,0.7), 0 0 120px rgba(236,72,153,0.3), inset 0 0 40px rgba(255,255,255,0.25)'
                      : '0 0 40px rgba(249,115,22,0.4), 0 0 80px rgba(20,184,166,0.2), inset 0 0 30px rgba(255,255,255,0.18)',
                  }}
                  onClick={recordState === 'recording' ? handleStop : handleStart}
                  title={recordState === 'recording' ? 'Stop and transcribe' : 'Tap to begin recording'}
                >
                  {/* Specular highlight (top-left shine) */}
                  <div
                    className="absolute top-2.5 left-3 w-7 h-4 rounded-full opacity-80 pointer-events-none"
                    style={{ background: 'radial-gradient(ellipse, rgba(255,255,255,0.9) 0%, transparent 100%)' }}
                  />
                  {/* Secondary smaller highlight */}
                  <div
                    className="absolute top-5 left-5 w-3 h-2 rounded-full opacity-50 pointer-events-none"
                    style={{ background: 'radial-gradient(ellipse, rgba(255,255,255,0.7) 0%, transparent 100%)' }}
                  />

                  {/* Mic / Stop icon overlay — frosted glass */}
                  <div
                    className="relative z-10 w-12 h-12 rounded-full flex items-center justify-center transition-all"
                    style={{
                      background: 'rgba(255,255,255,0.18)',
                      backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(255,255,255,0.4)',
                      boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
                    }}
                  >
                    {recordState === 'recording' ? (
                      <Square className="w-5 h-5 text-white fill-current drop-shadow" />
                    ) : (
                      <Mic className="w-6 h-6 text-white drop-shadow" />
                    )}
                  </div>
                </div>
              </div>

              {/* Digital Timer — cinematic large mono */}
              <div className="space-y-2 mb-5">
                <div
                  className="flex items-center justify-center gap-3 text-4xl font-mono font-black tracking-widest"
                  style={{
                    color: '#FFFFFF',
                    textShadow: recordState === 'recording'
                      ? '0 0 20px rgba(249,115,22,0.9), 0 0 40px rgba(249,115,22,0.5)'
                      : '0 0 12px rgba(249,115,22,0.5)',
                  }}
                >
                  {recordState === 'recording' && (
                    <span
                      className="w-2.5 h-2.5 rounded-full animate-pulse"
                      style={{ background: '#f97316', boxShadow: '0 0 8px rgba(249,115,22,0.9)' }}
                    />
                  )}
                  <span>{formatDuration(duration)}</span>
                </div>

                <p
                  className="text-xs font-semibold tracking-wide"
                  style={{ color: 'rgba(255,255,255,0.55)' }}
                >
                  {recordState === 'recording'
                    ? '● REC · speak your thoughts freely'
                    : recordState === 'paused'
                    ? '⏸ Paused — tap Resume to continue'
                    : recordState === 'inactive'
                    ? 'Tap the orb to begin'
                    : 'Processing…'}
                </p>
              </div>

              {/* Audio Waveform — glowing bars on dark background */}
              <div className="w-full px-4 mb-5">
                <AudioWaveform
                  isRecording={recordState === 'recording'}
                  audioLevel={audioLevel}
                  barCount={32}
                  className="justify-center h-10"
                />
              </div>

              {/* In-Recording Controls — frosted glass pills */}
              {recordState !== 'inactive' && (
                <div className="flex items-center justify-center gap-3">
                  {recordState === 'recording' ? (
                    <button
                      type="button"
                      onClick={pauseRecording}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-white transition-all hover:scale-105 active:scale-95"
                      style={{
                        background: 'rgba(255,255,255,0.12)',
                        backdropFilter: 'blur(12px)',
                        border: '1px solid rgba(255,255,255,0.2)',
                      }}
                    >
                      <Pause className="w-3.5 h-3.5" />
                      Pause
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={resumeRecording}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-white transition-all hover:scale-105 active:scale-95"
                      style={{
                        background: 'rgba(255,255,255,0.12)',
                        backdropFilter: 'blur(12px)',
                        border: '1px solid rgba(255,255,255,0.2)',
                      }}
                    >
                      <Play className="w-3.5 h-3.5" />
                      Resume
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleStop}
                    className="flex items-center gap-1.5 px-5 py-2 rounded-full text-xs font-bold text-white transition-all hover:scale-105 active:scale-95"
                    style={{
                      background: 'linear-gradient(135deg, #f97316, #ea580c)',
                      boxShadow: '0 0 20px rgba(249,115,22,0.5)',
                      border: '1px solid rgba(255,255,255,0.2)',
                    }}
                  >
                    <Check className="w-3.5 h-3.5" />
                    Stop &amp; Save
                  </button>

                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all hover:scale-105 active:scale-95"
                    style={{
                      background: 'rgba(255,255,255,0.07)',
                      backdropFilter: 'blur(12px)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      color: 'rgba(255,255,255,0.5)',
                    }}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Phase 2: Processing, Review, Speech-to-Text & Note Editing */
          <div className="space-y-5">
            {/* Real Audio Player Preview */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-charcoal-700 dark:text-charcoal-200">
                Audio Preview
              </span>
              <AudioPlayer
                durationSeconds={recordedAudio.durationSeconds}
                audioBlob={recordedAudio.blob}
              />
            </div>

            {/* Transcription Status / Error Banner */}
            {isTranscribing && (
              <div className="p-4 rounded-2xl bg-warm-100/80 dark:bg-dark-surface border border-charcoal-200/60 dark:border-dark-border flex items-center gap-3">
                <Spinner size="sm" className="text-terracotta-600 dark:text-terracotta-400 flex-shrink-0" />
                <div className="text-xs">
                  <p className="font-bold text-charcoal-900 dark:text-white">
                    Transcribing with OpenAI Whisper...
                  </p>
                  <p className="text-charcoal-500 dark:text-dark-muted">
                    Converting audio to accurate text via Supabase Edge Function.
                  </p>
                </div>
              </div>
            )}

            {/* Transcription Status / Success / Configuration Banner */}
            {transcriptionEngine && !isTranscribing && !transcriptionError && (
              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-xs text-emerald-900 dark:text-emerald-200 flex items-center justify-between gap-2.5">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                  <span className="font-semibold text-[11px]">
                    {transcriptionEngine === 'whisper'
                      ? 'Transcribed accurately with OpenAI Whisper AI'
                      : 'Transcribed in real time with voice recognition engine'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowKeyConfig((prev) => !prev)}
                  className="text-[10px] text-emerald-700 dark:text-emerald-300 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                >
                  <Key className="w-3 h-3" />
                  {showKeyConfig ? 'Hide API Key' : 'API Key Settings'}
                </button>
              </div>
            )}

            {/* OpenAI API Key Configuration or Fallback Banner */}
            {((transcriptionError && !isTranscribing) || showKeyConfig) && (
              <div className="p-3.5 rounded-2xl bg-warm-100/80 dark:bg-dark-card border border-amber-200/80 dark:border-amber-800/40 text-xs text-charcoal-900 dark:text-charcoal-100 space-y-3">
                <div className="flex items-start justify-between gap-2.5">
                  <div className="flex items-start gap-2">
                    <Key className="w-4 h-4 text-glowOrange-600 dark:text-glowOrange-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-xs">OpenAI Whisper API Key Configuration</p>
                      <p className="text-[11px] text-charcoal-600 dark:text-charcoal-300 leading-relaxed pt-0.5">
                        Add an OpenAI API Key below to enable cloud Whisper speech-to-text. Keys are stored safely in your browser.
                      </p>
                    </div>
                  </div>
                  {showKeyConfig && !transcriptionError && (
                    <button
                      type="button"
                      onClick={() => setShowKeyConfig(false)}
                      className="text-charcoal-400 hover:text-charcoal-700 text-xs font-bold cursor-pointer"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
                  <input
                    type="password"
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    placeholder="sk-proj-... or your OpenAI API key"
                    className="w-full flex-1 rounded-xl border border-charcoal-300 dark:border-dark-border bg-white dark:bg-dark-surface px-3 py-1.5 text-xs text-charcoal-900 dark:text-white placeholder-charcoal-400 focus:outline-none focus:ring-2 focus:ring-glowOrange-500/30 font-mono"
                  />
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={handleSaveApiKey}
                      disabled={isTranscribing}
                      className="w-full sm:w-auto px-4 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-glowOrange-500 to-glowOrange-600 hover:from-glowOrange-600 hover:to-glowOrange-700 text-white shadow-soft-sm active:scale-95 transition-all cursor-pointer whitespace-nowrap"
                    >
                      {keySavedSuccess ? '✓ Saved!' : 'Save & Transcribe'}
                    </button>
                  </div>
                </div>

                {keySavedSuccess && (
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <Check className="w-3 h-3" /> Key saved successfully! Audio is now ready for Whisper transcription.
                  </p>
                )}
              </div>
            )}

            {/* Note Title Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-charcoal-700 dark:text-charcoal-200">
                Note Title
              </label>
              <input
                type="text"
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                placeholder="Title for your note..."
                className="w-full rounded-xl border border-charcoal-200 dark:border-dark-border bg-white dark:bg-dark-card px-3.5 py-2 text-sm font-semibold text-charcoal-900 dark:text-white placeholder-charcoal-400 focus:outline-none focus:ring-2 focus:ring-glowOrange-500/20"
              />
            </div>

            {/* Transcription / Note Content: Editable Text Area */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-charcoal-700 dark:text-charcoal-200 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-terracotta-600 dark:text-terracotta-400" />
                  <span>Transcription / Note Text (Editable)</span>
                </label>
                <span className="text-[11px] text-charcoal-400 dark:text-dark-muted font-medium">
                  {noteText.length} characters
                </span>
              </div>

              <textarea
                rows={4}
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder={
                  isTranscribing
                    ? 'Transcribing your audio...'
                    : 'Your transcribed text will appear here. You can edit, adjust, or type your thoughts...'
                }
                disabled={isTranscribing}
                className="w-full rounded-2xl border border-charcoal-200 dark:border-dark-border bg-white dark:bg-dark-card p-3.5 text-xs text-charcoal-800 dark:text-charcoal-200 placeholder-charcoal-400 focus:outline-none focus:ring-2 focus:ring-glowOrange-500/20 leading-relaxed font-sans"
              />
            </div>

            {/* Category Tagging (Ideas, Business, To-do) */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-charcoal-700 dark:text-charcoal-200 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-glowOrange-500" />
                Category
              </span>

              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => {
                  const isSelected = selectedCategory === cat.name;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.name as VoiceNoteCategory)}
                      className={`transition-all rounded-full ${
                        isSelected
                          ? 'ring-2 ring-glowOrange-500 ring-offset-2 dark:ring-offset-dark-card'
                          : 'opacity-70 hover:opacity-100'
                      }`}
                    >
                      <Badge colorHex={cat.color} size="md" dot>
                        {cat.name}
                        {isSelected && <Check className="w-3 h-3 ml-1" />}
                      </Badge>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons: Record Again & Save Voice Note */}
            <div className="flex items-center justify-between pt-3 border-t border-charcoal-100 dark:border-dark-border">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRecordAgain}
                leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                className="text-charcoal-600 dark:text-dark-muted hover:text-charcoal-900 dark:hover:text-white"
              >
                Record Again
              </Button>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={handleCancel}>
                  Discard
                </Button>

                <Button
                  variant="primary"
                  size="md"
                  onClick={handleSave}
                  isLoading={isSaving}
                  disabled={isTranscribing}
                  leftIcon={<Check className="w-4 h-4" />}
                  className="bg-glowOrange-500 hover:bg-glowOrange-600 text-white font-bold"
                >
                  Save Voice Note
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
