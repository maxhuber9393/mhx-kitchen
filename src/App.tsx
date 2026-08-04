import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Scan from "./pages/Scan";
import Favorites from "./pages/Favorites";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/scan" element={<Scan />} />
        <Route path="/favorites" element={<Favorites />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;