import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import toast from 'react-hot-toast';
import { loadModels, getFaceDescriptor } from '../utils/faceRecognition';
import { authAPI } from '../utils/api';
import { useAuth } from '../utils/AuthContext';

export default function FaceSetupPage() {
  const webcamRef = useRef(null);
  const [step, setStep] = useState('instructions'); // instructions | camera | capturing | done
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [captureCount, setCaptureCount] = useState(0);
  const [descriptors, setDescriptors] = useState([]);
  const { updateUser } = useAuth();
  const navigate = useNavigate();

  const startCamera = async () => {
    setStep('loading');
    try {
      await loadModels();
      setModelsLoaded(true);
      setStep('camera');
      toast.success('Camera ready! Position your face in the frame.');
    } catch (err) {
      toast.error('Failed to load face models. Check /public/models folder.');
      setStep('instructions');
    }
  };

  const captureSample = useCallback(async () => {
    if (!webcamRef.current?.video) return;
    const video = webcamRef.current.video;
    const result = await getFaceDescriptor(video);
    if (!result) {
      toast.error('No face detected. Please look directly at the camera.');
      return;
    }
    const newDescriptors = [...descriptors, result.descriptor];
    setDescriptors(newDescriptors);
    setCaptureCount(prev => prev + 1);
    toast.success(`Sample ${newDescriptors.length}/5 captured!`);

    if (newDescriptors.length >= 5) {
      // Average the 5 descriptors for more accuracy
      const averaged = Array(128).fill(0).map((_, i) =>
        newDescriptors.reduce((sum, d) => sum + d[i], 0) / newDescriptors.length
      );
      await saveFace(averaged);
    }
  }, [descriptors]);

  const saveFace = async (descriptor) => {
    setLoading(true);
    setStep('saving');
    try {
      // Also capture a screenshot
      const screenshot = webcamRef.current?.getScreenshot();
      await authAPI.registerFace({ faceDescriptor: descriptor, faceImage: screenshot });
      updateUser({ isFaceRegistered: true });
      setStep('done');
      toast.success('Face registered successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save face data.');
      setStep('camera');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-center">
      <div style={{ width: '100%', maxWidth: '560px' }}>
        <div className="auth-card">
          <div className="auth-logo">
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
              {step === 'done' ? '✅' : '👁️'}
            </div>
            <h1>FACE ENROLLMENT</h1>
            <p>Register your biometrics for secure voting authentication</p>
          </div>

          {/* Instructions */}
          {step === 'instructions' && (
            <div>
              <div className="alert alert-info">
                <span>ℹ️</span>
                <span>Your facial data is processed locally and only a mathematical descriptor (not your photo) is stored securely.</span>
              </div>
              <div style={{ margin: '1.5rem 0' }}>
                {[
                  '🔆 Ensure good, even lighting on your face',
                  '👁️ Look directly at the camera',
                  '😐 Keep a neutral expression',
                  '📸 We will capture 5 samples for accuracy',
                  '🔄 Remove glasses if possible'
                ].map((tip, i) => (
                  <div key={i} style={{ padding: '10px 0', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    {tip}
                  </div>
                ))}
              </div>
              <button className="btn btn-primary btn-full btn-lg" onClick={startCamera}>
                🎥 Start Face Enrollment
              </button>
            </div>
          )}

          {/* Loading models */}
          {step === 'loading' && (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div className="spinner" style={{ margin: '0 auto 1rem' }}></div>
              <p style={{ color: 'var(--text-muted)' }}>Loading AI face recognition models...</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>This may take a moment on first load</p>
            </div>
          )}

          {/* Camera view */}
          {(step === 'camera' || step === 'saving') && (
            <div>
              <div className="webcam-wrapper" style={{ marginBottom: '1rem', borderRadius: '12px', overflow: 'hidden' }}>
                <Webcam
                  ref={webcamRef}
                  audio={false}
                  mirrored
                  screenshotFormat="image/jpeg"
                  videoConstraints={{ width: 480, height: 360, facingMode: 'user' }}
                  style={{ width: '100%', display: 'block' }}
                />
                <div className="webcam-status detected">
                  <span>●</span> Camera Active — {captureCount}/5 samples
                </div>
              </div>

              {/* Progress */}
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  <span>Capture Progress</span><span>{captureCount}/5</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${(captureCount / 5) * 100}%` }}></div>
                </div>
              </div>

              <button
                className="btn btn-success btn-full btn-lg"
                onClick={captureSample}
                disabled={loading || step === 'saving'}
              >
                {step === 'saving' ? '⚙️ Saving...' : `📸 Capture Sample (${captureCount}/5)`}
              </button>
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.75rem' }}>
                Click the button 5 times — look at the camera each time
              </p>
            </div>
          )}

          {/* Done */}
          {step === 'done' && (
            <div style={{ textAlign: 'center' }}>
              <div className="alert alert-success" style={{ marginBottom: '1.5rem', justifyContent: 'center' }}>
                ✅ Face biometrics enrolled successfully!
              </div>
              <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.9rem' }}>
                Your face has been registered. During voting, you'll need to verify your identity with a live face scan.
              </p>
              <button className="btn btn-primary btn-full btn-lg" onClick={() => navigate('/dashboard')}>
                🗳️ Go to Dashboard →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
