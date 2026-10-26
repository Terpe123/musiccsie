/**
 * 小小指揮家 Maestro Lite - Music Engine & Rules
 */

export interface SongPhrase {
  dir: 'up' | 'down' | 'left' | 'right';
  melody: string;
  bass?: string;
}

export interface Song {
  id: string;
  name: string;
  composer: string;
  stars: number;
  bpm: number;
  endChord: string[];
  phrases: SongPhrase[];
  description?: string;
}

export type Direction = 'up' | 'down' | 'left' | 'right';

export interface DifficultyConfig {
  id: 'easy' | 'hard';
  label: string;
  color: string;
  timeLimit: number | null; // seconds
  perfectWithin: number;    // seconds
  wrongPenalty: number;
  timeoutPenalty: number;
  changeDirOnTimeout: boolean;
  showNext: boolean;
  tempo: number;
}

export const DIRS: Direction[] = ['up', 'down', 'left', 'right'];

export const ARROWS: Record<Direction, string> = {
  up: '↑',
  down: '↓',
  left: '←',
  right: '→',
};

export const DIR_NAMES: Record<Direction, string> = {
  up: '上',
  down: '下',
  left: '左',
  right: '右',
};

export const DIR_COLORS: Record<Direction, string> = {
  up: '#38bdf8',    // sky blue
  down: '#34d399',  // emerald
  left: '#f472b6',  // pink
  right: '#fbbf24', // amber
};

export const KEYBOARD_MAP: Record<string, Direction> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  w: 'up',
  W: 'up',
  s: 'down',
  S: 'down',
  a: 'left',
  A: 'left',
  d: 'right',
  D: 'right',
};

export const DIFFS: Record<'easy' | 'hard', DifficultyConfig> = {
  easy: {
    id: 'easy',
    label: '簡單',
    color: '#10b981',
    timeLimit: null,
    perfectWithin: 2.0,
    wrongPenalty: 0,
    timeoutPenalty: 0,
    changeDirOnTimeout: false,
    showNext: true,
    tempo: 0.95,
  },
  hard: {
    id: 'hard',
    label: '困難',
    color: '#ef4444',
    timeLimit: 2.0,
    perfectWithin: 0.8,
    wrongPenalty: 30,
    timeoutPenalty: 50,
    changeDirOnTimeout: true,
    showNext: false,
    tempo: 1.15,
  },
};

