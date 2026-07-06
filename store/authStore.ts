import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  sendEmailVerification,
  onAuthStateChanged,
  reload,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth } from '../services/firebase';

interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  nombre: string;
  apellidos: string;
  verificationStatus: string;
  emailVerified: boolean;
  groupsCompleted?: number;
  groupsFailed?: number;
  reputationScore?: number;
  leaderLevel?: number;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  verificationStatus: string;
  error: string | null;
  register: (nombre: string, apellidos: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
  refreshVerification: () => Promise<boolean>;
  clearError: () => void;
}

const fbToUser = (fbUser: FirebaseUser, nombre?: string, apellidos?: string): AuthUser => {
  const parts = (fbUser.displayName || '').split(' ');
  return {
    uid: fbUser.uid,
    email: fbUser.email,
    displayName: fbUser.displayName,
    nombre: nombre || parts[0] || '',
    apellidos: apellidos || parts.slice(1).join(' ') || '',
    verificationStatus: fbUser.emailVerified ? 'approved' : 'idle',
    emailVerified: fbUser.emailVerified,
    groupsCompleted: 0,
    groupsFailed: 0,
    reputationScore: 80,
    leaderLevel: 1,
  };
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isLoading: false,
  isAuthenticated: false,
  verificationStatus: 'idle',
  error: null,

  register: async (nombre, apellidos, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { user: fbUser } = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(fbUser, { displayName: `${nombre} ${apellidos}`.trim() });
      await sendEmailVerification(fbUser);
      const token = await fbUser.getIdToken();
      const user = fbToUser(fbUser, nombre, apellidos);
      await AsyncStorage.setItem('djangue_user', JSON.stringify(user));
      await AsyncStorage.setItem('djangue_token', token);
      set({ user, token, isAuthenticated: true, verificationStatus: 'idle' });
    } catch (err: any) {
      const msg = firebaseError(err.code);
      set({ error: msg });
      throw new Error(msg);
    } finally {
      set({ isLoading: false });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { user: fbUser } = await signInWithEmailAndPassword(auth, email, password);
      const token = await fbUser.getIdToken(true);
      const cached = await AsyncStorage.getItem('djangue_user');
      const prev = cached ? JSON.parse(cached) : {};
      const user = fbToUser(fbUser, prev.nombre, prev.apellidos);
      await AsyncStorage.setItem('djangue_user', JSON.stringify(user));
      await AsyncStorage.setItem('djangue_token', token);
      set({ user, token, isAuthenticated: true, verificationStatus: user.verificationStatus });
    } catch (err: any) {
      const msg = firebaseError(err.code);
      set({ error: msg });
      throw new Error(msg);
    } finally {
      set({ isLoading: false });
    }
  },

  // Recarga el estado de verificación desde Firebase en tiempo real
  refreshVerification: async () => {
    const fbUser = auth.currentUser;
    if (!fbUser) return false;
    try {
      await reload(fbUser); // fuerza recarga desde servidor
      const token = await fbUser.getIdToken(true);
      const { user: currentUser } = get();
      const user = fbToUser(fbUser, currentUser?.nombre, currentUser?.apellidos);
      await AsyncStorage.setItem('djangue_user', JSON.stringify(user));
      await AsyncStorage.setItem('djangue_token', token);
      set({ user, token, verificationStatus: user.verificationStatus });
      return fbUser.emailVerified;
    } catch {
      return false;
    }
  },

  logout: async () => {
    try { await signOut(auth); } catch (_) {}
    await AsyncStorage.multiRemove(['djangue_token', 'djangue_user']);
    set({ user: null, token: null, isAuthenticated: false, verificationStatus: 'idle' });
  },

  hydrate: async () => {
    return new Promise<void>((resolve) => {
      const unsub = onAuthStateChanged(auth, async (fbUser) => {
        unsub();
        if (fbUser) {
          try {
            await reload(fbUser);
            const token = await fbUser.getIdToken(true);
            const cached = await AsyncStorage.getItem('djangue_user');
            const prev = cached ? JSON.parse(cached) : {};
            const user = fbToUser(fbUser, prev.nombre, prev.apellidos);
            await AsyncStorage.setItem('djangue_user', JSON.stringify(user));
            await AsyncStorage.setItem('djangue_token', token);
            set({ token, user, isAuthenticated: true, verificationStatus: user.verificationStatus });
          } catch (_) {}
        }
        resolve();
      });
    });
  },

  clearError: () => set({ error: null }),
}));

function firebaseError(code: string): string {
  switch (code) {
    case 'auth/email-already-in-use': return 'Ya existe una cuenta con ese email.';
    case 'auth/invalid-email': return 'El email no es valido.';
    case 'auth/weak-password': return 'La contrasena debe tener al menos 6 caracteres.';
    case 'auth/user-not-found': return 'No existe una cuenta con ese email.';
    case 'auth/wrong-password': return 'Contrasena incorrecta.';
    case 'auth/invalid-credential': return 'Email o contrasena incorrectos.';
    case 'auth/too-many-requests': return 'Demasiados intentos. Intenta mas tarde.';
    case 'auth/network-request-failed': return 'Error de conexion. Verifica tu internet.';
    default: return 'Error de autenticacion. Intenta de nuevo.';
  }
}
