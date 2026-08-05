import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

export default function Archive() {
  const [photos, setPhotos] = useState<any[]>([])
  const [selectedPhoto, setSelectedPhoto] = useState<any>(null)
  const [currentFolder, setCurrentFolder] = useState<string | null>(null)

  // Standard-Ordner festlegen
  const defaultFolders = ['Hauptspeisen', 'Desserts', 'Vorspeisen', 'Snacks', 'Getränke', 'Sonstiges']

  // Fotos aus Supabase oder LocalStorage laden
  useEffect(() => {
    loadPhotos()
  }, [])

  const loadPhotos = async () => {
    try {
      if (supabase) {
        const { data, error } = await supabase.from('photos').select('*')
        if (data && !error) {
          setPhotos(data)
          return
        }
      }
      const local = localStorage.getItem('mhx_photos')
      if (local) {
        setPhotos(JSON.parse(local))
      }
    } catch (e) {
      console.error(e)
    }
  }

  // WhatsApp Teilen
  const handleWhatsAppShare = (url: string) => {
    const text = encodeURIComponent(`Schau dir dieses Rezept/Foto an: ${url}`)
    window.open(`https://wa.me/?text=${text}`, '_blank')
  }

  // Foto löschen
  const handleDeletePhoto = async (photoId: string, imagePath?: string) => {
    const confirmDelete = window.confirm("Möchtest du dieses Bild wirklich löschen?")
    if (!confirmDelete) return

    try {
      if (supabase) {
        if (imagePath) {
          await supabase.storage.from('photos').remove([imagePath])
        }
        await supabase.from('photos').delete().eq('id', photoId)
      }

      const updated = photos.filter((p) => p.id !== photoId)
      setPhotos(updated)
      localStorage.setItem('mhx_photos', JSON.stringify(updated))
      setSelectedPhoto(null)
    } catch (error) {
      console.error("Fehler beim Löschen:", error)
      alert("Das Bild konnte nicht gelöscht werden.")
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

  // Gefilterte Fotos
  const filteredPhotos = currentFolder 
    ? photos.filter(p => p.folder === currentFolder)
    : photos

  return (
    <div style={{ padding: '20px 16px', minHeight: '100vh', backgroundColor: '#0f172a', color: 'white', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* Header */}
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

      {/* Ordner-Übersicht (falls kein Ordner ausgewählt ist) */}
      {!currentFolder && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '30px' }}>
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

      {/* Fotos-Raster */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
        {filteredPhotos.map((photo) => (
          <div 
            key={photo.id}
            onClick={() => setSelectedPhoto(photo)}
            style={{ position: 'relative', height: '160px', borderRadius: '16px', overflow: 'hidden', cursor: 'pointer', backgroundColor: '#1e293b' }}
          >
            <img 
              src={photo.url} 
              alt="Gericht" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
            {/* Stern Icon */}
            <button
              onClick={(e) => toggleFavorite(e, photo)}
              style={{ position: 'absolute', top: '8px', right: '8px', backgroundColor: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              {photo.isFavorite ? '⭐' : '☆'}
            </button>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.9)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '16px' }}>
          
          <img 
            src={selectedPhoto.url} 
            alt="Vorschau" 
            style={{ maxWidth: '100%', maxHeight: '65vh', objectFit: 'contain', borderRadius: '16px' }} 
          />

          {/* Aktionsleiste */}
          <div style={{ marginTop: '20px', display: 'flex', gap: '8px', alignItems: 'center', backgroundColor: '#1e293b', padding: '10px 14px', borderRadius: '40px', border: '1px solid #334155', maxWidth: '95vw', overflowX: 'auto' }}>
            
            <button 
              onClick={() => handleWhatsAppShare(selectedPhoto.url)}
              style={{ backgroundColor: '#25D366', color: 'white', border: 'none', borderRadius: '20px', padding: '10px 14px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px', whiteSpace: 'nowrap' }}
            >
              💬 WhatsApp
            </button>

            <a 
              href={selectedPhoto.url} 
              download="rezept-foto.jpg"
              style={{ backgroundColor: '#3b82f6', color: 'white', textDecoration: 'none', borderRadius: '20px', padding: '10px 14px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', whiteSpace: 'nowrap' }}
            >
              💾 Speichern
            </a>

            <button 
              onClick={() => handleDeletePhoto(selectedPhoto.id, selectedPhoto.path)}
              style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '20px', padding: '10px 14px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px', whiteSpace: 'nowrap' }}
            >
              🗑️ Löschen
            </button>

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