import React from 'react';
import { BrowserRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import FakeDetect from './pages/FakeDetect';
import OCRScanner from './pages/OCRScanner';
import CurrentAffairs from './pages/CurrentAffairs';
import URLChecker from "./pages/URLChecker";
import LandingPage from "./pages/LandingPage";
import './App.css';

function Layout({ children }) {
  const location = useLocation();
  const showNavbar = location.pathname !== "/";

  return (
    <div className="app-container">
      {showNavbar && (
        <>
          <h1 className="app-header">Satya Setu</h1>

          <nav className="app-nav">
            <NavLink to="/detect" className={({ isActive }) => isActive ? "nav-tab nav-tab-active" : "nav-tab"}>Fake Detect</NavLink>
            <NavLink to="/ocr" className={({ isActive }) => isActive ? "nav-tab nav-tab-active" : "nav-tab"}>OCR Scanner</NavLink>
            <NavLink to="/url-check" className={({ isActive }) => isActive ? "nav-tab nav-tab-active" : "nav-tab"}>Check URL</NavLink>
            <NavLink to="/news" className={({ isActive }) => isActive ? "nav-tab nav-tab-active" : "nav-tab"}>Current Affairs</NavLink>
          </nav>
        </>
      )}

      <main>{children}</main>
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
