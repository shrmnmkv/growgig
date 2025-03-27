import React, { createContext, useState, useEffect } from 'react';
import { api } from '@/services/api';
import { useToast } from '@/components/ui/use-toast';

interface User {
  _id: string;
  email: string;
  role: 'employer' | 'freelancer';
  name: string;
  freelancerId?: string;
  companyName?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => Promise<void>;
  register: (userData: { email: string; password: string; name: string; role: 'employer' | 'freelancer' }) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (token) {
      // Set token in API service
      api.setAuthToken(token);
      
      // Fetch user profile
      api.auth.getProfile()
        .then(data => {
          console.log('User profile loaded:', data);
          setUser(data.user);
        })
        .catch((err) => {
          console.error('Error loading profile:', err);
          sessionStorage.removeItem('token');
          api.setAuthToken(null);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log('AuthContext: Starting login process');
      setError(null);
      const data = await api.auth.login(email, password);
      console.log('AuthContext: Login successful, setting user and token');
      
      // Set token using the API service (which handles sessionStorage)
      api.setAuthToken(data.token);
      
      setUser(data.user);
      toast({
        title: 'Login successful',
        description: `Welcome back, ${data.user.name}!`,
      });
    } catch (err) {
      console.error('AuthContext: Login error:', err);
      setError('Invalid email or password');
      throw err;
    }
  };

  const logout = () => {
    // Clear token using API service
    api.setAuthToken(null);
    setUser(null);
    toast({
      title: 'Logged out successfully',
      description: 'You have been logged out of your account.',
    });
  };

  const updateUser = async (userData: Partial<User>) => {
    try {
      setError(null);
      const data = await api.auth.updateProfile(userData);
      setUser(data.user);
    } catch (err) {
      setError('Failed to update profile');
      throw err;
    }
  };

  const register = async (userData: { email: string; password: string; name: string; role: 'employer' | 'freelancer' }) => {
    try {
      setError(null);
      const data = await api.auth.register(userData);
      
      // Set token using the API service
      api.setAuthToken(data.token);
      
      setUser(data.user);
      toast({
        title: 'Registration successful',
        description: `Welcome, ${data.user.name}!`,
      });
    } catch (err) {
      setError('Failed to register');
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout, updateUser, register }}>
      {children}
    </AuthContext.Provider>
  );
}
