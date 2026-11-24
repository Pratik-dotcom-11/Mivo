// @ts-nocheck
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TranscribePayload {
  noteId?: string;
  audioPath?: string;
  audioBase64?: string;
  mimeType?: string;
  durationSeconds?: number;
  clientTranscript?: string;
  clientApiKey?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 1. Authenticate user from Authorization Bearer token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ success: false, error: 'Missing Authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';

    // Verify authenticated user
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser();

    if (userError || !user) {
      return new Response(JSON.stringify({ success: false, error: 'Unauthorized user token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const payload = (await req.json()) as TranscribePayload;

    // 2. Check OpenAI API Key in Supabase Secrets or client-supplied payload
    const openaiApiKey = (Deno.env.get('OPENAI_API_KEY') || payload.clientApiKey || '').trim();
    if (!openaiApiKey) {
      // Graceful handling when OpenAI key is not yet set: return success with client transcript or empty note
      const transcription = (payload.clientTranscript || '').trim();
      const words = transcription ? transcription.split(/\s+/).slice(0, 6).join(' ') : '';
      const derivedTitle = words
        ? words.length < transcription.length
          ? `${words}...`
          : words
        : `Voice Note (${Math.round(payload.durationSeconds || 0)}s)`;

      if (payload.noteId) {
        await userClient
          .from('voice_notes')
          .update({
            title: derivedTitle,
            transcription,
            updated_at: new Date().toISOString(),
          })
          .eq('id', payload.noteId)
          .eq('user_id', user.id);
      }

      return new Response(
        JSON.stringify({
          success: true,
          transcription,
          title: derivedTitle,
          source: transcription ? 'browser_speech' : 'audio_ready',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // 3. Extract audio bytes from base64 or Supabase Storage
    let audioBytes: Uint8Array | null = null;
    const mime = payload.mimeType || 'audio/webm';

    if (payload.audioBase64) {
      const binaryString = atob(payload.audioBase64);
      audioBytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        audioBytes[i] = binaryString.charCodeAt(i);
      }
    } else if (payload.audioPath) {
      // Validate path belongs to authenticated user
      if (!payload.audioPath.startsWith(`${user.id}/`)) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Forbidden: Cannot access recordings belonging to another user',
          }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const adminClient = createClient(supabaseUrl, supabaseServiceKey);
      const { data: fileData, error: downloadError } = await adminClient.storage
        .from('voice-recordings')
        .download(payload.audioPath);

      if (downloadError || !fileData) {
        return new Response(
          JSON.stringify({
            success: false,
            error: `Failed to download audio file: ${downloadError?.message}`,
          }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const buffer = await fileData.arrayBuffer();
      audioBytes = new Uint8Array(buffer);
    }

    if (!audioBytes || audioBytes.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'No audio data or valid audioPath provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 4. Construct Multipart FormData for OpenAI Whisper Speech-to-Text
    let extension = 'webm';
    if (mime.includes('mp4') || mime.includes('m4a')) extension = 'm4a';
    else if (mime.includes('wav')) extension = 'wav';
    else if (mime.includes('ogg')) extension = 'ogg';
    else if (mime.includes('mp3') || mime.includes('mpeg')) extension = 'mp3';

    const audioFile = new File([audioBytes], `recording.${extension}`, { type: mime });
    const formData = new FormData();
    formData.append('file', audioFile);
    formData.append('model', 'whisper-1');
    formData.append('response_format', 'json');

    // 5. Invoke OpenAI Speech-to-Text API
    const openAiResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${openaiApiKey}`,
      },
      body: formData,
    });

    if (!openAiResponse.ok) {
      const errBody = await openAiResponse.json().catch(() => ({}));
      const errorMessage =
        errBody?.error?.message ||
        `OpenAI Whisper transcription failed with status ${openAiResponse.status}`;

      return new Response(
        JSON.stringify({
          success: false,
          error: errorMessage,
          code: 'OPENAI_ERROR',
        }),
        {
          status: openAiResponse.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const openAiResult = await openAiResponse.json();
    const transcription = (openAiResult.text || '').trim();

    // 6. Generate a simple default title if necessary from the first few words
    let derivedTitle = '';
    if (transcription) {
      const words = transcription.split(/\s+/).slice(0, 6).join(' ');
      derivedTitle = words.length < transcription.length ? `${words}...` : words;
    } else {
      derivedTitle = `Voice Note (${Math.round(payload.durationSeconds || 0)}s)`;
    }

    // 7. Update voice_notes row if noteId was provided
    if (payload.noteId) {
      await userClient
        .from('voice_notes')
        .update({
          title: derivedTitle,
          transcription,
          updated_at: new Date().toISOString(),
        })
        .eq('id', payload.noteId)
        .eq('user_id', user.id);
    }

    return new Response(
      JSON.stringify({
        success: true,
        transcription,
        title: derivedTitle,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown transcription processing error';
    return new Response(JSON.stringify({ success: false, error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
