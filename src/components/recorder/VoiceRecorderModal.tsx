import React, { useState } from 'react';
import { Modal, Button, AudioWaveform, AudioPlayer, Badge, Spinner } from '@/components/common';
import { formatDuration } from '@/utils/formatters';
import { transcriptionService } from '@/services/transcriptionService';
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
  const [isSaving, setIsSaving] = useState(false);

  // Trigger speech-to-text via Supabase Edge Function (OpenAI Whisper)
  const processTranscription = async (blob: Blob, durationSeconds: number) => {
    setIsTranscribing(true);
    setTranscriptionError(null);

    const res = await transcriptionService.transcribeAudio(blob, durationSeconds);
    setIsTranscribing(false);

    if (res.error) {
      setTranscriptionError(res.error);
      // Default fallback title without fake transcription text
      setNoteTitle(`Voice Note (${formatDuration(durationSeconds)})`);
    } else {
      setNoteText(res.transcription || '');
      setNoteTitle(res.title || `Voice Note (${formatDuration(durationSeconds)})`);
    }
  };

  const handleStart = async () => {
    setRecordedAudio(null);
    setTranscriptionError(null);
    setNoteText('');
    setNoteTitle('');
    await startRecording();
  };

  const handleStop = async () => {
    const res = await stopRecording();
    if (res) {
      setRecordedAudio(res);
      await processTranscription(res.blob, res.durationSeconds);
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
          <div className="flex flex-col items-center justify-center py-6 text-center space-y-6">
            {/* Central Microphone Button with animated ripple and glowing ring */}
            <div className="relative flex items-center justify-center">
              {recordState === 'recording' && (
                <>
                  <div className="absolute w-40 h-40 rounded-full bg-red-500/15 animate-ping pointer-events-none" />
                  <div className="absolute w-32 h-32 rounded-full bg-terracotta-500/25 animate-pulse pointer-events-none" />
                </>
              )}

              {recordState === 'inactive' && (
                <div className="absolute w-32 h-32 rounded-full bg-terracotta-500/10 dark:bg-terracotta-500/20 pointer-events-none" />
              )}

              <button
                type="button"
                onClick={recordState === 'recording' ? handleStop : handleStart}
                className={`relative z-10 w-24 h-24 rounded-3xl flex items-center justify-center text-white transition-all transform active:scale-95 shadow-soft-xl ${
                  recordState === 'recording'
                    ? 'bg-gradient-to-tr from-red-500 to-rose-600 shadow-red-500/40'
                    : 'bg-gradient-to-tr from-terracotta-600 to-glowOrange-500 hover:from-terracotta-500 hover:to-glowOrange-400 shadow-glow-orange'
                }`}
                title={recordState === 'recording' ? 'Stop and transcribe' : 'Start recording'}
              >
                {recordState === 'recording' ? (
                  <Square className="w-8 h-8 fill-current" />
                ) : (
                  <Mic className="w-10 h-10" />
                )}
              </button>
            </div>

            {/* Live Timer & Recording Status Indicator */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-center gap-2 text-3xl font-mono font-bold tracking-tight text-charcoal-900 dark:text-white">
                {recordState === 'recording' && (
                  <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
                )}
                <span>{formatDuration(duration)}</span>
              </div>

              <p className="text-xs font-semibold text-charcoal-500 dark:text-dark-muted">
                {recordState === 'recording'
                  ? 'Recording in progress... speak your thoughts.'
                  : recordState === 'paused'
                  ? 'Recording paused. Click Resume to continue.'
                  : 'Tap the microphone button to start recording.'}
              </p>
            </div>

            {/* Animated Audio Waveform Meter */}
            <div className="w-full max-w-sm px-4">
              <AudioWaveform
                isRecording={recordState === 'recording'}
                audioLevel={audioLevel}
                barCount={32}
                className="justify-center h-12"
              />
            </div>

            {/* In-Recording Controls */}
            {recordState !== 'inactive' && (
              <div className="flex items-center gap-3 pt-1">
                {recordState === 'recording' ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={pauseRecording}
                    leftIcon={<Pause className="w-3.5 h-3.5" />}
                  >
                    Pause
                  </Button>
                ) : (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={resumeRecording}
                    leftIcon={<Play className="w-3.5 h-3.5" />}
                  >
                    Resume
                  </Button>
                )}

                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleStop}
                  leftIcon={<Check className="w-3.5 h-3.5" />}
                  className="bg-glowOrange-500 hover:bg-glowOrange-600 text-white font-bold"
                >
                  Stop Recording
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancel}
                  className="text-charcoal-400 hover:text-red-500 dark:hover:text-red-400"
                >
                  Cancel
                </Button>
              </div>
            )}
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

            {/* OpenAI API Key or Transcription Error Notification */}
            {transcriptionError && !isTranscribing && (
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
                <Key className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1 space-y-1">
                  <p className="font-bold">Speech-to-Text Configuration</p>
                  <p className="leading-relaxed text-[11px] font-medium">{transcriptionError}</p>
                  <p className="text-[11px] text-amber-700 dark:text-amber-300 pt-0.5">
                    You can type or edit your note manually in the text area below.
                  </p>
                </div>
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
