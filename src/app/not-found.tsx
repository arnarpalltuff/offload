import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <div className="text-6xl" aria-hidden="true">🤔</div>
      <h1 className="mt-4 text-3xl font-bold">Page Not Found</h1>
      <p className="mt-2 text-muted">
        This page doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/dump"
        className="mt-6 rounded-xl bg-primary px-6 py-3 font-semibold text-background"
      >
        Go Home
      </Link>
    </div>
  );
}
