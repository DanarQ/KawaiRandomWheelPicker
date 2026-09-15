import { useCallback, useEffect, useRef, useState } from "react";
import { parseOptions, saveOptions, STORAGE_KEY } from "../optionStorage";

export default function useStoredOptions(defaults) {
  const [initial] = useState(() => {
    let raw = null;
    try {
      raw = localStorage.getItem(STORAGE_KEY);
      return { raw, data: parseOptions(raw, defaults), warning: "" };
    } catch {
      return { raw, data: defaults, warning: "Saved options could not be loaded. Showing the default list. Your saved data has not been overwritten." };
    }
  });
  const [data, setData] = useState(initial.data);
  const [warning, setWarning] = useState(initial.warning);
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
      setWarning("Options updated from another tab. Results and cycle have been reset.");
    } catch {
      setWarning("Options from another tab could not be loaded. Your current list has been kept.");
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
    try {
      const result = await saveOptions(localStorage, navigator.locks, baseline.current, nextData);
      if (result.conflict) {
        savingRef.current = false;
        sync();
        setWarning("The list changed in another tab. Your edit was not saved. Review the updated list and try again.");
        return false;
      }
      baseline.current = result.raw;
      setData(nextData);
      setRevision((value) => value + 1);
      setWarning("");
      return true;
    } catch {
      setWarning(navigator.locks
        ? "Changes could not be saved in this browser. Your edit was not applied; entered text is still available. Please try again."
        : "Saving is unavailable in this browser. Your edit was not applied. Open this site over HTTPS or localhost using a browser that supports Web Locks.");
      return false;
    } finally {
      savingRef.current = false;
      setSaving(false);
      if (pendingSync.current) sync();
    }
  };

  return { data, warning, spinning, saving, revision, onSpinningChange, updateOptions };
}
