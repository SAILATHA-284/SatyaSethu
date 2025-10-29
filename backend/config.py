import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Base directory setup
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# API keys and model configurations
UNSPLASH_ACCESS_KEY = os.getenv("UNSPLASH_ACCESS_KEY")
UNSPLASH_SECRET_KEY = os.getenv("UNSPLASH_SECRET_KEY")
NEWSAPI_KEY = os.getenv("NEWSAPI_KEY")
GNEWSAPI_KEY = os.getenv("GNEWSAPI_KEY")
SERPAPI_KEY = os.getenv("SERPAPI_KEY")

# Default model name (fallback if not set in .env)
TEXT_MODEL_NAME = os.getenv("TEXT_MODEL_NAME", "hamzab/roberta-fake-news-classification")

# Optional: Debug print for development only
if not os.getenv("FLASK_ENV") == "production":
    print("✅ Loaded environment variables:")
    print(f"UPLOAD_FOLDER: {UPLOAD_FOLDER}")
    print(f"UNSPLASH_ACCESS_KEY: {'Set' if UNSPLASH_ACCESS_KEY else 'Missing'}")
    print(f"NEWSAPI_KEY: {'Set' if NEWSAPI_KEY else 'Missing'}")
    print(f"GNEWSAPI_KEY: {'Set' if NEWSAPI_KEY else 'Missing'}")
    print(f"SERPAPI_KEY: {'Set' if NEWSAPI_KEY else 'Missing'}")
    print(f"TEXT_MODEL_NAME: {TEXT_MODEL_NAME}")
