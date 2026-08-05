import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

export default function Archive() {
  const [photos, setPhotos] = useState<any[]>([])
  const [selectedPhoto, setSelectedPhoto] = useState<any>(null)
  const [currentFolder, setCurrentFolder] = useState<string | null>(null)

  const defaultFolders = ['Hauptspeisen', 'Desserts', 'Vorspeisen', 'Snacks', 'Getränke', 'Sonstiges']

  // Bilder beim Start laden
  useEffect(() => {
    loadPhotos()
  }, [])

  const loadPhotos = async () => {
    try {
      if (supabase) {
        const { data, error } = await supabase.from('photos').select('*').eq('isDeleted', false)
        if (data && !error && data.length > 0) {
          setPhotos(data)
          return
        }
      }
      const local = localStorage.getItem('mhx_photos')
      if (local) {
        setPhotos(JSON.parse(local))
      }
    } catch (e) {
      console.error("Fehler beim Laden:", e)
    }
  }

  // WhatsApp Teilen
  const handleWhatsAppShare = (url: string) => {
    const text = encodeURIComponent(`Schau dir dieses Rezept/Foto an: ${url}`)
    window.open(`https://wa.me/?text=${text}`, '_blank')
  }

  // Foto in den Papierkorb verschieben (30-Tage System)
  const handleDeletePhoto = async (photoId: string) => {
    const confirmDelete = window.confirm("Möchtest du dieses Bild in den Papierkorb verschieben?")
    if (!confirmDelete) return

    try {
      const photoToDelete = photos.find(p => p.id === photoId)
      if (!photoToDelete) return

      // 1. Aus der Archiv-Ansicht entfernen
      const updatedArchive = photos.filter((p) => p.id !== photoId)
      setPhotos(updatedArchive)
      localStorage.setItem('mhx_photos', JSON.stringify(updatedArchive))

      // 2. In den Papierkorb speichern (mit Lösch-Datum für die 30 Tage)
      const currentTrash = JSON.parse(localStorage.getItem('mhx_trash') || '[]')
      currentTrash.push({
        ...photoToDelete,
        deletedAt: Date.now()
      })
      localStorage.setItem('mhx_trash', JSON.stringify(currentTrash))

      // 3. Supabase-Status aktualisieren (falls Supabase genutzt wird)
      if (supabase) {
        await supabase.from('photos').update({ isDeleted: true, deletedAt: new Date() }).eq('id', photoId)
      }

      setSelectedPhoto(null)
    } catch (error) {
      console.error("Fehler beim Verschieben in den Papierkorb:", error)
      alert("Das Bild konnte nicht in den Papierkorb verschoben werden.")
    }
  }

  // Favorit umschalten
  const toggleFavorite = async (e: React.MouseEvent, photo: any) => {
    e.stopPropagation()
    const updatedPhotos = photos.map(p => {
      if (p.id === photo.id) {
        return { ...p, isFavorite: !p.isFavorite }
      }
      return p
    })
    setPhotos(updatedPhotos)
    localStorage.setItem('mhx_photos', JSON.stringify(updatedPhotos))

    if (supabase) {
      await supabase.from('photos').update({ isFavorite: !photo.isFavorite }).eq('id', photo.id)
    }
  }

  const filteredPhotos = currentFolder 
    ? photos.filter(p => p.folder === currentFolder)
    : photos

  return (
    <div style={{ padding: '20px 16px', minHeight: '100vh', backgroundColor: '#0f172a', color: 'white', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* Kopfzeile */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h1 style={{ margin: 0, fontSize: '24px' }}>📁 Mein Archiv</h1>
        {currentFolder && (
          <button 
            onClick={() => setCurrentFolder(null)}
            style={{ backgroundColor: '#334155', color: 'white', border: 'none', borderRadius: '12px', padding: '8px 12px', cursor: 'pointer', fontSize: '13px' }}
          >
            ← Alle Ordner
          </button>
        )}
      </div>

      {/* Ordner-Ansicht */}
      {!currentFolder && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '24px' }}>
          {defaultFolders.map((folder) => {
            const count = photos.filter(p => p.folder === folder).length
            return (
              <div 
                key={folder}
                onClick={() => setCurrentFolder(folder)}
                style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '16px', cursor: 'pointer' }}
              >
                <div style={{ fontSize: '24px', marginBottom: '6px' }}>📂</div>
                <div style={{ fontWeight: 'bold', fontSize: '15px' }}>{folder}</div>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>{count} Foto{count !== 1 ? 's' : ''}</div>
              </div>
            )
          })}
        </div>
      )}

      {/* Bilder-Raster */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
        {filteredPhotos.map((photo) => {
          const imageUrl = photo.url || photo.image_url || photo.src
          return (
            <div 
              key={photo.id}
              onClick={() => setSelectedPhoto(photo)}
              style={{ position: 'relative', height: '160px', borderRadius: '16px', overflow: 'hidden', cursor: 'pointer', backgroundColor: '#1e293b' }}
            >
              {imageUrl ? (
                <img 
                  src={imageUrl} 
                  alt="Rezept" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748b' }}>Kein Bild</div>
              )}
              
              {/* Favoriten Stern */}
              <button
                onClick={(e) => toggleFavorite(e, photo)}
                style={{ position: 'absolute', top: '8px', right: '8px', backgroundColor: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: photo.isFavorite ? '#f59e0b' : 'white' }}
              >
                {photo.isFavorite ? '★' : '☆'}
              </button>
            </div>
          )
        })}
      </div>

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.9)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '16px' }}>
          
          <img 
            src={selectedPhoto.url || selectedPhoto.image_url || selectedPhoto.src} 
            alt="Vorschau" 
            style={{ maxWidth: '100%', maxHeight: '65vh', objectFit: 'contain', borderRadius: '16px' }} 
          />

          {/* Aktionsleiste */}
          <div style={{ marginTop: '20px', display: 'flex', gap: '8px', alignItems: 'center', backgroundColor: '#1e293b', padding: '10px 14px', borderRadius: '40px', border: '1px solid #334155', maxWidth: '95vw', overflowX: 'auto' }}>
            
            {/* 1. WhatsApp */}
            <button 
              onClick={() => handleWhatsAppShare(selectedPhoto.url || selectedPhoto.image_url || selectedPhoto.src)}
              style={{ backgroundColor: '#25D366', color: 'white', border: 'none', borderRadius: '20px', padding: '10px 14px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px', whiteSpace: 'nowrap' }}
            >
              💬 WhatsApp
            </button>

            {/* 2. Speichern */}
            <a 
              href={selectedPhoto.url || selectedPhoto.image_url || selectedPhoto.src} 
              download="rezept-foto.jpg"
              style={{ backgroundColor: '#3b82f6', color: 'white', textDecoration: 'none', borderRadius: '20px', padding: '10px 14px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', whiteSpace: 'nowrap' }}
            >
              💾 Speichern
            </a>

            {/* 3. In den Papierkorb verschieben */}
            <button 
              onClick={() => handleDeletePhoto(selectedPhoto.id)}
              style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '20px', padding: '10px 14px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px', whiteSpace: 'nowrap' }}
            >
              🗑️ Löschen
            </button>

            {/* 4. Schließen (X) */}
            <button 
              onClick={() => setSelectedPhoto(null)}
              style={{ backgroundColor: '#475569', color: 'white', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '13px', flexShrink: 0 }}
            >
              ✕
            </button>

          </div>
        </div>
      )}

    </div>
  )
}