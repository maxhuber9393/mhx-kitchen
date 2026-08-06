import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabase'

interface Photo {
  id: string
  url: string
  category: string
  title?: string
  favorite: any // <-- Hier auch "any" für die Favoriten-Seite
  deleted?: boolean
}

export default function Favorites() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)
  const [isZoomed, setIsZoomed] = useState<boolean>(false)

  const fetchFavorites = async () => {
    const { data, error } = await supabase
      .from('photos')
      .select('*')

    if (!error && data) {
      const favoritedPhotos = data.filter(p => 
        (p.favorite === true || p.favorite === 'true' || p.favorite === 1 || p.favorite === '1') && 
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
        await navigator.share({ title: photo.title || 'Rezeptbild', url: photo.url })
      } catch (err) {
        console.error(err)
      }
    } else {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(photo.title ? `${photo.title}: ${photo.url}` : photo.url)}`, '_blank')
    }
  }

  return (
    <div style={{ padding: '24px 16px', minHeight: '100vh', backgroundColor: '#0f172a', color: 'white', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <Link to="/" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '15px', fontWeight: '500' }}>← Startseite</Link>
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '16px' }}>
          {photos.map(photo => (
            <div 
              key={photo.id} 
              style={{ 
                backgroundColor: '#1e293b', 
                borderRadius: '14px', 
                overflow: 'hidden', 
                border: '1px solid #334155', 
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)'
              }}
            >
              <div 
                onClick={() => setSelectedPhoto(photo)} 
                style={{ position: 'relative', cursor: 'pointer', width: '100%', height: '160px', backgroundColor: '#0f172a' }}
              >
                <img src={photo.url} alt={photo.title || 'Favorit'} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                
                <button
                  onClick={(e) => handleRemoveFavorite(e, photo)}
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    backgroundColor: 'rgba(15, 23, 42, 0.75)',
                    backdropFilter: 'blur(4px)',
                    color: '#eab308',
                    border: 'none',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '15px',
                    cursor: 'pointer'
                  }}
                >
                  ⭐
                </button>
              </div>

              <div style={{ padding: '10px 8px', backgroundColor: '#1e293b', borderTop: '1px solid #334155', textAlign: 'center' }}>
                <span style={{ 
                  fontSize: '12px', 
                  fontStyle: 'italic', 
                  color: photo.title ? '#cbd5e1' : '#64748b', 
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis', 
                  whiteSpace: 'nowrap',
                  display: 'block'
                }}>
                  {photo.title || 'Unbenanntes Rezept'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedPhoto && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.95)', zIndex: 1000, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '16px', fontWeight: 'bold', fontStyle: 'italic', color: 'white' }}>
              {selectedPhoto.title || 'Rezept'}
            </span>
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={(e) => handleRemoveFavorite(e, selectedPhoto)}
                style={{ backgroundColor: '#1e293b', color: '#eab308', border: '1px solid #334155', padding: '8px 14px', borderRadius: '20px', fontSize: '15px', cursor: 'pointer' }}
              >
                ⭐ Aus Favoriten entfernen
              </button>

              <button onClick={() => { setSelectedPhoto(null); setIsZoomed(false); }} style={{ backgroundColor: '#334155', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '20px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer' }}>
                ✕ Schließen
              </button>
            </div>
          </div>

          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'auto', margin: '20px 0' }}>
            <img src={selectedPhoto.url} alt={selectedPhoto.title || 'Vollbild'} onClick={() => setIsZoomed(!isZoomed)} style={{ maxWidth: isZoomed ? '200%' : '100%', maxHeight: isZoomed ? 'none' : '75vh', objectFit: 'contain', cursor: isZoomed ? 'zoom-out' : 'zoom-in', borderRadius: '8px' }} />
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