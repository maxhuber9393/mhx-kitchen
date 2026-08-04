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

  // Alle vorhandenen Ordner aus Supabase laden
  useEffect(() => {
    const fetchFolders = async () => {
      try {
        if (!supabase) return
        const { data: dbFolders } = await supabase.from('folders').select('name')
        const { data: dbPhotos } = await supabase.from('photos').select('folder_name')

        const defaults = ['Hauptspeisen', 'Desserts', 'Snacks', 'Getränke']
        const fromFolders = dbFolders ? dbFolders.map(f => f.name) : []
        const fromPhotos = dbPhotos ? dbPhotos.map(p => p.folder_name).filter(Boolean) : []

        const allFolders = Array.from(new Set([...defaults, ...fromFolders, ...fromPhotos]))
        setFolders(allFolders)
        if (allFolders.length > 0) setSelectedFolder(allFolders[0])
      } catch (err) {
        console.error('Fehler beim Laden der Ordner:', err)
      }
    }
    fetchFolders()
  }, [])

  // Foto auswählen oder knipsen
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0]
      setFile(selected)
      setPreview(URL.createObjectURL(selected))
    }
  }

  // Speichern
  const handleSave = async () => {
    if (!file && !preview) {
      alert('Bitte wähle zuerst ein Foto aus!')
      return
    }

    setLoading(true)

    // Welcher Ordnername soll verwendet werden?
    const targetFolder = selectedFolder === 'NEW' 
      ? customFolder.trim() 
      : selectedFolder

    if (!targetFolder) {
      alert('Bitte gib einen Ordnernamen ein!')
      setLoading(false)
      return
    }

    try {
      let imageUrl = preview || ''

      // Bild in Supabase Storage hochladen (falls eingerichtet)
      if (supabase && file) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}.${fileExt}`
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('photos')
          .upload(fileName, file)

        if (!uploadError && uploadData) {
          const { data: publicUrlData } = supabase.storage
            .from('photos')
            .getPublicUrl(fileName)
          if (publicUrlData) {
            imageUrl = publicUrlData.publicUrl
          }
        }
      }

      if (supabase) {
        // 1. Ordner explizit in der 'folders' Tabelle anlegen
        const { error: folderError } = await supabase
          .from('folders')
          .insert([{ name: targetFolder }])
          .select()

        if (folderError && folderError.code !== '23505') { // 23505 = existiert bereits, ignorieren
          console.error('Fehler beim Ordner-Erstellen:', folderError)
        }

        // 2. Foto-Eintrag in 'photos' speichern
        const { error: photoError } = await supabase
          .from('photos')
          .insert([{ folder_name: targetFolder, image_url: imageUrl }])

        if (photoError) {
          alert('Fehler beim Speichern des Fotos: ' + photoError.message)
          setLoading(false)
          return
        }
      }

      alert(`Foto erfolgreich im Ordner "${targetFolder}" archiviert!`)
      navigate('/archive')
    } catch (err) {
      console.error('Fehler beim Speichern:', err)
      alert('Fehler beim Speichern. Bitte erneut versuchen.')
    } finally {
      setLoading(false)
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
        <h2 style={{ margin: 0, fontSize: '22px' }}>📸 Foto archivieren</h2>
      </div>

      {/* Foto-Vorschau oder Kamera-Button */}
      <div style={{ marginBottom: '20px', textAlign: 'center' }}>
        {preview ? (
          <div style={{ marginBottom: '15px' }}>
            <img 
              src={preview} 
              alt="Vorschau" 
              style={{ width: '100%', maxHeight: '300px', objectFit: 'cover', borderRadius: '16px', border: '1px solid #334155' }} 
            />
          </div>
        ) : null}

        <label style={{
          display: 'block',
          width: '100%',
          padding: '18px',
          backgroundColor: '#3b82f6',
          color: 'white',
          borderRadius: '14px',
          fontWeight: 'bold',
          fontSize: '18px',
          textAlign: 'center',
          cursor: 'pointer',
          boxSizing: 'border-box'
        }}>
          {preview ? '🔄 Anderes Foto wählen' : '📷 Foto aufnehmen / auswählen'}
          <input 
            type="file" 
            accept="image/*" 
            capture="environment" 
            onChange={handleFileChange} 
            style={{ display: 'none' }} 
          />
        </label>
      </div>

      {/* Ordner-Auswahl */}
      <div style={{ marginBottom: '25px', backgroundColor: '#1e293b', padding: '15px', borderRadius: '14px', border: '1px solid #334155' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#94a3b8' }}>
          Ordner auswählen:
        </label>
        
        <select
          value={selectedFolder}
          onChange={(e) => setSelectedFolder(e.target.value)}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '8px',
            border: '1px solid #334155',
            backgroundColor: '#0f172a',
            color: 'white',
            fontSize: '16px',
            marginBottom: selectedFolder === 'NEW' ? '12px' : '0'
          }}
        >
          {folders.map(f => (
            <option key={f} value={f}>📁 {f}</option>
          ))}
          <option value="NEW">➕ Neuen Ordner erstellen...</option>
        </select>

        {/* Eingabefeld für neuen Ordner */}
        {selectedFolder === 'NEW' && (
          <input
            type="text"
            placeholder="Neuer Ordnername..."
            value={customFolder}
            onChange={(e) => setCustomFolder(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #334155',
              backgroundColor: '#0f172a',
              color: 'white',
              fontSize: '16px',
              boxSizing: 'border-box'
            }}
          />
        )}
      </div>

      {/* Speichern Button */}
      <button
        onClick={handleSave}
        disabled={loading}
        style={{
          width: '100%',
          padding: '18px',
          backgroundColor: '#22c55e',
          color: 'white',
          border: 'none',
          borderRadius: '14px',
          fontSize: '18px',
          fontWeight: 'bold',
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.7 : 1
        }}
      >
        {loading ? 'Wird gespeichert...' : '💾 Im Archiv speichern'}
      </button>
    </div>
  )
}