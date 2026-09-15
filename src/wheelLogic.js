export function optionKey(label) {
  return label.normalize("NFKC").trim().replace(/\s+/g, " ").toLowerCase();
}

// Pick uniformly from eligible entries; an exhausted cycle starts a fresh one.
export function pickOption(data, used = [], random = Math.random) {
  if (data.length < 2) return null;
  let candidates = data.map((_, index) => index).filter((index) => !used.includes(index));
  if (candidates.length === 0) candidates = data.map((_, index) => index);
  const index = candidates[Math.floor(random() * candidates.length)];
  return { index, used: [...(used.length === data.length ? [] : used), index] };
}
