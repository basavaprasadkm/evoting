import * as faceapi from 'face-api.js';

let modelsLoaded = false;

// Load face-api models from public folder
export const loadModels = async () => {
  if (modelsLoaded) return;
  
  const MODEL_URL = '/models';
  
  try {
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
    ]);
    modelsLoaded = true;
    console.log('✅ Face-API models loaded');
  } catch (err) {
    console.error('❌ Error loading face models:', err);
    throw new Error('Could not load face recognition models. Check /public/models folder.');
  }
};

// Detect and compute 128-d face descriptor from video element
export const getFaceDescriptor = async (videoElement) => {
  if (!modelsLoaded) await loadModels();
  
  const options = new faceapi.TinyFaceDetectorOptions({ 
    inputSize: 320, 
    scoreThreshold: 0.5 
  });
  
  const detection = await faceapi
    .detectSingleFace(videoElement, options)
    .withFaceLandmarks()
    .withFaceDescriptor();
  
  if (!detection) return null;
  
  return {
    descriptor: Array.from(detection.descriptor),
    box: detection.detection.box,
    score: detection.detection.score
  };
};

// Draw detections on canvas
export const drawDetections = async (videoElement, canvas) => {
  if (!modelsLoaded) return;
  
  const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 320 });
  const detections = await faceapi
    .detectAllFaces(videoElement, options)
    .withFaceLandmarks();
  
  const displaySize = { width: videoElement.videoWidth, height: videoElement.videoHeight };
  faceapi.matchDimensions(canvas, displaySize);
  
  const resized = faceapi.resizeResults(detections, displaySize);
  
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  resized.forEach(det => {
    const box = det.detection.box;
    // Draw bounding box
    ctx.strokeStyle = '#00ff88';
    ctx.lineWidth = 2;
    ctx.strokeRect(box.x, box.y, box.width, box.height);
    
    // Draw landmarks
    const landmarks = det.landmarks.positions;
    ctx.fillStyle = '#00ff88';
    landmarks.forEach(pt => {
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 2, 0, Math.PI * 2);
      ctx.fill();
    });
  });
  
  return resized.length > 0;
};

// Compute Euclidean distance between two descriptors
export const computeDistance = (desc1, desc2) => {
  let sum = 0;
  for (let i = 0; i < 128; i++) {
    sum += Math.pow(desc1[i] - desc2[i], 2);
  }
  return Math.sqrt(sum);
};

export const isModelLoaded = () => modelsLoaded;
