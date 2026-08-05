import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { Link, useNavigate } from 'react-router-dom'

export default function Scan() {
  const navigate = useNavigate()
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [folders, setFolders] = useState<string[]>([])
  const [selectedFolder, setSelectedFolder] = useState<string>('Hauptspeisen')
  const [customFolder, setCustomFolder] = useState<string>('')
  const [isCreatingNewFolder, setIsCreatingNewFolder] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    const fetchFolders = async () => {
      if (!supabase) return
      const { data: dbFolders } = await supabase.from('folders').select('name')
      const { data: dbPhotos } = await supabase.from('photos').select('folder_name')
      const defaults = ['Hauptspeisen', 'Desserts', 'Snacks', 'Getränke']
      const fromFolders = dbFolders ? dbFolders.map(f => f.name) : []
      const fromPhotos = dbPhotos ? dbPhotos.map(p => p.folder_name).filter(Boolean) : []
      const allFolders = Array.from(new Set([...defaults, ...fromFolders, ...fromPhotos]))
      setFolders(allFolders)
      if (allFolders.length > 0) setSelectedFolder(allFolders[0])
    }
    fetchFolders()
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0]
      setFile(selected)
      setPreview(URL.createObjectURL(selected))
    }
  }

  const handleClearImage = () => {
    setFile(null)
    setPreview(null)
  }

  const handleSave = async () => {
    if (!file) return alert('Bitte wähle zuerst ein Bild aus!')
    
    const targetFolder = isCreatingNewFolder ? customFolder.trim() : selectedFolder
    if (!targetFolder) return alert('Bitte gib einen Ordnernamen ein!')

    setLoading(true)

    try {
      if (!supabase) return

      const fileExt = file.name.split('.').pop() || 'jpg'
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`
      
      const { error: uploadError } = await supabase.storage.from('photos').upload(fileName, file)
      
      if (uploadError) {
        alert('Upload-Fehler: ' + uploadError.message)
        setLoading(false)
        return
      }

      const { data: urlData } = supabase.storage.from('photos').getPublicUrl(fileName)

      await supabase.from('folders').insert([{ name: targetFolder }])
      await supabase.from('photos').insert([{ folder_name: targetFolder, image_url: urlData.publicUrl }])

      alert(`Bild erfolgreich im Ordner "${targetFolder}" gespeichert!`)
      navigate('/archive')
    } catch (err) {
      alert('Fehler beim Speichern!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '20px', minHeight: '100vh', backgroundColor: '#0f172a', color: 'white', boxSizing: 'border-box', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', gap: '15px' }}>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <button style={{ padding: '8px 14px', backgroundColor: '#1e293b', color: 'white', border: '1px solid #334155', borderRadius: '10px', cursor: 'pointer', fontSize: '14px' }}>
            ← Zurück
          </button>
        </Link>
        <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>📸 Foto hinzufügen</h2>
      </div>

      {/* Foto Vorschau (falls gewählt) */}
      {preview ? (
        <div style={{ marginBottom: '20px', position: 'relative' }}>
          <img src={preview} alt="Vorschau" style={{ width: '100%', maxHeight: '220px', objectFit: 'cover', borderRadius: '16px', border: '2px solid #3b82f6' }} />
          <button 
            onClick={handleClearImage}
            style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: 'rgba(239, 68, 68, 0.9)', color: 'white', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}
          >
            ✕
          </button>
        </div>
      ) : (
        /* Schritt 1: Bildquelle auswählen */
        <div style={{ marginBottom: '25px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#94a3b8', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            1. Quelle wählen
          </label>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <label style={{ backgroundColor: '#1e293b', border: '1px dashed #3b82f6', borderRadius: '16px', padding: '20px 10px', textAlign: 'center', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '32px' }}>🖼️</span>
              <span style={{ fontSize: '14px', fontWeight: 'bold' }}>Fotomediathek</span>
              <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
            </label>

            <label style={{ backgroundColor: '#1e293b', border: '1px dashed #3b82f6', borderRadius: '16px', padding: '20px 10px', textAlign: 'center', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '32px' }}>📷</span>
              <span style={{ fontSize: '14px', fontWeight: 'bold' }}>Kamera</span>
              <input type="file" accept="image/*" capture="environment" onChange={handleFileChange} style={{ display: 'none' }} />
            </label>
          </div>
        </div>
      )}

      {/* Schritt 2: Zielordner als Kacheln */}
      <div style={{ marginBottom: '25px' }}>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#94a3b8', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          2. Zielordner wählen
        </label>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {folders.map(f => (
            <button
              key={f}
              onClick={() => { setSelectedFolder(f); setIsCreatingNewFolder(false); }}
              style={{
                padding: '10px 16px',
                borderRadius: '20px',
                border: selectedFolder === f && !isCreatingNewFolder ? '2px solid #3b82f6' : '1px solid #334155',
                backgroundColor: selectedFolder === f && !isCreatingNewFolder ? '#1d4ed8' : '#1e293b',
                color: 'white',
                fontSize: '14px',
                fontWeight: selectedFolder === f && !isCreatingNewFolder ? 'bold' : 'normal',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              📁 {f}
            </button>
          ))}

          <button
            onClick={() => setIsCreatingNewFolder(true)}
            style={{
              padding: '10px 16px',
              borderRadius: '20px',
              border: isCreatingNewFolder ? '2px solid #3b82f6' : '1px dashed #64748b',
              backgroundColor: isCreatingNewFolder ? '#1d4ed8' : 'transparent',
              color: 'white',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            ➕ Neuer Ordner
          </button>
        </div>

        {isCreatingNewFolder && (
          <input 
            type="text" 
            placeholder="Neuer Ordnername..." 
            value={customFolder} 
            onChange={(e) => setCustomFolder(e.target.value)} 
            autoFocus
            style={{ width: '100%', padding: '12px', marginTop: '12px', borderRadius: '12px', backgroundColor: '#1e293b', color: 'white', border: '1px solid #3b82f6', fontSize: '15px', boxSizing: 'border-box', outline: 'none' }} 
          />
        )}
      </div>

      {/* Speichern Button */}
      <button 
        onClick={handleSave} 
        disabled={loading || !file} 
        style={{ 
          width: '100%', 
          padding: '16px', 
          backgroundColor: file ? '#22c55e' : '#334155', 
          color: 'white', 
          border: 'none', 
          borderRadius: '16px', 
          fontSize: '17px', 
          fontWeight: 'bold', 
          cursor: file && !loading ? 'pointer' : 'not-allowed',
          opacity: loading ? 0.7 : 1,
          boxShadow: file ? '0 4px 14px rgba(34, 197, 94, 0.4)' : 'none',
          transition: 'all 0.2s ease'
        }}
      >
        {loading ? 'Wird hochgeladen...' : file ? `💾 In "${isCreatingNewFolder ? (customFolder || 'Neuer Ordner') : selectedFolder}" speichern` : 'Bitte erst ein Foto wählen'}
      </button>

    </div>
  )
}