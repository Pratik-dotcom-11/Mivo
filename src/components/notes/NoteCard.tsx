import React, { useState, useEffect } from 'react';
import { Card, Badge, AudioPlayer } from '@/components/common';
import { formatDate, formatDuration } from '@/utils/formatters';
import { audioService } from '@/services/audioService';
import { Star, Trash2, Clock, Sparkles } from 'lucide-react';
import type { Note } from '@/types';

export interface NoteCardProps {
  note: Note;
  onClick: () => void;
  onToggleFavorite: (id: string) => void;
  onDelete: (id: string) => void;
  viewMode?: 'grid' | 'list';
}

const CATEGORY_COLORS: Record<string, string> = {
  Ideas: '#8B5CF6',
  Business: '#F97316',
  'To-do': '#10B981',
};

export const NoteCard: React.FC<NoteCardProps> = ({
  note,
  onClick,
  onToggleFavorite,
  onDelete,
  viewMode = 'grid',
}) => {
  const [audioUrl, setAudioUrl] = useState<string | null>(note.signedAudioUrl || null);

  const categoryName =
    typeof note.category === 'string'
      ? note.category
      : (note.category as { name?: string })?.name || 'Ideas';

  const categoryColor = CATEGORY_COLORS[categoryName] || '#8B5CF6';
  const durationSecs = note.duration ? Number(note.duration) : note.duration_seconds || 0;
  const transcriptText = note.transcription || note.summary || note.raw_transcript || '';

  // Retrieve signed audio URL if audio_path exists
  useEffect(() => {
    let isMounted = true;
    if (note.audio_path && !audioUrl) {
      audioService.getAudioSignedUrl(note.audio_path).then((res) => {
        if (isMounted && res.signedUrl) {
          setAudioUrl(res.signedUrl);
        }
      });
    }
    return () => {
      isMounted = false;
    };
  }, [note.audio_path]);

  // List view layout
  if (viewMode === 'list') {
    return (
      <Card
        hoverable
        onClick={onClick}
        padding="sm"
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group cursor-pointer"
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(note.id);
            }}
            className="text-charcoal-300 dark:text-dark-muted hover:text-amber-500 transition-colors p-1"
            title="Toggle favorite"
          >
            <Star
              className={`w-4 h-4 ${
                note.is_favorite ? 'fill-amber-400 text-amber-400' : ''
              }`}
            />
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-sm text-charcoal-900 dark:text-white truncate group-hover:text-glowOrange-600 dark:group-hover:text-glowOrange-400 transition-colors">
                {note.title}
              </h4>
              <Badge colorHex={categoryColor} size="sm" dot>
                {categoryName}
              </Badge>
            </div>
            <p className="text-xs text-charcoal-500 dark:text-dark-muted truncate mt-0.5">
              {transcriptText || 'No transcript text available.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 self-end sm:self-center text-xs text-charcoal-400 dark:text-dark-muted flex-shrink-0">
          {/* Audio preview in list view */}
          {durationSecs > 0 && (
            <div onClick={(e) => e.stopPropagation()} className="w-36">
              <AudioPlayer durationSeconds={durationSecs} audioUrl={audioUrl} compact />
            </div>
          )}

          <span>{formatDate(note.created_at)}</span>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(note.id);
            }}
            className="p-1.5 text-charcoal-300 hover:text-red-500 dark:text-dark-muted dark:hover:text-red-400 rounded-lg hover:bg-warm-100 dark:hover:bg-dark-card transition-colors"
            title="Delete note"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </Card>
    );
  }

  // Grid view layout
  return (
    <Card
      hoverable
      onClick={onClick}
      className="flex flex-col justify-between group h-full relative cursor-pointer"
    >
      <div>
        {/* Card Header: Category & Favorite */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <Badge colorHex={categoryColor} size="sm" dot>
            {categoryName}
          </Badge>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(note.id);
            }}
            className="text-charcoal-300 dark:text-dark-muted hover:text-amber-500 transition-colors p-1 -mr-1"
            title="Toggle favorite"
          >
            <Star
              className={`w-4 h-4 ${
                note.is_favorite ? 'fill-amber-400 text-amber-400' : ''
              }`}
            />
          </button>
        </div>

        {/* Note Title */}
        <h4 className="font-bold text-base text-charcoal-900 dark:text-white line-clamp-1 group-hover:text-glowOrange-600 dark:group-hover:text-glowOrange-400 transition-colors mb-2">
          {note.title}
        </h4>

        {/* Transcription Preview */}
        <p className="text-xs text-charcoal-600 dark:text-dark-muted line-clamp-3 leading-relaxed mb-4">
          {transcriptText || 'No transcript text available.'}
        </p>

        {/* Audio Playback Control if Audio Exists */}
        {durationSecs > 0 && (
          <div className="mb-4" onClick={(e) => e.stopPropagation()}>
            <AudioPlayer durationSeconds={durationSecs} audioUrl={audioUrl} compact />
          </div>
        )}
      </div>

      {/* Card Footer: Timestamps, duration & actions */}
      <div className="pt-3 border-t border-charcoal-100/80 dark:border-dark-border flex items-center justify-between text-[11px] text-charcoal-400 dark:text-dark-muted">
        <div className="flex items-center gap-2">
          {durationSecs > 0 && (
            <span className="flex items-center gap-1 font-mono font-semibold">
              <Clock className="w-3 h-3 text-glowOrange-500" />
              {formatDuration(durationSecs)}
            </span>
          )}
          <span>{formatDate(note.created_at)}</span>
        </div>

        <div className="flex items-center gap-1">
          {note.transcription && (
            <span
              className="p-1 rounded-md text-glowOrange-600 dark:text-glowOrange-400"
              title="Voice transcribed"
            >
              <Sparkles className="w-3 h-3" />
            </span>
          )}

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(note.id);
            }}
            className="p-1 text-charcoal-300 hover:text-red-500 dark:text-dark-muted dark:hover:text-red-400 rounded-md transition-colors"
            title="Delete note"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </Card>
  );
};
