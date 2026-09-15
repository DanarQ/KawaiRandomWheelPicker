export const MUSIC_STORAGE_KEY = "kawai-wheel-music-v1";

export function loadMusicPreferences(storage) {
  try {
    const saved = JSON.parse(storage.getItem(MUSIC_STORAGE_KEY));
    return {
      enabled: typeof saved?.enabled === "boolean" ? saved.enabled : true,
      volume: Number.isFinite(saved?.volume) && saved.volume >= 0 && saved.volume <= 1 ? saved.volume : 0.5,
    };
  } catch {
    return { enabled: true, volume: 0.5 };
  }
}

export function startMusicPlayback(audio, events, initial, onPreferences) {
  let preferences = { ...initial };
  let disposed = false;

  const removeRetry = () => {
    events.removeEventListener("click", retry);
    events.removeEventListener("keydown", retry);
  };
  const play = () => {
    if (disposed || !preferences.enabled) return;
    // A blocked or unsupported player stays paused, without changing preference.
    try { audio.play()?.catch(() => {}); } catch { /* Playback is best effort. */ }
  };
  const retry = (event) => {
    if (!event.isTrusted || event.target?.closest?.("[data-music-toggle]")) return;
    if (event.type === "keydown" && ["Tab", "Escape", "Shift", "Control", "Alt", "Meta"].includes(event.key)) return;
    removeRetry();
    play();
  };
  const handlePlaying = () => {
    if (disposed || !preferences.enabled) audio.pause();
    else removeRetry();
  };
  const applyVolume = () => {
    audio.volume = preferences.volume;
    audio.muted = preferences.volume === 0;
  };

  applyVolume();
  audio.addEventListener("playing", handlePlaying);
  if (preferences.enabled) {
    events.addEventListener("click", retry);
    events.addEventListener("keydown", retry);
    play();
  }

  return {
    toggle() {
      removeRetry();
      preferences = { ...preferences, enabled: audio.paused };
      onPreferences(preferences);
      if (preferences.enabled) play();
      else audio.pause();
    },
    setVolume(volume) {
      preferences = { ...preferences, volume };
      applyVolume();
      onPreferences(preferences);
    },
    destroy() {
      disposed = true;
      removeRetry();
      audio.removeEventListener("playing", handlePlaying);
      audio.pause();
    },
  };
}
