import React, { useState } from "react";
import { detectText, uploadImage } from "../api/api";

export default function FakeDetect() {
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [file, setFile] = useState(null);
  const [imageResults, setImageResults] = useState([]);
  const [uploadedUrl, setUploadedUrl] = useState("");
    const [listening, setListening] = useState(false);

  const handleVoiceInput = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Speech recognition not supported in this browser");
      return;
    }
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setText(prev => (prev ? prev + " " + transcript : transcript));
    };

    recognition.start();
  };

  const handleTextSubmit = async () => {
    if (!text) return;
    const res = await detectText(text);
    setResult(res.data.result.prediction);
  };

  const handleFileUpload = async () => {
    if (!file) return;
    const res = await uploadImage(file);
    setImageResults(res.data.reverse_search_ranked || []);
    setUploadedUrl(res.data.uploaded_url);
  };

  // ===== Inline Styles =====
  const containerStyle = {
    maxWidth: "700px",
    margin: "20px auto",
    padding: "15px",
    backgroundColor: "#f5f7fa",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
  };

  const sectionStyle = {
    marginBottom: "30px",
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.08)"
  };

  const headerStyle = {
    color: "#0f4391ff",
    fontSize: "1.3rem",
    fontWeight: "600",
    marginBottom: "12px"
  };

  const textareaStyle = {
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    resize: "vertical",
    fontSize: "0.95rem",
    outline: "none"
  };

  const fileInputWrapper = {
    display: "inline-block",
    position: "relative",
    width: "fit-content",
    marginTop: "8px"
  };

  const fileInputStyle = {
    opacity: 0,
    position: "absolute",
    left: 0,
    top: 0,
    width: "100%",
    height: "100%",
    cursor: "pointer"
  };

  const fileButtonStyle = {
    padding: "8px 18px",
    borderRadius: "8px",
    background: "linear-gradient(90deg, #1a73e8, #4285f4)",
    color: "#fff",
    fontWeight: "500",
    fontSize: "0.95rem",
    cursor: "pointer",
    transition: "0.3s",
    boxShadow: "0 3px 8px rgba(0,0,0,0.1)",
    display: "inline-block"
  };

  const buttonStyle = {
    marginTop: "10px",
    padding: "10px 20px",
    border: "none",
    borderRadius: "8px",
    background: "linear-gradient(90deg, #1a73e8, #4285f4)",
    color: "#fff",
    fontWeight: "500",
    fontSize: "0.95rem",
    cursor: "pointer",
    transition: "0.3s",
    boxShadow: "0 3px 8px rgba(0,0,0,0.1)"
  };

  const buttonHover = {
    background: "linear-gradient(90deg, #4285f4, #1a73e8)",
    transform: "translateY(-1px)",
    boxShadow: "0 4px 10px rgba(0,0,0,0.15)"
  };
  
  const resultBoxStyle = {
    marginTop: "12px",
    padding: "12px",
    backgroundColor: "#f1f3f4",
    borderRadius: "8px",
    fontWeight: "500",
    fontSize: "1.5rem",
    textAlign: "center",
    boxShadow: "inset 0 1px 4px rgba(0,0,0,0.05)",
  };

  const imageCardStyle = {
    display: "flex",
    marginBottom: "15px",
    backgroundColor: "#f9f9f9",
    borderRadius: "10px",
    overflow: "hidden",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    transition: "all 0.3s",
    cursor: "pointer"
  };

  const imageThumbStyle = {
    width: "120px",
    height: "120px",
    objectFit: "cover"
  };

  const imageInfoStyle = {
    padding: "12px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    flex: 1
  };

  const infoLinkStyle = {
    color: "#1a73e8",
    textDecoration: "none",
    fontWeight: "500",
    fontSize: "0.9rem"
  };

  return (
    <div style={containerStyle}>
      <h1 style={{ textAlign: "center", color: "#6f4d08ff", fontSize: "1.9rem", marginBottom: "30px" }}>
        Fake News Detection
      </h1>

      {/* TEXT DETECTION */}
      <div style={sectionStyle}>
        <h2 style={headerStyle}>Paste Text / WhatsApp Forward</h2>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={5}
          style={textareaStyle}
          placeholder="Paste your text here..."
        />
        <button
  onClick={handleVoiceInput}
  style={{
    marginLeft: "10px",
    backgroundColor: listening ? "#f87171" : "#10b981",
    color: "white",
    border: "none",
    borderRadius: "6px",
    padding: "8px 15px",
    cursor: "pointer",
    fontWeight: "500"
  }}
>
  {listening ? "🎙 Listening..." : "🎤 Speak"}
</button>

        <br />
        <button
          style={buttonStyle}
          onMouseEnter={(e) => Object.assign(e.target.style, buttonHover)}
          onMouseLeave={(e) => Object.assign(e.target.style, buttonStyle)}
          onClick={handleTextSubmit}
        >
          Analyze Text
        </button>
        <div
  style={{
    ...resultBoxStyle,
    color: (result || "").toLowerCase() === "fake" ? "red" : "green"
  }}
>
  {result || "No result yet"}
</div>
      </div>

      {/* IMAGE DETECTION */}
      <div style={sectionStyle}>
        <h2 style={headerStyle}>Upload Image for Reverse Search</h2>

        <div style={fileInputWrapper}>
          <div style={fileButtonStyle}>Choose File</div>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files[0])}
            style={fileInputStyle}
          />
        </div>

        <button
          style={{...buttonStyle, marginLeft: "10px"}}
          onMouseEnter={(e) => Object.assign(e.target.style, buttonHover)}
          onMouseLeave={(e) => Object.assign(e.target.style, buttonStyle)}
          onClick={handleFileUpload}
        >
          Search Images
        </button>

        {/* Uploaded Image */}
        {uploadedUrl && (
          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <h3 style={{ color: "#555", marginBottom: "10px" }}>Uploaded Image</h3>
            <img src={uploadedUrl} alt="uploaded" style={{ maxWidth: "300px", borderRadius: "12px" }} />
          </div>
        )}

        {/* Image Results */}
        {imageResults.length > 0 && (
          <div style={{ marginTop: "20px" }}>
            <h3 style={{ color: "#1a73e8", marginBottom: "12px" }}>Reverse Image Search Results</h3>
            {imageResults.map((img, idx) => (
              <div key={idx} style={imageCardStyle}>
                <img src={img.thumbnail} alt={img.title || "result"} style={imageThumbStyle} />
                <div style={imageInfoStyle}>
                  <div>
                    <strong>Title:</strong> {img.title || "No title available"}
                    <br />
                    <strong>Source:</strong> {img.source || "Unknown"}
                    <br />
                    <strong>Snippet:</strong> {img.snippet || "No snippet available"}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px" }}>
                    <a href={img.link} target="_blank" rel="noopener noreferrer" style={infoLinkStyle}>🔗 View Source</a>
                    <span style={{ fontSize: "0.85rem", color: "#555" }}>Score: {img.relevance_score}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
