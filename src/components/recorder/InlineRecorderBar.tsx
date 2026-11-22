import React from 'react';
import { Button, AudioWaveform } from '@/components/common';
import { formatDuration } from '@/utils/formatters';
import { Mic, Square, Sparkles } from 'lucide-react';

export interface InlineRecorderBarProps {
  isRecording: boolean;
  duration: number;
  audioLevel: number;
  onStart: () => void;
  onStop: () => void;
  onOpenStudioModal: () => void;
}

export const InlineRecorderBar: React.FC<InlineRecorderBarProps> = ({
  isRecording,
  duration,
  audioLevel,
  onStart,
  onStop,
  onOpenStudioModal,
}) => {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-900 via-charcoal-900 to-dark-bg p-5 text-white shadow-soft-lg border border-white/10 select-none">
      {/* Soft ambient gradient overlay */}
      <div className="absolute top-0 right-0 w-72 h-36 bg-mivoPink-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-72 h-36 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left: Branding & status */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center text-white transition-all shadow-soft-md ${
              isRecording
                ? 'bg-gradient-to-tr from-red-500 to-mivoPink-500 animate-pulse-glow shadow-red-500/30'
                : 'bg-gradient-to-tr from-brand-600 to-mivoPink-500 shadow-glow-purple'
            }`}
          >
            <Mic className="w-5 h-5" />
          </div>

          <div>
            <h2 className="text-base font-bold tracking-tight flex items-center gap-2">
              {isRecording ? 'Capturing Voice...' : 'Quick Voice Capture'}
              {!isRecording && (
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-normal px-2 py-0.5 rounded-full bg-white/10 text-brand-200">
                  <Sparkles className="w-3 h-3 text-mivoYellow-300" /> AI powered
                </span>
              )}
            </h2>
            <p className="text-xs text-charcoal-300">
              {isRecording
                ? 'Listening to your thoughts. Tap stop when finished.'
                : 'Speak freely. Mivo converts your voice into structured notes.'}
            </p>
          </div>
        </div>

        {/* Center / Right: Recording controls & waveforms */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          {isRecording ? (
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-2xl border border-white/15">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400 animate-ping" />
              <span className="font-mono text-sm font-bold text-white tracking-wider">
                {formatDuration(duration)}
              </span>

              <AudioWaveform
                isRecording
                audioLevel={audioLevel}
                barCount={16}
                className="h-6 w-20"
              />

              <Button
                variant="danger"
                size="sm"
                onClick={onStop}
                leftIcon={<Square className="w-3.5 h-3.5 fill-current" />}
              >
                Stop & Save
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={onOpenStudioModal}
                className="text-charcoal-200 hover:text-white hover:bg-white/10"
              >
                Open Studio
              </Button>

              <Button
                variant="primary"
                size="md"
                onClick={onStart}
                leftIcon={<Mic className="w-4 h-4" />}
                className="bg-white text-charcoal-900 hover:bg-warm-100 shadow-soft-md"
              >
                Start Recording
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
