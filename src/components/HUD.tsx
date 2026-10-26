import React from 'react';
import { Song, DifficultyConfig, ARROWS, DIR_COLORS } from '../game/musicEngine.ts';
import { Sparkles, Zap, Flame } from 'lucide-react';

interface HUDProps {
  song: Song;
  diff: DifficultyConfig;
  score: number;
  combo: number;
  phrases: Array<{ dir: string }>;
  phraseResults: Array<'done' | 'flawed' | null>;
  currentIdx: number;
  state: 'countdown' | 'waiting' | 'playing' | 'done';
  timeRatio: number; // 0..1
  nextDir?: string | null;
}

export const HUD: React.FC<HUDProps> = ({
  song,
  diff,
  score,
  combo,
  phrases,
  phraseResults,
  currentIdx,
  state,
  timeRatio,
  nextDir,
}) => {
  return (
    <div className="w-full space-y-2 select-none">
      {/* Top Bar: Song Name, Diff, Score, Combo */}
      <div className="flex items-center justify-between px-1 text-sm font-sans">
        <div className="flex items-center gap-2">
          <span className="font-serif font-bold text-base text-amber-200 tracking-wide">
            {song.name}
          </span>
          <span
            className="text-[11px] font-bold px-2 py-0.5 rounded-full text-white shadow"
            style={{ backgroundColor: diff.color }}
          >
            {diff.label}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 font-mono">
            <span className="text-slate-400 text-xs">分數</span>
            <span className="text-lg font-bold text-amber-300 min-w-12 text-right" data-testid="score-display">
              {score}
            </span>
          </div>

          <div className="flex items-center gap-1 font-mono">
            <span className="text-slate-400 text-xs">連擊</span>
            <div className="flex items-center text-lg font-bold text-emerald-400">
              {combo > 2 && <Flame className="w-4 h-4 text-orange-400 animate-bounce mr-0.5" />}
              <span data-testid="combo-display">{combo}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Phrase Progress Dots */}
      <div className="flex items-center justify-center gap-1.5 py-1 px-3 bg-black/30 rounded-full border border-white/5 w-fit mx-auto max-w-full overflow-x-auto">
        {phrases.map((_, i) => {
          const res = phraseResults[i];
          const isCurrent = i === currentIdx && state === 'waiting';

          let bgClass = 'bg-slate-700';
          if (res === 'done') bgClass = 'bg-emerald-400 shadow-[0_0_8px_#34d399]';
          else if (res === 'flawed') bgClass = 'bg-amber-400 shadow-[0_0_8px_#fbbf24]';
          else if (isCurrent) bgClass = 'bg-white shadow-[0_0_10px_#ffffff] animate-ping';

          return (
            <div
              key={i}
              className={`w-3 h-3 rounded-full transition-all duration-200 ${bgClass}`}
              title={`第 ${i + 1} 小節`}
            />
          );
        })}
      </div>

      {/* Countdown Timer Bar (Only for hard mode or when limit exists) */}
      {diff.timeLimit && (
        <div className="w-full h-2 rounded-full bg-slate-800/80 overflow-hidden border border-white/10 shadow-inner">
          <div
            className="h-full transition-all duration-75 rounded-full"
            style={{
              width: `${Math.max(0, Math.min(100, timeRatio * 100))}%`,
              backgroundColor: timeRatio > 0.35 ? '#38bdf8' : '#ef4444',
              boxShadow: timeRatio > 0.35 ? '0 0 8px #38bdf8' : '0 0 10px #ef4444',
            }}
          />
        </div>
      )}

      {/* Next Hint */}
      <div className="h-5 flex items-center justify-center text-xs font-mono">
        {nextDir ? (
          <div className="flex items-center gap-1.5 text-amber-200/80 bg-slate-800/60 px-3 py-0.5 rounded-full border border-amber-500/20">
            <span className="text-slate-400">下一個提示：</span>
            <span className="font-bold text-amber-300 text-sm">{nextDir}</span>
          </div>
        ) : currentIdx === phrases.length - 1 ? (
          <span className="text-amber-300 font-bold animate-pulse">最後小節，完美收尾！</span>
        ) : null}
      </div>
    </div>
  );
};
