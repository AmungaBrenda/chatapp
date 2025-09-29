import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">💬 ChatApp</Link>
      </div>
      
      {user && (
        <div className="navbar-menu">
          <span className="navbar-user">Hello, {user.username}!</span>
          <button onClick={handleLogout} className="btn-logout">
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}

export default Navbar;