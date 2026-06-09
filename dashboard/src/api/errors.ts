/**
 * Global API error parser.
 *
 * Backend error shape:
 * {
 *   success: false,
 *   error: { code: string, message: string },
 *   timestamp: string,
 *   requestId: string
 * }
 */

export interface ApiError {
  code: string;
  message: string;
}

/**
 * Extract a structured { code, message } from any Axios error.
 * Works with the NestJS error envelope used by this project.
 */
export function parseApiError(err: any): ApiError {
  // Network / no response
  if (!err.response) {
    if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
      return { code: 'NETWORK_ERROR', message: 'Unable to reach the server. Check your connection.' };
    }
    return { code: 'UNKNOWN', message: err.message || 'An unexpected error occurred.' };
  }

  const data = err.response?.data;

  // Primary path: { error: { code, message } }
  if (data?.error?.message) {
    return {
      code: data.error.code || `HTTP_${err.response.status}`,
      message: data.error.message,
    };
  }

  // Fallback: { message } at root (some older NestJS responses)
  if (data?.message) {
    const msg = Array.isArray(data.message) ? data.message.join(', ') : data.message;
    return {
      code: data.statusCode ? `HTTP_${data.statusCode}` : `HTTP_${err.response.status}`,
      message: msg,
    };
  }

  // Last resort
  return {
    code: `HTTP_${err.response.status}`,
    message: err.message || 'An unexpected error occurred.',
  };
}
