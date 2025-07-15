import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { apiRequest } from '@/lib/queryClient';

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  usageCount?: number;
  usageLimit?: number;
  stripeSubscriptionId?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, firstName?: string, lastName?: string) => Promise<void>;
  logout: () => Promise<void>;
  loginWithProvider: (provider: 'google') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await apiRequest('GET', '/api/auth/user');
      if (response.ok) {
        const userData = await response.json();
        if (userData?.id) setUser(userData);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await apiRequest('POST', '/api/auth/login', { email, password });
    if (response.ok) {
      const userData = await response.json();
      if (userData?.id) setUser(userData);
    } else {
      throw new Error('Login failed');
    }
  };

  const register = async (email: string, password: string, firstName?: string, lastName?: string) => {
    const response = await apiRequest('POST', '/api/auth/register', { 
      email, 
      password, 
      firstName, 
      lastName 
    });
    if (response.ok) {
      const userData = await response.json();
      setUser(userData);
    } else {
      throw new Error('Registration failed');
    }
  };

  const logout = async () => {
    await apiRequest('POST', '/api/auth/logout');
    setUser(null);
  };

  const loginWithProvider = (provider: 'google') => {
    window.location.href = `/api/auth/${provider}`;
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      loginWithProvider,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}