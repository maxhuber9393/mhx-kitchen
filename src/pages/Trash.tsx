import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabase'

interface Photo {
  id: string
  url: string
  category: string
  deleted_at?: string
}

export default function Trash() {
  const [photos, setPhotos] = useState<Photo[]>([])

  const fetchTrashPhotos = async () => {
    const { data, error } = await supabase
      .from('photos')
      .select('*')
      .eq('deleted', true)

    if (!error && data) {
      setPhotos(data)
    }
  }

  useEffect(() => {
    fetchTrashPhotos()

    const channel = supabase
      .channel('schema-db-trash')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'photos' }, () => fetchTrashPhotos())
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  // Foto wiederherstellen
  const handleRestore = async (id: string) => {
    await supabase.from('photos').update({ deleted: false, deleted_at: null }).eq('id', id)
    fetchTrashPhotos()
  }

  // Endgültig löschen
  const handleDeletePermanently = async (photo: Photo) => {
    if (!window.confirm('Möchtest du dieses Foto wirklich endgültig löschen?')) return
    await supabase.from('photos').delete().eq('id', photo.id)
    const urlParts = photo.url.split('/')
    const fileName = urlParts[urlParts.length - 1]
    if (fileName) {
      await supabase.storage.from('recipes').remove([fileName])
    }
    fetchTrashPhotos()
  }

  return (
    <div style={{ padding: '24px 16px', minHeight: '100vh', backgroundColor: '#0f172a', color: 'white', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <Link to="/" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '16px' }}>← Startseite</Link>
        <h1 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          🗑️ Papierkorb
        </h1>
        <div style={{ width: '60px' }}></div>
      </div>

      <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '14px', marginBottom: '24px' }}>
        Fotos werden nach 30 Tagen automatisch endgültig gelöscht.
      </p>

      {photos.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#94a3b8', marginTop: '60px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🗑️</div>
          <div>Der Papierkorb ist leer.</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '16px' }}>
          {photos.map(photo => (
            <div key={photo.id} style={{ backgroundColor: '#1e293b', borderRadius: '12px', overflow: 'hidden', border: '1px solid #334155' }}>
              <img src={photo.url} alt="Gelöschtes Foto" style={{ width: '100%', height: '140px', objectFit: 'cover' }} />
              <div style={{ padding: '8px', display: 'flex', justifyContent: 'space-between', gap: '4px' }}>
                <button 
                  onClick={() => handleRestore(photo.id)}
                  style={{ backgroundColor: '#3b82f6', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', flex: 1 }}
                >
                  ↩️ Wiederherstellen
                </button>
                <button 
                  onClick={() => handleDeletePermanently(photo)}
                  style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}
                >
                  ❌
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}