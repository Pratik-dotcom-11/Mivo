import React from 'react';
import { HeroShowcase } from '@/components/landing/HeroShowcase';
import { Logo } from '@/components/common/Logo';
import { useAuth } from '@/hooks/useAuth';
import {
  Mic,
  FileText,
  FolderSync,
  Search,
  ArrowRight,
  ShieldCheck,
  Zap,
  Sparkles,
} from 'lucide-react';
import { APP_NAME, APP_TAGLINE } from '@/utils/constants';

export interface LandingPageProps {
  onNavigateToAuth: () => void;
  onNavigateToApp: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigateToAuth,
  onNavigateToApp,
}) => {
  const { user } = useAuth();

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#FAF7F2] text-charcoal-900 font-sans selection:bg-terracotta-500 selection:text-white pb-16">
      {/* Dreamy Floral Glow Ambient Background - Full Vibrant Visibility */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Organic Floral Glow Texture Wallpaper */}
        <img
          src="/dreamy-glow-bg.jpg"
          alt=""
          className="w-full h-full object-cover object-center opacity-95 filter saturate-125 contrast-105"
        />
        {/* Subtle vignette to frame content while leaving background fully visible */}
        <div className="absolute inset-0 bg-black/[0.03] pointer-events-none" />
      </div>

      {/* Outer Shell Wrapper: mimics the showcase matte canvas frame */}
      <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6 space-y-16 sm:space-y-24">
        {/* =========================================================================
            SECTION 1: HERO (Recreating the visual authority of the reference image)
            ========================================================================= */}
        <section id="hero" className="scroll-mt-6">
          <HeroShowcase
            onGetStarted={onNavigateToAuth}
            onExploreFeatures={() => scrollToSection('features')}
            onSignIn={onNavigateToAuth}
            isLoggedIn={Boolean(user)}
            onGoToApp={onNavigateToApp}
          />
        </section>

        {/* =========================================================================
            SECTION 2: FEATURES SECTION (Clean, crisp light/dark contrast)
            ========================================================================= */}
        <section id="features" className="scroll-mt-20 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md text-terracotta-900 border border-terracotta-300/80 text-xs font-extrabold uppercase tracking-wider shadow-soft-sm">
              <Sparkles className="w-3.5 h-3.5 text-glowOrange-600" />
              Core Capabilities
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-charcoal-950 tracking-tight drop-shadow-sm">
              Designed for speed and clarity
            </h2>
            <p className="text-sm sm:text-base text-charcoal-800 font-semibold max-w-xl mx-auto drop-shadow-sm">
              Everything you need to effortlessly turn spoken stream-of-consciousness into sharp, actionable notes.
            </p>
          </div>

          {/* 4 Feature Cards with Frosted Glass & Reference-Inspired Styling */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Feature 1 */}
            <div className="group rounded-3xl bg-white/80 backdrop-blur-md p-6 shadow-soft-md hover:shadow-soft-xl border border-white/80 hover:border-terracotta-300/50 transition-all duration-200 flex flex-col justify-between hover:-translate-y-1">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-terracotta-600 to-glowOrange-500 text-white flex items-center justify-center shadow-soft-md shadow-terracotta-600/20 group-hover:scale-105 transition-transform">
                  <Mic className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-charcoal-900 tracking-tight">
                  Voice Recording
                </h3>
                <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed">
                  Record your thoughts whenever inspiration strikes. Real-time visual waveforms confirm your microphone is capturing every nuance.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-charcoal-100/80 text-xs font-bold text-terracotta-700 flex items-center gap-1">
                <span>Instant audio capture</span>
                <Zap className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Feature 2 */}
            <div className="group rounded-3xl bg-white/80 backdrop-blur-md p-6 shadow-soft-md hover:shadow-soft-xl border border-white/80 hover:border-brand-300/50 transition-all duration-200 flex flex-col justify-between hover:-translate-y-1">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-glowTeal-500 text-white flex items-center justify-center shadow-soft-md shadow-brand-600/20 group-hover:scale-105 transition-transform">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-charcoal-900 tracking-tight">
                  Instant Transcription
                </h3>
                <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed">
                  Convert your recordings into readable, clean text. AI generates concise executive summaries and actionable bullet points automatically.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-charcoal-100/80 text-xs font-bold text-brand-700 flex items-center gap-1">
                <span>Accurate AI synthesis</span>
                <Sparkles className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Feature 3 */}
            <div className="group rounded-3xl bg-white/80 backdrop-blur-md p-6 shadow-soft-md hover:shadow-soft-xl border border-white/80 hover:border-glowOrange-300/50 transition-all duration-200 flex flex-col justify-between hover:-translate-y-1">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-glowOrange-500 to-mivoYellow-500 text-white flex items-center justify-center shadow-soft-md shadow-glowOrange-500/20 group-hover:scale-105 transition-transform">
                  <FolderSync className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-charcoal-900 tracking-tight">
                  Organized Notes
                </h3>
                <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed">
                  Keep your thoughts neatly sorted into simple categories: <strong className="text-charcoal-900 font-bold">Ideas</strong>, <strong className="text-charcoal-900 font-bold">Business</strong>, and <strong className="text-charcoal-900 font-bold">To-do</strong>.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-charcoal-100/80 text-xs font-bold text-glowOrange-700 flex items-center gap-1">
                <span>Color-coded structure</span>
                <FolderSync className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Feature 4 */}
            <div className="group rounded-3xl bg-white/80 backdrop-blur-md p-6 shadow-soft-md hover:shadow-soft-xl border border-white/80 hover:border-glowTeal-300/50 transition-all duration-200 flex flex-col justify-between hover:-translate-y-1">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-glowTeal-600 to-mivoGreen-500 text-white flex items-center justify-center shadow-soft-md shadow-glowTeal-600/20 group-hover:scale-105 transition-transform">
                  <Search className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-charcoal-900 tracking-tight">
                  Easy Search
                </h3>
                <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed">
                  Quickly find any previously saved note or specific phrase. Full-text search queries both your raw transcriptions and AI summaries instantly.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-charcoal-100/80 text-xs font-bold text-glowTeal-700 flex items-center gap-1">
                <span>Zero latency search</span>
                <Search className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 3: HOW IT WORKS (3-step workflow)
            ========================================================================= */}
        <section id="how-it-works" className="scroll-mt-20 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-charcoal-950 tracking-tight drop-shadow-sm">
              Three simple steps to clarity
            </h2>
            <p className="text-sm sm:text-base text-charcoal-800 font-semibold max-w-xl mx-auto drop-shadow-sm">
              From spontaneous spoken idea to structured, accessible knowledge in seconds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* Step 1 */}
            <div className="rounded-3xl bg-white/80 backdrop-blur-md p-7 shadow-soft-md hover:shadow-soft-xl border border-white/80 hover:border-terracotta-300/50 transition-all duration-200 relative space-y-4 hover:-translate-y-1">
              <div className="w-10 h-10 rounded-2xl bg-terracotta-100 text-terracotta-800 font-black text-sm flex items-center justify-center">
                01
              </div>
              <h3 className="text-lg font-bold text-charcoal-900">
                Step 1: Record your thoughts
              </h3>
              <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed">
                Click the microphone button and talk naturally. Capture brainstorms, meeting takeaways, or quick reminders without typing.
              </p>
              <div className="p-3 rounded-2xl bg-warm-100/90 border border-charcoal-200/60 flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
                <span className="text-xs font-mono font-bold text-charcoal-800">
                  00:42 • Recording audio...
                </span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="rounded-3xl bg-white/80 backdrop-blur-md p-7 shadow-soft-md hover:shadow-soft-xl border border-white/80 hover:border-brand-300/50 transition-all duration-200 relative space-y-4 hover:-translate-y-1">
              <div className="w-10 h-10 rounded-2xl bg-brand-100 text-brand-800 font-black text-sm flex items-center justify-center">
                02
              </div>
              <h3 className="text-lg font-bold text-charcoal-900">
                Step 2: Convert your voice into text
              </h3>
              <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed">
                Mivo automatically transcribes speech into clear prose, cleans up filler words, and generates an executive summary.
              </p>
              <div className="p-3 rounded-2xl bg-brand-50/90 border border-brand-200/80 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-600 flex-shrink-0" />
                <span className="text-xs font-bold text-brand-900 truncate">
                  AI formatted &amp; structured
                </span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="rounded-3xl bg-white/80 backdrop-blur-md p-7 shadow-soft-md hover:shadow-soft-xl border border-white/80 hover:border-glowTeal-300/50 transition-all duration-200 relative space-y-4 hover:-translate-y-1">
              <div className="w-10 h-10 rounded-2xl bg-glowTeal-100 text-glowTeal-800 font-black text-sm flex items-center justify-center">
                03
              </div>
              <h3 className="text-lg font-bold text-charcoal-900">
                Step 3: Save and organize your notes
              </h3>
              <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed">
                Assign notes to Ideas, Business, or To-do. Search, favorite, and listen back at multiple playback speeds whenever needed.
              </p>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-brand-100 text-brand-800 border border-brand-300">
                  Ideas
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-glowOrange-100 text-glowOrange-900 border border-glowOrange-300">
                  Business
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-mivoGreen-100 text-mivoGreen-900 border border-mivoGreen-300">
                  To-do
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 4: FINAL CTA (Atmospheric banner)
            ========================================================================= */}
        <section
          className="relative rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden mivo-cta-gradient text-white p-8 sm:p-12 lg:p-16 text-center shadow-2xl border border-white/10"
          style={{
            background: 'linear-gradient(135deg, #380F06 0%, #6E2614 45%, #18181C 100%)',
          }}
        >
          <div className="absolute top-0 right-1/4 w-80 h-80 bg-glowOrange-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-glowTeal-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
              Never lose a thought again.
            </h2>
            <p className="text-base sm:text-lg text-white/90 font-medium">
              Start capturing your ideas with Mivo today.
            </p>
            <div className="pt-2">
              <button
                onClick={onNavigateToAuth}
                className="inline-flex items-center gap-2 bg-white text-charcoal-900 hover:bg-warm-100 active:scale-95 transition-all duration-150 px-8 py-4 rounded-full font-extrabold text-base shadow-soft-xl shadow-black/40"
              >
                <span>Start Using Mivo</span>
                <ArrowRight className="w-5 h-5 text-glowOrange-600" />
              </button>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 5: FOOTER
            ========================================================================= */}
        <footer className="pt-8 border-t border-charcoal-300/80 dark:border-dark-border space-y-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center sm:text-left">
              <Logo size="md" showTagline />
            </div>

            {/* Navigation Links */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-bold text-charcoal-700 dark:text-dark-muted">
              <button
                onClick={() => scrollToSection('hero')}
                className="hover:text-charcoal-900 dark:hover:text-white transition-colors"
              >
                Home
              </button>
              <button
                onClick={() => scrollToSection('features')}
                className="hover:text-charcoal-900 dark:hover:text-white transition-colors"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection('how-it-works')}
                className="hover:text-charcoal-900 dark:hover:text-white transition-colors"
              >
                How It Works
              </button>
              <button
                onClick={onNavigateToApp}
                className="hover:text-charcoal-900 dark:hover:text-white transition-colors text-glowOrange-600 dark:text-glowOrange-400"
              >
                {user ? 'My Dashboard' : 'Demo Dashboard'}
              </button>
              {!user && (
                <button
                  onClick={onNavigateToAuth}
                  className="hover:text-charcoal-900 dark:hover:text-white transition-colors"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-charcoal-200 dark:border-dark-border text-xs text-charcoal-500 dark:text-dark-muted">
            <p className="font-medium">
              &copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved. {APP_TAGLINE}
            </p>

            <div className="flex items-center gap-4 text-[11px] font-semibold">
              <span className="flex items-center gap-1 text-charcoal-600 dark:text-dark-muted">
                <ShieldCheck className="w-3.5 h-3.5 text-mivoGreen-600" />
                End-to-End Encrypted Storage
              </span>
              <span>•</span>
              <button
                onClick={() =>
                  alert(
                    'Mivo Privacy Policy: Your audio recordings and transcripts are private to your account and never used for public training.'
                  )
                }
                className="hover:underline"
              >
                Privacy Policy
              </button>
              <span>•</span>
              <button
                onClick={() =>
                  alert('Mivo Terms of Service: Free to capture, organize, and export your voice notes anytime.')
                }
                className="hover:underline"
              >
                Terms of Service
              </button>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};
