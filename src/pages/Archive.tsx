import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

interface PhotoItem {
  id: string
  url: string
  category: string
  favorite?: boolean
  deletedAt?: string
}

const DEFAULT_FOLDERS = [
  'Hauptspeisen',
  'Desserts',
  'Vorspeisen',
  'Snacks',
  'Getränke',
  'Sonstiges'
]

export default function Archive() {
  const [photos, setPhotos] = useState<PhotoItem[]>([])
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)

  useEffect(() => {
    const saved = localStorage.getItem('mhx_archive_photos')
    if (saved) {
      setPhotos(JSON.parse(saved))
    }
  }, [])

  // Foto in den Papierkorb verschieben
  const handleDelete = (photoToDelete: PhotoItem) => {
    const updatedArchive = photos.filter(item => item.id !== photoToDelete.id)
    setPhotos(updatedArchive)
    localStorage.setItem('mhx_archive_photos', JSON.stringify(updatedArchive))

    const savedTrash = localStorage.getItem('mhx_trash_photos')
    const currentTrash: PhotoItem[] = savedTrash ? JSON.parse(savedTrash) : []

    const photoForTrash = {
      ...photoToDelete,
      deletedAt: new Date().toISOString()
    }

    const updatedTrash = [...currentTrash, photoForTrash]
    localStorage.setItem('mhx_trash_photos', JSON.stringify(updatedTrash))
  }

  // Favorit umschalten (Stern erst gelb bei Klick)
  const toggleFavorite = (id: string) => {
    const updated = photos.map(photo => {
      if (photo.id === id) {
        return { ...photo, favorite: !photo.favorite }
      }
      return photo
    })
    setPhotos(updated)
    localStorage.setItem('mhx_archive_photos', JSON.stringify(updated))
  }

  // Anzahl Fotos pro Ordner berechnen
  const getPhotoCount = (folderName: string) => {
    return photos.filter(p => p.category === folderName).length
  }

  // Fotos des aktuell geöffneten Ordners
  const folderPhotos = selectedFolder 
    ? photos.filter(p => p.category === selectedFolder)
    : []

  return (
    <div style={{ padding: '24px 16px', minHeight: '100vh', backgroundColor: '#0f172a', color: 'white', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        {selectedFolder ? (
          <button 
            onClick={() => setSelectedFolder(null)}
            style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            ← Zurück zu Ordnern
          </button>
        ) : (
          <Link to="/" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '16px' }}>← Startseite</Link>
        )}
        <h1 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          📂 {selectedFolder ? selectedFolder : 'Mein Archiv'}
        </h1>
        <div style={{ width: '60px' }}></div>
      </div>

      {/* ANSICHT 1: Ordner-Kacheln (Wie auf deinem Screenshot) */}
      {!selectedFolder && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
          {DEFAULT_FOLDERS.map(folderName => (
            <div
              key={folderName}
              onClick={() => setSelectedFolder(folderName)}
              style={{
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '12px',
                padding: '20px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                transition: 'transform 0.1s ease'
              }}
            >
              <div style={{ fontSize: '28px' }}>📁</div>
              <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#f8fafc' }}>{folderName}</div>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>{getPhotoCount(folderName)} Fotos</div>
            </div>
          ))}
        </div>
      )}

      {/* ANSICHT 2: Fotos im geöffneten Ordner */}
      {selectedFolder && (
        <div>
          {folderPhotos.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#64748b', marginTop: '60px' }}>
              <p style={{ fontSize: '48px', marginBottom: '8px' }}>📷</p>
              <p>Keine Fotos im Ordner "{selectedFolder}".</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '16px' }}>
              {folderPhotos.map(photo => (
                <div key={photo.id} style={{ backgroundColor: '#1e293b', borderRadius: '12px', overflow: 'hidden', border: '1px solid #334155' }}>
                  <img src={photo.url} alt={photo.category} style={{ width: '100%', height: '140px', objectFit: 'cover' }} />
                  
                  <div style={{ padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button
                      onClick={() => toggleFavorite(photo.id)}
                      style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', padding: 0, color: photo.favorite ? '#f59e0b' : '#64748b' }}
                    >
                      {photo.favorite ? '⭐' : '☆'}
                    </button>

                    <button
                      onClick={() => handleDelete(photo)}
                      style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}
                    >
                      🗑️ Löschen
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}