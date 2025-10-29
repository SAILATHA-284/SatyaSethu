import React from 'react'
import { Link } from 'react-router-dom'

export default function Navbar() {
  return (
    <nav style={{ padding: '10px', backgroundColor: '#eee' }}>
      <Link to="/" style={{ marginRight: '10px' }}>Fake News</Link>
      <Link to="/current" style={{ marginRight: '10px' }}>Current Affairs</Link>
      <Link to="/ocr">OCR Detection</Link>
    </nav>
  )
}
