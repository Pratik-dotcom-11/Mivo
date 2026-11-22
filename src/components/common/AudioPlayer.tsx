import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { AudioWaveform } from './AudioWaveform';
import { formatDuration } from '@/utils/formatters';
import { cn } from '@/lib/utils';

export interface AudioPlayerProps {
  durationSeconds: number;
  audioBlob?: Blob | null;
  audioUrl?: string | null;
  className?: string;
  compact?: boolean;
  onEnded?: () => void;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  durationSeconds,
  audioBlob,
  audioUrl,
  className,
  compact = false,
  onEnded,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [actualDuration, setActualDuration] = useState(durationSeconds);
  const [speed, setSpeed] = useState<1 | 1.5 | 2>(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Generate real audio source URL
  const src = useMemo(() => {
    if (audioBlob) {
      return URL.createObjectURL(audioBlob);
    }
    return audioUrl || null;
  }, [audioBlob, audioUrl]);

  // Clean up object URL when component unmounts or blob changes
  useEffect(() => {
    return () => {
      if (audioBlob && src) {
        URL.revokeObjectURL(src);
      }
    };
  }, [audioBlob, src]);

  // Sync actual duration
  useEffect(() => {
    if (durationSeconds > 0) {
      setActualDuration(durationSeconds);
    }
  }, [durationSeconds]);

  const effectiveDuration = actualDuration > 0 ? actualDuration : durationSeconds;
  const progress = effectiveDuration > 0 ? Math.min(1, currentTime / effectiveDuration) : 0;

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio || !src) {
      // Fallback if no audio source is available
      setIsPlaying((prev) => !prev);
      return;
    }

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.warn('[Mivo AudioPlayer] Playback error:', err);
          setIsPlaying(false);
        });
    }
  };

  const handleSeek = (ratio: number) => {
    const newTime = ratio * effectiveDuration;
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const cycleSpeed = () => {
    const nextSpeed: 1 | 1.5 | 2 = speed === 1 ? 1.5 : speed === 1.5 ? 2 : 1;
    setSpeed(nextSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextSpeed;
    }
  };

  const resetPlay = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.pause();
    }
    setCurrentTime(0);
    setIsPlaying(false);
  };

  if (compact) {
    return (
      <div
        className={cn(
          'flex items-center gap-2.5 p-2 rounded-xl bg-warm-100/70 dark:bg-dark-surface border border-black/[0.04] dark:border-white/[0.06]',
          className
        )}
      >
        {src && (
          <audio
            ref={audioRef}
            src={src}
            preload="metadata"
            onTimeUpdate={() => {
              if (audioRef.current) {
                setCurrentTime(audioRef.current.currentTime);
              }
            }}
            onLoadedMetadata={() => {
              if (audioRef.current && isFinite(audioRef.current.duration)) {
                setActualDuration(audioRef.current.duration);
              }
            }}
            onEnded={() => {
              setIsPlaying(false);
              setCurrentTime(0);
              onEnded?.();
            }}
          />
        )}

        <button
          type="button"
          onClick={togglePlay}
          className="w-7 h-7 rounded-lg bg-terracotta-600 hover:bg-terracotta-700 text-white flex items-center justify-center transition-all shadow-soft-sm flex-shrink-0"
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
        </button>

        <div className="flex-1">
          <AudioWaveform
            progress={progress}
            barCount={20}
            interactive
            onSeek={handleSeek}
            className="h-6"
          />
        </div>

        <span className="text-[11px] font-mono font-medium text-charcoal-500 dark:text-dark-muted flex-shrink-0">
          {formatDuration(currentTime || effectiveDuration)}
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'p-4 rounded-2xl bg-warm-100/80 dark:bg-dark-surface border border-black/[0.04] dark:border-white/[0.06] shadow-soft-sm space-y-3',
        className
      )}
    >
      {src && (
        <audio
          ref={audioRef}
          src={src}
          preload="metadata"
          onTimeUpdate={() => {
            if (audioRef.current) {
              setCurrentTime(audioRef.current.currentTime);
            }
          }}
          onLoadedMetadata={() => {
            if (audioRef.current && isFinite(audioRef.current.duration)) {
              setActualDuration(audioRef.current.duration);
            }
          }}
          onEnded={() => {
            setIsPlaying(false);
            setCurrentTime(0);
            onEnded?.();
          }}
        />
      )}

      <div className="flex items-center justify-between gap-3">
        {/* Play / Pause Primary Button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={togglePlay}
            className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-terracotta-600 to-glowOrange-500 hover:from-terracotta-700 hover:to-glowOrange-600 text-white flex items-center justify-center transition-transform active:scale-95 shadow-soft-md shadow-terracotta-500/20"
            title={isPlaying ? 'Pause' : 'Play preview'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </button>

          <button
            type="button"
            onClick={resetPlay}
            className="p-2 text-charcoal-400 hover:text-charcoal-700 dark:text-dark-muted dark:hover:text-white rounded-xl hover:bg-warm-200/60 dark:hover:bg-dark-card transition-colors"
            title="Reset playback"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Waveform Scrubber */}
        <div className="flex-1 px-2">
          <AudioWaveform progress={progress} interactive onSeek={handleSeek} className="h-8" />
        </div>

        {/* Timers & Speed Toggle */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono font-semibold text-charcoal-600 dark:text-charcoal-200">
            {formatDuration(currentTime)} / {formatDuration(effectiveDuration)}
          </span>

          <button
            type="button"
            onClick={cycleSpeed}
            className="px-2 py-1 rounded-lg text-xs font-mono font-bold bg-white dark:bg-dark-card border border-black/[0.06] dark:border-white/[0.08] text-terracotta-700 dark:text-terracotta-300 hover:bg-warm-100 dark:hover:bg-dark-cardHover transition-colors"
            title="Playback speed"
          >
            {speed}x
          </button>
        </div>
      </div>
    </div>
  );
};
