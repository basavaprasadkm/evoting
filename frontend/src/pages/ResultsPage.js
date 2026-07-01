import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { electionAPI } from '../utils/api';

export default function ResultsPage() {
  const { electionId } = useParams();
  const navigate = useNavigate();
  const [results, setResults] = useState(null);
  const [election, setElection] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      electionAPI.getById(electionId),
      electionAPI.getResults(electionId)
    ]).then(([elRes, resRes]) => {
      setElection(elRes.data.election);
      setResults(resRes.data);
    }).catch(err => {
      toast.error(err.response?.data?.message || 'Could not load results.');
      navigate('/dashboard');
    }).finally(() => setLoading(false));
  }, [electionId, navigate]);

  if (loading) return <div className="page-center"><div className="spinner"></div></div>;
  if (!results || !election) return null;

  const maxVotes = results.results[0]?.voteCount || 1;

  return (
    <div className="page">
      <div className="container-md">
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/dashboard')} style={{ marginBottom: '1rem' }}>
          ← Back
        </button>

        <h1 style={{ marginBottom: '0.5rem' }}>{election.title}</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
          {election.electionType} &nbsp;·&nbsp; Total Votes: <strong style={{ color: 'var(--accent)' }}>{results.totalVotes}</strong>
        </p>

        {/* Winner */}
        {results.winner && (
          <div className="card card-glow" style={{ marginBottom: '2rem', textAlign: 'center', background: 'rgba(0,255,136,0.05)', borderColor: 'var(--success)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🏆</div>
            <h2 style={{ color: 'var(--success)' }}>WINNER</h2>
            <div style={{ fontSize: '2rem', margin: '0.5rem 0' }}>{results.winner.partySymbol}</div>
            <h3 style={{ fontSize: '1.3rem' }}>{results.winner.name}</h3>
            <p style={{ color: 'var(--text-muted)' }}>{results.winner.party}</p>
            <p style={{ color: 'var(--success)', fontWeight: '700', fontSize: '1.1rem', marginTop: '0.5rem' }}>
              {results.winner.voteCount} votes ({results.winner.percentage}%)
            </p>
          </div>
        )}

        {/* Results List */}
        <h2 style={{ marginBottom: '1rem' }}>Full Results</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {results.results.map((r, i) => (
            <div key={i} className="card" style={{ borderColor: i === 0 ? 'var(--success)' : 'var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '50%',
                    background: i === 0 ? 'var(--success)' : 'var(--secondary)',
                    color: i === 0 ? 'var(--primary)' : 'var(--text-muted)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'Orbitron', fontWeight: '700', fontSize: '0.85rem'
                  }}>
                    {r.rank}
                  </div>
                  <div>
                    <div style={{ fontWeight: '700' }}>{r.name}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{r.party}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'Orbitron', fontWeight: '700', color: i === 0 ? 'var(--success)' : 'var(--text)' }}>
                    {r.voteCount}
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{r.percentage}%</div>
                </div>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{
                  width: `${(r.voteCount / maxVotes) * 100}%`,
                  background: i === 0 ? 'var(--success)' : 'var(--gradient)'
                }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
