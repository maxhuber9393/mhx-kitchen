import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabase'

interface Photo {
  id: string
  url: string
  category: string
  favorite: boolean
}

const FOLDER_CONFIG: { [key: string]: { icon: string } } = {
  'Hauptspeisen': { icon: '🍲' },
  'Desserts': { icon: '🍰' },
  'Vorspeisen': { icon: '🥗' },
  'Snacks': { icon: '🍿' },
  'Getränke': { icon: '🍹' },
  'Sonstiges': { icon: '📦' }
}

export default function Archive() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [activeFolder, setActiveFolder] = useState<string | null>(null)

  const fetchPhotos = async () => {
    const { data, error } = await supabase
      .from('photos')
      .select('*')

    if (!error && data) {
      setPhotos(data)
    }
  }

  useEffect(() => {
    fetchPhotos()

    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'photos' },
        () => {
          fetchPhotos()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  // Dynamische Liste aller Ordner aus den Standard-Ordnern + vorhandenen Fotos
  const allFolderNames = Array.from(
    new Set([...Object.keys(FOLDER_CONFIG), ...photos.map(p => p.category)])
  )

  const getFolderIcon = (name: string) => {
    return FOLDER_CONFIG[name]?.icon || '📁'
  }

  const folderPhotos = activeFolder
    ? photos.filter(p => p.category === activeFolder)
    : []

  return (
    <div style={{ padding: '24px 16px', minHeight: '100vh', backgroundColor: '#0f172a', color: 'white', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        {activeFolder ? (
          <button 
            onClick={() => setActiveFolder(null)} 
            style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '16px', cursor: 'pointer' }}
          >
            ← Zurück zu Ordnern
          </button>
        ) : (
          <Link to="/" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '16px' }}>
            ← Startseite
          </Link>
        )}
        <h1 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          📂 {activeFolder || 'Mein Archiv'}
        </h1>
        <div style={{ width: '60px' }}></div>
      </div>

      {/* Hauptansicht: Ordner-Kacheln */}
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
        /* Unteransicht: Fotos im geöffneten Ordner */
        <div>
          {folderPhotos.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#94a3b8', marginTop: '40px' }}>
              Keine Fotos in diesem Ordner.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px' }}>
              {folderPhotos.map(photo => (
                <div key={photo.id} style={{ backgroundColor: '#1e293b', borderRadius: '12px', overflow: 'hidden', border: '1px solid #334155' }}>
                  <img 
                    src={photo.url} 
                    alt={photo.category} 
                    style={{ width: '100%', height: '160px', objectFit: 'cover', display: 'block' }} 
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}