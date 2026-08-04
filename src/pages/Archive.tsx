import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { Link } from 'react-router-dom'

interface Photo {
  id: string
  folder_name: string
  image_url: string
  created_at: string
}

export default function Archive() {
  const [folders, setFolders] = useState<string[]>(['Hauptspeisen', 'Desserts', 'Snacks', 'Getränke'])
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
  const [photos, setPhotos] = useState<Photo[]>([])
  const [newFolderName, setNewFolderName] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [loading, setLoading] = useState(false)
  
  // Zustand für die Großansicht
  const [activePhoto, setActivePhoto] = useState<string | null>(null)

  // Ordner aus Supabase laden
  const fetchFolders = async () => {
    try {
      if (!supabase) return
      
      const { data: dbFolders } = await supabase.from('folders').select('name')
      const { data: dbPhotos } = await supabase.from('photos').select('folder_name')

      const defaultFolders = ['Hauptspeisen', 'Desserts', 'Snacks', 'Getränke']
      const folderNamesFromDb = dbFolders ? dbFolders.map(f => f.name) : []
      const folderNamesFromPhotos = dbPhotos ? dbPhotos.map(p => p.folder_name).filter(Boolean) : []

      const mergedFolders = Array.from(new Set([
        ...defaultFolders,
        ...folderNamesFromDb,
        ...folderNamesFromPhotos
      ]))

      setFolders(mergedFolders)
    } catch (err) {
      console.error('Fehler beim Laden der Ordner:', err)
    }
  }

  // Fotos aus Supabase laden
  const fetchPhotos = async (folderName: string) => {
    setLoading(true)
    try {
      if (!supabase) {
        setLoading(false)
        return
      }
      const { data, error } = await supabase
        .from('photos')
        .select('*')
        .eq('folder_name', folderName)
        .order('created_at', { ascending: false })

      if (error) console.error('Fehler beim Laden der Fotos:', error)
      if (data) setPhotos(data)
    } catch (err) {
      console.error('Fehler:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFolders()
  }, [])

  useEffect(() => {
    if (selectedFolder) {
      fetchPhotos(selectedFolder)
    }
  }, [selectedFolder])

  // Neuen Ordner erstellen
  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newFolderName.trim()) return

    const name = newFolderName.trim()

    try {
      if (supabase) {
        const { error } = await supabase.from('folders').insert([{ name }])
        if (error) {
          alert('Fehler beim Speichern: ' + error.message)
          return
        }
      }
      
      setNewFolderName('')
      setShowAddForm(false)
      await fetchFolders()
    } catch (err) {
      console.error('Fehler beim Speichern des Ordners:', err)
    }
  }

  // Foto löschen
  const handleDeletePhoto = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation() // Verhindert, dass sich die Großansicht öffnet
    if (!confirm('Foto wirklich löschen?')) return
    setPhotos(photos.filter(p => p.id !== id))
    try {
      if (supabase) {
        await supabase.from('photos').delete().eq('id', id)
      }
    } catch (err) {
      console.error('Fehler beim Löschen:', err)
    }
  }

  return (
    <div style={{ 
      padding: '20px', 
      minHeight: '100vh', 
      backgroundColor: '#0f172a', 
      color: 'white',
      boxSizing: 'border-box'
    }}>
      {/* Kopfzeile */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', gap: '15px' }}>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <button style={{
            padding: '8px 15px',
            backgroundColor: '#1e293b',
            color: 'white',
            border: '1px solid #334155',
            borderRadius: '8px',
            cursor: 'pointer'
          }}>
            ← Startseite
          </button>
        </Link>
        <h2 style={{ margin: 0, fontSize: '22px' }}>📂 Mein Archiv</h2>
      </div>

      {!selectedFolder ? (
        <>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: '#22c55e',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: 'bold',
              marginBottom: '20px',
              cursor: 'pointer'
            }}
          >
            ➕ Neuer Ordner erstellen
          </button>

          {showAddForm && (
            <form onSubmit={handleCreateFolder} style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
              <input
                type="text"
                placeholder="Ordnername..."
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #334155',
                  backgroundColor: '#1e293b',
                  color: 'white',
                  fontSize: '16px'
                }}
              />
              <button
                type="submit"
                style={{
                  padding: '12px 20px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                OK
              </button>
            </form>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            {folders.map((folderName) => (
              <div
                key={folderName}
                onClick={() => setSelectedFolder(folderName)}
                style={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '16px',
                  padding: '20px',
                  textAlign: 'center',
                  cursor: 'pointer'
                }}
              >
                <div style={{ fontSize: '36px', marginBottom: '8px' }}>📁</div>
                <div style={{ fontWeight: 'bold', fontSize: '16px', color: 'white' }}>{folderName}</div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div>
          <button
            onClick={() => setSelectedFolder(null)}
            style={{
              padding: '8px 15px',
              borderRadius: '8px',
              border: '1px solid #334155',
              backgroundColor: '#1e293b',
              color: 'white',
              cursor: 'pointer',
              marginBottom: '20px'
            }}
          >
            ← Zurück zu allen Ordnern
          </button>

          <h3 style={{ fontSize: '20px', marginBottom: '15px' }}>Ordner: {selectedFolder}</h3>

          {loading ? (
            <p style={{ color: '#94a3b8' }}>Lade Fotos...</p>
          ) : photos.length === 0 ? (
            <div style={{ 
              padding: '40px 20px', 
              textAlign: 'center', 
              color: '#94a3b8', 
              border: '2px dashed #334155', 
              borderRadius: '12px',
              marginTop: '15px'
            }}>
              📷 Noch keine Fotos in diesem Ordner.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px' }}>
              {photos.map((photo) => (
                <div 
                  key={photo.id} 
                  onClick={() => setActivePhoto(photo.image_url)}
                  style={{ 
                    position: 'relative', 
                    borderRadius: '12px', 
                    overflow: 'hidden', 
                    border: '1px solid #334155',
                    cursor: 'pointer'
                  }}
                >
                  <img src={photo.image_url} alt="Speise" style={{ width: '100%', height: '150px', objectFit: 'cover', display: 'block' }} />
                  <button
                    onClick={(e) => handleDeletePhoto(e, photo.id)}
                    style={{
                      position: 'absolute',
                      top: '5px',
                      right: '5px',
                      backgroundColor: 'rgba(239, 68, 68, 0.9)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      width: '32px',
                      height: '32px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      fontSize: '14px',
                      zIndex: 2
                    }}
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal / Overlay für Großansicht */}
      {activePhoto && (
        <div 
          onClick={() => setActivePhoto(null)}
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
            zIndex: 9999,
            padding: '20px'
          }}
        >
          <button 
            onClick={() => setActivePhoto(null)}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              backgroundColor: '#1e293b',
              color: 'white',
              border: '1px solid #334155',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              fontSize: '20px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ✕
          </button>
          
          <img 
            src={activePhoto} 
            alt="Großansicht" 
            style={{
              maxWidth: '100%',
              maxHeight: '90vh',
              borderRadius: '12px',
              objectFit: 'contain'
            }} 
          />
        </div>
      )}
    </div>
  )
}