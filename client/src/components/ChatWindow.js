import React, { useState, useEffect, useRef } from 'react';
import { messagesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './ChatWindow.css';

function ChatWindow({ selectedUser }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const { user } = useAuth();

  useEffect(() => {
    if (selectedUser) {
      loadMessages();
      // Poll for new messages every 3 seconds
      const interval = setInterval(loadMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [selectedUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = async () => {
    if (!selectedUser) return;
    
    setLoading(true);
    try {
      const response = await messagesAPI.getConversation(selectedUser._id);
      setMessages(response.data.messages);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
    setLoading(false);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    setSending(true);
    try {
      await messagesAPI.sendMessage({
        receiverId: selectedUser._id,
        content: newMessage
      });
      
      setNewMessage('');
      await loadMessages(); // Reload messages
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    }
    setSending(false);
  };

  if (!selectedUser) {
    return (
      <div className="chat-window empty">
        <div className="empty-state">
          <h3>👋 Welcome to ChatApp!</h3>
          <p>Select a user from the left to start chatting</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-window">
      <div className="chat-header">
        <div className="user-avatar">
          {selectedUser.username.charAt(0).toUpperCase()}
        </div>
        <div>
          <h3>{selectedUser.username}</h3>
          <p>{selectedUser.email}</p>
        </div>
      </div>

      <div className="messages-container">
        {loading && messages.length === 0 ? (
          <div className="loading">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="no-messages">No messages yet. Say hello! 👋</div>
        ) : (
          messages.map((message) => {
            const isOwnMessage = message.sender._id === user.id;
            return (
              <div
                key={message._id}
                className={`message ${isOwnMessage ? 'own' : 'other'}`}
              >
                <div className="message-content">
                  <p>{message.content}</p>
                  <span className="message-time">
                    {new Date(message.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <form className="message-input" onSubmit={handleSendMessage}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          disabled={sending}
        />
        <button type="submit" disabled={sending || !newMessage.trim()}>
          {sending ? '...' : 'Send'}
        </button>
      </form>
    </div>
  );
}

export default ChatWindow;