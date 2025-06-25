import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const HomePage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect to chat if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/chat');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="home-page">
      <div className="home-container">
        <div className="home-content">
          <div className="home-logo">
            <svg
              className="ayurvedic-leaf"
              viewBox="0 0 100 100"
              xmlns="http://www.w3.org/2000/svg"
              width="80"
              height="80"
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
            <h1>AyurGPT</h1>
          </div>
          
          <div className="home-description">
            <h2>Your AI Ayurvedic Companion</h2>
            <p>
              Discover the wisdom of Ayurveda with our intelligent assistant.
              Get personalized answers to your health questions based on ancient Ayurvedic principles.
            </p>
          </div>
          
          <div className="home-buttons">
            <Link to="/login" className="home-button login">Login</Link>
            <Link to="/signup" className="home-button signup">Sign Up</Link>
          </div>
          
          <div className="home-features">
            <div className="feature-item">
              <h3>Personalized Guidance</h3>
              <p>Get answers tailored to your specific health concerns</p>
            </div>
            <div className="feature-item">
              <h3>Ancient Wisdom</h3>
              <p>Access knowledge from traditional Ayurvedic texts</p>
            </div>
            <div className="feature-item">
              <h3>Modern Approach</h3>
              <p>Combining traditional wisdom with modern science</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage; 