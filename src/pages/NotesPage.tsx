import React, { useState, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNotes } from '@/hooks/useNotes';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { audioService } from '@/services/audioService';
import { transcriptionService } from '@/services/transcriptionService';
import { AppLayout } from '@/layouts/AppLayout';
import { Input, Button, Spinner } from '@/components/common';
import { InlineRecorderBar } from '@/components/recorder/InlineRecorderBar';
import { VoiceRecorderModal } from '@/components/recorder/VoiceRecorderModal';
import { NoteCard } from '@/components/notes/NoteCard';
import { NoteDetailModal } from '@/components/notes/NoteDetailModal';
import { DeleteConfirmationModal } from '@/components/notes/DeleteConfirmationModal';
import { CategoryFilterPills } from '@/components/notes/CategoryFilterPill';
import { ViewToggle } from '@/components/notes/ViewToggle';
import { formatDuration } from '@/utils/formatters';
import {
  Search,
  Mic,
  AudioWaveform,
  Sparkles,
  Briefcase,
  ListTodo,
  FileText,
  CheckCircle2,
  AlertCircle,
  Plus,
  RefreshCw,
} from 'lucide-react';
import type { Note, VoiceNoteCategory, CategoryInfo } from '@/types';

// Curated demo notes only for local preview when Supabase is not configured
const DEMO_PREVIEW_NOTES: Note[] = [
  {
    id: 'demo-note-1',
    user_id: 'demo-user-mivo-001',
    title: 'Podcast Episode on AI Agent Workflows',
    transcription:
      "I was thinking about the upcoming podcast episode. We should really focus on AI agent workflows and how autonomous swarms coordinate through shared message boards. It's fascinating how durable execution prevents agent stall.",
    summary:
      'Discuss how autonomous multi-agent swarms orchestrate complex engineering tasks and collaborate through message queues.',
    formatted_notes:
      '• Introduce reactive wakeup systems\n• Compare single-turn vs durable execution\n• Guest: Autonomous system researcher',
    category: 'Ideas',
    audio_path: null,
    duration: 78,
    duration_seconds: 78,
    is_favorite: true,
    created_at: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
  },
  {
    id: 'demo-note-2',
    user_id: 'demo-user-mivo-001',
    title: 'Q4 Product Roadmap & Enterprise Expansion',
    transcription:
      'Roadmap check-in: we need to finalize the business subscription plans and team collaboration features. Transcription accuracy for enterprise customers has been rated top tier, so let’s prepare for general availability.',
    summary:
      'Finalize enterprise subscription tiers, team voice transcription workspaces, and SOC2 compliance milestone.',
    formatted_notes:
      '• Review customer feedback on audio transcription accuracy\n• Plan Q4 marketing launch for voice search\n• Finalize pricing tiers',
    category: 'Business',
    audio_path: null,
    duration: 142,
    duration_seconds: 142,
    is_favorite: true,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: 'demo-note-3',
    user_id: 'demo-user-mivo-001',
    title: 'Sprint Deliverables & Database Schema Review',
    transcription:
      'Sprint checklist: verify database schema migrations for voice_notes table, test the private audio storage bucket permissions, and ensure the theme switcher retains user preferences across page refreshes.',
    summary:
      'Verify Supabase PostgreSQL migrations, private storage bucket RLS policies, and run integration tests.',
    formatted_notes:
      '• Run migration 20260102000000_create_voice_notes.sql\n• Validate storage RLS upload rules\n• Check theme persistence in localStorage',
    category: 'To-do',
    audio_path: null,
    duration: 96,
    duration_seconds: 96,
    is_favorite: false,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
  },
];

export interface NotesPageProps {
  onNavigateToLanding?: () => void;
}

