import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div style={{ padding: '24px 16px', minHeight: '100vh', backgroundColor: '#0f172a', color: 'white', fontFamily: 'system-ui, sans-serif', textAlign: 'center' }}>
      
      {/* Titel */}
      <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: '20px 0 4px 0', letterSpacing: '1px' }}>
        MHX-KITCHEN
      </h1>
      <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '32px' }}>
        Dein Rezept- & Fotoarchiv
      </p>

      {/* Button-Liste */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '400px', margin: '0 auto' }}>
        
        {/* 1. Foto hochladen */}
        <Link to="/scan" style={{ textDecoration: 'none' }}>
          <div style={{ backgroundColor: '#3b82f6', borderRadius: '20px', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '16px', textAlign: 'left', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)' }}>
            <span style={{ fontSize: '32px' }}>📸</span>
            <div>
              <div style={{ color: 'white', fontWeight: 'bold', fontSize: '18px' }}>Foto hochladen</div>
              <div style={{ color: '#dbeafe', fontSize: '13px' }}>Neues Gericht knipsen</div>
            </div>
          </div>
        </Link>

        {/* 2. Mein Archiv */}
        <Link to="/archive" style={{ textDecoration: 'none' }}>
          <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '20px', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '16px', textAlign: 'left' }}>
            <span style={{ fontSize: '32px' }}>📁</span>
            <div>
              <div style={{ color: 'white', fontWeight: 'bold', fontSize: '18px' }}>Mein Archiv</div>
              <div style={{ color: '#94a3b8', fontSize: '13px' }}>Alle Ordner & Speisen</div>
            </div>
          </div>
        </Link>

        {/* 3. Favoriten */}
        <Link to="/favorites" style={{ textDecoration: 'none' }}>
          <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '20px', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '16px', textAlign: 'left' }}>
            <span style={{ fontSize: '32px' }}>⭐</span>
            <div>
              <div style={{ color: 'white', fontWeight: 'bold', fontSize: '18px' }}>Favoriten</div>
              <div style={{ color: '#94a3b8', fontSize: '13px' }}>Gespeicherte Lieblingsgerichte</div>
            </div>
          </div>
        </Link>

        {/* 4. Papierkorb */}
        <Link to="/trash" style={{ textDecoration: 'none' }}>
          <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '20px', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '16px', textAlign: 'left' }}>
            <span style={{ fontSize: '32px' }}>🗑️</span>
            <div>
              <div style={{ color: 'white', fontWeight: 'bold', fontSize: '18px' }}>Papierkorb</div>
              <div style={{ color: '#94a3b8', fontSize: '13px' }}>Gelöschte Fotos (30 Tage)</div>
            </div>
          </div>
        </Link>

      </div>
    </div>
  )
}