/**
 * Web Audio API & Tone.js Orchestral Synthesizer for 小小指揮家 Maestro Lite
 * 支援真實樂器取樣（小提琴、大提琴、鋼琴、長笛）與音樂廳殘響效果
 */

import { noteToMidi, midiToFreq, parseNotes, SongPhrase } from './musicEngine.ts';

// 宣告全域 Tone.js（透過 index.html 的 script 載入）
declare const Tone: any;

export interface NoteEvent {
  midi: number;
  freq: number;
  color: string;
}

// 產生取樣音源路徑（只載入各八度 C 與 A，其餘由音訊引擎自動移調）
function sampleUrls(lo: number, hi: number) {
  const urls: Record<string, string> = {};
  for (let o = lo; o <= hi; o++) {
    urls['C' + o] = 'C' + o + '.mp3';
    urls['A' + o] = 'A' + o + '.mp3';
  }
  return urls;
}

const GM = 'https://gleitz.github.io/midi-js-soundfonts/FluidR3_GM/';

export class SoundService {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private activeOscs: OscillatorNode[] = [];
  private scheduledTimeouts: ReturnType<typeof setTimeout>[] = [];
  private volume: number = 0.8;
  private isMuted: boolean = false;
  private onNoteTrigger?: (event: NoteEvent) => void;

  // Tone.js 取樣音源與效果器
  private samplers: Record<string, any> = {};
  private reverb: any = null;
  private toneInitialized: boolean = false;
  private currentSongId: string = '';

  constructor() {
    // 延遲初始化，等待使用者首次操作
  }

  public setNoteCallback(cb: (event: NoteEvent) => void) {
    this.onNoteTrigger = cb;
  }

  /**
   * 初始化 Tone.js 取樣樂器與殘響效果器
   */
  private initTone() {
    if (this.toneInitialized) return;
    if (typeof window === 'undefined') return;
    const T = (window as any).Tone;
    if (!T) return;

    try {
      // 殘響效果器：模擬音樂廳環境音場
      this.reverb = new T.Reverb({ decay: 2.2, wet: 0.28 }).toDestination();

      this.samplers = {
        piano: new T.Sampler({
          urls: sampleUrls(1, 7),
          baseUrl: 'https://tonejs.github.io/audio/salamander/',
          release: 1,
        }).connect(this.reverb),
        violin: new T.Sampler({
          urls: sampleUrls(3, 6),
          baseUrl: GM + 'violin-mp3/',
          release: 0.6,
        }).connect(this.reverb),
        cello: new T.Sampler({
          urls: sampleUrls(2, 4),
          baseUrl: GM + 'cello-mp3/',
          release: 0.6,
        }).connect(this.reverb),
        flute: new T.Sampler({
          urls: sampleUrls(4, 6),
          baseUrl: GM + 'flute-mp3/',
          release: 0.4,
        }).connect(this.reverb),
      };

      this.toneInitialized = true;
    } catch (e) {
      console.warn('Tone.js Sampler 初始化失敗，將使用原生振盪器備援：', e);
    }
  }

  public initContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;

    // 啟動 Tone.js
    const T = (window as any).Tone;
    if (T && T.context && T.context.state !== 'running') {
      T.start().catch(() => {});
    }
    this.initTone();

    // 啟動原生 AudioContext（供提示音與備援使用）
    if (!this.ctx) {
      try {
        const AudioCtxClass =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

        if (AudioCtxClass) {
          this.ctx = new AudioCtxClass();
          this.masterGain = this.ctx.createGain();
          this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
          this.masterGain.connect(this.ctx.destination);
        }
      } catch (e) {
        console.warn('Failed to construct AudioContext:', e);
        return null;
      }
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      try {
        this.ctx.resume().catch(() => {});
      } catch {
        // ignore
      }
    }

    return this.ctx;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    try {
      if (this.masterGain && this.ctx) {
        this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
      }
      const T = typeof window !== 'undefined' ? (window as any).Tone : null;
      if (T && T.Destination) {
        T.Destination.volume.value = this.isMuted ? -Infinity : (this.volume === 0 ? -Infinity : 20 * Math.log10(this.volume));
      }
    } catch {
      // ignore
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    this.setVolume(this.volume);
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public getVolume(): number {
    return this.volume;
  }

  public setSong(songId: string) {
    this.currentSongId = songId;
  }

  /**
   * 根據曲目或音階自動選擇最適配的樂器
   */
  private getInstruments(melody: string): { melody: string; bass: string } {
    if (this.currentSongId === 'elise' || melody.includes('D#5') || melody.includes('Eb5')) {
      return { melody: 'piano', bass: 'piano' }; // 給愛麗絲：鋼琴
    }
    if (this.currentSongId === 'ode' || (melody.includes('E4') && melody.includes('G4') && !melody.includes('F#4'))) {
      return { melody: 'flute', bass: 'cello' }; // 歡樂頌：長笛主旋律 + 大提琴
    }
    // 預設（莫札特、卡農等）：小提琴 + 大提琴
    return { melody: 'violin', bass: 'cello' };
  }

  /**
   * 原生振盪器（供提示音、錯誤蜂鳴器及離線備援使用）
   */
  public playTone(
    freq: number,
    start: number,
    duration: number,
    type: OscillatorType = 'triangle',
    targetVol: number = 0.28,
    isBass: boolean = false
  ) {
    const ctx = this.initContext();
    if (!ctx || !this.masterGain) return;

    try {
      const osc = ctx.createOscillator();
      const noteGain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, start);

      if (isBass) {
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(450, start);
        osc.connect(filter);
        filter.connect(noteGain);
      } else {
        osc.connect(noteGain);
      }

      noteGain.connect(this.masterGain);

      const attackTime = Math.min(0.03, duration * 0.1);
      const decayTime = Math.min(0.08, duration * 0.2);
      const sustainLevel = targetVol * 0.75;
      const releaseTime = 0.06;

      noteGain.gain.setValueAtTime(0.0001, start);
      noteGain.gain.linearRampToValueAtTime(targetVol, start + attackTime);
      noteGain.gain.exponentialRampToValueAtTime(Math.max(0.001, sustainLevel), start + attackTime + decayTime);
      noteGain.gain.setValueAtTime(sustainLevel, Math.max(start + attackTime + decayTime, start + duration - releaseTime));
      noteGain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

      osc.start(start);
      osc.stop(start + duration + 0.05);

      this.activeOscs.push(osc);
      osc.onended = () => {
        this.activeOscs = this.activeOscs.filter(o => o !== osc);
      };
    } catch {
      // ignore
    }
  }

