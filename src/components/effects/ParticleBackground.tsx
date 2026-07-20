'use client';

import { useEffect, useRef } from 'react';

// ─── Constants ───────────────────────────────────────────────────────
const CONNECTION_DISTANCE = 150;
const CONNECTION_DISTANCE_SQ = CONNECTION_DISTANCE * CONNECTION_DISTANCE;
const MOUSE_INFLUENCE_RADIUS = 200;
const MOUSE_GLOW_RADIUS = 120;
const MIN_FPS = 30;
const FRAME_SKIP_THRESHOLD = 1000 / MIN_FPS;

const COLORS = ['#00E5FF', '#6C63FF', '#FF00C8'] as const;

// ─── Particle Interface ──────────────────────────────────────────────
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  colorIndex: number;
  opacity: number;
  baseOpacity: number;
  opacityDir: number;
}

// ─── Parse hex to RGB (pre-computed) ─────────────────────────────────
const COLOR_RGB = COLORS.map((hex) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
});

// ─── Component ───────────────────────────────────────────────────────
export default function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // ── State ───────────────────────────────────────────────────────
    let width = 0;
    let height = 0;
    let particles: Particle[] = [];
    let mouseX: number | null = null;
    let mouseY: number | null = null;
    let animFrame = 0;
    let lastTime = 0;
    let skipFrame = false;

    // ── Set canvas dimensions ───────────────────────────────────────
    const setDimensions = () => {
      const dpr = window.devicePixelRatio || 1;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    // ── Create a particle ───────────────────────────────────────────
    const createParticle = (): Particle => {
      const baseOpacity = 0.3 + Math.random() * 0.5;
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: 1 + Math.random() * 2,
        colorIndex: Math.floor(Math.random() * COLORS.length),
        opacity: baseOpacity,
        baseOpacity,
        opacityDir: Math.random() > 0.5 ? 1 : -1,
      };
    };

    // ── Init particles ──────────────────────────────────────────────
    const initParticles = () => {
      const count = Math.max(
        80,
        Math.min(120, Math.floor((width * height) / 12000))
      );
      particles = Array.from({ length: count }, createParticle);
    };

    // ── Update particles ────────────────────────────────────────────
    const updateParticles = () => {
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Slow drift
        p.x += p.vx;
        p.y += p.vy;

        // Subtle opacity pulsing
        p.opacity += p.opacityDir * 0.002;
        if (p.opacity > p.baseOpacity + 0.15) {
          p.opacityDir = -1;
        } else if (p.opacity < p.baseOpacity - 0.15) {
          p.opacityDir = 1;
        }
        if (p.opacity > 0.85) p.opacity = 0.85;
        if (p.opacity < 0.15) p.opacity = 0.15;

        // Wrap around edges
        const pad = 10;
        if (p.x < -pad) p.x = width + pad;
        if (p.x > width + pad) p.x = -pad;
        if (p.y < -pad) p.y = height + pad;
        if (p.y > height + pad) p.y = -pad;

        // Mouse attraction
        if (mouseX !== null && mouseY !== null) {
          const dx = mouseX - p.x;
          const dy = mouseY - p.y;
          const distSq = dx * dx + dy * dy;
          if (distSq < MOUSE_INFLUENCE_RADIUS * MOUSE_INFLUENCE_RADIUS && distSq > 1) {
            const dist = Math.sqrt(distSq);
            const force = (1 - dist / MOUSE_INFLUENCE_RADIUS) * 0.015;
            p.vx += (dx / dist) * force;
            p.vy += (dy / dist) * force;
          }
        }

        // Dampen velocity
        p.vx *= 0.998;
        p.vy *= 0.998;

        // Clamp speed
        const maxSpeed = 0.8;
        const speedSq = p.vx * p.vx + p.vy * p.vy;
        if (speedSq > maxSpeed * maxSpeed) {
          const speed = Math.sqrt(speedSq);
          p.vx = (p.vx / speed) * maxSpeed;
          p.vy = (p.vy / speed) * maxSpeed;
        }
      }
    };

    // ── Draw frame ──────────────────────────────────────────────────
    const drawFrame = () => {
      ctx.clearRect(0, 0, width, height);

      const hasMouse = mouseX !== null && mouseY !== null;

      // ── Connections ───────────────────────────────────────────────
      for (let i = 0; i < particles.length; i++) {
        const pi = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const pj = particles[j];
          const dx = pi.x - pj.x;
          const dy = pi.y - pj.y;
          const distSq = dx * dx + dy * dy;

          if (distSq > CONNECTION_DISTANCE_SQ) continue;

          const dist = Math.sqrt(distSq);
          const alpha = (1 - dist / CONNECTION_DISTANCE) * 0.35;

          // Pick color of particle closer to mouse
          let ci = pi.colorIndex;
          if (hasMouse) {
            const diSq =
              (pi.x - mouseX!) * (pi.x - mouseX!) +
              (pi.y - mouseY!) * (pi.y - mouseY!);
            const djSq =
              (pj.x - mouseX!) * (pj.x - mouseX!) +
              (pj.y - mouseY!) * (pj.y - mouseY!);
            ci = diSq < djSq ? pi.colorIndex : pj.colorIndex;
          }

          const rgb = COLOR_RGB[ci];
          ctx.strokeStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},${alpha})`;
          ctx.lineWidth = dist < CONNECTION_DISTANCE * 0.4 ? 1 : 0.5;
          ctx.beginPath();
          ctx.moveTo(pi.x, pi.y);
          ctx.lineTo(pj.x, pj.y);
          ctx.stroke();
        }
      }

      // ── Mouse glow ───────────────────────────────────────────────
      if (hasMouse) {
        const gradient = ctx.createRadialGradient(
          mouseX!,
          mouseY!,
          0,
          mouseX!,
          mouseY!,
          MOUSE_GLOW_RADIUS
        );
        gradient.addColorStop(0, 'rgba(0,229,255,0.08)');
        gradient.addColorStop(0.4, 'rgba(108,99,255,0.04)');
        gradient.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(mouseX!, mouseY!, MOUSE_GLOW_RADIUS, 0, Math.PI * 2);
        ctx.fill();
      }

      // ── Particles ────────────────────────────────────────────────
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const rgb = COLOR_RGB[p.colorIndex];

        // Soft glow
        const glowGrad = ctx.createRadialGradient(
          p.x,
          p.y,
          0,
          p.x,
          p.y,
          p.radius * 4
        );
        glowGrad.addColorStop(
          0,
          `rgba(${rgb.r},${rgb.g},${rgb.b},${p.opacity * 0.3})`
        );
        glowGrad.addColorStop(1, `rgba(${rgb.r},${rgb.g},${rgb.b},0)`);
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 4, 0, Math.PI * 2);
        ctx.fill();

        // Core dot
        ctx.fillStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},${p.opacity})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    // ── Animation loop ──────────────────────────────────────────────
    const loop = (timestamp: number) => {
      animFrame = requestAnimationFrame(loop);

      // FPS check: skip frame if running slow
      const delta = timestamp - lastTime;
      if (delta < FRAME_SKIP_THRESHOLD && skipFrame) {
        skipFrame = false;
        return;
      }
      if (delta > FRAME_SKIP_THRESHOLD * 2) {
        skipFrame = true;
      }
      lastTime = timestamp;

      updateParticles();
      drawFrame();
    };

    // ── Initialize & start ──────────────────────────────────────────
    setDimensions();
    initParticles();
    lastTime = performance.now();
    animFrame = requestAnimationFrame(loop);

    // ── Event handlers ──────────────────────────────────────────────
    const handleResize = () => {
      setDimensions();
      initParticles();
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const handleMouseLeave = () => {
      mouseX = null;
      mouseY = null;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mouseX = e.touches[0].clientX;
        mouseY = e.touches[0].clientY;
      }
    };

    const handleTouchEnd = () => {
      mouseX = null;
      mouseY = null;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);

    // ── Cleanup ─────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(animFrame);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{
        zIndex: 0,
        backgroundColor: '#050816',
      }}
      aria-hidden="true"
    />
  );
}
