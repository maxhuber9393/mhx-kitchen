import { useState } from 'react'

export default function Scan() {
  const [image, setImage] = useState<string | null>(null)
  const [showFolders, setShowFolders] = useState(false)

  // Liste deiner Ordner (später aus Supabase)
  const folders = ['Hauptspeisen', 'Desserts', 'Snacks', 'Getränke']

  // Wenn ein Foto gemacht wurde
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const imageUrl = URL.createObjectURL(file)
      setImage(imageUrl)
      setShowFolders(true) // Fenster für Ordner öffnen
    }
  }

  // Foto im Ordner speichern
  const saveToFolder = (folderName: string) => {
    alert(`Foto wurde im Ordner "${folderName}" gespeichert!`)
    setImage(null)
    setShowFolders(false)
  }

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2>1. Foto machen</h2>

      {/* Button öffnet direkt die Handykamera */}
      <label style={{
        display: 'inline-block',
        padding: '15px 25px',
        backgroundColor: '#007bff',
        color: 'white',
        borderRadius: '10px',
        cursor: 'pointer',
        fontSize: '18px',
        marginTop: '20px'
      }}>
        📷 Kamera öffnen
        <input 
          type="file" 
          accept="image/*" 
          capture="environment" 
          onChange={handleImageChange}
          style={{ display: 'none' }}
        />
      </label>

      {/* Vorschau vom Foto */}
      {image && (
        <div style={{ marginTop: '20px' }}>
          <img src={image} alt="Vorschau" style={{ width: '100%', maxHeight: '300px', borderRadius: '10px', objectFit: 'cover' }} />
        </div>
      )}

      {/* Ordner-Auswahl (Fenster von unten) */}
      {showFolders && (
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: '#fff',
          borderTopLeftRadius: '20px',
          borderTopRightRadius: '20px',
          padding: '20px',
          boxShadow: '0 -5px 15px rgba(0,0,0,0.2)',
          color: '#333'
        }}>
          <h3>In welchem Ordner speichern?</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '15px' }}>
            {folders.map((folder) => (
              <button
                key={folder}
                onClick={() => saveToFolder(folder)}
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #ccc',
                  backgroundColor: '#f8f9fa',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}
              >
                📁 {folder}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}