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

interface FolderGroup {
  name: string
  count: number
  coverUrl: string
}

const DEFAULT_FOLDERS = ['Hauptspeisen', 'Desserts', 'Snacks', 'Getränke']

export default function Archive() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [activeFolder, setActiveFolder] = useState<string | null>(null)
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    fetchPhotos()
  }, [])

  const fetchPhotos = async () => {
    if (!supabase) return
    setLoading(true)

    const { data: photoData, error } = await supabase
      .from('photos')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Fehler beim Laden der Fotos:', error)
      setLoading(false)
      return
    }

    setPhotos(photoData || [])
    setLoading(false)
  }

  const dynamicFolders = photos.map(p => p.folder_name).filter(Boolean)
  const allFolderNames = Array.from(new Set([...DEFAULT_FOLDERS, ...dynamicFolders]))

  const folderGroups: FolderGroup[] = allFolderNames.map(folderName => {
    const folderPhotos = photos.filter(p => p.folder_name === folderName)
    return {
      name: folderName,
      count: folderPhotos.length,
      coverUrl: folderPhotos[0]?.image_url || ''
    }
  })

  // Favorit umschalten
  const toggleFavorite = async (photoId: string, currentStatus?: boolean) => {
    if (!supabase) return
    const newStatus = !currentStatus

    setPhotos(prev =>
      prev.map(p => (p.id === photoId ? { ...p, is_favorite: newStatus } : p))
    )

    const { error } = await supabase
      .from('photos')
      .update({ is_favorite: newStatus })
      .eq('id', photoId)

    if (error) {
      setPhotos(prev =>
        prev.map(p => (p.id === photoId ? { ...p, is_favorite: currentStatus } : p))
      )
    }
  }

  // Foto löschen
  const handleDelete = async (photoId: string, imageUrl: string) => {
    if (!confirm('Möchtest du dieses Foto wirklich löschen?')) return
    if (!supabase) return

    try {
      const { error: dbError } = await supabase.from('photos').delete().eq('id', photoId)
      if (dbError) throw dbError

      const urlParts = imageUrl.split('/')
      const fileName = urlParts[urlParts.length - 1]
      if (fileName) {
        await supabase.storage.from('photos').remove([fileName])
      }

      setPhotos(prev => prev.filter(p => p.id !== photoId))
      if (selectedPhoto === imageUrl) setSelectedPhoto(null)
    } catch (err) {
      alert('Fehler beim Löschen des Fotos.')
    }
  }

  // 📲 WhatsApp / native Teilen-Funktion
  const handleShare = async (imageUrl: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Rezept aus MHX-KITCHEN',
          text: 'Schau dir dieses Gericht aus meiner MHX-KITCHEN an! 🍳',
          url: imageUrl,
        })
      } catch (err) {
        console.log('Teilen abgebrochen oder fehlgeschlagen', err)
      }
    } else {
      // Fallback für Browser, die die Web Share API nicht unterstützen
      const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent('Schau dir dieses Foto an: ' + imageUrl)}`
      window.open(whatsappUrl, '_blank')
    }
  }

  // 💾 Foto herunterladen
  const handleDownload = async (imageUrl: string) => {
    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const blobUrl = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = `mhx-kitchen-${Date.now()}.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(blobUrl)
    } catch (error) {
      // Fallback: Öffnet das Bild im neuen Tab zum manuellen Speichern
      window.open(imageUrl, '_blank')
    }
  }

  const activePhotos = activeFolder ? photos.filter(p => p.folder_name === activeFolder) : []

  return (
    <div style={{ padding: '20px', minHeight: '100vh', backgroundColor: '#0f172a', color: 'white', boxSizing: 'border-box', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '25px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {activeFolder ? (
            <button
              onClick={() => setActiveFolder(null)}
              style={{ padding: '8px 14px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' }}
            >
              ← Alle Ordner
            </button>
          ) : (
            <Link to="/" style={{ textDecoration: 'none' }}>
              <button style={{ padding: '8px 14px', backgroundColor: '#1e293b', color: 'white', border: '1px solid #334155', borderRadius: '10px', cursor: 'pointer', fontSize: '14px' }}>
                ← Zurück
              </button>
            </Link>
          )}
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>
            {activeFolder ? `📁 ${activeFolder}` : '📁 Mein Archiv'}
          </h2>
        </div>
      </div>

      {/* Ladeanzeige */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px 0', color: '#94a3b8' }}>
          Lade Archiv... ⏳
        </div>
      ) : activeFolder === null ? (
        
        /* ORDNER-ÜBERSICHT */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
          {folderGroups.map((folder) => (
            <div
              key={folder.name}
              onClick={() => setActiveFolder(folder.name)}
              style={{
                backgroundColor: '#1e293b',
                borderRadius: '18px',
                overflow: 'hidden',
                border: '1px solid #334155',
                cursor: 'pointer',
                boxShadow: '0 6px 16px rgba(0, 0, 0, 0.3)',
                transition: 'transform 0.15s ease'
              }}
            >
              <div style={{ width: '100%', paddingTop: '80%', position: 'relative', backgroundColor: '#0f172a' }}>
                {folder.coverUrl ? (
                  <img
                    src={folder.coverUrl}
                    alt={folder.name}
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', color: '#64748b' }}>
                    📁
                  </div>
                )}
                
                <span style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  backgroundColor: folder.count > 0 ? 'rgba(15, 23, 42, 0.85)' : 'rgba(30, 41, 59, 0.7)',
                  color: folder.count > 0 ? '#3b82f6' : '#94a3b8',
                  padding: '4px 10px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  border: '1px solid #334155',
                  backdropFilter: 'blur(4px)'
                }}>
                  {folder.count} {folder.count === 1 ? 'Foto' : 'Fotos'}
                </span>
              </div>

              <div style={{ padding: '14px', backgroundColor: '#1e293b', textAlign: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 'bold', color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  📁 {folder.name}
                </h3>
              </div>
            </div>
          ))}
        </div>

      ) : (

        /* FOTO-ANSICHT */
        <div>
          {activePhotos.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '50px 20px', backgroundColor: '#1e293b', borderRadius: '16px', border: '1px dashed #334155' }}>
              <span style={{ fontSize: '40px', display: 'block', marginBottom: '10px' }}>🍽️</span>
              <p style={{ margin: 0, fontSize: '15px', color: '#94a3b8' }}>
                Der Ordner <strong>"{activeFolder}"</strong> ist noch leer.
              </p>
              <Link to="/scan" style={{ textDecoration: 'none' }}>
                <button style={{ marginTop: '15px', padding: '10px 20px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                  Jetzt Foto hochladen
                </button>
              </Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
              {activePhotos.map((photo) => (
                <div
                  key={photo.id}
                  style={{
                    backgroundColor: '#1e293b',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    border: '1px solid #334155',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative'
                  }}
                >
                  <div style={{ position: 'relative', width: '100%', paddingTop: '100%', backgroundColor: '#0f172a' }}>
                    <img
                      src={photo.image_url}
                      alt={photo.folder_name}
                      onClick={() => setSelectedPhoto(photo.image_url)}
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }}
                    />

                    <button
                      onClick={() => toggleFavorite(photo.id, photo.is_favorite)}
                      style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        backgroundColor: 'rgba(15, 23, 42, 0.75)',
                        border: 'none',
                        borderRadius: '50%',
                        width: '32px',
                        height: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        fontSize: '16px'
                      }}
                    >
                      {photo.is_favorite ? '⭐' : '☆'}
                    </button>
                  </div>

                  <div style={{ padding: '8px 12px', display: 'flex', justifyContent: 'flex-end', backgroundColor: '#1e293b' }}>
                    <button
                      onClick={() => handleDelete(photo.id, photo.image_url)}
                      style={{ backgroundColor: 'transparent', border: 'none', color: '#ef4444', fontSize: '13px', cursor: 'pointer' }}
                    >
                      🗑️ Löschen
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Lightbox / Vollbild-Ansicht mit Teilen & Speichern */}
      {selectedPhoto && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.94)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
        >
          {/* Schließen Button oben rechts */}
          <button
            onClick={() => setSelectedPhoto(null)}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              backgroundColor: '#334155',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            ✕
          </button>

          {/* Vorschaubild */}
          <img
            src={selectedPhoto}
            alt="Vollbild"
            style={{ maxWidth: '100%', maxHeight: '70vh', borderRadius: '16px', objectFit: 'contain', marginBottom: '20px' }}
          />

          {/* Aktions-Buttons: Teilen & Speichern */}
          <div style={{ display: 'flex', gap: '12px', width: '100%', maxWidth: '350px' }}>
            
            {/* WhatsApp / Teilen Button */}
            <button
              onClick={() => handleShare(selectedPhoto)}
              style={{
                flex: 1,
                padding: '12px 16px',
                backgroundColor: '#25D366',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontWeight: 'bold',
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(37, 211, 102, 0.3)'
              }}
            >
              💬 WhatsApp
            </button>

            {/* Speichern Button */}
            <button
              onClick={() => handleDownload(selectedPhoto)}
              style={{
                flex: 1,
                padding: '12px 16px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontWeight: 'bold',
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
              }}
            >
              💾 Speichern
            </button>

          </div>
        </div>
      )}

    </div>
  )
}