import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div style={{ 
      padding: '40px 20px', 
      minHeight: '100vh', 
      backgroundColor: '#0f172a', 
      color: 'white', 
      fontFamily: 'system-ui, -apple-system, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div style={{ fontSize: '48px', marginBottom: '8px' }}>🍳</div>
        <h1 style={{ 
          fontSize: '32px', 
          fontWeight: '800', 
          margin: '0 0 6px 0', 
          letterSpacing: '1px',
          background: 'linear-gradient(to right, #60a5fa, #a78bfa)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          MHX-KITCHEN
        </h1>
        <p style={{ fontSize: '15px', color: '#94a3b8', margin: 0, fontWeight: '400' }}>
          Dein modernes Rezept- & Fotoarchiv
        </p>
      </div>

      {/* Grid-Kacheln Layout */}
      <div style={{ 
        width: '100%', 
        maxWidth: '600px', 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
        gap: '20px' 
      }}>
        
        {/* Foto hochladen (Hauptelektro-Blau) */}
        <Link 
          to="/scan" 
          style={{
            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
            color: 'white',
            textDecoration: 'none',
            padding: '28px 20px',
            borderRadius: '20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: '12px',
            boxShadow: '0 10px 25px -5px rgba(37, 99, 235, 0.4)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            transition: 'transform 0.2s ease'
          }}
        >
          <div style={{ fontSize: '36px', background: 'rgba(255, 255, 255, 0.2)', padding: '10px', borderRadius: '14px', display: 'flex' }}>📷</div>
          <div>
            <div style={{ fontSize: '20px', fontWeight: 'bold' }}>Foto hochladen</div>
            <div style={{ fontSize: '13px', opacity: 0.85, marginTop: '2px' }}>Neues Gericht knipsen</div>
          </div>
        </Link>

        {/* Mein Archiv */}
        <Link 
          to="/archive" 
          style={{
            backgroundColor: '#1e293b',
            border: '1px solid #334155',
            color: 'white',
            textDecoration: 'none',
            padding: '28px 20px',
            borderRadius: '20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: '12px',
            transition: 'transform 0.2s ease'
          }}
        >
          <div style={{ fontSize: '36px', background: '#0f172a', padding: '10px', borderRadius: '14px', display: 'flex', border: '1px solid #334155' }}>📁</div>
          <div>
            <div style={{ fontSize: '20px', fontWeight: 'bold' }}>Mein Archiv</div>
            <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '2px' }}>Alle Ordner & Speisen</div>
          </div>
        </Link>

        {/* Favoriten */}
        <Link 
          to="/favorites" 
          style={{
            backgroundColor: '#1e293b',
            border: '1px solid #334155',
            color: 'white',
            textDecoration: 'none',
            padding: '28px 20px',
            borderRadius: '20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: '12px',
            transition: 'transform 0.2s ease'
          }}
        >
          <div style={{ fontSize: '36px', background: '#0f172a', padding: '10px', borderRadius: '14px', display: 'flex', border: '1px solid #334155' }}>⭐</div>
          <div>
            <div style={{ fontSize: '20px', fontWeight: 'bold' }}>Favoriten</div>
            <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '2px' }}>Gespeicherte Lieblinge</div>
          </div>
        </Link>

        {/* Papierkorb */}
        <Link 
          to="/trash" 
          style={{
            backgroundColor: '#1e293b',
            border: '1px solid #334155',
            color: 'white',
            textDecoration: 'none',
            padding: '28px 20px',
            borderRadius: '20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: '12px',
            transition: 'transform 0.2s ease'
          }}
        >
          <div style={{ fontSize: '36px', background: '#0f172a', padding: '10px', borderRadius: '14px', display: 'flex', border: '1px solid #334155' }}>🗑️</div>
          <div>
            <div style={{ fontSize: '20px', fontWeight: 'bold' }}>Papierkorb</div>
            <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '2px' }}>Gelöschte Fotos (30 Tage)</div>
          </div>
        </Link>

      </div>
    </div>
  )
}