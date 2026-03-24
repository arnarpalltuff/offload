'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { DEMO_MODE } from '@/lib/demo-client';
import { usePremium } from '@/hooks/usePremium';
import LumenLevelBadge from '@/components/LumenLevelBadge';
import TiltCard from '@/components/TiltCard';
import { useToast } from '@/components/Toast';

export default function AccountPage() {
  const router = useRouter();
  const { isPremium, limits, dumpsThisWeek } = usePremium();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [totalDumps, setTotalDumps] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteText, setDeleteText] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    // Get email
    if (DEMO_MODE) {
      setEmail('demo@offload.app');
    } else {
      import('@/lib/supabase/client').then(({ createClient }) => {
        const supabase = createClient();
        supabase.auth.getUser().then(({ data }) => {
          setEmail(data.user?.email || '');
        });
      });
    }

    // Get total dumps
    const stored = localStorage.getItem('offload_total_dumps');
    setTotalDumps(stored ? parseInt(stored, 10) : DEMO_MODE ? 7 : 0);
  }, []);

  async function handleLogout() {
    if (DEMO_MODE) {
      router.push('/');
      return;
    }
    const { createClient } = await import('@/lib/supabase/client');
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  async function handleDeleteAccount() {
    if (deleteText !== 'DELETE') return;
    setDeleting(true);
    try {
      const res = await fetch('/api/account/delete', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        // Clear all local data
        localStorage.clear();
        toast('Account deleted successfully.', 'success');
        setTimeout(() => {
          router.push('/');
          router.refresh();
        }, 1000);
      } else {
        toast('Failed to delete account. Please try again.', 'error');
      }
    } catch {
      toast('Failed to delete account. Please try again.', 'error');
    }
    setDeleting(false);
  }

  function handleExportAllData() {
    const data: Record<string, unknown> = {};

    // Collect all offload-related localStorage data
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('offload_')) {
        try {
          data[key] = JSON.parse(localStorage.getItem(key) || '');
        } catch {
          data[key] = localStorage.getItem(key);
        }
      }
    }

    data.exported_at = new Date().toISOString();
    data.email = email;

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `offload-data-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast('Data exported successfully.', 'success');
  }

  return (
    <div className="space-y-4 pb-4">
      <h1 className="text-xl font-bold">Account</h1>

      {/* Profile */}
      <TiltCard className="rounded-2xl" glowColor="rgba(0,255,136,0.08)" intensity={5}>
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-xl">
              {email && email.length > 0 ? email[0].toUpperCase() : '?'}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">{email || 'Loading...'}</p>
              <div className="mt-1 flex items-center gap-2">
                <LumenLevelBadge totalDumps={totalDumps} compact />
                {isPremium ? (
                  <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary">
                    PRO
                  </span>
                ) : (
                  <span className="text-[10px] text-muted">Free plan</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </TiltCard>

      {/* Subscription */}
      <div className="glass-card rounded-2xl p-4">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">Subscription</h3>
        {isPremium ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground">Offload Pro</span>
              <span className="text-sm font-semibold text-primary">Active</span>
            </div>
            <p className="text-xs text-muted">Unlimited brain dumps, voice journaling, and all premium features.</p>
            {!DEMO_MODE && (
              <button
                onClick={async () => {
                  try {
                    const res = await fetch('/api/stripe/portal', { method: 'POST' });
                    const data = await res.json();
                    if (data.url) window.location.href = data.url;
                  } catch {
                    toast('Failed to open billing portal.', 'error');
                  }
                }}
                className="w-full rounded-xl border border-border bg-card/50 py-2.5 text-xs font-medium text-muted transition-all hover:text-foreground hover:border-border-bright"
              >
                Manage Subscription
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground">Free Plan</span>
              <span className="text-xs text-muted">{dumpsThisWeek}/{limits.dumpsPerWeek} dumps this week</span>
            </div>
            <Link
              href="/pricing"
              className="flex w-full items-center justify-center rounded-xl py-2.5 text-sm font-semibold text-background"
              style={{ background: 'linear-gradient(135deg, #00FF88, #00cc6a)' }}
            >
              Upgrade to Pro
            </Link>
          </div>
        )}
      </div>

      {/* Data & Privacy */}
      <div className="glass-card rounded-2xl p-4">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">Data & Privacy</h3>
        <div className="space-y-2">
          <button
            onClick={handleExportAllData}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-all hover:bg-white/[0.03]"
          >
            <svg className="h-4 w-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <div>
              <p className="text-sm font-medium text-foreground">Export All Data</p>
              <p className="text-[11px] text-muted">Download a JSON file of all your data</p>
            </div>
          </button>

          <Link
            href="/privacy"
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-all hover:bg-white/[0.03]"
          >
            <svg className="h-4 w-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-foreground">Privacy Policy</p>
              <p className="text-[11px] text-muted">How we handle your data</p>
            </div>
          </Link>

          <Link
            href="/terms"
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-all hover:bg-white/[0.03]"
          >
            <svg className="h-4 w-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-foreground">Terms of Service</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Help & Support */}
      <Link
        href="/help"
        className="glass-card flex w-full items-center gap-3 rounded-2xl p-4 text-left transition-all hover:bg-white/[0.02]"
      >
        <svg className="h-5 w-5 text-primary/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <p className="text-sm font-medium text-foreground">Help & Support</p>
          <p className="text-[11px] text-muted">Getting started, FAQ, and feedback</p>
        </div>
      </Link>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="glass-card w-full rounded-2xl py-3 text-sm font-medium text-muted transition-all hover:text-foreground hover:bg-white/[0.02]"
      >
        Log Out
      </button>

      {/* Delete Account */}
      <div className="glass-card rounded-2xl p-4">
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-danger/60">Danger Zone</h3>
        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full rounded-xl border border-danger/20 py-2.5 text-sm font-medium text-danger/70 transition-all hover:border-danger/40 hover:text-danger"
          >
            Delete Account
          </button>
        ) : (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-3"
            >
              <p className="text-xs text-foreground/70">
                This will permanently delete your account and all associated data including brain dumps,
                reflections, plan items, and insights. This action cannot be undone.
              </p>
              <div>
                <label className="mb-1 block text-[11px] font-medium text-muted">
                  Type DELETE to confirm
                </label>
                <input
                  type="text"
                  value={deleteText}
                  onChange={(e) => setDeleteText(e.target.value)}
                  placeholder="DELETE"
                  className="w-full rounded-lg border border-danger/20 bg-transparent px-3 py-2 text-sm text-foreground placeholder-muted/30 outline-none focus:border-danger/50"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => { setShowDeleteConfirm(false); setDeleteText(''); }}
                  className="flex-1 rounded-lg py-2 text-xs font-medium text-muted hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteText !== 'DELETE' || deleting}
                  className="flex-1 rounded-lg bg-danger/20 py-2 text-xs font-semibold text-danger transition-all disabled:opacity-30"
                >
                  {deleting ? 'Deleting...' : 'Permanently Delete'}
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* App info */}
      <div className="text-center text-[10px] text-muted/50">
        <p>Offload v1.0.0</p>
        <p className="mt-0.5">Made with care for your mental clarity.</p>
      </div>
    </div>
  );
}
