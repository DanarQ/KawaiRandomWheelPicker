import { useEffect, useRef, useState } from "react";
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

function OptionForm({ data, setData, disabled, busyLabel, status }) {
  const [inputText, setInputText] = useState("");
  const [inputColor, setInputColor] = useState("#ffb3c6");
  const inputRef = useRef(null);
  const restoreFocus = useRef(false);

  useEffect(() => {
    if (!disabled && restoreFocus.current) {
      inputRef.current?.focus();
      restoreFocus.current = false;
    }
  }, [disabled, inputText]);

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
    if (saved) {
      restoreFocus.current = true;
      setInputText("");
    }
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
        <Cat size={44} mood="happy" color="#ffc8dd" />
        <h2 className="form-title">Options</h2>
        <span className="option-count">{data.length}</span>
      </div>
      <p className={`save-status save-status--${status.type}`} role={status.type === "error" || status.type === "conflict" ? "alert" : "status"}>
        <span aria-hidden="true" className="status-dot" />{status.message}
      </p>

      <fieldset className="option-controls" disabled={disabled}>
        <label className="input-label" htmlFor="option-name">Add an option</label>
        <div className="form-input-row">
          <div className="input-wrapper">
            <input
              className="option-input"
              ref={inputRef}
              id="option-name"
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
            aria-label="Pick background color"
          />
          <button className="add-btn" onClick={handleAdd} disabled={!inputText.trim() || Boolean(duplicate)}>
            Add +
          </button>
        </div>
        {duplicate && <p id="duplicate-error" className="form-notice" role="alert">This option already exists.</p>}

        <div className="preset-colors" role="group" aria-label="Option color presets">
          {PRESET_COLORS.map((color) => (
            <button
              key={color}
              className={`preset-color-btn ${inputColor === color ? "active" : ""}`}
              style={{ "--swatch": color }}
              aria-label={`Use color ${color}`}
              aria-pressed={inputColor === color}
              onClick={() => setInputColor(color)}
              title={color}
            />
          ))}
        </div>
      </fieldset>
      {disabled && <p className="form-notice" role="status">{busyLabel} Editing will be available shortly.</p>}
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
