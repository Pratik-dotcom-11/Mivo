import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button, Logo, ThemeToggle, Modal } from '@/components/common';
import {
  ArrowLeft,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
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
  const { signInWithGoogle, demoSignIn, error, clearError } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [activeModal, setActiveModal] = useState<'privacy' | 'terms' | null>(null);
  const [showGoogleSetupModal, setShowGoogleSetupModal] = useState(false);
  const [copiedCallback, setCopiedCallback] = useState(false);

  const SUPABASE_PROJECT_ID = 'npixrygnfkqahlxntwai';
  const SUPABASE_CALLBACK_URL = `https://${SUPABASE_PROJECT_ID}.supabase.co/auth/v1/callback`;
  const SUPABASE_PROVIDERS_URL = `https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}/auth/providers`;

  const handleGoogleSignIn = async () => {
    clearError();

    setIsLoading(true);
    const res = await signInWithGoogle();
    setIsLoading(false);

    if (res.error) {
      if (
        res.error.message === 'GOOGLE_PROVIDER_DISABLED' ||
        res.error.message.toLowerCase().includes('unsupported provider') ||
        res.error.message.toLowerCase().includes('not enabled')
      ) {
        setShowGoogleSetupModal(true);
      }
      return;
    }

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

  const handleCopyCallback = () => {
    navigator.clipboard.writeText(SUPABASE_CALLBACK_URL);
    setCopiedCallback(true);
    setTimeout(() => setCopiedCallback(false), 2000);
  };

  const isGoogleDisabledError =
    error === 'GOOGLE_PROVIDER_DISABLED' ||
    (error && (error.toLowerCase().includes('provider') || error.toLowerCase().includes('enabled')));

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
          {error && (
            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1 space-y-2">
                <p className="leading-snug font-medium">
                  {isGoogleDisabledError
                    ? 'Google OAuth provider is not enabled in your Supabase project yet.'
                    : error}
                </p>
                {isGoogleDisabledError && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    <Button
                      type="button"
                      variant="primary"
                      size="xs"
                      onClick={() => setShowGoogleSetupModal(true)}
                      className="font-bold bg-amber-600 hover:bg-amber-700 text-white"
                    >
                      View 2-Min Setup Guide
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="xs"
                      onClick={handleDemoAccess}
                      className="font-medium"
                    >
                      Use Demo Mode Now
                    </Button>
                  </div>
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
            <div className="flex items-center justify-center gap-4 text-[11px] text-charcoal-400 dark:text-dark-muted">
              <button
                onClick={() => setActiveModal('privacy')}
                className="hover:underline hover:text-charcoal-600 dark:hover:text-white"
              >
                Privacy Policy
              </button>
              <span>•</span>
              <button
                onClick={() => setActiveModal('terms')}
                className="hover:underline hover:text-charcoal-600 dark:hover:text-white"
              >
                Terms of Service
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-xs text-charcoal-400 dark:text-dark-muted">
        &copy; {new Date().getFullYear()} {APP_NAME}. {APP_TAGLINE}
      </footer>

      {/* Google OAuth Quick Setup Modal */}
      <Modal
        isOpen={showGoogleSetupModal}
        onClose={() => setShowGoogleSetupModal(false)}
        title="Enable Google Sign-In in Supabase"
        size="md"
      >
        <div className="space-y-4 text-xs text-charcoal-600 dark:text-dark-muted">
          <p className="leading-relaxed">
            Your Supabase project is active, but Google OAuth is toggled OFF by default. To enable one-click Google Sign-In:
          </p>

          <ol className="list-decimal pl-4 space-y-2.5 font-medium text-charcoal-700 dark:text-charcoal-300">
            <li>
              <span>In Google Cloud Console, add this <strong>Authorized Redirect URI</strong>:</span>
              <div className="mt-1 flex items-center justify-between gap-2 p-2 rounded-xl bg-warm-100 dark:bg-dark-bg border border-charcoal-200 dark:border-dark-border font-mono text-[11px] break-all select-all">
                <span>{SUPABASE_CALLBACK_URL}</span>
                <button
                  type="button"
                  onClick={handleCopyCallback}
                  className="p-1 rounded-lg hover:bg-white dark:hover:bg-dark-card shrink-0 transition-colors"
                  title="Copy Redirect URI"
                >
                  {copiedCallback ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </li>
            <li>
              <span>Open your Supabase Project Auth Providers and toggle <strong>Google</strong> to ON.</span>
            </li>
            <li>
              <span>Paste your Google <strong>Client ID</strong> and <strong>Client Secret</strong> and click <strong>Save</strong>.</span>
            </li>
          </ol>

          <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
            <a
              href={SUPABASE_PROVIDERS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors"
            >
              <span>Open Supabase Auth Providers</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDemoAccess}
              className="w-full sm:w-auto text-xs"
            >
              Continue in Demo Mode for Now
            </Button>
          </div>
        </div>
      </Modal>

      {/* Privacy Policy Modal */}
      <Modal
        isOpen={activeModal === 'privacy'}
        onClose={() => setActiveModal(null)}
        title="Privacy Policy"
        size="md"
      >
        <div className="space-y-3 text-xs text-charcoal-600 dark:text-dark-muted max-h-96 overflow-y-auto pr-2">
          <p className="font-semibold text-charcoal-800 dark:text-white">
            1. Respecting Your Voice Privacy
          </p>
          <p>
            Mivo treats your audio recordings and notes as strictly private personal data.
            Audio recordings are stored in secure, private cloud buckets protected by PostgreSQL
            Row Level Security.
          </p>
          <p className="font-semibold text-charcoal-800 dark:text-white">
            2. Google Authentication Data
          </p>
          <p>
            When signing in with Google OAuth, Mivo only accesses your name, email address, and profile
            photo. We never request access to your Google Drive, contacts, or other Google services.
          </p>
          <p className="font-semibold text-charcoal-800 dark:text-white">
            3. Data Isolation
          </p>
          <p>
            Every database record is locked to your unique authenticated user ID. No other user
            can view, search, or listen to your voice notes.
          </p>
        </div>
      </Modal>

      {/* Terms of Service Modal */}
      <Modal
        isOpen={activeModal === 'terms'}
        onClose={() => setActiveModal(null)}
        title="Terms of Service"
        size="md"
      >
        <div className="space-y-3 text-xs text-charcoal-600 dark:text-dark-muted max-h-96 overflow-y-auto pr-2">
          <p className="font-semibold text-charcoal-800 dark:text-white">
            1. Acceptance of Terms
          </p>
          <p>
            By using Mivo, you agree to these terms. Mivo is designed as a productivity tool for
            personal voice note recording, speech-to-text transcription, and idea organization.
          </p>
          <p className="font-semibold text-charcoal-800 dark:text-white">
            2. Permitted Use
          </p>
          <p>
            You agree not to upload malicious audio files, attempt unauthorized access to other user
            partitions, or abuse speech-to-text API endpoints.
          </p>
        </div>
      </Modal>
    </div>
  );
};
