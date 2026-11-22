# Mivo — Your voice. Your ideas.

<p align="center">
  <img src="public/mivo-icon.svg" alt="Mivo Logo" width="80" height="80" style="border-radius: 20px;" onerror="this.style.display='none'" />
</p>

<p align="center">
  <strong>Mivo</strong> is a minimal, AI-powered voice notes web application designed to capture fleeting thoughts, transcribe voice recordings into clear text using OpenAI Whisper via Supabase Edge Functions, and organize ideas with zero friction.
</p>

<p align="center">
  <a href="https://mivo-voice.vercel.app/" target="_blank">
    <img src="https://img.shields.io/badge/Live%20Demo-mivo--voice.vercel.app-C85A32?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Demo" />
  </a>
</p>

<p align="center">
  <a href="https://mivo-voice.vercel.app/" target="_blank"><strong>🌐 Live App</strong></a> •
  <a href="#features">Features</a> •
  <a href="#system-architecture">Architecture</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#supabase-setup">Supabase & Database</a> •
  <a href="#google-oauth-setup">Google OAuth</a> •
  <a href="#deployment">Deployment</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 18" />
  <img src="https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-6.1-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Supabase-Database%20%26%20Auth-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/OpenAI-Whisper-412991?style=for-the-badge&logo=openai&logoColor=white" alt="OpenAI Whisper" />
  <img src="https://img.shields.io/badge/Vercel-Deployment%20Ready-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel" />
</p>

---

## 📌 Problem Statement

Great ideas strike at unexpected moments — during commutes, brainstorming sessions, or late-night reflections. However:
1. **Typing creates friction:** Mobile and desktop keyboards break flow of thought and delay idea capture.
2. **Traditional voice memos are black boxes:** Standard voice recorder apps leave users with unindexed audio files that cannot be searched, categorized, or quickly scanned.
3. **Privacy and sync concerns:** Voice recordings are deeply personal and require strict cryptographic data isolation, private cloud storage, and secure authentication.

**Mivo** solves this by providing a unified, secure platform: tap to speak, visualize your sound in real-time, get an automated AI transcription powered by OpenAI Whisper, and manage notes across clean categories (**Ideas**, **Business**, and **To-do**).

---

## ✨ Key Features

- 🎙️ **Intuitive Voice Recording**
  - High-fidelity in-browser audio capture via the HTML5 `MediaRecorder` API.
  - Live animated waveform visualizer reacting dynamically during recording.
  - Recording duration timer with instantaneous audio preview and retry/cancel flows.
  - Automatic fallback support for WebM, MP4, and standard browser audio codecs.

- 🤖 **AI Speech-to-Text (OpenAI Whisper)**
  - Server-side speech-to-text powered by OpenAI's `whisper-1` model.
  - Executed inside a dedicated **Supabase Edge Function** (`transcribe-audio`) in Deno runtime.
  - **Zero Key Leakage:** OpenAI API keys are kept strictly inside backend secrets and are never exposed to client-side code.

- 🗂️ **Smart Organization & Dashboard**
  - Instant category filtering across **Ideas**, **Business**, and **To-do**.
  - Dynamic category counters computed from actual user database records.
  - Inline title editing, transcript editing, and category switching.
  - Real-time client-side search across note titles and transcript content.

- 🔒 **Enterprise-Grade Security & Row Level Security (RLS)**
  - Secure authentication via **Supabase Auth with Google OAuth**.
  - PostgreSQL Row Level Security (RLS) policies on `public.voice_notes` ensuring users can only read, insert, update, or delete their own data.
  - Dedicated private Supabase Storage bucket (`voice-recordings`) with folder-level isolation (`<user_id>/...`) and short-lived signed URLs for playback.

- 🎨 **Warm Terracotta & Minimalist Design System**
  - Bespoke aesthetic inspired by modern productivity suites: warm terracotta (`#C85A32`), amber glow, and soft cream surfaces.
  - Seamless toggle between **Light Mode** ("Warm Paper & Terracotta") and **Dark Mode** ("Deep Charcoal & Amber Ember").
  - Accessible contrast ratios, crisp typography, and responsive layouts across mobile, tablet, and desktop.