export const NotesPage: React.FC<NotesPageProps> = ({ onNavigateToLanding }) => {
  const { user, profile, isConfigured } = useAuth();
  const [localDemoNotes, setLocalDemoNotes] = useState<Note[]>(DEMO_PREVIEW_NOTES);
  const [activeCategory, setActiveCategory] = useState<VoiceNoteCategory | null>(null);
  const [favoriteOnly, setFavoriteOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isStudioModalOpen, setIsStudioModalOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [noteToDelete, setNoteToDelete] = useState<Note | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Hook connecting directly to Supabase voice_notes table
  const {
    notes: cloudNotes,
    categories: appCategories,
    isLoading: isNotesLoading,
    error: notesError,
    addNote,
    updateNote,
    removeNote,
    reload: reloadNotes,
  } = useNotes();

  const recorderHook = useAudioRecorder();

  // Show toast notification with automatic timeout
  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // When Supabase is configured and a user is authenticated, use 100% real database records
  const allNotes: Note[] = useMemo(() => {
    if (isConfigured && user) {
      return cloudNotes;
    }
    return localDemoNotes;
  }, [isConfigured, user, cloudNotes, localDemoNotes]);

  // Section 2: Calculate overview statistics from actual records
  const overviewStats = useMemo(() => {
    const total = allNotes.length;
    const ideas = allNotes.filter((n) => n.category === 'Ideas').length;
    const business = allNotes.filter((n) => n.category === 'Business').length;
    const todo = allNotes.filter((n) => n.category === 'To-do').length;
    return { total, ideas, business, todo };
  }, [allNotes]);

  // Section 4 & 5: Filtered notes based on activeCategory and searchQuery
  const filteredNotes = useMemo(() => {
    return allNotes.filter((note) => {
      if (activeCategory && note.category !== activeCategory) {
        return false;
      }
      if (favoriteOnly && !note.is_favorite) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = note.title.toLowerCase().includes(q);
        const matchesTranscript = note.transcription?.toLowerCase().includes(q);
        const matchesSummary = note.summary?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesTranscript && !matchesSummary) {
          return false;
        }
      }
      return true;
    });
  }, [allNotes, activeCategory, favoriteOnly, searchQuery]);

  const favoritesCount = useMemo(() => allNotes.filter((n) => n.is_favorite).length, [allNotes]);

  // Actions
  const handleToggleFavorite = (id: string) => {
    setLocalDemoNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_favorite: !n.is_favorite } : n))
    );
    if (selectedNote && selectedNote.id === id) {
      setSelectedNote((prev) => (prev ? { ...prev, is_favorite: !prev.is_favorite } : null));
    }
  };

  // Trigger delete confirmation modal
  const handleRequestDelete = (id: string) => {
    const target = allNotes.find((n) => n.id === id);
    if (target) {
      setNoteToDelete(target);
    }
  };

  // Perform confirmed deletion
  const handleConfirmDelete = async () => {
    if (!noteToDelete) return;
    setIsDeleting(true);

    try {
      if (isConfigured && user) {
        const res = await removeNote(noteToDelete.id, noteToDelete.audio_path);
        if (res.error) {
          showToast('error', `Failed to delete note: ${res.error.message}`);
        } else {
          showToast('success', 'Voice note permanently deleted.');
        }
      } else {
        setLocalDemoNotes((prev) => prev.filter((n) => n.id !== noteToDelete.id));
        showToast('success', 'Voice note deleted (demo mode).');
      }

      if (selectedNote && selectedNote.id === noteToDelete.id) {
        setSelectedNote(null);
      }
    } finally {
      setIsDeleting(false);
      setNoteToDelete(null);
    }
  };

  const handleUpdateNote = async (id: string, updates: Partial<Note>) => {
    if (isConfigured && user) {
      const res = await updateNote(id, {
        title: updates.title,
        transcription: updates.transcription,
        category: updates.category as VoiceNoteCategory,
      });
      if (res.error) {
        showToast('error', `Failed to update note: ${res.error.message}`);
      } else {
        showToast('success', 'Note updated successfully.');
      }
    } else {
      setLocalDemoNotes((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, ...updates, updated_at: new Date().toISOString() } : n
        )
      );
      showToast('success', 'Note updated (demo mode).');
    }

    if (selectedNote && selectedNote.id === id) {
      setSelectedNote((prev) =>
        prev ? { ...prev, ...updates, updated_at: new Date().toISOString() } : null
      );
    }
  };

  const handleSaveRecordedNote = async (newNote: {
    title: string;
    transcription: string;
    category: VoiceNoteCategory;
    duration: number;
    audioBlob?: Blob;
  }) => {
    let uploadedAudioPath: string | null = null;

    // Upload audio to private 'voice-recordings' bucket if authenticated & blob exists
    if (user && newNote.audioBlob) {
      const uploadRes = await audioService.uploadAudio(user.id, newNote.audioBlob);
      if (uploadRes.path) {
        uploadedAudioPath = uploadRes.path;
      } else if (uploadRes.error) {
        console.warn('[Mivo] Audio storage upload warning:', uploadRes.error.message);
      }
    }

    if (isConfigured && user) {
      const res = await addNote({
        title: newNote.title,
        transcription: newNote.transcription,
        category: newNote.category,
        duration: newNote.duration,
        audio_path: uploadedAudioPath,
      });

      if (res.error) {
        showToast('error', `Failed to save note: ${res.error.message}`);
      } else {
        showToast('success', 'Voice note saved to Supabase!');
      }
    } else {
      const createdNote: Note = {
        id: `note-${Date.now()}`,
        user_id: user?.id || 'demo-user',
        title: newNote.title,
        transcription: newNote.transcription,
        summary: newNote.transcription.slice(0, 160),
        category: newNote.category,
        duration: newNote.duration,
        duration_seconds: newNote.duration,
        audio_path: uploadedAudioPath,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_favorite: false,
      };

      setLocalDemoNotes((prev) => [createdNote, ...prev]);
      showToast('success', 'Voice note saved locally (demo mode).');
    }
  };

  const handleQuickInlineStop = async () => {
    const res = await recorderHook.stopRecording();
    if (res) {
      const transcribeRes = await transcriptionService.transcribeAudio(
        res.blob,
        res.durationSeconds
      );
      const text =
        transcribeRes.transcription ||
        (transcribeRes.error ? `[Transcription notice: ${transcribeRes.error}]` : '');
      const derivedTitle =
        transcribeRes.title || `Voice Note (${formatDuration(res.durationSeconds)})`;

      await handleSaveRecordedNote({
        title: derivedTitle,
        transcription: text,
        category: activeCategory || 'Ideas',
        duration: res.durationSeconds,
        audioBlob: res.blob,
      });
    }
  };

  const handleCategorySelect = (categoryId: string | null) => {
    const matched = appCategories.find((c) => c.id === categoryId);
    const catName = (matched?.name as VoiceNoteCategory) || null;
    setActiveCategory(catName);
  };

  // Dynamic user greeting
  const displayName =
    profile?.fullName ||
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split('@')[0] ||
    'Creator';

  const hour = new Date().getHours();
  const timeGreeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <AppLayout
      categories={appCategories as CategoryInfo[]}
      activeCategoryId={appCategories.find((c) => c.name === activeCategory)?.id || null}
      onSelectCategory={handleCategorySelect}
      isFavoriteFilterActive={favoriteOnly}
      onToggleFavoriteFilter={() => setFavoriteOnly(!favoriteOnly)}
      onStartRecordClick={() => setIsStudioModalOpen(true)}
      allNotesCount={allNotes.length}
      favoritesCount={favoritesCount}
    >
      <div className="space-y-6">
        {/* Toast Notification Banner */}
        {toast && (
          <div
            className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-soft-xl flex items-center gap-2.5 text-xs font-bold transition-all duration-300 animate-slide-up ${
              toast.type === 'success'
                ? 'bg-emerald-600 text-white shadow-emerald-500/20'
                : 'bg-red-600 text-white shadow-red-500/20'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            <span>{toast.message}</span>
          </div>
        )}

        {/* Database Sync Error Banner */}
        {notesError && (
          <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/40 text-xs text-red-900 dark:text-red-200 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
              <span>Failed to sync notes with Supabase: {notesError}</span>
            </div>
            <Button
              variant="outline"
              size="xs"
              onClick={() => reloadNotes()}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              className="border-red-300 dark:border-red-800 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/40"
            >
              Retry
            </Button>
          </div>
        )}

        {/* Section 1: Welcome Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 sm:p-7 rounded-[2rem] bg-white/85 backdrop-blur-xl border border-white/80 shadow-soft-md">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-black text-charcoal-900 tracking-tight flex items-center gap-2">
              <span>{timeGreeting}, {displayName}</span>
              <span className="text-xl">👋</span>
            </h1>
            <p className="text-xs sm:text-sm text-charcoal-600 font-medium">
              Record your thoughts freely. Mivo turns your recordings into organized, searchable notes.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {onNavigateToLanding && (
              <button
                onClick={onNavigateToLanding}
                className="text-xs font-semibold text-charcoal-600 hover:text-charcoal-900 px-3.5 py-2.5 rounded-xl hover:bg-white/80 transition-colors"
              >
                Landing Page
              </button>
            )}

            <Button
              variant="primary"
              size="md"
              onClick={() => setIsStudioModalOpen(true)}
              leftIcon={<Mic className="w-4 h-4" />}
              className="bg-gradient-to-r from-terracotta-600 via-glowOrange-500 to-terracotta-700 hover:from-terracotta-500 hover:to-glowOrange-400 text-white shadow-glow-orange font-bold text-xs sm:text-sm py-2.5 px-5 w-full sm:w-auto"
            >
              Record New Note
            </Button>
          </div>
        </div>

        {/* Section 2: Notes Overview (Calculated from actual database records) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Card 1: Total Notes */}
          <button
            type="button"
            onClick={() => setActiveCategory(null)}
            className={`p-4 sm:p-5 rounded-2xl bg-white/85 backdrop-blur-xl border transition-all text-left shadow-soft-sm hover:shadow-soft-lg hover:-translate-y-0.5 ${
              activeCategory === null
                ? 'border-terracotta-500 ring-2 ring-terracotta-500/25'
                : 'border-white/80'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-charcoal-500">
                Total Notes
              </span>
              <div className="w-8 h-8 rounded-xl bg-warm-100 flex items-center justify-center text-charcoal-700 shadow-soft-xs">
                <FileText className="w-4 h-4 text-terracotta-600" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-charcoal-900">
              {overviewStats.total}
            </div>
            <p className="text-[11px] text-charcoal-500 mt-1 font-medium">
              Saved in your vault
            </p>
          </button>

          {/* Card 2: Ideas */}
          <button
            type="button"
            onClick={() => setActiveCategory(activeCategory === 'Ideas' ? null : 'Ideas')}
            className={`p-4 sm:p-5 rounded-2xl bg-white/85 backdrop-blur-xl border transition-all text-left shadow-soft-sm hover:shadow-soft-lg hover:-translate-y-0.5 ${
              activeCategory === 'Ideas'
                ? 'border-[#8B5CF6] ring-2 ring-[#8B5CF6]/25'
                : 'border-white/80'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#8B5CF6]">
                Ideas
              </span>
              <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-[#8B5CF6] shadow-soft-xs">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-charcoal-900">
              {overviewStats.ideas}
            </div>
            <p className="text-[11px] text-charcoal-500 mt-1 font-medium">
              Creative thoughts
            </p>
          </button>

          {/* Card 3: Business */}
          <button
            type="button"
            onClick={() => setActiveCategory(activeCategory === 'Business' ? null : 'Business')}
            className={`p-4 sm:p-5 rounded-2xl bg-white/85 backdrop-blur-xl border transition-all text-left shadow-soft-sm hover:shadow-soft-lg hover:-translate-y-0.5 ${
              activeCategory === 'Business'
                ? 'border-[#F97316] ring-2 ring-[#F97316]/25'
                : 'border-white/80'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#F97316]">
                Business
              </span>
              <div className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center text-[#F97316] shadow-soft-xs">
                <Briefcase className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-charcoal-900">
              {overviewStats.business}
            </div>
            <p className="text-[11px] text-charcoal-500 mt-1 font-medium">
              Work &amp; strategy
            </p>
          </button>

          {/* Card 4: To-do */}
          <button
            type="button"
            onClick={() => setActiveCategory(activeCategory === 'To-do' ? null : 'To-do')}
            className={`p-4 sm:p-5 rounded-2xl bg-white/85 backdrop-blur-xl border transition-all text-left shadow-soft-sm hover:shadow-soft-lg hover:-translate-y-0.5 ${
              activeCategory === 'To-do'
                ? 'border-[#10B981] ring-2 ring-[#10B981]/25'
                : 'border-white/80'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#10B981]">
                To-do
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-[#10B981] shadow-soft-xs">
                <ListTodo className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-charcoal-900">
              {overviewStats.todo}
            </div>
            <p className="text-[11px] text-charcoal-500 mt-1 font-medium">
              Tasks &amp; actions
            </p>
          </button>
        </div>

        {/* Quick Voice Recorder Bar */}
        <InlineRecorderBar
          isRecording={recorderHook.state === 'recording'}
          duration={recorderHook.duration}
          audioLevel={recorderHook.audioLevel}
          onStart={recorderHook.startRecording}
          onStop={handleQuickInlineStop}
          onOpenStudioModal={() => setIsStudioModalOpen(true)}
        />

        {/* Section 5: Search & Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
          {/* Search field */}
          <div className="w-full sm:w-80">
            <Input
              placeholder="Search by title or transcription..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClear={() => setSearchQuery('')}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>

          {/* Right controls: View toggle and note count */}
          <div className="flex items-center justify-between sm:justify-end gap-3">
            <span className="text-xs font-bold text-charcoal-400 dark:text-dark-muted">
              {filteredNotes.length} {filteredNotes.length === 1 ? 'note' : 'notes'}
            </span>

            <ViewToggle viewMode={viewMode} onChange={setViewMode} />
          </div>
        </div>

        {/* Section 3: Category Navigation */}
        <CategoryFilterPills
          categories={appCategories as CategoryInfo[]}
          activeCategoryId={appCategories.find((c) => c.name === activeCategory)?.id || null}
          onSelectCategory={handleCategorySelect}
          allNotesCount={allNotes.length}
        />

        {/* Loading Indicator */}
        {isNotesLoading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <Spinner size="lg" className="text-terracotta-600 dark:text-terracotta-400" />
            <p className="text-xs font-bold text-charcoal-500 dark:text-dark-muted uppercase tracking-wider">
              Loading notes from Supabase...
            </p>
          </div>
        ) : filteredNotes.length === 0 ? (
          /* Section 7: Three Distinct, Attractive Empty States */
          searchQuery ? (
            /* Empty State 1: Search returns no results */
            <div className="text-center py-16 border-2 border-dashed border-charcoal-200/80 dark:border-dark-border rounded-3xl bg-white/40 dark:bg-dark-card/40 p-8 space-y-4">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-soft-sm">
                <Search className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-charcoal-900 dark:text-white">
                  No notes matching "{searchQuery}"
                </h3>
                <p className="text-xs text-charcoal-500 dark:text-dark-muted max-w-sm mx-auto leading-relaxed">
                  We searched titles and full transcriptions, but found no matching records. Try different keywords.
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setSearchQuery('')}>
                Clear Search
              </Button>
            </div>
          ) : activeCategory ? (
            /* Empty State 2: Selected Category has no notes */
            <div className="text-center py-16 border-2 border-dashed border-charcoal-200/80 dark:border-dark-border rounded-3xl bg-white/40 dark:bg-dark-card/40 p-8 space-y-4">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-terracotta-50 dark:bg-terracotta-950/40 text-terracotta-600 dark:text-terracotta-400 flex items-center justify-center shadow-soft-sm">
                <Sparkles className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-charcoal-900 dark:text-white">
                  No {activeCategory} notes yet
                </h3>
                <p className="text-xs text-charcoal-500 dark:text-dark-muted max-w-sm mx-auto leading-relaxed">
                  You don't have any voice notes organized under <strong>{activeCategory}</strong>.
                </p>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveCategory(null)}
                >
                  View All Notes
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsStudioModalOpen(true)}
                  leftIcon={<Mic className="w-3.5 h-3.5" />}
                  className="bg-glowOrange-500 hover:bg-glowOrange-600 text-white font-bold"
                >
                  Record a {activeCategory} Note
                </Button>
              </div>
            </div>
          ) : (
            /* Empty State 3: No notes exist in the vault at all */
            <div className="text-center py-20 border-2 border-dashed border-charcoal-200/80 dark:border-dark-border rounded-3xl bg-white/40 dark:bg-dark-card/40 p-8 space-y-4">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-tr from-terracotta-600 to-glowOrange-500 text-white flex items-center justify-center shadow-glow-orange">
                <AudioWaveform className="w-8 h-8" />
              </div>
              <div className="space-y-1.5 max-w-md mx-auto">
                <h3 className="text-lg font-black text-charcoal-900 dark:text-white tracking-tight">
                  Your voice note vault is empty
                </h3>
                <p className="text-xs text-charcoal-500 dark:text-dark-muted leading-relaxed">
                  Capture your thoughts, ideas, or meeting takeaways. Mivo converts voice into text and organizes your notes cleanly into Ideas, Business, and To-do.
                </p>
              </div>
              <Button
                variant="primary"
                size="md"
                onClick={() => setIsStudioModalOpen(true)}
                leftIcon={<Plus className="w-4 h-4" />}
                className="bg-gradient-to-r from-terracotta-600 to-glowOrange-500 hover:from-terracotta-500 hover:to-glowOrange-400 text-white shadow-glow-orange font-bold text-xs sm:text-sm py-2.5 px-6"
              >
                Record Your First Note
              </Button>
            </div>
          )
        ) : (
          /* Section 4: Notes List (Grid or List Layout) */
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
                : 'space-y-3'
            }
          >
            {filteredNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                viewMode={viewMode}
                onClick={() => setSelectedNote(note)}
                onToggleFavorite={handleToggleFavorite}
                onDelete={() => handleRequestDelete(note.id)}
              />
            ))}
          </div>
        )}

        {/* Voice Recorder Studio Modal */}
        <VoiceRecorderModal
          isOpen={isStudioModalOpen}
          onClose={() => setIsStudioModalOpen(false)}
          categories={appCategories as CategoryInfo[]}
          recorderHook={recorderHook}
          onSaveNote={handleSaveRecordedNote}
        />

        {/* Section 6: Note Details & Management Modal */}
        <NoteDetailModal
          note={selectedNote}
          isOpen={Boolean(selectedNote)}
          onClose={() => setSelectedNote(null)}
          onToggleFavorite={handleToggleFavorite}
          onDelete={(id) => handleRequestDelete(id)}
          onUpdateNote={handleUpdateNote}
        />

        {/* Confirmation Dialog Before Deletion */}
        <DeleteConfirmationModal
          isOpen={Boolean(noteToDelete)}
          onClose={() => setNoteToDelete(null)}
          onConfirm={handleConfirmDelete}
          noteTitle={noteToDelete?.title || ''}
          isDeleting={isDeleting}
        />
      </div>
    </AppLayout>
  );
};
