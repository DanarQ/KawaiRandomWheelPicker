import assert from "node:assert/strict";
import test from "node:test";
import { parseOptions, saveOptions, STORAGE_KEY } from "../src/optionStorage.js";

const entry = (option) => ({ option, style: { backgroundColor: "#ffb3c6", textColor: "#5c3d5e" } });
const defaults = [entry("Pizza"), entry("Burger")];
function memoryStorage(raw = null) {
  return {
    getItem(key) { assert.equal(key, STORAGE_KEY); return raw; },
    setItem(key, value) { assert.equal(key, STORAGE_KEY); raw = value; },
  };
}

// Use the same queued critical sections as the browser LockManager contract.
function queuedLocks() {
  let tail = Promise.resolve();
  return { request(name, callback) {
    assert.equal(name, STORAGE_KEY);
    const result = tail.then(callback);
    tail = result.catch(() => {});
    return result;
  } };
}

test("saved lists round-trip, including empty lists; invalid data is rejected", () => {
  assert.deepEqual(parseOptions(null, defaults), defaults);
  assert.deepEqual(parseOptions("[]", defaults), []);
  assert.deepEqual(parseOptions(JSON.stringify(defaults), []), defaults);
  for (const raw of ["{", "{}", "[null]", '[{"option":""}]']) {
    assert.throws(() => parseOptions(raw, defaults));
  }
});

test("a stale tab cannot overwrite another tab's added option", async () => {
  const storage = memoryStorage();
  const locks = queuedLocks();
  const sushi = [...defaults, entry("Sushi")];
  await saveOptions(storage, locks, null, sushi);
  assert.deepEqual(await saveOptions(storage, locks, null, [...defaults, entry("Tea")]), { conflict: true });
  assert.deepEqual(parseOptions(storage.getItem(STORAGE_KEY), []), sushi);
  const latest = storage.getItem(STORAGE_KEY);
  await saveOptions(storage, locks, latest, [...sushi, entry("Tea")]);
  assert.deepEqual(parseOptions(storage.getItem(STORAGE_KEY), []).map((item) => item.option), ["Pizza", "Burger", "Sushi", "Tea"]);
});

test("simultaneous edits have only one winner; the other reports conflict", async () => {
  const storage = memoryStorage();
  const locks = queuedLocks();
  const results = await Promise.all([
    saveOptions(storage, locks, null, [...defaults, entry("Sushi")]),
    saveOptions(storage, locks, null, [...defaults, entry("Tea")]),
  ]);
  assert.equal(results.filter((result) => result.conflict).length, 1);
  assert.equal(results.filter((result) => result.raw).length, 1);
});

test("stale deletion cannot remove a concurrently added option", async () => {
  const baseline = JSON.stringify(defaults);
  const storage = memoryStorage(baseline);
  const locks = queuedLocks();
  await saveOptions(storage, locks, baseline, [...defaults, entry("Sushi")]);
  assert.deepEqual(await saveOptions(storage, locks, baseline, []), { conflict: true });
  assert.equal(parseOptions(storage.getItem(STORAGE_KEY), []).length, 3);
});

test("storage failures and unsupported locking do not report success", async () => {
  const storage = memoryStorage();
  await assert.rejects(saveOptions(storage, undefined, null, defaults));
  assert.equal(storage.getItem(STORAGE_KEY), null);
  storage.setItem = () => { throw new Error("Quota exceeded"); };
  await assert.rejects(saveOptions(storage, queuedLocks(), null, defaults), /Quota exceeded/);
});
