import React from 'react';
import { cn } from '@/lib/utils';

export interface AudioWaveformProps {
  isRecording?: boolean;
  audioLevel?: number; // 0 to 100
  progress?: number; // 0 to 1 for playback progress
  barCount?: number;
  className?: string;
  interactive?: boolean;
  onSeek?: (ratio: number) => void;
}

// Deterministic pleasing pseudo-waveform heights
const DEFAULT_BAR_HEIGHTS = [
  24, 38, 55, 30, 48, 70, 92, 45, 60, 85, 35, 65, 95, 80, 50, 75, 40, 60, 88, 52, 35, 78, 65, 42,
  90, 70, 48, 85, 58, 32, 60, 45,
];

export const AudioWaveform: React.FC<AudioWaveformProps> = ({
  isRecording = false,
  audioLevel = 0,
  progress = 0,
  barCount = 32,
  className,
  interactive = false,
  onSeek,
}) => {
  const bars = Array.from({ length: barCount }, (_, index) => {
    return DEFAULT_BAR_HEIGHTS[index % DEFAULT_BAR_HEIGHTS.length] || 40;
  });

  const handleBarClick = (index: number) => {
    if (interactive && onSeek) {
      onSeek(index / (barCount - 1));
    }
  };

  return (
    <div
      className={cn('flex items-center gap-[3px] h-10 select-none py-1', className)}
      role={interactive ? 'slider' : 'presentation'}
      aria-label="Audio waveform"
      aria-valuenow={interactive ? Math.round(progress * 100) : undefined}
    >
      {bars.map((heightPercent, index) => {
        const ratio = index / barCount;
        const isPlayed = ratio <= progress;

        // When recording, scale heights based on live audio level
        let dynamicHeight = heightPercent;
        if (isRecording) {
          const factor = Math.max(0.2, (audioLevel / 100) * (0.8 + ((index % 5) * 0.1)));
          dynamicHeight = Math.min(100, Math.max(15, heightPercent * factor));
        }

        return (
          <button
            key={index}
            type="button"
            disabled={!interactive}
            onClick={() => handleBarClick(index)}
            className={cn(
              'w-[3px] rounded-full',
              isRecording ? 'transition-[height] duration-75 ease-out' : 'transition-all duration-150',
              interactive && 'cursor-pointer hover:opacity-80 focus:outline-none',
              isRecording
                ? 'bg-gradient-to-t from-red-500 to-mivoPink-500'
                : isPlayed
                ? 'bg-gradient-to-t from-brand-600 to-mivoPink-500 dark:from-brand-400 dark:to-mivoPink-400 shadow-soft-sm'
                : 'bg-warm-300 dark:bg-dark-border'
            )}
            style={{
              height: `${dynamicHeight}%`,
            }}
          />
        );
      })}
    </div>
  );
};
