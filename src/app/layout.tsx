import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { ToastProvider } from '@/components/Toast';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#050810',
};

export const metadata: Metadata = {
  title: 'Offload — Where overthinking ends.',
  description:
    'Dump your thoughts, AI organizes them into what matters, what can wait, and what to let go of.',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'Offload — Where overthinking ends.',
    description:
      'Dump your thoughts, AI organizes them into what matters, what can wait, and what to let go of.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Offload — Where overthinking ends.',
    description:
      'Dump your thoughts, AI organizes them into what matters, what can wait, and what to let go of.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
