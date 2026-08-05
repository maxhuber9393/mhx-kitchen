import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'

interface PhotoItem {
  id: string
  url: string
  category: string
  favorite?: boolean
  deletedAt?: string
}

// Feste Standard-Ordner mit ihren eigenen Symbolen
const DEFAULT_FOLDERS: { [key: string]: string } = {
  'Hauptspeisen': '🍲',
  'Desserts': '🍰',
  'Vorspeisen': '🥗',
  'Snacks': '🍿',
  'Getränke': '🍹',
  'Sonstiges': '📦'
}

const DEFAULT_FOLDER_NAMES = Object.keys(DEFAULT_FOLDERS)

export default function Archive() {
  const [photos, setPhotos] = useState<PhotoItem[]>([])
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
  
  // Zustand für Großansicht (Preview)
  const [activePhoto, setActivePhoto] = useState<PhotoItem | null>(null)

  // Zoom & Pan Status für die Großansicht
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const isDragging = useRef(false)
  const startPos = useRef({ x: 0, y: 0 })

  // Zustand für das Umbenennen von Ordnern
  const [editingFolder, setEditingFolder] = useState<string | null>(null)
  const [newFolderName, setNewFolderName] = useState<string>('')

  useEffect(() => {
    const saved = localStorage.getItem('mhx_archive_photos')
    if (saved) {
      setPhotos(JSON.parse(saved))
    }
  }, [])

  // Zoom zurücksetzen, wenn ein neues Foto geöffnet wird
  const openPhotoModal = (photo: PhotoItem) => {
    setScale(1)
    setPosition({ x: 0, y: 0 })
    setActivePhoto(photo)
  }

  // Alle Ordner laden (Standard + custom Ordner)
  const customCategories = photos.map(p => p.category)
  const allFolders = Array.from(new Set([...DEFAULT_FOLDER_NAMES, ...customCategories]))

  // Hilfsfunktion: Gibt das Icon für den Ordner zurück
  const getFolderIcon = (folderName: string) => {
    return DEFAULT_FOLDERS[folderName] || '📂'
  }

  // Ordner umbenennen & alle zugehörigen Fotos aktualisieren
  const handleRenameFolder = (oldFolder: string) => {
    const trimmedName = newFolderName.trim()
    if (!trimmedName || trimmedName === oldFolder) {
      setEditingFolder(null)
      return
    }

    const updatedPhotos = photos.map(photo => {
      if (photo.category === oldFolder) {
        return { ...photo, category: trimmedName }
      }
      return photo
    })

    setPhotos(updatedPhotos)
    localStorage.setItem('mhx_archive_photos', JSON.stringify(updatedPhotos))
    setEditingFolder(null)
    setNewFolderName('')
  }

  // Foto in den Papierkorb verschieben
  const handleDelete = (photoToDelete: PhotoItem) => {
    const updatedArchive = photos.filter(item => item.id !== photoToDelete.id)
    setPhotos(updatedArchive)
    localStorage.setItem('mhx_archive_photos', JSON.stringify(updatedArchive))

    const savedTrash = localStorage.getItem('mhx_trash_photos')
    const currentTrash: PhotoItem[] = savedTrash ? JSON.parse(savedTrash) : []

    const photoForTrash = {
      ...photoToDelete,
      deletedAt: new Date().toISOString()
    }

    const updatedTrash = [...currentTrash, photoForTrash]
    localStorage.setItem('mhx_trash_photos', JSON.stringify(updatedTrash))

    if (activePhoto?.id === photoToDelete.id) {
      setActivePhoto(null)
    }
  }

  // Favorit umschalten
  const toggleFavorite = (id: string) => {
    const updated = photos.map(photo => {
      if (photo.id === id) {
        return { ...photo, favorite: !photo.favorite }
      }
      return photo
    })
    setPhotos(updated)
    localStorage.setItem('mhx_archive_photos', JSON.stringify(updated))

    if (activePhoto?.id === id) {
      setActivePhoto(prev => prev ? { ...prev, favorite: !prev.favorite } : null)
    }
  }

  // Foto auf Handy sichern
  const handleDownload = async (photoUrl: string) => {
    try {
      const response = await fetch(photoUrl)
      const blob = await response.blob()
      
      if (navigator.share && navigator.canShare) {
        const file = new File([blob], `mhx-rezept-${Date.now()}.jpg`, { type: blob.type })
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: 'MHX-Kitchen Rezept',
          })
          return
        }
      }

      const blobUrl = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = `mhx-rezept-${Date.now()}.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(blobUrl)
    } catch (e) {
      window.open(photoUrl, '_blank')
    }
  }

  // Foto via WhatsApp teilen
  const handleWhatsAppShare = (photoUrl: string) => {
    const text = encodeURIComponent(`Schau dir dieses Rezept an: ${photoUrl}`)
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank')
  }

  // Anzahl Fotos pro Ordner berechnen
  const getPhotoCount = (folderName: string) => {
    return photos.filter(p => p.category === folderName).length
  }

  // Zoom-Logik
  const handleDoubleClick = () => {
    if (scale > 1) {
      setScale(1)
      setPosition({ x: 0, y: 0 })
    } else {
      setScale(2.5)
    }
  }

  // Touch & Drag Handling fürs Verschieben
  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    isDragging.current = true
    startPos.current = { x: clientX - position.x, y: clientY - position.y }
  }

  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDragging.current || scale === 1) return
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    setPosition({
      x: clientX - startPos.current.x,
      y: clientY - startPos.current.y
    })
  }

  const handleTouchEnd = () => {
    isDragging.current = false
  }

  // Fotos des aktuell geöffneten Ordners
  const folderPhotos = selectedFolder 
    ? photos.filter(p => p.category === selectedFolder)
    : []

  return (
    <div style={{ padding: '24px 16px', minHeight: '100vh', backgroundColor: '#0f172a', color: 'white', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        {selectedFolder ? (
          <button 
            onClick={() => setSelectedFolder(null)}
            style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            ← Zurück zu Ordnern
          </button>
        ) : (
          <Link to="/" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '16px' }}>← Startseite</Link>
        )}
        <h1 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          {selectedFolder ? `${getFolderIcon(selectedFolder)} ${selectedFolder}` : '📂 Mein Archiv'}
        </h1>
        <div style={{ width: '60px' }}></div>
      </div>

      {/* ANSICHT 1: Ordner-Kacheln mit Icons nebeneinander */}
      {!selectedFolder && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px' }}>
          {allFolders.map(folderName => {
            const isDefaultFolder = DEFAULT_FOLDER_NAMES.includes(folderName)

            return (
              <div
                key={folderName}
                style={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ fontSize: '28px', cursor: 'pointer' }} onClick={() => setSelectedFolder(folderName)}>
                    {getFolderIcon(folderName)}
                  </div>
                  {!isDefaultFolder && editingFolder !== folderName && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setEditingFolder(folderName)
                        setNewFolderName(folderName)
                      }}
                      title="Ordner umbenennen"
                      style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '14px', padding: '2px' }}
                    >
                      ✏️
                    </button>
                  )}
                </div>

                {editingFolder === folderName ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
                    <input
                      type="text"
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      autoFocus
                      style={{
                        backgroundColor: '#0f172a',
                        color: 'white',
                        border: '1px solid #3b82f6',
                        borderRadius: '6px',
                        padding: '6px',
                        fontSize: '13px',
                        width: '100%',
                        boxSizing: 'border-box'
                      }}
                    />
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        onClick={() => handleRenameFolder(folderName)}
                        style={{ flex: 1, backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', padding: '4px', fontSize: '11px', cursor: 'pointer' }}
                      >
                        OK
                      </button>
                      <button
                        onClick={() => setEditingFolder(null)}
                        style={{ flex: 1, backgroundColor: '#475569', color: 'white', border: 'none', borderRadius: '4px', padding: '4px', fontSize: '11px', cursor: 'pointer' }}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ) : (
                  <div onClick={() => setSelectedFolder(folderName)} style={{ cursor: 'pointer' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '15px', color: '#f8fafc', wordBreak: 'break-word' }}>{folderName}</div>
                    <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>{getPhotoCount(folderName)} Fotos</div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* ANSICHT 2: Fotos im geöffneten Ordner */}
      {selectedFolder && (
        <div>
          {folderPhotos.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#64748b', marginTop: '60px' }}>
              <p style={{ fontSize: '48px', marginBottom: '8px' }}>📷</p>
              <p>Keine Fotos im Ordner "{selectedFolder}".</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px' }}>
              {folderPhotos.map(photo => (
                <div key={photo.id} style={{ backgroundColor: '#1e293b', borderRadius: '12px', overflow: 'hidden', border: '1px solid #334155' }}>
                  <img 
                    src={photo.url} 
                    alt={photo.category} 
                    onClick={() => openPhotoModal(photo)}
                    style={{ width: '100%', height: '140px', objectFit: 'cover', cursor: 'pointer' }} 
                  />
                  
                  <div style={{ padding: '8px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '4px' }}>
                    <button
                      onClick={() => toggleFavorite(photo.id)}
                      title="Favorit"
                      style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', padding: '2px', color: photo.favorite ? '#f59e0b' : '#64748b' }}
                    >
                      {photo.favorite ? '⭐' : '☆'}
                    </button>

                    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                      <button
                        onClick={() => handleWhatsAppShare(photo.url)}
                        title="Per WhatsApp teilen"
                        style={{ backgroundColor: '#25d366', color: 'white', border: 'none', width: '28px', height: '28px', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        💬
                      </button>

                      <button
                        onClick={() => handleDownload(photo.url)}
                        title="Auf Handy sichern"
                        style={{ backgroundColor: '#3b82f6', color: 'white', border: 'none', width: '28px', height: '28px', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        💾
                      </button>

                      <button
                        onClick={() => handleDelete(photo)}
                        title="Löschen"
                        style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer', height: '28px' }}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL / GROSSANSICHT MIT ZOOM */}
      {activePhoto && (
        <div 
          onClick={() => setActivePhoto(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.95)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '16px',
            touchAction: 'none'
          }}
        >
          {/* Schließen Button */}
          <button 
            onClick={() => setActivePhoto(null)}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              backgroundColor: '#334155',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              fontSize: '20px',
              cursor: 'pointer',
              zIndex: 10000
            }}
          >
            ✕
          </button>

          {/* Bildbereich mit Zoom & Pan */}
          <div 
            onClick={(e) => e.stopPropagation()} 
            onDoubleClick={handleDoubleClick}
            onMouseDown={handleTouchStart}
            onMouseMove={handleTouchMove}
            onMouseUp={handleTouchEnd}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{ 
              maxWidth: '100%', 
              maxHeight: '75vh', 
              overflow: 'hidden',
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              cursor: scale > 1 ? 'grab' : 'zoom-in'
            }}
          >
            <img 
              src={activePhoto.url} 
              alt="Großansicht" 
              style={{ 
                maxWidth: '100%', 
                maxHeight: '70vh', 
                objectFit: 'contain', 
                borderRadius: '12px', 
                transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
                transition: isDragging.current ? 'none' : 'transform 0.2s ease',
                userSelect: 'none'
              }} 
            />
          </div>

          <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '8px', zIndex: 10000 }}>
            Tipp: Doppelklick zum Zoomen & Wischen zum Verschieben
          </div>

          {/* Aktionsleiste */}
          <div onClick={(e) => e.stopPropagation()} style={{ display: 'flex', gap: '12px', marginTop: '12px', backgroundColor: '#1e293b', padding: '10px 20px', borderRadius: '12px', border: '1px solid #334155', zIndex: 10000 }}>
            <button
              onClick={() => toggleFavorite(activePhoto.id)}
              style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: activePhoto.favorite ? '#f59e0b' : '#64748b' }}
            >
              {activePhoto.favorite ? '⭐' : '☆'}
            </button>

            <button
              onClick={() => handleWhatsAppShare(activePhoto.url)}
              style={{ backgroundColor: '#25d366', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '8px', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              💬 Teilen
            </button>

            <button
              onClick={() => handleDownload(activePhoto.url)}
              style={{ backgroundColor: '#3b82f6', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '8px', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              💾 Sichern
            </button>

            <button
              onClick={() => handleDelete(activePhoto)}
              style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '8px', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              🗑️
            </button>
          </div>
        </div>
      )}

    </div>
  )
}