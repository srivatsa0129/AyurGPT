import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Login = ({ onLoginSuccess }) => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log("Login component: Attempting login with AuthContext.login");
      // Use the AuthContext login function
      const response = await login(formData.email, formData.password);
      console.log("Login component: Login successful, response:", response);
      
      // Call the success callback with the response data
      if (onLoginSuccess) {
        console.log("Login component: Calling onLoginSuccess callback");
        onLoginSuccess(response);
      } else {
        console.error("Login component: onLoginSuccess callback is not defined");
      }
    } catch (err) {
      console.error("Login component: Login error:", err);
      
      // Enhanced error handling
      let errorMessage;
      
      if (err.response && err.response.status === 500) {
        errorMessage = "Server error. Please contact support.";
      } else {
        errorMessage = 
          err.response?.data?.non_field_errors?.[0] || 
          err.response?.data?.email?.[0] ||
          err.response?.data?.password?.[0] ||
          err.response?.data?.error || 
          'An error occurred during login. Please try again.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2>Login to AyurGPT</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
};

export default Login; 