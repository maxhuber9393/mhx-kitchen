import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f0f2f5', 
      color: '#050505', 
      fontFamily: 'Segoe UI, Historic, Helvetica, Arial, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      
      {/* Facebook-Style Top Bar */}
      <div style={{
        width: '100%',
        backgroundColor: '#ffffff',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        padding: '12px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxSizing: 'border-box',
        marginBottom: '24px'
      }}>
        <h1 style={{ 
          fontSize: '24px', 
          fontWeight: 'bold', 
          margin: 0, 
          color: '#1877f2',
          letterSpacing: '-0.5px'
        }}>
          MHX-Kitchen
        </h1>
        <div style={{ 
          width: '40px', 
          height: '40px', 
          borderRadius: '50%', 
          backgroundColor: '#e4e6eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '20px'
        }}>
          👨‍🍳
        </div>
      </div>

      {/* Hauptbereich */}
      <div style={{ 
        width: '100%', 
        maxWidth: '500px', 
        padding: '0 16px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>

        {/* Action Button: Foto hochladen */}
        <Link 
          to="/scan" 
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '10px',
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            textDecoration: 'none',
            color: '#050505',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e4e6eb'
          }}
        >
          <div style={{ 
            width: '48px', 
            height: '48px', 
            borderRadius: '50%', 
            backgroundColor: '#e7f3ff', 
            color: '#1877f2',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            fontSize: '24px'
          }}>
            📷
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '17px', fontWeight: '600' }}>Foto hochladen</div>
            <div style={{ fontSize: '13px', color: '#65676b', marginTop: '2px' }}>Neues Gericht knipsen & teilen</div>
          </div>
        </Link>

        {/* Navigation Card: Mein Archiv */}
        <Link 
          to="/archive" 
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '10px',
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            textDecoration: 'none',
            color: '#050505',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e4e6eb'
          }}
        >
          <div style={{ 
            width: '48px', 
            height: '48px', 
            borderRadius: '50%', 
            backgroundColor: '#e4e6eb', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            fontSize: '24px'
          }}>
            📂
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '17px', fontWeight: '600' }}>Mein Archiv</div>
            <div style={{ fontSize: '13px', color: '#65676b', marginTop: '2px' }}>Alle Ordner & Speisen durchsuchen</div>
          </div>
        </Link>

        {/* Navigation Card: Favoriten */}
        <Link 
          to="/favorites" 
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '10px',
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            textDecoration: 'none',
            color: '#050505',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e4e6eb'
          }}
        >
          <div style={{ 
            width: '48px', 
            height: '48px', 
            borderRadius: '50%', 
            backgroundColor: '#fff8e6', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            fontSize: '24px'
          }}>
            ⭐
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '17px', fontWeight: '600' }}>Favoriten</div>
            <div style={{ fontSize: '13px', color: '#65676b', marginTop: '2px' }}>Deine markierten Lieblingsgerichte</div>
          </div>
        </Link>

        {/* Navigation Card: Papierkorb */}
        <Link 
          to="/trash" 
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '10px',
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            textDecoration: 'none',
            color: '#050505',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e4e6eb'
          }}
        >
          <div style={{ 
            width: '48px', 
            height: '48px', 
            borderRadius: '50%', 
            backgroundColor: '#fce8e6', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            fontSize: '24px'
          }}>
            🗑️
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '17px', fontWeight: '600' }}>Papierkorb</div>
            <div style={{ fontSize: '13px', color: '#65676b', marginTop: '2px' }}>Gelöschte Elemente verwalten</div>
          </div>
        </Link>

      </div>
    </div>
  )
}