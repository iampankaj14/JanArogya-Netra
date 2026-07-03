import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import * as SecureStore from 'expo-secure-store';
import { auth, db, isFirebaseConfigured } from '../services/firebase/firebaseConfig';
import { authRepository } from '../services/repositories/authRepository';

export type LoginRole = 'DHO' | 'BMO' | 'PHC';

interface AuthState {
  role: LoginRole | null;
  email: string | null;
  uid: string | null;
}

interface AuthContextType {
  authState: AuthState;
  login: (email: string, password: string, role: LoginRole, rememberMe?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SECURE_STORE_KEY = 'janarogya_netra_user_session';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({ role: null, email: null, uid: null });
  const [loading, setLoading] = useState(true);

  // Auto-restore session on startup
  useEffect(() => {
    let unsubscribe: () => void = () => {};

    const checkSession = async () => {
      try {
        if (isFirebaseConfigured) {
          // Firebase auto-login via auth state listener
          unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
              const userDoc = await getDoc(doc(db, 'users', user.uid));
              if (userDoc.exists()) {
                const userData = userDoc.data();
                setAuthState({
                  uid: user.uid,
                  email: user.email,
                  role: userData.role as LoginRole,
                });
              }
            } else {
              setAuthState({ role: null, email: null, uid: null });
            }
            setLoading(false);
          });
        } else {
          // Offline auto-login via SecureStore
          const savedSession = await SecureStore.getItemAsync(SECURE_STORE_KEY);
          if (savedSession) {
            const session = JSON.parse(savedSession);
            setAuthState({
              uid: session.uid,
              email: session.email,
              role: session.role as LoginRole,
            });
          }
          setLoading(false);
        }
      } catch (error) {
        console.error('Session restoration failed:', error);
        setLoading(false);
      }
    };

    checkSession();
    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string, role: LoginRole, rememberMe = true) => {
    setLoading(true);
    try {
      const response = await authRepository.login(email, password, role as any);
      
      const session = {
        uid: response.user.id,
        email: response.user.email,
        role: response.user.role as LoginRole,
      };

      setAuthState(session);

      if (rememberMe) {
        await SecureStore.setItemAsync(SECURE_STORE_KEY, JSON.stringify(session));
      } else {
        await SecureStore.deleteItemAsync(SECURE_STORE_KEY);
      }
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authRepository.logout();
      setAuthState({ role: null, email: null, uid: null });
      await SecureStore.deleteItemAsync(SECURE_STORE_KEY);
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ authState, login, logout, loading }}>
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
