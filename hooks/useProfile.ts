import { useAuth } from './useAuth';

export function useProfile() {
  const { user, logout, loading, error } = useAuth();

  return {
    user,
    logout,
    loading,
    error,
  };
}
export default useProfile;
