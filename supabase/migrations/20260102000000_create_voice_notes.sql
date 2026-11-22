-- ==============================================================================
-- MIVO SUPABASE DATABASE MIGRATION: voice_notes & voice-recordings
-- Application: Mivo — Your voice. Your ideas.
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. CREATE TABLE: voice_notes
CREATE TABLE IF NOT EXISTS public.voice_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Untitled Voice Note',
  transcription TEXT,
  category TEXT NOT NULL CHECK (category IN ('Ideas', 'Business', 'To-do')) DEFAULT 'Ideas',
  audio_path TEXT,
  duration NUMERIC(10, 2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_voice_notes_user_id ON public.voice_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_voice_notes_category ON public.voice_notes(category);
CREATE INDEX IF NOT EXISTS idx_voice_notes_created_at ON public.voice_notes(created_at DESC);

-- 4. AUTOMATIC UPDATED_AT TRIGGER
CREATE OR REPLACE FUNCTION public.handle_voice_notes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_voice_notes_updated_at ON public.voice_notes;
CREATE TRIGGER trigger_voice_notes_updated_at
  BEFORE UPDATE ON public.voice_notes
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_voice_notes_updated_at();

-- 5. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.voice_notes ENABLE ROW LEVEL SECURITY;

-- 6. RLS POLICIES FOR voice_notes
-- Policy 1: Users can only view their own notes
DROP POLICY IF EXISTS "Users can only view their own notes" ON public.voice_notes;
CREATE POLICY "Users can only view their own notes"
  ON public.voice_notes FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy 2: Users can only insert notes under their own user ID
DROP POLICY IF EXISTS "Users can only insert notes under their own user ID" ON public.voice_notes;
CREATE POLICY "Users can only insert notes under their own user ID"
  ON public.voice_notes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy 3: Users can only update their own notes
DROP POLICY IF EXISTS "Users can only update their own notes" ON public.voice_notes;
CREATE POLICY "Users can only update their own notes"
  ON public.voice_notes FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy 4: Users can only delete their own notes
DROP POLICY IF EXISTS "Users can only delete their own notes" ON public.voice_notes;
CREATE POLICY "Users can only delete their own notes"
  ON public.voice_notes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ==============================================================================
-- 7. PRIVATE STORAGE BUCKET: voice-recordings
-- ==============================================================================
-- Create or configure the private voice-recordings bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'voice-recordings',
  'voice-recordings',
  false, -- STRICTLY PRIVATE BUCKET
  26214400, -- 25MB max file size
  ARRAY['audio/webm', 'audio/mp4', 'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/x-m4a']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 26214400,
  allowed_mime_types = ARRAY['audio/webm', 'audio/mp4', 'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/x-m4a'];

-- 8. STORAGE RLS POLICIES FOR voice-recordings
-- Restrict access so authenticated users can ONLY access files in their own folder: <user_id>/...
DROP POLICY IF EXISTS "Users can view their own recordings" ON storage.objects;
CREATE POLICY "Users can view their own recordings"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'voice-recordings' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users can upload their own recordings" ON storage.objects;
CREATE POLICY "Users can upload their own recordings"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'voice-recordings' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users can update their own recordings" ON storage.objects;
CREATE POLICY "Users can update their own recordings"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'voice-recordings' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users can delete their own recordings" ON storage.objects;
CREATE POLICY "Users can delete their own recordings"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'voice-recordings' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );
