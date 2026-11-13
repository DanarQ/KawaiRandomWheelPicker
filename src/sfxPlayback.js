// One context lets delayed effects share the audio unlocked by the Spin gesture.
export function createSfxPlayer({ createContext, fetchAudio }) {
  let context;
  const buffers = new Map();

  const getContext = () => {
    if (!context || context.state === "closed") {
      context = createContext();
      buffers.clear();
    }
    return context;
  };

  const load = (src, audioContext) => {
    if (!buffers.has(src)) {
      const pending = fetchAudio(src)
        .then((bytes) => audioContext.decodeAudioData(bytes))
        .catch((error) => {
          buffers.delete(src);
          throw error;
        });
      buffers.set(src, pending);
    }
    return buffers.get(src);
  };

  const prepare = (sources) => {
    try {
      const audioContext = getContext();
      // Call resume synchronously inside the gesture, before any fetch/await.
      const resumed = audioContext.state === "running"
        ? Promise.resolve() : audioContext.resume();
      const silent = audioContext.createBufferSource();
      silent.buffer = audioContext.createBuffer(1, 1, audioContext.sampleRate);
      silent.connect(audioContext.destination);
      silent.onended = () => silent.disconnect();
      silent.start();
      return Promise.all([resumed, ...sources.map((src) => load(src, audioContext))]);
    } catch (error) {
      return Promise.reject(error);
    }
  };

  const play = async (src) => {
    if (!src) return;
    const audioContext = getContext();
    // Direct click effects can also unlock the shared context.
    const resumed = audioContext.state === "running"
      ? Promise.resolve() : audioContext.resume();
    const [, buffer] = await Promise.all([resumed, load(src, audioContext)]);
    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContext.destination);
    source.onended = () => source.disconnect();
    source.start();
  };

  return { prepare, play };
}

export const sfxPlayer = createSfxPlayer({
  createContext: () => {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    return new AudioContext();
  },
  fetchAudio: async (src) => {
    const response = await fetch(src);
    if (!response.ok) throw new Error(`Unable to load sound: ${response.status}`);
    return response.arrayBuffer();
  },
});
