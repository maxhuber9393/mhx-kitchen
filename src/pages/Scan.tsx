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

  const handleSave = async () => {
    if (!file) return alert('Bitte wähle zuerst ein Bild aus!')
    
    const targetFolder = selectedFolder === 'NEW' ? customFolder.trim() : selectedFolder
    if (!targetFolder) return alert('Bitte gib einen Ordnernamen ein!')

    setLoading(true)

    try {
      if (!supabase) return

      // Unique Dateiname für Supabase Storage
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
    <div style={{ padding: '20px', minHeight: '100vh', backgroundColor: '#0f172a', color: 'white', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', gap: '15px' }}>
        <Link to="/"><button style={{ padding: '8px 15px', backgroundColor: '#1e293b', color: 'white', border: '1px solid #334155', borderRadius: '8px', cursor: 'pointer' }}>← Startseite</button></Link>
        <h2 style={{ margin: 0, fontSize: '22px' }}>🖼️ Foto hochladen</h2>
      </div>

      {preview && (
        <div style={{ marginBottom: '15px', textAlign: 'center' }}>
          <img src={preview} alt="Vorschau" style={{ width: '100%', maxHeight: '300px', objectFit: 'cover', borderRadius: '16px', border: '1px solid #334155' }} />
        </div>
      )}

      {/* Button für Fotomediathek / Album & Kamera auf dem iPhone */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
        <label style={{ display: 'block', padding: '16px', backgroundColor: '#3b82f6', color: 'white', borderRadius: '14px', fontWeight: 'bold', textAlign: 'center', cursor: 'pointer', fontSize: '16px' }}>
          {preview ? '🔄 Aus Mediathek / Album ändern' : '📱 Bild aus iPhone-Fotos wählen'}
          <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
        </label>

        <label style={{ display: 'block', padding: '12px', backgroundColor: '#1e293b', color: '#94a3b8', border: '1px solid #334155', borderRadius: '14px', fontWeight: 'bold', textAlign: 'center', cursor: 'pointer', fontSize: '14px' }}>
          📷 Direkt mit Kamera knipsen
          <input type="file" accept="image/*" capture="environment" onChange={handleFileChange} style={{ display: 'none' }} />
        </label>
      </div>

      <div style={{ marginBottom: '20px', backgroundColor: '#1e293b', padding: '15px', borderRadius: '14px', border: '1px solid #334155' }}>
        <label style={{ display: 'block', marginBottom: '8px', color: '#94a3b8', fontWeight: 'bold' }}>Zielordner wählen:</label>
        <select value={selectedFolder} onChange={(e) => setSelectedFolder(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', backgroundColor: '#0f172a', color: 'white', border: '1px solid #334155', fontSize: '16px' }}>
          {folders.map(f => <option key={f} value={f}>📁 {f}</option>)}
          <option value="NEW">➕ Neuen Ordner erstellen...</option>
        </select>

        {selectedFolder === 'NEW' && (
          <input type="text" placeholder="Neuer Ordnername..." value={customFolder} onChange={(e) => setCustomFolder(e.target.value)} style={{ width: '100%', padding: '12px', marginTop: '10px', borderRadius: '8px', backgroundColor: '#0f172a', color: 'white', border: '1px solid #334155', boxSizing: 'border-box' }} />
        )}
      </div>

      <button onClick={handleSave} disabled={loading} style={{ width: '100%', padding: '18px', backgroundColor: '#22c55e', color: 'white', border: 'none', borderRadius: '14px', fontSize: '18px', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer' }}>
        {loading ? 'Wird hochgeladen...' : '💾 Im gewählten Ordner speichern'}
      </button>
    </div>
  )
}