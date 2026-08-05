import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home'
import Trash from './pages/Trash'
import Archive from './pages/Archive'
import Favorites from './pages/Favorites'
import Scan from './pages/Scan'

export default function App() {
  return (
    <Router>
      <div style={{ minHeight: '100vh', backgroundColor: '#0f172a', paddingBottom: '70px' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/archive" element={<Archive />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/scan" element={<Scan />} />
          <Route path="/trash" element={<Trash />} />
        </Routes>

        <nav style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: '#1e293b',
          borderTop: '1px solid #334155',
          display: 'flex',
          justifyContent: 'space-around',
          padding: '10px 0',
          zIndex: 1000
        }}>
          <Link to="/" style={{ color: 'white', textDecoration: 'none', textAlign: 'center', fontSize: '12px' }}>
            Start
          </Link>
          <Link to="/archive" style={{ color: 'white', textDecoration: 'none', textAlign: 'center', fontSize: '12px' }}>
            Archiv
          </Link>
          <Link to="/scan" style={{ color: 'white', textDecoration: 'none', textAlign: 'center', fontSize: '12px' }}>
            Scannen
          </Link>
          <Link to="/favorites" style={{ color: 'white', textDecoration: 'none', textAlign: 'center', fontSize: '12px' }}>
            Favoriten
          </Link>
          <Link to="/trash" style={{ color: 'white', textDecoration: 'none', textAlign: 'center', fontSize: '12px' }}>
            Muell
          </Link>
        </nav>
      </div>
    </Router>
  )
}