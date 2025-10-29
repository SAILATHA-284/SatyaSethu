from flask import Blueprint, request, jsonify
from models.text_model import classify_text
from routes.utils import allowed_file, save_file
import os, cloudinary, cloudinary.uploader
from serpapi.google_search import GoogleSearch  # Make sure serpapi 2.x is installed
from dotenv import load_dotenv

# =================== LOAD ENV VARIABLES ===================
load_dotenv()
CLOUD_NAME = os.getenv("CLOUDINARY_CLOUD_NAME")
CLOUD_KEY = os.getenv("CLOUDINARY_API_KEY")
CLOUD_SECRET = os.getenv("CLOUDINARY_API_SECRET")
SERPAPI_KEY = os.getenv("SERPAPI_KEY","d7448f57698bdac1b865377899c08d67e184d8f3d2b8aa0fe13445e49570dcef")

# =================== CLOUDINARY CONFIG ===================
cloudinary.config(
    cloud_name=CLOUD_NAME,
    api_key=CLOUD_KEY,
    api_secret=CLOUD_SECRET
)

detect_bp = Blueprint("detect", __name__)

# =================== TEXT DETECTION ===================
@detect_bp.route("/text", methods=["POST"])
def detect_text():
    data = request.json
    text = data.get("text", "")
    if not text:
        return jsonify({"error": "no text provided"}), 400

    result = classify_text(text)

    # 🔹 Print result to terminal
    print("==== TEXT DETECTION ====")
    print("Input text:", text)
    print("Predicted result:", result)
    print("========================\n")

    return jsonify({"input": text, "result": result})

# =================== IMAGE DETECTION ===================
@detect_bp.route("/image", methods=["POST"])
def detect_image():
    if "file" not in request.files:
        return jsonify({"error": "no file"}), 400

    f = request.files["file"]
    if f.filename == "":
        return jsonify({"error": "no file selected"}), 400
    if not allowed_file(f.filename, {"png", "jpg", "jpeg", "bmp", "gif"}):
        return jsonify({"error": "file type not allowed"}), 400

    path = save_file(f)

    try:
        # Upload to Cloudinary
        upload_result = cloudinary.uploader.upload(path)
        cloud_url = upload_result.get("secure_url")
        if not cloud_url:
            return jsonify({"error": "upload failed"}), 500

        # Reverse Image Search via SerpAPI
        reverse_results = serpapi_reverse_search(cloud_url)

        # Rank results by fake keywords
        ranked_results = rank_by_fake_keywords(reverse_results)

        # Deepfake placeholder
        df_result = run_deepfake_stub(path)

        # 🔹 Print everything to terminal
        print("==== IMAGE DETECTION ====")
        print("Uploaded URL:", cloud_url)
        print("Reverse search results:")
        for r in ranked_results:
            print(r)
        print("Deepfake placeholder:", df_result)
        print("========================\n")

        return jsonify({
            "uploaded_url": cloud_url,
            "reverse_search_ranked": ranked_results,
            "deepfake": df_result
        })

    except Exception as e:
        print("Error:", str(e))
        return jsonify({"error": str(e)}), 500

    finally:
        if os.path.exists(path):
            os.remove(path)

# =================== HELPER FUNCTIONS ===================
def serpapi_reverse_search(image_url: str):
    try:
        params = {
            "engine": "google_reverse_image",
            "image_url": image_url,
            "api_key": SERPAPI_KEY
        }
        search = GoogleSearch(params)
        results = search.get_dict()

        image_results = results.get("image_results", [])
        formatted = []

        for img in image_results:
            formatted.append({
                "title": img.get("title") or "No title available",
                "link": img.get("link") or img.get("original") or "",
                "source": img.get("source") or "",
                "thumbnail": img.get("thumbnail") or img.get("thumbnail_url") or "",
                "snippet": img.get("snippet") or "",
                "relevance_score": 0
            })

        return formatted or [{"note": "No similar images found"}]

    except Exception as e:
        print("SerpAPI error:", str(e))
        return [{"error": f"SerpAPI error: {str(e)}"}]

def rank_by_fake_keywords(results):
    if not isinstance(results, list):
        return results

    keywords = ["fake", "hoax", "doctored", "edited", "deepfake", "misleading"]

    for item in results:
        score = 0
        text = f"{item.get('title', '')} {item.get('snippet', '')}".lower()
        for word in keywords:
            if word in text:
                score += 1
        item["relevance_score"] = score

    results.sort(key=lambda x: x.get("relevance_score", 0), reverse=True)
    return results

def run_deepfake_stub(path):
    return {
        "note": "Deepfake detection placeholder — model integration pending",
        "path": os.path.basename(path)
    }
