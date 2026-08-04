import { useState } from 'react'

export default function Scan() {
  const [image, setImage] = useState<string | null>(null)
  const [showFolders, setShowFolders] = useState(false)
  const [folders, setFolders] = useState(['Hauptspeisen', 'Desserts', 'Snacks', 'Getränke'])
  const [showNewFolderInput, setShowNewFolderInput] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')

  // Wenn ein Foto gemacht wurde
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const imageUrl = URL.createObjectURL(file)
      setImage(imageUrl)
      setShowFolders(true)
    }
  }

  // Foto im Ordner speichern
  const saveToFolder = (folderName: string) => {
    alert(`Foto wurde im Ordner "${folderName}" gespeichert!`)
    setImage(null)
    setShowFolders(false)
    setShowNewFolderInput(false)
  }

  // Neuen Ordner hinzufügen
  const handleAddFolder = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newFolderName.trim()) return
    setFolders([...folders, newFolderName])
    setNewFolderName('')
    setShowNewFolderInput(false)
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
          color: '#333',
          maxHeight: '80vh',
          overflowY: 'auto'
        }}>
          <h3>In welchem Ordner speichern?</h3>

          {/* Ordnerliste */}
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
                  fontWeight: 'bold',
                  color: '#007bff'
                }}
              >
                📁 {folder}
              </button>
            ))}

            {/* Eingabefeld oder Button für neuen Ordner */}
            {showNewFolderInput ? (
              <form onSubmit={handleAddFolder} style={{ marginTop: '10px', display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="Ordnername..."
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid #ccc',
                    fontSize: '16px'
                  }}
                />
                <button
                  type="submit"
                  style={{
                    padding: '10px 15px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 'bold'
                  }}
                >
                  OK
                </button>
              </form>
            ) : (
              <button
                onClick={() => setShowNewFolderInput(true)}
                style={{
                  padding: '12px',
                  borderRadius: '8px',
                  border: '2px dashed #28a745',
                  backgroundColor: '#eafaf1',
                  color: '#28a745',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  marginTop: '10px',
                  cursor: 'pointer'
                }}
              >
                ➕ Neuer Ordner erstellen
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}