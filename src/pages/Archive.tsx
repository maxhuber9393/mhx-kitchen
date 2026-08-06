import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabase'

interface Photo {
  id: string
  url: string
  category: string
  title?: string
  icon?: string
  favorite: boolean | string
  deleted?: boolean
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
  const [deleting, setDeleting] = useState<boolean>(false)
  
  const [editingPhotoId, setEditingPhotoId] = useState<string | null>(null)
  const [newTitleInput, setNewTitleInput] = useState<string>('')

  const fetchPhotos = async () => {
    const { data, error } = await supabase
      .from('photos')
      .select('*')
      .or('deleted.eq.false,deleted.is.null')

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

  const handleSaveTitle = async (photo: Photo) => {
    try {
      const trimmedTitle = newTitleInput.trim()
      const { error } = await supabase
        .from('photos')
        .update({ title: trimmedTitle })
        .eq('id', photo.id)

      if (error) throw error

      setPhotos(prev => prev.map(p => p.id === photo.id ? { ...p, title: trimmedTitle } : p))
      if (selectedPhoto && selectedPhoto.id === photo.id) {
        setSelectedPhoto({ ...selectedPhoto, title: trimmedTitle })
      }
    } catch (err: any) {
      alert('Fehler beim Speichern: ' + err.message)
    } finally {
      setEditingPhotoId(null)
    }
  }

  const handleToggleFavorite = async (e: React.MouseEvent, photo: Photo) => {
    e.stopPropagation()
    const currentFav = photo.favorite === true || photo.favorite === 'true'
    const nextState = !currentFav

    setPhotos(prev => prev.map(p => p.id === photo.id ? { ...p, favorite: nextState } : p))
    if (selectedPhoto && selectedPhoto.id === photo.id) {
      setSelectedPhoto({ ...selectedPhoto, favorite: nextState })
    }

    try {
      const { error } = await supabase
        .from('photos')
        .update({ favorite: nextState })
        .eq('id', photo.id)

      if (error) throw error
    } catch (err: any) {
      alert('Fehler beim Aktualisieren: ' + err.message)
      fetchPhotos()
    }
  }

  const handleShare = async (photo: Photo) => {
    if (navigator.share) {
      try {
        await navigator.share({ title: photo.title || 'Rezeptbild', url: photo.url })
      } catch (err) {
        console.error(err)
      }
    } else {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(photo.title ? `${photo.title}: ${photo.url}` : photo.url)}`, '_blank')
    }
  }

  const handleMoveToTrash = async (e: React.MouseEvent, photo: Photo) => {
    e.stopPropagation()
    const confirmed = window.confirm('Foto in den Papierkorb verschieben?')
    if (!confirmed) return

    setDeleting(true)
    try {
      const { error: dbError } = await supabase
        .from('photos')
        .update({ 
          deleted: true, 
          deleted_at: new Date().toISOString() 
        })
        .eq('id', photo.id)

      if (dbError) throw dbError

      setSelectedPhoto(null)
      setIsZoomed(false)
      fetchPhotos()
    } catch (err: any) {
      alert('Fehler beim Verschieben: ' + err.message)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div style={{ padding: '24px 16px', minHeight: '100vh', backgroundColor: '#0f172a', color: 'white', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        {activeFolder ? (
          <button onClick={() => setActiveFolder(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '15px', cursor: 'pointer', fontWeight: '500' }}>
            ← Zurück zu Ordnern
          </button>
        ) : (
          <Link to="/" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '15px', fontWeight: '500' }}>← Startseite</Link>
        )}
        <h1 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          {activeFolder ? `📁 ${activeFolder}` : '📂 Mein Archiv'}
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
                  border: '1px solid #334155',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '16px' }}>
              {folderPhotos.map(photo => {
                const isFav = photo.favorite === true || photo.favorite === 'true'
                return (
                  <div 
                    key={photo.id} 
                    style={{ 
                      backgroundColor: '#1e293b', 
                      borderRadius: '14px', 
                      overflow: 'hidden', 
                      border: '1px solid #334155', 
                      display: 'flex',
                      flexDirection: 'column',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)'
                    }}
                  >
                    <div 
                      onClick={() => setSelectedPhoto(photo)} 
                      style={{ position: 'relative', cursor: 'pointer', width: '100%', height: '160px', backgroundColor: '#0f172a' }}
                    >
                      <img src={photo.url} alt={photo.title || 'Rezept'} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                      
                      <button
                        onClick={(e) => handleToggleFavorite(e, photo)}
                        style={{
                          position: 'absolute',
                          top: '8px',
                          left: '8px',
                          backgroundColor: 'rgba(15, 23, 42, 0.75)',
                          backdropFilter: 'blur(4px)',
                          color: isFav ? '#eab308' : '#94a3b8',
                          border: 'none',
                          borderRadius: '50%',
                          width: '32px',
                          height: '32px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '15px',
                          cursor: 'pointer'
                        }}
                      >
                        {isFav ? '⭐' : '☆'}
                      </button>

                      <button
                        onClick={(e) => handleMoveToTrash(e, photo)}
                        disabled={deleting}
                        style={{
                          position: 'absolute',
                          top: '8px',
                          right: '8px',
                          backgroundColor: 'rgba(239, 68, 68, 0.85)',
                          backdropFilter: 'blur(4px)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '50%',
                          width: '32px',
                          height: '32px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '13px',
                          cursor: 'pointer'
                        }}
                      >
                        🗑️
                      </button>
                    </div>

                    <div style={{ padding: '10px 8px', backgroundColor: '#1e293b', borderTop: '1px solid #334155', textAlign: 'center' }}>
                      {editingPhotoId === photo.id ? (
                        <div style={{ display: 'flex', gap: '4px', width: '100%' }}>
                          <input
                            type="text"
                            value={newTitleInput}
                            onChange={(e) => setNewTitleInput(e.target.value)}
                            placeholder="Rezeptname hinzufügen..."
                            autoFocus
                            onKeyDown={(e) => e.key === 'Enter' && handleSaveTitle(photo)}
                            style={{
                              width: '100%',
                              backgroundColor: '#0f172a',
                              color: 'white',
                              border: '1px solid #3b82f6',
                              borderRadius: '6px',
                              padding: '4px 6px',
                              fontSize: '12px',
                              fontStyle: 'italic',
                              outline: 'none',
                              textAlign: 'center'
                            }}
                          />
                          <button
                            onClick={() => handleSaveTitle(photo)}
                            style={{
                              backgroundColor: '#3b82f6',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              padding: '4px 8px',
                              fontSize: '12px',
                              fontWeight: 'bold',
                              cursor: 'pointer'
                            }}
                          >
                            ✓
                          </button>
                        </div>
                      ) : (
                        <div 
                          onClick={() => {
                            setEditingPhotoId(photo.id)
                            setNewTitleInput(photo.title || '')
                          }}
                          style={{ cursor: 'pointer', width: '100%' }}
                        >
                          <span style={{ 
                            fontSize: '12px', 
                            fontStyle: 'italic', 
                            color: photo.title ? '#cbd5e1' : '#64748b', 
                            overflow: 'hidden', 
                            textOverflow: 'ellipsis', 
                            whiteSpace: 'nowrap',
                            display: 'block'
                          }}>
                            {photo.title || 'Rezeptname hinzufügen...'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {selectedPhoto && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.95)', zIndex: 1000, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '16px', fontWeight: 'bold', fontStyle: 'italic', color: 'white' }}>
              {selectedPhoto.title || 'Rezept'}
            </span>
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={(e) => handleToggleFavorite(e, selectedPhoto)}
                style={{ backgroundColor: '#1e293b', color: (selectedPhoto.favorite === true || selectedPhoto.favorite === 'true') ? '#eab308' : '#94a3b8', border: '1px solid #334155', padding: '8px 14px', borderRadius: '20px', fontSize: '15px', cursor: 'pointer' }}
              >
                {(selectedPhoto.favorite === true || selectedPhoto.favorite === 'true') ? '⭐ Favorit' : '☆ Favorit'}
              </button>

              <button 
                onClick={(e) => handleMoveToTrash(e, selectedPhoto)} 
                disabled={deleting}
                style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '8px 14px', borderRadius: '20px', fontSize: '15px', cursor: 'pointer' }}
              >
                🗑️
              </button>

              <button onClick={() => { setSelectedPhoto(null); setIsZoomed(false); }} style={{ backgroundColor: '#334155', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '20px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer' }}>
                ✕ Schließen
              </button>
            </div>
          </div>

          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'auto', margin: '20px 0' }}>
            <img src={selectedPhoto.url} alt={selectedPhoto.title || 'Vollbild'} onClick={() => setIsZoomed(!isZoomed)} style={{ maxWidth: isZoomed ? '200%' : '100%', maxHeight: isZoomed ? 'none' : '75vh', objectFit: 'contain', cursor: isZoomed ? 'zoom-out' : 'zoom-in', borderRadius: '8px' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <button onClick={() => handleShare(selectedPhoto)} style={{ backgroundColor: '#22c55e', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '24px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer' }}>
              📲 Per WhatsApp / Teilen
            </button>
          </div>
        </div>
      )}
    </div>
  )
}