from flask import Blueprint, request, jsonify
from models.text_model import classify_text
from routes.utils import allowed_file, save_file
from PIL import Image, ImageFilter, ImageOps
import pytesseract
import os, traceback

ocr_bp = Blueprint("ocr", __name__)

# If Tesseract is not in PATH (Windows example)
# pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
@ocr_bp.route("/scan", methods=["POST"])
def scan_image():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    f = request.files['file']
    if f.filename == "":
        return jsonify({"error": "No file selected"}), 400

    if not allowed_file(f.filename, {'png', 'jpg', 'jpeg', 'bmp', 'gif'}):
        return jsonify({"error": "File type not allowed"}), 400

    # Save file
    try:
        path = save_file(f)
        if not os.path.exists(path):
            return jsonify({"error": "File could not be saved"}), 500
        print("Saved file:", path)
    except Exception as e:
        print("File saving error:", traceback.format_exc())
        return jsonify({"error": "Failed to save file", "details": str(e)}), 500

    # OCR
    try:
        img = Image.open(path)
        img = img.convert("L")  # grayscale
        img = img.filter(ImageFilter.SHARPEN)
        img = ImageOps.autocontrast(img)

        extracted_text = pytesseract.image_to_string(
            img, lang='eng', config='--oem 1 --psm 6'
        ).strip()
        print("Extracted text:", extracted_text)
    except Exception as e:
        print("OCR error:", traceback.format_exc())
        return jsonify({"error": "OCR failed", "details": str(e)}), 500

    if not extracted_text:
        return jsonify({"ocr_text": "", "classification": "No text detected"}), 200

    # Classification
    try:
        if len(extracted_text.split()) < 4:
            classification = "Uncertain: text too short"
        else:
            classification = classify_text(extracted_text)
    except Exception as e:
        print("Classification error:", traceback.format_exc())
        classification = f"Classification failed: {str(e)}"

    return jsonify({
        "path": os.path.basename(path),
        "ocr_text": extracted_text,
        "classification": classification
    })
