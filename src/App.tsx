import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home'
import Archive from './pages/Archive'
import Favorites from './pages/Favorites'
import Scan from './pages/Scan'
import Trash from './pages/Trash'

export default function App() {
  return (
    <Router>
      <div style={{ minHeight: '100vh', backgroundColor: '#0f172a', pb: '80px' }}>
        
        {/* Haupt-Routen */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/archive" element={<Archive />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/scan" element={<Scan />} />
          <Route path="/trash" element={<Trash />} />
        </Routes>

        {/* Untere Navigationsleiste */}
        <nav style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: '#1e293b',
          borderTop: '1px solid #334155',
          display: 'flex',
          justify: 'space-around',
          alignItems: 'center',
          padding: '10px 0',
          zIndex: 40
        }}>
          <Link to="/" style={{ color: 'white', textDecoration: 'none', fontSize: '12px', textAlign: 'center' }}>
            <div>🏠</div>
            <div>Home</div>
          </Link>

          <Link to="/archive" style={{ color: 'white', textDecoration: 'none', fontSize: '12px', textAlign: 'center' }}>
            <div>📁</div>
            <div>Archiv</div>
          </Link>

          <Link to="/scan" style={{ color: 'white', textDecoration: 'none', fontSize: '12px', textAlign: 'center' }}>
            <div>📷</div>
            <div>Scannen</div>
          </Link>

          <Link to="/favorites" style={{ color: 'white', textDecoration: 'none', fontSize: '12px', textAlign: 'center' }}>
            <div>⭐</div>
            <div>Favoriten</div>
          </Link>

          <Link to="/trash" style={{ color: 'white', textDecoration: 'none', fontSize: '12px', textAlign: 'center' }}>
            <div>🗑️</div>
            <div>Papierkorb</div>
          </Link>
        </nav>

      </div>
    </Router>
  )
}