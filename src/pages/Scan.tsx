import { useNavigate } from "react-router-dom";

function Scan() {
  const navigate = useNavigate();

  return (
    <div className="app">
      <h1>📷 Rezept scannen</h1>

      <p>
        Hier wird gleich die Kamera geöffnet und dein Rezept fotografiert.
      </p>

      <button
        className="scanButton"
        onClick={() => alert("OCR kommt im nächsten Schritt")}
      >
        📸 Kamera öffnen
      </button>

      <br />
      <br />

      <button
        className="scanButton"
        onClick={() => navigate("/")}
      >
        ← Zurück
      </button>
    </div>
  );
}

export default Scan;