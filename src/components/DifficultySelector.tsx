import React from 'react';
import { DIFFS, DifficultyConfig } from '../game/musicEngine.ts';
import { ShieldCheck, Flame, Shuffle, Clock, CheckCircle } from 'lucide-react';

interface DifficultySelectorProps {
  selectedDiff: 'easy' | 'hard';
  onSelectDiff: (diff: 'easy' | 'hard') => void;
  randomDirections: boolean;
  onToggleRandom: (val: boolean) => void;
}

export const DifficultySelector: React.FC<DifficultySelectorProps> = ({
  selectedDiff,
  onSelectDiff,
  randomDirections,
  onToggleRandom,
}) => {
  return (
    <div className="w-full space-y-3">
      {/* 2-Column Difficulty Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="radiogroup" aria-label="難度選擇">
        {/* Easy */}
        <button
          type="button"
          role="radio"
          aria-checked={selectedDiff === 'easy'}
          onClick={() => onSelectDiff('easy')}
          data-testid="diff-btn-easy"
          className={`
            relative flex items-start gap-3 p-3.5 rounded-xl text-left transition-all duration-200 border-2
            ${
              selectedDiff === 'easy'
                ? 'bg-emerald-950/60 border-emerald-400 text-white shadow-[0_0_15px_rgba(16,185,129,0.25)] ring-1 ring-emerald-400'
                : 'bg-[#181a38]/60 border-slate-700 hover:border-slate-500 text-slate-300 opacity-70 hover:opacity-100'
            }
          `}
        >
          <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base text-emerald-300 font-serif">簡單模式</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/30">新手推薦</span>
            </div>
            <ul className="text-xs text-slate-300/80 space-y-0.5 mt-1 font-mono">
              <li>・無時間限制，輕鬆享受</li>
              <li>・比錯方向不扣分</li>
              <li>・提供下一個方向提示</li>
            </ul>
          </div>
        </button>

        {/* Hard */}
        <button
          type="button"
          role="radio"
          aria-checked={selectedDiff === 'hard'}
          onClick={() => onSelectDiff('hard')}
          data-testid="diff-btn-hard"
          className={`
            relative flex items-start gap-3 p-3.5 rounded-xl text-left transition-all duration-200 border-2
            ${
              selectedDiff === 'hard'
                ? 'bg-rose-950/60 border-rose-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.25)] ring-1 ring-rose-400'
                : 'bg-[#181a38]/60 border-slate-700 hover:border-slate-500 text-slate-300 opacity-70 hover:opacity-100'
            }
          `}
        >
          <div className="w-9 h-9 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/30">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base text-rose-300 font-serif">困難模式</span>
              <span className="text-[10px] bg-rose-500/20 text-rose-300 px-1.5 py-0.5 rounded border border-rose-500/30">指揮大師</span>
            </div>
            <ul className="text-xs text-slate-300/80 space-y-0.5 mt-1 font-mono">
              <li>・限時 2.0 秒，節奏緊湊</li>
              <li>・超時扣 50 分，比錯扣 30 分</li>
              <li>・超時會變換方向，無提示</li>
            </ul>
          </div>
        </button>
      </div>

      {/* Random Direction Toggle */}
      <label
        className="flex items-center justify-between p-3 rounded-xl bg-[#181a38]/60 border border-slate-700 hover:border-slate-600 cursor-pointer select-none transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <Shuffle className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-medium text-slate-200">隨機方向譜面</span>
          <span className="text-xs text-amber-300/70">（每次遊戲方向都不一樣，挑戰反應！）</span>
        </div>
        <input
          type="checkbox"
          checked={randomDirections}
          onChange={e => onToggleRandom(e.target.checked)}
          data-testid="checkbox-random"
          className="w-4 h-4 accent-amber-400 rounded cursor-pointer"
        />
      </label>
    </div>
  );
};
