
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '@/types';

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user data for demonstration purposes
const MOCK_USERS: User[] = [
  {
    id: '1',
    email: 'admin@defensoria.gob',
    name: 'Administrador',
    role: 'administrador',
    active: true,
  },
  {
    id: '2',
    email: 'defensor@defensoria.gob',
    name: 'Defensor Principal',
    role: 'defensor',
    defensoria: 'def-1',
    active: true,
  },
  {
    id: '3',
    email: 'mostrador@defensoria.gob',
    name: 'Mostrador Central',
    role: 'mostrador',
    defensoria: 'def-1',
    active: true,
  },
  {
    id: '4',
    email: 'abogado@defensoria.gob',
    name: 'Abogado Pérez',
    role: 'abogado',
    defensoria: 'def-1',
    groups: ['group-1'],
    active: true,
  },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in from local storage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      // In a real app, this would be an API call
      const user = MOCK_USERS.find(u => u.email === email);
      
      if (!user) {
        throw new Error('Usuario no encontrado');
      }
      
      // In a real app, we would validate the password here
      
      setCurrentUser(user);
      localStorage.setItem('user', JSON.stringify(user));
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, loading }}>
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
