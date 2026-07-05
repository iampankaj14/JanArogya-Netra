import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Platform } from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import * as SecureStore from 'expo-secure-store';
import { auth, db, isFirebaseConfigured } from '../services/firebase/firebaseConfig';
import { authRepository } from '../services/repositories/authRepository';
import { clearLocalDb } from '../services/repositories/localDb';

export type LoginRole = 'DHO' | 'BMO' | 'PHC';

interface AuthState {
  role: LoginRole | null;
  email: string | null;
  uid: string | null;
  facilityId?: string;
  name?: string;
  avatarUrl?: string;
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
                const mappedRole = userData.role === 'PHC_MO' ? 'PHC' : (userData.role as LoginRole);
                setAuthState({
                  uid: user.uid,
                  email: user.email,
                  role: mappedRole,
                  facilityId: userData.facilityId,
                  name: userData.name,
                  avatarUrl: userData.avatarUrl,
                });
              }
            } else {
              setAuthState({ role: null, email: null, uid: null });
            }
            setLoading(false);
          });
        } else {
          // Offline auto-login via SecureStore (or localStorage on web)
          let savedSession = null;
          if (Platform.OS === 'web') {
            savedSession = localStorage.getItem(SECURE_STORE_KEY);
          } else {
            savedSession = await SecureStore.getItemAsync(SECURE_STORE_KEY);
          }
          if (savedSession) {
            const session = JSON.parse(savedSession);
            const mappedRole = session.role === 'PHC_MO' ? 'PHC' : (session.role as LoginRole);
            setAuthState({
              uid: session.uid,
              email: session.email,
              role: mappedRole,
              facilityId: session.facilityId,
              name: session.name,
              avatarUrl: session.avatarUrl,
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
      
      const mappedRole = response.user.role === 'PHC_MO' ? 'PHC' : (response.user.role as LoginRole);
      
      const session = {
        uid: response.user.id,
        email: response.user.email,
        role: mappedRole,
        facilityId: response.user.facilityId,
        name: response.user.name,
        avatarUrl: response.user.avatarUrl,
      };

      setAuthState(session);

      if (rememberMe) {
        if (Platform.OS === 'web') {
          localStorage.setItem(SECURE_STORE_KEY, JSON.stringify(session));
        } else {
          await SecureStore.setItemAsync(SECURE_STORE_KEY, JSON.stringify(session));
        }
      } else {
        if (Platform.OS === 'web') {
          localStorage.removeItem(SECURE_STORE_KEY);
        } else {
          await SecureStore.deleteItemAsync(SECURE_STORE_KEY);
        }
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
      await clearLocalDb();
      setAuthState({ role: null, email: null, uid: null });
      if (Platform.OS === 'web') {
        localStorage.removeItem(SECURE_STORE_KEY);
      } else {
        await SecureStore.deleteItemAsync(SECURE_STORE_KEY);
      }
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
