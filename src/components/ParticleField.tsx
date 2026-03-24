'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useWeather } from '@/context/WeatherContext';
import { WEATHER_CONFIGS } from '@/lib/weather';

interface Star {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  pulsePhase: number;
  pulseSpeed: number;
}

// Interactive particle constellation — particles connect when near each other
// and react to touch/mouse creating a living neural-network feel
export default function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const mouseRef = useRef({ x: -1000, y: -1000, active: false });
  const rafRef = useRef<number>(0);
  const { weather } = useWeather();
  const config = WEATHER_CONFIGS[weather];

  const initStars = useCallback((w: number, h: number) => {
    const count = Math.min(60, Math.floor((w * h) / 18000));
    const stars: Star[] = [];
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: 1 + Math.random() * 2,
        opacity: 0.2 + Math.random() * 0.5,
        pulsePhase: Math.random() * Math.PI * 2,
        pulseSpeed: 0.005 + Math.random() * 0.015,
      });
    }
    starsRef.current = stars;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      canvas!.width = window.innerWidth * dpr;
      canvas!.height = window.innerHeight * dpr;
      canvas!.style.width = window.innerWidth + 'px';
      canvas!.style.height = window.innerHeight + 'px';
      ctx!.scale(dpr, dpr);
      initStars(window.innerWidth, window.innerHeight);
    }
    resize();
    window.addEventListener('resize', resize);

    // Parse the particle color to RGB for canvas
    const pColor = config.particleColor;
    const rgbMatch = pColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    const r = rgbMatch ? +rgbMatch[1] : 0;
    const g = rgbMatch ? +rgbMatch[2] : 255;
    const b = rgbMatch ? +rgbMatch[3] : 136;

    let time = 0;
    function draw() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx!.clearRect(0, 0, w, h);
      time++;

      const stars = starsRef.current;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const mouseActive = mouseRef.current.active;
      const connectionDist = 120;

      for (const star of stars) {
        // Gentle drift
        star.x += star.vx;
        star.y += star.vy;

        // Mouse repulsion / attraction
        if (mouseActive) {
          const dx = star.x - mx;
          const dy = star.y - my;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 200 && dist > 0) {
            const force = (200 - dist) / 200;
            star.vx += (dx / dist) * force * 0.08;
            star.vy += (dy / dist) * force * 0.08;
          }
        }

        // Damping
        star.vx *= 0.995;
        star.vy *= 0.995;

        // Wrap around
        if (star.x < -10) star.x = w + 10;
        if (star.x > w + 10) star.x = -10;
        if (star.y < -10) star.y = h + 10;
        if (star.y > h + 10) star.y = -10;

        // Pulse
        star.pulsePhase += star.pulseSpeed;
        const pulse = 0.5 + 0.5 * Math.sin(star.pulsePhase);
        const alpha = star.opacity * (0.4 + pulse * 0.6);

        // Draw star
        ctx!.beginPath();
        ctx!.arc(star.x, star.y, star.size * (0.8 + pulse * 0.4), 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
        ctx!.fill();

        // Glow
        ctx!.beginPath();
        ctx!.arc(star.x, star.y, star.size * 3, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha * 0.1})`;
        ctx!.fill();
      }

      // Connection lines
      for (let i = 0; i < stars.length; i++) {
        for (let j = i + 1; j < stars.length; j++) {
          const dx = stars[i].x - stars[j].x;
          const dy = stars[i].y - stars[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < connectionDist) {
            const alpha = (1 - dist / connectionDist) * 0.15;
            ctx!.beginPath();
            ctx!.moveTo(stars[i].x, stars[i].y);
            ctx!.lineTo(stars[j].x, stars[j].y);
            ctx!.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
            ctx!.lineWidth = 0.5;
            ctx!.stroke();
          }
        }
      }

      // Mouse connection lines
      if (mouseActive) {
        for (const star of stars) {
          const dx = star.x - mx;
          const dy = star.y - my;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 180) {
            const alpha = (1 - dist / 180) * 0.3;
            ctx!.beginPath();
            ctx!.moveTo(mx, my);
            ctx!.lineTo(star.x, star.y);
            ctx!.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
            ctx!.lineWidth = 0.8;
            ctx!.stroke();
          }
        }
      }

      rafRef.current = requestAnimationFrame(draw);
    }
    draw();

    function handlePointerMove(e: PointerEvent) {
      mouseRef.current = { x: e.clientX, y: e.clientY, active: true };
    }
    function handlePointerLeave() {
      mouseRef.current = { ...mouseRef.current, active: false };
    }

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerleave', handlePointerLeave);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerleave', handlePointerLeave);
    };
  }, [config.particleColor, initStars]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[1]"
      style={{ mixBlendMode: 'screen' }}
    />
  );
}
