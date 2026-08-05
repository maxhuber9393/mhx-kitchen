import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { Link } from 'react-router-dom'

interface Photo {
  id: string
  image_url: string
  folder?: string
  folder_name?: string
  category?: string
  is_favorite?: boolean
}

export default function Favorites() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)
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
      console.error('Fehler beim Laden:', error)
    } else {
      setPhotos(data || [])
    }
    setLoading(false)
  }

  const removeFavorite = async (photo: Photo, e: React.MouseEvent) => {
    e.stopPropagation()
    setPhotos(prev => prev.filter(p => p.id !== photo.id))

    if (supabase) {
      await supabase.from('photos').update({ is_favorite: false }).eq('id', photo.id)
    }
  }

  const handleShare = (photoUrl: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (navigator.share) {
      navigator.share({ title: 'MHX-KITCHEN Foto', url: photoUrl }).catch(() => {})
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(photoUrl)}`, '_blank')
    }
  }

  const handleOpenImage = (photoUrl: string, e: React.MouseEvent) => {
    e.stopPropagation()
    window.open(photoUrl, '_blank')
  }

  return (
    <div style={{ padding: '20px', minHeight: '100vh', backgroundColor: '#0f172a', color: 'white', fontFamily: 'system-ui, sans-serif' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '25px' }}>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <button style={{ padding: '8px 14px', backgroundColor: '#1e293b', color: 'white', border: '1px solid #334155', borderRadius: '10px', cursor: 'pointer', fontSize: '14px' }}>
            ← Zurück
          </button>
        </Link>
        <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>⭐ Meine Favoriten</h2>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px 0', color: '#94a3b8' }}>Lade Favoriten... ⏳</div>
      ) : photos.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: '#1e293b', borderRadius: '16px', border: '1px dashed #334155' }}>
          <p style={{ fontSize: '48px', margin: '0 0 16px 0' }}>⭐</p>
          <p style={{ fontSize: '16px', margin: 0, fontWeight: 'bold' }}>Noch keine Favoriten vorhanden</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
          {photos.map(photo => (
            <div
              key={photo.id}
              onClick={() => setSelectedPhoto(photo)}
              style={{ position: 'relative', paddingTop: '100%', borderRadius: '16px', overflow: 'hidden', backgroundColor: '#1e293b', border: '1px solid #334155', cursor: 'pointer' }}
            >
              <img src={photo.image_url} alt="Favorit" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />

              <button
                onClick={(e) => removeFavorite(photo, e)}
                style={{ position: 'absolute', top: '8px', right: '8px', backgroundColor: '#f59e0b', border: '2px solid #fbbf24', borderRadius: '50%', width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '20px', color: '#ffffff', zIndex: 10 }}
              >
                ★
              </button>
            </div>
          ))}
        </div>
      )}

      {selectedPhoto && (
        <div
          onClick={() => setSelectedPhoto(null)}
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.92)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}
        >
          <img src={selectedPhoto.image_url} alt="Vollbild" style={{ maxWidth: '100%', maxHeight: '70vh', borderRadius: '16px', objectFit: 'contain' }} />

          <div onClick={(e) => e.stopPropagation()} style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
            <button
              onClick={(e) => handleShare(selectedPhoto.image_url, e)}
              style={{ backgroundColor: '#25D366', color: 'white', border: 'none', borderRadius: '20px', padding: '10px 18px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              🔗 Teilen / WhatsApp
            </button>

            <button
              onClick={(e) => handleOpenImage(selectedPhoto.image_url, e)}
              style={{ backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '20px', padding: '10px 18px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              💾 Bild öffnen
            </button>
          </div>
        </div>
      )}

    </div>
  )
}