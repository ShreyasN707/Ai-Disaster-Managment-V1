import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  _id: string;
  email: string;
  role: 'ADMIN' | 'OPERATOR';
  name: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string, role: 'admin' | 'operator') => Promise<boolean>;
  signup: (email: string, password: string, name: string, role: 'admin' | 'operator', adminCode?: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored auth on app start
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string, role: 'admin' | 'operator'): Promise<boolean> => {
    setLoading(true);
    
    try {
      console.log('🔐 Attempting login with:', { email, role });
      
      const response = await fetch('http://localhost:4000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      console.log('📥 Login response status:', response.status);
      
      if (response.status === 401) {
        const errorData = await response.json().catch(() => ({}));
        console.error('🔴 Login failed - Unauthorized:', errorData);
        setLoading(false);
        return false;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('🔴 Login failed with status:', response.status, errorData);
        setLoading(false);
        return false;
      }

      const data = await response.json();
      console.log('✅ Login successful, user data:', data);
      
      const user: User = {
        _id: data.user._id,
        email: data.user.email,
        role: data.user.role,
        name: data.user.name
      };
      
      setUser(user);
      setToken(data.token);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(user));
      setLoading(false);
      return true;
      
    } catch (error) {
      console.error('🔴 Login error:', error);
      setLoading(false);
      return false;
    }
  };

  const signup = async (email: string, password: string, name: string, role: 'admin' | 'operator', adminCode?: string): Promise<boolean> => {
    setLoading(true);
    
    try {
      // For admin signup, require admin code
      if (role === 'admin' && adminCode !== 'ADMIN2024') {
        setLoading(false);
        return false;
      }

      const response = await fetch('http://localhost:4000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email, 
          password, 
          name, 
          role: role.toUpperCase() 
        })
      });

      if (!response.ok) {
        setLoading(false);
        return false;
      }

      const data = await response.json();
      
      const user: User = {
        _id: data.user._id,
        email: data.user.email,
        role: data.user.role,
        name: data.user.name
      };
      
      setUser(user);
      setToken(data.token);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(user));
      setLoading(false);
      return true;
    } catch (error) {
      console.error('Signup error:', error);
      setLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, signup, logout, loading }}>
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