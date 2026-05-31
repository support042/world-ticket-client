import axios from 'axios';

// Create a configured Axios instance
// When your real backend is ready, you will supply its URL in a .env file:
// e.g., VITE_API_BASE_URL=https://api.yourbackend.com/api
// For now, it defaults to a dummy endpoint for our shadow migration.
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://api.mockbackend.local',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Automatically attach the Auth Token to all requests
apiClient.interceptors.request.use(
  (config) => {
    // Retrieve tokens from Zustand's persisted storage in localStorage
    let token = null;

    try {
      const authData = JSON.parse(localStorage.getItem('auth-storage') || '{"state":{}}');
      const adminData = JSON.parse(localStorage.getItem('admin-storage') || '{"state":{}}');
      
      // Use admin token if available, otherwise user token
      token = adminData.state?.token || authData.state?.token;
    } catch (e) {
      console.error("Failed to parse auth tokens", e);
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle global API errors (e.g., 401 Unauthorized logouts)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginRequest = error.config?.url?.includes('/login');
    
    // Intercept 401 Unauthorized responses
    if (error.response?.status === 401 && !isLoginRequest) {
      console.warn("Unauthorized access - session expired.");
      // Optional: window.location.href = '/admin/login';
    }

    // Extract the server's custom error message and data
    const serverData = error.response?.data;
    const serverMessage = serverData?.message || error.message;
    
    console.error("API Error Response:", {
      status: error.response?.status,
      data: serverData,
      message: serverMessage,
      url: error.config?.url
    });
    
    // We reject with a customized error object that includes the server message
    return Promise.reject(new Error(serverMessage));
  }
);

export default apiClient;
