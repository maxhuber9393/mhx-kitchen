import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'

const DEFAULT_FOLDERS = [
  { name: 'Hauptspeisen', icon: '🍲' },
  { name: 'Desserts', icon: '🍰' },
  { name: 'Vorspeisen', icon: '🥗' },
  { name: 'Snacks', icon: '🍿' },
  { name: 'Getränke', icon: '🍹' },
  { name: 'Sonstiges', icon: '📦' }
]

const EMOJI_OPTIONS = ['🍕', '🍔', '🌮', '🥩', '🍝', '🍜', '🍲', '🥗', '🍿', '🍰', '🧁', '🍦', '🍹', '☕', '🍞', '🥞', '🍣', '🥑', '📦', '📁', '🔥', '🍷']

export default function Upload() {
  const navigate = useNavigate()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [folders, setFolders] = useState<string[]>(DEFAULT_FOLDERS.map(f => f.name))
  const [selectedFolder, setSelectedFolder] = useState<string>('Hauptspeisen')
  const [isCreatingNew, setIsCreatingNew] = useState<boolean>(false)
  const [newFolderName, setNewFolderName] = useState<string>('')
  const [selectedIcon, setSelectedIcon] = useState<string>('📁')
  const [uploading, setUploading] = useState<boolean>(false)

  useEffect(() => {
    const fetchFolders = async () => {
      const { data } = await supabase.from('photos').select('category')
      if (data) {
        const categories = data.map((p: any) => p.category).filter(Boolean)
        const allUnique = Array.from(new Set([...DEFAULT_FOLDERS.map(f => f.name), ...categories]))
        setFolders(allUnique)
      }
    }
    fetchFolders()
  }, [])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setSelectedFile(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const handleSave = async () => {
    if (!selectedFile) return
    const targetCategory = isCreatingNew ? newFolderName.trim() : selectedFolder
    if (!targetCategory) return

    setUploading(true)

    try {
      const fileExt = selectedFile.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('recipes')
        .upload(fileName, selectedFile)

      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage
        .from('recipes')
        .getPublicUrl(fileName)

      const publicUrl = urlData.publicUrl

      const { error: dbError } = await supabase
        .from('photos')
        .insert([
          {
            id: Date.now().toString(),
            url: publicUrl,
            category: targetCategory,
            icon: isCreatingNew ? selectedIcon : null,
            favorite: false
          }
        ])

      if (dbError) throw dbError

      navigate('/archive')
    } catch (error: any) {
      alert('Fehler beim Hochladen: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div style={{ padding: '24px 16px', minHeight: '100vh', backgroundColor: '#0f172a', color: 'white', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <Link to="/" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '16px' }}>← Startseite</Link>
        <h1 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>📷 Rezepte hochladen</h1>
        <div style={{ width: '60px' }}></div>
      </div>

      <div style={{ maxWidth: '500px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ backgroundColor: '#1e293b', border: '2px dashed #334155', borderRadius: '12px', padding: '30px', textAlign: 'center' }}>
          {previewUrl ? (
            <div>
              <img src={previewUrl} alt="Vorschau" style={{ width: '100%', maxHeight: '250px', objectFit: 'contain', borderRadius: '8px', marginBottom: '12px' }} />
              <button onClick={() => { setSelectedFile(null); setPreviewUrl(null); }} style={{ backgroundColor: '#334155', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}>
                🔄 Anderes Foto wählen
              </button>
            </div>
          ) : (
            <label style={{ cursor: 'pointer', display: 'block' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>📷</div>
              <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '4px' }}>Foto auswählen</div>
              <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
            </label>
          )}
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#94a3b8' }}>Ziel-Ordner wählen:</label>
          <select 
            value={isCreatingNew ? 'NEW_FOLDER' : selectedFolder} 
            onChange={(e) => {
              if (e.target.value === 'NEW_FOLDER') { 
                setIsCreatingNew(true) 
              } else { 
                setIsCreatingNew(false)
                setSelectedFolder(e.target.value) 
              }
            }} 
            style={{ width: '100%', backgroundColor: '#1e293b', color: 'white', border: '1px solid #334155', padding: '12px', borderRadius: '8px', fontSize: '16px' }}
          >
            {folders.map(f => <option key={f} value={f}>{f}</option>)}
            <option value="NEW_FOLDER">➕ Neuen Ordner erstellen...</option>
          </select>

          {/* Bereich für Emoji-Auswahl bei neuem Ordner */}
          {isCreatingNew && (
            <div style={{ marginTop: '16px', backgroundColor: '#1e293b', padding: '16px', borderRadius: '12px', border: '1px solid #3b82f6' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: '#94a3b8' }}>Name des neuen Ordners:</label>
              <input 
                type="text" 
                placeholder="z. B. Grillen" 
                value={newFolderName} 
                onChange={(e) => setNewFolderName(e.target.value)} 
                style={{ width: '100%', backgroundColor: '#0f172a', color: 'white', border: '1px solid #334155', padding: '10px', borderRadius: '8px', boxSizing: 'border-box', marginBottom: '16px' }} 
              />

              <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: '#94a3b8' }}>Ordner-Symbol wählen:</label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {EMOJI_OPTIONS.map(emoji => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setSelectedIcon(emoji)}
                    style={{
                      fontSize: '22px',
                      padding: '8px',
                      borderRadius: '8px',
                      border: selectedIcon === emoji ? '2px solid #3b82f6' : '1px solid #334155',
                      backgroundColor: selectedIcon === emoji ? '#1e3a8a' : '#0f172a',
                      cursor: 'pointer'
                    }}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <button onClick={handleSave} disabled={!selectedFile || uploading} style={{ backgroundColor: selectedFile ? '#3b82f6' : '#334155', color: 'white', border: 'none', padding: '16px', borderRadius: '12px', fontSize: '16px', fontWeight: 'bold', cursor: selectedFile ? 'pointer' : 'not-allowed' }}>
          {uploading ? '⏳ Lädt hoch...' : '💾 Im Live-Archiv speichern'}
        </button>
      </div>
    </div>
  )
}