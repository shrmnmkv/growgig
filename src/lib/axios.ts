import axios from 'axios';

// Create a custom axios instance with base URL and default headers
export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true // Enable sending cookies with requests
});

// Add request interceptor to include auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    if (token) {
      // Make sure we don't duplicate the Bearer prefix
      const tokenValue = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      config.headers.Authorization = tokenValue;
    }

    // Log the request for debugging
    console.log('Request:', {
      url: config.url,
      method: config.method,
      headers: config.headers,
      data: config.data
    });

    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for global error handling
axiosInstance.interceptors.response.use(
  (response) => {
    // Log the response for debugging
    console.log('Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    // Log the error for debugging
    console.error('Response error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });

    // Handle 401 unauthorized errors (token expired)
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // Optionally redirect to login page
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
); 