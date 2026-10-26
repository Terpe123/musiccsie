import test from 'node:test';
import assert from 'node:assert/strict';
import {
  noteToMidi,
  midiToFreq,
  parseNotes,
  randomOtherDir,
  calculateMaxScore,
  calculateRank,
  SONGS,
  DIFFS,
  type Direction
} from './musicEngine.ts';

test('noteToMidi converts note strings correctly', () => {
  assert.equal(noteToMidi('C4'), 60);
  assert.equal(noteToMidi('A4'), 69);
  assert.equal(noteToMidi('C5'), 72);
  assert.equal(noteToMidi('F#4'), 66);
  assert.equal(noteToMidi('Bb4'), 70);
  assert.equal(noteToMidi('D3'), 50);
});

test('midiToFreq computes 440Hz for A4', () => {
  const freqA4 = midiToFreq(69);
  assert.ok(Math.abs(freqA4 - 440) < 0.001);
  const freqA3 = midiToFreq(57);
  assert.ok(Math.abs(freqA3 - 220) < 0.001);
});

test('parseNotes parses durations and rests correctly', () => {
  const notes = parseNotes('E4:0.5 D#5:0.5 R:1 C4:2 G3');
  assert.equal(notes.length, 5);
  assert.equal(notes[0].name, 'E4');
  assert.equal(notes[0].dur, 0.5);
  assert.equal(notes[2].name, 'R');
  assert.equal(notes[2].dur, 1);
  assert.equal(notes[3].name, 'C4');
  assert.equal(notes[3].dur, 2);
  assert.equal(notes[4].dur, 1); // default duration
});

test('randomOtherDir never returns the current direction', () => {
  const dirs: Direction[] = ['up', 'down', 'left', 'right'];
  for (const d of dirs) {
    for (let i = 0; i < 20; i++) {
      const next = randomOtherDir(d);
      assert.notEqual(next, d);
      assert.ok(dirs.includes(next));
    }
  }
});

test('calculateMaxScore produces correct cumulative combo score', () => {
  // 1 phrase: 100
  assert.equal(calculateMaxScore(1), 100);
  // 2 phrases: 100 + 110 = 210
  assert.equal(calculateMaxScore(2), 210);
  // 3 phrases: 100 + 110 + 120 = 330
  assert.equal(calculateMaxScore(3), 330);
});

test('calculateRank assigns accurate letter grades', () => {
  const max = 1000;
  assert.equal(calculateRank(950, max), 'S');
  assert.equal(calculateRank(850, max), 'A');
  assert.equal(calculateRank(650, max), 'B');
  assert.equal(calculateRank(400, max), 'C');
  assert.equal(calculateRank(0, max), 'C');
});

test('song catalog integrity', () => {
  assert.ok(SONGS.length >= 4);
  for (const s of SONGS) {
    assert.ok(s.id.length > 0);
    assert.ok(s.name.length > 0);
    assert.ok(s.bpm > 40 && s.bpm < 250);
    assert.ok(s.phrases.length >= 4);
    assert.ok(s.endChord.length >= 3);
  }
});
