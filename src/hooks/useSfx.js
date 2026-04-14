import { useRef } from "react";

/**
 * useSfx — plays a sound effect on demand.
 * @param {string} src - imported audio file (e.g. import click from "../assets/sfx/click.mp3")
 * @returns {() => void} play function
 */
function useSfx(src) {
  const audioRef = useRef(null);

  const play = () => {
    if (!src) return;
    if (!audioRef.current) {
      audioRef.current = new Audio(src);
    }
    // rewind to start so rapid clicks always fire
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(() => {});
  };

  return play;
}

export default useSfx;
