import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div style={{ 
      padding: '24px 16px', 
      minHeight: '100vh', 
      backgroundColor: '#0f172a', 
      color: 'white', 
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '28px', marginTop: '12px' }}>
        <h1 style={{ 
          fontSize: '22px', 
          fontWeight: 'bold', 
          margin: '0 0 4px 0', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          gap: '8px' 
        }}>
          🍳 MHX-Kitchen
        </h1>
        <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>
          Dein Rezept- & Fotoarchiv
        </p>
      </div>

      {/* 2-Spalten Grid (exakt wie im Archiv) */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(2, 1fr)', 
        gap: '12px' 
      }}>
        
        {/* Foto hochladen */}
        <Link 
          to="/scan" 
          style={{
            backgroundColor: '#1e293b',
            border: '1px solid #334155',
            borderRadius: '16px',
            padding: '20px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            textDecoration: 'none',
            color: 'white'
          }}
        >
          <div style={{ fontSize: '28px' }}>📷</div>
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#f8fafc' }}>Foto hochladen</div>
            <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>Neues Foto knipsen</div>
          </div>
        </Link>

        {/* Mein Archiv */}
        <Link 
          to="/archive" 
          style={{
            backgroundColor: '#1e293b',
            border: '1px solid #334155',
            borderRadius: '16px',
            padding: '20px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            textDecoration: 'none',
            color: 'white'
          }}
        >
          <div style={{ fontSize: '28px' }}>📁</div>
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#f8fafc' }}>Mein Archiv</div>
            <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>Alle Ordner</div>
          </div>
        </Link>

        {/* Favoriten */}
        <Link 
          to="/favorites" 
          style={{
            backgroundColor: '#1e293b',
            border: '1px solid #334155',
            borderRadius: '16px',
            padding: '20px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            textDecoration: 'none',
            color: 'white'
          }}
        >
          <div style={{ fontSize: '28px' }}>⭐</div>
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#f8fafc' }}>Favoriten</div>
            <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>Lieblingsgerichte</div>
          </div>
        </Link>

        {/* Papierkorb */}
        <Link 
          to="/trash" 
          style={{
            backgroundColor: '#1e293b',
            border: '1px solid #334155',
            borderRadius: '16px',
            padding: '20px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            textDecoration: 'none',
            color: 'white'
          }}
        >
          <div style={{ fontSize: '28px' }}>🗑️</div>
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#f8fafc' }}>Papierkorb</div>
            <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>Gelöschte Fotos</div>
          </div>
        </Link>

      </div>
    </div>
  )
}