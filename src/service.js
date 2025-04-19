const API_URL = 'http://localhost:8000';

// Add this helper function for logging
const logRequest = (method, url, headers, body) => {
  console.group(`API Request: ${method} ${url}`);
  console.log('Headers:', headers);
  if (body) console.log('Body:', body);
  console.groupEnd();
};

export const login = async (email, password) => {
  const url = `${API_URL}/api/login`;
  const headers = { 'Content-Type': 'application/json' };
  const body = JSON.stringify({ email, password });
  
  logRequest('POST', url, headers, body);
  
  const response = await fetch(url, {
    method: 'POST',
    headers,
    body
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Login failed');
  }
  
  const data = await response.json();
  console.log('Login successful:', data);
  return data;
};

export const register = async (email, password) => {
  const url = `${API_URL}/api/register`;
  const headers = { 'Content-Type': 'application/json' };
  const body = JSON.stringify({ email, password });
  
  logRequest('POST', url, headers, body);
  
  const response = await fetch(url, {
    method: 'POST',
    headers,
    body
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Registration failed');
  }
  
  const data = await response.json();
  console.log('Registration successful:', data);
  return data;
};

export const saveUserProfile = async (token, profileData) => {
  const url = `${API_URL}/api/profile`;
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
  
  logRequest('POST', url, headers, profileData);
  
  if (!token) {
    console.error('No token provided to saveUserProfile');
    throw new Error('Authentication token is missing');
  }
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(profileData)
    });
    
    if (response.status === 401) {
      // Token is invalid - trigger logout and redirect to login
      console.error('Invalid or expired authentication token');
      // You'll need to access logout from AuthContext
      localStorage.removeItem('auth');
      window.location.href = '/signin';
      throw new Error('Your session has expired. Please sign in again.');
    }
    
    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage;
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error || 'Failed to save profile';
      } catch (e) {
        errorMessage = `Failed to save profile: ${response.status} ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }
    
    return response.json();
  } catch (error) {
    console.error('Profile save error:', error);
    throw error;
  }
};

export const getUserProfile = async (token) => {
  const url = `${API_URL}/api/profile`;
  const headers = {
    'Authorization': `Bearer ${token}`
  };
  
  logRequest('GET', url, headers);
  
  if (!token) {
    console.error('No token provided to getUserProfile');
    throw new Error('Authentication token is missing');
  }
  
  const response = await fetch(url, {
    headers
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to get profile');
  }
  
  return response.json();
};

export const getRecommendations = async (token) => {
  const url = `${API_URL}/api/recommendations`;
  const headers = {
    'Authorization': `Bearer ${token}`
  };
  
  logRequest('GET', url, headers);
  
  if (!token) {
    console.error('No token provided to getRecommendations');
    throw new Error('Authentication token is missing');
  }
  
  const response = await fetch(url, {
    headers
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to get recommendations');
  }
  
  return response.json();
};

export const submitFeedback = async (token, feedback) => {
  const url = `${API_URL}/api/feedback`;
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
  const body = JSON.stringify({ text: feedback });
  
  logRequest('POST', url, headers, body);
  
  if (!token) {
    console.error('No token provided to submitFeedback');
    throw new Error('Authentication token is missing');
  }
  
  const response = await fetch(url, {
    method: 'POST',
    headers,
    body
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to submit feedback');
  }
  
  return response.json();
};

export const getCourseDetails = async (token, courseId) => {
  const url = `${API_URL}/api/courses/${courseId}`;
  const headers = {
    'Authorization': `Bearer ${token}`
  };
  
  logRequest('GET', url, headers);
  
  if (!token) {
    console.error('No token provided to getCourseDetails');
    throw new Error('Authentication token is missing');
  }
  
  const response = await fetch(url, {
    headers
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to get course details');
  }
  
  return response.json();
};