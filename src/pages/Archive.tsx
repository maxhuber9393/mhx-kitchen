import { useState } from 'react'

// Beispiel-Ordner und Bilder
const initialFolders = [
  { name: 'Hauptspeisen', icon: '🍲', count: 0 },
  { name: 'Desserts', icon: '🍰', count: 0 },
  { name: 'Snacks', icon: '🍿', count: 0 },
  { name: 'Getränke', icon: '🍹', count: 0 }
]

export default function Archive() {
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)

  return (
    <div style={{ padding: '20px' }}>
      <h2>📂 Mein Archiv</h2>

      {/* Wenn KEIN Ordner ausgewählt ist: Ordner-Übersicht anzeigen */}
      {!selectedFolder ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '20px' }}>
          {initialFolders.map((folder) => (
            <div
              key={folder.name}
              onClick={() => setSelectedFolder(folder.name)}
              style={{
                backgroundColor: '#f8f9fa',
                border: '1px solid #ddd',
                borderRadius: '12px',
                padding: '20px',
                textAlign: 'center',
                cursor: 'pointer',
                boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
              }}
            >
              <div style={{ fontSize: '32px' }}>{folder.icon}</div>
              <div style={{ fontWeight: 'bold', marginTop: '10px' }}>{folder.name}</div>
            </div>
          ))}
        </div>
      ) : (
        /* Wenn EIN Ordner ausgewählt ist: Bilder anzeigen */
        <div>
          <button
            onClick={() => setSelectedFolder(null)}
            style={{
              padding: '8px 15px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#e0e0e0',
              cursor: 'pointer',
              marginBottom: '20px'
            }}
          >
            ← Zurück zur Übersicht
          </button>

          <h3>Ordner: {selectedFolder}</h3>
          
          <div style={{ 
            padding: '40px 20px', 
            textAlign: 'center', 
            color: '#888', 
            border: '2px dashed #ccc', 
            borderRadius: '10px',
            marginTop: '15px'
          }}>
            📷 Noch keine Fotos in diesem Ordner gespeichert.
          </div>
        </div>
      )}
    </div>
  )
}