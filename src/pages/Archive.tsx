import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { Link } from 'react-router-dom'

interface Photo {
  id: string
  image_url: string
  folder_name: string
  created_at?: string
  is_favorite?: boolean
}

export default function Archive() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    fetchPhotos()
  }, [])

  const fetchPhotos = async () => {
    if (!supabase) return
    setLoading(true)
    const { data, error } = await supabase
      .from('photos')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Fehler beim Laden:', error)
    } else {
      setPhotos(data || [])
    }
    setLoading(false)
  }

  // ⭐ Favoriten-Status umschalten & in Supabase speichern
  const toggleFavorite = async (photo: Photo, e: React.MouseEvent) => {
    e.stopPropagation() // Verhindert, dass das Foto-Modal geöffnet wird
    if (!supabase) return

    const newFavoriteStatus = !photo.is_favorite

    // 1. Zuverlässig im lokalen Zustand aktualisieren (Sofortiges Feedback)
    setPhotos(prevPhotos =>
      prevPhotos.map(p =>
        p.id === photo.id ? { ...p, is_favorite: newFavoriteStatus } : p
      )
    )

    // 2. In Supabase Datenbank speichern
    const { error } = await supabase
      .from('photos')
      .update({ is_favorite: newFavoriteStatus })
      .eq('id', photo.id)

    if (error) {
      console.error('Fehler beim Speichern des Favoriten-Status:', error)
      // Bei Fehler den Zustand zurückrollen
      setPhotos(prevPhotos =>
        prevPhotos.map(p =>
          p.id === photo.id ? { ...p, is_favorite: photo.is_favorite } : p
        )
      )
    }
  }

  const folders = Array.from(new Set(photos.map(p => p.folder_name)))
  const filteredPhotos = selectedFolder
    ? photos.filter(p => p.folder_name === selectedFolder)
    : photos

  return (
    <div style={{ padding: '20px', minHeight: '100vh', backgroundColor: '#0f172a', color: 'white', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <button style={{ padding: '8px 14px', backgroundColor: '#1e293b', color: 'white', border: '1px solid #334155', borderRadius: '10px', cursor: 'pointer' }}>
            ← Zurück
          </button>
        </Link>
        <h2 style={{ margin: 0, fontSize: '20px' }}>📁 Mein Archiv</h2>
      </div>

      {/* Ordner-Filter */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '16px' }}>
        <button
          onClick={() => setSelectedFolder(null)}
          style={{
            padding: '8px 14px',
            borderRadius: '20px',
            border: 'none',
            backgroundColor: selectedFolder === null ? '#3b82f6' : '#1e293b',
            color: 'white',
            fontWeight: selectedFolder === null ? 'bold' : 'normal',
            cursor: 'pointer',
            whiteSpace: 'nowrap'
          }}
        >
          Alle ({photos.length})
        </button>
        {folders.map(folder => (
          <button
            key={folder}
            onClick={() => setSelectedFolder(folder)}
            style={{
              padding: '8px 14px',
              borderRadius: '20px',
              border: 'none',
              backgroundColor: selectedFolder === folder ? '#3b82f6' : '#1e293b',
              color: 'white',
              fontWeight: selectedFolder === folder ? 'bold' : 'normal',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {folder}
          </button>
        ))}
      </div>

      {/* Galerie */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>Lade Archiv... ⏳</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
          {filteredPhotos.map(photo => (
            <div
              key={photo.id}
              onClick={() => setSelectedPhoto(photo.image_url)}
              style={{
                position: 'relative',
                paddingTop: '100%',
                borderRadius: '14px',
                overflow: 'hidden',
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                cursor: 'pointer'
              }}
            >
              <img
                src={photo.image_url}
                alt={photo.folder_name}
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
              />

              {/* 🌟 Gut sichtbarer ⭐-Button oben rechts */}
              <button
                onClick={(e) => toggleFavorite(photo, e)}
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  backgroundColor: photo.is_favorite ? 'rgba(245, 158, 11, 0.95)' : 'rgba(15, 23, 42, 0.75)',
                  border: photo.is_favorite ? '2px solid #fbbf24' : '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '50%',
                  width: '38px',
                  height: '38px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '20px',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.4)',
                  backdropFilter: 'blur(4px)',
                  transition: 'all 0.2s ease'
                }}
                title={photo.is_favorite ? 'Aus Favoriten entfernen' : 'Zu Favoriten hinzufügen'}
              >
                {photo.is_favorite ? '⭐' : '☆'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox / Vollbild-Modal */}
      {selectedPhoto && (
        <div
          onClick={() => setSelectedPhoto(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
        >
          <img src={selectedPhoto} alt="Vollbild" style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: '12px' }} />
        </div>
      )}

    </div>
  )
}