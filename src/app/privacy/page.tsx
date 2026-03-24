import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy — Offload',
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <Link href="/" className="text-sm text-primary hover:underline">&larr; Back to Offload</Link>

      <h1 className="mt-8 text-3xl font-bold text-foreground">Privacy Policy</h1>
      <p className="mt-2 text-sm text-muted">Last updated: March 2026</p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-foreground/80">
        <section>
          <h2 className="text-lg font-semibold text-foreground">What we collect</h2>
          <p>
            When you use Offload, we store the content you create — brain dumps, reflections, mood scores, and quick captures.
            This data is stored securely and is only accessible to you.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">How we use your data</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Your journal entries are processed by AI to organize thoughts and generate insights.</li>
            <li>AI processing happens in real-time and is not stored or used for training.</li>
            <li>Mood data is used to generate your personal analytics and trends.</li>
            <li>We never sell, share, or monetize your personal content.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">Data storage</h2>
          <p>
            In demo mode, all data is stored locally in your browser (localStorage). No data leaves your device.
            With an account, data is stored in a secure, encrypted database.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">Your rights</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>You can export all your data at any time from the app — free of charge, regardless of subscription tier.</li>
            <li>You can delete your account and all associated data directly from the Account page in the app.</li>
            <li>You can use the app in demo mode without creating an account.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">Third-party services</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Anthropic (Claude AI)</strong> — processes your text for organization and insights. Subject to Anthropic&apos;s privacy policy.</li>
            <li><strong>Stripe</strong> — handles payment processing for Pro subscriptions. We never see or store your card details.</li>
            <li><strong>Supabase</strong> — hosts our database and authentication.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">Contact</h2>
          <p>Questions about your data? Reach out at privacy@offload.app.</p>
        </section>
      </div>
    </div>
  );
}
