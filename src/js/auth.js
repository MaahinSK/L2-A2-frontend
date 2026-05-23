import { authAPI, setToken, setUser, removeToken, removeUser, getUser } from './api.js';
import { showToast } from './utils.js';

// Check if user is authenticated
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  return token && user;
};

// Get current user role
export const getUserRole = () => {
  const user = getUser();
  return user ? user.role : null;
};

// Check if user is maintainer
export const isMaintainer = () => {
  const role = getUserRole();
  return role === 'maintainer';
};

// Handle login form submission
export const handleLogin = async (event) => {
  event.preventDefault();
  
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const submitBtn = event.target.querySelector('button[type="submit"]');
  
  // Store original text
  submitBtn.setAttribute('data-original-text', submitBtn.innerHTML);
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<div class="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div> Logging in...';
  
  try {
    const response = await authAPI.login({ email, password });
    
    if (response.success) {
      setToken(response.data.token);
      setUser(response.data.user);
      showToast('Login successful! Redirecting...');
      
      // Redirect to dashboard
      setTimeout(() => {
        window.location.href = '/dashboard.html';
      }, 1000);
    }
  } catch (error) {
    showToast(error.message || 'Login failed', 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = 'Login';
  }
};

// Handle signup form submission
export const handleSignup = async (event) => {
  event.preventDefault();
  
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const role = document.getElementById('role').value;
  const submitBtn = event.target.querySelector('button[type="submit"]');
  
  // Store original text
  submitBtn.setAttribute('data-original-text', submitBtn.innerHTML);
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<div class="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div> Creating account...';
  
  try {
    const response = await authAPI.signup({ name, email, password, role });
    
    if (response.success) {
      showToast('Account created successfully! Please login.');
      
      // Redirect to login page
      setTimeout(() => {
        window.location.href = '/login.html';
      }, 1500);
    }
  } catch (error) {
    showToast(error.message || 'Signup failed', 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = 'Create Account';
  }
};

// Handle logout
export const handleLogout = () => {
  removeToken();
  removeUser();
  showToast('Logged out successfully');
  setTimeout(() => {
    window.location.href = '/login.html';
  }, 500);
};

// Check auth and redirect if not authenticated
export const requireAuth = () => {
  if (!isAuthenticated()) {
    window.location.href = '/login.html';
  }
};

// Redirect if already logged in
export const redirectIfLoggedIn = () => {
  if (isAuthenticated()) {
    window.location.href = '/dashboard.html';
  }
};