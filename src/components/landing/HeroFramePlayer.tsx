import React, { useEffect, useRef, useState, useCallback } from 'react';

const TOTAL_FRAMES = 235;
const FRAME_INTERVAL_MS = 1000 / 24; // 24 frames per second
const SOURCE_CROP_Y = 84; // Crop out top black letterbox bar
const SOURCE_CROP_HEIGHT = 912; // 1080 - 84 - 84 = 912 (crops out bottom bar & watermark)
const SOURCE_WIDTH = 1920;

export interface HeroFramePlayerProps {
  className?: string;
}

export const HeroFramePlayer: React.FC<HeroFramePlayerProps> = ({
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Cached frame images
  const imagesRef = useRef<(HTMLImageElement | null)[]>(new Array(TOTAL_FRAMES).fill(null));
  const currentFrameRef = useRef(0);
  const directionRef = useRef<1 | -1>(1); // 1 = forward, -1 = reverse (seamless ping-pong loop)
  const isPlayingRef = useRef(true);
  const isVisibleRef = useRef(true);
  const lastDrawTimeRef = useRef(0);
  const animFrameIdRef = useRef<number | null>(null);

  // Helper to format frame path
  const getFrameUrl = (index: number) => {
    const num = String(index + 1).padStart(3, '0');
    return `/hero-frames/ezgif-frame-${num}.jpg`;
  };

  // Draw current frame to canvas using object-fit: cover
  const renderFrame = useCallback((frameIndex: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Use current frame, or fall back to closest loaded frame
    let img = imagesRef.current[frameIndex];
    if (!img || !img.complete || img.naturalWidth === 0) {
      // Find nearest loaded frame
      for (let offset = 1; offset < TOTAL_FRAMES; offset++) {
        const prev = (frameIndex - offset + TOTAL_FRAMES) % TOTAL_FRAMES;
        if (imagesRef.current[prev]?.complete && imagesRef.current[prev]!.naturalWidth > 0) {
          img = imagesRef.current[prev];
          break;
        }
      }
    }

    if (!img || !img.complete || img.naturalWidth === 0) return;

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    // Calculate aspect ratio cover mapping
    const sWidth = SOURCE_WIDTH;
    const sHeight = SOURCE_CROP_HEIGHT;
    const sRatio = sWidth / sHeight;
    const cRatio = canvasWidth / canvasHeight;

    let dWidth: number;
    let dHeight: number;
    let dx = 0;
    let dy = 0;

    if (cRatio > sRatio) {
      // Canvas is wider than source
      dWidth = canvasWidth;
      dHeight = canvasWidth / sRatio;
      dy = (canvasHeight - dHeight) / 2;
    } else {
      // Canvas is taller than source (mobile & narrow screens)
      // Focus slightly towards center-right where the robot and audio waves are
      dHeight = canvasHeight;
      dWidth = canvasHeight * sRatio;
      dx = (canvasWidth - dWidth) * 0.65;
    }

    ctx.drawImage(
      img,
      0,
      SOURCE_CROP_Y,
      SOURCE_WIDTH,
      SOURCE_CROP_HEIGHT,
      dx,
      dy,
      dWidth,
      dHeight
    );
  }, []);

  // Update canvas internal pixel dimensions matching screen display
  const updateCanvasDimensions = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const w = Math.round(rect.width * dpr);
    const h = Math.round(rect.height * dpr);

    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      renderFrame(currentFrameRef.current);
    }
  }, [renderFrame]);

  // Animation loop
  useEffect(() => {
    const loop = (timestamp: number) => {
      animFrameIdRef.current = requestAnimationFrame(loop);

      if (!isPlayingRef.current || !isVisibleRef.current) return;

      const elapsed = timestamp - lastDrawTimeRef.current;
      if (elapsed >= FRAME_INTERVAL_MS) {
        lastDrawTimeRef.current = timestamp - (elapsed % FRAME_INTERVAL_MS);

        // Ping-pong loop (forward then reverse for continuous smooth motion without jarring cuts)
        let nextFrame = currentFrameRef.current + directionRef.current;
        if (nextFrame >= TOTAL_FRAMES) {
          directionRef.current = -1;
          nextFrame = TOTAL_FRAMES - 2;
        } else if (nextFrame < 0) {
          directionRef.current = 1;
          nextFrame = 1;
        }

        currentFrameRef.current = nextFrame;
        renderFrame(nextFrame);
      }
    };

    animFrameIdRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [renderFrame]);

  // Load first frame immediately, then progressively load remaining frames
  useEffect(() => {
    let isCancelled = false;

    // Load Frame 1 immediately
    const firstImg = new Image();
    firstImg.src = getFrameUrl(0);
    firstImg.onload = () => {
      if (isCancelled) return;
      imagesRef.current[0] = firstImg;
      setIsLoaded(true);
      updateCanvasDimensions();
      renderFrame(0);

      // Preload the remaining frames in progressive batches
      preloadRemainingFrames();
    };

    const preloadRemainingFrames = async () => {
      const concurrency = 6;
      let currentIndex = 1;

      const loadNext = (): Promise<void> => {
        if (isCancelled || currentIndex >= TOTAL_FRAMES) return Promise.resolve();
        const idx = currentIndex++;
        return new Promise<void>((resolve) => {
          const img = new Image();
          img.src = getFrameUrl(idx);
          img.onload = () => {
            if (!isCancelled) {
              imagesRef.current[idx] = img;
            }
            resolve();
          };
          img.onerror = () => {
            resolve();
          };
        }).then(() => loadNext());
      };

      const workers = Array.from({ length: concurrency }, () => loadNext());
      await Promise.all(workers);
    };

    return () => {
      isCancelled = true;
    };
  }, [renderFrame, updateCanvasDimensions]);

  // Handle resize and visibility intersection
  useEffect(() => {
    updateCanvasDimensions();
    const handleResize = () => updateCanvasDimensions();
    window.addEventListener('resize', handleResize);

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        isVisibleRef.current = entry.isIntersecting;
      },
      { threshold: 0.1 }
    );

    const canvas = canvasRef.current;
    if (canvas) {
      observer.observe(canvas);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (canvas) observer.unobserve(canvas);
    };
  }, [updateCanvasDimensions]);

  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      {/* HTML5 Canvas executing GPU-cached frame playback */}
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        style={{
          opacity: isLoaded ? 1 : 0,
          transition: 'opacity 0.4s ease-out',
        }}
      />

      {/* Subtle loader indicator only while initial frames buffer */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#380F06]">
          <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-glowOrange-500 animate-spin" />
        </div>
      )}
    </div>
  );
};
