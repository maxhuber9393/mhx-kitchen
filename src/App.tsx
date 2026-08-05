import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Trash from './pages/Trash'
import Archive from './pages/Archive'
import Favorites from './pages/Favorites'
import Scan from './pages/Scan'

export default function App() {
  return (
    <Router>
      <div style={{ minHeight: '100vh', backgroundColor: '#0f172a' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/archive" element={<Archive />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/scan" element={<Scan />} />
          <Route path="/trash" element={<Trash />} />
        </Routes>
      </div>
    </Router>
  )
}