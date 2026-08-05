import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

interface PhotoItem {
  id: string
  url: string
  category: string
  deletedAt: string
}

export default function Trash() {
  const [trashItems, setTrashItems] = useState<PhotoItem[]>([])

  useEffect(() => {
    const savedTrash = localStorage.getItem('mhx_trash_photos')
    if (savedTrash) {
      const parsedTrash: PhotoItem[] = JSON.parse(savedTrash)
      const now = new Date().getTime()
      const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000

      const validTrash = parsedTrash.filter(item => {
        const deletedTime = new Date(item.deletedAt).getTime()
        return now - deletedTime < thirtyDaysInMs
      })

      setTrashItems(validTrash)
      localStorage.setItem('mhx_trash_photos', JSON.stringify(validTrash))
    }
  }, [])

  const handleRestore = (id: string) => {
    const itemToRestore = trashItems.find(item => item.id === id)
    if (!itemToRestore) return

    const savedArchive = localStorage.getItem('mhx_archive_photos')
    const archive = savedArchive ? JSON.parse(savedArchive) : []
    const updatedArchive = [...archive, itemToRestore]
    localStorage.setItem('mhx_archive_photos', JSON.stringify(updatedArchive))

    const updatedTrash = trashItems.filter(item => item.id !== id)
    setTrashItems(updatedTrash)
    localStorage.setItem('mhx_trash_photos', JSON.stringify(updatedTrash))
  }

  const handlePermanentDelete = (id: string) => {
    const updatedTrash = trashItems.filter(item => item.id !== id)
    setTrashItems(updatedTrash)
    localStorage.setItem('mhx_trash_photos', JSON.stringify(updatedTrash))
  }

  const getDaysLeft = (deletedAt: string) => {
    const deletedTime = new Date(deletedAt).getTime()
    const now = new Date().getTime()
    const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000
    const diff = thirtyDaysInMs - (now - deletedTime)
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
    return days > 0 ? days : 0
  }

  return (
    <div style={{ padding: '24px 16px', minHeight: '100vh', backgroundColor: '#0f172a', color: 'white', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <Link to="/" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '18px' }}>← Startseite</Link>
        <h1 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>🗑️ Papierkorb</h1>
        <div style={{ width: '60px' }}></div>
      </div>

      <p style={{ color: '#94a3b8', fontSize: '14px', textAlign: 'center', marginBottom: '24px' }}>
        Fotos werden nach 30 Tagen automatisch endgültig gelöscht.
      </p>

      {/* Foto Liste */}
      {trashItems.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#64748b', marginTop: '60px' }}>
          <p style={{ fontSize: '48px', marginBottom: '8px' }}>🗑️</p>
          <p>Der Papierkorb ist leer.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '16px' }}>
          {trashItems.map(photo => (
            <div key={photo.id} style={{ backgroundColor: '#1e293b', borderRadius: '12px', overflow: 'hidden', border: '1px solid #334155' }}>
              <img src={photo.url} alt={photo.category} style={{ width: '100%', height: '140px', objectFit: 'cover' }} />
              <div style={{ padding: '12px' }}>
                <span style={{ fontSize: '11px', color: '#ef4444', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>
                  ⏳ Noch {getDaysLeft(photo.deletedAt)} Tage
                </span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    onClick={() => handleRestore(photo.id)}
                    style={{ flex: 1, backgroundColor: '#3b82f6', color: 'white', border: 'none', padding: '6px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}>
                    ↩️
                  </button>
                  <button 
                    onClick={() => handlePermanentDelete(photo.id)}
                    style={{ flex: 1, backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '6px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}>
                    🔥
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}