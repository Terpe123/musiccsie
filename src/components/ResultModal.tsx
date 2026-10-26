import React from 'react';
import { Song, DifficultyConfig, calculateRank, getRankBadgeColor, calculateMaxScore } from '../game/musicEngine.ts';
import { Trophy, RefreshCw, Menu, Sparkles, Check, AlertCircle } from 'lucide-react';

interface ResultModalProps {
  song: Song;
  diff: DifficultyConfig;
  score: number;
  perfect: number;
  good: number;
  wrong: number;
  timeouts: number;
  maxCombo: number;
  isNewBest: boolean;
  bestScore: number;
  onRestart: () => void;
  onBackToMenu: () => void;
}

export const ResultModal: React.FC<ResultModalProps> = ({
  song,
  diff,
  score,
  perfect,
  good,
  wrong,
  timeouts,
  maxCombo,
  isNewBest,
  bestScore,
  onRestart,
  onBackToMenu,
}) => {
  const maxScore = calculateMaxScore(song.phrases.length);
  const rank = calculateRank(score, maxScore);
  const rankStyle = getRankBadgeColor(rank);

  return (
    <div
      className="w-full max-w-lg mx-auto bg-gradient-to-b from-[#1c1e40] to-[#0f1026] border-2 border-amber-400/40 rounded-3xl p-6 shadow-2xl text-center select-none"
      data-testid="result-screen"
    >
      <div className="flex items-center justify-center gap-2 text-amber-300 font-serif text-sm tracking-widest uppercase mb-1">
        <Sparkles className="w-4 h-4" />
        <span>Concert Performance Complete</span>
        <Sparkles className="w-4 h-4" />
      </div>

      <h2 className="text-3xl font-serif font-black text-amber-100 tracking-wide">
        🎉 樂曲完美演繹！
      </h2>

      <div className="text-sm text-amber-200/80 mt-1 font-serif">
        {song.name}・{song.composer}
        <span
          className="ml-2 text-xs px-2 py-0.5 rounded-full text-white font-sans"
          style={{ backgroundColor: diff.color }}
        >
          {diff.label}
        </span>
      </div>

      {/* Big Rank Badge */}
      <div className="my-5 flex flex-col items-center justify-center">
        <div
          className="w-28 h-28 rounded-full flex items-center justify-center border-4 shadow-2xl relative transition-transform hover:scale-105"
          style={{
            borderColor: rankStyle.border,
            backgroundColor: rankStyle.bg,
            boxShadow: `0 0 30px ${rankStyle.border}66`,
          }}
        >
          <span
            className="text-7xl font-serif font-black"
            style={{ color: rankStyle.text }}
            data-testid="rank-display"
          >
            {rank}
          </span>
          <div className="absolute -bottom-2 bg-amber-400 text-slate-900 font-bold text-[10px] px-3 py-0.5 rounded-full uppercase tracking-widest shadow">
            Grade
          </div>
        </div>

        {isNewBest ? (
          <div className="mt-3 inline-flex items-center gap-1.5 text-amber-400 font-bold text-sm bg-amber-500/10 px-3 py-1 rounded-full border border-amber-400/30 animate-pulse">
            <Trophy className="w-4 h-4" />
            <span>★ 榮登歷史新紀錄！</span>
          </div>
        ) : (
          <div className="mt-3 text-xs text-slate-400">
            最佳紀錄：<b className="text-amber-200 font-mono">{bestScore}</b>
          </div>
        )}
      </div>

      {/* Score and Stats Grid */}
      <div className="bg-[#12132b]/80 border border-white/10 rounded-2xl p-4 mb-6 space-y-3">
        <div className="flex items-center justify-between border-b border-white/5 pb-2">
          <span className="text-sm text-slate-300">總指揮得分</span>
          <span className="text-2xl font-black font-mono text-amber-300" data-testid="final-score">
            {score}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
          <div className="flex items-center justify-between p-2 rounded-lg bg-black/30 border border-emerald-500/20">
            <span className="text-emerald-400 flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> PERFECT
            </span>
            <span className="font-bold text-white">{perfect}</span>
          </div>

          <div className="flex items-center justify-between p-2 rounded-lg bg-black/30 border border-sky-500/20">
            <span className="text-sky-400 flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> GOOD
            </span>
            <span className="font-bold text-white">{good}</span>
          </div>

          <div className="flex items-center justify-between p-2 rounded-lg bg-black/30 border border-rose-500/20">
            <span className="text-rose-400 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> 比錯次數
            </span>
            <span className="font-bold text-white">{wrong}</span>
          </div>

          <div className="flex items-center justify-between p-2 rounded-lg bg-black/30 border border-amber-500/20">
            <span className="text-amber-400 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> 超時次數
            </span>
            <span className="font-bold text-white">{timeouts}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1 text-xs text-slate-300">
          <span>最大連擊數 (Max Combo)</span>
          <span className="font-bold font-mono text-emerald-400 text-sm">{maxCombo} 連擊</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={onRestart}
          data-testid="btn-play-again"
          className="flex-1 py-3.5 px-6 rounded-xl font-bold font-serif text-slate-900 bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 transition-all shadow-lg hover:shadow-amber-400/20 flex items-center justify-center gap-2 cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          <span>再玩一次 (R)</span>
        </button>

        <button
          type="button"
          onClick={onBackToMenu}
          data-testid="btn-back-menu"
          className="py-3.5 px-6 rounded-xl font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white transition-all border border-slate-600 flex items-center justify-center gap-2 cursor-pointer"
        >
          <Menu className="w-4 h-4" />
          <span>回曲目選單 (Esc)</span>
        </button>
      </div>
    </div>
  );
};
