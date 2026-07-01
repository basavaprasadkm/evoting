import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { authAPI, voteAPI } from '../utils/api';
import { useAuth } from '../utils/AuthContext';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [votingHistory, setVotingHistory] = useState([]);
  const [receiptInput, setReceiptInput] = useState('');
  const [verifyResult, setVerifyResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    voteAPI.getMyVotes()
      .then(res => setVotingHistory(res.data.votingHistory))
      .catch(() => {});
  }, []);

  const verifyReceipt = async () => {
    if (!receiptInput.trim()) return toast.error('Enter a receipt token.');
    setLoading(true);
    try {
      const res = await voteAPI.verifyReceipt(receiptInput.trim());
      setVerifyResult(res.data);
    } catch {
      setVerifyResult({ verified: false });
      toast.error('Receipt not found.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="container-md">
        <h1 style={{ marginBottom: '2rem' }}>My Profile</h1>

        {/* Voter Info Card */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ marginBottom: '1.5rem' }}>Voter Information</h2>
          <div className="grid-2">
            {[
              { label: 'Full Name', value: user?.name },
              { label: 'Voter ID', value: user?.voterId, mono: true },
              { label: 'Email', value: user?.email },
              { label: 'Constituency', value: user?.constituency },
              { label: 'Face Enrolled', value: user?.isFaceRegistered ? '✅ Yes' : '❌ No' },
              { label: 'Account Status', value: user?.isVerified ? '✅ Verified' : '⏳ Pending' },
            ].map(({ label, value, mono }) => (
              <div key={label}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>{label}</div>
                <div className={mono ? 'mono' : ''} style={{ fontWeight: '600', color: 'var(--text)' }}>{value}</div>
              </div>
            ))}
          </div>
          {!user?.isFaceRegistered && (
            <button className="btn btn-primary btn-sm" style={{ marginTop: '1.5rem' }} onClick={() => navigate('/face-setup')}>
              👁️ Enroll Face Now
            </button>
          )}
        </div>

        {/* Voting History */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ marginBottom: '1rem' }}>Voting History</h2>
          {votingHistory.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>You haven't voted in any elections yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {votingHistory.map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--secondary)', borderRadius: '8px' }}>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>
                      {item.electionId?.title || 'Election'}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Voted on {new Date(item.votedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <span className="badge badge-success">✓ Voted</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Verify Receipt */}
        <div className="card">
          <h2 style={{ marginBottom: '0.5rem' }}>Verify Vote Receipt</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
            Enter your vote receipt token to verify it was counted.
          </p>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <input
              className="form-input mono"
              style={{ flex: 1 }}
              placeholder="Paste your receipt token here..."
              value={receiptInput}
              onChange={e => setReceiptInput(e.target.value)}
            />
            <button className="btn btn-outline" onClick={verifyReceipt} disabled={loading}>
              {loading ? '⚙️' : '🔍 Verify'}
            </button>
          </div>
          {verifyResult && (
            <div className={`alert ${verifyResult.verified ? 'alert-success' : 'alert-error'}`}>
              {verifyResult.verified ? (
                <div>
                  ✅ <strong>Vote Verified!</strong> Cast on {new Date(verifyResult.vote?.timestamp).toLocaleString()}
                  <br />
                  <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>Hash: {verifyResult.vote?.hash?.substring(0, 32)}...</span>
                </div>
              ) : (
                '❌ Receipt not found. Invalid or tampered token.'
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
