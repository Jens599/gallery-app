/**
 * Centralized URL configuration for the application
 */

// API Base URLs
export const API_BASE_URL = "/api";

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
  ADD_URL: (id: string) => `${API_BASE_URL}/images/addURL/${id}`,
  UPDATE_URL: `${API_BASE_URL}/images/`,
  BY_ID: (id: string) => `${API_BASE_URL}/images/${id}`,
} as const;

// Background removal service configuration
export const EXTERNAL_SERVICES = {
  get BG_REMOVAL(): string {
    if (process.env.NEXT_PUBLIC_BG_REMOVAL_URL) {
      return process.env.NEXT_PUBLIC_BG_REMOVAL_URL;
    }
    return "http://localhost:5000/predict";
  }
} as const;

// Debug Endpoints
export const DEBUG_URLS = {
  MONGODB_STATUS: `${API_BASE_URL}/mongodb-status`,
} as const;
