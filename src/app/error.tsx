'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <div className="text-6xl" aria-hidden="true">⚠️</div>
      <h1 className="mt-4 text-2xl font-bold">Something went wrong</h1>
      <p className="mt-2 max-w-xs text-sm text-muted">
        The app hit an unexpected error. This usually fixes itself — try again or go back to your brain dump.
      </p>
      {process.env.NODE_ENV === 'development' && error.message && (
        <pre className="mt-4 max-w-sm overflow-auto rounded-lg bg-card p-3 text-left text-xs text-danger">
          {error.message}
        </pre>
      )}
      <div className="mt-6 flex gap-3">
        <button
          onClick={reset}
          className="rounded-xl bg-primary px-6 py-3 font-semibold text-background"
        >
          Try Again
        </button>
        <a
          href="/dump"
          className="rounded-xl border border-border px-6 py-3 font-semibold text-muted transition-colors hover:text-foreground"
        >
          Go to Dump
        </a>
      </div>
    </div>
  );
}
