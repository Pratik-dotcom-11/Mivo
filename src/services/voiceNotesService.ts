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

export const voiceNotesService = {
  /**
   * Fetch all voice notes for an authenticated user with optional category & search filters
   */
  async getNotes(
    userId: string,
    options?: VoiceNoteFilterOptions
  ): Promise<{ data: VoiceNote[] | null; error: Error | null }> {
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
      if (error) throw error;

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
      return {
        data: null,
        error: err instanceof Error ? err : new Error('Failed to fetch voice notes from Supabase'),
      };
    }
  },

  /**
   * Fetch a single note by UUID
   */
  async getNoteById(noteId: string): Promise<{ data: VoiceNote | null; error: Error | null }> {
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
