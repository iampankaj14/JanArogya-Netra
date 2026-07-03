import React, { createContext, useContext, useState, ReactNode } from 'react';

export type LoginRole = 'DHO' | 'BMO' | 'PHC';

interface AuthState {
  role: LoginRole | null;
  email: string | null;
}

interface AuthContextType {
  authState: AuthState;
  login: (role: LoginRole, email: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({ role: null, email: null });

  const login = (role: LoginRole, email: string) => {
    setAuthState({ role, email });
  };

  const logout = () => {
    setAuthState({ role: null, email: null });
  };

  return (
    <AuthContext.Provider value={{ authState, login, logout }}>
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
