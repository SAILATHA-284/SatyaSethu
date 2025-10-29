import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import FakeDetect from './pages/FakeDetect';
import OCRScanner from './pages/OCRScanner';
import CurrentAffairs from './pages/CurrentAffairs';

function App(){
  return (
    <BrowserRouter>
      <div style={{padding:20}}>
        <h1>Fake News App</h1>
        <nav>
          <Link to='/'>Home</Link> | <Link to='/detect'>Fake Detect</Link> | <Link to='/ocr'>OCR Scanner</Link> | <Link to='/news'>Current Affairs</Link>
        </nav>
        <Routes>
          <Route path='/' element={<div><h2>Welcome</h2><p>Use the menu to navigate.</p></div>} />
          <Route path='/detect' element={<FakeDetect/>} />
          <Route path='/ocr' element={<OCRScanner/>} />
          <Route path='/news' element={<CurrentAffairs/>} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