---

## 🏗️ System Architecture

```mermaid
flowchart TD
    User["👤 User Browser (Desktop / Mobile)"]
    
    subgraph Frontend["Mivo Frontend (React + Vite + Tailwind)"]
        Landing["Landing Page (Hero & Showcase)"]
        AuthView["Google OAuth Sign-In Modal"]
        NotesView["Notes Dashboard & Search"]
        Recorder["Voice Recorder Modal & Visualizer"]
    end
    
    subgraph SupabasePlatform["Supabase Cloud Platform"]
        Auth["Supabase Auth (Google OAuth 2.0)"]
        Postgres[("PostgreSQL Database\nTable: public.voice_notes\nRLS Enabled (auth.uid() = user_id)")]
        Storage[("Supabase Storage\nBucket: voice-recordings\nPrivate / Signed URLs")]
        EdgeFn["Edge Function: transcribe-audio\n(Deno Runtime)"]
    end
    
    subgraph AIProvider["OpenAI Cloud API"]
        Whisper["OpenAI Whisper API\n(model: whisper-1)"]
    end

    User -->|Visits| Landing
    User -->|Authenticates| AuthView
    AuthView -->|OAuth Redirect| Auth
    Auth -->|Returns Session JWT| Frontend
    
    User -->|Records Voice Note| Recorder
    Recorder -->|Uploads Raw Audio| Storage
    Recorder -->|Invokes with Audio Path| EdgeFn
    EdgeFn -->|Validates JWT| Auth
    EdgeFn -->|Reads Audio from Storage| Storage
    EdgeFn -->|Transcribes Audio (Server Secret)| Whisper
    Whisper -->|Returns Transcript| EdgeFn
    EdgeFn -->|Saves Note & Returns Text| Postgres
    NotesView -->|Queries / Filters / Edits| Postgres
```

---

## 💻 Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | **React 18** (TypeScript) | Reactive UI components and state management |
| **Build Tool** | **Vite 6** | Ultra-fast development and optimized production bundling |
| **Styling** | **Tailwind CSS 3** | Utility-first styling with custom terracotta/amber theme |
| **Icons** | **Lucide React** | Clean, accessible iconography |
| **Backend & Database** | **Supabase (PostgreSQL 15)** | Relational database with Row Level Security (RLS) |
| **Authentication** | **Supabase Auth** | Google OAuth 2.0 social sign-in and session persistence |
| **Cloud Storage** | **Supabase Storage** | Private bucket for recorded audio files with RLS policies |
| **Serverless Compute**| **Supabase Edge Functions** | Deno-based secure edge runtime for API execution |
| **AI Speech-to-Text** | **OpenAI Whisper** | High-accuracy automated voice transcription |
| **Hosting & CI/CD** | **Vercel** | Edge deployment and continuous integration |

---

## 📸 Application Preview

```
┌────────────────────────────────────────────────────────────────────────┐
│  Mivo   [Search]  [Features]  [Pricing]           [Start for Free]     │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│   THE AI VOICE NOTES PLATFORM                                          │
│   Your thoughts deserve to be remembered.      ┌──────────────────┐    │
│                                                │  Voice Note      │    │
│   Capture your thoughts with your voice.       │  [🎙️ Tap to record│   │
│   Mivo turns your recordings into organized,   │  Max 25MB WebM   │    │
│   searchable notes with zero friction.         └──────────────────┘    │
│                                                ┌──────────────────┐    │
│   [Get Started Free ->]  [Explore Features]    │ Structured Notes │    │
│                                                │ Ideas: 4         │    │
│   (Voice Notes)  (Instant AI Transcript)       │ Business: 2      │    │
│                                                │ To-do: 5         │    │
│                                                └──────────────────┘    │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your machine:
- **Node.js** (v18.0.0 or higher) — [Download Node.js](https://nodejs.org/)
- **npm** (v9.0.0 or higher) or **pnpm**
- A **Supabase** account — [Supabase Signup](https://supabase.com)
- An **OpenAI API Key** (for Whisper speech-to-text) — [OpenAI Platform](https://platform.openai.com)

### 1. Clone the Repository

```bash
git clone https://github.com/Pratik-dotcom-11/Mivo.git
cd Mivo
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory by copying `.env.example`:

