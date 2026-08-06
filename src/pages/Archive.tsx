import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabase'

interface Photo {
  id: string
  url: string
  category: string
  icon?: string
  favorite: boolean
}

const DEFAULT_ICONS: { [key: string]: string } = {
  'Hauptspeisen': '🍲',
  'Desserts': '🍰',
  'Vorspeisen': '🥗',
  'Snacks': '🍿',
  'Getränke': '🍹',
  'Sonstiges': '📦'
}

export default function Archive() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [activeFolder, setActiveFolder] = useState<string | null>(null)
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)
  const [isZoomed, setIsZoomed] = useState<boolean>(false)

  const fetchPhotos = async () => {
    const { data, error } = await supabase.from('photos').select('*')
    if (!error && data) {
      const cleanedData = data.map(p => ({
        ...p,
        category: (p.category && p.category.trim() !== '') ? p.category : 'Unbenannt'
      }))
      setPhotos(cleanedData)
    }
  }

  useEffect(() => {
    fetchPhotos()
    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'photos' }, () => fetchPhotos())
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const allFolderNames = Array.from(
    new Set([...Object.keys(DEFAULT_ICONS), ...photos.map(p => p.category)])
  )

  const getFolderIcon = (name: string) => {
    if (DEFAULT_ICONS[name]) return DEFAULT_ICONS[name]
    const customPhoto = photos.find(p => p.category === name && p.icon)
    return customPhoto?.icon || '📁'
  }

  const folderPhotos = activeFolder ? photos.filter(p => p.category === activeFolder) : []

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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        {activeFolder ? (
          <button onClick={() => setActiveFolder(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '16px', cursor: 'pointer' }}>
            ← Zurück zu Ordnern
          </button>
        ) : (
          <Link to="/" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '16px' }}>← Startseite</Link>
        )}
        <h1 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          📂 {activeFolder || 'Mein Archiv'}
        </h1>
        <div style={{ width: '60px' }}></div>
      </div>

      {!activeFolder ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '16px' }}>
          {allFolderNames.map(folderName => {
            const count = photos.filter(p => p.category === folderName).length
            return (
              <div
                key={folderName}
                onClick={() => setActiveFolder(folderName)}
                style={{
                  backgroundColor: '#1e293b',
                  borderRadius: '16px',
                  padding: '20px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  cursor: 'pointer',
                  border: '1px solid #334155'
                }}
              >
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>
                  {getFolderIcon(folderName)}
                </div>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#f8fafc', marginBottom: '4px' }}>
                  {folderName}
                </div>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                  {count} {count === 1 ? 'Foto' : 'Fotos'}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div>
          {folderPhotos.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#94a3b8', marginTop: '40px' }}>Keine Fotos in diesem Ordner.</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px' }}>
              {folderPhotos.map(photo => (
                <div key={photo.id} onClick={() => setSelectedPhoto(photo)} style={{ backgroundColor: '#1e293b', borderRadius: '12px', overflow: 'hidden', border: '1px solid #334155', cursor: 'pointer' }}>
                  <img src={photo.url} alt="Rezept" style={{ width: '100%', height: '160px', objectFit: 'cover', display: 'block' }} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {selectedPhoto && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.95)', zIndex: 1000, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', color: '#94a3b8' }}>{isZoomed ? '🔍 Gezoomt' : '🔍 Klick zum Zoomen'}</span>
            <button onClick={() => { setSelectedPhoto(null); setIsZoomed(false); }} style={{ backgroundColor: '#334155', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '20px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>✕ Schließen</button>
          </div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'auto', margin: '20px 0' }}>
            <img src={selectedPhoto.url} alt="Vollbild" onClick={() => setIsZoomed(!isZoomed)} style={{ maxWidth: isZoomed ? '200%' : '100%', maxHeight: isZoomed ? 'none' : '75vh', objectFit: 'contain', cursor: isZoomed ? 'zoom-out' : 'zoom-in', borderRadius: '8px' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <button onClick={() => handleShare(selectedPhoto)} style={{ backgroundColor: '#22c55e', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '24px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer' }}>📲 Per WhatsApp / Teilen</button>
          </div>
        </div>
      )}
    </div>
  )
}