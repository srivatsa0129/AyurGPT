import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

// Create the context
const AuthContext = createContext();

// Create a provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is logged in on initial load
  useEffect(() => {
    const checkAuth = async () => {
      console.log("Checking authentication on app load...");
      const token = localStorage.getItem('token');
      if (token) {
        console.log("Token found in localStorage");
        axios.defaults.headers.common['Authorization'] = `Token ${token}`;
        try {
          const response = await axios.get('/api/user/');
          console.log("User data retrieved:", response.data);
          setUser(response.data.user);
          setIsAuthenticated(true);
        } catch (err) {
          console.error("Error checking authentication:", err.response?.data || err.message);
          // Token is invalid or expired
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          delete axios.defaults.headers.common['Authorization'];
          setError('Session expired. Please login again.');
        }
      } else {
        console.log("No token found in localStorage");
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (email, password) => {
    setError(null);
    try {
      console.log("AuthContext: Attempting login...");
      const response = await axios.post('/api/login/', { email, password });
      console.log("AuthContext: Login successful:", response.data);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      axios.defaults.headers.common['Authorization'] = `Token ${response.data.token}`;
      setUser(response.data.user);
      setIsAuthenticated(true);
      return response.data;
    } catch (err) {
      console.error("AuthContext: Login failed:", err.response?.data || err.message);
      const errorMessage = 
        err.response?.data?.non_field_errors?.[0] || 
        err.response?.data?.email?.[0] ||
        err.response?.data?.password?.[0] ||
        err.response?.data?.error || 
        'Login failed. Please try again.';
      setError(errorMessage);
      throw err;
    }
  };

  // Register function
  const register = async (userData) => {
    setError(null);
    try {
      console.log("AuthContext: Attempting registration...");
      const response = await axios.post('/api/register/', userData);
      console.log("AuthContext: Registration successful:", response.data);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      axios.defaults.headers.common['Authorization'] = `Token ${response.data.token}`;
      setUser(response.data.user);
      setIsAuthenticated(true);
      return response.data;
    } catch (err) {
      console.error("AuthContext: Registration failed:", err.response?.data || err.message);
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
      throw err;
    }
  };

  // Logout function
  const logout = () => {
    console.log("AuthContext: Logging out...");
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    setIsAuthenticated(false);
    console.log("AuthContext: Logged out, isAuthenticated =", false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        error,
        login,
        register,
        logout,
        setError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; 