```bash
cp .env.example .env
```

Open `.env` and configure your credentials:

```env
# Supabase Project URL (found in Supabase Dashboard > Project Settings > API)
VITE_SUPABASE_URL=https://your-project-id.supabase.co

# Supabase Anon Public Key (safe for frontend use)
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key-here

# Supabase Edge Functions URL
VITE_SUPABASE_FUNCTIONS_URL=https://your-project-id.supabase.co/functions/v1
```

> ⚠️ **Security Warning:** Never place your Supabase `service_role` key or OpenAI API key inside `.env` or client-side code!

### 4. Run Development Server

```bash
npm run dev
```

The application will start at `http://localhost:5173`.

---

## 🗄️ Supabase Setup & Database Schema

### 1. Database Table: `voice_notes`

Run the following SQL in the **Supabase Dashboard SQL Editor** to create the table, indexes, and triggers:

```sql
-- 1. Enable Cryptographic UUID Generator
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Create voice_notes Table
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

-- 3. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_voice_notes_user_id ON public.voice_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_voice_notes_category ON public.voice_notes(category);
CREATE INDEX IF NOT EXISTS idx_voice_notes_created_at ON public.voice_notes(created_at DESC);

-- 4. Auto-update Trigger
CREATE OR REPLACE FUNCTION public.handle_voice_notes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_voice_notes_updated_at
  BEFORE UPDATE ON public.voice_notes
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_voice_notes_updated_at();

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.voice_notes ENABLE ROW LEVEL SECURITY;

-- 6. Granular RLS Policies
CREATE POLICY "Users can only view their own notes"
  ON public.voice_notes FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert notes under their own user ID"
  ON public.voice_notes FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only update their own notes"
  ON public.voice_notes FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only delete their own notes"
  ON public.voice_notes FOR DELETE TO authenticated
  USING (auth.uid() = user_id);
```

### 2. Supabase Storage Bucket Setup

Create a private storage bucket named `voice-recordings`:

```sql
-- Create Private Storage Bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'voice-recordings',
  'voice-recordings',
  false,
  26214400, -- 25MB max size
  ARRAY['audio/webm', 'audio/mp4', 'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/x-m4a']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 26214400,
  allowed_mime_types = ARRAY['audio/webm', 'audio/mp4', 'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/x-m4a'];

-- Storage RLS: Strict Folder-Level Isolation
CREATE POLICY "Users can view their own recordings"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'voice-recordings' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can upload their own recordings"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'voice-recordings' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can update their own recordings"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'voice-recordings' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete their own recordings"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'voice-recordings' AND (storage.foldername(name))[1] = auth.uid()::text);
```

---

## 🔑 Google OAuth Setup

