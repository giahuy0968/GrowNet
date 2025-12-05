// API Configuration
const isDev = import.meta.env.DEV;
const DEFAULT_API_URL = isDev ? 'http://localhost:4000/api' : 'http://202.92.6.223:4000/api';
const DEFAULT_SOCKET_URL = isDev ? 'http://localhost:4000' : 'http://202.92.6.223:4000';

export const API_URL = import.meta.env.VITE_API_URL || DEFAULT_API_URL;
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || DEFAULT_SOCKET_URL;

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
