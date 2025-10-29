Fake News App - Starter Scaffold (Docker + placeholder model)
============================================================
This repository contains a ready-to-run scaffold for your Fake News Detection webapp:
  - Flask backend (API endpoints for text, image, OCR, news)
  - React frontend
  - Docker + docker-compose to run frontend + backend
  - Placeholder model file (because this environment cannot download large HF models)

You chose: Option A (Docker included + model). IMPORTANT: I cannot download large pretrained HuggingFace models from this environment.
Instead:
  1. This ZIP includes a small placeholder model file at `backend/models/model_placeholder.bin`.
  2. A script `backend/download_model.sh` is provided to fetch a real HF model when you run it on a machine with internet access.
  3. The docker-compose uses a bind mount so you can place the downloaded model into `backend/models/` before starting the containers.

Quick start:
  - Extract the ZIP.
  - Edit `backend/.env` with your API keys (NEWSAPI_KEY, BING_IMAGE_SEARCH_KEY) if you have them.
  - On a machine with internet, run:
      cd backend
      ./download_model.sh <HF_MODEL_ID_OR_PATH>
    Example:
      ./download_model.sh distilroberta-base
  - Build and run with Docker:
      docker-compose up --build
  - Frontend available at http://localhost:3000
  - Backend available at http://localhost:5000

Files of interest:
  - backend/app.py
  - backend/routes/*.py
  - backend/models/text_model.py
  - backend/download_model.sh (use this to obtain a real HF model)
  - frontend/src/ (React app)
  - docker-compose.yml, Dockerfiles for frontend/backend

If you want, I can now (in-chat) provide step-by-step commands to download a specific HF model (the script uses huggingface-cli).
