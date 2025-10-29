import React from "react";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();

  const gridContainer = {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "25px",
    justifyContent: "center",
    alignItems: "center",
    maxWidth: "550px",
    margin: "40px auto 0 auto",
  };

  const buttonStyle = {
    padding: "22px",
    borderRadius: "14px",
    fontSize: "1.2rem",
    cursor: "pointer",
    border: "none",
    fontWeight: "600",
    background: "#ffffffaa",
    backdropFilter: "blur(6px)",
    boxShadow: "0 4px 15px rgba(0,0,0,0.15)",
    transition: "transform 0.25s ease, box-shadow 0.25s ease",
  };

  const handleHover = (e) => {
    e.target.style.transform = "translateY(-5px)";
    e.target.style.boxShadow = "0 8px 20px rgba(0,0,0,0.22)";
  };

  const handleLeave = (e) => {
    e.target.style.transform = "translateY(0px)";
    e.target.style.boxShadow = "0 4px 15px rgba(0,0,0,0.15)";
  };

  return (
    <div
      style={{
        padding: "60px 20px",
        minHeight: "100vh",
        textAlign: "center",
        backgroundImage:
          "url('https://i.pinimg.com/736x/26/46/61/2646613042a0f01a94d8a933efff3fa1.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        fontFamily: "Poppins, sans-serif",
      }}
    >
      <h1
        style={{
          fontFamily: "Playfair Display, serif",
          fontSize: "3.2rem",
          color: "#0b3d91",
          marginBottom: "10px",
        }}
      >
        Satya Setu
      </h1>

      <p
        style={{
          fontFamily: "Playfair Display, serif",
          fontSize: "1.4rem",
          color: "#444",
          marginBottom: "30px",
          fontWeight: "500",
        }}
      >
        Bridge to the Truth
      </p>

      {/* Keep your original home welcome text */}
      <div
        style={{
          background: "rgba(255,255,255,0.85)",
          padding: "25px",
          borderRadius: "12px",
          maxWidth: "600px",
          margin: "0 auto 40px auto",
          boxShadow: "0 6px 15px rgba(0,0,0,0.15)",
        }}
      >
        <h2 style={{ color: "#0b3d91" }}>Welcome to Satya Setu</h2>
        <p style={{ fontSize: "1.05rem", lineHeight: "1.6", color: "#333" }}>
          Discover the truth behind news articles, scan documents effortlessly,
          and stay updated with the latest current affairs.
        </p>
        <p style={{ marginTop: "10px", color: "#0b3d91", fontWeight: "600" }}>
          Choose a service to begin ↓
        </p>
      </div>

      {/* 2x2 button layout */}
      <div style={gridContainer}>
        <button
          style={{ ...buttonStyle, backgroundColor: "#e3f2fd" }}
          onMouseEnter={handleHover}
          onMouseLeave={handleLeave}
          onClick={() => navigate("/detect")}
        >
          Fake News Detection
        </button>

        <button
          style={{ ...buttonStyle, backgroundColor: "#f3e5f5" }}
          onMouseEnter={handleHover}
          onMouseLeave={handleLeave}
          onClick={() => navigate("/ocr")}
        >
          OCR Scanner
        </button>

        <button
          style={{ ...buttonStyle, backgroundColor: "#fdecea" }}
          onMouseEnter={handleHover}
          onMouseLeave={handleLeave}
          onClick={() => navigate("/url-check")}
        >
          URL Checker
        </button>

        <button
          style={{ ...buttonStyle, backgroundColor: "#e8f5e9" }}
          onMouseEnter={handleHover}
          onMouseLeave={handleLeave}
          onClick={() => navigate("/news")}
        >
          Current Affairs
        </button>
      </div>
    </div>
  );
}
