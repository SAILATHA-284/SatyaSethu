from flask import Blueprint, request, jsonify
import requests
from bs4 import BeautifulSoup
from urllib.parse import urlparse
import re
from models.text_model import classify_text  # your text classifier

url_bp = Blueprint("url", __name__)

# --------------------------
# Trusted & Flagged Domains
# --------------------------
TRUSTED_SOURCES = {
    'reuters.com', 'apnews.com', 'bbc.com', 'bbc.co.uk',
    'nytimes.com', 'washingtonpost.com', 'theguardian.com',
    'wsj.com', 'bloomberg.com', 'npr.org', 'pbs.org',
    'economist.com', 'ft.com', 'cnn.com', 'nbcnews.com',
    'cbsnews.com', 'abcnews.go.com', 'usatoday.com',
    'time.com', 'newsweek.com', 'politico.com', 'axios.com',
    'thehill.com', 'propublica.org', 'latimes.com',
    'aljazeera.com', 'dw.com', 'france24.com', 'timesnownews.com',
    'timesofindia.indiatimes.com', 'indianexpress.com', 'firstpost.com',
    'altnews.in', 'ddnews.gov.in','indiatoday.in'
}

FLAGGED_DOMAINS = [
    "opindia.com", "postcard.news", "sudarshannews.in", "swarajyamag.com", "thefrustratedindian.com",
    "kreately.in", "dainikbharat.org", "hindupost.in", "theyouth.in", "indiaspeaksdaily.com",
    "aajkitazakhabar.com", "nationwantstoknow.com", "truepicture.in", "sirfnews.com", "thelogicalindian.com",
    "newsroompost.com", "mynation.com", "tv9bharatvarsh.com", "vskbharat.com",
    "bharatkhabar.com", "jankibaat.com", "hindutva.info", "dailyhunt.in", "jagran.com",
    "amarujala.com", "punjabkesari.in", "hindi.news18.com", "oneindia.com", "newsx.com",
    "breakingtube.com", "dailyswitch.com", "thecommune.in", "sanatanprabhat.org", "aapkikhabar.com",
    "rashtrasamachar.com", "factorfictionindia.com", "currentaffairsindia.com", "bharattoday.in", "deshkibaat.com",
    "indiaviralnews.com", "lokmatnews.in", "khabarindia.com", "patrika.com", "indiabulletin.com",
    "rashtriyasamachar.com", "virarnationindia.com", "breakingbharat.com", "hindustanexpress.com", "newsnation.in",
    "indiafastnews.com", "dailybhaskar.com", "hindustantimesbuzz.com", "yournewswire.com", "infowars.com",
    "breitbart.com", "naturalnews.com", "thegatewaypundit.com", "worldnewsdailyreport.com", "beforeitsnews.com",
    "americannews.com", "newswatch28.com", "empirenews.net", "nationalreport.net", "libertywritersnews.com",
    "theonion.com", "clickhole.com", "dailybuzzlive.com", "civictribune.com", "dcgazette.com",
    "redstatewatcher.com", "usasupreme.com", "thelastlineofdefense.org", "newsexaminer.net", "realnewsrightnow.com",
    "therightists.com", "conservativedailypost.com", "70news.wordpress.com", "babylonbee.com", "disclose.tv",
    "peoplesvoice.org", "politicalinsider.com", "thefederalist.com", "zerohedge.com", "rt.com",
    "sputniknews.com", "presstv.com", "almasdarnews.com", "veteranstoday.com", "southfront.org",
    "infostormer.com", "investmentwatchblog.com", "bigamericannews.com", "newslo.com", "channel23news.com",
    "empireherald.com", "theresistance.info", "bostontribune.com", "dailycurrant.com", "thespoof.com",
    "worldtruth.tv", "pakalertpress.com", "naturalsociety.com", "collective-evolution.com", "anti-media.com",
    "intellihub.com", "neonnettle.com", "thefreethoughtproject.com", "themindunleashed.com", "politicalmayhem.news",
    "thelibertybeacon.com", "globalresearch.ca"
]

CLEAN_FLAGGED_DOMAINS = [d.lower().replace(" ", "") for d in FLAGGED_DOMAINS]

# --------------------------
# URL Analyzer
# --------------------------
@url_bp.route("/analyze", methods=["POST"])
def analyze_url():
    data = request.get_json()
    if not data or "url" not in data:
        return jsonify({"error": "Missing URL"}), 400

    target_url = data["url"].strip()
    parsed = urlparse(target_url)
    domain = parsed.netloc.lower().replace("www.", "")

    # ✅ If in trusted sources → immediately return authentic
    if any(domain == ts or domain.endswith("." + ts) for ts in TRUSTED_SOURCES):
        return jsonify({
            "url": target_url,
            "domain": domain,
            "title": "Trusted Source Content",
            "author": "Trusted Publication",
            "model_prediction":{
                "prediction": "REAL"
            },
            "source_verification": True,
            "final_prediction": "Authentic",
            "summary": {
                "content_snippet": "",
                "reason": "This domain is a verified trusted news source."
            }
        }), 200

    try:
        # Fetch page
        response = requests.get(target_url, timeout=8, headers={"User-Agent": "Mozilla/5.0"})
        if response.status_code != 200:
            return jsonify({"error": f"Unable to access page (status {response.status_code})"}), 400

        # Parse title safely
        soup = BeautifulSoup(response.text, "html.parser")
        raw_title = soup.title.string.strip() if soup.title else "No title found"

        # Clean title while preserving possessive apostrophes (e.g., Japan's)
        title = raw_title.strip()
        title = re.sub(r'^[\'"“”‘’]+|[\'"“”‘’]+$', '', title)
        title = title.rstrip(".…")
        title = re.split(r'\s*[-–—]\s*', title)[0].strip()

        # Parse author
        author_tag = soup.find(attrs={"name": re.compile(r"author", re.I)})
        author = author_tag["content"] if author_tag and author_tag.get("content") else "Unknown"

        # Run classifier on title
        model_pred = classify_text(title)

        # Extract snippet
        paragraphs = [p.get_text(separator=" ", strip=True) for p in soup.find_all("p")]
        text_content = re.sub(r"\s+", " ", " ".join(paragraphs))[:3000]

        # Check flagged domains
        is_flagged = any(domain == fd or domain.endswith("." + fd) for fd in CLEAN_FLAGGED_DOMAINS)

        # Final decision
        
        final_prediction = "Potentially Fake" if is_flagged or model_pred.get('prediction', '').upper() == 'FAKE' else "Authentic"
        reason = "Model or domain flagged this content as fake" if final_prediction == "Potentially Fake" else "Content appears authentic"

        result = {
            "url": target_url,
            "domain": domain,
            "title": title,
            "author": author,
            "model_prediction": model_pred,
            "source_verification": is_flagged,
            "final_prediction": final_prediction,
            "summary": {
                "content_snippet": text_content[:300] + "...",
                "reason": reason
            }
        }

        print("🔹 URL Analysis Result:", result)
        return jsonify(result), 200

    except Exception as e:
        return jsonify({"error": f"URL analysis failed: {str(e)}"}), 500
