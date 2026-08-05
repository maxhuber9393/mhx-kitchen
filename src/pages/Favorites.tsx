import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { Link } from 'react-router-dom'

interface Photo {
  id: string
  image_url: string
  folder?: string
  folder_name?: string
  is_favorite?: boolean
}

export default function Favorites() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    fetchFavorites()
  }, [])

  const fetchFavorites = async () => {
    if (!supabase) return
    setLoading(true)
    const { data, error } = await supabase
      .from('photos')
      .select('*')
      .eq('is_favorite', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Fehler beim Laden der Favoriten:', error)
    } else {
      setPhotos(data || [])
    }
    setLoading(false)
  }

  const removeFavorite = async (photo: Photo, e: React.MouseEvent) => {
    e.stopPropagation()
    // Sofort aus der Ansicht entfernen
    setPhotos(prev => prev.filter(p => p.id !== photo.id))

    if (supabase) {
      await supabase
        .from('photos')
        .update({ is_favorite: false })
        .eq('id', photo.id)
    }
  }

  return (
    <div style={{ padding: '20px', minHeight: '100vh', backgroundColor: '#0f172a', color: 'white', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <button style={{ padding: '8px 14px', backgroundColor: '#1e293b', color: 'white', border: '1px solid #334155', borderRadius: '10px', cursor: 'pointer' }}>
            ← Zurück
          </button>
        </Link>
        <h2 style={{ margin: 0, fontSize: '20px' }}>⭐ Meine Favoriten</h2>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>Lade Favoriten... ⏳</div>
      ) : photos.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
          <p style={{ fontSize: '48px', margin: '0 0 16px 0' }}>⭐</p>
          <p style={{ fontSize: '16px', margin: 0 }}>Noch keine Favoriten vorhanden.</p>
          <p style={{ fontSize: '13px', color: '#64748b', marginTop: '8px' }}>Markiere im Archiv Bilder mit dem Stern-Symbol!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
          {photos.map(photo => (
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
                alt="Favorit"
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
              />

              {/* Stern zum Entfernen aus den Favoriten */}
              <button
                onClick={(e) => removeFavorite(photo, e)}
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  backgroundColor: '#f59e0b',
                  border: '2px solid #fbbf24',
                  borderRadius: '50%',
                  width: '38px',
                  height: '38px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '20px',
                  color: '#ffffff',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
                  backdropFilter: 'blur(4px)'
                }}
              >
                ★
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Vollbild-Ansicht */}
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