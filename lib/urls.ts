/**
 * Centralized URL configuration for the application
 */

// API Base URLs
export const API_BASE_URL = "http://localhost:3001/api";

// Auth Endpoints
export const AUTH_URLS = {
  LOGIN: `${API_BASE_URL}/auth/login`,
  SIGNUP: `${API_BASE_URL}/auth/signup`,
  DELETE_USER: `${API_BASE_URL}/auth/delete`,
} as const;

// Image Endpoints
export const IMAGE_URLS = {
  BASE: `${API_BASE_URL}/images`,
  ME: `${API_BASE_URL}/images/me`,
  BY_ID: (id: string) => `${API_BASE_URL}/images/${id}`,
} as const;

// Debug Endpoints
export const DEBUG_URLS = {
  MONGODB_STATUS: `${API_BASE_URL}/mongodb-status`,
} as const;
