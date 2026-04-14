import { useState } from "react";
import { Planet, IceCream } from "react-kawaii";
import WheelComponent from "./component/WheelComponent";
import OptionForm from "./component/OptionForm";
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
  const [data, setData] = useState(DEFAULT_DATA);

  return (
    <div className="app">
      <header className="app-header">
        <Planet size={64} mood="blissful" color="#FDA7DC" />
        <h1 className="app-title"> Wheel Picker</h1>
        <IceCream size={64} mood="blissful" color="#a78bfa" />
      </header>
      <main className="app-main">
        <WheelComponent data={data} />
        <OptionForm data={data} setData={setData} />
      </main>
    </div>
  );
}

export default App;
