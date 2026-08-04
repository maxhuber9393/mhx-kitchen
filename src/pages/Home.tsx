import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div style={{ 
      padding: '30px 20px', 
      textAlign: 'center', 
      minHeight: '100vh',
      backgroundColor: '#0f172a',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center'
    }}>
      <h1 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '10px' }}>
        MHX Kitchen
      </h1>
      <p style={{ color: '#94a3b8', marginBottom: '40px', fontSize: '15px' }}>
        Archiviere deine Rezeptbilder einfach und übersichtlich.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '400px', margin: '0 auto', width: '100%' }}>
        {/* Hauptbutton Kamera */}
        <Link to="/scan" style={{ textDecoration: 'none' }}>
          <button style={{
            width: '100%',
            padding: '20px',
            backgroundColor: '#22c55e',
            color: 'white',
            border: 'none',
            borderRadius: '16px',
            fontSize: '20px',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)'
          }}>
            📸 BILD ARCHIVIEREN
          </button>
        </Link>

        {/* Archiv Button (verlinkt jetzt direkt auf dein Archiv!) */}
        <Link to="/archive" style={{ textDecoration: 'none' }}>
          <button style={{
            width: '100%',
            padding: '16px',
            backgroundColor: '#1e293b',
            color: 'white',
            border: '1px solid #334155',
            borderRadius: '12px',
            fontSize: '18px',
            fontWeight: '600',
            cursor: 'pointer'
          }}>
            📂 Mein Archiv
          </button>
        </Link>

        {/* Favoriten */}
        <button style={{
          width: '100%',
          padding: '16px',
          backgroundColor: '#1e293b',
          color: 'white',
          border: '1px solid #334155',
          borderRadius: '12px',
          fontSize: '18px',
          fontWeight: '600',
          cursor: 'pointer'
        }}>
          ❤️ Favoriten
        </button>

        {/* Einstellungen */}
        <button style={{
          width: '100%',
          padding: '16px',
          backgroundColor: '#1e293b',
          color: 'white',
          border: '1px solid #334155',
          borderRadius: '12px',
          fontSize: '18px',
          fontWeight: '600',
          cursor: 'pointer'
        }}>
          ⚙️ Einstellungen
        </button>
      </div>
    </div>
  )
}import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div style={{ padding: '20px', minHeight: '100vh', backgroundColor: '#0f172a', color: 'white', boxSizing: 'border-box' }}>
      <header style={{ textAlign: 'center', marginBottom: '30px', marginTop: '10px' }}>
        <h1 style={{ fontSize: '28px', margin: 0 }}>🍳 MHX-KITCHEN</h1>
        <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '5px' }}>Dein persönliches Rezept- & Foto-Archiv</p>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        
        {/* Haupt-Button: Direkt zum Upload aus Galerie & Kamera */}
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