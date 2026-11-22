import React, { useState, useEffect } from 'react';
import { Modal, Button, AudioPlayer, Badge } from '@/components/common';
import { formatDate, formatDuration } from '@/utils/formatters';
import { audioService } from '@/services/audioService';
import {
  Sparkles,
  FileText,
  Star,
  Trash2,
  Copy,
  Check,
  Clock,
  Calendar,
  Edit3,
  Save,
  X,
  Tag,
} from 'lucide-react';
import type { Note, VoiceNoteCategory } from '@/types';

export interface NoteDetailModalProps {
  note: Note | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleFavorite: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdateNote?: (id: string, updates: Partial<Note>) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  Ideas: '#8B5CF6',
  Business: '#F97316',
  'To-do': '#10B981',
};

export const NoteDetailModal: React.FC<NoteDetailModalProps> = ({
  note,
  isOpen,
  onClose,
  onToggleFavorite,
  onDelete,
  onUpdateNote,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'summary' | 'transcript'>('summary');
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editTranscript, setEditTranscript] = useState('');
  const [editSummary, setEditSummary] = useState('');
  const [editCategory, setEditCategory] = useState<VoiceNoteCategory>('Ideas');
  const [audioSignedUrl, setAudioSignedUrl] = useState<string | null>(null);

  useEffect(() => {
    if (note) {
      setEditTitle(note.title);
      setEditTranscript(note.transcription || note.raw_transcript || '');
      setEditSummary(note.summary || (note.transcription ? note.transcription.slice(0, 160) : ''));
      const catName = typeof note.category === 'string' ? note.category : (note.category as { name?: string })?.name || 'Ideas';
      setEditCategory(catName as VoiceNoteCategory);
      setIsEditing(false);

      if (note.audio_path) {
        audioService.getAudioSignedUrl(note.audio_path).then((res) => {
          if (res.signedUrl) {
            setAudioSignedUrl(res.signedUrl);
          }
        });
      } else {
        setAudioSignedUrl(null);
      }
    }
  }, [note]);

  if (!note) return null;

  const categoryName = typeof note.category === 'string' ? note.category : (note.category as { name?: string })?.name || 'Ideas';
  const categoryColor = CATEGORY_COLORS[categoryName] || '#8B5CF6';
  const durationSecs = note.duration ? Number(note.duration) : note.duration_seconds || 0;
  const transcriptText = note.transcription || note.raw_transcript || note.summary || '';

  const handleCopyTranscript = () => {
    const textToCopy = transcriptText || note.formatted_notes || '';
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSaveEdit = () => {
    if (!editTitle.trim()) return;
    if (onUpdateNote) {
      onUpdateNote(note.id, {
        title: editTitle.trim(),
        transcription: editTranscript,
        raw_transcript: editTranscript,
        summary: editSummary,
        category: editCategory,
      });
    }
    setIsEditing(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title={
        isEditing ? (
          <span className="text-base font-bold text-charcoal-900 dark:text-white">
            Edit Voice Note
          </span>
        ) : (
          <div className="flex items-center gap-2">
            <Badge colorHex={categoryColor} size="sm" dot>
              {categoryName}
            </Badge>
            <span className="truncate">{note.title}</span>
          </div>
        )
      }
      description={
        isEditing
          ? 'Make edits to your title, category or transcribed text.'
          : `Recorded on ${formatDate(note.created_at)}`
      }
    >
      <div className="space-y-6">
        {/* Audio Player Section */}
        {durationSecs > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-charcoal-500 dark:text-dark-muted font-medium">
              <span className="flex items-center gap-1.5 font-semibold">
                <Clock className="w-3.5 h-3.5 text-glowOrange-500" />
                Audio Recording ({formatDuration(durationSecs)})
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {formatDate(note.created_at)}
              </span>
            </div>
            <AudioPlayer durationSeconds={durationSecs} audioUrl={audioSignedUrl} />
          </div>
        )}

        {/* Editing Mode View */}
        {isEditing ? (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-charcoal-700 dark:text-charcoal-200">
                Note Title
              </label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full rounded-xl border border-charcoal-200 dark:border-dark-border bg-white dark:bg-dark-card px-3.5 py-2 text-sm text-charcoal-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-glowOrange-500/20"
              />
            </div>

            {/* Category selection (Ideas, Business, To-do) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-charcoal-700 dark:text-charcoal-200 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-glowOrange-500" />
                Category
              </label>
              <div className="flex flex-wrap gap-2">
                {(['Ideas', 'Business', 'To-do'] as VoiceNoteCategory[]).map((catName) => {
                  const isSelected = editCategory === catName;
                  return (
                    <button
                      key={catName}
                      type="button"
                      onClick={() => setEditCategory(catName)}
                      className={`rounded-full transition-all ${
                        isSelected ? 'ring-2 ring-glowOrange-500' : 'opacity-70 hover:opacity-100'
                      }`}
                    >
                      <Badge colorHex={CATEGORY_COLORS[catName]} size="md" dot>
                        {catName}
                      </Badge>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-charcoal-700 dark:text-charcoal-200">
                Summary / Quick Takeaway
              </label>
              <textarea
                rows={2}
                value={editSummary}
                onChange={(e) => setEditSummary(e.target.value)}
                className="w-full rounded-xl border border-charcoal-200 dark:border-dark-border bg-white dark:bg-dark-card px-3.5 py-2 text-xs text-charcoal-800 dark:text-charcoal-200 focus:outline-none focus:ring-2 focus:ring-glowOrange-500/20"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-charcoal-700 dark:text-charcoal-200">
                Transcribed Text
              </label>
              <textarea
                rows={4}
                value={editTranscript}
                onChange={(e) => setEditTranscript(e.target.value)}
                className="w-full rounded-xl border border-charcoal-200 dark:border-dark-border bg-white dark:bg-dark-card px-3.5 py-2 text-xs text-charcoal-800 dark:text-charcoal-200 focus:outline-none focus:ring-2 focus:ring-glowOrange-500/20 font-mono"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(false)}
                leftIcon={<X className="w-3.5 h-3.5" />}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveEdit}
                leftIcon={<Save className="w-3.5 h-3.5" />}
                className="bg-glowOrange-500 hover:bg-glowOrange-600 text-white"
              >
                Save Changes
              </Button>
            </div>
          </div>
        ) : (
          /* Normal Display Mode */
          <>
            {/* View Tabs */}
            <div className="flex items-center justify-between border-b border-charcoal-100 dark:border-dark-border pb-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('summary')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    activeTab === 'summary'
                      ? 'bg-terracotta-100 text-terracotta-800 dark:bg-terracotta-950/60 dark:text-terracotta-300'
                      : 'text-charcoal-500 hover:text-charcoal-800 dark:text-dark-muted dark:hover:text-white'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-glowOrange-500" />
                  Executive Summary
                </button>

                <button
                  onClick={() => setActiveTab('transcript')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    activeTab === 'transcript'
                      ? 'bg-terracotta-100 text-terracotta-800 dark:bg-terracotta-950/60 dark:text-terracotta-300'
                      : 'text-charcoal-500 hover:text-charcoal-800 dark:text-dark-muted dark:hover:text-white'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  Transcribed Text
                </button>
              </div>

              <div className="flex items-center gap-1">
                {onUpdateNote && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-charcoal-500 hover:text-charcoal-900 dark:text-dark-muted dark:hover:text-white hover:bg-warm-100 dark:hover:bg-dark-card transition-colors"
                    title="Edit note"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                )}

                <button
                  onClick={handleCopyTranscript}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-charcoal-500 hover:text-charcoal-800 dark:text-dark-muted dark:hover:text-white hover:bg-warm-100 dark:hover:bg-dark-card transition-colors"
                  title="Copy content"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-mivoGreen-600" />
                      <span className="text-mivoGreen-600">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Tab 1: AI Summary & Formatted Notes */}
            {activeTab === 'summary' && (
              <div className="space-y-4">
                {note.summary && (
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-terracotta-50 via-warm-100 to-warm-50 dark:from-terracotta-950/30 dark:via-dark-card dark:to-dark-surface border border-terracotta-200/60 dark:border-terracotta-900/40">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-terracotta-800 dark:text-terracotta-300 mb-1.5">
                      <Sparkles className="w-4 h-4 text-glowOrange-500" />
                      Key Takeaway
                    </div>
                    <p className="text-sm text-charcoal-800 dark:text-charcoal-200 leading-relaxed font-medium">
                      {note.summary}
                    </p>
                  </div>
                )}

                {note.formatted_notes && (
                  <div className="space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-charcoal-400 dark:text-dark-muted">
                      Structured Points
                    </span>
                    <div className="p-4 rounded-2xl bg-warm-100/80 dark:bg-dark-surface border border-black/[0.04] dark:border-white/[0.06] text-xs text-charcoal-700 dark:text-charcoal-300 whitespace-pre-wrap leading-relaxed">
                      {note.formatted_notes}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Raw Transcribed Text */}
            {activeTab === 'transcript' && (
              <div className="p-4 rounded-2xl bg-warm-100/80 dark:bg-dark-surface border border-black/[0.04] dark:border-white/[0.06] text-xs text-charcoal-700 dark:text-charcoal-300 whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto font-mono">
                {transcriptText || 'No transcript text available for this voice recording.'}
              </div>
            )}
          </>
        )}

        {/* Bottom Actions Bar */}
        <div className="flex items-center justify-between pt-4 border-t border-charcoal-100 dark:border-dark-border">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onToggleFavorite(note.id)}
              leftIcon={
                <Star
                  className={`w-3.5 h-3.5 ${
                    note.is_favorite ? 'fill-amber-400 text-amber-400' : ''
                  }`}
                />
              }
            >
              {note.is_favorite ? 'Favorited' : 'Favorite'}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onDelete(note.id);
                onClose();
              }}
              leftIcon={<Trash2 className="w-3.5 h-3.5 text-red-500" />}
              className="text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
            >
              Delete
            </Button>
          </div>

          <Button variant="secondary" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
