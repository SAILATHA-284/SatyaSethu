from flask import Flask
from flask_cors import CORS
from config import UPLOAD_FOLDER
import os

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
CORS(app)

from routes.detect import detect_bp
from routes.ocr import ocr_bp
from routes.current_affairs import news_bp
from routes.url import url_bp
app.register_blueprint(detect_bp, url_prefix="/api/detect")
app.register_blueprint(ocr_bp, url_prefix="/api/ocr")
app.register_blueprint(news_bp, url_prefix="/api/news")
app.register_blueprint(url_bp, url_prefix="/api/url-check")

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
