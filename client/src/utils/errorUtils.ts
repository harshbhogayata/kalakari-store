/**
 * Error handling utilities
 */

import { ApiError } from '../types/api';

/**
 * Type guard to check if error is an API error
 */
export const isApiError = (error: unknown): error is ApiError => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as ApiError).message === 'string'
  );
};

/**
 * Type guard to check if error has axios response structure
 */
export const isAxiosError = (error: unknown): error is {
  response?: {
    data?: {
      message?: string;
      error?: string;
    };
    status?: number;
  };
  message?: string;
} => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'response' in error
  );
};

/**
 * Extract error message from various error types
 */
export const getErrorMessage = (error: unknown, fallback = 'An error occurred'): string => {
  if (typeof error === 'string') {
    return error;
  }

  if (isApiError(error)) {
    return error.message;
  }

  if (isAxiosError(error)) {
    return error.response?.data?.message || 
           error.response?.data?.error || 
           error.message || 
           fallback;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
};

/**
 * Extract HTTP status code from error
 */
export const getErrorStatus = (error: unknown): number | undefined => {
  if (isAxiosError(error)) {
    return error.response?.status;
  }
  return undefined;
};

/**
 * Check if error is a network error
 */
export const isNetworkError = (error: unknown): boolean => {
  if (isAxiosError(error)) {
    return !error.response;
  }
  return false;
};

/**
 * Check if error is a validation error
 */
export const isValidationError = (error: unknown): boolean => {
  const status = getErrorStatus(error);
  return status === 400 || status === 422;
};

/**
 * Check if error is an authentication error
 */
export const isAuthError = (error: unknown): boolean => {
  const status = getErrorStatus(error);
  return status === 401 || status === 403;
};

/**
 * Check if error is a server error
 */
export const isServerError = (error: unknown): boolean => {
  const status = getErrorStatus(error);
  return status !== undefined && status >= 500;
};
