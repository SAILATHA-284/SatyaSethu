import os
from werkzeug.utils import secure_filename
from config import UPLOAD_FOLDER
ALLOWED_IMG = {'png','jpg','jpeg','bmp','gif'}
ALLOWED_VIDEO = {'mp4','mov','avi','mkv'}

def allowed_file(filename, allowed_set):
    return '.' in filename and filename.rsplit('.',1)[1].lower() in allowed_set

def save_file(file):
    filename = secure_filename(file.filename)
    path = os.path.join(UPLOAD_FOLDER, filename)
    file.save(path)
    return path
