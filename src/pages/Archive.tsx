import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

interface PhotoItem {
  id: string
  url: string
  category: string
  favorite?: boolean
  deletedAt?: string
}

// Feste Standard-Ordner mit ihren eigenen Symbolen
const DEFAULT_FOLDERS: { [key: string]: string } = {
  'Hauptspeisen': '🍲',
  'Desserts': '🍰',
  'Vorspeisen': '🥗',
  'Snacks': '🍿',
  'Getränke': '🍹',
  'Sonstiges': '📦'
}

const DEFAULT_FOLDER_NAMES = Object.keys(DEFAULT_FOLDERS)

export default function Archive() {
  const [photos, setPhotos] = useState<PhotoItem[]>([])
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
  
  // Zustand für das Umbenennen von Ordnern
  const [editingFolder, setEditingFolder] = useState<string | null>(null)
  const [newFolderName, setNewFolderName] = useState<string>('')

  useEffect(() => {
    const saved = localStorage.getItem('mhx_archive_photos')
    if (saved) {
      setPhotos(JSON.parse(saved))
    }
  }, [])

  // Alle Ordner laden (Standard + custom Ordner)
  const customCategories = photos.map(p => p.category)
  const allFolders = Array.from(new Set([...DEFAULT_FOLDER_NAMES, ...customCategories]))

  // Hilfsfunktion: Gibt das Icon für den Ordner zurück
  const getFolderIcon = (folderName: string) => {
    return DEFAULT_FOLDERS[folderName] || '📂'
  }

  // Ordner umbenennen & alle zugehörigen Fotos aktualisieren
  const handleRenameFolder = (oldFolder: string) => {
    const trimmedName = newFolderName.trim()
    if (!trimmedName || trimmedName === oldFolder) {
      setEditingFolder(null)
      return
    }

    const updatedPhotos = photos.map(photo => {
      if (photo.category === oldFolder) {
        return { ...photo, category: trimmedName }
      }
      return photo
    })

    setPhotos(updatedPhotos)
    localStorage.setItem('mhx_archive_photos', JSON.stringify(updatedPhotos))
    setEditingFolder(null)
    setNewFolderName('')
  }

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
          {selectedFolder ? `${getFolderIcon(selectedFolder)} ${selectedFolder}` : '📂 Mein Archiv'}
        </h1>
        <div style={{ width: '60px' }}></div>
      </div>

      {/* ANSICHT 1: Ordner-Kacheln mit Icons nebeneinander */}
      {!selectedFolder && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px' }}>
          {allFolders.map(folderName => {
            const isDefaultFolder = DEFAULT_FOLDER_NAMES.includes(folderName)

            return (
              <div
                key={folderName}
                style={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ fontSize: '28px', cursor: 'pointer' }} onClick={() => setSelectedFolder(folderName)}>
                    {getFolderIcon(folderName)}
                  </div>
                  {!isDefaultFolder && editingFolder !== folderName && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setEditingFolder(folderName)
                        setNewFolderName(folderName)
                      }}
                      title="Ordner umbenennen"
                      style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '14px', padding: '2px' }}
                    >
                      ✏️
                    </button>
                  )}
                </div>

                {editingFolder === folderName ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
                    <input
                      type="text"
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      autoFocus
                      style={{
                        backgroundColor: '#0f172a',
                        color: 'white',
                        border: '1px solid #3b82f6',
                        borderRadius: '6px',
                        padding: '6px',
                        fontSize: '13px',
                        width: '100%',
                        boxSizing: 'border-box'
                      }}
                    />
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        onClick={() => handleRenameFolder(folderName)}
                        style={{ flex: 1, backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', padding: '4px', fontSize: '11px', cursor: 'pointer' }}
                      >
                        OK
                      </button>
                      <button
                        onClick={() => setEditingFolder(null)}
                        style={{ flex: 1, backgroundColor: '#475569', color: 'white', border: 'none', borderRadius: '4px', padding: '4px', fontSize: '11px', cursor: 'pointer' }}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ) : (
                  <div onClick={() => setSelectedFolder(folderName)} style={{ cursor: 'pointer' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '15px', color: '#f8fafc', wordBreak: 'break-word' }}>{folderName}</div>
                    <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>{getPhotoCount(folderName)} Fotos</div>
                  </div>
                )}
              </div>
            )
          })}
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px' }}>
              {folderPhotos.map(photo => (
                <div key={photo.id} style={{ backgroundColor: '#1e293b', borderRadius: '12px', overflow: 'hidden', border: '1px solid #334155' }}>
                  <img src={photo.url} alt={photo.category} style={{ width: '100%', height: '140px', objectFit: 'cover' }} />
                  
                  <div style={{ padding: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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