  /**
   * 使用 Tone.js 取樣樂器排程一連串音符
   */
  private scheduleNotes(
    str: string,
    bpm: number,
    instName: string,
    vol: number,
    vizColor: string | null,
    isBass: boolean = false
  ): number {
    const beat = 60 / bpm;
    let t = 0;
    const parsed = parseNotes(str);
    const T = typeof window !== 'undefined' ? (window as any).Tone : null;
    const baseTime = T ? T.now() + 0.08 : 0;
    const inst = this.samplers[instName];

    for (const note of parsed) {
      const len = note.dur * beat;
      if (note.name !== 'R') {
        const at = t;
        const noteName = note.name;
        const midi = noteToMidi(noteName);
        const freq = midiToFreq(midi);

        // 提前預約發聲，按 Esc 或重設時可直接清除 timeout 取消
        const tid = setTimeout(() => {
          try {
            if (inst) {
              inst.triggerAttackRelease(noteName, len * 1.05, baseTime + at, vol);
            } else {
              // 若音源未就緒，備援使用原生振盪器
              const ctx = this.initContext();
              const startT = (ctx ? ctx.currentTime : 0) + 0.02;
              this.playTone(freq, startT, len * 0.94, 'triangle', vol * 0.35, isBass);
            }
          } catch {
            const ctx = this.initContext();
            const startT = (ctx ? ctx.currentTime : 0) + 0.02;
            this.playTone(freq, startT, len * 0.94, 'triangle', vol * 0.35, isBass);
          }

          // 連動觸發聲波動畫粒子
          if (vizColor && this.onNoteTrigger) {
            try {
              this.onNoteTrigger({ midi, freq, color: vizColor });
            } catch {
              // ignore
            }
          }
        }, Math.max(0, at - 0.05) * 1000);

        this.scheduledTimeouts.push(tid);
      }
      t += len;
    }

    return t;
  }

  /**
   * 演奏一個樂句（主旋律 + 低音伴奏）
   */
  public playPhrase(phrase: SongPhrase, bpm: number, color: string): number {
    this.initContext();
    const insts = this.getInstruments(phrase.melody);
    const d1 = this.scheduleNotes(phrase.melody, bpm, insts.melody, 0.9, color, false);
    const d2 = phrase.bass ? this.scheduleNotes(phrase.bass, bpm, insts.bass, 0.65, null, true) : 0;
    return Math.max(d1, d2);
  }

  /**
   * 演奏曲終和弦
   */
  public playEndChord(notes: string[]) {
    this.initContext();
    const T = typeof window !== 'undefined' ? (window as any).Tone : null;
    const inst = this.samplers.cello || this.samplers.piano;

    notes.forEach((n, i) => {
      try {
        const midi = noteToMidi(n);
        const freq = midiToFreq(midi);

        if (inst && T) {
          inst.triggerAttackRelease(n, 2.6, T.now() + 0.05 + i * 0.08, 0.7);
        } else {
          const ctx = this.initContext();
          const t = ctx ? ctx.currentTime + 0.05 : 0;
          this.playTone(freq, t + i * 0.08, 2.4, 'triangle', 0.22);
        }

        if (this.onNoteTrigger) {
          setTimeout(() => {
            this.onNoteTrigger?.({ midi, freq, color: '#fbbf24' });
          }, i * 80);
        }
      } catch {
        // ignore
      }
    });
  }

  /**
   * 倒數提示嗶聲（故意保留純淨電子音，與樂器聲明確區隔）
   */
  public playCountdownBeep(num: number) {
    const ctx = this.initContext();
    if (!ctx) return;
    const freq = num === 1 ? 1046.5 : 784;
    this.playTone(freq, ctx.currentTime, 0.12, 'sine', 0.25);
  }

  /**
   * 揮錯方向蜂鳴聲（保留電子鋸齒波，作為錯誤警告）
   */
  public playBuzzer() {
    const ctx = this.initContext();
    if (!ctx) return;
    const t = ctx.currentTime;
    this.playTone(116, t, 0.22, 'sawtooth', 0.16);
    this.playTone(110, t, 0.22, 'sawtooth', 0.16);
  }

  /**
   * 停止所有聲音與排程
   */
  public stopAll() {
    this.scheduledTimeouts.forEach(clearTimeout);
    this.scheduledTimeouts = [];

    // 釋放所有 Tone.js 取樣樂器聲音
    try {
      Object.values(this.samplers).forEach(s => {
        if (s && typeof s.releaseAll === 'function') {
          s.releaseAll();
        }
      });
    } catch {
      // ignore
    }

    // 停止所有原生振盪器
    this.activeOscs.forEach(o => {
      try {
        o.stop();
        o.disconnect();
      } catch {
        // ignore
      }
    });
    this.activeOscs = [];
  }
}

export const soundService = new SoundService();