export const SONGS: Song[] = [
  {
    id: 'ode',
    name: '歡樂頌',
    composer: '貝多芬 Beethoven',
    stars: 1,
    bpm: 112,
    endChord: ['C4', 'E4', 'G4', 'C5'],
    description: '第9號交響曲著名終樂章，莊嚴宏偉的和平之歌。',
    phrases: [
      { dir: 'up',    melody: 'E4 E4 F4 G4 G4 F4 E4 D4',            bass: 'C3:4 G2:4' },
      { dir: 'down',  melody: 'C4 C4 D4 E4 E4:1.5 D4:0.5 D4:2',     bass: 'C3:4 G2:4' },
      { dir: 'left',  melody: 'E4 E4 F4 G4 G4 F4 E4 D4',            bass: 'C3:4 G2:4' },
      { dir: 'right', melody: 'C4 C4 D4 E4 D4:1.5 C4:0.5 C4:2',     bass: 'C3:4 G2:2 C3:2' },
      { dir: 'up',    melody: 'D4 D4 E4 C4 D4 E4:0.5 F4:0.5 E4 C4', bass: 'G2:2 C3:2 G2:2 C3:2' },
      { dir: 'left',  melody: 'D4 E4:0.5 F4:0.5 E4 D4 C4 D4 G3:2',  bass: 'G2:4 C3:2 G2:2' },
      { dir: 'right', melody: 'E4 E4 F4 G4 G4 F4 E4 D4',            bass: 'C3:4 G2:4' },
      { dir: 'down',  melody: 'C4 C4 D4 E4 D4:1.5 C4:0.5 C4:2',     bass: 'C3:4 G2:2 C3:2' },
    ],
  },
  {
    id: 'mozart',
    name: '弦樂小夜曲',
    composer: '莫札特 Mozart',
    stars: 2,
    bpm: 124,
    endChord: ['G3', 'B3', 'D4', 'G4'],
    description: 'G大調第13號弦樂小夜曲，輕快優雅的宮廷經典。',
    phrases: [
      { dir: 'up',    melody: 'G4 R:0.5 D4:0.5 G4 R:0.5 D4:0.5',    bass: 'G2:4' },
      { dir: 'right', melody: 'G4:0.5 D4:0.5 G4:0.5 B4:0.5 D5:2',   bass: 'G2:4' },
      { dir: 'down',  melody: 'C5 R:0.5 A4:0.5 C5 R:0.5 A4:0.5',    bass: 'D3:4' },
      { dir: 'left',  melody: 'C5:0.5 A4:0.5 F#4:0.5 A4:0.5 D4:2',  bass: 'D3:4' },
      { dir: 'up',    melody: 'G4 R:0.5 D4:0.5 G4 R:0.5 D4:0.5',    bass: 'G2:4' },
      { dir: 'right', melody: 'G4:0.5 D4:0.5 G4:0.5 B4:0.5 D5:2',   bass: 'G2:4' },
    ],
  },
  {
    id: 'elise',
    name: '給愛麗絲',
    composer: '貝多芬 Beethoven',
    stars: 2,
    bpm: 168,
    endChord: ['A3', 'C4', 'E4', 'A4'],
    description: '浪漫深情的經典輪旋曲，耳熟能詳的鋼琴旋律。',
    phrases: [
      { dir: 'up',    melody: 'E5:0.5 D#5:0.5 E5:0.5 D#5:0.5 E5:0.5 B4:0.5 D5:0.5 C5:0.5 A4:1.5', bass: 'A2:4.5' },
      { dir: 'left',  melody: 'C4:0.5 E4:0.5 A4:0.5 B4:1.5',        bass: 'A2:3' },
      { dir: 'right', melody: 'E4:0.5 G#4:0.5 B4:0.5 C5:1.5',       bass: 'E3:3' },
      { dir: 'up',    melody: 'E4:0.5 E5:0.5 D#5:0.5 E5:0.5 D#5:0.5 E5:0.5 B4:0.5 D5:0.5 C5:0.5 A4:1.5', bass: 'A2:5' },
      { dir: 'left',  melody: 'C4:0.5 E4:0.5 A4:0.5 B4:1.5',        bass: 'A2:3' },
      { dir: 'down',  melody: 'E4:0.5 C5:0.5 B4:0.5 A4:2',          bass: 'A2:3.5' },
    ],
  },
  {
    id: 'canon',
    name: 'D大調卡農',
    composer: '帕海貝爾 Pachelbel',
    stars: 3,
    bpm: 96,
    endChord: ['D4', 'F#4', 'A4', 'D5'],
    description: '層層遞進的優美復調卡農，婚禮與盛典常客。',
    phrases: [
      { dir: 'up',    melody: 'F#5 E5 D5 C#5 B4 A4 B4 C#5', bass: 'D3 A2 B2 F#2 G2 D2 G2 A2' },
      { dir: 'down',  melody: 'D5 C#5 B4 A4 G4 F#4 G4 E4',  bass: 'D3 A2 B2 F#2 G2 D2 G2 A2' },
      { dir: 'left',  melody: 'D4:0.5 F#4:0.5 A4:0.5 G4:0.5 F#4:0.5 D4:0.5 F#4:0.5 E4:0.5 D4:0.5 B3:0.5 D4:0.5 A4:0.5 G4:0.5 B4:0.5 A4:0.5 G4:0.5', bass: 'D3 A2 B2 F#2 G2 D2 G2 A2' },
      { dir: 'right', melody: 'D4:0.5 F#4:0.5 A4:0.5 G4:0.5 F#4:0.5 D4:0.5 F#4:0.5 E4:0.5 D4:0.5 B3:0.5 D4:0.5 A4:0.5 G4:0.5 B4:0.5 A4:0.5 G4:0.5', bass: 'D3 A2 B2 F#2 G2 D2 G2 A2' },
      { dir: 'up',    melody: 'F#5 E5 D5 C#5 B4 A4 B4 C#5', bass: 'D3 A2 B2 F#2 G2 D2 G2 A2' },
      { dir: 'left',  melody: 'D5 C#5 B4 A4 G4 F#4 G4 E4',  bass: 'D3 A2 B2 F#2 G2 D2 G2 A2' },
      { dir: 'down',  melody: 'D5:4',                        bass: 'D3:4' },
    ],
  },
  {
    id: 'vivaldi',
    name: '四季・春',
    composer: '韋瓦第 Vivaldi',
    stars: 3,
    bpm: 110,
    endChord: ['E4', 'G#4', 'B4', 'E5'],
    description: 'E大調協奏曲第一樂章，鳥語花香與泉水奔流之生機。',
    phrases: [
      { dir: 'up',    melody: 'E5:1 G#5:0.5 G#5:0.5 G#5:1 F#5:0.5 E5:0.5 B5:2', bass: 'E3:2 E3:2 B2:2' },
      { dir: 'right', melody: 'B5:0.5 A5:0.5 G#5:1 F#5:0.5 E5:0.5 B5:2',       bass: 'E3:2 B2:2' },
      { dir: 'left',  melody: 'B5:0.5 A5:0.5 G#5:0.5 A5:0.5 F#5:2',             bass: 'B2:4' },
      { dir: 'up',    melody: 'E5:1 G#5:0.5 G#5:0.5 G#5:1 F#5:0.5 E5:0.5 B5:2', bass: 'E3:2 E3:2 B2:2' },
      { dir: 'down',  melody: 'B5:0.5 A5:0.5 G#5:0.5 A5:0.5 F#5:1 E5:2',        bass: 'B2:2 E3:2' },
    ],
  },
];

