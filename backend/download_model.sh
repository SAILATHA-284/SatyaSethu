        #!/bin/bash
        # Usage: ./download_model.sh <HF_MODEL_ID>
        # Example: ./download_model.sh distilroberta-base
        set -e
        if [ -z "$1" ]; then
          echo "Please pass a HuggingFace model id (e.g., distilroberta-base)\nUsage: ./download_model.sh <HF_MODEL_ID>"
          exit 1
        fi
        MODEL_ID="$1"
        TARGET_DIR="$(pwd)/models/hf_model"
        mkdir -p "$TARGET_DIR"
        # Try huggingface-cli (user must be logged in) or use transformers to download
        python - <<PY
import os
from pathlib import Path
from transformers import AutoTokenizer, AutoModelForSequenceClassification
model_id = os.environ.get('MODEL_ID', '') or '${MODEL_ID}'
target = Path('${TARGET_DIR}')
print('Downloading model:', model_id, 'to', target)
tokenizer = AutoTokenizer.from_pretrained(model_id)
model = AutoModelForSequenceClassification.from_pretrained(model_id)
tokenizer.save_pretrained(target)
model.save_pretrained(target)
print('Model downloaded and saved to', target)
PY
        echo "Done."
