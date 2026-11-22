import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export interface TranscriptionResponse {
  transcription: string;
  title: string;
  error?: string | null;
  code?: string | null;
  requiresConfig?: boolean;
}

export const transcriptionService = {
  /**
   * Transcribe recorded audio securely using OpenAI Whisper via Supabase Edge Function
   */
  async transcribeAudio(
    audioBlob: Blob,
    durationSeconds: number
  ): Promise<TranscriptionResponse> {
    if (!isSupabaseConfigured) {
      return {
        transcription: '',
        title: '',
        error:
          'Supabase is not configured with live credentials. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file to enable cloud speech-to-text.',
        requiresConfig: true,
      };
    }

    try {
      // Convert audio blob to base64 for Edge Function invocation
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
      }>('transcribe-audio', {
        body: {
          audioBase64,
          mimeType: audioBlob.type || 'audio/webm',
          durationSeconds,
        },
      });

      // Handle Supabase function invocation error or backend error payload
      if (error) {
        // Attempt to extract detailed server error message if returned as json
        let detailedMessage = error.message;
        try {
          if ('context' in error && error.context) {
            const ctxResponse = error.context as Response;
            if (typeof ctxResponse.json === 'function') {
              const body = await ctxResponse.json();
              if (body?.error) detailedMessage = body.error;
            }
          }
        } catch {
          // Fall back to error.message
        }

        const isMissingKey =
          detailedMessage.includes('OPENAI_API_KEY') ||
          detailedMessage.includes('OpenAI API key is missing');

        return {
          transcription: '',
          title: '',
          error: isMissingKey
            ? 'OpenAI API key is missing. Please configure OPENAI_API_KEY in Supabase project secrets: run `npx supabase secrets set OPENAI_API_KEY=your_key` or set it in the Supabase Dashboard under Project Settings > Edge Functions.'
            : `Transcription error: ${detailedMessage}`,
          code: isMissingKey ? 'MISSING_OPENAI_API_KEY' : 'TRANSCRIPTION_ERROR',
          requiresConfig: isMissingKey,
        };
      }

      if (data && !data.success && data.error) {
        const isMissingKey =
          data.code === 'MISSING_OPENAI_API_KEY' ||
          data.error.includes('OPENAI_API_KEY') ||
          data.error.includes('OpenAI API key is missing');

        return {
          transcription: '',
          title: '',
          error: data.error,
          code: data.code || (isMissingKey ? 'MISSING_OPENAI_API_KEY' : 'TRANSCRIPTION_ERROR'),
          requiresConfig: isMissingKey,
        };
      }

      return {
        transcription: data?.transcription || '',
        title: data?.title || `Voice Note (${Math.round(durationSeconds)}s)`,
        error: null,
      };
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Network error communicating with transcription service';
      return {
        transcription: '',
        title: '',
        error: msg,
        code: 'NETWORK_ERROR',
      };
    }
  },
};
