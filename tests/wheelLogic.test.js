import assert from "node:assert/strict";
import test from "node:test";
import { optionKey, pickOption } from "../src/wheelLogic.js";

const data = ["Pizza", "Burger", "Ramen", "Nasi Goreng"].map((option) => ({ option }));

test("duplicate comparison ignores case, repeated spaces and Unicode presentation", () => {
  assert.equal(optionKey("  NASI   Goreng "), optionKey("Nasi Goreng"));
  assert.equal(optionKey("Ｐｉｚｚａ"), optionKey("pizza"));
  assert.notEqual(optionKey("Pizza"), optionKey("Pizza cheese"));
});

test("every entry occupies an equal interval, including first and last", () => {
  const counts = [0, 0, 0, 0];
  for (let index = 0; index < 1000; index++) {
    counts[pickOption(data, [], () => index / 1000).index]++;
  }
  assert.deepEqual(counts, [250, 250, 250, 250]);
  assert.equal(pickOption(data, [], () => 0).index, 0);
  assert.equal(pickOption(data, [], () => 0.999999).index, 3);
});

test("no-repeat cycles contain every entry once and restart after exhaustion", () => {
  let used = [];
  for (let cycle = 0; cycle < 3; cycle++) {
    const winners = [];
    for (let spin = 0; spin < data.length; spin++) {
      const next = pickOption(data, used, () => 0.7);
      used = next.used;
      winners.push(next.index);
    }
    assert.equal(new Set(winners).size, data.length);
  }
});

test("ordinary mode allows repeated winners and small lists cannot spin", () => {
  assert.equal(pickOption(data, [], () => 0).index, pickOption(data, [], () => 0).index);
  assert.equal(pickOption([]), null);
  assert.equal(pickOption(data.slice(0, 1)), null);
});
