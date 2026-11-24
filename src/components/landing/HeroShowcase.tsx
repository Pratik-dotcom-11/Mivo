import React from 'react';
import { HeroFramePlayer } from './HeroFramePlayer';

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
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div
      className="w-full relative rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/20 select-none aspect-[1530/875]"
      style={{
        background:
          'linear-gradient(135deg, #380F06 0%, #5C1D0F 28%, #852F1A 60%, #9E3C22 75%, #0D2624 100%)',
      }}
    >
      {/* Pure Full-Motion Animated Hero Section (235 frames in smooth ping-pong loop) */}
      <div className="absolute inset-0 w-full h-full pointer-events-none">
        <HeroFramePlayer className="w-full h-full" />
      </div>

      {/* Interactive Workable Buttons Overlay
          Precisely mapped to the animated hero section's visible buttons and links */}
      <div className="absolute inset-0 z-10 pointer-events-auto">
        {/* 1. Header Logo (mivo.ai) */}
        <button
          type="button"
          onClick={() => scrollTo('hero')}
          className="absolute rounded-xl cursor-pointer hover:bg-white/5 active:scale-95 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
          style={{ left: '4.5%', top: '6.5%', width: '9.0%', height: '5.5%' }}
          title="mivo.ai - Return to top"
          aria-label="mivo.ai logo"
        />

        {/* 2. Header Navigation: Home */}
        <button
          type="button"
          onClick={() => scrollTo('hero')}
          className="absolute rounded-lg cursor-pointer hover:bg-white/10 active:scale-95 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
          style={{ left: '34.2%', top: '7.5%', width: '4.5%', height: '4.5%' }}
          title="Home"
          aria-label="Home"
        />

        {/* 3. Header Navigation: Features */}
        <button
          type="button"
          onClick={onExploreFeatures}
          className="absolute rounded-lg cursor-pointer hover:bg-white/10 active:scale-95 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
          style={{ left: '39.4%', top: '7.5%', width: '6.0%', height: '4.5%' }}
          title="Features"
          aria-label="Features"
        />

        {/* 4. Header Navigation: How It Works */}
        <button
          type="button"
          onClick={() => scrollTo('how-it-works')}
          className="absolute rounded-lg cursor-pointer hover:bg-white/10 active:scale-95 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
          style={{ left: '46.0%', top: '7.5%', width: '8.5%', height: '4.5%' }}
          title="How It Works"
          aria-label="How It Works"
        />

        {/* 5. Header Navigation: Sign In / Dashboard */}
        <button
          type="button"
          onClick={isLoggedIn ? onGoToApp : onSignIn}
          className="absolute rounded-lg cursor-pointer hover:bg-white/10 active:scale-95 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
          style={{ left: '55.2%', top: '7.5%', width: '5.5%', height: '4.5%' }}
          title={isLoggedIn ? 'Dashboard' : 'Sign In'}
          aria-label={isLoggedIn ? 'Dashboard' : 'Sign In'}
        />

        {/* 6. Header Primary CTA: Start for Free */}
        <button
          type="button"
          onClick={isLoggedIn ? onGoToApp : onGetStarted}
          className="group absolute rounded-full cursor-pointer hover:shadow-[0_0_25px_rgba(255,200,50,0.6)] hover:scale-[1.03] active:scale-95 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-glowOrange-400"
          style={{ left: '80.0%', top: '6.0%', width: '15.0%', height: '6.5%' }}
          title={isLoggedIn ? 'Go to Dashboard' : 'Start for Free'}
          aria-label={isLoggedIn ? 'Go to Dashboard' : 'Start for Free'}
        >
          <span className="sr-only">Start for Free</span>
        </button>

        {/* 7. Left Primary CTA: Get Started Free -> */}
        <button
          type="button"
          onClick={onGetStarted}
          className="group absolute rounded-full cursor-pointer hover:shadow-[0_0_30px_rgba(249,115,22,0.7)] hover:scale-[1.03] active:scale-95 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-glowOrange-400"
          style={{ left: '4.5%', top: '75.5%', width: '14.0%', height: '6.5%' }}
          title="Get Started Free"
          aria-label="Get Started Free"
        >
          <span className="sr-only">Get Started Free</span>
        </button>

        {/* 8. Left Secondary CTA: Explore Features */}
        <button
          type="button"
          onClick={onExploreFeatures}
          className="group absolute rounded-full cursor-pointer hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] hover:scale-[1.03] active:scale-95 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
          style={{ left: '19.2%', top: '75.5%', width: '11.0%', height: '6.5%' }}
          title="Explore Features"
          aria-label="Explore Features"
        >
          <span className="sr-only">Explore Features</span>
        </button>

        {/* 9. Pill Badge 1: Voice Notes */}
        <button
          type="button"
          onClick={onExploreFeatures}
          className="absolute rounded-full cursor-pointer hover:scale-105 active:scale-95 transition-all focus:outline-none focus-visible:ring-1 focus-visible:ring-white/40"
          style={{ left: '4.5%', top: '84.0%', width: '8.5%', height: '5.5%' }}
          title="Voice Notes"
          aria-label="Voice Notes"
        />

        {/* 10. Pill Badge 2: Instant AI Transcript */}
        <button
          type="button"
          onClick={onExploreFeatures}
          className="absolute rounded-full cursor-pointer hover:scale-105 active:scale-95 transition-all focus:outline-none focus-visible:ring-1 focus-visible:ring-white/40"
          style={{ left: '13.5%', top: '84.0%', width: '11.5%', height: '5.5%' }}
          title="Instant AI Transcript"
          aria-label="Instant AI Transcript"
        />

        {/* 11. Pill Badge 3: Smart Categories */}
        <button
          type="button"
          onClick={onExploreFeatures}
          className="absolute rounded-full cursor-pointer hover:scale-105 active:scale-95 transition-all focus:outline-none focus-visible:ring-1 focus-visible:ring-white/40"
          style={{ left: '25.5%', top: '84.0%', width: '10.0%', height: '5.5%' }}
          title="Smart Categories"
          aria-label="Smart Categories"
        />

        {/* 12. Audio Thought Capture: Play / Pause Button */}
        <button
          type="button"
          onClick={onGetStarted}
          className="absolute rounded-full cursor-pointer hover:scale-110 active:scale-90 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-glowOrange-400"
          style={{ left: '78.2%', top: '60.8%', width: '3.2%', height: '5.5%' }}
          title="Try Thought Capture"
          aria-label="Play/Pause Voice Thought Capture"
        />

        {/* 13. Voice Note Card: Generate Notes Button */}
        <button
          type="button"
          onClick={onGetStarted}
          className="absolute rounded-xl cursor-pointer hover:scale-[1.02] active:scale-95 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-charcoal-700"
          style={{ left: '71.5%', top: '36.5%', width: '22.0%', height: '4.2%' }}
          title="Generate Notes"
          aria-label="Generate Notes"
        />
      </div>
    </div>
  );
};
