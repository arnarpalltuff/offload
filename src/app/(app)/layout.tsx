import BottomNav from '@/components/BottomNav';
import PageHeader from '@/components/PageHeader';
import WeatherBackground from '@/components/WeatherBackground';
import ParticleField from '@/components/ParticleField';
import QuickCaptureWrapper from '@/components/QuickCaptureWrapper';
import SearchOverlay from '@/components/SearchOverlay';
import ErrorBoundary from '@/components/ErrorBoundary';
import ServiceWorkerRegistrar from '@/components/ServiceWorkerRegistrar';
import { WeatherProvider } from '@/context/WeatherContext';

export const dynamic = 'force-dynamic';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <WeatherProvider>
      <ServiceWorkerRegistrar />
      <WeatherBackground />
      <ParticleField />
      {/* Noise texture overlay for depth */}
      <div
        className="pointer-events-none fixed inset-0 z-[2] opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '256px 256px',
        }}
      />
      {/* Vignette */}
      <div
        className="pointer-events-none fixed inset-0 z-[2]"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 50%, rgba(5,8,16,0.4) 100%)',
        }}
      />
      <div className="relative z-10 min-h-screen pb-20">
        <div className="mx-auto max-w-lg px-4">
          <PageHeader />
          <main><ErrorBoundary>{children}</ErrorBoundary></main>
        </div>
        <QuickCaptureWrapper />
        <SearchOverlay />
        <BottomNav />
      </div>
    </WeatherProvider>
  );
}
