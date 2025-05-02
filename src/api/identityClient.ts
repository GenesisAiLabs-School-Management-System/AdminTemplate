import axios, { AxiosError, AxiosResponse } from 'axios';

const IDENTITY_API_URL = import.meta.env.VITE_IDENTITY_API_URL || 'https://localhost:7226';

const identityApiClient = axios.create({
  baseURL: IDENTITY_API_URL,
  headers: {

    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds
});



identityApiClient.interceptors.request.use(
  (config) => {
   
    console.log(`[Identity API Request] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error: AxiosError) => {
    console.error('[Identity API Request Error]', error);
    return Promise.reject(error);
  }
);

// Response Interceptor (Focus on logging or specific Identity errors)
identityApiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Just pass through successful responses
    console.log(`[Identity API Response] ${response.status} ${response.config.url}`);
    return response;
  },
  (error: AxiosError) => {
    // Handle Identity API specific errors if necessary
    console.error(
      `[Identity API Response Error] ${error.response?.status} ${error.config?.url}`,
      error.response?.data || error.message
    );
    return Promise.reject(error);
  }
);

export default identityApiClient;