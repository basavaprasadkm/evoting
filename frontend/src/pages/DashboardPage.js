import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { electionAPI, adminAPI } from '../utils/api';
import { useAuth } from '../utils/AuthContext';

export default function DashboardPage() {
  const { user } = useAuth();
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => { fetchElections(); }, []);

  const fetchElections = async () => {
    try {
      const res = await electionAPI.getAll();
      setElections(res.data.elections);
    } catch (err) {
      toast.error('Could not load elections.');
    } finally {
      setLoading(false);
    }
  };

  const seedDemo = async () => {
    try {
      await adminAPI.seedElection();
      toast.success('Demo election created!');
      fetchElections();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error seeding election.');
    }
  };

  const statusBadge = (status) => {
    const map = {
      active: <span className="badge badge-success">● LIVE</span>,
      upcoming: <span className="badge badge-warning">⏳ UPCOMING</span>,
      completed: <span className="badge badge-accent">✓ COMPLETED</span>,
      cancelled: <span className="badge badge-danger">✕ CANCELLED</span>
    };
    return map[status] || <span className="badge">{status}</span>;
  };

  const hasVotedIn = (electionId) =>
    user?.hasVoted?.some(v => (v.electionId?._id || v.electionId) === electionId);

  return (
    <div className="page">
      <div className="container">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1>Welcome, {user?.name?.split(' ')[0]} 👋</h1>
            <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>
              Voter ID: <span className="mono" style={{ color: 'var(--accent)' }}>{user?.voterId}</span>
              &nbsp;·&nbsp; Constituency: {user?.constituency}
            </p>
          </div>
          {user?.role === 'admin' && (
            <button className="btn btn-outline btn-sm" onClick={seedDemo}>+ Seed Demo Election</button>
          )}
        </div>

        {/* Status Cards */}
        <div className="grid-4" style={{ marginBottom: '2rem' }}>
          <div className="stat-card">
            <div className="stat-value">{user?.isFaceRegistered ? '✅' : '❌'}</div>
            <div className="stat-label">Face Enrolled</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{elections.filter(e => e.status === 'active').length}</div>
            <div className="stat-label">Active Elections</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{user?.hasVoted?.length || 0}</div>
            <div className="stat-label">Votes Cast</div>
          </div>
          <div className="stat-card">
            <div className="stat-value" style={{ color: user?.isVerified ? 'var(--success)' : 'var(--danger)' }}>
              {user?.isVerified ? '✓' : '✕'}
            </div>
            <div className="stat-label">Verified Voter</div>
          </div>
        </div>

        {/* Face Setup Warning */}
        {!user?.isFaceRegistered && (
          <div className="alert alert-error" style={{ marginBottom: '2rem' }}>
            <span>⚠️</span>
            <div>
              <strong>Face Not Enrolled!</strong> You must register your face before you can vote.
              <Link to="/face-setup" className="btn btn-danger btn-sm" style={{ marginLeft: '1rem' }}>
                Enroll Now
              </Link>
            </div>
          </div>
        )}

        {/* Elections */}
        <h2 style={{ marginBottom: '1rem' }}>Available Elections</h2>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <div className="spinner" style={{ margin: '0 auto' }}></div>
          </div>
        ) : elections.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🗳️</div>
            <p>No elections available for your constituency.</p>
            {user?.role === 'admin' && (
              <button className="btn btn-outline" style={{ marginTop: '1rem' }} onClick={seedDemo}>
                Create Demo Election
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {elections.map(election => {
              const voted = hasVotedIn(election._id);
              const canVote = election.status === 'active' && !voted && user?.isFaceRegistered;
              return (
                <div key={election._id} className="election-card">
                  <div className="election-header">
                    <div>
                      <div className="election-title">{election.title}</div>
                      <div className="election-meta">
                        {election.electionType} &nbsp;·&nbsp;
                        {new Date(election.startDate).toLocaleDateString()} – {new Date(election.endDate).toLocaleDateString()}
                      </div>
                    </div>
                    {statusBadge(election.status)}
                  </div>

                  {election.description && (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                      {election.description}
                    </p>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        {election.candidates?.length} candidates &nbsp;·&nbsp; {election.totalVotes} votes cast
                      </span>
                      {voted && <span className="badge badge-success">✓ You Voted</span>}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {election.status === 'completed' && (
                        <button className="btn btn-outline btn-sm" onClick={() => navigate(`/results/${election._id}`)}>
                          📊 Results
                        </button>
                      )}
                      {user?.role === 'admin' && election.status === 'active' && (
                        <button className="btn btn-outline btn-sm" onClick={() => navigate(`/results/${election._id}`)}>
                          📊 Live Results
                        </button>
                      )}
                      {canVote && (
                        <button className="btn btn-success btn-sm" onClick={() => navigate(`/vote/${election._id}`)}>
                          🗳️ Vote Now
                        </button>
                      )}
                      {election.status === 'active' && voted && (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', padding: '6px 0' }}>
                          Already voted
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
