import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume1, Volume2, VolumeX } from "lucide-react";
import bobadate from "../assets/bobadate.mp3";

function MusicPlayer() {
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [showSlider, setShowSlider] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.play().catch(() => setPlaying(false));
    } else {
      audio.pause();
    }
  }, [playing]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
    audio.muted = volume === 0;
  }, [volume]);

  const VolumeIcon = volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  return (
    <>
      <audio ref={audioRef} src={bobadate} loop preload="auto" />

      <div className="music-player">
        <span className="music-label">♪ bobadate</span>

        <button
          className="music-btn"
          onClick={() => setPlaying((p) => !p)}
          title={playing ? "Pause" : "Play"}
        >
          {playing ? (
            <Pause size={16} strokeWidth={2.5} />
          ) : (
            <Play size={16} strokeWidth={2.5} />
          )}
        </button>

        <div className="music-volume-wrapper">
          {showSlider && (
            <div className="music-slider-popup">
              <input
                className="music-slider"
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
              />
            </div>
          )}
          <button
            className="music-btn"
            onClick={() => setShowSlider((s) => !s)}
            title="Volume"
          >
            <VolumeIcon size={16} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </>
  );
}

export default MusicPlayer;
