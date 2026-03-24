import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Offload — Where overthinking ends';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #050810 0%, #0a1628 50%, #050810 100%)',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Glow effect */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '600px',
            height: '600px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0,255,136,0.12) 0%, transparent 70%)',
          }}
        />
        {/* App name */}
        <div
          style={{
            display: 'flex',
            fontSize: '72px',
            fontWeight: 800,
            background: 'linear-gradient(135deg, #00FF88, #00cc6a)',
            backgroundClip: 'text',
            color: 'transparent',
            marginBottom: '16px',
          }}
        >
          Offload
        </div>
        {/* Slogan */}
        <div
          style={{
            display: 'flex',
            fontSize: '28px',
            color: '#94a3b8',
            fontWeight: 400,
            marginBottom: '48px',
          }}
        >
          Where overthinking ends.
        </div>
        {/* Feature pills */}
        <div
          style={{
            display: 'flex',
            gap: '16px',
          }}
        >
          {['Brain dump', 'AI organizes', 'Think clearer'].map((text) => (
            <div
              key={text}
              style={{
                display: 'flex',
                padding: '10px 24px',
                borderRadius: '999px',
                border: '1px solid rgba(0,255,136,0.2)',
                background: 'rgba(0,255,136,0.08)',
                color: '#00FF88',
                fontSize: '18px',
                fontWeight: 500,
              }}
            >
              {text}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size },
  );
}
