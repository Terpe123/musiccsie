import React, { useState } from 'react';
import { soundService } from '../game/soundService.ts';
import { Volume2, VolumeX, HelpCircle, X, Sparkles, BookOpen } from 'lucide-react';

interface HeaderNavProps {
  onBackToMenu?: () => void;
  isInGame?: boolean;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({ onBackToMenu, isInGame }) => {
  const [volume, setVolume] = useState<number>(soundService.getVolume());
  const [isMuted, setIsMuted] = useState<boolean>(soundService.getMuted());
  const [showHelp, setShowHelp] = useState<boolean>(false);

  const handleToggleMute = () => {
    const muted = soundService.toggleMute();
    setIsMuted(muted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    soundService.setVolume(val);
    if (isMuted && val > 0) {
      soundService.toggleMute();
      setIsMuted(false);
    }
  };

  return (
    <>
      <header className="w-full flex items-center justify-between py-3 px-4 border-b border-amber-500/20 bg-[#0d0f22]/80 backdrop-blur-md select-none sticky top-0 z-30">
        <div
          className="flex items-center gap-2.5 cursor-pointer"
          onClick={onBackToMenu}
          title="小小指揮家 Maestro Lite"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-900 flex items-center justify-center font-bold text-xl shadow-[0_0_12px_rgba(251,191,36,0.5)]">
            🎼
          </div>
          <div>
            <h1 className="font-serif font-black text-lg text-amber-100 tracking-wide flex items-center gap-1.5">
              <span>小小指揮家</span>
              <span className="text-[10px] font-sans font-normal tracking-widest text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-400/30 uppercase">
                Maestro Lite
              </span>
            </h1>
            <p className="text-[10px] text-amber-200/60 font-sans hidden sm:block">
              古典名曲節奏指揮模擬器
            </p>
          </div>
        </div>

        {/* Right side controls: Volume, Help, Back */}
        <div className="flex items-center gap-3">
          {/* Volume Control */}
          <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1.5 rounded-xl border border-white/10">
            <button
              type="button"
              onClick={handleToggleMute}
              className="text-slate-300 hover:text-amber-300 focus:outline-none cursor-pointer"
              aria-label={isMuted ? '解除靜音' : '靜音'}
              data-testid="btn-mute"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-rose-400" />
              ) : (
                <Volume2 className="w-4 h-4 text-amber-300" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              aria-label="主音量調整"
              data-testid="volume-slider"
              className="w-16 sm:w-20 accent-amber-400 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
            />
          </div>

          {/* Help Button */}
          <button
            type="button"
            onClick={() => setShowHelp(true)}
            aria-label="玩法規則指南"
            data-testid="btn-help"
            className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-750 text-slate-300 hover:text-amber-300 border border-white/10 cursor-pointer transition-colors"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-[#181a38] border-2 border-amber-400/40 rounded-3xl p-6 shadow-2xl text-left select-none max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setShowHelp(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 cursor-pointer"
              aria-label="關閉說明"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-amber-300 font-serif font-bold text-xl mb-3">
              <BookOpen className="w-5 h-5" />
              <span>小小指揮家 玩法說明</span>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
              <div className="p-3 bg-black/30 rounded-xl border border-white/5 space-y-1">
                <div className="font-bold text-amber-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" /> 1. 指揮動作與方向
                </div>
                <p className="text-slate-300">
                  螢幕中央出現箭頭時，請依照提示揮動指揮棒：
                </p>
                <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-xs">
                  <div className="p-1.5 rounded bg-sky-950/40 border border-sky-400/40 text-sky-300">
                    ↑ 向上：方向鍵 ↑ 或 W 鍵
                  </div>
                  <div className="p-1.5 rounded bg-emerald-950/40 border border-emerald-400/40 text-emerald-300">
                    ↓ 向下：方向鍵 ↓ 或 S 鍵
                  </div>
                  <div className="p-1.5 rounded bg-pink-950/40 border border-pink-400/40 text-pink-300">
                    ← 向左：方向鍵 ← 或 A 鍵
                  </div>
                  <div className="p-1.5 rounded bg-amber-950/40 border border-amber-400/40 text-amber-300">
                    → 向右：方向鍵 → 或 D 鍵
                  </div>
                </div>
              </div>

              <div className="p-3 bg-black/30 rounded-xl border border-white/5 space-y-1">
                <div className="font-bold text-amber-300">2. 音樂節奏與演奏</div>
                <p className="text-slate-300">
                  當您揮出正確方向時，交響樂團會立即響起對應樂句！完美反應時間內比對可獲得 <b>PERFECT (+100分)</b>，稍慢可得 <b>GOOD (+50分)</b>。連續正確更享有 <b>連擊倍數加成</b>！
                </p>
              </div>

              <div className="p-3 bg-black/30 rounded-xl border border-white/5 space-y-1">
                <div className="font-bold text-amber-300">3. 模式區別</div>
                <p className="text-slate-300">
                  <b>簡單模式：</b>不限時間、比錯不扣分、有下一個動作提示。<br />
                  <b>困難模式：</b>限時 2.0 秒！超時扣 50 分且會變換方向，比錯扣 30 分，無下一個動作提示。
                </p>
              </div>

              <div className="p-3 bg-black/30 rounded-xl border border-white/5 text-slate-400 text-xs">
                快捷鍵：<kbd className="bg-slate-700 px-1.5 py-0.5 rounded text-white">Enter</kbd> 開始遊戲｜<kbd className="bg-slate-700 px-1.5 py-0.5 rounded text-white">R</kbd> 重新開始｜<kbd className="bg-slate-700 px-1.5 py-0.5 rounded text-white">Esc</kbd> 返回選單
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowHelp(false)}
              className="w-full mt-5 py-3 rounded-xl font-bold bg-amber-400 hover:bg-amber-300 text-slate-900 transition-colors cursor-pointer"
            >
              我知道了，開始指揮！
            </button>
          </div>
        </div>
      )}
    </>
  );
};
