import React, { useEffect, useRef } from 'react';
import { soundService, NoteEvent } from '../game/soundService.ts';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
  char?: string;
}

const MUSICAL_SYMBOLS = ['♩', '♪', '♫', '♬', '𝄞', '𝄢', '✦', '✧'];

export const VisualizerCanvas: React.FC<{ activeDir?: string | null }> = ({ activeDir }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);

  useEffect(() => {
    const handleNote = (event: NoteEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      // Map MIDI 40..85 to 5%..95% of width
      const normalized = Math.min(Math.max((event.midi - 45) / 40, 0.08), 0.92);
      const x = normalized * canvas.width;
      const y = canvas.height - 12;

      // Spawn burst of particles
      const count = 3 + Math.floor(Math.random() * 3);
      for (let i = 0; i < count; i++) {
        const symbol = Math.random() > 0.4 ? MUSICAL_SYMBOLS[Math.floor(Math.random() * MUSICAL_SYMBOLS.length)] : undefined;
        particlesRef.current.push({
          x: x + (Math.random() - 0.5) * 24,
          y: y - Math.random() * 8,
          vx: (Math.random() - 0.5) * 1.5,
          vy: -(1.4 + Math.random() * 2.2),
          size: symbol ? 14 + Math.random() * 8 : 4 + Math.random() * 6,
          alpha: 1,
          color: event.color,
          char: symbol,
        });
      }
    };

    soundService.setNoteCallback(handleNote);
    return () => {
      soundService.setNoteCallback(() => {});
    };
  }, []);

  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw subtle pitch staff guidelines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      const staffLines = [20, 36, 52, 68, 84];
      for (const sy of staffLines) {
        ctx.beginPath();
        ctx.moveTo(0, sy);
        ctx.lineTo(canvas.width, sy);
        ctx.stroke();
      }

      // Update & render particles
      const remaining: Particle[] = [];
      for (const p of particlesRef.current) {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.012;

        if (p.alpha > 0) {
          ctx.save();
          ctx.globalAlpha = Math.max(0, p.alpha);
          ctx.fillStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 8;

          if (p.char) {
            ctx.font = `bold ${p.size}px serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(p.char, p.x, p.y);
          } else {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
          remaining.push(p);
        }
      }
      particlesRef.current = remaining;

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div className="relative w-full h-24 my-2 rounded-xl overflow-hidden bg-slate-900/60 border border-amber-500/20 shadow-inner">
      <canvas
        ref={canvasRef}
        width={640}
        height={96}
        className="w-full h-full block"
        data-testid="visualizer-canvas"
      />
      <div className="absolute inset-0 pointer-events-none flex justify-between items-end px-3 pb-1 text-[10px] text-amber-200/40 uppercase tracking-widest font-mono">
        <span>Low (低音管弦)</span>
        <span>Maestro Visualizer</span>
        <span>High (高音管弦)</span>
      </div>
    </div>
  );
};
