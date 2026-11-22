export const APP_NAME = 'Mivo';
export const APP_TAGLINE = 'Your voice. Your ideas.';
export const APP_DESCRIPTION = 'Mivo is a minimal AI-powered voice notes application that captures your thoughts with your voice, converts recordings into text, and organizes everything into searchable categories.';

// Supabase private storage bucket for user voice recordings
export const AUDIO_STORAGE_BUCKET = 'voice-recordings';

// Audio recording constraints
export const MAX_RECORDING_DURATION_SECONDS = 300; // 5 minutes max
export const MIN_RECORDING_DURATION_SECONDS = 1;
export const MAX_AUDIO_FILE_SIZE_BYTES = 26214400; // 25 MB

// Allowed categories strictly required by Mivo
export const ALLOWED_CATEGORIES = ['Ideas', 'Business', 'To-do'] as const;
export type AllowedCategory = (typeof ALLOWED_CATEGORIES)[number];

export const DEFAULT_CATEGORIES = [
  { id: 'cat-ideas', name: 'Ideas', color: '#8B5CF6', icon: 'Lightbulb' },
  { id: 'cat-business', name: 'Business', color: '#F97316', icon: 'Briefcase' },
  { id: 'cat-todo', name: 'To-do', color: '#10B981', icon: 'CheckSquare' },
] as const;
