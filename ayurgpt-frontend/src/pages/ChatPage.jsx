import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import ChatHistory from '../components/ChatHistory';
import SpeakerButton from '../components/SpeakerButton';

// This component will contain the main chat interface
const ChatPage = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const [processingStatus, setProcessingStatus] = useState('');

  // Redirect to login if not authenticated
  useEffect(() => {
    console.log("ChatPage: isAuthenticated =", isAuthenticated);
    
    // Add a small delay to ensure authentication state is loaded
    const checkAuth = setTimeout(() => {
      if (!isAuthenticated) {
        console.log("Not authenticated, redirecting to login page");
        navigate('/login', { replace: true });
      } else {
        console.log("User authenticated, staying on chat page:", user);
      }
    }, 100);
    
    return () => clearTimeout(checkAuth);
  }, [isAuthenticated, navigate, user]);

  // Scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Setup mobile menu toggle
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sidebarOpen && 
          !e.target.closest('.sidebar') && 
          !e.target.closest('.mobile-menu-button')) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [sidebarOpen]);

  // Function to format text with bold formatting for content between asterisks
  const formatTextWithBold = (text) => {
    if (!text) return "";
    
    // Replace asterisks with bold tags
    const formattedText = text.replace(/\*(.*?)\*/g, '<strong class="highlighted-text">$1</strong>');
    
    // Replace newlines with line breaks
    return formattedText.replace(/\n/g, "<br />");
  };

  // Handle starting a new chat
  const handleNewChat = () => {
    setMessages([]);
    setInputMessage('');
    setError('');
  };

  // Handle sending a message
  const handleSendMessage = async (e) => {
    e.preventDefault(); // Prevent form submission from reloading the page
    
    if (!inputMessage.trim()) return;
    
    // Add user message to the chat
    const userMessage = {
      text: inputMessage,
      sender: "user",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);
    setError('');
    setProcessingStatus('Initiating request...');
    
    try {
      console.log("Sending chat request:", inputMessage);
      
      // Get the token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error("Authentication required. Please login again.");
      }
      
      // Add typing indicator message immediately
      const typingIndicatorId = Date.now();
      setMessages(prev => [...prev, {
        id: typingIndicatorId,
        isTypingIndicator: true,
        sender: "bot",
        processingUpdates: []
      }]);
      
      // Make API request with enable_tts flag
      const response = await axios.post('/api/chat/', 
        { 
          question: inputMessage,
          enable_tts: true // Enable text-to-speech automatically
        },
        { headers: { Authorization: `Token ${token}` }},
        { timeout: 60000 } // 60-second timeout
      );
      
      console.log("Chat response:", response.data);
      
      // If the backend provided processing steps, show those in the UI
      // Otherwise use our simulated steps with timeouts
      if (response.data.processing_steps && Array.isArray(response.data.processing_steps)) {
        // Show each processing step with a delay
        response.data.processing_steps.forEach((step, index) => {
          updateProcessingStatus(step, index * 1000);
        });
      } else {
        // Use simulated steps if backend didn't provide any
        updateProcessingStatus('Retrieving relevant Ayurvedic knowledge...', 500);
        updateProcessingStatus('Analyzing Sanskrit literature...', 2000);
        updateProcessingStatus('Preparing Ayurvedic insights...', 3500);
        updateProcessingStatus('Generating personalized response...', 5000);
      }
      
      // Wait a bit to show the final steps
      setTimeout(() => {
        setProcessingStatus('Response received. Rendering content...');
        
        // Remove typing indicator and add the actual response
        setMessages(prev => {
          const newMessages = prev.filter(msg => !msg.isTypingIndicator);
          return [...newMessages, {
            text: response.data.answer || "I couldn't generate a response at this time.",
            sender: "bot",
            timestamp: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            // Store audio if available from the response
            audio: response.data.audio,
            contentType: response.data.content_type
          }];
        });
      }, response.data.processing_steps ? response.data.processing_steps.length * 1000 + 1000 : 5500);
      
    } catch (err) {
      console.error("Error sending message:", err);
      setProcessingStatus('Error encountered during processing.');
      
      // Remove typing indicator
      setMessages(prev => prev.filter(msg => !msg.isTypingIndicator));
      
      // Handle authentication errors
      if (err.response?.status === 401 || err.response?.status === 403 || 
          err.message.includes("Authentication")) {
        const errorMessage = {
          text: "Your session has expired. Please log in again.",
          sender: "bot",
          isError: true,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
        
        setMessages(prev => [...prev, errorMessage]);
        
        // Redirect to login after a short delay
        setTimeout(() => {
          logout();
          navigate('/login', { replace: true });
        }, 3000);
        
        return;
      }
      
      // Add error message to the chat for other errors
      const errorMessage = {
        text: `Error: ${err.response?.data?.error || "Failed to get a response. Please try again."}`,
        sender: "bot",
        isError: true,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      
      setMessages(prev => [...prev, errorMessage]);
      setError(err.response?.data?.error || "Failed to get a response. Please try again.");
    } finally {
      setLoading(false);
      setTimeout(() => setProcessingStatus(''), 1500); // Clear processing status after a delay
    }
  };

  // Function to update processing status with delay
  const updateProcessingStatus = (status, delay) => {
    setTimeout(() => {
      setProcessingStatus(status);
      
      // Also update the typing indicator with the processing status
      setMessages(prevMessages => {
        return prevMessages.map(msg => {
          if (msg.isTypingIndicator) {
            return {
              ...msg,
              processingUpdates: [...(msg.processingUpdates || []), status]
            };
          }
          return msg;
        });
      });
      
    }, delay);
  };

  // Handle clicking on a suggestion chip
  const handleSuggestionClick = (suggestion) => {
    setInputMessage(suggestion);
  };

  // Toggle sidebar on mobile
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Return early if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="loading-screen">
        <div className="leaf-container">
          <svg
            className="ayurvedic-leaf"
            viewBox="0 0 100 100"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M50,10 C70,10 90,30 90,50 C90,70 70,90 50,90 C30,90 10,70 10,50 C10,30 30,10 50,10 Z"
              fill="#4CAF50"
              fillOpacity="0.8"
            />
          </svg>
          <div className="loading-text">Checking authentication...</div>
        </div>
      </div>
    );
  }

  // Chat interface (only shown when authenticated)
  return (
    <div className={`app-container ${sidebarOpen ? 'sidebar-open' : ''}`}>
      <div className="chat-container">
        <div className={`sidebar ${sidebarOpen ? 'show' : ''}`}>
          <div className="sidebar-header">
            <div className="logo">
              <svg
                className="small-leaf"
                viewBox="0 0 100 100"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
              >
                <path
                  d="M50,10 C70,10 90,30 90,50 C90,70 70,90 50,90 C30,90 10,70 10,50 C10,30 30,10 50,10 Z"
                  fill="#4CAF50"
                />
              </svg>
              <h1>
                <a
                  href="/"
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  AyurGPT
                </a>
              </h1>
            </div>
          </div>
          <div className="sidebar-content">
            <div className="user-profile">
              <p>Welcome, {user?.username}!</p>
              <button 
                className="logout-button" 
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
              >
                Logout
              </button>
            </div>
            <button 
              className="sidebar-new-chat-button" 
              onClick={handleNewChat}
              title="Start a new chat"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M12 5v14M5 12h14"></path>
              </svg>
              <span>New Chat</span>
            </button>
            <ChatHistory onSelectChat={(chat) => {
              // Handle selecting chat history
              console.log("Selected chat:", chat);
              
              // Add the chat to the messages
              const chatQuestion = {
                text: chat.question,
                sender: "user",
                timestamp: new Date(chat.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
              };
              
              const chatAnswer = {
                text: chat.answer,
                sender: "bot",
                timestamp: new Date(chat.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
              };
              
              setMessages([chatQuestion, chatAnswer]);
              
              // Close sidebar on mobile after selection
              setSidebarOpen(false);
            }} />
            <div className="sidebar-section">
              <h3>Explore Ayurveda</h3>
              <ul className="sidebar-nav">
                <li>
                  <button onClick={() => {
                    handleSuggestionClick("What are the three doshas in Ayurveda?");
                    setSidebarOpen(false);
                  }}>
                    The Three Doshas
                  </button>
                </li>
                <li>
                  <button onClick={() => {
                    handleSuggestionClick("What is Prakriti in Ayurveda?");
                    setSidebarOpen(false);
                  }}>
                    Understanding Prakriti
                  </button>
                </li>
                <li>
                  <button onClick={() => {
                    handleSuggestionClick("What are the principles of Ayurvedic diet?");
                    setSidebarOpen(false);
                  }}>
                    Ayurvedic Diet
                  </button>
                </li>
                <li>
                  <button onClick={() => {
                    handleSuggestionClick("What are common Ayurvedic herbs and their benefits?");
                    setSidebarOpen(false);
                  }}>
                    Medicinal Herbs
                  </button>
                </li>
                <li>
                  <button onClick={() => {
                    handleSuggestionClick("What is dinacharya in Ayurveda?");
                    setSidebarOpen(false);
                  }}>
                    Daily Routine (Dinacharya)
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="main-content">
          <header className="chat-header">
            <button className="mobile-menu-button" onClick={toggleSidebar}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
            <div className="header-title">
              <h2>Chat with AyurGPT</h2>
            </div>
          </header>
          <div className="messages-container">
            {messages.length === 0 ? (
              <div className="welcome-message">
                <div className="welcome-leaf">
                  <svg
                    className="ayurvedic-leaf"
                    viewBox="0 0 100 100"
                    xmlns="http://www.w3.org/2000/svg"
                    width="60"
                    height="60"
                  >
                    <path
                      d="M50,10 C70,10 90,30 90,50 C90,70 70,90 50,90 C30,90 10,70 10,50 C10,30 30,10 50,10 Z"
                      fill="#4CAF50"
                      fillOpacity="0.8"
                    />
                    <path
                      d="M50,10 C50,30 50,70 50,90"
                      stroke="#fff"
                      strokeWidth="1"
                    />
                    <path
                      d="M30,30 C40,40 60,60 70,70"
                      stroke="#fff"
                      strokeWidth="1"
                    />
                    <path
                      d="M70,30 C60,40 40,60 30,70"
                      stroke="#fff"
                      strokeWidth="1"
                    />
                  </svg>
                </div>
                <h2>Welcome to AyurGPT</h2>
                <p>Ask questions about Ayurvedic medicine and principles</p>
                <div className="suggestion-chips">
                  <button 
                    className="suggestion-chip"
                    onClick={() => handleSuggestionClick("What are the three doshas?")}
                  >
                    What are the three doshas?
                  </button>
                  <button 
                    className="suggestion-chip"
                    onClick={() => handleSuggestionClick("Herbs for digestion")}
                  >
                    Herbs for digestion
                  </button>
                  <button 
                    className="suggestion-chip"
                    onClick={() => handleSuggestionClick("Daily Ayurvedic routine")}
                  >
                    Daily Ayurvedic routine
                  </button>
                </div>
              </div>
            ) : (
              <>
                {messages.map((message, index) => {
                  // Skip rendering typing indicators - they're handled separately
                  if (message.isTypingIndicator) {
                    return null;
                  }
                  
                  return (
                    <div
                      key={index}
                      className={`message ${message.sender} ${message.isError ? "error" : ""}`}
                    >
                      {message.sender === "bot" && (
                        <div className="avatar">
                          <svg
                            className="small-leaf"
                            viewBox="0 0 100 100"
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                          >
                            <path
                              d="M50,10 C70,10 90,30 90,50 C90,70 70,90 50,90 C30,90 10,70 10,50 C10,30 30,10 50,10 Z"
                              fill={message.isError ? "#f44336" : "#4CAF50"}
                            />
                          </svg>
                        </div>
                      )}
                      <div className="message-content">
                        <div
                          className="message-text"
                          dangerouslySetInnerHTML={{
                            __html: formatTextWithBold(message.text),
                          }}
                        ></div>
                        <div className="message-time">
                          {message.timestamp}
                          {message.sender === "bot" && !message.isError && (
                            <SpeakerButton 
                              text={message.text} 
                              className="message-speaker" 
                              audio={message.audio}
                              contentType={message.contentType}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {/* Separate typing indicator component with processing updates */}
                {messages.some(msg => msg.isTypingIndicator) && (
                  <div className="message bot typing">
                    <div className="avatar">
                      <svg
                        className="small-leaf"
                        viewBox="0 0 100 100"
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                      >
                        <path
                          d="M50,10 C70,10 90,30 90,50 C90,70 70,90 50,90 C30,90 10,70 10,50 C10,30 30,10 50,10 Z"
                          fill="#4CAF50"
                        />
                      </svg>
                    </div>
                    <div className="message-content">
                      <div className="typing-container">
                        <div className="typing-indicator">
                          <span></span>
                          <span></span>
                          <span></span>
                        </div>
                        {processingStatus && (
                          <div className="processing-status">{processingStatus}</div>
                        )}
                      </div>
                      {messages.find(msg => msg.isTypingIndicator)?.processingUpdates?.length > 0 && (
                        <div className="processing-updates">
                          {messages.find(msg => msg.isTypingIndicator).processingUpdates.map((update, idx) => (
                            <div key={idx} className="processing-update-item">
                              <span className="checkmark">✓</span> {update}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </>
            )}
          </div>
          <form className="input-area" onSubmit={handleSendMessage}>
            <input
              type="text"
              placeholder="Ask about Ayurvedic medicine..."
              className="message-input"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={loading}
            />
            <button type="submit" className="send-button" disabled={loading || !inputMessage.trim()}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatPage; 