import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Scan from './pages/Scan'
import Archive from './pages/Archive'
import Favorites from './pages/Favorites'
import Trash from './pages/Trash'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/scan" element={<Scan />} />
      <Route path="/archive" element={<Archive />} />
      <Route path="/favorites" element={<Favorites />} />
      <Route path="/trash" element={<Trash />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}