import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button, Logo, Modal } from '@/components/common';
import {
  ArrowLeft,
  Mail,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Send,
} from 'lucide-react';
import { APP_NAME, APP_TAGLINE } from '@/utils/constants';

export interface AuthPageProps {
  onBackToLanding?: () => void;
  onAuthenticated?: () => void;
}

type AuthMode = 'signin' | 'signup' | 'magiclink';

export const AuthPage: React.FC<AuthPageProps> = ({
  onBackToLanding,
  onAuthenticated,
}) => {
  const {
    signInWithGmailPassword,
    signUpWithGmail,
    sendGmailMagicLink,
    demoSignIn,
    error,
    clearError,
  } = useAuth();

  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [activeLegalModal, setActiveLegalModal] = useState<'privacy' | 'terms' | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setMagicLinkSent(false);

    if (!email.trim()) return;

    setIsLoading(true);

    try {
      if (mode === 'magiclink') {
        const res = await sendGmailMagicLink(email);
        if (!res.error) {
          setMagicLinkSent(true);
        }
      } else if (mode === 'signup') {
        const res = await signUpWithGmail(email, password, fullName);
        if (!res.error && onAuthenticated) {
          onAuthenticated();
        }
      } else {
        // Sign in
        const res = await signInWithGmailPassword(email, password);
        if (!res.error && onAuthenticated) {
          onAuthenticated();
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoAccess = () => {
    demoSignIn();
    if (onAuthenticated) {
      onAuthenticated();
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#FAF7F2] text-charcoal-900 flex flex-col justify-between p-4 sm:p-6 font-sans">
      {/* Dreamy Floral Glow Ambient Background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <img
          src="/dreamy-glow-bg.jpg"
          alt=""
          className="w-full h-full object-cover object-center opacity-85 filter saturate-120 contrast-105"
        />
        <div className="absolute inset-0 bg-white/15 backdrop-blur-[2px] pointer-events-none" />
      </div>

      <div className="relative z-10 flex flex-col justify-between min-h-screen w-full">
        {/* Top Header */}
        <header className="max-w-6xl mx-auto w-full flex items-center justify-between py-2">
          <div className="flex items-center gap-3">
            {onBackToLanding && (
              <button
                onClick={onBackToLanding}
                className="px-3 py-1.5 rounded-xl text-charcoal-700 hover:text-charcoal-900 bg-white/70 backdrop-blur-md border border-white/80 hover:bg-white transition-colors flex items-center gap-1.5 text-xs font-semibold shadow-soft-xs"
                title="Return to Mivo Home"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Home</span>
              </button>
            )}
            <Logo size="md" showTagline />
          </div>
        </header>

        {/* Main Centered Authentication Card */}
        <main className="w-full max-w-md mx-auto my-auto py-6">
          <div className="bg-white/90 backdrop-blur-xl border border-white/90 rounded-[2.5rem] p-7 sm:p-9 shadow-soft-2xl space-y-6 relative overflow-hidden">
            {/* Subtle Decorative Glow at top */}
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-terracotta-500 via-glowOrange-500 to-terracotta-600" />

          {/* Header & Branding */}
          <div className="text-center space-y-2 pt-1">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-terracotta-600 to-glowOrange-500 text-white flex items-center justify-center shadow-glow-orange mb-2">
              <Mail className="w-6 h-6" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-charcoal-900 dark:text-white tracking-tight">
              {mode === 'signup'
                ? 'Create your account'
                : mode === 'magiclink'
                ? 'Gmail Magic Link'
                : 'Sign in with Gmail'}
            </h1>
            <p className="text-xs font-bold text-terracotta-700 dark:text-terracotta-400 uppercase tracking-widest">
              {APP_TAGLINE}
            </p>
            <p className="text-xs text-charcoal-500 dark:text-dark-muted font-medium max-w-xs mx-auto leading-relaxed">
              {mode === 'magiclink'
                ? 'We will send a passwordless sign-in link directly to your Gmail inbox.'
                : 'Enter your Gmail address to securely access your voice notes.'}
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex rounded-2xl bg-warm-100 dark:bg-dark-bg p-1 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                clearError();
                setMagicLinkSent(false);
              }}
              className={`flex-1 py-2 rounded-xl transition-all ${
                mode === 'signin'
                  ? 'bg-white dark:bg-dark-card text-charcoal-900 dark:text-white shadow-soft-sm'
                  : 'text-charcoal-500 dark:text-dark-muted hover:text-charcoal-900 dark:hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                clearError();
                setMagicLinkSent(false);
              }}
              className={`flex-1 py-2 rounded-xl transition-all ${
                mode === 'signup'
                  ? 'bg-white dark:bg-dark-card text-charcoal-900 dark:text-white shadow-soft-sm'
                  : 'text-charcoal-500 dark:text-dark-muted hover:text-charcoal-900 dark:hover:text-white'
              }`}
            >
              Create Account
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('magiclink');
                clearError();
                setMagicLinkSent(false);
              }}
              className={`flex-1 py-2 rounded-xl transition-all ${
                mode === 'magiclink'
                  ? 'bg-white dark:bg-dark-card text-charcoal-900 dark:text-white shadow-soft-sm'
                  : 'text-charcoal-500 dark:text-dark-muted hover:text-charcoal-900 dark:hover:text-white'
              }`}
            >
              Magic Link
            </button>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5 animate-fade-in">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <p className="leading-snug font-medium flex-1">{error}</p>
            </div>
          )}

          {/* Magic Link Confirmation */}
          {magicLinkSent && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 text-xs text-emerald-900 dark:text-emerald-200 flex items-start gap-2.5 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold">Magic Link Sent to your Gmail!</p>
                <p className="leading-relaxed">
                  We sent a sign-in link to <strong>{email}</strong>. Open your Gmail inbox and click the link to log in instantly.
                </p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name field (Only in signup mode) */}
            {mode === 'signup' && (
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-charcoal-500 dark:text-dark-muted pl-1">
                  Your Name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Pratik Ghosh"
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-charcoal-200 dark:border-dark-border bg-warm-100/40 dark:bg-dark-bg text-charcoal-900 dark:text-white placeholder-charcoal-400 text-xs focus:outline-none focus:ring-2 focus:ring-terracotta-500 transition-all font-medium"
                  />
                </div>
              </div>
            )}

            {/* Gmail input */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-charcoal-500 dark:text-dark-muted pl-1">
                Gmail Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@gmail.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-charcoal-200 dark:border-dark-border bg-warm-100/40 dark:bg-dark-bg text-charcoal-900 dark:text-white placeholder-charcoal-400 text-xs focus:outline-none focus:ring-2 focus:ring-terracotta-500 transition-all font-medium"
                />
              </div>
            </div>

            {/* Password input (Only in signin and signup modes) */}
            {mode !== 'magiclink' && (
              <div className="space-y-1">
                <div className="flex items-center justify-between pl-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-charcoal-500 dark:text-dark-muted">
                    Password
                  </label>
                  {mode === 'signin' && (
                    <button
                      type="button"
                      onClick={() => {
                        setMode('magiclink');
                        clearError();
                      }}
                      className="text-[11px] text-terracotta-600 dark:text-terracotta-400 hover:underline font-semibold"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full pl-10 pr-10 py-2.5 rounded-2xl border border-charcoal-200 dark:border-dark-border bg-warm-100/40 dark:bg-dark-bg text-charcoal-900 dark:text-white placeholder-charcoal-400 text-xs focus:outline-none focus:ring-2 focus:ring-terracotta-500 transition-all font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-charcoal-400 hover:text-charcoal-600 dark:hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full font-bold py-3 rounded-2xl shadow-glow-orange hover:brightness-105 active:scale-[0.99] transition-all text-xs"
              isLoading={isLoading}
              leftIcon={mode === 'magiclink' ? <Send className="w-4 h-4" /> : undefined}
            >
              {mode === 'signup'
                ? 'Create Mivo Account'
                : mode === 'magiclink'
                ? 'Send Magic Link to Gmail'
                : 'Sign In to Mivo'}
            </Button>
          </form>

          {/* Quick Demo Mode fallback */}
          <div className="pt-2 text-center border-t border-charcoal-100 dark:border-dark-border">
            <button
              type="button"
              onClick={handleDemoAccess}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-charcoal-500 hover:text-terracotta-600 dark:text-dark-muted dark:hover:text-terracotta-300 transition-colors py-1"
            >
              <Sparkles className="w-3.5 h-3.5 text-terracotta-500" />
              <span>Try Instant Demo Mode (No account needed)</span>
            </button>
          </div>

          {/* Security & Privacy Badging */}
          <div className="pt-1 space-y-2.5">
            <div className="flex items-center justify-center gap-2 text-[11px] font-semibold text-charcoal-500 dark:text-dark-muted">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>End-to-end user isolation with Supabase Row Level Security</span>
            </div>
            <div className="flex items-center justify-center gap-4 text-[11px] text-charcoal-400 dark:text-dark-muted">
              <button
                type="button"
                onClick={() => setActiveLegalModal('privacy')}
                className="hover:underline hover:text-charcoal-600 dark:hover:text-white"
              >
                Privacy Policy
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => setActiveLegalModal('terms')}
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

      {/* Privacy Policy Modal */}
      <Modal
        isOpen={activeLegalModal === 'privacy'}
        onClose={() => setActiveLegalModal(null)}
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
            2. Email Authentication Data
          </p>
          <p>
            When signing in with your Gmail address, Mivo uses your email strictly for session
            authentication. We never send marketing emails or share your contact info.
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
        isOpen={activeLegalModal === 'terms'}
        onClose={() => setActiveLegalModal(null)}
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
    </div>
  );
};
