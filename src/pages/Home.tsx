import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div style={{ padding: '24px 16px', minHeight: '100vh', backgroundColor: '#0f172a', color: 'white', fontFamily: 'system-ui, sans-serif', maxWidth: '480px', margin: '0 auto', boxSizing: 'border-box' }}>
      
      {/* Header */}
      <div style={{ textAlign: 'center', margin: '20px 0 35px 0' }}>
        <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold' }}>MHX-KITCHEN</h1>
        <p style={{ margin: '6px 0 0 0', color: '#94a3b8', fontSize: '14px' }}>Dein Rezept- & Fotoarchiv</p>
      </div>

      {/* Buttons / Navigation */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        
        {/* Foto hochladen */}
        <Link to="/scan" style={{ textDecoration: 'none' }}>
          <div style={{ backgroundColor: '#3b82f6', borderRadius: '16px', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span style={{ fontSize: '24px' }}>📸</span>
            <div style={{ color: 'white' }}>
              <div style={{ fontWeight: 'bold', fontSize: '16px' }}>Foto hochladen</div>
              <div style={{ fontSize: '12px', opacity: 0.85 }}>Neues Gericht knipsen</div>
            </div>
          </div>
        </Link>

        {/* Mein Archiv */}
        <Link to="/archive" style={{ textDecoration: 'none' }}>
          <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span style={{ fontSize: '24px' }}>📁</span>
            <div style={{ color: 'white' }}>
              <div style={{ fontWeight: 'bold', fontSize: '16px' }}>Mein Archiv</div>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>Alle Ordner & Speisen</div>
            </div>
          </div>
        </Link>

        {/* Favoriten */}
        <Link to="/favorites" style={{ textDecoration: 'none' }}>
          <div style={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span style={{ fontSize: '24px' }}>⭐</span>
            <div style={{ color: 'white' }}>
              <div style={{ fontWeight: 'bold', fontSize: '16px' }}>Favoriten</div>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>Gespeicherte Lieblingsgerichte</div>
            </div>
          </div>
        </Link>

      </div>

    </div>
  )
}