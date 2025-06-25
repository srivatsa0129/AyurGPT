import React from 'react';
import { createRoot } from 'react-dom/client';
import axios from 'axios';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Set axios base URL
axios.defaults.baseURL = 'http://localhost:8000';

// Create a root first
const root = createRoot(document.getElementById('root'));

// Use React production mode
// Then render your app
root.render(
  // Remove StrictMode in production to prevent double rendering
  <App />
);

// Measure performance in app, but don't report vitals in production
// to reduce overhead
if (process.env.NODE_ENV === 'development') {
  reportWebVitals(console.log);
}
