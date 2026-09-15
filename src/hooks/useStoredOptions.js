import { useCallback, useEffect, useRef, useState } from "react";
import { parseOptions, saveOptions, STORAGE_KEY } from "../optionStorage";

export default function useStoredOptions(defaults) {
  const [initial] = useState(() => {
    let raw = null;
    try {
      raw = localStorage.getItem(STORAGE_KEY);
      return { raw, data: parseOptions(raw, defaults), status: { type: "saved", message: raw === null ? "Ready to save in this browser" : "Saved in this browser" } };
    } catch {
      return { raw, data: defaults, status: { type: "error", message: "Saved options could not be loaded. Your saved data is unchanged. Refresh to try again." } };
    }
  });
  const [data, setData] = useState(initial.data);
  const [status, setStatus] = useState(initial.status);
  const [spinning, setSpinning] = useState(false);
  const [saving, setSaving] = useState(false);
  const [revision, setRevision] = useState(0);
  const baseline = useRef(initial.raw);
  const spinningRef = useRef(false);
  const savingRef = useRef(false);
  const pendingSync = useRef(false);

  const sync = useCallback(() => {
    if (spinningRef.current || savingRef.current) {
      pendingSync.current = true;
      return;
    }
    pendingSync.current = false;
    try {
      // Read the current value rather than an event payload that may be stale.
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw === baseline.current) return;
      const next = parseOptions(raw, defaults);
      baseline.current = raw;
      setData(next);
      setRevision((value) => value + 1);
      setStatus((previous) => ["error", "conflict"].includes(previous.type) ? previous : { type: "synced", message: "Updated from another tab" });
    } catch {
      setStatus({ type: "error", message: "Could not load changes from another tab. Your list is unchanged. Refresh to try again." });
    }
  }, [defaults]);

  useEffect(() => {
    const handleStorage = (event) => {
      if (event.storageArea === localStorage && (event.key === STORAGE_KEY || event.key === null)) sync();
    };
    window.addEventListener("storage", handleStorage);
    window.addEventListener("focus", sync);
    // Covers changes between the initial read and listener registration.
    const timer = window.setTimeout(sync, 0);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("focus", sync);
    };
  }, [sync]);

  const onSpinningChange = (active) => {
    spinningRef.current = active;
    setSpinning(active);
    if (!active && pendingSync.current) sync();
  };

  const updateOptions = async (nextData) => {
    if (spinningRef.current || savingRef.current) return false;
    savingRef.current = true;
    setSaving(true);
    setStatus({ type: "saving", message: "Saving…" });
    try {
      const result = await saveOptions(localStorage, navigator.locks, baseline.current, nextData);
      if (result.conflict) {
        savingRef.current = false;
        sync();
        setStatus({ type: "conflict", message: "Another tab changed this list. Your edit was not saved. Review the latest options and try again." });
        return false;
      }
      baseline.current = result.raw;
      setData(nextData);
      setRevision((value) => value + 1);
      setStatus({ type: "saved", message: "Saved in this browser" });
      return true;
    } catch {
      setStatus({ type: "error", message: navigator.locks
        ? "Changes could not be saved in this browser. Your edit was not applied; entered text is still available. Please try again."
        : "Saving is unavailable in this browser. Your edit was not applied. Open this site over HTTPS or localhost using a browser that supports Web Locks." });
      return false;
    } finally {
      savingRef.current = false;
      setSaving(false);
      if (pendingSync.current) sync();
    }
  };

  return { data, status, spinning, saving, revision, onSpinningChange, updateOptions };
}
