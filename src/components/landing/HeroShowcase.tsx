import React, { useState } from 'react';
import { Logo } from '@/components/common/Logo';
import { HeroFramePlayer } from './HeroFramePlayer';
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
  Film,
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
  const [isCinematicMode, setIsCinematicMode] = useState(false);

  return (
    <div
      className="w-full relative rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden mivo-hero-gradient border border-white/15 shadow-2xl text-white select-none"
      style={{
        background:
          'linear-gradient(135deg, #380F06 0%, #5C1D0F 28%, #852F1A 60%, #9E3C22 75%, #0D2624 100%)',
      }}
    >
      {/* Full-Motion 235-Frame Animation Canvas Player */}
      <div className="absolute inset-0 z-0 pointer-events-auto">
        <HeroFramePlayer isCinematicMode={isCinematicMode} />
      </div>

      {/* Atmospheric left-side contrast scrim so text and buttons remain 100% sharp and readable */}
      <div
        className={`absolute inset-0 z-[1] pointer-events-none transition-opacity duration-500 ${
          isCinematicMode ? 'opacity-0' : 'opacity-100'
        }`}
        style={{
          background:
            'linear-gradient(to right, rgba(42, 12, 6, 0.90) 0%, rgba(56, 15, 6, 0.72) 42%, rgba(13, 38, 36, 0.20) 75%, transparent 100%)',
        }}
      />

      {/* Dynamic atmospheric radial glows */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#CE6C53]/25 rounded-full blur-[100px] pointer-events-none animate-pulse-glow-soft z-[2]" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#14B8A6]/20 rounded-full blur-[100px] pointer-events-none animate-pulse-glow-soft z-[2]" style={{ animationDelay: '1s' }} />

      <div
        className={`relative z-10 p-6 sm:p-10 lg:p-12 flex flex-col justify-between min-h-[640px] lg:min-h-[700px] transition-opacity duration-500 ${
          isCinematicMode ? 'opacity-30 hover:opacity-100' : 'opacity-100'
        }`}
      >
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

          {/* Pill CTA button & Cinematic View Toggle */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsCinematicMode((c) => !c)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold transition-all duration-200 border cursor-pointer ${
                isCinematicMode
                  ? 'bg-glowOrange-500 text-white border-glowOrange-400 shadow-glow-orange scale-105'
                  : 'bg-white/15 hover:bg-white/25 text-white border-white/20 hover:border-white/40'
              }`}
              title="Toggle full cinematic animation view"
            >
              <Film className="w-3.5 h-3.5 text-glowOrange-300" />
              <span className="hidden sm:inline">{isCinematicMode ? 'Exit Cinematic' : 'Cinematic View'}</span>
            </button>

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
          <div className="lg:col-span-6 space-y-6 lg:space-y-8 relative">
            {/* Eyebrow caption */}
            <div className="relative z-10 inline-flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-glowOrange-400 animate-pulse" />
              <p className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-white/90">
                The AI Voice Notes Platform
              </p>
            </div>

            <p className="relative z-10 text-xs sm:text-sm font-semibold tracking-wide text-white/90 uppercase leading-relaxed max-w-md drop-shadow-sm">
              Powering accurate transcriptions, instant summaries, and organized thoughts so you never lose an idea.
            </p>

            {/* Main Headline (Pure White, Strong Visual Hierarchy) */}
            <div className="relative z-10 space-y-3">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-[1.12] drop-shadow-md">
                Your thoughts deserve to be remembered.
              </h1>
              <p className="text-sm sm:text-base text-white/90 font-medium leading-relaxed max-w-lg drop-shadow-sm">
                Capture your thoughts with your voice. Mivo turns your recordings into organized, searchable notes with zero friction.
              </p>
            </div>

            {/* CTAs & Badges Container */}
            <div className="relative z-10 pt-2">
              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-3 max-w-[215px] sm:max-w-none">
                <button
                  onClick={onGetStarted}
                  className="group inline-flex items-center gap-2 bg-white text-charcoal-900 hover:bg-warm-100 hover:scale-105 hover:-translate-y-0.5 hover:shadow-[0_0_25px_rgba(255,255,255,0.45)] active:scale-95 transition-all duration-200 px-6 py-3.5 rounded-full font-extrabold text-sm shadow-soft-xl shadow-black/40"
                >
                  <span>Get Started Free</span>
                  <ArrowRight className="w-4 h-4 text-glowOrange-600 group-hover:translate-x-1.5 transition-transform duration-200" />
                </button>

                <button
                  onClick={onExploreFeatures}
                  className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 hover:scale-105 hover:-translate-y-0.5 active:scale-95 backdrop-blur-md border border-white/25 text-white transition-all duration-200 px-5 py-3.5 rounded-full font-bold text-sm"
                >
                  <span>Explore Features</span>
                </button>
              </div>

              {/* Frosted Pill Badges */}
              <div className="flex flex-wrap items-center gap-2.5 pt-4 max-w-[215px] sm:max-w-none">
                <span className="px-4 py-1.5 rounded-full text-xs font-semibold bg-white/15 backdrop-blur-md border border-white/25 text-white shadow-soft-sm hover:scale-105 hover:bg-white/25 hover:border-white/40 hover:-translate-y-0.5 active:scale-95 transition-all duration-200 cursor-pointer">
                  Voice Notes
                </span>
                <span className="px-4 py-1.5 rounded-full text-xs font-semibold bg-white/15 backdrop-blur-md border border-white/25 text-white shadow-soft-sm hover:scale-105 hover:bg-white/25 hover:border-white/40 hover:-translate-y-0.5 active:scale-95 transition-all duration-200 cursor-pointer">
                  Instant AI Transcript
                </span>
                <span className="px-4 py-1.5 rounded-full text-xs font-semibold bg-white/15 backdrop-blur-md border border-white/25 text-white shadow-soft-sm hover:scale-105 hover:bg-white/25 hover:border-white/40 hover:-translate-y-0.5 active:scale-95 transition-all duration-200 cursor-pointer">
                  Smart Categories
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Floating Frosted Cards Composition over Animated Robot */}
          <div className="lg:col-span-6 relative flex flex-col sm:flex-row lg:flex-col items-center justify-center gap-4 sm:gap-6 min-h-[460px] lg:h-[500px]">
            {/* CARD 1: Central Audio Waveform & Player Card */}
            <div className="w-full max-w-sm sm:max-w-xs md:max-w-sm rounded-3xl bg-white/95 backdrop-blur-md text-charcoal-900 p-5 shadow-2xl border border-white/70 animate-float-slow z-20 lg:ml-auto lg:mr-2 hover:scale-[1.02] hover:-translate-y-1.5 hover:shadow-[0_25px_60px_rgba(0,0,0,0.35)] transition-all duration-300">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black tracking-tight text-charcoal-900">
                  Intelligent Thought Capture
                </span>
                <span className="p-1 rounded-full bg-warm-100 text-charcoal-400">
                  <Sparkles className="w-3.5 h-3.5 text-glowOrange-500 animate-spin-slow" />
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-charcoal-500 mb-3">
                <span className="font-bold text-charcoal-800">Rec-100823</span>
                <span className="font-semibold">3:25 / 10:21</span>
              </div>

              {/* Glowing Cyan/Teal Soundwave Waveform */}
              <div className="h-10 flex items-center justify-between gap-[3px] py-1 px-1.5 bg-warm-100/90 rounded-xl mb-4 border border-charcoal-100 overflow-hidden">
                {[
                  25, 45, 75, 40, 60, 95, 65, 35, 80, 100, 70, 50, 85, 90, 60, 40, 75,
                  88, 55, 30, 65, 80, 45, 90, 70, 35, 60,
                ].map((h, i) => (
                  <span
                    key={i}
                    className={`w-[3px] rounded-full bg-gradient-to-t from-[#0D9488] to-[#2DD4BF] ${isPlaying ? 'animate-equalizer' : 'transition-all duration-150'}`}
                    style={{
                      height: `${isPlaying ? Math.max(20, (h * (i % 2 === 0 ? 1 : 0.75))) : h * 0.4}%`,
                      animationDelay: `${i * 65}ms`,
                      animationDuration: `${0.8 + (i % 4) * 0.2}s`,
                    }}
                  />
                ))}
              </div>

              {/* Player Controls (Reference Orange Button) */}
              <div className="flex items-center justify-center gap-5 pt-1">
                <button
                  type="button"
                  className="p-1.5 text-charcoal-400 hover:text-charcoal-700 hover:scale-110 active:scale-90 transition-all"
                  title="Rewind"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-10 h-10 rounded-full bg-gradient-to-tr from-glowOrange-600 to-glowOrange-500 hover:from-glowOrange-500 hover:to-glowOrange-400 text-white flex items-center justify-center transition-all transform hover:scale-110 active:scale-95 shadow-glow-orange hover:shadow-[0_0_30px_rgba(249,115,22,0.6)]"
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
                  className="p-1.5 text-charcoal-400 hover:text-charcoal-700 hover:scale-110 active:scale-90 transition-all"
                  title="Fast Forward"
                >
                  <FastForward className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* CARD 2 (Top Right Offset): Video/Audio Caption & Drop Card */}
            <div className="group w-full max-w-sm sm:max-w-xs md:max-w-[270px] rounded-2xl bg-white/95 backdrop-blur-md text-charcoal-900 p-4 shadow-2xl border border-white/70 lg:absolute lg:-top-6 lg:right-0 animate-float-delay z-10 hidden sm:block hover:scale-[1.03] hover:-translate-y-1.5 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-black text-charcoal-900">Voice Note</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-300 animate-pulse">
                  AI Ready
                </span>
              </div>

              <div className="p-3 rounded-xl border border-dashed border-charcoal-200 bg-warm-50 text-center mb-3 group-hover:border-brand-300 transition-colors">
                <Mic className="w-4 h-4 mx-auto text-brand-600 mb-1 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300" />
                <p className="text-[11px] font-bold text-charcoal-800">
                  Tap mic or drop voice file
                </p>
                <p className="text-[9px] text-charcoal-400">Max size 25MB • WebM, MP3</p>
              </div>

              <button
                onClick={onGetStarted}
                className="w-full py-1.5 rounded-xl text-xs font-bold bg-charcoal-900 text-white hover:bg-black hover:scale-[1.02] active:scale-98 transition-all duration-150"
              >
                Generate Notes
              </button>
            </div>

            {/* CARD 3 (Bottom Right Offset): Consistency Check / Structured Summary Card */}
            <div className="w-full max-w-sm sm:max-w-xs md:max-w-[280px] rounded-2xl bg-white/95 backdrop-blur-md text-charcoal-900 p-4 shadow-2xl border border-white/70 lg:absolute lg:-bottom-6 lg:right-2 z-30 animate-float-reverse hover:scale-[1.03] hover:-translate-y-1.5 hover:shadow-2xl transition-all duration-300">
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
                    <CheckCircle2 className="w-3.5 h-3.5 animate-pulse" />
                    100% Synced
                  </span>
                </div>
              </div>

              {/* Topic Breakdown Metrics with colored dots */}
              <div className="space-y-1.5 pt-1 border-t border-charcoal-100">
                <p className="text-[10px] font-bold uppercase tracking-wider text-charcoal-400 mb-1">
                  Category Distribution
                </p>
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-charcoal-700 font-medium">
                    <span className="w-2 h-2 rounded-full bg-brand-500" /> Ideas
                  </span>
                  <span className="font-bold text-charcoal-900">25%</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-charcoal-700 font-medium">
                    <span className="w-2 h-2 rounded-full bg-glowOrange-500" /> Business
                  </span>
                  <span className="font-bold text-charcoal-900">55%</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-charcoal-700 font-medium">
                    <span className="w-2 h-2 rounded-full bg-mivoGreen-500" /> To-do
                  </span>
                  <span className="font-bold text-charcoal-900">20%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
