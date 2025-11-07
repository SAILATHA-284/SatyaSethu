from transformers import pipeline, AutoModelForSequenceClassification, AutoTokenizer
import torch
import os
import re
import requests
from typing import Dict, List
from datetime import datetime, timedelta
from difflib import SequenceMatcher
import nltk
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
from nltk import word_tokenize, pos_tag

# Ensure resources are available
nltk.download('punkt', quiet=True)
nltk.download('wordnet', quiet=True)
nltk.download('stopwords', quiet=True)
nltk.download('averaged_perceptron_tagger', quiet=True)
# ----------------------
# Configuration
# ----------------------
DEFAULT_MODEL = os.environ.get(
    "TEXT_MODEL_NAME",
    "hamzab/roberta-fake-news-classification"
)
NEWS_API_KEY = os.environ.get("NEWSAPI_KEY")
GNEWS_API_KEY = os.environ.get("GNEWSAPI_KEY")

TRUSTED_SOURCES = {
    'reuters.com', 'apnews.com', 'bbc.com', 'bbc.co.uk',
    'nytimes.com', 'washingtonpost.com', 'theguardian.com',
    'wsj.com', 'bloomberg.com', 'npr.org', 'pbs.org',
    'economist.com', 'ft.com', 'cnn.com', 'nbcnews.com',
    'cbsnews.com', 'abcnews.go.com', 'usatoday.com',
    'time.com', 'newsweek.com', 'politico.com', 'axios.com',
    'thehill.com', 'propublica.org', 'latimes.com',
    'aljazeera.com', 'dw.com', 'france24.com', 'timesnownews.com',
    'timesofindia.indiatimes.com','indianexpress.com', 'firstpost.com','altnews.in',
    'ddnews.gov.in','msn.com'
}

classifier = None
tokenizer = None
model = None

# ----------------------
# Helper Functions
# ----------------------
def get_classifier():
    global classifier, tokenizer, model
    if classifier is None:
        try:
            tokenizer = AutoTokenizer.from_pretrained(DEFAULT_MODEL)
            model = AutoModelForSequenceClassification.from_pretrained(DEFAULT_MODEL)
            classifier = pipeline(
                "text-classification",
                model=model,
                tokenizer=tokenizer,
                device=0 if torch.cuda.is_available() else -1,
                truncation=True,
                max_length=512
            )
        except Exception as e:
            print(f"HF model load failed, classifier will be None. Error: {e}")
            classifier = None
    return classifier

