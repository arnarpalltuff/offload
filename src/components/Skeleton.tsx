'use client';

export function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-3 flex items-center gap-2">
        <div className="h-5 w-16 animate-shimmer rounded-full" />
        <div className="h-4 w-8 animate-shimmer rounded" />
      </div>
      <div className="mb-4 space-y-2">
        <div className="h-4 w-full animate-shimmer rounded" />
        <div className="h-4 w-3/4 animate-shimmer rounded" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="h-12 animate-shimmer rounded-xl" />
        <div className="h-12 animate-shimmer rounded-xl" />
      </div>
    </div>
  );
}
