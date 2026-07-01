import React, { useRef, useEffect, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { loadModels, drawDetections, isModelLoaded } from '../utils/faceRecognition';

export default function FaceCamera({ onFaceDetected, onNoFace, continuous = false, width = 480 }) {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const intervalRef = useRef(null);
  const [status, setStatus] = useState('loading');
  const [modelsReady, setModelsReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        setStatus('loading');
        if (!isModelLoaded()) await loadModels();
        setModelsReady(true);
        setStatus('ready');
      } catch (err) {
        setStatus('error');
        console.error('Model load error:', err);
      }
    };
    init();
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const detect = useCallback(async () => {
    if (!modelsReady || !webcamRef.current?.video || !canvasRef.current) return;
    const video = webcamRef.current.video;
    if (video.readyState !== 4) return;

    const hasFace = await drawDetections(video, canvasRef.current);

    if (hasFace) {
      setStatus('detected');
      if (onFaceDetected) onFaceDetected(video);
    } else {
      setStatus('no-face');
      if (onNoFace) onNoFace();
    }
  }, [modelsReady, onFaceDetected, onNoFace]);

  useEffect(() => {
    if (!modelsReady) return;
    if (continuous) {
      intervalRef.current = setInterval(detect, 200);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [modelsReady, continuous, detect]);

  const statusMessages = {
    loading: { text: '⚙️ Loading AI Models...', cls: 'detecting' },
    ready: { text: '👁️ Camera Ready', cls: 'detecting' },
    detected: { text: '✅ Face Detected', cls: 'detected' },
    'no-face': { text: '🔍 Looking for face...', cls: 'detecting' },
    error: { text: '❌ Model load failed', cls: 'error' }
  };

  const s = statusMessages[status] || statusMessages.ready;

  return (
    <div className="webcam-wrapper" style={{ width: '100%', maxWidth: width }}>
      <Webcam
        ref={webcamRef}
        audio={false}
        mirrored
        screenshotFormat="image/jpeg"
        videoConstraints={{ width: 640, height: 480, facingMode: 'user' }}
        style={{ width: '100%', display: 'block' }}
      />
      <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} />
      <div className={`webcam-status ${s.cls}`}>
        <span className={status === 'no-face' || status === 'loading' ? 'pulse' : ''}>●</span>
        {s.text}
      </div>
    </div>
  );
}
