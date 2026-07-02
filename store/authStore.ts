import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from '../services/api';
import type { User, VerificationStatus } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  verificationStatus: VerificationStatus;
  error: string | null;
  register: (nombre: string, apellidos: string, email: string, password: string, phone?: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
  clearError: () => void;
}

const saveSession = async (token: string, user: User) => {
  await AsyncStorage.multiSet([
    ['djangue_token', token],
    ['djangue_user', JSON.stringify(user)],
  ]);
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: false,
  isAuthenticated: false,
  verificationStatus: 'idle',
  error: null,

  register: async (nombre, apellidos, email, password, phone) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await authApi.register(nombre, apellidos, email, password, phone);
      const { token, user } = data.data;
      await saveSession(token, user);
      set({ token, user, isAuthenticated: true, verificationStatus: user.verificationStatus });
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Error al crear la cuenta.';
      set({ error: msg });
      throw new Error(msg);
    } finally {
      set({ isLoading: false });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await authApi.login(email, password);
      const { token, user } = data.data;
      await saveSession(token, user);
      set({ token, user, isAuthenticated: true, verificationStatus: user.verificationStatus });
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Email o contraseña incorrectos.';
      set({ error: msg });
      throw new Error(msg);
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    try { await authApi.logout(); } catch (_) {}
    await AsyncStorage.multiRemove(['djangue_token', 'djangue_user']);
    set({ user: null, token: null, isAuthenticated: false, verificationStatus: 'idle' });
  },

  hydrate: async () => {
    try {
      const [[, token], [, userJson]] = await AsyncStorage.multiGet(['djangue_token', 'djangue_user']);
      if (token && userJson) {
        const user = JSON.parse(userJson) as User;
        set({ token, user, isAuthenticated: true, verificationStatus: user.verificationStatus });
      }
    } catch (_) {}
  },

  clearError: () => set({ error: null }),
}));
