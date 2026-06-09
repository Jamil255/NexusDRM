import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../api/client';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  organizationId: string;
  isActive: boolean;
  avatarUrl?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updatedData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchProfile = async () => {
    try {
      const response = await apiClient.get('/users/me');
      let profile = response.data?.data || response.data;
      
      // Resolve potential double-wrapping from NestJS ResponseTransformInterceptor
      if (profile && typeof profile === 'object' && 'success' in profile && 'data' in profile) {
        profile = profile.data;
      }

      if (profile && (profile.id || profile.email)) {
        setUser(profile);
      } else {
        logoutState();
      }
    } catch (err: any) {
      console.error('Failed to fetch user profile:', err);
      
      const errCode = err.response?.data?.error?.code;
      const isAuthError = (err.response && (err.response.status === 401 || err.response.status === 403)) ||
                          errCode === 'AUTH_TOKEN_INVALID' ||
                          errCode === 'AUTH_TOKEN_EXPIRED' ||
                          errCode === 'AUTH_NO_TOKEN';

      // Only clear session if there's a clear authentication failure
      if (isAuthError) {
        logoutState();
      } else {
        // Stop loading spinner but retain the access token so the user is not logged out permanently
        setIsLoading(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logoutState = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
    setToken(null);
    setIsLoading(false);
  };

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      setToken(accessToken);
      fetchProfile();
    } else {
      setIsLoading(false);
    }

    // Set up a listener for session expired events from the axios client
    const handleSessionExpired = () => {
      logoutState();
    };

    window.addEventListener('auth_session_expired', handleSessionExpired);
    return () => {
      window.removeEventListener('auth_session_expired', handleSessionExpired);
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      // The backend structure might wrap it inside data: { data: { accessToken, ... } } or similar. Let's look at standard responses.
      const resData = response.data?.data || response.data;
      const { accessToken, refreshToken, user: loggedUser } = resData;

      if (accessToken) {
        localStorage.setItem('accessToken', accessToken);
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken);
        }
        setToken(accessToken);
        setUser(loggedUser || null);
        
        // Fetch fresh profile details if user payload not complete
        if (!loggedUser) {
          await fetchProfile();
        } else {
          setIsLoading(false);
        }
      } else {
        throw new Error('Authentication failed');
      }
    } catch (error: any) {
      logoutState();
      throw error;
    }
  };

  const logout = async () => {
    setIsLoading(true);
    const refreshToken = localStorage.getItem('refreshToken');
    try {
      if (refreshToken) {
        await apiClient.post('/auth/logout', { refreshToken });
      }
    } catch (err) {
      console.error('Failed to notify backend logout:', err);
    } finally {
      logoutState();
    }
  };

  const updateProfile = (updatedData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updatedData });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
