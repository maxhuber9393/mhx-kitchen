import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Scan from './pages/Scan'
import Archive from './pages/Archive'
import Favorites from './pages/Favorites'

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/scan" element={<Scan />} />
        <Route path="/archive" element={<Archive />} />
        <Route path="/favorites" element={<Favorites />} />
      </Routes>
    </Router>
  )
}