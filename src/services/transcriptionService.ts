import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export interface TranscriptionResponse {
  transcription: string;
  title: string;
  error?: string | null;
  code?: string | null;
  requiresConfig?: boolean;
  engine?: 'whisper' | 'browser' | 'manual';
}

/**
 * Retrieve user-configured OpenAI API Key from secure local storage or environment
 */
export const getStoredOpenAIApiKey = (): string => {
  if (typeof window === 'undefined') return '';
  try {
    const stored = localStorage.getItem('mivo_openai_api_key');
    if (stored && stored.trim()) return stored.trim();
  } catch {
    // Ignore localStorage errors
  }
  const envKey = (import.meta as unknown as { env: Record<string, string | undefined> }).env.VITE_OPENAI_API_KEY;
  if (typeof envKey === 'string' && envKey.trim()) return envKey.trim();
  return '';
};

/**
 * Persist user-configured OpenAI API Key to secure local storage
 */
export const setStoredOpenAIApiKey = (key: string): void => {
  if (typeof window === 'undefined') return;
  try {
    if (key && key.trim()) {
      localStorage.setItem('mivo_openai_api_key', key.trim());
    } else {
      localStorage.removeItem('mivo_openai_api_key');
    }
  } catch {
    // Ignore localStorage errors
  }
};

const deriveTitle = (text: string, durationSeconds: number): string => {
  const clean = text.trim();
  if (!clean) return `Voice Note (${Math.round(durationSeconds)}s)`;
  const words = clean.split(/\s+/).slice(0, 6).join(' ');
  return words.length < clean.length ? `${words}...` : words;
};

export const transcriptionService = {
  /**
   * Transcribe recorded audio with multi-tier fallback:
   * 1. Direct OpenAI Whisper API (if client API key is configured)
   * 2. Supabase Edge Function Whisper transcription
   * 3. Browser native Web Speech API recognition (Zero-config, fast, 100% free)
   */
  async transcribeAudio(
    audioBlob: Blob,
    durationSeconds: number,
    liveTranscript?: string
  ): Promise<TranscriptionResponse> {
    const cleanLiveTranscript = (liveTranscript || '').trim();
    const clientKey = getStoredOpenAIApiKey();

    // Strategy 1: Direct OpenAI Whisper API if client-side API key is available
    if (clientKey) {
      try {
        let extension = 'webm';
        const mime = audioBlob.type || 'audio/webm';
        if (mime.includes('mp4') || mime.includes('m4a')) extension = 'm4a';
        else if (mime.includes('wav')) extension = 'wav';
        else if (mime.includes('ogg')) extension = 'ogg';
        else if (mime.includes('mp3') || mime.includes('mpeg')) extension = 'mp3';

        const audioFile = new File([audioBlob], `recording.${extension}`, { type: mime });
        const formData = new FormData();
        formData.append('file', audioFile);
        formData.append('model', 'whisper-1');
        formData.append('response_format', 'json');

        const resp = await fetch('https://api.openai.com/v1/audio/transcriptions', {
          method: 'POST',
          headers: { Authorization: `Bearer ${clientKey}` },
          body: formData,
        });

        if (resp.ok) {
          const json = await resp.json();
          const transcription = (json.text || '').trim();
          if (transcription) {
            return {
              transcription,
              title: deriveTitle(transcription, durationSeconds),
              error: null,
              engine: 'whisper',
            };
          }
        }
      } catch (err) {
        console.warn('[Mivo] Client Whisper API attempt failed, proceeding to cloud/browser fallback:', err);
      }
    }

    // Strategy 2: Supabase Edge Function (OpenAI Whisper in backend secret)
    if (isSupabaseConfigured) {
      try {
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve, reject) => {
          reader.onloadend = () => {
            const result = reader.result as string;
            const base64 = result.split(',')[1] || '';
            resolve(base64);
          };
          reader.onerror = () => reject(new Error('Failed to read audio blob'));
        });
        reader.readAsDataURL(audioBlob);
        const audioBase64 = await base64Promise;

        const { data, error } = await supabase.functions.invoke<{
          success: boolean;
          transcription?: string;
          title?: string;
          error?: string;
          code?: string;
          requiresConfig?: boolean;
          source?: string;
        }>('transcribe-audio', {
          body: {
            audioBase64,
            mimeType: audioBlob.type || 'audio/webm',
            durationSeconds,
            clientTranscript: cleanLiveTranscript,
            clientApiKey: clientKey || undefined,
          },
        });

        if (!error && data && data.success && data.transcription) {
          return {
            transcription: data.transcription.trim(),
            title: data.title || deriveTitle(data.transcription, durationSeconds),
            error: null,
            engine: data.source === 'browser_speech' ? 'browser' : 'whisper',
          };
        }
      } catch (err) {
        console.warn('[Mivo] Cloud transcription service invocation notice:', err);
      }
    }

    // Strategy 3: Browser Web Speech API fallback (Automatic, Free, Instant)
    if (cleanLiveTranscript) {
      return {
        transcription: cleanLiveTranscript,
        title: deriveTitle(cleanLiveTranscript, durationSeconds),
        error: null,
        engine: 'browser',
      };
    }

    // Strategy 4: Audio is ready to save and edit immediately (No blocking errors or config prompts)
    return {
      transcription: '',
      title: `Voice Note (${Math.round(durationSeconds)}s)`,
      error: null,
      code: null,
      requiresConfig: false,
      engine: 'manual',
    };
  },
};
