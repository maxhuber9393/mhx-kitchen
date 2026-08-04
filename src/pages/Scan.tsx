import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

function Scan() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [image, setImage] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const openCamera = () => {
    fileInputRef.current?.click();
  };

  const handleImage = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setImage(URL.createObjectURL(file));
    setMessage("Text wird erkannt...");

    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setMessage(data.text);
      } else {
        setMessage(data.error || "OCR fehlgeschlagen");
      }
    } catch (error) {
      setMessage("Serverfehler");
    }
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
        <img
          src={image}
          alt="Rezept"
          style={{
            width: "100%",
            maxWidth: "350px",
            marginTop: "20px",
            borderRadius: "20px",
          }}
        />
      )}

      <pre
        style={{
          marginTop: "20px",
          whiteSpace: "pre-wrap",
          textAlign: "left",
          background: "#1e293b",
          padding: "15px",
          borderRadius: "10px",
          color: "white",
        }}
      >
        {message}
      </pre>

      <button
        onClick={() => navigate("/")}
        style={{
          marginTop: "20px",
          padding: "12px 30px",
          borderRadius: "12px",
        }}
      >
        ← Zurück
      </button>
    </div>
  );
}

export default Scan;