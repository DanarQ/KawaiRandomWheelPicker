import assert from "node:assert/strict";
import test from "node:test";
import { loadMusicPreferences, startMusicPlayback } from "../src/musicPlayback.js";

class Events {
  listeners = new Map();
  addEventListener(type, fn) { if (!this.listeners.has(type)) this.listeners.set(type, new Set()); this.listeners.get(type).add(fn); }
  removeEventListener(type, fn) { this.listeners.get(type)?.delete(fn); }
  emit(type, extra = {}) { for (const fn of [...(this.listeners.get(type) || [])]) fn({ type, isTrusted: true, ...extra }); }
}
class Audio extends Events {
  paused = true;
  calls = 0;
  blocked = true;
  play() {
    this.calls++;
    if (this.blocked) return Promise.reject(new Error("NotAllowedError"));
    this.paused = false;
    this.emit("playing");
    return Promise.resolve();
  }
  pause() { this.paused = true; }
}

test("autoplay rejection retries on a trusted interaction without saving disabled preference", async () => {
  const audio = new Audio(); const events = new Events(); const saved = [];
  const controller = startMusicPlayback(audio, events, { enabled: true, volume: 0.3 }, (value) => saved.push(value));
  assert.equal(audio.calls, 1);
  assert.equal(audio.volume, 0.3);
  await Promise.resolve();
  events.emit("click", { isTrusted: false });
  assert.equal(audio.calls, 1);
  audio.blocked = false;
  events.emit("click");
  assert.equal(audio.calls, 2);
  assert.equal(audio.paused, false);
  events.emit("keydown", { key: "a" });
  assert.equal(audio.calls, 2);
  assert.deepEqual(saved, []);
  controller.destroy();
});

test("manual pause cancels automatic retry and is persisted with volume", () => {
  const audio = new Audio(); audio.blocked = false;
  const events = new Events(); const saved = [];
  const controller = startMusicPlayback(audio, events, { enabled: true, volume: 0.5 }, (value) => saved.push(value));
  controller.toggle();
  assert.equal(audio.paused, true);
  events.emit("click");
  assert.equal(audio.calls, 1);
  controller.setVolume(0);
  assert.deepEqual(saved.at(-1), { enabled: false, volume: 0 });
  assert.equal(audio.muted, true);
  controller.destroy();
});

test("saved pause prevents autoplay; the Play button makes only one attempt", () => {
  const audio = new Audio(); audio.blocked = false;
  const events = new Events();
  const controller = startMusicPlayback(audio, events, { enabled: false, volume: 0.6 }, () => {});
  events.emit("click");
  assert.equal(audio.calls, 0);
  controller.toggle();
  events.emit("click", { target: { closest: () => ({}) } });
  assert.equal(audio.calls, 1);
  controller.destroy();
});

test("unmount removes retries; StrictMode remount has no leftover listener", async () => {
  const audio = new Audio(); const events = new Events();
  const initial = { enabled: true, volume: 0.5 };
  const old = startMusicPlayback(audio, events, initial, () => {});
  old.destroy();
  const current = startMusicPlayback(audio, events, initial, () => {});
  events.emit("keydown", { key: "Enter" });
  assert.equal(audio.calls, 3);
  current.destroy();
  events.emit("click");
  assert.equal(audio.calls, 3);
  await Promise.resolve();
});

test("bad preferences use defaults, while saved mute and pause survive", () => {
  const read = (raw) => loadMusicPreferences({ getItem: () => raw });
  assert.deepEqual(read("{bad"), { enabled: true, volume: 0.5 });
  assert.deepEqual(read('{"enabled":false,"volume":0}'), { enabled: false, volume: 0 });
  assert.deepEqual(read('{"enabled":"yes","volume":12}'), { enabled: true, volume: 0.5 });
});
