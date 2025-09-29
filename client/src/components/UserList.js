import React, { useState, useEffect } from 'react';
import { usersAPI } from '../services/api';
import './UserList.css';

function UserList({ onSelectUser, selectedUser }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await usersAPI.getAllUsers();
      setUsers(response.data.users);
      setLoading(false);
    } catch (err) {
      setError('Failed to load users');
      setLoading(false);
    }
  };

  if (loading) return <div className="user-list loading">Loading users...</div>;
  if (error) return <div className="user-list error">{error}</div>;

  return (
    <div className="user-list">
      <h3>Users</h3>
      {users.length === 0 ? (
        <p className="no-users">No other users yet</p>
      ) : (
        <ul>
          {users.map(user => (
            <li
              key={user._id}
              className={selectedUser?._id === user._id ? 'active' : ''}
              onClick={() => onSelectUser(user)}
            >
              <div className="user-avatar">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div className="user-info">
                <div className="user-name">{user.username}</div>
                <div className="user-email">{user.email}</div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default UserList;