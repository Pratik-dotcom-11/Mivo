import { useState, useRef, useCallback, useEffect } from 'react';
import type { AudioRecordingState, AudioRecordResult } from '@/types';
import { MAX_RECORDING_DURATION_SECONDS } from '@/utils/constants';

export function useAudioRecorder() {
  const [state, setState] = useState<AudioRecordingState>('inactive');
  const [duration, setDuration] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const speechRecognitionRef = useRef<any>(null);
  const speechTranscriptRef = useRef<string>('');
  const isRecordingRef = useRef<boolean>(false);

  const cleanupAudioAnalyser = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
    }
    audioContextRef.current = null;
    analyserRef.current = null;
    setAudioLevel(0);
  }, []);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const stopMediaStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      streamRef.current = null;
    }
  }, []);

  const stopSpeechRecognition = useCallback(() => {
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.onresult = null;
        speechRecognitionRef.current.onerror = null;
        speechRecognitionRef.current.onend = null;
        speechRecognitionRef.current.stop();
      } catch {
        // Ignore errors during stop
      }
      speechRecognitionRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      clearTimer();
      cleanupAudioAnalyser();
      stopMediaStream();
      stopSpeechRecognition();
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    };
  }, [clearTimer, cleanupAudioAnalyser, stopMediaStream, stopSpeechRecognition]);

  /**
   * Request microphone permission and begin recording with live audio level visualization
   */
  const startRecording = useCallback(async () => {
    setError(null);
    setDuration(0);
    audioChunksRef.current = [];

    // Check browser MediaRecorder API capability
    if (typeof window === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setError('Audio recording is not supported in this browser environment.');
      return;
    }

    try {
      isRecordingRef.current = true;
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      streamRef.current = stream;

      // Determine best supported audio container/mime type
      const mimeTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/mp4',
        'audio/ogg;codecs=opus',
        'audio/wav',
      ];
      const supportedType = mimeTypes.find((t) => MediaRecorder.isTypeSupported(t)) || '';

      const recorder = new MediaRecorder(
        stream,
        supportedType ? { mimeType: supportedType } : undefined
      );
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      // Set up real-time audio visualization using Web Audio AnalyserNode
      try {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const audioCtx = new AudioCtx();
        const analyser = audioCtx.createAnalyser();
        const source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);
        analyser.fftSize = 64;
        audioContextRef.current = audioCtx;
        analyserRef.current = analyser;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        let lastLevel = -1;
        let lastUpdateTime = 0;

        const updateLevel = (timestamp: number) => {
          if (analyserRef.current) {
            analyserRef.current.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
              sum += dataArray[i];
            }
            const avg = sum / dataArray.length;
            const newLevel = Math.min(100, Math.round((avg / 255) * 100));

            // Throttle React state updates to ~50ms (20fps) to prevent layout thrashing & CPU heat
            if (timestamp - lastUpdateTime >= 50 && (Math.abs(newLevel - lastLevel) >= 2 || (newLevel === 0 && lastLevel !== 0))) {
              lastUpdateTime = timestamp;
              lastLevel = newLevel;
              setAudioLevel(newLevel);
            }
            animFrameRef.current = requestAnimationFrame(updateLevel);
          }
        };
        animFrameRef.current = requestAnimationFrame(updateLevel);
      } catch (err) {
        console.warn('[Mivo] Web Audio Analyser setup failed, visualizer will use fallback:', err);
      }

      recorder.start(250); // Collect data chunk every 250ms
      setState('recording');

      // Initialize Web Speech API for real-time zero-config speech transcription
      speechTranscriptRef.current = '';
      stopSpeechRecognition();

      if (typeof window !== 'undefined') {
        const SpeechRecognition =
          (window as any).SpeechRecognition ||
          (window as any).webkitSpeechRecognition;

        if (SpeechRecognition) {
          let accumulatedFinal = '';
          const setupRecognition = () => {
            if (!isRecordingRef.current) return;
            try {
              const recognition = new SpeechRecognition();
              recognition.continuous = true;
              recognition.interimResults = true;
              recognition.lang = navigator.language || 'en-US';

              recognition.onresult = (event: any) => {
                let interim = '';
                for (let i = event.resultIndex; i < event.results.length; i++) {
                  const part = event.results[i][0].transcript;
                  if (event.results[i].isFinal) {
                    accumulatedFinal += ' ' + part;
                  } else {
                    interim += part;
                  }
                }
                const fullText = (accumulatedFinal + ' ' + interim).trim();
                if (fullText) {
                  speechTranscriptRef.current = fullText;
                }
              };

              recognition.onerror = (e: any) => {
                if (e?.error !== 'no-speech' && e?.error !== 'aborted') {
                  console.warn('[Mivo] Web Speech recognition notice:', e?.error);
                }
              };

              recognition.onend = () => {
                // If recording is still active (e.g. mobile pause or silence timeout), restart
                if (isRecordingRef.current) {
                  try {
                    recognition.start();
                  } catch {
                    // Ignore restart collision
                  }
                }
              };

              recognition.start();
              speechRecognitionRef.current = recognition;
            } catch (err) {
              console.warn('[Mivo] Speech recognition start notice:', err);
            }
          };

          setupRecognition();
        }
      }

      // Start duration ticker
      timerRef.current = window.setInterval(() => {
        setDuration((prev) => {
          if (prev >= MAX_RECORDING_DURATION_SECONDS) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err: unknown) {
      stopMediaStream();
      cleanupAudioAnalyser();
      setState('inactive');

      // Handle specific browser permission and hardware error cases
      if (err instanceof DOMException) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setError(
            'Microphone access was denied. Please allow microphone access in your browser site permissions to record.'
          );
          return;
        }
        if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          setError('No microphone was found on your device. Please plug in or enable a microphone.');
          return;
        }
        if (err.name === 'NotReadableError') {
          setError('Your microphone is currently in use by another application.');
          return;
        }
      }

      const msg = err instanceof Error ? err.message : 'Microphone access failed';
      setError(msg);
    }
  }, [cleanupAudioAnalyser, stopMediaStream]);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
      setState('paused');
      clearTimer();
      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.stop();
        } catch {
          // Ignore
        }
      }
    }
  }, [clearTimer]);

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
      setState('recording');
      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.start();
        } catch {
          // Ignore
        }
      }
      timerRef.current = window.setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    }
  }, []);

  /**
   * Stop recording, stop all hardware tracks, and produce the validated AudioRecordResult
   */
  const stopRecording = useCallback((): Promise<AudioRecordResult | null> => {
    return new Promise((resolve) => {
      isRecordingRef.current = false;
      clearTimer();
      cleanupAudioAnalyser();
      stopSpeechRecognition();

      const recorder = mediaRecorderRef.current;
      if (!recorder || recorder.state === 'inactive') {
        stopMediaStream();
        setState('inactive');
        resolve(null);
        return;
      }

      const finalDuration = duration;

      recorder.onstop = () => {
        const mimeType = recorder.mimeType || 'audio/webm';
        const blob = new Blob(audioChunksRef.current, { type: mimeType });

        // Stop all hardware media stream tracks so the recording indicator turns off
        stopMediaStream();
        setState('inactive');

        // Validate recording is not empty
        if (finalDuration < 1 && blob.size < 500) {
          setError('Recording was too short. Please speak for at least 1 second.');
          resolve(null);
          return;
        }

        resolve({
          blob,
          durationSeconds: Math.max(1, finalDuration),
          mimeType,
          liveTranscript: speechTranscriptRef.current.trim(),
        });
      };

      recorder.stop();
    });
  }, [clearTimer, cleanupAudioAnalyser, duration, stopMediaStream, stopSpeechRecognition]);

  /**
   * Cancel and discard recording
   */
  const cancelRecording = useCallback(() => {
    isRecordingRef.current = false;
    clearTimer();
    cleanupAudioAnalyser();
    stopMediaStream();
    stopSpeechRecognition();

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    audioChunksRef.current = [];
    speechTranscriptRef.current = '';
    setDuration(0);
    setError(null);
    setState('inactive');
  }, [clearTimer, cleanupAudioAnalyser, stopMediaStream, stopSpeechRecognition]);

  return {
    state,
    duration,
    audioLevel,
    error,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    cancelRecording,
  };
}
