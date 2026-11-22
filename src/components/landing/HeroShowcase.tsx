import React, { useState } from 'react';
import { Logo } from '@/components/common/Logo';
import {
  Play,
  Pause,
  RotateCcw,
  FastForward,
  CheckCircle2,
  MoreVertical,
  Mic,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export interface HeroShowcaseProps {
  onGetStarted: () => void;
  onExploreFeatures: () => void;
  onSignIn: () => void;
  isLoggedIn?: boolean;
  onGoToApp?: () => void;
}

export const HeroShowcase: React.FC<HeroShowcaseProps> = ({
  onGetStarted,
  onExploreFeatures,
  onSignIn,
  isLoggedIn = false,
  onGoToApp,
}) => {
  const [isPlaying, setIsPlaying] = useState(true);

  return (
    <div
      className="w-full relative rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden mivo-hero-gradient border border-white/15 shadow-2xl text-white select-none"
      style={{
        background:
          'linear-gradient(135deg, #380F06 0%, #5C1D0F 28%, #852F1A 60%, #9E3C22 75%, #0D2624 100%)',
      }}
    >
      {/* Dynamic atmospheric radial glows */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#CE6C53]/35 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/4 left-1/3 w-[36rem] h-[36rem] bg-[#F97316]/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#14B8A6]/25 rounded-full blur-[100px] pointer-events-none" />

      {/* Decorative concentric orbital rings (exact reference image background geometry) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
        <div className="w-[32rem] h-[32rem] rounded-full border border-white/40" />
        <div className="absolute w-[44rem] h-[44rem] rounded-full border border-white/30" />
        <div className="absolute w-[56rem] h-[56rem] rounded-full border border-white/20" />
      </div>

      <div className="relative z-10 p-6 sm:p-10 lg:p-12 flex flex-col justify-between min-h-[640px] lg:min-h-[700px]">
        {/* Navigation Bar inside the hero frame */}
        <header className="flex items-center justify-between gap-4 pb-8 sm:pb-12">
          {/* Logo with clean white presentation */}
          <Logo size="md" variant="light" dotAi />

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-semibold tracking-wide text-white/90">
            <button
              onClick={() => {
                const el = document.getElementById('hero');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="hover:text-white transition-colors"
            >
              Home
            </button>
            <button
              onClick={onExploreFeatures}
              className="hover:text-white transition-colors"
            >
              Features
            </button>
            <button
              onClick={() => {
                const el = document.getElementById('how-it-works');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="hover:text-white transition-colors"
            >
              How It Works
            </button>
            {isLoggedIn ? (
              <button
                onClick={onGoToApp}
                className="hover:text-white transition-colors text-glowOrange-400 font-bold"
              >
                Dashboard
              </button>
            ) : (
              <button
                onClick={onSignIn}
                className="hover:text-white transition-colors"
              >
                Sign In
              </button>
            )}
          </nav>

          {/* Pill CTA button (reference signature) */}
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <button
                onClick={onGoToApp}
                className="bg-white text-charcoal-900 hover:bg-warm-100 active:scale-95 transition-all duration-150 px-5 py-2.5 rounded-full font-bold text-xs sm:text-sm shadow-soft-md shadow-black/30 flex items-center gap-1.5"
              >
                <span>Open Dashboard</span>
                <ArrowRight className="w-4 h-4 text-glowOrange-600" />
              </button>
            ) : (
              <>
                <button
                  onClick={onSignIn}
                  className="hidden sm:inline-block text-xs font-semibold text-white/90 hover:text-white px-3 py-1.5 transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={onGetStarted}
                  className="bg-white text-charcoal-900 hover:bg-warm-100 active:scale-95 transition-all duration-150 px-5 py-2.5 rounded-full font-bold text-xs sm:text-sm shadow-soft-md shadow-black/30"
                >
                  Start for Free
                </button>
              </>
            )}
          </div>
        </header>

        {/* Main Hero Body Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center my-auto">
          {/* Left Column: Headlines & Pillars */}
          <div className="lg:col-span-6 space-y-6 lg:space-y-8">
            {/* Eyebrow caption */}
            <div className="inline-flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-glowOrange-400 animate-pulse" />
              <p className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-white/90">
                The AI Voice Notes Platform
              </p>
            </div>

            <p className="text-xs sm:text-sm font-semibold tracking-wide text-white/90 uppercase leading-relaxed max-w-md">
              Powering accurate transcriptions, instant summaries, and organized thoughts so you never lose an idea.
            </p>

            {/* Main Headline (Pure White, Strong Visual Hierarchy) */}
            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-[1.12] drop-shadow-sm">
                Your thoughts deserve to be remembered.
              </h1>
              <p className="text-sm sm:text-base text-white/85 font-medium leading-relaxed max-w-lg">
                Capture your thoughts with your voice. Mivo turns your recordings into organized, searchable notes with zero friction.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onGetStarted}
                className="inline-flex items-center gap-2 bg-white text-charcoal-900 hover:bg-warm-100 active:scale-95 transition-all duration-150 px-6 py-3.5 rounded-full font-extrabold text-sm shadow-soft-xl shadow-black/40"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-4 h-4 text-glowOrange-600" />
              </button>

              <button
                onClick={onExploreFeatures}
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 active:scale-95 backdrop-blur-md border border-white/25 text-white transition-all px-5 py-3.5 rounded-full font-bold text-sm"
              >
                <span>Explore Features</span>
              </button>
            </div>

            {/* Frosted Pill Badges (recreating reference image bottom-left tags) */}
            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              <span className="px-4 py-1.5 rounded-full text-xs font-semibold bg-white/15 backdrop-blur-md border border-white/25 text-white shadow-soft-sm">
                Voice Notes
              </span>
              <span className="px-4 py-1.5 rounded-full text-xs font-semibold bg-white/15 backdrop-blur-md border border-white/25 text-white shadow-soft-sm">
                Instant AI Transcript
              </span>
              <span className="px-4 py-1.5 rounded-full text-xs font-semibold bg-white/15 backdrop-blur-md border border-white/25 text-white shadow-soft-sm">
                Smart Categories
              </span>
            </div>
          </div>

          {/* Right Column: AI Robot + Floating Frosted Cards Composition (Authentic Reference Match) */}
          <div className="lg:col-span-6 relative flex flex-col sm:flex-row lg:flex-col items-center justify-center gap-4 sm:gap-6 min-h-[460px] lg:h-[500px]">
            {/* DESKTOP ONLY: AI Cybernetic Robot Focal Artwork (100% unchanged for desktop) */}
            <div className="hidden lg:flex absolute inset-0 items-center justify-start lg:-left-20 pointer-events-none select-none z-0 overflow-visible">
              <div className="relative w-[340px] sm:w-[420px] lg:w-[480px] aspect-[16/10] sm:aspect-square flex items-center justify-center">
                <img
                  src="/ai-robot-hero.jpg"
                  alt="Mivo AI Voice Model"
                  className="w-full h-full object-cover rounded-3xl lg:rounded-full [mask-image:radial-gradient(ellipse_at_center,black_55%,transparent_90%)] opacity-95 drop-shadow-[0_20px_50px_rgba(0,0,0,0.7)] transition-all duration-700"
                />
                {/* Subtle cybernetic pulse aura */}
                <div className="absolute inset-4 rounded-full border border-glowOrange-400/25 animate-pulse pointer-events-none" />
              </div>
            </div>

            {/* MOBILE ONLY: Dedicated Cybernetic Robot Showcase (Clean & Unobstructed) */}
            <div className="lg:hidden w-full max-w-sm mx-auto relative flex flex-col items-center justify-center my-2 select-none pointer-events-none">
              <div className="relative w-[280px] sm:w-[340px] aspect-[16/10] flex items-center justify-center">
                <img
                  src="/ai-robot-hero.jpg"
                  alt="Mivo AI Voice Model"
                  className="w-full h-full object-cover rounded-3xl shadow-2xl border border-white/25 [mask-image:radial-gradient(ellipse_at_center,black_75%,transparent_100%)] drop-shadow-[0_15px_35px_rgba(0,0,0,0.6)]"
                />
                {/* Subtle cybernetic pulse aura */}
                <div className="absolute inset-2 rounded-3xl border border-glowOrange-400/30 animate-pulse pointer-events-none" />
                {/* Badge pill */}
                <div className="absolute bottom-2.5 px-3 py-1 rounded-full text-[11px] font-bold text-white bg-black/50 backdrop-blur-md border border-white/25 shadow-soft-sm flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Mivo AI Voice Engine</span>
                </div>
              </div>
            </div>

            {/* CARD 1: Central Audio Waveform & Player Card */}
            <div className="w-full max-w-sm sm:max-w-xs md:max-w-sm rounded-3xl bg-white/95 backdrop-blur-md text-charcoal-900 p-5 shadow-2xl border border-white/70 animate-float-slow z-20 lg:ml-auto lg:mr-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black tracking-tight text-charcoal-900">
                  Intelligent Thought Capture
                </span>
                <span className="p-1 rounded-full bg-warm-100 text-charcoal-400">
                  <Sparkles className="w-3.5 h-3.5 text-glowOrange-500" />
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-charcoal-500 mb-3">
                <span className="font-bold text-charcoal-800">Rec-100823</span>
                <span className="font-semibold">3:25 / 10:21</span>
              </div>

              {/* Glowing Cyan/Teal Soundwave Waveform */}
              <div className="h-10 flex items-center justify-between gap-[3px] py-1 px-1.5 bg-warm-100/90 rounded-xl mb-4 border border-charcoal-100">
                {[
                  25, 45, 75, 40, 60, 95, 65, 35, 80, 100, 70, 50, 85, 90, 60, 40, 75,
                  88, 55, 30, 65, 80, 45, 90, 70, 35, 60,
                ].map((h, i) => (
                  <span
                    key={i}
                    className="w-[3px] rounded-full bg-gradient-to-t from-[#0D9488] to-[#2DD4BF] transition-all duration-150"
                    style={{
                      height: `${isPlaying ? Math.max(20, (h * (i % 2 === 0 ? 1 : 0.75))) : h * 0.4}%`,
                    }}
                  />
                ))}
              </div>

              {/* Player Controls (Reference Orange Button) */}
              <div className="flex items-center justify-center gap-5 pt-1">
                <button
                  type="button"
                  className="p-1.5 text-charcoal-400 hover:text-charcoal-700 transition-colors"
                  title="Rewind"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-10 h-10 rounded-full bg-gradient-to-tr from-glowOrange-600 to-glowOrange-500 hover:from-glowOrange-500 hover:to-glowOrange-400 text-white flex items-center justify-center transition-all transform active:scale-95 shadow-glow-orange"
                  title={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4 fill-current" />
                  ) : (
                    <Play className="w-4 h-4 ml-0.5 fill-current" />
                  )}
                </button>

                <button
                  type="button"
                  className="p-1.5 text-charcoal-400 hover:text-charcoal-700 transition-colors"
                  title="Fast Forward"
                >
                  <FastForward className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* CARD 2 (Top Right Offset): Video/Audio Caption & Drop Card */}
            <div className="w-full max-w-sm sm:max-w-xs md:max-w-[270px] rounded-2xl bg-white/95 backdrop-blur-md text-charcoal-900 p-4 shadow-2xl border border-white/70 lg:absolute lg:-top-6 lg:right-0 animate-float-delay z-10 hidden sm:block">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-black text-charcoal-900">Voice Note</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-300">
                  AI Ready
                </span>
              </div>

              <div className="p-3 rounded-xl border border-dashed border-charcoal-200 bg-warm-50 text-center mb-3">
                <Mic className="w-4 h-4 mx-auto text-brand-600 mb-1" />
                <p className="text-[11px] font-bold text-charcoal-800">
                  Tap mic or drop voice file
                </p>
                <p className="text-[9px] text-charcoal-400">Max size 25MB • WebM, MP3</p>
              </div>

              <button
                onClick={onGetStarted}
                className="w-full py-1.5 rounded-xl text-xs font-bold bg-charcoal-900 text-white hover:bg-black transition-colors"
              >
                Generate Notes
              </button>
            </div>

            {/* CARD 3 (Bottom Right Offset): Consistency Check / Structured Summary Card */}
            <div className="w-full max-w-sm sm:max-w-xs md:max-w-[280px] rounded-2xl bg-white/95 backdrop-blur-md text-charcoal-900 p-4 shadow-2xl border border-white/70 lg:absolute lg:-bottom-6 lg:right-2 z-30">
              <div className="flex items-center justify-between mb-2 pb-1 border-b border-charcoal-100">
                <span className="text-xs font-black text-charcoal-900">
                  Structured Summary
                </span>
                <MoreVertical className="w-3.5 h-3.5 text-charcoal-400" />
              </div>

              {/* Status metric */}
              <div className="space-y-1 mb-3">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-charcoal-500 font-semibold">Thoughts Organized</span>
                  <span className="flex items-center gap-1 font-bold text-mivoGreen-600">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    100% Synced
                  </span>
                </div>
              </div>

              {/* Topic Breakdown Metrics with colored dots */}
              <div className="space-y-1.5 pt-1 border-t border-charcoal-100">
                <div className="flex items-center justify-between text-[11px] font-bold text-charcoal-700">
                  <span>Category Distribution</span>
                </div>

                <div className="flex items-center justify-between text-[10px] text-charcoal-600">
                  <span className="flex items-center gap-1.5 font-medium">
                    <span className="w-2 h-2 rounded-full bg-brand-500" />
                    Ideas
                  </span>
                  <span className="font-mono font-bold text-charcoal-800">25%</span>
                </div>

                <div className="flex items-center justify-between text-[10px] text-charcoal-600">
                  <span className="flex items-center gap-1.5 font-medium">
                    <span className="w-2 h-2 rounded-full bg-glowOrange-500" />
                    Business
                  </span>
                  <span className="font-mono font-bold text-charcoal-800">55%</span>
                </div>

                <div className="flex items-center justify-between text-[10px] text-charcoal-600">
                  <span className="flex items-center gap-1.5 font-medium">
                    <span className="w-2 h-2 rounded-full bg-[#14B8A6]" />
                    To-do
                  </span>
                  <span className="font-mono font-bold text-charcoal-800">20%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
