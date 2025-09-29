import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Register from './components/Register';
import UserList from './components/UserList';
import ChatWindow from './components/ChatWindow';
import './App.css';

// Protected Route Component
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading-screen">Loading...</div>;
  }

  return user ? children : <Navigate to="/login" />;
}

// Home Page Component
function HomePage() {
  const [selectedUser, setSelectedUser] = useState(null);

  return (
    <div className="home-container">
      <UserList onSelectUser={setSelectedUser} selectedUser={selectedUser} />
      <ChatWindow selectedUser={selectedUser} />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <HomePage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;