/**
 * Web Audio API Orchestral Synthesizer for 小小指揮家 Maestro Lite
 */

import { noteToMidi, midiToFreq, parseNotes, SongPhrase } from './musicEngine.ts';

export interface NoteEvent {
  midi: number;
  freq: number;
  color: string;
}

export class SoundService {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private activeOscs: OscillatorNode[] = [];
  private scheduledTimeouts: ReturnType<typeof setTimeout>[] = [];
  private volume: number = 0.8;
  private isMuted: boolean = false;
  private onNoteTrigger?: (event: NoteEvent) => void;

  constructor() {
    // Lazy initialized on first user interaction
  }

  public setNoteCallback(cb: (event: NoteEvent) => void) {
    this.onNoteTrigger = cb;
  }

  public initContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;

    if (!this.ctx) {
      try {
        const AudioCtxClass =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

        if (!AudioCtxClass) {
          console.warn('Web Audio API not supported in this browser');
          return null;
        }

        this.ctx = new AudioCtxClass();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
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
    } catch {
      // ignore
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    try {
      if (this.masterGain && this.ctx) {
        this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
      }
    } catch {
      // ignore
    }
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public getVolume(): number {
    return this.volume;
  }

  /**
   * Play a single tone with envelope
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

      // ADSR Envelope
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
      // AudioContext state error handler
    }
  }

  /**
   * Schedule a string of notes
   */
  private scheduleNotes(
    str: string,
    bpm: number,
    t0: number,
    type: OscillatorType,
    vol: number,
    vizColor: string | null,
    isBass: boolean = false
  ): number {
    const beat = 60 / bpm;
    let t = t0;
    const parsed = parseNotes(str);
    const ctx = this.initContext();
    const currTime = ctx ? ctx.currentTime : 0;

    for (const note of parsed) {
      const len = note.dur * beat;
      if (note.name !== 'R') {
        const midi = noteToMidi(note.name);
        const freq = midiToFreq(midi);
        this.playTone(freq, t, len * 0.94, type, vol, isBass);

        if (vizColor && this.onNoteTrigger) {
          const delayMs = Math.max(0, (t - currTime) * 1000);
          const cb = this.onNoteTrigger;
          const tid = setTimeout(() => {
            try {
              cb({ midi, freq, color: vizColor });
            } catch {
              // ignore
            }
          }, delayMs);
          this.scheduledTimeouts.push(tid);
        }
      }
      t += len;
    }

    return t - t0;
  }

  /**
   * Play a phrase (melody + bass)
   */
  public playPhrase(phrase: SongPhrase, bpm: number, color: string): number {
    const ctx = this.initContext();
    const t0 = ctx ? ctx.currentTime + 0.04 : 0;
    const d1 = this.scheduleNotes(phrase.melody, bpm, t0, 'triangle', 0.32, color, false);
    const d2 = phrase.bass ? this.scheduleNotes(phrase.bass, bpm, t0, 'sine', 0.24, null, true) : 0;
    return Math.max(d1, d2);
  }

  /**
   * Play the concluding chord
   */
  public playEndChord(notes: string[]) {
    const ctx = this.initContext();
    const t = ctx ? ctx.currentTime + 0.05 : 0;
    notes.forEach((n, i) => {
      try {
        const midi = noteToMidi(n);
        const freq = midiToFreq(midi);
        this.playTone(freq, t + i * 0.08, 2.4, 'triangle', 0.22);
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
   * Countdown beep sound
   */
  public playCountdownBeep(num: number) {
    const ctx = this.initContext();
    if (!ctx) return;
    const freq = num === 1 ? 1046.5 : 784;
    this.playTone(freq, ctx.currentTime, 0.12, 'sine', 0.25);
  }

  /**
   * Miss / error buzzer
   */
  public playBuzzer() {
    const ctx = this.initContext();
    if (!ctx) return;
    const t = ctx.currentTime;
    this.playTone(116, t, 0.22, 'sawtooth', 0.16);
    this.playTone(110, t, 0.22, 'sawtooth', 0.16);
  }

  /**
   * Stop all sound & clear scheduled timeouts
   */
  public stopAll() {
    this.scheduledTimeouts.forEach(clearTimeout);
    this.scheduledTimeouts = [];

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
