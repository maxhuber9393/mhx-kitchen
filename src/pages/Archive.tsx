import { useState } from 'react'
import { supabase } from '../supabase' // Passe den Importpfad an deine Ordnerstruktur an

export default function Archive() {
  const [photos, setPhotos] = useState<any[]>([]) // Deine Photos-State
  const [selectedPhoto, setSelectedPhoto] = useState<any>(null)

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

      setPhotos((prev) => prev.filter((p) => p.id !== photoId))
      setSelectedPhoto(null)
    } catch (error) {
      console.error("Fehler beim Löschen:", error)
      alert("Das Bild konnte nicht gelöscht werden.")
    }
  }

  return (
    <div>
      {/* Hier ist deine restliche Archiv-Ansicht (Ordner, Raster etc.) */}

      {/* Lightbox / Modal Vorschau */}
      {selectedPhoto && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '16px' }}>
          
          {/* Bildansicht */}
          <img 
            src={selectedPhoto.url} 
            alt="Vorschau" 
            style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain', borderRadius: '16px' }} 
          />

          {/* Untere Aktionsleiste (WhatsApp + Speichern bleiben erhalten!) */}
          <div style={{ marginTop: '20px', display: 'flex', gap: '8px', alignItems: 'center', backgroundColor: '#1e293b', padding: '10px 14px', borderRadius: '40px', border: '1px solid #334155', maxWidth: '95vw', overflowX: 'auto' }}>
            
            {/* 1. WhatsApp */}
            <button 
              onClick={() => handleWhatsAppShare(selectedPhoto.url)}
              style={{ backgroundColor: '#25D366', color: 'white', border: 'none', borderRadius: '20px', padding: '10px 14px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '14px', whiteSpace: 'nowrap' }}
            >
              💬 WhatsApp
            </button>

            {/* 2. Speichern */}
            <a 
              href={selectedPhoto.url} 
              download="rezept-foto.jpg"
              style={{ backgroundColor: '#3b82f6', color: 'white', textDecoration: 'none', borderRadius: '20px', padding: '10px 14px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', whiteSpace: 'nowrap' }}
            >
              💾 Speichern
            </a>

            {/* 3. NEU: Löschen */}
            <button 
              onClick={() => handleDeletePhoto(selectedPhoto.id, selectedPhoto.path)}
              style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '20px', padding: '10px 14px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '14px', whiteSpace: 'nowrap' }}
            >
              🗑️ Löschen
            </button>

            {/* 4. Schließen (X) */}
            <button 
              onClick={() => setSelectedPhoto(null)}
              style={{ backgroundColor: '#475569', color: 'white', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '14px', flexShrink: 0 }}
            >
              ✕
            </button>

          </div>
        </div>
      )}
    </div>
  )
}