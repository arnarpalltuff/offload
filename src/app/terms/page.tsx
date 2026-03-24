import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service — Offload',
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <Link href="/" className="text-sm text-primary hover:underline">&larr; Back to Offload</Link>

      <h1 className="mt-8 text-3xl font-bold text-foreground">Terms of Service</h1>
      <p className="mt-2 text-sm text-muted">Last updated: March 2026</p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-foreground/80">
        <section>
          <h2 className="text-lg font-semibold text-foreground">Using Offload</h2>
          <p>
            Offload is a personal journaling and thought organization tool. By using it, you agree to these terms.
            You must be at least 13 years old to use this service.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">Your content</h2>
          <p>
            Everything you write in Offload belongs to you. We don&apos;t claim ownership of your journal entries,
            reflections, or any content you create. You grant us a limited license to process your content solely
            for the purpose of providing the service (AI organization, insights, etc.).
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">AI-generated content</h2>
          <p>
            Lumen&apos;s insights, summaries, and suggestions are AI-generated and should not be treated as professional
            advice. Offload is not a substitute for therapy, counseling, or medical guidance. If you&apos;re experiencing
            a mental health crisis, please contact a professional or call a crisis helpline.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">Pro subscription</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Pro is billed monthly at the price shown on the pricing page.</li>
            <li>You can cancel anytime. Access continues until the end of your billing period.</li>
            <li>Refunds are handled on a case-by-case basis — contact us if you&apos;re unhappy.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">Acceptable use</h2>
          <p>
            Don&apos;t use Offload to store illegal content, abuse the AI system, or attempt to access other users&apos; data.
            We reserve the right to suspend accounts that violate these terms.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">Changes to these terms</h2>
          <p>
            We may update these terms occasionally. Significant changes will be communicated through the app.
            Continued use after changes constitutes acceptance.
          </p>
        </section>
      </div>
    </div>
  );
}
