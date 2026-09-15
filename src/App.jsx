import { Planet, IceCream } from "react-kawaii";
import WheelComponent from "./component/WheelComponent";
import OptionForm from "./component/OptionForm";
import MusicPlayer from "./component/MusicPlayer";
import useStoredOptions from "./hooks/useStoredOptions";
import "./App.css";

const DEFAULT_DATA = [
  {
    option: "Pizza",
    style: { backgroundColor: "#ffb3c6", textColor: "#5c3d5e" },
  },
  {
    option: "Burger",
    style: { backgroundColor: "#b5ead7", textColor: "#5c3d5e" },
  },
  {
    option: "Ramen",
    style: { backgroundColor: "#ffdac1", textColor: "#5c3d5e" },
  },
  {
    option: "Nasi Goreng",
    style: { backgroundColor: "#c7ceea", textColor: "#5c3d5e" },
  },
];

function App() {
  const { data, status, spinning, saving, revision, onSpinningChange, updateOptions } = useStoredOptions(DEFAULT_DATA);

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-brand">
          <Planet size={48} mood="blissful" color="#FDA7DC" />
          <h1 className="app-title">Wheel Picker</h1>
          <IceCream size={40} mood="blissful" color="#a78bfa" />
        </div>
        <MusicPlayer />
      </header>
      <main className="app-main">
        <WheelComponent key={revision} data={data} onSpinningChange={onSpinningChange} disabled={saving} />
        <OptionForm data={data} setData={updateOptions} disabled={spinning || saving} busyLabel={spinning ? "Spinning…" : saving ? "Saving…" : ""} status={status} />
      </main>
    </div>
  );
}

export default App;
