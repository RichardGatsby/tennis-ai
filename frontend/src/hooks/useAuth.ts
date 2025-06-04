import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api';
import type { AuthState, LoginRequest, RegisterRequest, Player } from '@/types';

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // Load user data on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (token) {
          apiClient.setToken(token);
          const user = await apiClient.getCurrentPlayer();
          setState({
            user,
            token,
            isLoading: false,
            isAuthenticated: true,
          });
        } else {
          setState(prev => ({
            ...prev,
            isLoading: false,
          }));
        }
      } catch (error) {
        console.error('Failed to load user:', error);
        apiClient.clearToken();
        setState({
          user: null,
          token: null,
          isLoading: false,
          isAuthenticated: false,
        });
      }
    };

    loadUser();
  }, []);

  const login = useCallback(async (credentials: LoginRequest) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      const authResponse = await apiClient.login(credentials);
      apiClient.setToken(authResponse.access_token);
      
      const user = await apiClient.getCurrentPlayer();
      
      setState({
        user,
        token: authResponse.access_token,
        isLoading: false,
        isAuthenticated: true,
      });

      return { success: true };
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        isAuthenticated: false,
      }));
      
      return {
        success: false,
        error: error.response?.data?.detail || 'Login failed',
      };
    }
  }, []);

  const register = useCallback(async (userData: RegisterRequest) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      const user = await apiClient.register(userData);
      
      // Auto-login after registration
      const loginResult = await login({
        email: userData.email,
        password: userData.password,
      });

      return loginResult;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
      }));
      
      return {
        success: false,
        error: error.response?.data?.detail || 'Registration failed',
      };
    }
  }, [login]);

  const logout = useCallback(() => {
    apiClient.clearToken();
    setState({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,
    });
  }, []);

  const updateUser = useCallback(async (userData: Partial<Player>) => {
    try {
      const updatedUser = await apiClient.updateCurrentPlayer(userData);
      setState(prev => ({
        ...prev,
        user: updatedUser,
      }));
      return { success: true, user: updatedUser };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Update failed',
      };
    }
  }, []);

  return {
    ...state,
    login,
    register,
    logout,
    updateUser,
  };
} 