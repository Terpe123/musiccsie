import React from 'react';
import { Direction, DIR_COLORS } from '../game/musicEngine.ts';

interface OrchestraStageProps {
  activeDir: Direction | null;
  isPlaying: boolean;
  statusText: string;
}

export const OrchestraStage: React.FC<OrchestraStageProps> = ({
  activeDir,
  isPlaying,
  statusText,
}) => {
  // Determine baton rotation & tip position based on activeDir
  const getBatonTransform = () => {
    switch (activeDir) {
      case 'up':
        return 'rotate(-75deg) translate(0px, -20px)';
      case 'down':
        return 'rotate(25deg) translate(0px, 15px)';
      case 'left':
        return 'rotate(-130deg) translate(-20px, 0px)';
      case 'right':
        return 'rotate(45deg) translate(20px, 0px)';
      default:
        return 'rotate(-20deg)';
    }
  };

  const activeColor = activeDir ? DIR_COLORS[activeDir] : '#fbbf24';

  return (
    <div className="relative w-full h-36 rounded-2xl overflow-hidden bg-gradient-to-b from-[#181a38] via-[#12132a] to-[#0c0d1c] border border-amber-500/20 shadow-2xl flex flex-col justify-between p-3 select-none">
      {/* Concert Hall Ambient Chandelier Glow */}
      <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-72 h-24 bg-amber-400/10 blur-3xl rounded-full pointer-events-none" />

      {/* Stage Header Info */}
      <div className="relative z-10 flex items-center justify-between text-xs text-amber-200/70 px-2 font-serif">
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="tracking-widest uppercase font-semibold text-[11px]">Symphony Hall 大音樂廳</span>
        </div>
        <div className="text-[11px] font-mono tracking-wider text-amber-300/80 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/20">
          {statusText}
        </div>
      </div>

      {/* Orchestra Sections SVG */}
      <div className="relative w-full h-20 flex items-end justify-center">
        <svg
          viewBox="0 0 600 120"
          className="w-full h-full max-w-[540px] drop-shadow-md"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Stage floor curved lines */}
          <ellipse cx="300" cy="140" rx="270" ry="70" stroke="rgba(251, 191, 36, 0.15)" strokeWidth="1.5" />
          <ellipse cx="300" cy="140" rx="210" ry="55" stroke="rgba(251, 191, 36, 0.12)" strokeWidth="1" />
          <ellipse cx="300" cy="140" rx="140" ry="40" stroke="rgba(251, 191, 36, 0.1)" strokeWidth="1" />

          {/* Timpani & Percussion (Back center) */}
          <g opacity={isPlaying ? 0.9 : 0.6} className="transition-opacity duration-300">
            <ellipse cx="280" cy="40" rx="9" ry="5" fill="#ca8a04" />
            <ellipse cx="320" cy="40" rx="9" ry="5" fill="#ca8a04" />
            <path d="M280 40 L280 48 M320 40 L320 48" stroke="#a16207" strokeWidth="2" />
          </g>

          {/* Brass & Woodwinds (Mid-back) */}
          <g opacity={isPlaying ? 0.9 : 0.55} className="transition-opacity duration-300">
            {/* Flutes / Oboes / Trumpets */}
            <circle cx="240" cy="52" r="5" fill="#fde047" opacity="0.8" />
            <circle cx="260" cy="50" r="5" fill="#fde047" opacity="0.8" />
            <circle cx="340" cy="50" r="5" fill="#fde047" opacity="0.8" />
            <circle cx="360" cy="52" r="5" fill="#fde047" opacity="0.8" />
            <circle cx="220" cy="56" r="6" fill="#f59e0b" opacity="0.9" />
            <circle cx="380" cy="56" r="6" fill="#f59e0b" opacity="0.9" />
          </g>

          {/* 1st Violins (Front Left) */}
          <g
            opacity={isPlaying ? 0.95 : 0.7}
            className={`transition-all duration-300 ${activeDir === 'left' ? 'filter drop-shadow-[0_0_8px_#f472b6]' : ''}`}
          >
            <circle cx="150" cy="74" r="6" fill="#e0a96d" />
            <circle cx="175" cy="70" r="6" fill="#e0a96d" />
            <circle cx="200" cy="68" r="6" fill="#e0a96d" />
            <circle cx="130" cy="82" r="6" fill="#e0a96d" />
            <circle cx="160" cy="84" r="6" fill="#e0a96d" />
            <circle cx="190" cy="80" r="6" fill="#e0a96d" />
            {/* Violin bows */}
            <line x1="145" y1="70" x2="160" y2="76" stroke="#fbbf24" strokeWidth="1.5" opacity={isPlaying ? 0.9 : 0.4} />
            <line x1="170" y1="66" x2="185" y2="72" stroke="#fbbf24" strokeWidth="1.5" opacity={isPlaying ? 0.9 : 0.4} />
            <text x="145" y="105" fill="#f472b6" fontSize="9" fontWeight="bold" opacity="0.85">第1小提琴</text>
          </g>

          {/* 2nd Violins / Violas (Center Left) */}
          <g opacity={isPlaying ? 0.9 : 0.7} className="transition-all duration-300">
            <circle cx="225" cy="74" r="6.5" fill="#d97706" />
            <circle cx="250" cy="72" r="6.5" fill="#d97706" />
            <circle cx="235" cy="86" r="6.5" fill="#d97706" />
          </g>

          {/* Cellos & Double Basses (Right) */}
          <g
            opacity={isPlaying ? 0.95 : 0.7}
            className={`transition-all duration-300 ${activeDir === 'right' ? 'filter drop-shadow-[0_0_8px_#fbbf24]' : ''}`}
          >
            <circle cx="450" cy="74" r="7.5" fill="#b45309" />
            <circle cx="425" cy="70" r="7.5" fill="#b45309" />
            <circle cx="400" cy="68" r="7" fill="#b45309" />
            <circle cx="470" cy="82" r="8" fill="#92400e" />
            <circle cx="440" cy="84" r="7.5" fill="#b45309" />
            <circle cx="410" cy="80" r="7" fill="#b45309" />
            {/* Cello bows */}
            <line x1="445" y1="70" x2="430" y2="76" stroke="#fbbf24" strokeWidth="1.5" opacity={isPlaying ? 0.9 : 0.4} />
            <line x1="420" y1="66" x2="405" y2="72" stroke="#fbbf24" strokeWidth="1.5" opacity={isPlaying ? 0.9 : 0.4} />
            <text x="415" y="105" fill="#fbbf24" fontSize="9" fontWeight="bold" opacity="0.85">大提琴・低音提琴</text>
          </g>

          {/* Conductor's Podium (Center Bottom) */}
          <g>
            {/* Podium Platform */}
            <rect x="278" y="92" width="44" height="14" rx="3" fill="#1e2238" stroke="#d97706" strokeWidth="1.5" />
            {/* Conductor Silhouette */}
            <ellipse cx="300" cy="82" rx="7" ry="9" fill="#0f172a" stroke="#cbd5e1" strokeWidth="1" />
            <circle cx="300" cy="69" r="5" fill="#fcd34d" />
            {/* Conductor Tuxedo Lapels */}
            <path d="M296 74 L300 83 L304 74 Z" fill="#ffffff" />
            <path d="M298 77 L302 77" stroke="#dc2626" strokeWidth="1.5" />
          </g>
        </svg>

        {/* Dynamic Conductor Golden Baton */}
        <div
          className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-none transition-transform duration-150 ease-out origin-[20%_90%]"
          style={{ transform: getBatonTransform() }}
        >
          {/* Baton Stick */}
          <div
            className="w-1.5 h-14 bg-gradient-to-t from-amber-700 via-amber-300 to-white rounded-full shadow-[0_0_10px_rgba(251,191,36,0.8)]"
            style={{
              boxShadow: activeDir ? `0 0 14px ${activeColor}, 0 0 24px ${activeColor}` : undefined,
            }}
          />
          {/* Baton Glowing Tip */}
          <div
            className="absolute -top-1.5 -left-1 w-3.5 h-3.5 rounded-full bg-white animate-ping opacity-75"
            style={{ backgroundColor: activeColor }}
          />
        </div>
      </div>
    </div>
  );
};
