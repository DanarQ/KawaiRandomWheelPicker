export const STORAGE_KEY = "kawai-wheel-options-v1";

export function parseOptions(raw, defaults) {
  if (raw === null) return defaults;
  const saved = JSON.parse(raw);
  if (!Array.isArray(saved) || !saved.every((item) =>
    item !== null && typeof item.option === "string" && item.option.trim().length > 0 &&
    typeof item.style?.backgroundColor === "string" && typeof item.style?.textColor === "string",
  )) throw new Error("Invalid saved options");
  return saved;
}

// All app tabs use the same lock, so checking and writing cannot interleave.
export async function saveOptions(storage, locks, expectedRaw, data) {
  const save = () => {
    const currentRaw = storage.getItem(STORAGE_KEY);
    if (currentRaw !== expectedRaw) return { conflict: true };
    const raw = JSON.stringify(data);
    storage.setItem(STORAGE_KEY, raw);
    return { raw };
  };
  if (!locks) throw new Error("Safe cross-tab saving is unavailable in this browser");
  return locks.request(STORAGE_KEY, save);
}
