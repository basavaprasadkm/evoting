import React from 'react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  const features = [
    { icon: '🧠', title: 'Facial Recognition', desc: 'Real-time biometric authentication using AI face detection to ensure only registered voters can vote.' },
    { icon: '🔐', title: 'End-to-End Security', desc: 'Blockchain-inspired vote chaining with SHA-256 hashing ensures tamper-proof vote integrity.' },
    { icon: '👤', title: 'Voter Anonymity', desc: 'Votes are decoupled from voter identities. Your choice is private, your identity is verified.' },
    { icon: '⚡', title: 'Real-Time Results', desc: 'Live election results as votes are cast. Transparent counting with cryptographic verification.' },
    { icon: '🛡️', title: 'Anti-Fraud Protection', desc: 'Rate limiting, JWT authentication, duplicate vote prevention, and account lockout protection.' },
    { icon: '📱', title: 'Cross-Platform', desc: 'Works on any modern browser — desktop or mobile — with a camera for facial authentication.' }
  ];

  return (
    <div className="landing">
      <div className="landing-bg"></div>
      <div className="landing-grid"></div>

      {/* Hero */}
      <div className="landing-content" style={{ padding: '4rem 2rem 2rem', textAlign: 'center' }}>
        <div style={{ marginBottom: '2rem' }}>
          <span style={{ 
            background: 'rgba(79,110,247,0.15)', border: '1px solid rgba(79,110,247,0.3)',
            color: 'var(--accent)', padding: '6px 16px', borderRadius: '20px',
            fontSize: '0.8rem', fontWeight: '700', letterSpacing: '2px',
            display: 'inline-block', marginBottom: '1.5rem'
          }}>
            🔒 BIOMETRIC E-VOTING SYSTEM
          </span>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', lineHeight: 1.2, marginBottom: '1rem' }}>
            SECURE ELECTIONS
            <br />
            <span style={{ background: 'var(--gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              POWERED BY AI
            </span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto 2rem', lineHeight: 1.6 }}>
            A next-generation e-voting platform with facial recognition authentication, 
            cryptographic vote integrity, and real-time transparent results.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-primary btn-lg">Register to Vote</Link>
            <Link to="/login" className="btn btn-outline btn-lg">Login</Link>
          </div>
        </div>

        {/* Features */}
        <div style={{ maxWidth: '1000px', margin: '4rem auto 0' }}>
          <h2 style={{ marginBottom: '2rem', color: 'var(--text-muted)', fontSize: '0.9rem', letterSpacing: '3px', fontFamily: 'Rajdhani', textTransform: 'uppercase' }}>
            Security Features
          </h2>
          <div className="grid-3" style={{ textAlign: 'left' }}>
            {features.map((f, i) => (
              <div key={i} className="card" style={{ padding: '1.5rem' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{f.icon}</div>
                <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>{f.title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', lineHeight: 1.5 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* How it works */}
        <div style={{ maxWidth: '700px', margin: '4rem auto', textAlign: 'center' }}>
          <h2 style={{ marginBottom: '2rem' }}>How It Works</h2>
          {[
            { step: '01', title: 'Register', desc: 'Create your voter account with your Aadhar ID and personal details.' },
            { step: '02', title: 'Enroll Face', desc: 'Capture your facial biometrics using your camera for future authentication.' },
            { step: '03', title: 'Verify & Vote', desc: 'Before voting, verify your identity with a live face scan — then cast your vote securely.' },
            { step: '04', title: 'Get Receipt', desc: 'Receive a cryptographic vote receipt to verify your vote was counted correctly.' }
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem', textAlign: 'left', alignItems: 'flex-start' }}>
              <div style={{ 
                minWidth: '50px', height: '50px', borderRadius: '50%',
                background: 'var(--gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'Orbitron', fontWeight: '700', fontSize: '0.85rem', color: 'white', flexShrink: 0
              }}>{item.step}</div>
              <div>
                <h3 style={{ fontSize: '1rem', marginBottom: '4px' }}>{item.title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '4rem' }}>
          Built as a Final Year Engineering Project | Secure E-Voting with Facial Recognition
        </p>
      </div>
    </div>
  );
}
