import { useMemo, useRef, useState } from "react";
import { Wheel } from "react-custom-roulette";
import { Ghost, Cat } from "react-kawaii";
import useSfx from "../hooks/useSfx";
import clickSfx from "../assets/sfx/click.mp3";
import spinEndSfx from "../assets/sfx/spin-end.mp3";
import Meowsfx from "../assets/sfx/meow.mp3";
import { optionKey, pickOption } from "../wheelLogic";

const BACKGROUND_COLORS = ["#ffb3c6", "#c7ceea"];
const TEXT_COLORS = ["#5c3d5e"];

function WheelComponent({ data, onSpinningChange, disabled }) {
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [noRepeat, setNoRepeat] = useState(false);
  const [used, setUsed] = useState([]);
  const pendingSpin = useRef(null);

  const playClick = useSfx(clickSfx);
  const playSpinEnd = useSfx(spinEndSfx);
  const playMeow = useSfx(Meowsfx);

  const handleSpinClick = () => {
    if (disabled || pendingSpin.current || data.length < 2) return;
    playClick();
    const selection = pickOption(data, noRepeat ? used : []);
    const winner = data[selection.index].option;
    // Capture the winner at spin start, independently of the animation callback.
    pendingSpin.current = { winner, used: selection.used };
    setPrizeNumber(selection.index);
    onSpinningChange(true);
    setMustSpin(true);
    setResult(null);
  };

  const handleStopSpinning = () => {
    const completed = pendingSpin.current;
    if (!completed) return;
    pendingSpin.current = null;
    setMustSpin(false);
    onSpinningChange(false);
    setResult(completed.winner);
    setHistory((previous) => [completed.winner, ...previous].slice(0, 20));
    // Existing saved duplicates also count as the same name in no-repeat mode.
    setUsed(data.map((_, index) => index).filter((index) =>
      completed.used.includes(index) || optionKey(data[index].option) === optionKey(completed.winner),
    ));
    playSpinEnd();
    playMeow();
  };

  const segments = data.length;
  const maxLen = data.reduce((max, item) => Math.max(max, item.option.length), 0);
  // Score combines text length and segment count (more segments = narrower arc)
  const score = maxLen + segments * 0.8;
  const fontSize = score > 32 ? 8 : score > 24 ? 10 : score > 16 ? 12 : score > 10 ? 13 : 15;
  // Truncate earlier when there are many segments
  const TRUNCATE_AT = segments > 12 ? 10 : segments > 8 ? 13 : segments > 5 ? 16 : 20;
  const numberedLabels = segments > 12 || maxLen > TRUNCATE_AT;
  const wheelData = useMemo(() => data.map((item, index) => ({
    ...item,
    option: numberedLabels ? String(index + 1) : item.option,
  })), [data, numberedLabels]);

  return (
    <div className="wheel-section">
      <div className="wheel-wrapper">
        {data.length >= 2 ? (
          <>
            <Wheel
              mustStartSpinning={mustSpin}
              prizeNumber={prizeNumber}
              data={wheelData}
              backgroundColors={BACKGROUND_COLORS}
              textColors={TEXT_COLORS}
              onStopSpinning={handleStopSpinning}
              outerBorderColor="#f48fb1"
              outerBorderWidth={6}
              innerBorderColor="#f8bbd0"
              innerBorderWidth={3}
              radiusLineColor="#fce4ec"
              radiusLineWidth={2}
              fontSize={numberedLabels ? (segments <= 12 ? 24 : segments <= 30 ? 20 : 14) : fontSize}
              textDistance={numberedLabels ? 85 : 60}
              fontFamily="Nunito"
            />
            <div className="wheel-center">
              <Cat
                size={150}
                mood={mustSpin ? "shocked" : result ? "blissful" : "happy"}
                color="#ffc8dd"
              />
            </div>
          </>
        ) : (
          <div className="wheel-placeholder">
            <Ghost size={120} mood="sad" color="#c7ceea" />
            <p>Add at least 2 options!</p>
          </div>
        )}
      </div>
      {numberedLabels && <p className="wheel-note">Wheel numbers match the full names in Options. Large lists have narrow slices; the full winner appears below.</p>}
      <label className="mode-toggle">
        <input type="checkbox" checked={noRepeat} disabled={mustSpin || disabled} onChange={(event) => {
          setNoRepeat(event.target.checked);
          setUsed([]);
        }} />
        No repeats until every name wins
      </label>
      <p className="wheel-note">{noRepeat
        ? `${new Set(used.map((index) => optionKey(data[index].option))).size} of ${new Set(data.map((item) => optionKey(item.option))).size} names picked. A new cycle starts automatically when complete.`
        : "Every entry has an equal chance on each spin. Repeats are possible."}</p>

      <button
        className="spin-btn"
        onClick={handleSpinClick}
        disabled={disabled || mustSpin || data.length < 2}
      >
        {mustSpin ? "Spinning..." : "SPIN! (●'◡'●)"}
      </button>

      {result && (
        <div className="result-card" role="status" aria-live="polite">
          <Ghost size={72} mood="blissful" color="#ffc8dd" />
          <div className="result-text">
            <span className="result-label">The wheel chose...</span>
            <span className="result-value">{result}</span>
          </div>
        </div>
      )}
      {history.length > 0 && <section className="spin-history" aria-label="Recent results">
        <div className="history-header">
          <h2>Recent results</h2>
          <button type="button" disabled={mustSpin} onClick={() => setHistory([])}>Clear</button>
        </div>
        <ol>{history.map((winner, index) => <li key={index}>{winner}</li>)}</ol>
      </section>}
      <p className="wheel-note">Recent results show the last 20 spins, newest first. Editing options or refreshing resets results, mode, and cycle.</p>
    </div>
  );
}

export default WheelComponent;
