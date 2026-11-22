import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button, Logo, ThemeToggle, Modal } from '@/components/common';
import {
  ArrowLeft,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  CheckCircle,
} from 'lucide-react';
import { APP_NAME, APP_TAGLINE } from '@/utils/constants';

export interface AuthPageProps {
  onBackToLanding?: () => void;
  onAuthenticated?: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  onBackToLanding,
  onAuthenticated,
}) => {
  const { signInWithGoogle, demoSignIn, isConfigured, error, clearError } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [activeModal, setActiveModal] = useState<'privacy' | 'terms' | null>(null);
  const [localMessage, setLocalMessage] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    clearError();
    setLocalMessage(null);

    // If Supabase credentials have not been configured yet, explain clearly and offer Demo sign-in
    if (!isConfigured) {
      setLocalMessage(
        'Supabase is not configured with live API keys yet. You can launch instant Demo Mode to test the full recording and transcription studio, or configure your .env file.'
      );
      return;
    }

    setIsLoading(true);
    const res = await signInWithGoogle();
    setIsLoading(false);

    if (!res.error && onAuthenticated) {
      onAuthenticated();
    }
  };

  const handleDemoAccess = () => {
    demoSignIn();
    if (onAuthenticated) {
      onAuthenticated();
    }
  };

  return (
    <div className="min-h-screen bg-warm-200/50 dark:bg-dark-bg text-charcoal-800 dark:text-charcoal-100 flex flex-col justify-between p-4 sm:p-6 transition-colors duration-200">
      {/* Top Header */}
      <header className="max-w-6xl mx-auto w-full flex items-center justify-between py-2">
        <div className="flex items-center gap-3">
          {onBackToLanding && (
            <button
              onClick={onBackToLanding}
              className="px-3 py-1.5 rounded-xl text-charcoal-600 hover:text-charcoal-900 dark:text-dark-muted dark:hover:text-white hover:bg-warm-100 dark:hover:bg-dark-card transition-colors flex items-center gap-1.5 text-xs font-semibold"
              title="Return to Mivo Home"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Home</span>
            </button>
          )}
          <Logo size="md" showTagline />
        </div>

        <ThemeToggle variant="icon" />
      </header>

      {/* Main Centered Minimal Authentication Card */}
      <main className="w-full max-w-md mx-auto my-auto py-8">
        <div className="bg-white dark:bg-dark-card border border-black/[0.04] dark:border-white/[0.06] rounded-[2.5rem] p-8 sm:p-10 shadow-soft-xl space-y-7 relative overflow-hidden">
          {/* Subtle Decorative Glow at top */}
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-terracotta-500 via-glowOrange-500 to-terracotta-600" />

          {/* Header & Branding */}
          <div className="text-center space-y-2.5 pt-2">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-terracotta-600 to-glowOrange-500 text-white flex items-center justify-center shadow-glow-orange mb-3">
              <span className="font-mono font-black text-xl">M</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-charcoal-900 dark:text-white tracking-tight">
              Sign in to {APP_NAME}
            </h1>
            <p className="text-xs font-bold text-terracotta-700 dark:text-terracotta-400 uppercase tracking-widest">
              {APP_TAGLINE}
            </p>
            <p className="text-xs text-charcoal-500 dark:text-dark-muted font-medium max-w-xs mx-auto leading-relaxed pt-1">
              Capture your thoughts, get instant AI transcriptions, and keep your notes safe in one minimal space.
            </p>
          </div>

          {/* Error Banner */}
          {(error || localMessage) && (
            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1 space-y-2">
                <p className="leading-snug font-medium">{error || localMessage}</p>
                {!isConfigured && (
                  <Button
                    type="button"
                    variant="primary"
                    size="xs"
                    onClick={handleDemoAccess}
                    className="font-bold bg-amber-600 hover:bg-amber-700 text-white"
                  >
                    Enter Demo Mode Now
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Primary Action: Continue with Google Button */}
          <div className="space-y-4 pt-1">
            <Button
              type="button"
              variant="google"
              size="lg"
              className="w-full text-sm font-bold py-3.5 rounded-2xl shadow-soft-sm hover:shadow-soft-md transition-all active:scale-[0.99] border-charcoal-200 dark:border-dark-border"
              isLoading={isLoading}
              onClick={handleGoogleSignIn}
            >
              Continue with Google
            </Button>

            {/* Seamless Demo Mode Option (For local development & evaluation) */}
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={handleDemoAccess}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-charcoal-500 hover:text-terracotta-600 dark:text-dark-muted dark:hover:text-terracotta-300 transition-colors py-1"
              >
                <Sparkles className="w-3.5 h-3.5 text-terracotta-500" />
                <span>Try Instant Demo Mode (No account needed)</span>
              </button>
            </div>
          </div>

          {/* Security & Privacy Badging */}
          <div className="pt-2 border-t border-charcoal-100 dark:border-dark-border space-y-3">
            <div className="flex items-center justify-center gap-2 text-[11px] font-semibold text-charcoal-500 dark:text-dark-muted">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>End-to-end user isolation with Supabase Row Level Security</span>
            </div>

            {/* Privacy & Terms Links as Placeholders */}
            <div className="flex items-center justify-center gap-3 text-[11px] text-charcoal-400 dark:text-dark-muted">
              <button
                onClick={() => setActiveModal('privacy')}
                className="hover:text-charcoal-700 dark:hover:text-charcoal-200 underline underline-offset-2 transition-colors"
              >
                Privacy Policy
              </button>
              <span>&bull;</span>
              <button
                onClick={() => setActiveModal('terms')}
                className="hover:text-charcoal-700 dark:hover:text-charcoal-200 underline underline-offset-2 transition-colors"
              >
                Terms of Service
              </button>
            </div>
          </div>
        </div>

        {/* Minimal Footer */}
        <p className="text-center text-xs text-charcoal-400 dark:text-dark-muted mt-6 font-medium">
          Mivo &bull; {APP_TAGLINE}
        </p>
      </main>

      <div className="h-6" />

      {/* Privacy Policy Modal */}
      <Modal
        isOpen={activeModal === 'privacy'}
        onClose={() => setActiveModal(null)}
        title="Privacy Policy (Placeholder)"
        size="md"
      >
        <div className="space-y-4 text-xs sm:text-sm text-charcoal-600 dark:text-dark-muted leading-relaxed">
          <p>
            At <strong>Mivo</strong>, your voice notes, transcripts, and ideas belong entirely to you.
          </p>
          <div className="space-y-2 bg-warm-100 dark:bg-dark-surface p-4 rounded-2xl border border-charcoal-200/60 dark:border-dark-border">
            <div className="flex items-center gap-2 font-bold text-charcoal-900 dark:text-white">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span>Isolated Storage</span>
            </div>
            <p className="text-xs">
              Recordings are placed in private, user-isolated buckets where only your authenticated credentials can access or stream them.
            </p>
          </div>
          <div className="space-y-2 bg-warm-100 dark:bg-dark-surface p-4 rounded-2xl border border-charcoal-200/60 dark:border-dark-border">
            <div className="flex items-center gap-2 font-bold text-charcoal-900 dark:text-white">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span>Zero AI Training</span>
            </div>
            <p className="text-xs">
              Your audio notes are never used to train public machine learning models.
            </p>
          </div>
          <div className="pt-2 flex justify-end">
            <Button variant="secondary" size="sm" onClick={() => setActiveModal(null)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>

      {/* Terms of Service Modal */}
      <Modal
        isOpen={activeModal === 'terms'}
        onClose={() => setActiveModal(null)}
        title="Terms of Service (Placeholder)"
        size="md"
      >
        <div className="space-y-4 text-xs sm:text-sm text-charcoal-600 dark:text-dark-muted leading-relaxed">
          <p>
            Welcome to <strong>Mivo: Your voice. Your ideas.</strong> By accessing our service, you agree to these standard operational terms.
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-xs">
            <li>You retain full intellectual property ownership of all uploaded voice files and text notes.</li>
            <li>You agree not to upload harmful, abusive, or copyrighted audio recordings without authorization.</li>
            <li>Audio processing uses secure edge workers with encrypted ephemeral pipelines.</li>
          </ul>
          <div className="pt-2 flex justify-end">
            <Button variant="secondary" size="sm" onClick={() => setActiveModal(null)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
