@echo off
echo Downloading face-api.js models...

set MODEL_DIR=frontend\public\models
if not exist "%MODEL_DIR%" mkdir "%MODEL_DIR%"

set BASE=https://github.com/justadudewhohacks/face-api.js/raw/master/weights

curl -L -o "%MODEL_DIR%\tiny_face_detector_model-weights_manifest.json" "%BASE%/tiny_face_detector_model-weights_manifest.json"
curl -L -o "%MODEL_DIR%\tiny_face_detector_model-shard1" "%BASE%/tiny_face_detector_model-shard1"
curl -L -o "%MODEL_DIR%\face_landmark_68_model-weights_manifest.json" "%BASE%/face_landmark_68_model-weights_manifest.json"
curl -L -o "%MODEL_DIR%\face_landmark_68_model-shard1" "%BASE%/face_landmark_68_model-shard1"
curl -L -o "%MODEL_DIR%\face_recognition_model-weights_manifest.json" "%BASE%/face_recognition_model-weights_manifest.json"
curl -L -o "%MODEL_DIR%\face_recognition_model-shard1" "%BASE%/face_recognition_model-shard1"
curl -L -o "%MODEL_DIR%\face_recognition_model-shard2" "%BASE%/face_recognition_model-shard2"
curl -L -o "%MODEL_DIR%\face_expression_model-weights_manifest.json" "%BASE%/face_expression_model-weights_manifest.json"
curl -L -o "%MODEL_DIR%\face_expression_model-shard1" "%BASE%/face_expression_model-shard1"

echo.
echo Models downloaded successfully to %MODEL_DIR%
pause
