// API Configuration
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000';

// Helper function to get auth token
export const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

// Helper function to set auth token
export const setAuthToken = (token: string): void => {
  localStorage.setItem('token', token);
};

// Helper function to remove auth token
export const removeAuthToken = (): void => {
  localStorage.removeItem('token');
};

// Helper function to get auth headers
export const getAuthHeaders = (): HeadersInit => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};
