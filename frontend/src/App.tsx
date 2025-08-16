import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ComicUploadPage from './pages/ComicUploadPage';
import CharacterSelectPage from './pages/CharacterSelectPage';
import ComicReaderPage from './pages/ComicReaderPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/upload" element={<ComicUploadPage />} />
          <Route path="/characters/:comicId" element={<CharacterSelectPage />} />
          <Route path="/read/:sessionId" element={<ComicReaderPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;