import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '../firebase/firebaseConfig';
import { User } from '@/shared/types/user';
import { UserRole } from '@/constants/roles';
import { dummyUsers } from '@/dummy/users';

export const authRepository = {
  login: async (email: string, password: string, role: string): Promise<{ user: User; token: string }> => {
    const targetRole = role === 'PHC' ? 'PHC_MO' : role;

    if (!isFirebaseConfigured) {
      const matched = dummyUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (!matched) {
        throw new Error('AUTH/INVALID_CREDENTIALS');
      }
      if (matched.role !== targetRole) {
        throw new Error('AUTH/ROLE_MISMATCH');
      }
      return {
        user: matched,
        token: 'mock-jwt-token-for-' + matched.id,
      };
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      const userDoc = await getDoc(doc(db, 'users', uid));
      if (!userDoc.exists()) {
        throw new Error('AUTH/INVALID_CREDENTIALS');
      }

      const userData = userDoc.data() as Omit<User, 'id'>;
      if (userData.role !== targetRole) {
        throw new Error('AUTH/ROLE_MISMATCH');
      }

      const token = await userCredential.user.getIdToken();
      return {
        user: {
          id: uid,
          ...userData,
        },
        token,
      };
    } catch (error: any) {
      if (error.message === 'AUTH/ROLE_MISMATCH' || error.message === 'AUTH/INVALID_CREDENTIALS') {
        throw error;
      }
      if (
        error.code === 'auth/wrong-password' ||
        error.code === 'auth/user-not-found' ||
        error.code === 'auth/invalid-credential' ||
        error.code === 'auth/invalid-email'
      ) {
        throw new Error('AUTH/INVALID_CREDENTIALS');
      }
      throw new Error('DB/FETCH_ERROR');
    }
  },

  logout: async (): Promise<void> => {
    if (!isFirebaseConfigured) {
      return;
    }
    await signOut(auth);
  },
};
