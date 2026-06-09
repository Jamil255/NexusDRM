import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh on 401
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => {
    // Globally resolve double-wrapping from NestJS ResponseTransformInterceptor
    const body = response.data;
    if (body && typeof body === 'object' && body.success === true && body.data !== undefined) {
      const inner = body.data;
      if (inner && typeof inner === 'object' && inner.success === true && inner.data !== undefined) {
        response.data = inner;
      }
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Skip refresh logic for login/refresh endpoints
    if (
      originalRequest.url?.includes('/auth/login') ||
      originalRequest.url?.includes('/auth/refresh')
    ) {
      return Promise.reject(error);
    }

    const errCode = error.response?.data?.error?.code;
    const isUnauthorized = error.response?.status === 401 ||
                           errCode === 'AUTH_TOKEN_INVALID' ||
                           errCode === 'AUTH_TOKEN_EXPIRED' ||
                           errCode === 'AUTH_NO_TOKEN';

    if (isUnauthorized && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        isRefreshing = false;
        // Redirect to login or clear auth state
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.dispatchEvent(new Event('auth_session_expired'));
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(`${baseURL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data.data || response.data || {};
        
        if (accessToken) {
          localStorage.setItem('accessToken', accessToken);
          if (newRefreshToken) {
            localStorage.setItem('refreshToken', newRefreshToken);
          }
          
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
          originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
          
          processQueue(null, accessToken);
          isRefreshing = false;
          
          return apiClient(originalRequest);
        } else {
          throw new Error('Refresh token did not return access token');
        }
      } catch (refreshError: any) {
        processQueue(refreshError, null);
        isRefreshing = false;
        
        // Only clear tokens if the refresh token request was explicitly rejected by the server (e.g., 400, 401, 403)
        // If the error is a network error or server crash, keep the tokens so the user is not forced to log in again.
        const refreshErrCode = refreshError.response?.data?.error?.code;
        const isAuthError = (refreshError.response && (
          refreshError.response.status === 400 ||
          refreshError.response.status === 401 ||
          refreshError.response.status === 403
        )) ||
        refreshErrCode === 'AUTH_TOKEN_INVALID' ||
        refreshErrCode === 'AUTH_TOKEN_EXPIRED' ||
        refreshErrCode === 'AUTH_REFRESH_TOKEN_EXPIRED';

        if (isAuthError) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.dispatchEvent(new Event('auth_session_expired'));
        }
        
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
