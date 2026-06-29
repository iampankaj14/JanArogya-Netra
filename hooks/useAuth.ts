import { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { authRepository } from '../services/repositories/authRepository';
import { UserRole } from '@/constants/roles';

export function useAuth() {
  const { user, isAuthenticated, setUser, clearSession } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, password: string, role: UserRole) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authRepository.login(email, password, role);
      setUser(response.user);
      return response.user;
    } catch (e: any) {
      setError(e.message || 'AUTH/INVALID_CREDENTIALS');
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authRepository.logout();
      clearSession();
    } catch (e: any) {
      setError(e.message || 'DB/MUTATION_FAILED');
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    isAuthenticated,
    loading,
    error,
    login,
    logout,
  };
}
