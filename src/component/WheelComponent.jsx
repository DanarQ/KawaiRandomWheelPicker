import { useState } from "react";
import { Wheel } from "react-custom-roulette";
import { Ghost, Cat } from "react-kawaii";
import useSfx from "../hooks/useSfx";
import clickSfx from "../assets/sfx/click.mp3";
import spinEndSfx from "../assets/sfx/spin-end.mp3";
import Meowsfx from "../assets/sfx/meow.mp3";

function WheelComponent({ data }) {
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  const [result, setResult] = useState(null);

  const playClick = useSfx(clickSfx);
  const playSpinEnd = useSfx(spinEndSfx);
  const playMeow = useSfx(Meowsfx);

  const handleSpinClick = () => {
    if (mustSpin || data.length < 2) return;
    playClick();
    const newPrizeNumber = Math.floor(Math.random() * data.length);
    setPrizeNumber(newPrizeNumber);
    setMustSpin(true);
    setResult(null);
  };

  const handleStopSpinning = () => {
    setMustSpin(false);
    setResult(data[prizeNumber].option);
    playSpinEnd();
    playMeow();
  };

  return (
    <div className="wheel-section">
      <div className="wheel-wrapper">
        {data.length >= 2 ? (
          <>
            <Wheel
              mustStartSpinning={mustSpin}
              prizeNumber={prizeNumber}
              data={data}
              backgroundColors={["#ffb3c6", "#c7ceea"]}
              textColors={["#5c3d5e"]}
              onStopSpinning={handleStopSpinning}
              outerBorderColor="#f48fb1"
              outerBorderWidth={6}
              innerBorderColor="#f8bbd0"
              innerBorderWidth={3}
              radiusLineColor="#fce4ec"
              radiusLineWidth={2}
              fontSize={15}
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

      <button
        className="spin-btn"
        onClick={handleSpinClick}
        disabled={mustSpin || data.length < 2}
      >
        {mustSpin ? "Spinning..." : "SPIN! (●'◡'●)"}
      </button>

      {result && (
        <div className="result-card">
          <Ghost size={72} mood="blissful" color="#ffc8dd" />
          <div className="result-text">
            <span className="result-label">The wheel chose...</span>
            <span className="result-value">{result}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default WheelComponent;
