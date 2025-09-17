import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  role: 'admin' | 'operator';
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: 'admin' | 'operator') => Promise<boolean>;
  signup: (email: string, password: string, name: string, role: 'admin' | 'operator', adminCode?: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored auth on app start
    const storedUser = localStorage.getItem('disasterwatch_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string, role: 'admin' | 'operator'): Promise<boolean> => {
    setLoading(true);
    
    // Mock authentication - replace with actual API call
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
      
      // Mock user data
      const mockUser: User = {
        id: `${role}_${Date.now()}`,
        email,
        role,
        name: email.split('@')[0]
      };
      
      setUser(mockUser);
      localStorage.setItem('disasterwatch_user', JSON.stringify(mockUser));
      setLoading(false);
      return true;
    } catch (error) {
      setLoading(false);
      return false;
    }
  };

  const signup = async (email: string, password: string, name: string, role: 'admin' | 'operator', adminCode?: string): Promise<boolean> => {
    setLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
      
      // For admin signup, require admin code
      if (role === 'admin' && adminCode !== 'ADMIN2024') {
        setLoading(false);
        return false;
      }
      
      const mockUser: User = {
        id: `${role}_${Date.now()}`,
        email,
        role,
        name
      };
      
      setUser(mockUser);
      localStorage.setItem('disasterwatch_user', JSON.stringify(mockUser));
      setLoading(false);
      return true;
    } catch (error) {
      setLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('disasterwatch_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
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