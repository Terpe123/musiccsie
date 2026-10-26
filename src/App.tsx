/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  SONGS,
  DIFFS,
  ARROWS,
  DIR_NAMES,
  DIR_COLORS,
  KEYBOARD_MAP,
  Song,
  SongPhrase,
  Direction,
  DifficultyConfig,
  randomOtherDir,
  getBestScore,
  setBestScore,
} from './game/musicEngine.ts';
import { soundService } from './game/soundService.ts';
import { HeaderNav } from './components/HeaderNav.tsx';
import { SongSelection } from './components/SongSelection.tsx';
import { DifficultySelector } from './components/DifficultySelector.tsx';
import { OrchestraStage } from './components/OrchestraStage.tsx';
import { VisualizerCanvas } from './components/VisualizerCanvas.tsx';
import { HUD } from './components/HUD.tsx';
import { DpadControls } from './components/DpadControls.tsx';
import { ResultModal } from './components/ResultModal.tsx';
import { Play, Sparkles } from 'lucide-react';

type Screen = 'menu' | 'game' | 'result';
type GameState = 'countdown' | 'waiting' | 'playing' | 'done';

export default function App() {
  const [screen, setScreen] = useState<Screen>('menu');
  const [selectedSongId, setSelectedSongId] = useState<string>(SONGS[0].id);
  const [selectedDiffKey, setSelectedDiffKey] = useState<'easy' | 'hard'>('easy');
  const [randomDirections, setRandomDirections] = useState<boolean>(false);

  // Active game display state
  const [gameState, setGameState] = useState<GameState>('countdown');
  const [score, setScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(0);
  const [maxCombo, setMaxCombo] = useState<number>(0);
  const [perfectCount, setPerfectCount] = useState<number>(0);
  const [goodCount, setGoodCount] = useState<number>(0);
  const [wrongCount, setWrongCount] = useState<number>(0);
  const [timeoutCount, setTimeoutCount] = useState<number>(0);

  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [phrases, setPhrases] = useState<SongPhrase[]>([]);
  const [phraseResults, setPhraseResults] = useState<Array<'done' | 'flawed' | null>>([]);

  // Arrow & feedback state
  const [displayArrow, setDisplayArrow] = useState<string>('3');
  const [arrowColor, setArrowColor] = useState<string>('#ffffff');
  const [animClass, setAnimClass] = useState<string>('');
  const [feedback, setFeedback] = useState<{ text: string; color: string } | null>(null);
  const [activeInputPad, setActiveInputPad] = useState<Direction | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('樂團就位，準備開始…');
  const [timeRatio, setTimeRatio] = useState<number>(1);

  // Result state
  const [isNewBest, setIsNewBest] = useState<boolean>(false);
  const [bestRecord, setBestRecord] = useState<number>(0);

  // Persistent refs to avoid closure stalls & endless re-render cascades
  const gameStateRef = useRef<GameState>('countdown');
  const currentIdxRef = useRef<number>(0);
  const phrasesRef = useRef<SongPhrase[]>([]);
  const phraseCleanRef = useRef<boolean>(true);
  const scoreRef = useRef<number>(0);
  const comboRef = useRef<number>(0);
  const maxComboRef = useRef<number>(0);
  const perfectRef = useRef<number>(0);
  const goodRef = useRef<number>(0);
  const wrongRef = useRef<number>(0);
  const timeoutRef = useRef<number>(0);

  const promptTimeRef = useRef<number>(0);
  const timeoutIdRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nextPhraseIdRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autostartedRef = useRef<boolean>(false);

  // Keep refs in sync with selected song and diff
  const currentSongRef = useRef<Song>(SONGS[0]);
  const currentDiffRef = useRef<DifficultyConfig>(DIFFS.easy);

  const currentSong = SONGS.find(s => s.id === selectedSongId) || SONGS[0];
  const currentDiff = DIFFS[selectedDiffKey];

  useEffect(() => {
    currentSongRef.current = currentSong;
  }, [currentSong]);

  useEffect(() => {
    currentDiffRef.current = currentDiff;
  }, [currentDiff]);

  // Animation trigger helper
  const triggerAnim = (type: 'animate-pop' | 'animate-shake') => {
    setAnimClass('');
    requestAnimationFrame(() => {
      setAnimClass(type);
    });
  };

  const showFeedbackMsg = (text: string, color: string) => {
    setFeedback({ text, color });
    triggerAnim('animate-pop');
  };

  // Cleanup helper
  const cleanupGame = useCallback(() => {
    if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);
    if (nextPhraseIdRef.current) clearTimeout(nextPhraseIdRef.current);
    soundService.stopAll();
  }, []);

  // Finalize game when all phrases finish
  const finalizeGame = useCallback(() => {
    gameStateRef.current = 'done';
    setGameState('done');
    cleanupGame();

    const activeSong = currentSongRef.current;
    const activeDiff = currentDiffRef.current;
    soundService.playEndChord(activeSong.endChord);

    const finalScore = scoreRef.current;
    const prevBest = getBestScore(activeSong.id, activeDiff.id);
    const newRecord = finalScore > prevBest;

    if (newRecord) {
      setBestScore(activeSong.id, activeDiff.id, finalScore);
      setIsNewBest(true);
      setBestRecord(finalScore);
    } else {
      setIsNewBest(false);
      setBestRecord(prevBest);
    }

    setScreen('result');
  }, [cleanupGame]);

  // Timeout handler (for Hard mode)
  const handleTimeout = useCallback(() => {
    if (gameStateRef.current !== 'waiting') return;

    soundService.playBuzzer();
    timeoutRef.current += 1;
    setTimeoutCount(timeoutRef.current);

    comboRef.current = 0;
    setCombo(0);

    phraseCleanRef.current = false;
    const activeDiff = currentDiffRef.current;
    scoreRef.current = Math.max(0, scoreRef.current - activeDiff.timeoutPenalty);
    setScore(scoreRef.current);

    let msg = `太慢了！ -${activeDiff.timeoutPenalty}`;
    const p = phrasesRef.current[currentIdxRef.current];

    if (activeDiff.changeDirOnTimeout && p) {
      const newDir = randomOtherDir(p.dir);
      p.dir = newDir;
      setDisplayArrow(ARROWS[newDir]);
      setArrowColor(DIR_COLORS[newDir]);
      msg += ' 方向換了！';
    }

    setStatusMessage(`超時！請比「${DIR_NAMES[p.dir]}」`);
    showFeedbackMsg(msg, '#ef4444');
    triggerAnim('animate-shake');

    promptTimeRef.current = performance.now();

    if (activeDiff.timeLimit) {
      timeoutIdRef.current = setTimeout(handleTimeout, activeDiff.timeLimit * 1000);
    }
  }, []);

  // Display next prompt
  const nextPrompt = useCallback((idx: number) => {
    const phraseList = phrasesRef.current;
    if (idx >= phraseList.length) {
      finalizeGame();
      return;
    }

    currentIdxRef.current = idx;
    setCurrentIdx(idx);
    phraseCleanRef.current = true;

    const p = phraseList[idx];
    setDisplayArrow(ARROWS[p.dir]);
    setArrowColor(DIR_COLORS[p.dir]);
    triggerAnim('animate-pop');

    setStatusMessage(`請揮動指揮棒：「${DIR_NAMES[p.dir]}」`);
    gameStateRef.current = 'waiting';
    setGameState('waiting');
    promptTimeRef.current = performance.now();

    // Start timer for hard mode
    if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);
    const activeDiff = currentDiffRef.current;
    if (activeDiff.timeLimit) {
      timeoutIdRef.current = setTimeout(handleTimeout, activeDiff.timeLimit * 1000);
    }
  }, [finalizeGame, handleTimeout]);

  // Countdown routine (3 -> 2 -> 1 -> Go)
  const runCountdown = useCallback((count: number) => {
    if (count <= 0) {
      soundService.playTone(1046, performance.now() / 1000, 0.18, 'sine', 0.25);
      nextPrompt(0);
      return;
    }

    setDisplayArrow(count.toString());
    setArrowColor('#fbbf24');
    triggerAnim('animate-pop');
    soundService.playCountdownBeep(count);

    nextPhraseIdRef.current = setTimeout(() => {
      runCountdown(count - 1);
    }, 700);
  }, [nextPrompt]);

  // Start / Restart game
  const handleStartGame = useCallback(() => {
    cleanupGame();

    const activeSong = currentSongRef.current;
    let prevDir: Direction | 'none' = 'none';
    const preparedPhrases: SongPhrase[] = activeSong.phrases.map(p => {
      const dir = randomDirections ? randomOtherDir(prevDir) : p.dir;
      prevDir = dir;
      return { ...p, dir };
    });

    phrasesRef.current = preparedPhrases;
    currentIdxRef.current = 0;
    phraseCleanRef.current = true;
    scoreRef.current = 0;
    comboRef.current = 0;
    maxComboRef.current = 0;
    perfectRef.current = 0;
    goodRef.current = 0;
    wrongRef.current = 0;
    timeoutRef.current = 0;
    gameStateRef.current = 'countdown';

    setPhrases(preparedPhrases);
    setPhraseResults(new Array(preparedPhrases.length).fill(null));
    setCurrentIdx(0);
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setPerfectCount(0);
    setGoodCount(0);
    setWrongCount(0);
    setTimeoutCount(0);
    setFeedback(null);
    setStatusMessage('樂團就位，倒數開始…');
    setGameState('countdown');
    setScreen('game');

    runCountdown(3);
  }, [cleanupGame, randomDirections, runCountdown]);

  // Input processing
  const handleInput = useCallback((dir: Direction) => {
    setActiveInputPad(dir);
    setTimeout(() => setActiveInputPad(null), 140);

    if (gameStateRef.current !== 'waiting') return;

    const currentPhrase = phrasesRef.current[currentIdxRef.current];
    if (!currentPhrase) return;

    const activeDiff = currentDiffRef.current;
    const activeSong = currentSongRef.current;

    if (dir === currentPhrase.dir) {
      // Clear phrase timer
      if (timeoutIdRef.current) clearTimeout(timeoutIdRef.current);

      const reactionTime = (performance.now() - promptTimeRef.current) / 1000;
      const isPerfect = phraseCleanRef.current && reactionTime <= activeDiff.perfectWithin;

      const basePoints = isPerfect ? 100 : 50;
      comboRef.current += 1;
      const currentCombo = comboRef.current;
      maxComboRef.current = Math.max(maxComboRef.current, currentCombo);
      const comboBonus = (currentCombo - 1) * 10;
      const totalGain = basePoints + comboBonus;

      scoreRef.current += totalGain;

      setScore(scoreRef.current);
      setCombo(currentCombo);
      setMaxCombo(maxComboRef.current);

      if (isPerfect) {
        perfectRef.current += 1;
        setPerfectCount(perfectRef.current);
        showFeedbackMsg(`PERFECT! +${totalGain}`, '#fbbf24');
      } else {
        goodRef.current += 1;
        setGoodCount(goodRef.current);
        showFeedbackMsg(`GOOD +${totalGain}`, '#34d399');
      }

      // Record phrase result
      const thisIdx = currentIdxRef.current;
      const wasClean = phraseCleanRef.current;
      setPhraseResults(prev => {
        const next = [...prev];
        next[thisIdx] = wasClean ? 'done' : 'flawed';
        return next;
      });

      // Play audio
      gameStateRef.current = 'playing';
      setGameState('playing');
      setStatusMessage('♪ 樂團演奏中…');

      const phraseDuration = soundService.playPhrase(
        currentPhrase,
        activeSong.bpm * activeDiff.tempo,
        DIR_COLORS[currentPhrase.dir]
      );

      const nextIndex = thisIdx + 1;
      nextPhraseIdRef.current = setTimeout(() => {
        if (nextIndex >= phrasesRef.current.length) {
          finalizeGame();
        } else {
          nextPrompt(nextIndex);
        }
      }, phraseDuration * 1000);
    } else {
      // Wrong direction
      soundService.playBuzzer();
      wrongRef.current += 1;
      setWrongCount(wrongRef.current);

      comboRef.current = 0;
      setCombo(0);
      phraseCleanRef.current = false;
      triggerAnim('animate-shake');

      if (activeDiff.wrongPenalty > 0) {
        scoreRef.current = Math.max(0, scoreRef.current - activeDiff.wrongPenalty);
        setScore(scoreRef.current);
        showFeedbackMsg(`方向錯了！ -${activeDiff.wrongPenalty}`, '#ef4444');
      } else {
        showFeedbackMsg('方向錯了，再試一次！', '#f87171');
      }
    }
  }, [finalizeGame, nextPrompt]);

  // Return to menu
  const handleBackToMenu = useCallback(() => {
    cleanupGame();
    gameStateRef.current = 'done';
    setGameState('done');
    setScreen('menu');
  }, [cleanupGame]);

  // Handle URL ?autostart=1 on initial mount
  useEffect(() => {
    if (autostartedRef.current) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1') {
      autostartedRef.current = true;
      handleStartGame();
    }
  }, [handleStartGame]);

  // Keyboard navigation & controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      if (e.key === 'Escape') {
        handleBackToMenu();
        return;
      }

      if (e.key === 'Enter') {
        if (screen === 'menu' || screen === 'result') {
          handleStartGame();
          return;
        }
      }

      if ((e.key === 'r' || e.key === 'R') && screen !== 'menu') {
        handleStartGame();
        return;
      }

      const mappedDir = KEYBOARD_MAP[e.key];
      if (mappedDir && screen === 'game' && !e.repeat) {
        handleInput(mappedDir);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleBackToMenu, handleInput, handleStartGame, screen]);

  // Time ratio update for Hard mode
  useEffect(() => {
    if (screen !== 'game' || gameState !== 'waiting' || !currentDiff.timeLimit) {
      setTimeRatio(1);
      return;
    }

    const interval = setInterval(() => {
      const elapsed = performance.now() - promptTimeRef.current;
      const total = (currentDiff.timeLimit || 2) * 1000;
      const ratio = Math.max(0, 1 - elapsed / total);
      setTimeRatio(ratio);
    }, 40);

    return () => clearInterval(interval);
  }, [currentDiff.timeLimit, gameState, screen]);

  // Next direction hint
  const nextPhrase = phrases[currentIdx + 1];
  const nextDirArrow = currentDiff.showNext && nextPhrase ? ARROWS[nextPhrase.dir] : null;

  return (
    <div className="min-h-screen flex flex-col justify-between text-slate-100 font-sans">
      <HeaderNav onBackToMenu={handleBackToMenu} isInGame={screen === 'game'} />

      <main className="flex-1 flex flex-col items-center justify-center p-3 sm:p-4 max-w-2xl mx-auto w-full">
        {/* ================= SCREEN 1: MENU ================= */}
        {screen === 'menu' && (
          <div className="w-full space-y-4 animate-fade-in text-center" data-testid="menu-screen">
            {/* Title & Introduction */}
            <div className="space-y-0.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-serif mb-0.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>經典古典樂掌上音樂廳</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-serif font-black text-amber-200 tracking-wide drop-shadow-[0_2px_15px_rgba(251,191,36,0.3)]">
                小小指揮家
              </h1>
              <p className="text-xs text-slate-300 max-w-md mx-auto">
                看箭頭揮動指揮棒，掌握節奏契機，帶領交響樂團演奏世界名曲！
              </p>
            </div>

            {/* Song Selection */}
            <div className="text-left space-y-1.5">
              <h2 className="text-xs font-serif font-bold text-amber-300 tracking-wider flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-amber-400 text-slate-900 text-[10px] flex items-center justify-center font-bold">1</span>
                <span>選擇演奏名曲</span>
              </h2>
              <SongSelection
                songs={SONGS}
                selectedSongId={selectedSongId}
                onSelectSong={setSelectedSongId}
              />
            </div>

            {/* Difficulty Selection */}
            <div className="text-left space-y-1.5">
              <h2 className="text-xs font-serif font-bold text-amber-300 tracking-wider flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-amber-400 text-slate-900 text-[10px] flex items-center justify-center font-bold">2</span>
                <span>選擇挑戰難度</span>
              </h2>
              <DifficultySelector
                selectedDiff={selectedDiffKey}
                onSelectDiff={setSelectedDiffKey}
                randomDirections={randomDirections}
                onToggleRandom={setRandomDirections}
              />
            </div>

            {/* Start Game Action */}
            <button
              type="button"
              onClick={handleStartGame}
              data-testid="btn-start-game"
              className="w-full py-3.5 px-6 rounded-2xl font-serif font-black text-lg text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 hover:brightness-110 active:scale-[0.99] transition-all shadow-[0_0_25px_rgba(251,191,36,0.35)] cursor-pointer flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5 fill-slate-950" />
              <span>登上指揮台 開始演奏 (Enter)</span>
            </button>

            <div className="text-[11px] text-slate-400 flex items-center justify-center gap-2 font-mono">
              <span>支援鍵盤方向鍵、WASD 或點擊螢幕按鈕</span>
              <span>・</span>
              <span>Enter 直接開始</span>
            </div>
          </div>
        )}

        {/* ================= SCREEN 2: GAMEPLAY ================= */}
        {screen === 'game' && (
          <div className="w-full flex flex-col items-center gap-2 max-w-xl animate-fade-in" data-testid="game-screen">
            {/* HUD Status Bar */}
            <HUD
              song={currentSong}
              diff={currentDiff}
              score={score}
              combo={combo}
              phrases={phrases}
              phraseResults={phraseResults}
              currentIdx={currentIdx}
              state={gameState}
              timeRatio={timeRatio}
              nextDir={nextDirArrow}
            />

            {/* Orchestra Stage Visualizer */}
            <OrchestraStage
              activeDir={gameState === 'waiting' && phrases[currentIdx] ? phrases[currentIdx].dir : activeInputPad}
              isPlaying={gameState === 'playing'}
              statusText={statusMessage}
            />

            {/* Central Rhythm Prompt Box */}
            <div className="relative w-full py-2 flex flex-col items-center justify-center min-h-[140px] bg-slate-950/40 rounded-2xl border border-white/5 backdrop-blur-sm overflow-hidden">
              {/* Central Glowing Arrow / Countdown */}
              <div
                className={`font-black select-none leading-none flex items-center justify-center transition-all ${animClass}`}
                style={{
                  fontSize: gameState === 'countdown' ? '90px' : '120px',
                  color: arrowColor,
                  textShadow: `0 0 30px ${arrowColor}88, 0 0 60px ${arrowColor}44`,
                }}
                data-testid="arrow-indicator"
              >
                {displayArrow}
              </div>

              {/* Real-time Feedback Toast */}
              <div className="min-h-6 flex items-center justify-center">
                {feedback && (
                  <span
                    className="font-serif font-black text-lg px-3 py-0.5 rounded-full bg-black/60 shadow-lg border border-white/10"
                    style={{ color: feedback.color }}
                    data-testid="feedback-display"
                  >
                    {feedback.text}
                  </span>
                )}
              </div>
            </div>

            {/* Audio Particle Frequency Visualizer */}
            <VisualizerCanvas
              activeDir={gameState === 'waiting' && phrases[currentIdx] ? phrases[currentIdx].dir : null}
            />

            {/* On-Screen Conductor D-Pad Controls */}
            <DpadControls
              onInput={handleInput}
              activeDir={activeInputPad}
              disabled={gameState === 'done'}
            />

            {/* Quick Keyboard Reference */}
            <div className="flex items-center justify-between w-full text-[11px] text-slate-400 font-mono px-2">
              <span>方向鍵 / WASD 揮棒指揮</span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleStartGame}
                  className="hover:text-amber-300 underline cursor-pointer"
                >
                  R 重新開始
                </button>
                <button
                  type="button"
                  onClick={handleBackToMenu}
                  className="hover:text-amber-300 underline cursor-pointer"
                >
                  Esc 回選單
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= SCREEN 3: RESULTS ================= */}
        {screen === 'result' && (
          <ResultModal
            song={currentSong}
            diff={currentDiff}
            score={score}
            perfect={perfectCount}
            good={goodCount}
            wrong={wrongCount}
            timeouts={timeoutCount}
            maxCombo={maxCombo}
            isNewBest={isNewBest}
            bestScore={bestRecord}
            onRestart={handleStartGame}
            onBackToMenu={handleBackToMenu}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="w-full text-center py-1.5 text-[11px] text-slate-500 font-mono border-t border-white/5 select-none">
        小小指揮家 Maestro Lite・古典音樂節奏遊戲・貝多芬 / 莫札特 / 帕海貝爾 / 韋瓦第
      </footer>
    </div>
  );
}
