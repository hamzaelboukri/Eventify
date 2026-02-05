"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, UserRole, LoginCredentials, RegisterData } from "@/types";
import { authApi } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  isAdmin: () => boolean;
  isParticipant: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for fallback when API is not available
const MOCK_USERS: Record<string, { user: User; password: string }> = {
  "admin@eventify.com": {
    user: {
      id: "1",
      name: "Admin User",
      email: "admin@eventify.com",
      role: UserRole.ADMIN,
      createdAt: "2026-01-01",
      updatedAt: "2026-01-01",
    },
    password: "admin123",
  },
  "user@eventify.com": {
    user: {
      id: "2",
      name: "John Doe",
      email: "user@eventify.com",
      role: UserRole.PARTICIPANT,
      createdAt: "2026-01-15",
      updatedAt: "2026-01-15",
    },
    password: "user123",
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const initAuth = async () => {
      const storedUser = localStorage.getItem("user");

      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch {
          localStorage.removeItem("user");
          localStorage.removeItem("token");
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    setIsLoading(true);
    try {
      // Try API first
      const response = await authApi.login({
        email: credentials.email,
        password: credentials.password,
      });

      if (response.data) {
        const userData: User = {
          id: response.data.user.id,
          name: response.data.user.name,
          email: response.data.user.email,
          role: response.data.user.role as UserRole,
          createdAt: response.data.user.createdAt || new Date().toISOString(),
          updatedAt: response.data.user.updatedAt || new Date().toISOString(),
        };

        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("token", response.data.access_token);
        return;
      }

      // Fallback to mock users if API fails
      const mockUser = MOCK_USERS[credentials.email];
      if (mockUser && mockUser.password === credentials.password) {
        setUser(mockUser.user);
        localStorage.setItem("user", JSON.stringify(mockUser.user));
        localStorage.setItem("token", "mock-jwt-token-" + mockUser.user.id);
        return;
      }

      throw new Error(response.error || "Email ou mot de passe incorrect");
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData): Promise<void> => {
    setIsLoading(true);
    try {
      // Try API first
      const response = await authApi.register({
        name: data.name,
        email: data.email,
        password: data.password,
      });

      if (response.data) {
        const userData: User = {
          id: response.data.user.id,
          name: response.data.user.name,
          email: response.data.user.email,
          role: response.data.user.role as UserRole,
          createdAt: response.data.user.createdAt || new Date().toISOString(),
          updatedAt: response.data.user.updatedAt || new Date().toISOString(),
        };

        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("token", response.data.access_token);
        return;
      }

      // Fallback: create mock user if API fails
      if (MOCK_USERS[data.email]) {
        throw new Error("Cet email est déjà utilisé");
      }

      const newUser: User = {
        id: Date.now().toString(),
        name: data.name,
        email: data.email,
        role: data.role || UserRole.PARTICIPANT,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setUser(newUser);
      localStorage.setItem("user", JSON.stringify(newUser));
      localStorage.setItem("token", "mock-jwt-token-" + newUser.id);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  const isAdmin = () => user?.role === UserRole.ADMIN;
  const isParticipant = () => user?.role === UserRole.PARTICIPANT;

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        isAdmin,
        isParticipant,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export default AuthContext;
