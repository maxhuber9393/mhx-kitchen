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
}