1. **Google Cloud Console:**
   - Navigate to [Google Cloud Console Credentials](https://console.cloud.google.com/apis/credentials).
   - Create an **OAuth 2.0 Client ID** (Application type: *Web application*).
   - Add **Authorized JavaScript Origins**:
     - `http://localhost:5173` (local development)
     - `https://your-mivo-app.vercel.app` (production domain)
   - Add **Authorized Redirect URI**:
     - `https://<your-supabase-project-id>.supabase.co/auth/v1/callback`

2. **Supabase Dashboard:**
   - Go to **Authentication** &rarr; **Providers** &rarr; **Google**.
   - Toggle **Enable Google provider** to `ON`.
   - Paste your Google **Client ID** and **Client Secret**.
   - Go to **URL Configuration**:
     - **Site URL:** `https://mivo-voice.vercel.app` (or `http://localhost:5173` for local dev)
     - **Redirect URLs:** Add `https://mivo-voice.vercel.app/**` and `http://localhost:5173/**`.

---

## 🧠 OpenAI Whisper Speech-to-Text Setup

The transcription logic runs securely inside the `transcribe-audio` Supabase Edge Function located at [supabase/functions/transcribe-audio/index.ts](file:///c:/Users/Pratik%20Ghosh/OneDrive/Desktop/Mivo/supabase/functions/transcribe-audio/index.ts).

### Setting the Secret:
1. In the Supabase Dashboard, go to **Project Settings** &rarr; **Edge Functions** &rarr; **Secrets**.
2. Click **Add New Secret**:
   - **Name:** `OPENAI_API_KEY`
   - **Value:** `sk-proj-...`
3. Click **Save**.

Or configure via Supabase CLI:
```bash
npx supabase secrets set OPENAI_API_KEY=your_openai_api_key_here
```

---

## 🚢 Deployment to Vercel

Mivo is completely optimized for continuous deployment on [Vercel](https://vercel.com).

### 1. Push Code to GitHub
Follow the [Git Instructions](#-git-commands-to-commit--push) below to push your repository.

### 2. Import Project in Vercel
1. Log in to [Vercel](https://vercel.com) and click **Add New** &rarr; **Project**.
2. Select your `mivo` repository from GitHub.
3. Framework Preset: **Vite** (auto-detected).
4. Root Directory: `./`.

### 3. Configure Environment Variables
In the Vercel deployment modal, add:
- `VITE_SUPABASE_URL`: `https://your-project-id.supabase.co`
- `VITE_SUPABASE_ANON_KEY`: `your-supabase-anon-key`
- `VITE_SUPABASE_FUNCTIONS_URL`: `https://your-project-id.supabase.co/functions/v1`

### 4. Deploy & Update Supabase Auth Redirects
1. Click **Deploy**.
2. Live Production URL: **[https://mivo-voice.vercel.app](https://mivo-voice.vercel.app/)**
   - Return to **Supabase Dashboard &rarr; Authentication &rarr; URL Configuration**.
   - Set **Site URL** to `https://mivo-voice.vercel.app`.
   - Add `https://mivo-voice.vercel.app/**` to **Redirect URLs**.
   - In **Google Cloud Console**, add `https://mivo-voice.vercel.app` to Authorized Origins.

---

## 📦 Git Commands to Commit & Push

Run the following commands in your local project root:

```bash
# 1. Initialize git repository (if not already initialized)
git init

# 2. Check status to ensure .env is safely ignored
git status

# 3. Stage all source files and documentation
git add .

# 4. Create your initial commit
git commit -m "feat: complete Mivo AI voice notes platform with Supabase backend and Whisper transcription"

# 5. Set default branch to main
git branch -M main

# 6. Link to your GitHub remote repository (replace with your repo URL)
git remote add origin https://github.com/Pratik-dotcom-11/Mivo.git

# 7. Push to GitHub
git push -u origin main
```

---

## 🎓 Academic & Portfolio Context

This project was built by a **first-year BTech Computer Science & Engineering (CSE)** student to demonstrate end-to-end full-stack software engineering competencies:
- **Cloud Architecture & BaaS:** Architecting distributed serverless applications leveraging managed PostgreSQL, Edge Functions, and Object Storage.
- **Data Security & Zero-Trust Access:** Practical implementation of PostgreSQL Row Level Security (RLS) policies and cryptographically isolated multi-tenant storage.
- **Modern Frontend Engineering:** Type-safe development with TypeScript, React custom hooks, modular component architecture, and accessible Tailwind CSS design systems.
- **Audio & AI Integration:** Processing binary media streams with browser APIs and orchestrating speech-to-text inference with OpenAI Whisper.

---

## 🔮 Future Improvements

- [ ] **AI Summarization:** Automatic bullet-point synthesis and action items extraction via GPT-4o-mini.
- [ ] **Audio Waveform Scrubbing:** Interactive audio scrub bar with variable playback speeds (1.25x, 1.5x, 2.0x).
- [ ] **Tagging & Semantic Search:** Vector embeddings for voice notes using pgvector for conceptual similarity search.
- [ ] **Offline PWA Support:** Service Worker caching and local IndexedDB queuing for recording offline and syncing when reconnected.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

<p align="center">
  Crafted with ❤️ for clear minds and organized ideas.
</p>
