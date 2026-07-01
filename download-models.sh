#!/bin/bash
# Run this script to download face-api.js models into frontend/public/models/
# These are required for facial recognition to work

echo "📥 Downloading face-api.js models..."

MODEL_DIR="./frontend/public/models"
mkdir -p "$MODEL_DIR"

BASE_URL="https://github.com/justadudewhohacks/face-api.js/raw/master/weights"

FILES=(
  "tiny_face_detector_model-weights_manifest.json"
  "tiny_face_detector_model-shard1"
  "face_landmark_68_model-weights_manifest.json"
  "face_landmark_68_model-shard1"
  "face_recognition_model-weights_manifest.json"
  "face_recognition_model-shard1"
  "face_recognition_model-shard2"
  "face_expression_model-weights_manifest.json"
  "face_expression_model-shard1"
)

for file in "${FILES[@]}"; do
  echo "  ⬇️  Downloading $file..."
  curl -L -o "$MODEL_DIR/$file" "$BASE_URL/$file"
done

echo ""
echo "✅ All models downloaded to $MODEL_DIR"
echo "   You can now run the frontend with 'npm start'"
