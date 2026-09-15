import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume1, Volume2, VolumeX } from "lucide-react";
import bobadate from "../assets/bobadate.mp3";
import { loadMusicPreferences, MUSIC_STORAGE_KEY, startMusicPlayback } from "../musicPlayback";

function MusicPlayer() {
  const [initial] = useState(() => {
    try { return loadMusicPreferences(localStorage); }
    catch { return { enabled: true, volume: 0.5 }; }
  });
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(initial.volume);
  const [showSlider, setShowSlider] = useState(false);
  const audioRef = useRef(null);
  const volumeRef = useRef(null);
  const volumeButtonRef = useRef(null);
  const playbackRef = useRef(null);

  useEffect(() => {
    if (!showSlider) return;
    const handlePointer = (event) => {
      if (!volumeRef.current?.contains(event.target)) setShowSlider(false);
    };
    const handleKey = (event) => {
      if (event.key === "Escape") {
        setShowSlider(false);
        volumeButtonRef.current?.focus();
      }
    };
    document.addEventListener("click", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("click", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [showSlider]);

  useEffect(() => {
    const audio = audioRef.current;
    const playback = startMusicPlayback(audio, document, initial, (preferences) => {
      try { localStorage.setItem(MUSIC_STORAGE_KEY, JSON.stringify(preferences)); }
      catch { /* Music controls still work when preference storage is unavailable. */ }
    });
    playbackRef.current = playback;
    return () => {
      playback.destroy();
      playbackRef.current = null;
    };
  }, [initial]);

  const VolumeIcon = volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  return (
    <>
      <audio ref={audioRef} src={bobadate} loop preload="auto"
        onPlaying={() => setPlaying(true)} onPause={() => setPlaying(false)} onError={() => setPlaying(false)} />

      <div className="music-player">
        <span className="music-label">♪ bobadate</span>

        <button
          className="music-btn"
          data-music-toggle
          onClick={() => playbackRef.current?.toggle()}
          title={playing ? "Pause" : "Play"}
        >
          {playing ? (
            <Pause size={16} strokeWidth={2.5} />
          ) : (
            <Play size={16} strokeWidth={2.5} />
          )}
        </button>

        <div className="music-volume-wrapper" ref={volumeRef}>
          <button
            ref={volumeButtonRef}
            className="music-btn"
            aria-expanded={showSlider}
            aria-controls="volume-popup"
            onClick={() => setShowSlider((s) => !s)}
            title="Volume"
          >
            <VolumeIcon size={16} strokeWidth={2.5} />
          </button>
          {showSlider && (
            <div className="music-slider-popup" id="volume-popup">
              <label htmlFor="music-volume">Music volume <span>{Math.round(volume * 100)}%</span></label>
              <input
                id="music-volume"
                className="music-slider"
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={volume}
                onChange={(e) => {
                  const next = Number(e.target.value);
                  setVolume(next);
                  playbackRef.current?.setVolume(next);
                }}
              />
            </div>
          )}

        </div>
      </div>
    </>
  );
}

export default MusicPlayer;
