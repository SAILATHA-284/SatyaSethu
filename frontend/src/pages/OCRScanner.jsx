import React, { useState, useRef } from "react";
import { ocrScan } from "../api/api";

export default function OCRScanner() {
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [res, setRes] = useState(null);
  const [scanning, setScanning] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const startCamera = async () => {
    if (!videoRef.current) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      streamRef.current = stream;
      setCameraActive(true);
    } catch (err) {
      alert("Unable to access camera. Check permissions and HTTPS.");
      console.error(err);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const capture = () => {
    if (!videoRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(blob => {
      if (!blob) return;
      const file = new File([blob], "capture.jpg", { type: "image/jpeg" });
      const url = URL.createObjectURL(file);
      setCapturedImage({ blob: file, url });
      stopCamera();
    }, "image/jpeg");
  };

  const retake = () => {
    setCapturedImage(null);
    setRes(null);
    startCamera();
  };

  const predict = async () => {
    if (!capturedImage) return;
    setScanning(true);
    try {
      const r = await ocrScan(capturedImage.blob);
      setRes(r.data); // use r.data
    } catch (err) {
      alert(err.response?.data?.error || "Prediction failed");
      console.error(err);
    } finally {
      setScanning(false);
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h2>OCR Scanner (Handwritten / Typed)</h2>

      {/* Camera controls */}
      <div style={{ marginBottom: "15px" }}>
        {!cameraActive && !capturedImage && (
          <button
            onClick={startCamera}
            style={{ padding: "10px 20px", marginRight: "10px", backgroundColor: "#0b3d91", color: "#fff", borderRadius: "5px", fontWeight: "600" }}
          >
            Start Camera
          </button>
        )}
        {cameraActive && (
          <button
            onClick={stopCamera}
            style={{ padding: "10px 20px", marginRight: "10px", backgroundColor: "#0b3d91", color: "#fff", borderRadius: "5px", fontWeight: "600" }}
          >
            Stop Camera
          </button>
        )}
        {!capturedImage && (
          <button
            onClick={capture}
            disabled={!cameraActive}
            style={{ padding: "10px 20px", backgroundColor: cameraActive ? "#2ba844" : "#ccc", color: "#fff", borderRadius: "5px", fontWeight: "600" }}
          >
            Capture
          </button>
        )}
      </div>

      {/* Video stream */}
      <video
        ref={videoRef}
        style={{
          width: "100%",
          maxWidth: "400px",
          borderRadius: "10px",
          marginBottom: "15px",
          display: cameraActive && !capturedImage ? "block" : "none"
        }}
      ></video>
      <canvas ref={canvasRef} style={{ display: "none" }}></canvas>

      {/* Captured image + actions */}
      {capturedImage && (
        <div>
          <img
            src={capturedImage.url}
            alt="Captured"
            style={{ width: "100%", maxWidth: "400px", borderRadius: "10px", marginBottom: "15px" }}
          />
          <div style={{ marginBottom: "15px" }}>
            <button onClick={retake} style={{ marginRight: "10px" }}>Retake</button>
            <button onClick={predict} disabled={scanning}>
              {scanning ? "Predicting..." : "Predict"}
            </button>
          </div>
        </div>
      )}

      {/* OCR Result */}
      {res && (
        <div style={{ maxWidth: "600px", margin: "20px auto", textAlign: "left" }}>
          <h3>Extracted Text:</h3>
          <pre
            style={{
              background: "#f5f5f5",
              padding: "15px",
              borderRadius: "8px",
              minHeight: "100px",
              whiteSpace: "pre-wrap",
              wordWrap: "break-word",
              overflowX: "auto"
            }}
          >
            {res.ocr_text || "No text extracted"}
          </pre>

          <h3>Prediction:</h3>
          <p
            style={{
              fontWeight: "600",
              color: res.classification?.prediction === "FAKE" ? "#e22b2b" : res.classification?.prediction === "REAL" ? "#2ba844" : "#555",
              whiteSpace: "pre-wrap"
            }}
          >
            {res.classification?.prediction || "No classification"}
          </p>
        </div>
      )}
    </div>
  );
}
