import React, { useState } from 'react';
import { Logo } from '@/components/common/Logo';
import { HeroFramePlayer } from './HeroFramePlayer';
import {
  Play,
  Pause,
  RotateCcw,
  FastForward,
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
      className="w-full relative rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden border border-white/15 shadow-2xl text-white select-none"
      style={{
        background:
          'linear-gradient(135deg, #380F06 0%, #5C1D0F 28%, #852F1A 60%, #9E3C22 75%, #0D2624 100%)',
      }}
    >
      {/* Full-Motion 235-Frame Animation Canvas Player */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <HeroFramePlayer />
      </div>

      {/* Solid Left-Side Gradient Mask:
          Completely covers the video's distorted AI text, gibberish, and fake buttons
          with 100% opacity on the left, then blends smoothly into the animated robot on the right */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          background:
            'linear-gradient(to right, #380F06 0%, #380F06 44%, rgba(56, 15, 6, 0.98) 50%, rgba(56, 15, 6, 0.75) 58%, rgba(56, 15, 6, 0.25) 68%, transparent 76%)',
        }}
      />

      {/* Top Header Mask:
          Conceals the video's baked-in top navigation and duplicate logo so only
          the crisp, functional React header is visible and interactive */}
      <div
        className="absolute top-0 left-0 right-0 h-24 sm:h-28 z-[1] pointer-events-none"
        style={{
          background:
            'linear-gradient(to bottom, #380F06 0%, #380F06 60%, rgba(56, 15, 6, 0.92) 80%, transparent 100%)',
        }}
      />

      {/* Mobile Backdrop Shield: Ensures 100% sharp readability on smaller portrait screens */}
      <div
        className="lg:hidden absolute inset-0 z-[1] pointer-events-none"
        style={{
          background:
            'linear-gradient(to bottom, rgba(56, 15, 6, 0.96) 0%, rgba(56, 15, 6, 0.88) 45%, rgba(56, 15, 6, 0.65) 100%)',
        }}
      />

      {/* Dynamic atmospheric radial glows */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#CE6C53]/20 rounded-full blur-[100px] pointer-events-none animate-pulse-glow-soft z-[2]" />
      <div
        className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#14B8A6]/20 rounded-full blur-[100px] pointer-events-none animate-pulse-glow-soft z-[2]"
        style={{ animationDelay: '1s' }}
      />

      {/* Main Interactive Hero Container */}
      <div className="relative z-10 p-6 sm:p-10 lg:p-12 flex flex-col justify-between min-h-[640px] lg:min-h-[700px]">
        {/* Navigation Bar inside the hero frame */}
        <header className="flex items-center justify-between gap-4 pb-8 sm:pb-12">
          {/* Logo with clean white presentation and click to top */}
          <button
            type="button"
            onClick={() => {
              const el = document.getElementById('hero');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="cursor-pointer text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 rounded-lg"
          >
            <Logo size="md" variant="light" dotAi />
          </button>

          {/* Navigation Links (Fully functional) */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-semibold tracking-wide text-white/90">
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('hero');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Home
            </button>
            <button
              type="button"
              onClick={onExploreFeatures}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Features
            </button>
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('how-it-works');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="hover:text-white transition-colors cursor-pointer"
            >
              How It Works
            </button>
            {isLoggedIn ? (
              <button
                type="button"
                onClick={onGoToApp}
                className="hover:text-white transition-colors text-glowOrange-400 font-bold cursor-pointer"
              >
                Dashboard
              </button>
            ) : (
              <button
                type="button"
                onClick={onSignIn}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Sign In
              </button>
            )}
          </nav>

          {/* CTA Header Buttons (100% Workable) */}
          <div className="flex items-center gap-2.5">
            {isLoggedIn ? (
              <button
                type="button"
                onClick={onGoToApp}
                className="bg-white text-charcoal-900 hover:bg-warm-100 active:scale-95 transition-all duration-150 px-5 py-2.5 rounded-full font-bold text-xs sm:text-sm shadow-soft-md shadow-black/30 flex items-center gap-1.5 cursor-pointer"
              >
                <span>Open Dashboard</span>
                <ArrowRight className="w-4 h-4 text-glowOrange-600" />
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={onSignIn}
                  className="hidden sm:inline-block text-xs font-semibold text-white/90 hover:text-white px-3 py-1.5 transition-colors cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={onGetStarted}
                  className="bg-white text-charcoal-900 hover:bg-warm-100 hover:scale-105 active:scale-95 transition-all duration-150 px-5 py-2.5 rounded-full font-bold text-xs sm:text-sm shadow-soft-md shadow-black/30 cursor-pointer"
                >
                  Start for Free
                </button>
              </>
            )}
          </div>
        </header>

        {/* Main Hero Body Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center my-auto">
          {/* Left Column: Crisp Headlines, Value Prop & Workable CTAs */}
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

            {/* Main Headline (Pure White, Crisp Typography, Zero Distortions) */}
            <div className="relative z-10 space-y-3">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-[1.12] drop-shadow-md">
                Your thoughts deserve to be remembered.
              </h1>
              <p className="text-sm sm:text-base text-white/90 font-medium leading-relaxed max-w-lg drop-shadow-sm">
                Capture your thoughts with your voice. Mivo turns your recordings into organized, searchable notes with zero friction.
              </p>
            </div>

            {/* Workable CTAs & Badges Container */}
            <div className="relative z-10 pt-2">
              {/* Primary & Secondary Workable Buttons */}
              <div className="flex flex-wrap items-center gap-3 max-w-[280px] sm:max-w-none">
                <button
                  type="button"
                  onClick={onGetStarted}
                  className="group inline-flex items-center gap-2 bg-gradient-to-r from-glowOrange-500 to-glowOrange-600 hover:from-glowOrange-400 hover:to-glowOrange-500 text-white hover:scale-105 hover:-translate-y-0.5 shadow-[0_0_25px_rgba(249,115,22,0.5)] active:scale-95 transition-all duration-200 px-7 py-3.5 rounded-full font-extrabold text-sm shadow-soft-xl shadow-black/40 cursor-pointer"
                >
                  <span>Get Started Free</span>
                  <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1.5 transition-transform duration-200" />
                </button>

                <button
                  type="button"
                  onClick={onExploreFeatures}
                  className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 hover:scale-105 hover:-translate-y-0.5 active:scale-95 backdrop-blur-md border border-white/25 text-white transition-all duration-200 px-6 py-3.5 rounded-full font-bold text-sm cursor-pointer"
                >
                  <span>Explore Features</span>
                </button>
              </div>

              {/* Interactive Frosted Pill Badges */}
              <div className="flex flex-wrap items-center gap-2.5 pt-4">
                <button
                  type="button"
                  onClick={onExploreFeatures}
                  className="px-4 py-1.5 rounded-full text-xs font-semibold bg-white/15 backdrop-blur-md border border-white/25 text-white shadow-soft-sm hover:scale-105 hover:bg-white/25 hover:border-white/40 hover:-translate-y-0.5 active:scale-95 transition-all duration-200 cursor-pointer"
                >
                  Voice Notes
                </button>
                <button
                  type="button"
                  onClick={onExploreFeatures}
                  className="px-4 py-1.5 rounded-full text-xs font-semibold bg-white/15 backdrop-blur-md border border-white/25 text-white shadow-soft-sm hover:scale-105 hover:bg-white/25 hover:border-white/40 hover:-translate-y-0.5 active:scale-95 transition-all duration-200 cursor-pointer"
                >
                  Instant AI Transcript
                </button>
                <button
                  type="button"
                  onClick={onExploreFeatures}
                  className="px-4 py-1.5 rounded-full text-xs font-semibold bg-white/15 backdrop-blur-md border border-white/25 text-white shadow-soft-sm hover:scale-105 hover:bg-white/25 hover:border-white/40 hover:-translate-y-0.5 active:scale-95 transition-all duration-200 cursor-pointer"
                >
                  Smart Categories
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Clean Showcase with Unobstructed Animated Cybernetic Robot
              and a dedicated interactive Audio Capture Demo Card at the bottom right */}
          <div className="lg:col-span-6 relative flex flex-col justify-end items-end min-h-[380px] lg:h-[480px]">
            {/* Interactive Audio Waveform & Thought Capture Card (Positioned at bottom-right to leave the robot in full view) */}
            <div className="w-full max-w-sm rounded-3xl bg-white/95 backdrop-blur-md text-charcoal-900 p-5 shadow-2xl border border-white/80 animate-float-slow z-20 hover:scale-[1.02] hover:-translate-y-1 hover:shadow-[0_25px_60px_rgba(0,0,0,0.35)] transition-all duration-300">
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

              {/* Glowing Cyan/Teal Equalizer Waveform */}
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

              {/* Interactive Player Controls */}
              <div className="flex items-center justify-center gap-5 pt-1">
                <button
                  type="button"
                  className="p-1.5 text-charcoal-400 hover:text-charcoal-700 hover:scale-110 active:scale-90 transition-all cursor-pointer"
                  title="Rewind"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-10 h-10 rounded-full bg-gradient-to-tr from-glowOrange-600 to-glowOrange-500 hover:from-glowOrange-500 hover:to-glowOrange-400 text-white flex items-center justify-center transition-all transform hover:scale-110 active:scale-95 shadow-glow-orange hover:shadow-[0_0_30px_rgba(249,115,22,0.6)] cursor-pointer"
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
                  className="p-1.5 text-charcoal-400 hover:text-charcoal-700 hover:scale-110 active:scale-90 transition-all cursor-pointer"
                  title="Fast Forward"
                >
                  <FastForward className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