def preprocess_text(text: str) -> str:
    text = re.sub(r'http\S+|www\S+', '', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def extract_keywords(text: str) -> str:
    """
    Extracts meaningful keywords from text using NLTK.
    If text is short (≤15 words), uses full text directly.
    Otherwise, extracts top noun phrases and entities for news search.
    """
    text = text.strip()
    words = word_tokenize(text)
    if len(words) <= 15:
        # For short input (like one-sentence claims), use entire text
        return text

    stop_words = set(stopwords.words('english'))
    lemmatizer = WordNetLemmatizer()

    # POS tagging to identify nouns and proper nouns
    tagged = pos_tag(words)
    keywords = []
    for word, tag in tagged:
        word_lower = word.lower()
        if word_lower.isalpha() and word_lower not in stop_words:
            # Nouns and proper nouns are prioritized
            if tag.startswith('NN') or tag.startswith('JJ'):
                keywords.append(lemmatizer.lemmatize(word_lower))

    # Deduplicate & limit to 5–7 most relevant keywords
    unique_keywords = list(dict.fromkeys(keywords))[:7]
    if not unique_keywords:
        return text  # fallback if nothing extracted

    # Build logical AND query for better search relevance
    return " AND ".join(unique_keywords)

# ----------------------
# Relevance Checking
# ----------------------
def is_article_relevant(article, query, text):
    """
    Checks if an article is contextually relevant to the input query/text.
    Uses keyword overlap and fuzzy text similarity.
    """
    title = (article.get("title") or "").lower()
    desc = (article.get("description") or "").lower()
    content = (article.get("content") or "").lower()
    combined = " ".join([title, desc, content])

    query = query.lower()
    text = text.lower()

    overlap = sum(1 for w in query.split() if w in combined)
    ratio = SequenceMatcher(None, text, combined).ratio()

    # At least 2 keyword overlaps or >0.45 similarity means it's relevant
    return overlap >= 2 or ratio > 0.45

# ----------------------
# NewsAPI & GNews Search
# ----------------------
def search_newsapi(query: str, full_text: str) -> Dict:
    if not NEWS_API_KEY:
        return {"found": False, "sources": [], "note": "No NewsAPI key"}
    from_date = (datetime.now() - timedelta(days=30)).strftime('%Y-%m-%d')
    url = "https://newsapi.org/v2/everything"
    params = {
        'q': query[:200],
        'language': 'en',
        'from': from_date,
        'sortBy': 'relevancy',
        'pageSize': 10,
        'apiKey': NEWS_API_KEY
    }
    try:
        response = requests.get(url, params=params, timeout=5)
        data = response.json()
        articles = data.get('articles', [])
        trusted_articles = [a for a in articles if any(domain in a.get('url', '') for domain in TRUSTED_SOURCES)]

        # Filter only relevant ones
        relevant_articles = [a for a in trusted_articles if is_article_relevant(a, query, full_text)]

        if relevant_articles:
            return {
                "found": True,
                "count": len(relevant_articles),
                "sources": [{"title": a.get('title', ''), "source": a.get('source', {}).get('name', ''),
                             "url": a.get('url', ''), "published": a.get('publishedAt', '')} for a in relevant_articles[:5]]
            }
        return {"found": False, "sources": [], "note": "No relevant trusted articles found"}
    except Exception as e:
        return {"found": False, "sources": [], "note": f"NewsAPI request failed: {str(e)}"}

def search_gnews(query: str, full_text: str) -> Dict:
    if not GNEWS_API_KEY:
        return {"found": False, "sources": [], "note": "No GNews API key"}
    url = "https://gnews.io/api/v4/search"
    params = {
        'q': query[:200],
        'lang': 'en',
        'max': 10,
        'apikey': GNEWS_API_KEY
    }
    try:
        response = requests.get(url, params=params, timeout=5)
        data = response.json()
        articles = data.get('articles', [])
        trusted_articles = [a for a in articles if any(domain in a.get('url', '') for domain in TRUSTED_SOURCES)]

        relevant_articles = [a for a in trusted_articles if is_article_relevant(a, query, full_text)]

        if relevant_articles:
            return {
                "found": True,
                "count": len(relevant_articles),
                "sources": [{"title": a.get('title', ''), "source": a.get('source', {}).get('name', ''),
                             "url": a.get('url', ''), "published": a.get('publishedAt', '')} for a in relevant_articles[:5]]
            }
        return {"found": False, "sources": [], "note": "No relevant trusted articles found"}
    except Exception as e:
        return {"found": False, "sources": [], "note": f"GNews request failed: {str(e)}"}

# ----------------------
# Verification
# ----------------------
def verify_with_trusted_sources(text: str) -> Dict:
    query = extract_keywords(text)
    total_sources = 0
    verification_details = []

    news_result = search_newsapi(query, text)
    if news_result.get("found"):
        total_sources += news_result.get("count", 0)
        verification_details.append({"query": query, "sources_found": news_result.get("count", 0), "top_sources": news_result.get("sources", [])[:2]})

    if total_sources < 2:
        gnews_result = search_gnews(query, text)
        if gnews_result.get("found"):
            total_sources += gnews_result.get("count", 0)
            verification_details.append({"query": query, "sources_found": gnews_result.get("count", 0), "top_sources": gnews_result.get("sources", [])[:2]})

    if total_sources >= 3:
        return {"verified": True, "confidence": min(0.6 + total_sources*0.05, 0.9),
                "reason": f"Corroborated by {total_sources} relevant trusted sources",
                "trusted_sources_found": total_sources, "verification_details": verification_details}
    elif total_sources >= 1:
        return {"verified": True, "confidence": 0.6,
                "reason": f"Partially verified by {total_sources} relevant source(s)",
                "trusted_sources_found": total_sources, "verification_details": verification_details}
    else:
        return {"verified": False, "confidence": 0.4,
                "reason": "No relevant trusted sources found", "trusted_sources_found": 0}

# ----------------------
# Content Features & Authenticity
# ----------------------
def extract_content_features(text: str) -> Dict:
    text_lower = text.lower()
    return {
        'has_attribution': any(ind in text_lower for ind in ["according to", "sources say", "reported by", "announced by", "confirmed by", "stated that", "said in a statement"]),
        'has_sources': any(ind in text_lower for ind in ["study", "research", "report", "journal", "university", "professor", "expert", "official", "spokesperson", "agency"]),
        'has_specific_details': bool(re.search(r'\b\d{4}\b|\b(january|february|march|april|may|june|july|august|september|october|november|december)\b', text_lower)) 
                                or bool(re.search(r'\b\d+\b', text)) 
                                or bool(re.search(r'\b[A-Z][a-z]+(?:,?\s+[A-Z][a-z]+)*\b', text)),
        'has_context': len(text.split()) > 50
    }

def calculate_authenticity_score(model_score: float, verification_result: Dict) -> float:
    verified_sources = verification_result.get("trusted_sources_found", 0)
    verification_confidence = verification_result.get("confidence", 0.5)
    
    if verified_sources >= 3:
        return model_score*0.3 + verification_confidence*0.7
    elif verified_sources >= 1:
        return model_score*0.5 + verification_confidence*0.5
    else:
        return model_score*0.7

# ----------------------
# Main Classification
# ----------------------
def classify_text(text: str, return_details: bool = False) -> Dict:
    processed_text = preprocess_text(text)

    verification_result = verify_with_trusted_sources(processed_text)
    verified_sources = verification_result.get("trusted_sources_found", 0)

    clf = get_classifier()
    if clf:
        try:
            result = clf(processed_text[:512])[0]
            label = result.get("label", "").upper()
            raw_score = result.get("score", 0.0)
            prediction = "FAKE" if label in ("FAKE", "LABEL_0", "NEGATIVE", "UNRELIABLE") else "REAL"

            authenticity_score = calculate_authenticity_score(raw_score, verification_result)

            if prediction == "FAKE":
                if verified_sources >= 3 and authenticity_score > 0.85:
                    final_prediction = "REAL"
                else:
                    final_prediction = "FAKE"
            elif prediction == "REAL":
                if verified_sources >= 2 or authenticity_score >= 0.7:
                    final_prediction = "REAL"
                else:
                    final_prediction = "FAKE"
            else:
                final_prediction = "UNCERTAIN"

            confidence_level = "high" if authenticity_score > 0.85 else "medium" if authenticity_score >= 0.55 else "low"

            result_dict = {
                "prediction": final_prediction,
                "confidence": confidence_level,
                "authenticity_score": float(authenticity_score),
                "model_prediction": prediction,
                "model_score": float(raw_score),
                "source_verification": verification_result
            }

            if return_details:
                result_dict["content_quality"] = extract_content_features(processed_text)
                result_dict["verification_details"] = verification_result.get("verification_details", [])

            return result_dict
        except Exception as e:
            print(f"Classification error: {e}")

    return {
        "prediction": "UNCERTAIN",
        "score": verification_result.get("confidence", 0.4),
        "source_verification": verification_result,
        "note": "Model unavailable"
    }

def classify_batch(texts: List[str], batch_size: int = 8) -> List[Dict]:
    results = []
    for i in range(0, len(texts), batch_size):
        batch = texts[i:i+batch_size]
        for text in batch:
            results.append(classify_text(text))
    return results
