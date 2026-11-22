import { Database, VoiceNoteCategory } from './database';

export type { VoiceNoteCategory };

export type VoiceNoteRow = Database['public']['Tables']['voice_notes']['Row'];
export type VoiceNoteInsert = Database['public']['Tables']['voice_notes']['Insert'];
export type VoiceNoteUpdate = Database['public']['Tables']['voice_notes']['Update'];

export interface CategoryInfo {
  id: string;
  name: VoiceNoteCategory;
  color: string;
  icon: string;
}

/**
 * High-level Note entity used across UI components
 */
export interface VoiceNote extends VoiceNoteRow {
  // Pre-signed URL generated for secure playback of private audio
  signedAudioUrl?: string | null;
  // Category metadata for pill badges
  categoryInfo?: CategoryInfo;
  // UI helper aliases for components
  summary?: string | null;
  formatted_notes?: string | null;
  raw_transcript?: string | null;
  duration_seconds?: number;
  is_favorite?: boolean;
  category_id?: string;
  category_metadata?: {
    id: string;
    name: string;
    color: string;
  };
}

export type Note = VoiceNote;
export type Category = CategoryInfo;

export type AudioRecordingState = 'inactive' | 'recording' | 'paused' | 'processing';

export interface AudioRecordResult {
  blob: Blob;
  durationSeconds: number;
  mimeType: string;
}

export interface VoiceNoteFilterOptions {
  category?: VoiceNoteCategory | null;
  searchQuery?: string;
  isFavorite?: boolean;
}

export interface TranscriptionResponse {
  title: string;
  transcription: string;
  suggestedCategory?: VoiceNoteCategory;
  success: boolean;
  transcript?: string;
  summary?: string;
  formattedNotes?: string;
}

export type TranscriptionResult = TranscriptionResponse;
