import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const DEFAULT_FOLDERS = [
  'Hauptspeisen',
  'Desserts',
  'Vorspeisen',
  'Snacks',
  'Getränke',
  'Sonstiges'
]

export default function Scan() {
  const navigate = useNavigate()
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [folders, setFolders] = useState<string[]>(DEFAULT_FOLDERS)
  const [selectedFolder, setSelectedFolder] = useState<string>('Hauptspeisen')
  const [isCreatingNew, setIsCreatingNew] = useState<boolean>(false)
  const [newFolderName, setNewFolderName] = useState<string>('')

  // Alle bereits existierenden Ordner laden
  useEffect(() => {
    const savedArchive = localStorage.getItem('mhx_archive_photos')
    if (savedArchive) {
      try {
        const photos = JSON.parse(savedArchive)
        const existingCategories: string[] = photos.map((p: any) => p.category).filter(Boolean)
        const allUniqueFolders = Array.from(new Set([...DEFAULT_FOLDERS, ...existingCategories]))
        setFolders(allUniqueFolders)
      } catch (e) {
        console.error('Fehler beim Laden der Ordner', e)
      }
    }
  }, [])

  // Hilfsfunktion: Bild komprimieren & verkleinern, damit localStorage nicht überläuft
  const resizeImage = (file: File, maxWidth = 1000): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          let width = img.width
          let height = img.height

          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width)
            width = maxWidth
          }

          canvas.width = width
          canvas.height = height

          const ctx = canvas.getContext('2d')
          ctx?.drawImage(img, 0, 0, width, height)

          // Als komprimiertes JPEG mit 80% Qualität zurückgeben
          resolve(canvas.toDataURL('image/jpeg', 0.8))
        }
        img.src = e.target?.result as string
      }
      reader.readAsDataURL(file)
    })
  }

  // Bild auswählen & komprimieren
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      const resizedBase64 = await resizeImage(file)
      setSelectedImage(resizedBase64)
    }
  }

  // Dropdown-Änderung
  const handleFolderSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    if (value === 'NEW_FOLDER') {
      setIsCreatingNew(true)
    } else {
      setIsCreatingNew(false)
      setSelectedFolder(value)
    }
  }

  // Foto im Archiv speichern
  const handleSave = () => {
    if (!selectedImage) return

    const targetCategory = isCreatingNew ? newFolderName.trim() : selectedFolder
    if (!targetCategory) return

    const newPhoto = {
      id: Date.now().toString(),
      url: selectedImage,
      category: targetCategory,
      favorite: false
    }

    try {
      const savedArchive = localStorage.getItem('mhx_archive_photos')
      const currentArchive = savedArchive ? JSON.parse(savedArchive) : []
      const updatedArchive = [...currentArchive, newPhoto]
      
      localStorage.setItem('mhx_archive_photos', JSON.stringify(updatedArchive))
      
      // Nach dem Speichern direkt ins Archiv leiten
      navigate('/archive')
    } catch (e) {
      alert('Der Speicher ist voll! Bitte lösche ein paar alte Fotos im Papierkorb.')
    }
  }

  return (
    <div style={{ padding: '24px 16px', minHeight: '100vh', backgroundColor: '#0f172a', color: 'white', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <Link to="/" style={{ color: '#94a3b8', textDecoration: 'none', fontSize: '16px' }}>← Startseite</Link>
        <h1 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>📷 Rezepte hochladen</h1>
        <div style={{ width: '60px' }}></div>
      </div>

      <div style={{ maxWidth: '500px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Foto-Auswahl */}
        <div style={{ backgroundColor: '#1e293b', border: '2px dashed #334155', borderRadius: '12px', padding: '30px', textAlign: 'center' }}>
          {selectedImage ? (
            <div>
              <img src={selectedImage} alt="Vorschau" style={{ width: '100%', maxHeight: '250px', objectFit: 'contain', borderRadius: '8px', marginBottom: '12px' }} />
              <button 
                onClick={() => setSelectedImage(null)}
                style={{ backgroundColor: '#334155', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}
              >
                🔄 Anderes Foto wählen
              </button>
            </div>
          ) : (
            <label style={{ cursor: 'pointer', display: 'block' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>📷</div>
              <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '4px' }}>Foto knipsen oder auswählen</div>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>Hier tippen, um Kamera oder Galerie zu öffnen</div>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageChange} 
                style={{ display: 'none' }} 
              />
            </label>
          )}
        </div>

        {/* Ordner-Auswahl */}
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#94a3b8' }}>Ziel-Ordner wählen:</label>
          <select 
            value={isCreatingNew ? 'NEW_FOLDER' : selectedFolder}
            onChange={handleFolderSelect}
            style={{
              width: '100%',
              backgroundColor: '#1e293b',
              color: 'white',
              border: '1px solid #334155',
              padding: '12px',
              borderRadius: '8px',
              fontSize: '16px',
              outline: 'none'
            }}
          >
            {folders.map(folder => (
              <option key={folder} value={folder}>{folder}</option>
            ))}
            <option value="NEW_FOLDER">➕ Neuen Ordner erstellen...</option>
          </select>

          {isCreatingNew && (
            <div style={{ marginTop: '12px' }}>
              <input 
                type="text"
                placeholder="Name des neuen Ordners..."
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                autoFocus
                style={{
                  width: '100%',
                  backgroundColor: '#0f172a',
                  color: 'white',
                  border: '1px solid #3b82f6',
                  padding: '12px',
                  borderRadius: '8px',
                  fontSize: '15px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          )}
        </div>

        {/* Speichern Button */}
        <button
          onClick={handleSave}
          disabled={!selectedImage || (isCreatingNew && !newFolderName.trim())}
          style={{
            backgroundColor: (selectedImage && (!isCreatingNew || newFolderName.trim())) ? '#3b82f6' : '#334155',
            color: (selectedImage && (!isCreatingNew || newFolderName.trim())) ? 'white' : '#64748b',
            border: 'none',
            padding: '16px',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: (selectedImage && (!isCreatingNew || newFolderName.trim())) ? 'pointer' : 'not-allowed',
            marginTop: '10px'
          }}
        >
          💾 Im Archiv speichern
        </button>

      </div>
    </div>
  )
}