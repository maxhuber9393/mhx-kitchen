import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

function Scan() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [image, setImage] = useState<string | null>(null);

  const openCamera = () => {
    fileInputRef.current?.click();
  };

  const handleImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const imageUrl = URL.createObjectURL(file);
    setImage(imageUrl);
  };

  return (
    <div
      style={{
        background: "#0f172a",
        color: "white",
        minHeight: "100vh",
        padding: "20px",
        textAlign: "center",
      }}
    >
      <h1>Rezept scannen</h1>

      <button
        onClick={openCamera}
        style={{
          background: "#22c55e",
          color: "white",
          border: "none",
          borderRadius: "20px",
          padding: "20px 40px",
          fontSize: "22px",
          cursor: "pointer",
          marginTop: "20px",
        }}
      >
        📷 Kamera öffnen
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: "none" }}
        onChange={handleImage}
      />

      {image && (
        <div style={{ marginTop: "30px" }}>
          <img
            src={image}
            alt="Rezept"
            style={{
              width: "100%",
              maxWidth: "400px",
              borderRadius: "20px",
            }}
          />
        </div>
      )}

      <button
        onClick={() => navigate("/")}
        style={{
          marginTop: "30px",
          padding: "12px 30px",
          borderRadius: "12px",
          cursor: "pointer",
        }}
      >
        ← Zurück
      </button>
    </div>
  );
}

export default Scan;