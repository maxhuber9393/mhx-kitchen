import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home'
import Trash from './pages/Trash'

export default function App() {
  return (
    <Router>
      <div style={{ minHeight: '100vh', backgroundColor: '#0f172a', paddingBottom: '70px' }}>
        <Routes>
          <Route path="/" element={<Home />} />
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
          justifyaround: 'space-around',
          padding: '10px 0',
          zIndex: 1000
        }}>
          <Link to="/" style={{ color: 'white', textDecoration: 'none', textAlign: 'center', fontSize: '12px' }}>
            <div style={{ fontSize: '20px' }}>🏠</div>
            Start
          </Link>
          <Link to="/trash" style={{ color: 'white', textDecoration: 'none', textAlign: 'center', fontSize: '12px' }}>
            <div style={{ fontSize: '20px' }}>🗑️</div>
            Müll
          </Link>
        </nav>
      </div>
    </Router>
  )
}