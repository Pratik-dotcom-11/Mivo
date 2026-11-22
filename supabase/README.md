# Mivo — Supabase Architecture & Deployment Guide

This directory houses the official database migrations, Row Level Security (RLS) policies, Storage configurations, and Edge Functions for **Mivo**.

## 1. Database Architecture: `voice_notes`

The primary PostgreSQL table is `public.voice_notes`:

| Column | Type | Constraints & Defaults | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Unique note identifier |
| `user_id` | `UUID` | `NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE` | Authenticated owner |
| `title` | `TEXT` | `NOT NULL DEFAULT 'Untitled Voice Note'` | Note title |
| `transcription` | `TEXT` | Nullable | Full speech-to-text transcript |
| `category` | `TEXT` | `NOT NULL CHECK (category IN ('Ideas', 'Business', 'To-do')) DEFAULT 'Ideas'` | Strict category partition |
| `audio_path` | `TEXT` | Nullable | Path in `voice-recordings` bucket |
| `duration` | `NUMERIC(10,2)` | Nullable | Audio length in seconds |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT timezone('utc'::text, now())` | Creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT timezone('utc'::text, now())` | Auto-updating timestamp |

### Row Level Security (RLS) Policies
- `SELECT`: `auth.uid() = user_id` (Users only view their own notes)
- `INSERT`: `auth.uid() = user_id` (Users only insert under their own ID)
- `UPDATE`: `auth.uid() = user_id` (Users only update their own notes)
- `DELETE`: `auth.uid() = user_id` (Users only delete their own notes)

---

## 2. Audio Storage: `voice-recordings`

- **Visibility**: **Private** (`public = false`).
- **File Organization**: `<user_id>/<timestamp>.<ext>`.
- **Upload Limit**: 25 MB (`26214400` bytes).
- **Allowed MIME Types**: `audio/webm`, `audio/mp4`, `audio/mpeg`, `audio/wav`, `audio/ogg`, `audio/x-m4a`.
- **Playback Access**: Generated via temporary Signed URLs (`createSignedUrl(path, 3600)`).
- **Storage Policies**: Restricts read/write/delete to `(storage.foldername(name))[1] = auth.uid()::text`.

---

## 3. Step-by-Step Production Deployment

### Option A: Using the Supabase CLI
```bash
# 1. Link to your remote Supabase project
supabase link --project-ref your-project-id

# 2. Apply the database migration
supabase db push

# 3. Deploy the Edge Function
supabase functions deploy transcribe-audio

# 4. Set your OpenAI secret for Whisper Speech-to-Text
supabase secrets set OPENAI_API_KEY=your-openai-api-key
```

### Option B: Using the Supabase Web Dashboard
1. Open your project at [https://supabase.com/dashboard](https://supabase.com/dashboard).
2. Go to **SQL Editor** -> Click **New Query**.
3. Paste the contents of `supabase/migrations/20260102000000_create_voice_notes.sql` and click **Run**.
4. Go to **Project Settings** -> **API**:
   - Copy **Project URL** into `VITE_SUPABASE_URL` in `.env`.
   - Copy **anon public** key into `VITE_SUPABASE_ANON_KEY` in `.env`.
