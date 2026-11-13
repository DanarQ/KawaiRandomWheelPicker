import { sfxPlayer } from "../sfxPlayback";

/**
 * useSfx — plays a sound effect on demand.
 * @param {string} src - imported audio file (e.g. import click from "../assets/sfx/click.mp3")
 * @returns {() => void} play function
 */
function useSfx(src) {
  const play = () => {
    // Keep playback failures from interrupting the wheel or option editing.
    sfxPlayer.play(src).catch(() => {});
  };

  return play;
}

export default useSfx;
