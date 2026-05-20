"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  decay: number;
  shape: "circle" | "square";
}

const COLORS = [
  "#ff4d8b",
  "#b8a4ed",
  "#1a3a3a",
  "#ffb084",
  "#e8b94a",
  "#a4d4c5",
  "#ff6b5a",
];

function createParticle(x: number, y: number): Particle {
  const angle = Math.random() * Math.PI * 2;
  const speed = Math.random() * 12 + 4;
  return {
    x,
    y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed - Math.random() * 6,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    size: Math.random() * 8 + 4,
    rotation: Math.random() * Math.PI * 2,
    rotationSpeed: (Math.random() - 0.5) * 0.3,
    opacity: 1,
    decay: Math.random() * 0.015 + 0.008,
    shape: Math.random() > 0.5 ? "circle" : "square",
  };
}

interface ConfettiCanvasProps {
  active: boolean;
  onDone?: () => void;
}

export function ConfettiCanvas({ active, onDone }: ConfettiCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const hasStartedRef = useRef(false);

  useEffect(() => {
    if (!active) {
      hasStartedRef.current = false;
      if (animRef.current) {
        cancelAnimationFrame(animRef.current);
        animRef.current = 0;
      }
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        ctx?.clearRect(0, 0, canvas.width, canvas.height);
      }
      particlesRef.current = [];
      return;
    }

    if (hasStartedRef.current) return;
    hasStartedRef.current = true;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    function resize() {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    resize();
    window.addEventListener("resize", resize);

    // Spawn particles from center-bottom
    const centerX = canvas.width / 2;
    const centerY = canvas.height * 0.6;
    for (let i = 0; i < 120; i++) {
      particlesRef.current.push(createParticle(centerX, centerY));
    }

    let lastTime = performance.now();
    let running = true;

    function loop(time: number) {
      if (!running) return;
      if (!canvas || !ctx) return;

      const dt = Math.min((time - lastTime) / 16.67, 3);
      lastTime = time;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const particles = particlesRef.current;
      let aliveCount = 0;

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += 0.35 * dt; // gravity
        p.vx *= 0.98;
        p.rotation += p.rotationSpeed * dt;
        p.opacity -= p.decay * dt;

        if (p.opacity <= 0) {
          particles.splice(i, 1);
          continue;
        }

        aliveCount++;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;

        if (p.shape === "circle") {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        }

        ctx.restore();
      }

      if (aliveCount === 0) {
        running = false;
        onDone?.();
        return;
      }

      animRef.current = requestAnimationFrame(loop);
    }

    animRef.current = requestAnimationFrame(loop);

    return () => {
      running = false;
      window.removeEventListener("resize", resize);
      if (animRef.current) {
        cancelAnimationFrame(animRef.current);
      }
    };
  }, [active, onDone]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-50"
      style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%" }}
    />
  );
}
