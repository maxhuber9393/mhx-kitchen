import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="app">
      <h1>MHX Kitchen</h1>

      <p className="subtitle">
        Archiviere deine Rezeptbilder einfach und übersichtlich.
      </p>

      <button
        className="bigScanButton"
        onClick={() => navigate("/scan")}
      >
        📸
        <br />
        BILD ARCHIVIEREN
      </button>

      <div
        className="menuCard"
        onClick={() => alert("Kommt als Nächstes")}
        style={{ cursor: "pointer" }}
      >
        📚 Meine Rezepte
      </div>

      <div
        className="menuCard"
        onClick={() => navigate("/favorites")}
        style={{ cursor: "pointer" }}
      >
        ❤️ Favoriten
      </div>

      <div
        className="menuCard"
        onClick={() => alert("Einstellungen kommen später")}
        style={{ cursor: "pointer" }}
      >
        ⚙️ Einstellungen
      </div>
    </div>
  );
}

export default Home;