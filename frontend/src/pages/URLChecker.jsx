import React, { useState } from "react";
import { analyzeURL } from "../api/api";

const URLChecker = () => {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleCheck = async () => {
    if (!url.trim()) {
      setError("Please enter a valid news URL");
      return;
    }
    setError("");
    setResult(null);
    setLoading(true);

    try {
      const res = await analyzeURL(url);
      setResult(res.data); // response shape: { ... }
    } catch (err) {
      console.error(err);
      setError("Failed to analyze the URL. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // Utility to normalize model prediction label
  const formatPrediction = (pred) => {
    if (!pred || !pred.prediction) return "N/A";
    if (String(pred.prediction).toLowerCase() === "fake") return "Fake";
    return "Authentic";
  };

  return (
    <div
      style={{
        minHeight: "50vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(to bottom, #f8fbff, #ffffff)",
        fontFamily: "Segoe UI, sans-serif",
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          padding: "30px",
          borderRadius: "16px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          width: "90%",
          maxWidth: "500px",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            color: "#60390cff",
            marginBottom: "20px",
          }}
        >
          🔍 Fake News URL Checker
        </h2>

        <input
          type="text"
          placeholder="Paste a news article URL..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            border: "1px solid #d0d7de",
            borderRadius: "8px",
            fontSize: "15px",
            outline: "none",
          }}
        />

        <button
          onClick={handleCheck}
          disabled={loading}
          style={{
            marginTop: "16px",
            width: "100%",
            padding: "12px",
            backgroundColor: loading ? "#8fb8ff" : "#007bff",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: "16px",
            fontWeight: "600",
          }}
        >
          {loading ? "Analyzing..." : "Check News"}
        </button>

        {error && (
          <p
            style={{
              color: "red",
              textAlign: "center",
              marginTop: "10px",
              fontSize: "14px",
            }}
          >
            {error}
          </p>
        )}

        {result && (
  <div
    style={{
      marginTop: "25px",
      padding: "18px",
      backgroundColor: "#f9fbff",
      border: "1px solid #dce4f0",
      borderRadius: "10px",
    }}
  >
    <h3 style={{ marginBottom: "10px", color: "#2c3e50" }}>🧠 Prediction Result</h3>

    {/* Warning if either model predicts fake or source is flagged */}
    {(result.source_verification.verified === false ||
      (result.model_prediction?.prediction || "").toLowerCase() === "fake") && (
      <p style={{ color: "red", fontWeight: "bold" }}>
        ⚠️ Warning: This source or its content is flagged for potential fake news.
      </p>
    )}

    <p>
      <strong>Prediction:</strong>{" "}
      <span
        style={{
          color:
            (result.model_prediction?.prediction || "").toLowerCase() === "fake"
              ? "red"
              : "#07A857",
          fontWeight: "bold",
        }}
      >
        {formatPrediction(result.model_prediction)}
      </span>
    </p>

    <div style={{ marginTop: "10px", color: "#444", fontSize: "15px" }}>
      <strong>Source:</strong> {result.domain}
      <br />
      <strong>Title:</strong> {result.title}
      <br />
      <strong>Author:</strong> {result.author}
      <br />
      <strong>Sample:</strong>{" "}
      <span style={{ color: "#3366cc" }}>{result.summary?.content_snippet}</span>
    </div>
  </div>
)}

      </div>
    </div>
  );
};

export default URLChecker;
