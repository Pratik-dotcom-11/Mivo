import { supabase } from '@/lib/supabase';
import { audioService } from './audioService';
import type {
  VoiceNote,
  VoiceNoteInsert,
  VoiceNoteUpdate,
  VoiceNoteFilterOptions,
} from '@/types/notes';
import type { Database } from '@/types/database';

type DbVoiceNoteInsert = Database['public']['Tables']['voice_notes']['Insert'];
type DbVoiceNoteUpdate = Database['public']['Tables']['voice_notes']['Update'];

const DEMO_STORAGE_KEY = 'mivo_demo_voice_notes';

const INITIAL_DEMO_NOTES: VoiceNote[] = [
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

function getDemoStore(): VoiceNote[] {
  if (typeof window === 'undefined') return INITIAL_DEMO_NOTES;
  try {
    const raw = localStorage.getItem(DEMO_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(INITIAL_DEMO_NOTES));
      return INITIAL_DEMO_NOTES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_DEMO_NOTES;
  }
}

function saveDemoStore(notes: VoiceNote[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(notes));
  } catch {
    // ignore
  }
}

export const voiceNotesService = {
  /**
   * Fetch all voice notes for an authenticated user with optional category & search filters
   */
  async getNotes(
    userId: string,
    options?: VoiceNoteFilterOptions
  ): Promise<{ data: VoiceNote[] | null; error: Error | null }> {
    // Seamless local handling for demo session to prevent database sync errors
    if (!userId || userId.startsWith('demo-user')) {
      let demoList = getDemoStore();
      if (options?.category) {
        demoList = demoList.filter((n) => n.category === options.category);
      }
      if (options?.searchQuery) {
        const q = options.searchQuery.toLowerCase();
        demoList = demoList.filter(
          (n) =>
            n.title.toLowerCase().includes(q) ||
            n.transcription?.toLowerCase().includes(q)
        );
      }
      return { data: demoList, error: null };
    }

    try {
      let query = supabase
        .from('voice_notes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (options?.category) {
        query = query.eq('category', options.category);
      }

      if (options?.searchQuery) {
        query = query.or(
          `title.ilike.%${options.searchQuery}%,transcription.ilike.%${options.searchQuery}%`
        );
      }

      const { data, error } = await query;
      if (error) {
        console.error('[Mivo Supabase] Fetch voice_notes error:', error);
        throw error;
      }

      // Transform rows to VoiceNote format with helper aliases
      const notes: VoiceNote[] = (data || []).map((row) => ({
        ...row,
        summary: row.transcription ? row.transcription.slice(0, 160) : null,
        formatted_notes: row.transcription || null,
        raw_transcript: row.transcription || null,
        duration_seconds: row.duration ? Number(row.duration) : 0,
      }));

      return { data: notes, error: null };
    } catch (err: unknown) {
      const errMsg =
        err && typeof err === 'object' && 'message' in err
          ? (err as { message: string }).message
          : 'Failed to fetch voice notes from Supabase';
      return {
        data: null,
        error: new Error(errMsg),
      };
    }
  },

  /**
   * Fetch a single note by UUID
   */
  async getNoteById(noteId: string): Promise<{ data: VoiceNote | null; error: Error | null }> {
    if (noteId.startsWith('demo-note')) {
      const demoList = getDemoStore();
      const found = demoList.find((n) => n.id === noteId) || null;
      return { data: found, error: null };
    }

    try {
      const { data, error } = await supabase
        .from('voice_notes')
        .select('*')
        .eq('id', noteId)
        .single();

      if (error) throw error;
      if (!data) return { data: null, error: null };

      let signedUrl: string | null = null;
      if (data.audio_path) {
        const urlRes = await audioService.getAudioSignedUrl(data.audio_path);
        signedUrl = urlRes.signedUrl;
      }

      const note: VoiceNote = {
        ...data,
        signedAudioUrl: signedUrl,
        summary: data.transcription ? data.transcription.slice(0, 160) : null,
        formatted_notes: data.transcription || null,
        raw_transcript: data.transcription || null,
        duration_seconds: data.duration ? Number(data.duration) : 0,
      };

      return { data: note, error: null };
    } catch (err: unknown) {
      return {
        data: null,
        error: err instanceof Error ? err : new Error('Failed to fetch note'),
      };
    }
  },

  /**
   * Insert a new voice note
   */
  async createNote(
    note: VoiceNoteInsert
  ): Promise<{ data: VoiceNote | null; error: Error | null }> {
    if (note.user_id.startsWith('demo-user')) {
      const newDemoNote: VoiceNote = {
        id: `demo-note-${Date.now()}`,
        user_id: note.user_id,
        title: note.title || 'Untitled Voice Note',
        transcription: note.transcription || null,
        category: note.category || 'Ideas',
        audio_path: note.audio_path || null,
        duration: note.duration || null,
        duration_seconds: note.duration ? Number(note.duration) : 0,
        summary: note.transcription ? note.transcription.slice(0, 160) : null,
        formatted_notes: note.transcription || null,
        raw_transcript: note.transcription || null,
        is_favorite: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      const store = getDemoStore();
      saveDemoStore([newDemoNote, ...store]);
      return { data: newDemoNote, error: null };
    }

    try {
      const insertPayload: DbVoiceNoteInsert = {
        user_id: note.user_id,
        title: note.title || 'Untitled Voice Note',
        transcription: note.transcription || null,
        category: note.category || 'Ideas',
        audio_path: note.audio_path || null,
        duration: note.duration || null,
      };

      const { data, error } = await supabase
        .from('voice_notes')
        .insert(insertPayload)
        .select()
        .single();

      if (error) throw error;

      const createdNote: VoiceNote = {
        ...data,
        summary: data.transcription ? data.transcription.slice(0, 160) : null,
        formatted_notes: data.transcription || null,
        raw_transcript: data.transcription || null,
        duration_seconds: data.duration ? Number(data.duration) : 0,
      };

      return { data: createdNote, error: null };
    } catch (err: unknown) {
      return {
        data: null,
        error: err instanceof Error ? err : new Error('Failed to create voice note'),
      };
    }
  },

  /**
   * Update an existing voice note
   */
  async updateNote(
    noteId: string,
    updates: VoiceNoteUpdate
  ): Promise<{ data: VoiceNote | null; error: Error | null }> {
    if (noteId.startsWith('demo-note')) {
      const store = getDemoStore();
      const updatedList = store.map((n) => {
        if (n.id === noteId) {
          return {
            ...n,
            ...updates,
            summary: updates.transcription !== undefined ? (updates.transcription ? updates.transcription.slice(0, 160) : null) : n.summary,
            formatted_notes: updates.transcription !== undefined ? updates.transcription : n.formatted_notes,
            raw_transcript: updates.transcription !== undefined ? updates.transcription : n.raw_transcript,
            updated_at: new Date().toISOString(),
          };
        }
        return n;
      });
      saveDemoStore(updatedList);
      const found = updatedList.find((n) => n.id === noteId) || null;
      return { data: found, error: null };
    }

    try {
      const updatePayload: DbVoiceNoteUpdate = {
        ...updates,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('voice_notes')
        .update(updatePayload)
        .eq('id', noteId)
        .select()
        .single();

      if (error) throw error;

      const updatedNote: VoiceNote = {
        ...data,
        summary: data.transcription ? data.transcription.slice(0, 160) : null,
        formatted_notes: data.transcription || null,
        raw_transcript: data.transcription || null,
        duration_seconds: data.duration ? Number(data.duration) : 0,
      };

      return { data: updatedNote, error: null };
    } catch (err: unknown) {
      return {
        data: null,
        error: err instanceof Error ? err : new Error('Failed to update voice note'),
      };
    }
  },

  /**
   * Delete a voice note and its associated audio file from storage
   */
  async deleteNote(
    noteId: string,
    audioPath?: string | null
  ): Promise<{ success: boolean; error: Error | null }> {
    if (noteId.startsWith('demo-note')) {
      const store = getDemoStore();
      saveDemoStore(store.filter((n) => n.id !== noteId));
      return { success: true, error: null };
    }

    try {
      // 1. Delete audio file from private storage bucket if exists
      if (audioPath) {
        await audioService.deleteAudio(audioPath);
      }

      // 2. Delete database row
      const { error } = await supabase.from('voice_notes').delete().eq('id', noteId);
      if (error) throw error;

      return { success: true, error: null };
    } catch (err: unknown) {
      return {
        success: false,
        error: err instanceof Error ? err : new Error('Failed to delete voice note'),
      };
    }
  },
};
