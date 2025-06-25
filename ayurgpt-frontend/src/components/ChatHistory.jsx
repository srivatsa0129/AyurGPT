import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const ChatHistory = ({ onSelectChat }) => {
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(null);
  const { isAuthenticated } = useAuth();

  // Memoize the fetchChatHistory function to prevent unnecessary re-creation
  const fetchChatHistory = useCallback(async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authentication required');
      
      const response = await axios.get('/api/chat-history/', {
        headers: { Authorization: `Token ${token}` }
      });
      setChatHistory(response.data);
    } catch (err) {
      setError('Failed to load chat history. Please try again later.');
      console.error('Error fetching chat history:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchChatHistory();
  }, [fetchChatHistory]);

  const handleDeleteChat = useCallback(async (e, chatId) => {
    e.stopPropagation(); // Prevent triggering the onClick of the parent li
    
    if (!window.confirm('Are you sure you want to delete this conversation?')) {
      return;
    }
    
    setDeleteLoading(chatId);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }
      
      await axios.delete(`/api/chat-history/${chatId}/`, {
        headers: { Authorization: `Token ${token}` }
      });
      
      // Update the chat history list after successful deletion
      setChatHistory(prevHistory => prevHistory.filter(chat => chat.id !== chatId));
    } catch (err) {
      console.error('Error deleting chat:', err);
      alert('Failed to delete the conversation. Please try again.');
    } finally {
      setDeleteLoading(null);
    }
  }, []);

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return <div className="chat-history-loading">Loading chat history...</div>;
  }

  if (error) {
    return <div className="chat-history-error">{error}</div>;
  }

  if (chatHistory.length === 0) {
    return (
      <div className="chat-history-empty">
        <p>No chat history yet. Start a new conversation!</p>
      </div>
    );
  }

  return (
    <div className="chat-history-container">
      <h3>Recent Conversations</h3>
      <ul className="chat-history-list">
        {chatHistory.map((chat) => (
          <li 
            key={chat.id} 
            className="chat-history-item"
          >
            <div 
              className="chat-history-content"
              onClick={() => onSelectChat && onSelectChat(chat)}
            >
              <div className="chat-question">{chat.question}</div>
              <div className="chat-timestamp">
                {new Date(chat.timestamp).toLocaleString()}
              </div>
            </div>
            <button 
              className="chat-delete-button"
              onClick={(e) => handleDeleteChat(e, chat.id)}
              disabled={deleteLoading === chat.id}
              title="Delete this conversation"
            >
              {deleteLoading === chat.id ? (
                <span className="loading-spinner"></span>
              ) : (
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <path d="M3 6h18"></path>
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                </svg>
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default React.memo(ChatHistory); 