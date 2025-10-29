import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

export const detectText = (text) => API.post("/detect/text", { text });
export const uploadImage = (file) => {
  const data = new FormData();
  data.append("file", file);
  return API.post("/detect/image", data, { headers: { "Content-Type": "multipart/form-data" }});
};
export const ocrScan = (file) => {
  if (!file) {
    return Promise.reject(new Error("No file provided for OCR scan"));
  }

  const formData = new FormData();
  formData.append("file", file);

  return API.post("/ocr/scan", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
export const getTopNews = () => API.get("/news/top");
export const analyzeURL = (url) => API.post("/url-check/analyze", { url });