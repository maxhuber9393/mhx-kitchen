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

export default function Archive() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [folders, setFolders] = useState<string[]>([])
  const [activeFolder, setActiveFolder] = useState<string>('ALLE')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    fetchPhotosAndFolders()
  }, [])

  const fetchPhotosAndFolders = async () => {
    if (!supabase) return
    setLoading(true)

    // Fotos laden
    const { data: photoData, error } = await supabase
      .from('photos')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Fehler beim Laden der Fotos:', error)
      setLoading(false)
      return
    }

    const fetchedPhotos = photoData || []
    setPhotos(fetchedPhotos)

    // Einzigartige Ordner ermitteln
    const folderNames = Array.from(
      new Set(fetchedPhotos.map((p) => p.folder_name).filter(Boolean))
    ) as string[]
    
    setFolders(folderNames)
    setLoading(false)
  }

  // Favorit umschalten
  const toggleFavorite = async (photoId: string, currentStatus?: boolean) => {
    if (!supabase) return
    const newStatus = !currentStatus

    // Optimistisches UI-Update
    setPhotos(prev =>
      prev.map(p => (p.id === photoId ? { ...p, is_favorite: newStatus } : p))
    )

    const { error } = await supabase
      .from('photos')
      .update({ is_favorite: newStatus })
      .eq('id', photoId)

    if (error) {
      console.error('Fehler beim Speichern des Favoriten-Status:', error)
      // Bei Fehler zurückrollen
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
      // Aus Supabase DB löschen
      const { error: dbError } = await supabase
        .from('photos')
        .delete()
        .eq('id', photoId)

      if (dbError) throw dbError

      // Aus Storage löschen (falls Dateiname extrahierbar)
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

  // Gefilterte Fotos
  const filteredPhotos = photos.filter(photo => {
    const matchesFolder = activeFolder === 'ALLE' || photo.folder_name === activeFolder
    const matchesSearch = photo.folder_name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFolder && matchesSearch
  })

  return (
    <div style={{ padding: '20px', minHeight: '100vh', backgroundColor: '#0f172a', color: 'white', boxSizing: 'border-box', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* Header & Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <button style={{ padding: '8px 14px', backgroundColor: '#1e293b', color: 'white', border: '1px solid #334155', borderRadius: '10px', cursor: 'pointer', fontSize: '14px' }}>
              ← Zurück
            </button>
          </Link>
          <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 'bold' }}>📁 Mein Archiv</h2>
        </div>
        <span style={{ fontSize: '13px', color: '#94a3b8', backgroundColor: '#1e293b', padding: '6px 12px', borderRadius: '20px', border: '1px solid #334155' }}>
          {filteredPhotos.length} {filteredPhotos.length === 1 ? 'Foto' : 'Fotos'}
        </span>
      </div>

      {/* Suche */}
      <div style={{ marginBottom: '18px' }}>
        <input
          type="text"
          placeholder="🔍 Ordner durchsuchen..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '12px 16px',
            borderRadius: '14px',
            backgroundColor: '#1e293b',
            color: 'white',
            border: '1px solid #334155',
            fontSize: '15px',
            boxSizing: 'border-box',
            outline: 'none'
          }}
        />
      </div>

      {/* Ordner-Tabs als Horizonaler Swiper */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '10px', marginBottom: '20px', scrollbarWidth: 'none' }}>
        <button
          onClick={() => setActiveFolder('ALLE')}
          style={{
            padding: '8px 16px',
            borderRadius: '20px',
            border: activeFolder === 'ALLE' ? '2px solid #3b82f6' : '1px solid #334155',
            backgroundColor: activeFolder === 'ALLE' ? '#1d4ed8' : '#1e293b',
            color: 'white',
            fontSize: '13px',
            fontWeight: activeFolder === 'ALLE' ? 'bold' : 'normal',
            whiteSpace: 'nowrap',
            cursor: 'pointer'
          }}
        >
          Alle ({photos.length})
        </button>

        {folders.map(folder => {
          const count = photos.filter(p => p.folder_name === folder).length
          const isActive = activeFolder === folder
          return (
            <button
              key={folder}
              onClick={() => setActiveFolder(folder)}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                border: isActive ? '2px solid #3b82f6' : '1px solid #334155',
                backgroundColor: isActive ? '#1d4ed8' : '#1e293b',
                color: 'white',
                fontSize: '13px',
                fontWeight: isActive ? 'bold' : 'normal',
                whiteSpace: 'nowrap',
                cursor: 'pointer'
              }}
            >
              📁 {folder} ({count})
            </button>
          )
        })}
      </div>

      {/* Ladeanzeige / Leerer Zustand */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
          Lade Archiv... ⏳
        </div>
      ) : filteredPhotos.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px 20px', backgroundColor: '#1e293b', borderRadius: '16px', border: '1px dashed #334155' }}>
          <span style={{ fontSize: '40px', display: 'block', marginBottom: '10px' }}>🍽️</span>
          <p style={{ margin: 0, fontSize: '16px', color: '#94a3b8' }}>Keine Fotos in diesem Ordner gefunden.</p>
          <Link to="/scan" style={{ textDecoration: 'none' }}>
            <button style={{ marginTop: '15px', padding: '10px 20px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
              Jetzt erstes Foto hochladen
            </button>
          </Link>
        </div>
      ) : (
        /* Foto-Grid (2 Spalten auf Mobile) */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
          {filteredPhotos.map((photo) => (
            <div
              key={photo.id}
              style={{
                backgroundColor: '#1e293b',
                borderRadius: '16px',
                overflow: 'hidden',
                border: '1px solid #334155',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)'
              }}
            >
              {/* Foto Container */}
              <div style={{ position: 'relative', width: '100%', paddingTop: '100%', backgroundColor: '#0f172a' }}>
                <img
                  src={photo.image_url}
                  alt={photo.folder_name}
                  onClick={() => setSelectedPhoto(photo.image_url)}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    cursor: 'pointer'
                  }}
                />

                {/* Favoriten Star Button */}
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
                    fontSize: '16px',
                    backdropFilter: 'blur(4px)'
                  }}
                >
                  {photo.is_favorite ? '⭐' : '☆'}
                </button>
              </div>

              {/* Unterer Info-Bereich */}
              <div style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#1e293b' }}>
                <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#cbd5e1', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '75%' }}>
                  📁 {photo.folder_name}
                </span>
                
                <button
                  onClick={() => handleDelete(photo.id, photo.image_url)}
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: '#ef4444',
                    fontSize: '14px',
                    cursor: 'pointer',
                    padding: '2px 4px'
                  }}
                  title="Foto löschen"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox / Vollbild-Ansicht */}
      {selectedPhoto && (
        <div
          onClick={() => setSelectedPhoto(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
        >
          <div style={{ position: 'relative', maxWidth: '100%', maxHeight: '100%' }}>
            <img
              src={selectedPhoto}
              alt="Vollbild Ansicht"
              style={{ maxWidth: '100%', maxHeight: '85vh', borderRadius: '12px', objectFit: 'contain' }}
            />
            <button
              onClick={() => setSelectedPhoto(null)}
              style={{
                position: 'absolute',
                top: '-40px',
                right: '0',
                backgroundColor: 'white',
                color: 'black',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
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