import { useNavigate } from "react-router-dom";

function Favorites() {
  const navigate = useNavigate();

  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  return (
    <div
      style={{
        background: "#0f172a",
        minHeight: "100vh",
        color: "white",
        padding: "20px",
      }}
    >
      <h1
        style={{
          textAlign: "center",
          marginBottom: "30px",
        }}
      >
        ❤️ Favoriten
      </h1>

      {letters.map((letter) => (
        <div
          key={letter}
          style={{
            background: "#1e293b",
            padding: "18px",
            borderRadius: "14px",
            marginBottom: "12px",
            fontSize: "22px",
            cursor: "pointer",
          }}
        >
          📁 {letter}
        </div>
      ))}

      <button
        onClick={() => navigate("/")}
        style={{
          marginTop: "25px",
          width: "100%",
          padding: "15px",
          borderRadius: "14px",
          border: "none",
          fontSize: "18px",
          cursor: "pointer",
        }}
      >
        ← Zurück
      </button>
    </div>
  );
}

export default Favorites;