import { useState } from "react";
import { Cat } from "react-kawaii";
import useSfx from "../hooks/useSfx";
import clickSfx from "../assets/sfx/click.mp3";
import { optionKey } from "../wheelLogic";

const PRESET_COLORS = [
  "#ffb3c6",
  "#ffdac1",
  "#b5ead7",
  "#c7ceea",
  "#ffd6ff",
  "#caffbf",
  "#fdffb6",
  "#a0c4ff",
];

function OptionForm({ data, setData, disabled }) {
  const [inputText, setInputText] = useState("");
  const [inputColor, setInputColor] = useState("#ffb3c6");

  const playClick = useSfx(clickSfx);
  const duplicate = inputText.trim() && data.some((item) => optionKey(item.option) === optionKey(inputText));
  const hasDuplicates = new Set(data.map((item) => optionKey(item.option))).size !== data.length;

  const handleAdd = async () => {
    const trimmed = inputText.trim();
    if (disabled || !trimmed || duplicate) return;
    playClick();
    const saved = await setData([
      ...data,
      {
        option: trimmed,
        style: { backgroundColor: inputColor, textColor: "#5c3d5e" },
      },
    ]);
    if (saved) setInputText("");
  };

  const handleRemove = (index) => {
    if (disabled) return;
    playClick();
    setData(data.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleAdd();
  };

  return (
    <div className="option-form">
      <div className="form-header">
        <Cat size={60} mood="happy" color="#ffc8dd" />
        <h2 className="form-title">Options</h2>
      </div>

      <fieldset className="option-controls" disabled={disabled}>
        <div className="form-input-row">
          <div className="input-wrapper">
            <input
              className="option-input"
              type="text"
              placeholder="Enter option..."
              aria-label="Option name"
              aria-invalid={Boolean(duplicate)}
              aria-describedby={duplicate ? "duplicate-error" : undefined}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              maxLength={30}
            />
            <span className={`char-counter ${inputText.length >= 28 ? "char-counter--warn" : ""}`}>
              {inputText.length}/30
            </span>
          </div>
          <input
            className="color-input"
            type="color"
            value={inputColor}
            onChange={(e) => setInputColor(e.target.value)}
            title="Pick background color"
          />
          <button className="add-btn" onClick={handleAdd} disabled={!inputText.trim() || Boolean(duplicate)}>
            Add +
          </button>
        </div>
        {duplicate && <p id="duplicate-error" className="form-notice" role="alert">This option already exists.</p>}

        <div className="preset-colors">
          {PRESET_COLORS.map((color) => (
            <button
              key={color}
              className={`preset-color-btn ${inputColor === color ? "active" : ""}`}
              style={{ backgroundColor: color }}
              onClick={() => setInputColor(color)}
              title={color}
            />
          ))}
        </div>
      </fieldset>
      {disabled && <p className="form-notice" role="status">Please wait for spinning or saving to finish before editing.</p>}
      {hasDuplicates && <p className="form-notice" role="alert">Your saved list contains duplicate names. Remove extra entries to give each name an equal chance.</p>}

      <ul className="option-list">
        {data.map((item, index) => (
          <li
            key={index}
            className="option-item"
            style={{ borderLeftColor: item.style.backgroundColor }}
          >
            <span
              className="option-color-dot"
              style={{ backgroundColor: item.style.backgroundColor }}
            />
            <span className="option-number">{index + 1}.</span>
            <span className="option-text">{item.option}</span>
            <button className="remove-btn" disabled={disabled} aria-label={`Remove ${item.option}`} onClick={() => handleRemove(index)}>
              ✕
            </button>
          </li>
        ))}
        {data.length === 0 && (
          <li className="option-empty">No options yet~ (◕‿◕)</li>
        )}
      </ul>
    </div>
  );
}

export default OptionForm;
