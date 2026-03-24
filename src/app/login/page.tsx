'use client';

import { useState } from 'react';
import { DEMO_MODE } from '@/lib/demo-client';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    if (DEMO_MODE) {
      router.push('/dump');
      return;
    }

    const { createClient } = await import('@/lib/supabase/client');
    const supabase = createClient();

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) setError(error.message);
      else setMessage('Check your email for a confirmation link.');
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
      else {
        router.push('/dump');
        router.refresh();
      }
    }
    setLoading(false);
  }

  return (
    <div className="gradient-hero flex min-h-screen flex-col items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm space-y-8"
      >
        <div className="text-center">
          <h1 className="text-4xl font-extrabold">
            <span className="gradient-text-animated">Offload</span>
          </h1>
          <p className="mt-1 text-xs tracking-widest uppercase text-muted/60">Where overthinking ends</p>
          <p className="mt-2 text-muted">
            {isSignUp ? 'Create your account' : 'Welcome back'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            placeholder="Email"
            aria-label="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-xl border border-border bg-card px-4 py-3.5 text-foreground placeholder-muted outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
          />
          <input
            type="password"
            placeholder="Password"
            aria-label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full rounded-xl border border-border bg-card px-4 py-3.5 text-foreground placeholder-muted outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
          />

          {error && (
            <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>
          )}
          {message && (
            <p className="rounded-lg bg-primary/10 px-3 py-2 text-sm text-primary">{message}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="group relative w-full overflow-hidden rounded-xl py-3.5 font-semibold text-background disabled:opacity-50"
          >
            <div className="gradient-primary absolute inset-0" />
            <span className="relative">
              {loading ? 'Loading...' : isSignUp ? 'Create Account' : 'Sign In'}
            </span>
          </button>
        </form>

        <p className="text-center text-sm text-muted">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={() => { setIsSignUp(!isSignUp); setError(''); setMessage(''); }}
            className="font-medium text-primary hover:underline"
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </p>

        {DEMO_MODE && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center"
          >
            <div className="relative flex items-center justify-center my-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <span className="relative bg-background px-3 text-xs text-muted">or</span>
            </div>
            <button
              onClick={() => router.push('/dump')}
              className="w-full rounded-xl border border-border bg-card/50 py-3.5 text-sm font-medium text-muted transition-all hover:text-foreground hover:border-border-bright"
            >
              Try Demo — No Account Needed
            </button>
          </motion.div>
        )}

        <div className="flex items-center justify-center gap-4 text-xs text-muted">
          <a href="/" className="hover:text-foreground transition-colors">Home</a>
          <a href="/pricing" className="hover:text-foreground transition-colors">Pricing</a>
        </div>
      </motion.div>
    </div>
  );
}
