import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import toast from 'react-hot-toast';
import { electionAPI, voteAPI, authAPI } from '../utils/api';
import { loadModels, getFaceDescriptor } from '../utils/faceRecognition';

export default function VotingPage() {
  const { electionId } = useParams();
  const navigate = useNavigate();
  const webcamRef = useRef(null);

  const [election, setElection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState('info'); // info | face-verify | select | confirm | receipt
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [faceToken, setFaceToken] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [casting, setCasting] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [modelsReady, setModelsReady] = useState(false);

  useEffect(() => {
    electionAPI.getById(electionId)
      .then(res => setElection(res.data.election))
      .catch(() => { toast.error('Election not found.'); navigate('/dashboard'); })
      .finally(() => setLoading(false));
  }, [electionId, navigate]);

  const startFaceVerify = async () => {
    setStep('face-verify');
    try {
      await loadModels();
      setModelsReady(true);
    } catch {
      toast.error('Could not load face models.');
      setStep('info');
    }
  };

  const verifyFace = async () => {
    if (!webcamRef.current?.video) return;
    setVerifying(true);
    try {
      const result = await getFaceDescriptor(webcamRef.current.video);
      if (!result) {
        toast.error('No face detected. Please look directly at the camera.');
        setVerifying(false);
        return;
      }
      const res = await authAPI.verifyFace({ faceDescriptor: result.descriptor });
      if (res.data.verified) {
        setFaceToken(res.data.faceToken);
        toast.success(`✅ Identity verified (${res.data.confidence}% match)`);
        setStep('select');
      } else {
        toast.error(`Face verification failed (${res.data.confidence}% match). Try again.`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification error.');
    } finally {
      setVerifying(false);
    }
  };

  const castVote = async () => {
    if (!selectedCandidate || !faceToken) return;
    setCasting(true);
    try {
      const res = await voteAPI.castVote({
        electionId,
        candidateId: selectedCandidate._id,
        faceToken
      });
      setReceipt(res.data);
      setStep('receipt');
      toast.success('🗳️ Vote cast successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cast vote.');
      if (err.response?.data?.message?.includes('face verification expired')) {
        setFaceToken(null);
        setStep('face-verify');
        toast('Please re-verify your face.', { icon: '🔄' });
      }
    } finally {
      setCasting(false);
    }
  };

  if (loading) return <div className="page-center"><div className="spinner"></div></div>;
  if (!election) return null;

  return (
    <div className="page">
      <div className="container-md">
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/dashboard')} style={{ marginBottom: '1rem' }}>
            ← Back
          </button>
          <h1>{election.title}</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>
            {election.electionType} &nbsp;·&nbsp; Ends: {new Date(election.endDate).toLocaleString()}
          </p>
        </div>

        {/* Step Progress */}
        <div className="steps" style={{ marginBottom: '2rem' }}>
          {['Info', 'Face Verify', 'Select', 'Confirm', 'Receipt'].map((label, i) => {
            const stepMap = { info: 0, 'face-verify': 1, select: 2, confirm: 3, receipt: 4 };
            const current = stepMap[step];
            return (
              <div key={i} className={`step ${current > i ? 'done' : current === i ? 'active' : ''}`}>
                <div className="step-circle">{current > i ? '✓' : i + 1}</div>
                <div className="step-label">{label}</div>
              </div>
            );
          })}
        </div>

        {/* STEP: Info */}
        {step === 'info' && (
          <div className="card">
            <h2 style={{ marginBottom: '1rem' }}>Before You Vote</h2>
            <div className="alert alert-info" style={{ marginBottom: '1rem' }}>
              <span>🔐</span><span>Your identity will be verified using facial recognition before you can cast your vote.</span>
            </div>
            {[
              '✅ You can only vote once in this election',
              '🧠 Your face will be matched against your enrolled biometrics',
              '🔒 Your vote is anonymous — not linked to your identity',
              '📜 You will receive a cryptographic receipt after voting',
              '⏱️ Face verification token is valid for 5 minutes only'
            ].map((item, i) => (
              <div key={i} style={{ padding: '10px 0', borderBottom: '1px solid var(--border)', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                {item}
              </div>
            ))}
            <button className="btn btn-primary btn-full btn-lg" style={{ marginTop: '1.5rem' }} onClick={startFaceVerify}>
              👁️ Proceed to Face Verification
            </button>
          </div>
        )}

        {/* STEP: Face Verification */}
        {step === 'face-verify' && (
          <div className="card">
            <h2 style={{ marginBottom: '1rem' }}>Identity Verification</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              Look directly at the camera and click "Verify Identity". Keep a neutral expression in good lighting.
            </p>
            {!modelsReady ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <div className="spinner" style={{ margin: '0 auto 1rem' }}></div>
                <p style={{ color: 'var(--text-muted)' }}>Loading face recognition AI...</p>
              </div>
            ) : (
              <>
                <div className="webcam-wrapper" style={{ marginBottom: '1.5rem', borderRadius: '12px', overflow: 'hidden' }}>
                  <Webcam
                    ref={webcamRef}
                    audio={false}
                    mirrored
                    videoConstraints={{ width: 640, height: 480, facingMode: 'user' }}
                    style={{ width: '100%', display: 'block' }}
                  />
                  <div className="webcam-status detected">
                    <span className={verifying ? 'pulse' : ''}>●</span>
                    {verifying ? 'Analyzing face...' : 'Camera Active'}
                  </div>
                </div>
                <button className="btn btn-primary btn-full btn-lg" onClick={verifyFace} disabled={verifying}>
                  {verifying ? '⚙️ Verifying...' : '🔍 Verify My Identity'}
                </button>
              </>
            )}
          </div>
        )}

        {/* STEP: Select Candidate */}
        {step === 'select' && (
          <div>
            <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>
              ✅ Identity verified! Select your preferred candidate below.
            </div>
            <h2 style={{ marginBottom: '1.5rem' }}>Choose Your Candidate</h2>
            <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
              {election.candidates.map(candidate => (
                <div
                  key={candidate._id}
                  className={`candidate-card ${selectedCandidate?._id === candidate._id ? 'selected' : ''}`}
                  onClick={() => setSelectedCandidate(candidate)}
                >
                  <div className="candidate-symbol">{candidate.partySymbol}</div>
                  <div className="candidate-name">{candidate.name}</div>
                  <div className="candidate-party">{candidate.party}</div>
                  {candidate.manifesto && (
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '8px', fontStyle: 'italic' }}>
                      "{candidate.manifesto}"
                    </p>
                  )}
                </div>
              ))}
            </div>
            {selectedCandidate && (
              <button className="btn btn-success btn-full btn-lg" onClick={() => setStep('confirm')}>
                Confirm Selection: {selectedCandidate.name} →
              </button>
            )}
          </div>
        )}

        {/* STEP: Confirm */}
        {step === 'confirm' && (
          <div className="card">
            <h2 style={{ marginBottom: '1.5rem' }}>Confirm Your Vote</h2>
            <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
              ⚠️ This action is irreversible. You cannot change your vote after submission.
            </div>
            <div style={{ background: 'var(--secondary)', borderRadius: '10px', padding: '1.5rem', marginBottom: '1.5rem', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>{selectedCandidate.partySymbol}</div>
              <h3>{selectedCandidate.name}</h3>
              <p style={{ color: 'var(--text-muted)' }}>{selectedCandidate.party}</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <button className="btn btn-outline" onClick={() => setStep('select')} disabled={casting}>
                ← Change
              </button>
              <button className="btn btn-success" onClick={castVote} disabled={casting}>
                {casting ? '⚙️ Casting...' : '✅ Cast Vote'}
              </button>
            </div>
          </div>
        )}

        {/* STEP: Receipt */}
        {step === 'receipt' && receipt && (
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
            <h2 style={{ color: 'var(--success)', marginBottom: '0.5rem' }}>Vote Cast Successfully!</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Your vote has been securely recorded.</p>

            <div style={{ background: 'var(--secondary)', borderRadius: '10px', padding: '1.5rem', marginBottom: '1.5rem', textAlign: 'left' }}>
              <h3 style={{ marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--text-muted)', letterSpacing: '1px' }}>VOTE RECEIPT</h3>
              <div style={{ marginBottom: '0.75rem' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>RECEIPT TOKEN</div>
                <div className="mono" style={{ fontSize: '0.85rem', wordBreak: 'break-all', color: 'var(--accent)' }}>{receipt.receiptToken}</div>
              </div>
              <div style={{ marginBottom: '0.75rem' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>VOTE HASH (SHA-256)</div>
                <div className="mono" style={{ fontSize: '0.75rem', wordBreak: 'break-all', color: 'var(--success)' }}>{receipt.voteHash}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>TIMESTAMP</div>
                <div style={{ fontSize: '0.85rem' }}>{new Date(receipt.timestamp).toLocaleString()}</div>
              </div>
            </div>

            <div className="alert alert-info" style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
              💡 Save your receipt token to verify your vote was counted correctly.
            </div>
            <button className="btn btn-primary btn-full" onClick={() => navigate('/dashboard')}>
              ← Return to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
