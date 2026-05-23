// API Configuration
// For production, use the Vercel deployed backend URL
// For local development, use localhost

const isProduction = window.location.hostname !== 'localhost' && 
                     window.location.hostname !== '127.0.0.1';

export const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5000/api'
  : 'https://l2-a2-backend.vercel.app/api';

export const APP_NAME = 'DevPulse';