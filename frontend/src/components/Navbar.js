import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const isActive = (path) => location.pathname === path ? 'nav-link active' : 'nav-link';

  return (
    <nav className="navbar">
      <Link to="/dashboard" className="navbar-brand">
        <span>🗳️</span> SECURE<span>VOTE</span>
      </Link>
      
      <div className="nav-links">
        <Link to="/dashboard" className={isActive('/dashboard')}>Dashboard</Link>
        <Link to="/profile" className={isActive('/profile')}>Profile</Link>
        {user?.role === 'admin' && (
          <Link to="/admin" className={isActive('/admin')}>
            Admin <span className="nav-badge">ADMIN</span>
          </Link>
        )}
        {!user?.isFaceRegistered && (
          <Link to="/face-setup" className="btn btn-outline btn-sm">Setup Face</Link>
        )}
        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          {user?.name?.split(' ')[0]}
        </span>
        <button onClick={handleLogout} className="btn btn-ghost btn-sm">Logout</button>
      </div>
    </nav>
  );
}
