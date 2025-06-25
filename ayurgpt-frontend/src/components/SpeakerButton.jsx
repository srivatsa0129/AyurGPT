import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const SpeakerButton = ({ text, className, audio, contentType }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef(null);
  const audioSourceRef = useRef(null);
  
  // Clean up audio when component unmounts
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);
  
  const handleSpeech = async () => {
    // If already playing, stop audio
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      return;
    }
    
    // If no text provided, do nothing
    if (!text) return;
    
    try {
      setIsLoading(true);
      
      // If audio data is already provided (from chat response), use it directly
      if (audio && contentType) {
        playAudioFromBase64(audio);
        return;
      }
      
      // Otherwise fetch audio from API
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error("Authentication required. Please login again.");
      }
      
      // Call the text-to-speech API
      const response = await axios.post('/api/text-to-speech/', 
        { text, language: 'en' },
        { headers: { Authorization: `Token ${token}` }}
      );
      
      // Get the base64-encoded audio
      const audioData = response.data.audio;
      playAudioFromBase64(audioData);
      
    } catch (err) {
      console.error("Error playing text-to-speech:", err);
      alert("Could not play audio. Please try again.");
      setIsLoading(false);
    }
  };
  
  const playAudioFromBase64 = (base64Audio) => {
    try {
      // Create audio source from base64 data
      const audio = new Audio(`data:audio/mp3;base64,${base64Audio}`);
      audioRef.current = audio;
      
      // Store the audio source to prevent garbage collection
      audioSourceRef.current = base64Audio;
      
      // Play the audio
      audio.play();
      setIsPlaying(true);
      
      // Set state back to not playing when audio ends
      audio.onended = () => {
        setIsPlaying(false);
      };
    } catch (err) {
      console.error("Error playing audio:", err);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <button 
      className={`speaker-button ${className || ''} ${isPlaying ? 'playing' : ''} ${isLoading ? 'loading' : ''}`}
      onClick={handleSpeech}
      title={isPlaying ? "Stop speaking" : "Listen"}
      disabled={isLoading}
    >
      {isLoading ? (
        <span className="loading-spinner"></span>
      ) : isPlaying ? (
        // Stop icon
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="6" y="6" width="12" height="12" rx="1"></rect>
        </svg>
      ) : (
        // Speaker icon
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
        </svg>
      )}
    </button>
  );
};

export default React.memo(SpeakerButton); 