export interface ParsedNote {
  name: string;
  dur: number; // in beats
}

export function noteToMidi(name: string): number {
  const m = name.match(/^([A-G])(#|b)?(\d)$/);
  if (!m) throw new Error('音符格式錯誤：' + name);
  const baseMap: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  const base = baseMap[m[1]];
  const acc = m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0;
  const octave = parseInt(m[3], 10);
  return (octave + 1) * 12 + base + acc;
}

export function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

export function parseNotes(str: string): ParsedNote[] {
  return str.trim().split(/\s+/).map(tok => {
    const [name, d] = tok.split(':');
    return { name, dur: d ? parseFloat(d) : 1 };
  });
}

export function randomOtherDir(current: Direction | 'none'): Direction {
  const opts = DIRS.filter(x => x !== current);
  return opts[Math.floor(Math.random() * opts.length)];
}

export function calculateMaxScore(phraseCount: number): number {
  let total = 0;
  for (let i = 0; i < phraseCount; i++) {
    total += 100 + i * 10;
  }
  return total;
}

export function calculateRank(score: number, maxScore: number): 'S' | 'A' | 'B' | 'C' {
  if (maxScore <= 0) return 'C';
  const ratio = score / maxScore;
  if (ratio >= 0.92) return 'S';
  if (ratio >= 0.78) return 'A';
  if (ratio >= 0.58) return 'B';
  return 'C';
}

export function getRankBadgeColor(rank: 'S' | 'A' | 'B' | 'C'): { text: string; bg: string; border: string } {
  switch (rank) {
    case 'S':
      return { text: '#fbbf24', bg: 'rgba(251, 191, 36, 0.15)', border: '#fbbf24' };
    case 'A':
      return { text: '#34d399', bg: 'rgba(52, 211, 153, 0.15)', border: '#34d399' };
    case 'B':
      return { text: '#38bdf8', bg: 'rgba(56, 189, 248, 0.15)', border: '#38bdf8' };
    case 'C':
    default:
      return { text: '#9ca3af', bg: 'rgba(156, 163, 175, 0.15)', border: '#9ca3af' };
  }
}

// In-memory fallback if localStorage is unavailable
const memoryStorage: Record<string, string> = {};

export function getBestScore(songId: string, diff: string): number {
  const key = `maestro_${songId}_${diff}`;
  try {
    if (typeof window !== 'undefined' && 'localStorage' in window) {
      const val = window.localStorage.getItem(key);
      if (val !== null) return parseInt(val, 10) || 0;
    }
  } catch {
    // fallback to memory
  }
  return parseInt(memoryStorage[key] || '0', 10) || 0;
}

export function setBestScore(songId: string, diff: string, score: number): boolean {
  const key = `maestro_${songId}_${diff}`;
  const current = getBestScore(songId, diff);
  if (score > current) {
    memoryStorage[key] = score.toString();
    try {
      if (typeof window !== 'undefined' && 'localStorage' in window) {
        window.localStorage.setItem(key, score.toString());
        return true;
      }
    } catch {
      // localStorage failed, memoryStorage is updated
    }
    return true;
  }
  return false;
}
