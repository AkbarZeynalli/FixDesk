import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, AuthResponse } from '../types';
import api from '../api/axios';
import { initialUsers } from '../api/mockData';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  hasRole: (allowedRoles: (UserRole | number | string)[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Role name string-to-enum mapping fallback
const RoleStringToEnum: Record<string, number> = {
  Admin: UserRole.Admin,
  BranchManager: UserRole.BranchManager,
  BranchEmployee: UserRole.BranchEmployee,
  ITSpecialist: UserRole.ITSpecialist,
  FieldEngineer: UserRole.FieldEngineer,
  InventoryManager: UserRole.InventoryManager,
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Restore session on mount
    const savedToken = localStorage.getItem('fixdesk_token');
    const savedUser = localStorage.getItem('fixdesk_user');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Failed to parse saved user:', e);
        localStorage.removeItem('fixdesk_token');
        localStorage.removeItem('fixdesk_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      setIsLoading(true);
      // Try real backend first
      const response = await api.post<AuthResponse>('/api/Auth/login', { email, password });
      
      if (response.data.isSuccess && response.data.data) {
        const { token: jwtToken, user: userData } = response.data.data;
        setToken(jwtToken);
        setUser(userData);
        localStorage.setItem('fixdesk_token', jwtToken);
        localStorage.setItem('fixdesk_user', JSON.stringify(userData));
        return { success: true };
      } else {
        return { success: false, message: response.data.message || 'Giriş uğursuz oldu' };
      }
    } catch (err: any) {
      console.warn('Backend login request error or offline, testing local credentials:', err);
      
      // Fallback check against initial mock users for smooth local demo/offline operation
      const foundUser = initialUsers.find(
        (u) => u.email.toLowerCase() === email.toLowerCase()
      );
      if (foundUser && (password === 'Admin123!' || password.length >= 4)) {
        const mockToken = 'mock_jwt_token_' + Date.now();
        setToken(mockToken);
        setUser(foundUser);
        localStorage.setItem('fixdesk_token', mockToken);
        localStorage.setItem('fixdesk_user', JSON.stringify(foundUser));
        return { success: true };
      }

      const errorMessage = err.response?.data?.message || err.message || 'Serverə qoşulmaq mümkün olmadı';
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('fixdesk_token');
    localStorage.removeItem('fixdesk_user');
  };

  const hasRole = (allowedRoles: (UserRole | number | string)[]): boolean => {
    if (!user || user.role === undefined || user.role === null) return false;

    // Convert current user role to numeric Enum
    let currentRoleNum: number;
    if (typeof user.role === 'number') {
      currentRoleNum = user.role;
    } else if (typeof user.role === 'string' && !isNaN(Number(user.role))) {
      currentRoleNum = Number(user.role);
    } else if (typeof user.role === 'string' && RoleStringToEnum[user.role]) {
      currentRoleNum = RoleStringToEnum[user.role];
    } else {
      currentRoleNum = Number(user.role);
    }

    return allowedRoles.some((r) => {
      if (typeof r === 'number') return r === currentRoleNum;
      if (typeof r === 'string' && !isNaN(Number(r))) return Number(r) === currentRoleNum;
      if (typeof r === 'string' && RoleStringToEnum[r]) return RoleStringToEnum[r] === currentRoleNum;
      return false;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        logout,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
