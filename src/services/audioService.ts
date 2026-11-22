import { supabase } from '@/lib/supabase';
import { AUDIO_STORAGE_BUCKET } from '@/utils/constants';

export const audioService = {
  /**
   * Upload an audio recording blob to the private Supabase Storage bucket: voice-recordings
   * Files are stored in user-specific folders: <user_id>/<timestamp>.<extension>
   */
  async uploadAudio(
    userId: string,
    audioBlob: Blob,
    preferredExtension?: string
  ): Promise<{ path: string | null; error: Error | null }> {
    try {
      let ext = preferredExtension;
      if (!ext && audioBlob.type) {
        if (audioBlob.type.includes('mp4') || audioBlob.type.includes('m4a')) ext = 'm4a';
        else if (audioBlob.type.includes('wav')) ext = 'wav';
        else if (audioBlob.type.includes('ogg')) ext = 'ogg';
        else if (audioBlob.type.includes('webm')) ext = 'webm';
      }
      if (!ext) ext = 'webm';

      const timestamp = Date.now();
      const randomSuffix = Math.random().toString(36).substring(2, 8);
      const filePath = `${userId}/${timestamp}-${randomSuffix}.${ext}`;

      const { data, error } = await supabase.storage
        .from(AUDIO_STORAGE_BUCKET)
        .upload(filePath, audioBlob, {
          contentType: audioBlob.type || 'audio/webm',
          upsert: false,
        });

      if (error) throw error;

      return {
        path: data.path,
        error: null,
      };
    } catch (err: unknown) {
      return {
        path: null,
        error: err instanceof Error ? err : new Error('Failed to upload audio file to private storage'),
      };
    }
  },

  /**
   * Generate a secure temporary Signed URL for audio playback.
   * Required because the bucket is strictly private.
   */
  async getAudioSignedUrl(
    audioPath: string,
    expiresInSeconds = 3600
  ): Promise<{ signedUrl: string | null; error: Error | null }> {
    try {
      const { data, error } = await supabase.storage
        .from(AUDIO_STORAGE_BUCKET)
        .createSignedUrl(audioPath, expiresInSeconds);

      if (error) throw error;

      return {
        signedUrl: data.signedUrl,
        error: null,
      };
    } catch (err: unknown) {
      return {
        signedUrl: null,
        error: err instanceof Error ? err : new Error('Failed to generate signed playback URL'),
      };
    }
  },

  /**
   * Delete an audio recording file from private storage
   */
  async deleteAudio(audioPath: string): Promise<{ success: boolean; error: Error | null }> {
    try {
      const { error } = await supabase.storage
        .from(AUDIO_STORAGE_BUCKET)
        .remove([audioPath]);

      if (error) throw error;
      return { success: true, error: null };
    } catch (err: unknown) {
      return {
        success: false,
        error: err instanceof Error ? err : new Error('Failed to delete audio from storage'),
      };
    }
  },
};
