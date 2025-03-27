import { useContext } from 'react';
import { AuthContext } from '@/contexts/AuthContext';

// This is a compatibility hook that provides the same interface
// as the original useAuth hook but uses the AuthContext
export const useAuth = () => {
  const auth = useContext(AuthContext);
  
  if (!auth) {
    console.error('Auth context is missing - check that you are inside an AuthProvider');
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  // Debug - log context values
  console.log('useAuth hook - context values:', {
    hasUser: !!auth.user,
    userName: auth.user?.name,
    userRole: auth.user?.role,
    isLoading: auth.loading
  });
  
  // Map the AuthContext properties to the expected interface
  return {
    user: auth.user,
    isAuthenticated: !!auth.user,
    isLoading: auth.loading,
    login: auth.login,
    logout: auth.logout,
    register: auth.register,
    error: auth.error,
    updateUser: auth.updateUser
  };
};

export default useAuth; 