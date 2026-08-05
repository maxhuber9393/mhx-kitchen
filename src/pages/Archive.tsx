import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

interface PhotoItem {
  id: string
  url: string
  category: string
  favorite?: boolean
  deletedAt?: string
}

// Feste Standard-Ordner/Kategorien
const DEFAULT_CATEGORIES = ['Alle', 'Hauptspeisen', 'Desserts', 'Vorspeisen', 'Gebäck', 'Getränke', 'Sonstiges']

export default function Archive() {
  const [photos, setPhotos] = useState<PhotoItem[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('Alle')

  useEffect(() => {
    const saved = localStorage.getItem('mhx_archive_photos')
    if (saved) {
      setPhotos(JSON.parse(saved))
    }
  }, [])

  // Foto löschen -> Wandert in den Papierkorb (mhx_trash_photos)
  const handleDelete = (photoToDelete: PhotoItem) => {
    // 1. Aus dem Archiv entfernen
    const updatedArchive = photos.filter(item => item.id !== photoToDelete.id)
    setPhotos(updatedArchive)
    localStorage.setItem('mhx_archive_photos', JSON.stringify(updatedArchive))

    // 2. In den Papierkorb legen (mit Datum für den 30-Tage-Timer)
    const savedTrash = localStorage.getItem('mhx_trash_photos')
    const currentTrash: PhotoItem[] = savedTrash ? JSON.parse(savedTrash) : []

    const photoForTrash = {
      ...photoToDelete,
      deletedAt: new Date().toISOString()
    }

    const updatedTrash = [...currentTrash, photoForTrash]
    localStorage.setItem('mhx_trash_photos', JSON.stringify(updatedTrash))
  }

  // Favoriten-Status umschalten
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

  // Alle Kategorien zusammenstellen (Standard-Ordner + eventuell eigene)
  const customCategories = photos.map(p => p.category)
  const allCategories = Array.from(new Set([...DEFAULT_CATEGORIES, ...customCategories]))

  const filteredPhotos = selectedCategory === 'Alle' 
    ? photos 
    : photos.filter(p => p.category === selectedCategory)

  return (
    <div style={{ padding: '24px 16px', minHeight: '100vh', backgroundColor: '#0f172a', color: 'white', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <Link to="/" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '18px' }}>← Startseite</Link>
        <h1 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>📁 Mein Archiv</h1>
        <div style={{ width: '60px' }}></div>
      </div>

      {/* Kategorien / Ordner Leiste */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '16px', marginBottom: '16px' }}>
        {allCategories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            style={{
              backgroundColor: selectedCategory === cat ? '#3b82f6' : '#1e293b',
              color: 'white',
              border: '1px solid #334155',
              padding: '8px 16px',
              borderRadius: '20px',
              fontSize: '13px',
              whiteSpace: 'nowrap',
              cursor: 'pointer'
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Fotos Raster */}
      {filteredPhotos.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#64748b', marginTop: '60px' }}>
          <p style={{ fontSize: '48px', marginBottom: '8px' }}>📷</p>
          <p>Keine Fotos in dieser Kategorie.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '16px' }}>
          {filteredPhotos.map(photo => (
            <div key={photo.id} style={{ backgroundColor: '#1e293b', borderRadius: '12px', overflow: 'hidden', border: '1px solid #334155', position: 'relative' }}>
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
  )
}