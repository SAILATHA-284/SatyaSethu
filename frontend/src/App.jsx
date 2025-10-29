import React from 'react';
import { BrowserRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import FakeDetect from './pages/FakeDetect';
import OCRScanner from './pages/OCRScanner';
import CurrentAffairs from './pages/CurrentAffairs';
import URLChecker from "./pages/URLChecker";
import LandingPage from "./pages/LandingPage";

function Layout({ children }) {
  const location = useLocation();
  const showNavbar = location.pathname !== "/";

  const navStyle = {
    display: 'flex',
    justifyContent: 'center',
    gap: '0px',
    borderBottom: '2px solid #ccc',
    marginBottom: '40px',
  };

  const tabStyle = {
    padding: '12px 25px',
    cursor: 'pointer',
    textDecoration: 'none',
    color: '#0b3d91',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    borderTopLeftRadius: '8px',
    borderTopRightRadius: '8px',
  };

  const activeTabStyle = {
    backgroundColor: '#0b3d91',
    color: '#fff',
    boxShadow: '0 -4px 10px rgba(0,0,0,0.1)',
  };

  return (
    <div style={{
      padding: '30px',
      fontFamily: "'Segoe UI', sans-serif",
      backgroundColor: '#f0f4ff',
      minHeight: '100vh',
      color: '#333'
    }}>
      
      {showNavbar && (
        <>
          <h1 style={{
            textAlign: 'center',
            marginBottom: '30px',
            color: '#0b3d91',
            fontSize: '2.6rem',
            fontWeight: '700',
          }}>
            Satya Setu
          </h1>

          <nav style={navStyle}>
            <NavLink to="/detect" style={({ isActive }) => isActive ? { ...tabStyle, ...activeTabStyle } : tabStyle}>Fake Detect</NavLink>
            <NavLink to="/ocr" style={({ isActive }) => isActive ? { ...tabStyle, ...activeTabStyle } : tabStyle}>OCR Scanner</NavLink>
            <NavLink to="/url-check" style={({ isActive }) => isActive ? { ...tabStyle, ...activeTabStyle } : tabStyle}>Check URL</NavLink>
            <NavLink to="/news" style={({ isActive }) => isActive ? { ...tabStyle, ...activeTabStyle } : tabStyle}>Current Affairs</NavLink>
          </nav>
        </>
      )}

      {children}
    </div>
  );
}

function App() {
  return (
      <Layout>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/detect" element={<FakeDetect />} />
          <Route path="/ocr" element={<OCRScanner />} />
          <Route path="/news" element={<CurrentAffairs />} />
          <Route path="/url-check" element={<URLChecker />} />
        </Routes>
      </Layout>
  );
}

export default App;
