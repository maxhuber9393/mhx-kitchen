import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

interface PhotoItem {
  id: string
  url: string
  category: string
  favorite?: boolean
}

export default function Favorites() {
  const [favoritePhotos, setFavoritePhotos] = useState<PhotoItem[]>([])
  const [activePhoto, setActivePhoto] = useState<PhotoItem | null>(null)

  // Favoriten aus dem zentralen Archiv laden
  const loadFavorites = () => {
    const saved = localStorage.getItem('mhx_archive_photos')
    if (saved) {
      try {
        const allPhotos: PhotoItem[] = JSON.parse(saved)
        // Alle Fotos filtern, die favorite === true haben
        const favs = allPhotos.filter(p => p.favorite === true)
        setFavoritePhotos(favs)
      } catch (e) {
        console.error('Fehler beim Laden der Favoriten', e)
      }
    }
  }

  useEffect(() => {
    loadFavorites()
  }, [])

  // Stern in Favoriten umschalten (entfernt das Bild aus den Favoriten)
  const toggleFavorite = (id: string) => {
    const saved = localStorage.getItem('mhx_archive_photos')
    if (!saved) return

    const allPhotos: PhotoItem[] = JSON.parse(saved)
    const updated = allPhotos.map(photo => {
      if (photo.id === id) {
        return { ...photo, favorite: !photo.favorite }
      }
      return photo
    })

    // Zentral im Archiv speichern
    localStorage.setItem('mhx_archive_photos', JSON.stringify(updated))
    
    // Lokale Liste sofort aktualisieren
    setFavoritePhotos(updated.filter(p => p.favorite === true))
    
    if (activePhoto?.id === id) {
      setActivePhoto(null)
    }
  }

  // Foto herunterladen
  const handleDownload = (photoUrl: string) => {
    const link = document.createElement('a')
    link.href = photoUrl
    link.download = `mhx-favorit-${Date.now()}.jpg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // WhatsApp Teilen
  const handleWhatsAppShare = (photoUrl: string) => {
    const text = encodeURIComponent(`Schau dir dieses Lieblingsrezept an: ${photoUrl}`)
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank')
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

      {favoritePhotos.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#64748b', marginTop: '80px' }}>
          <p style={{ fontSize: '48px', marginBottom: '8px' }}>⭐</p>
          <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#94a3b8' }}>Noch keine Favoriten vorhanden</p>
          <p style={{ fontSize: '13px' }}>Markiere Fotos im Archiv mit dem Stern-Symbol, um sie hier zu sehen.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px' }}>
          {favoritePhotos.map(photo => (
            <div key={photo.id} style={{ backgroundColor: '#1e293b', borderRadius: '12px', overflow: 'hidden', border: '1px solid #334155' }}>
              <img 
                src={photo.url} 
                alt={photo.category} 
                onClick={() => setActivePhoto(photo)}
                style={{ width: '100%', height: '140px', objectFit: 'cover', cursor: 'pointer' }} 
              />
              
              <div style={{ padding: '8px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 'bold' }}>{photo.category}</span>
                <button
                  onClick={() => toggleFavorite(photo.id)}
                  title="Aus Favoriten entfernen"
                  style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#f59e0b' }}
                >
                  ⭐
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Vollbild Overlay */}
      {activePhoto && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.95)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '20px 16px',
            boxSizing: 'border-box'
          }}
        >
          <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end' }}>
            <button 
              onClick={() => setActivePhoto(null)}
              style={{
                backgroundColor: '#334155',
                color: 'white',
                border: 'none',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                fontSize: '20px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              ✕
            </button>
          </div>

          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
            <img 
              src={activePhoto.url} 
              alt="Großansicht" 
              style={{ maxWidth: '100%', maxHeight: '75vh', objectFit: 'contain', borderRadius: '12px' }} 
            />
          </div>

          <div style={{
            backgroundColor: '#1e293b',
            border: '1px solid #334155',
            borderRadius: '16px',
            padding: '12px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            width: '100%',
            maxWidth: '400px',
            justifyContent: 'space-around'
          }}>
            <button
              onClick={() => toggleFavorite(activePhoto.id)}
              style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#f59e0b' }}
            >
              ⭐
            </button>

            <button
              onClick={() => handleWhatsAppShare(activePhoto.url)}
              style={{ backgroundColor: '#25d366', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '8px', fontSize: '14px', cursor: 'pointer' }}
            >
              💬 Teilen
            </button>

            <button
              onClick={() => handleDownload(activePhoto.url)}
              style={{ backgroundColor: '#3b82f6', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '8px', fontSize: '14px', cursor: 'pointer' }}
            >
              💾 Sichern
            </button>
          </div>
        </div>
      )}

    </div>
  )
}