import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div style={{ padding: '20px', minHeight: '100vh', backgroundColor: '#0f172a', color: 'white', boxSizing: 'border-box' }}>
      <header style={{ textAlign: 'center', marginBottom: '30px', marginTop: '10px' }}>
        <h1 style={{ fontSize: '28px', margin: 0 }}>🍳 MHX-KITCHEN</h1>
        <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '5px' }}>Dein persönliches Rezept- & Foto-Archiv</p>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        
        {/* Haupt-Button: Upload aus Galerie & Kamera */}
        <Link to="/scan" style={{ textDecoration: 'none' }}>
          <div style={{ padding: '20px', backgroundColor: '#3b82f6', borderRadius: '16px', color: 'white', display: 'flex', alignItems: 'center', gap: '15px', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)' }}>
            <span style={{ fontSize: '32px' }}>📱</span>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px' }}>Foto hochladen / knipsen</h3>
              <p style={{ margin: 0, fontSize: '13px', color: '#dbeafe', marginTop: '2px' }}>
                Aus iPhone-Galerie wählen oder mit Kamera aufnehmen
              </p>
            </div>
          </div>
        </Link>

        {/* Button zum Archiv */}
        <Link to="/archive" style={{ textDecoration: 'none' }}>
          <div style={{ padding: '20px', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '16px', color: 'white', display: 'flex', alignItems: 'center', gap: '15px' }}>
            <span style={{ fontSize: '32px' }}>📁</span>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px' }}>Mein Archiv</h3>
              <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8', marginTop: '2px' }}>
                Alle Ordner & gespeicherten Fotos ansehen
              </p>
            </div>
          </div>
        </Link>

        {/* Button zu den Favoriten */}
        <Link to="/favorites" style={{ textDecoration: 'none' }}>
          <div style={{ padding: '20px', backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '16px', color: 'white', display: 'flex', alignItems: 'center', gap: '15px' }}>
            <span style={{ fontSize: '32px' }}>⭐</span>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px' }}>Favoriten</h3>
              <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8', marginTop: '2px' }}>
                Deine markierten Lieblingsgerichte
              </p>
            </div>
          </div>
        </Link>

      </div>
    </div>
  )
}