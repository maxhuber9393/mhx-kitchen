import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabase'

interface Photo {
  id: string
  url: string
  category: string
  favorite: boolean | string
  deleted?: boolean
}

export default function Favorites() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)
  const [isZoomed, setIsZoomed] = useState<boolean>(false)

  const fetchFavorites = async () => {
    // Lädt alle Fotos und filtert exakt auf Favoriten
    const { data, error } = await supabase
      .from('photos')
      .select('*')

    if (!error && data) {
      // Filtert sowohl echte Booleans (true) als auch String ('true') und ignoriert gelöschte Fotos
      const favoritedPhotos = data.filter(p => 
        (p.favorite === true || p.favorite === 'true') && 
        !p.deleted
      )
      setPhotos(favoritedPhotos)
    }
  }

  useEffect(() => {
    fetchFavorites()

    const channel = supabase
      .channel('schema-db-favorites-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'photos' }, () => fetchFavorites())
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  // Favorit entfernen
  const handleRemoveFavorite = async (e: React.MouseEvent, photo: Photo) => {
    e.stopPropagation()
    try {
      const { error } = await supabase
        .from('photos')
        .update({ favorite: false })
        .eq('id', photo.id)

      if (error) throw error
      setSelectedPhoto(null)
      fetchFavorites()
    } catch (err: any) {
      alert('Fehler beim Entfernen: ' + err.message)
    }
  }

  const handleShare = async (photo: Photo) => {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Rezeptbild', url: photo.url })
      } catch (err) {
        console.error(err)
      }
    } else {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(photo.url)}`, '_blank')
    }
  }

  return (
    <div style={{ padding: '24px 16px', minHeight: '100vh', backgroundColor: '#0f172a', color: 'white', fontFamily: 'system-ui, sans-serif' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <Link to="/" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '16px' }}>← Startseite</Link>
        <h1 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          ⭐ Favoriten
        </h1>
        <div style={{ width: '60px' }}></div>
      </div>

      {photos.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#94a3b8', marginTop: '60px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⭐</div>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>Noch keine Favoriten vorhanden</div>
          <div style={{ fontSize: '14px' }}>Markiere Fotos im Archiv mit dem Stern-Symbol, um sie hier zu sehen.</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px' }}>
          {photos.map(photo => (
            <div 
              key={photo.id} 
              onClick={() => setSelectedPhoto(photo)}
              style={{ 
                position: 'relative',
                backgroundColor: '#1e293b', 
                borderRadius: '12px', 
                overflow: 'hidden', 
                border: '1px solid #334155', 
                cursor: 'pointer' 
              }}
            >
              <img src={photo.url} alt="Favorit" style={{ width: '100%', height: '160px', objectFit: 'cover', display: 'block' }} />
              
              <button
                onClick={(e) => handleRemoveFavorite(e, photo)}
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  backgroundColor: 'rgba(15, 23, 42, 0.75)',
                  color: '#eab308',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                }}
                title="Aus Favoriten entfernen"
              >
                ⭐
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Vollbild Lightbox */}
      {selectedPhoto && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.95)', zIndex: 1000, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', color: '#94a3b8' }}>{isZoomed ? '🔍 Gezoomt' : '🔍 Klick zum Zoomen'}</span>
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={(e) => handleRemoveFavorite(e, selectedPhoto)}
                style={{ backgroundColor: '#1e293b', color: '#eab308', border: '1px solid #334155', padding: '8px 14px', borderRadius: '20px', fontSize: '16px', cursor: 'pointer' }}
              >
                ⭐ Aus Favoriten entfernen
              </button>

              <button onClick={() => { setSelectedPhoto(null); setIsZoomed(false); }} style={{ backgroundColor: '#334155', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '20px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>
                ✕ Schließen
              </button>
            </div>
          </div>

          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'auto', margin: '20px 0' }}>
            <img src={selectedPhoto.url} alt="Vollbild" onClick={() => setIsZoomed(!isZoomed)} style={{ maxWidth: isZoomed ? '200%' : '100%', maxHeight: isZoomed ? 'none' : '75vh', objectFit: 'contain', cursor: isZoomed ? 'zoom-out' : 'zoom-in', borderRadius: '8px' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <button onClick={() => handleShare(selectedPhoto)} style={{ backgroundColor: '#22c55e', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '24px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer' }}>
              📲 Per WhatsApp / Teilen
            </button>
          </div>
        </div>
      )}
    </div>
  )
}