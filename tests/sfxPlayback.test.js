import assert from "node:assert/strict";
import test from "node:test";
import { createSfxPlayer } from "../src/sfxPlayback.js";

function setup(fetchAudio = async (src) => src) {
  let gesture = false;
  const sources = [];
  const context = {
    state: "suspended",
    sampleRate: 44100,
    destination: {},
    resumes: 0,
    resume() {
      this.resumes++;
      if (!gesture) return Promise.reject(new Error("NotAllowedError"));
      this.state = "running";
      return Promise.resolve();
    },
    createBuffer: () => "silent",
    decodeAudioData: async (bytes) => `decoded:${bytes}`,
    createBufferSource() {
      const source = {
        connect() {},
        disconnect() { this.disconnected = true; },
        start() { this.started = true; },
      };
      sources.push(source);
      return source;
    },
  };
  const player = createSfxPlayer({ createContext: () => context, fetchAudio });
  return {
    player, context, sources,
    tap(fn) { gesture = true; try { return fn(); } finally { gesture = false; } },
  };
}

test("Spin tap unlocks audio before loading; both delayed winner effects share it", async () => {
  const loads = [];
  const { player, tap, context, sources } = setup(async (src) => { loads.push(src); return src; });
  const prepared = tap(() => player.prepare(["click", "finish", "meow"]));
  assert.equal(context.state, "running");
  await prepared;
  // The animation callback runs later, without a user gesture.
  await Promise.all([player.play("finish"), player.play("meow")]);
  assert.equal(context.resumes, 1);
  assert.deepEqual(loads, ["click", "finish", "meow"]);
  assert.deepEqual(sources.map((source) => source.buffer), ["silent", "decoded:finish", "decoded:meow"]);
  assert.ok(sources.every((source) => source.started));
  sources.forEach((source) => source.onended());
  assert.ok(sources.every((source) => source.disconnected));
});

test("repeated effects use fresh sources and reuse the decoded buffer", async () => {
  let loads = 0;
  const { player, tap, sources } = setup(async () => { loads++; return "click"; });
  await tap(() => player.play("click"));
  await player.play("click");
  assert.equal(loads, 1);
  assert.equal(sources.length, 2);
  assert.notEqual(sources[0], sources[1]);
});

test("failed loading can retry on a later spin", async () => {
  let loads = 0;
  const { player, tap } = setup(async () => {
    if (++loads === 1) throw new Error("offline");
    return "finish";
  });
  await assert.rejects(tap(() => player.prepare(["finish"])), /offline/);
  await tap(() => player.prepare(["finish"]));
  await player.play("finish");
  assert.equal(loads, 2);
});

test("a new tap resumes audio after an interruption", async () => {
  const { player, tap, context } = setup();
  await tap(() => player.prepare(["finish"]));
  context.state = "interrupted";
  await tap(() => player.prepare(["finish"]));
  await player.play("finish");
  assert.equal(context.resumes, 2);
});
