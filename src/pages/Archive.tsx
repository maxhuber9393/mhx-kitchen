import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabase'

interface Photo {
  id: string
  url: string
  category: string
  favorite: boolean
}

export default function Archive() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('Alle')

  // Fotos aus Supabase laden
  const fetchPhotos = async () => {
    const { data, error } = await supabase
      .from('photos')
      .select('*')
      .order('created_at', { ascending: false })

    if (data && !error) {
      setPhotos(data)
    }
  }

  useEffect(() => {
    fetchPhotos()

    // ⚡ REALTIME LIVE-SYNC: Reagiert sofort, wenn deine Freundin ein Foto hochlädt
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

  const categories = ['Alle', ...Array.from(new Set(photos.map(p => p.category)))]
  const filteredPhotos = selectedCategory === 'Alle' 
    ? photos 
    : photos.filter(p => p.category === selectedCategory)

  return (
    <div style={{ padding: '24px 16px', minHeight: '100vh', backgroundColor: '#0f172a', color: 'white', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <Link to="/" style={{ color: '#94a3b8', textDecoration: 'none' }}>← Startseite</Link>
        <h1 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>📁 Rezept-Archiv</h1>
        <div style={{ width: '60px' }}></div>
      </div>

      {/* Ordner-Filter */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', marginBottom: '20px' }}>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: 'none',
              backgroundColor: selectedCategory === cat ? '#3b82f6' : '#1e293b',
              color: 'white',
              whiteSpace: 'nowrap',
              cursor: 'pointer'
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Raster-Anzeige der Bilder */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px' }}>
        {filteredPhotos.map(photo => (
          <div key={photo.id} style={{ backgroundColor: '#1e293b', borderRadius: '8px', overflow: 'hidden' }}>
            <img src={photo.url} alt="Rezept" style={{ width: '100%', height: '140px', objectFit: 'cover' }} />
            <div style={{ padding: '8px', fontSize: '12px', color: '#94a3b8' }}>{photo.category}</div>
          </div>
        ))}
      </div>
    </div>
  )
}