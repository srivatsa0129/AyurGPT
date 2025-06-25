import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Login from '../components/Login';

const LoginPage = () => {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [loginSuccess, setLoginSuccess] = useState(false);

  // Redirect to chat if already authenticated
  useEffect(() => {
    console.log("LoginPage: isAuthenticated =", isAuthenticated, "loading =", loading);
    if (isAuthenticated && !loading) {
      console.log("Already authenticated, redirecting to /chat");
      navigate('/chat', { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  const handleLoginSuccess = (data) => {
    console.log("Login success in LoginPage:", data);
    setLoginSuccess(true);
    
    // Use a small delay to show success message before redirecting
    setTimeout(() => {
      console.log("Redirecting to /chat after successful login");
      navigate('/chat', { replace: true });
    }, 1500);
  };

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="loading-text">Loading...</div>
        </div>
      </div>
    );
  }

  // Don't render the login form if already authenticated (should redirect)
  if (isAuthenticated) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="success-message">
            Already logged in. Redirecting to chat...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-logo">
          <svg
            className="ayurvedic-leaf"
            viewBox="0 0 100 100"
            xmlns="http://www.w3.org/2000/svg"
            width="50"
            height="50"
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
        
        {loginSuccess ? (
          <div className="success-message">
            Login successful! Redirecting to chat...
          </div>
        ) : (
          <>
            <Login onLoginSuccess={handleLoginSuccess} />
            <div className="auth-footer">
              <p>
                Don't have an account? <Link to="/signup" className="auth-link">Sign Up</Link>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LoginPage; 