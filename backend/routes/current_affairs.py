from flask import Blueprint, jsonify
from newspaper import Article, Source, Config
import requests
import os
from config import NEWSAPI_KEY

news_bp = Blueprint("news", __name__)

@news_bp.route("/top", methods=["GET"])
def top_news():
    # If you have NEWSAPI_KEY, use NewsAPI. Fallback to scraping a few news sites with newspaper3k.
    if NEWSAPI_KEY:
        url = f"https://newsapi.org/v2/top-headlines?language=en&pageSize=20&apiKey={NEWSAPI_KEY}"
        r = requests.get(url)
        return jsonify(r.json())
    # fallback: scrape a few sources
    sources = [
        "https://www.bbc.com/news",
        "https://www.reuters.com/world/",
        "https://www.theguardian.com/international"
    ]
    articles = []
    for s in sources:
        try:
            src = Source(s)
            src.download()
            src.parse()
            for art in src.articles[:5]:
                try:
                    art.download(); art.parse()
                    articles.append({"title": art.title, "text": art.text[:200], "url": art.url})
                except Exception:
                    continue
        except Exception:
            continue
    return jsonify({"articles": articles})
