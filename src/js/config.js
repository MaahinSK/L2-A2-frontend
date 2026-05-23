// API Configuration
// For production, use the Vercel deployed backend URL
// For local development, use localhost

const isProduction = window.location.hostname !== 'localhost' && 
                     window.location.hostname !== '127.0.0.1';

export const API_BASE_URL = isProduction 
  ? 'https://l2-a2-backend.vercel.app/api'  // Change this to your actual backend URL
  : 'http://localhost:5000/api';

export const APP_NAME = 'DevPulse';