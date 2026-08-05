import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { Link } from 'react-router-dom'

interface Photo {
  id: string
  image_url: string
  folder?: string
  folder_name?: string
  category?: string
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
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)
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
      console.error('Fehler beim Laden der Fotos:', error)
    } else {
      setPhotos(data || [])
    }
    setLoading(false)
  }

  const getFolderName = (p: Photo): string => {
    return p.folder_name || p.folder || p.category || 'Unkategorisiert'
  }

  const dynamicFolders = photos.map(p => getFolderName(p))
  const allFolderNames = Array.from(new Set([...DEFAULT_FOLDERS, ...dynamicFolders]))

  const folderGroups: FolderGroup[] = allFolderNames.map(folderName => {
    const folderPhotos = photos.filter(p => getFolderName(p) === folderName)
    return {
      name: folderName,
      count: folderPhotos.length,
      coverUrl: folderPhotos[0]?.image_url || ''
    }
  })

  // ⭐ Favoriten-Status umschalten
  const toggleFavorite = async (photo: Photo, e: React.MouseEvent) => {
    e.stopPropagation()
    const newStatus = !photo.is_favorite

    setPhotos(prevPhotos =>
      prevPhotos.map(p =>
        p.id === photo.id ? { ...p, is_favorite: newStatus } : p
      )
    )

    if (supabase) {
      const { error } = await supabase
        .from('photos')
        .update({ is_favorite: newStatus })
        .eq('id', photo.id)

      if (error) {
        console.error('Fehler beim Speichern in Supabase:', error)
        setPhotos(prevPhotos =>
          prevPhotos.map(p =>
            p.id === photo.id ? { ...p, is_favorite: photo.is_favorite } : p
          )
        )
      }
    }
  }

  // 📲 WhatsApp Teilen Funktion
  const shareToWhatsApp = (photoUrl: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const text = `Schau dir dieses Rezept/Foto aus meiner MHX-KITCHEN an: ${photoUrl}`
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`
    window.open(whatsappUrl, '_blank')
  }

  // 💾 Bild Herunterladen / Abspeichern
  const downloadPhoto = async (photoUrl: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      const response = await fetch(photoUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `mhx-kitchen-${Date.now()}.jpg`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Fehler beim Herunterladen:', err)
      // Fallback: Öffnet das Bild in einem neuen Tab zum direkten Speichern
      window.open(photoUrl, '_blank')
    }
  }

  const activePhotos = activeFolder
    ? photos.filter(p => getFolderName(p) === activeFolder)
    : []

  return (
    <div style={{ padding: '20px', minHeight: '100vh', backgroundColor: '#0f172a', color: 'white', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* Header */}
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

      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px 0', color: '#94a3b8' }}>
          Lade Archiv... ⏳
        </div>
      ) : activeFolder === null ? (
        
        /* Ordner-Kacheln */
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
                boxShadow: '0 6px 16px rgba(0, 0, 0, 0.3)'
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

        /* Fotos im Ordner */
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
                  onClick={() => setSelectedPhoto(photo)}
                  style={{
                    position: 'relative',
                    paddingTop: '100%',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    cursor: 'pointer'
                  }}
                >
                  <img
                    src={photo.image_url}
                    alt={getFolderName(photo)}
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                  />

                  {/* ⭐ Favoriten-Stern */}
                  <button
                    onClick={(e) => toggleFavorite(photo, e)}
                    style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      backgroundColor: photo.is_favorite ? '#f59e0b' : 'rgba(15, 23, 42, 0.65)',
                      border: photo.is_favorite ? '2px solid #fbbf24' : '1.5px solid rgba(255, 255, 255, 0.8)',
                      borderRadius: '50%',
                      width: '38px',
                      height: '38px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      fontSize: photo.is_favorite ? '20px' : '22px',
                      color: '#ffffff',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
                      backdropFilter: 'blur(4px)',
                      zIndex: 10
                    }}
                  >
                    {photo.is_favorite ? '★' : '☆'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 🔍 Vollbild Lightbox mit WhatsApp & Download Buttons */}
      {selectedPhoto && (
        <div
          onClick={() => setSelectedPhoto(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.92)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
        >
          {/* Bild Container */}
          <div style={{ position: 'relative', maxHeight: '75vh', maxWidth: '100%', display: 'flex', justifyContent: 'center' }}>
            <img
              src={selectedPhoto.image_url}
              alt="Vollbild"
              style={{ maxWidth: '100%', maxHeight: '75vh', borderRadius: '16px', objectFit: 'contain' }}
            />
          </div>

          {/* Action Bar unter dem Bild */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              marginTop: '20px',
              display: 'flex',
              gap: '12px',
              backgroundColor: '#1e293b',
              padding: '10px 18px',
              borderRadius: '30px',
              border: '1px solid #334155',
              boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
            }}
          >
            {/* 📲 WhatsApp Button */}
            <button
              onClick={(e) => shareToWhatsApp(selectedPhoto.image_url, e)}
              style={{
                backgroundColor: '#25D366',
                color: 'white',
                border: 'none',
                borderRadius: '20px',
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer'
              }}
            >
              💬 WhatsApp
            </button>

            {/* 💾 Download / Speichern Button */}
            <button
              onClick={(e) => downloadPhoto(selectedPhoto.image_url, e)}
              style={{
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '20px',
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer'
              }}
            >
              💾 Speichern
            </button>

            {/* ❌ Schließen Button */}
            <button
              onClick={() => setSelectedPhoto(null)}
              style={{
                backgroundColor: '#475569',
                color: 'white',
                border: 'none',
                borderRadius: '20px',
                padding: '8px 14px',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              ✕
            </button>
          </div>
        </div>
      )}

    </div>
  )
}