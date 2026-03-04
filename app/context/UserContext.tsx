'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi, setTokens, clearTokens, getAccessToken, getRefreshToken } from '../api/authApi';
import type { User } from '../api/authApi';

interface UserContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInstructor: boolean;
  login: (accessToken: string, refreshToken: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;
  const isInstructor = user?.instructorStatus === 'APPROVED';

  // Login: store tokens, fetch user profile
  const login = useCallback(async (accessToken: string, refreshToken: string) => {
    setTokens(accessToken, refreshToken);
    try {
      const me = await authApi.getMe(accessToken);
      setUser(me);
      localStorage.setItem('user', JSON.stringify(me));
    } catch (err: any) {
      clearTokens();
      setUser(null);
      throw new Error(err.message || 'Failed to fetch user profile');
    }
  }, []);

  // Logout: clear everything
  const logout = useCallback(() => {
    clearTokens();
    setUser(null);
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  }, []);

  // Refresh user profile from API (e.g. after email verification)
  const refreshUser = useCallback(async () => {
    const accessToken = getAccessToken();
    if (!accessToken) return;
    try {
      const me = await authApi.getMe(accessToken);
      setUser(me);
      localStorage.setItem('user', JSON.stringify(me));
    } catch {
      // silently ignore
    }
  }, []);

  // On mount: restore session from stored tokens
  useEffect(() => {
    const restoreSession = async () => {
      const accessToken = getAccessToken();
      const refreshToken = getRefreshToken();

      if (!accessToken || !refreshToken) {
        setIsLoading(false);
        return;
      }

      try {
        // Try fetching user with existing access token
        const me = await authApi.getMe(accessToken);
        setUser(me);
        localStorage.setItem('user', JSON.stringify(me));
      } catch {
        // Access token expired, try refreshing
        try {
          const refreshed = await authApi.refresh({ refreshToken });
          setTokens(refreshed.accessToken, refreshed.refreshToken);
          const me = await authApi.getMe(refreshed.accessToken);
          setUser(me);
          localStorage.setItem('user', JSON.stringify(me));
        } catch {
          // Refresh also failed, clear everything
          clearTokens();
          setUser(null);
        }
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  return (
    <UserContext.Provider value={{ user, isAuthenticated, isLoading, isInstructor, login, logout, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}