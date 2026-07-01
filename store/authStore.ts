import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from '../services/api';
import type { User, VerificationPayload, VerificationStatus } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  verificationStatus: VerificationStatus;
  error: string | null;
  // Acciones
  requestOTP: (phone: string) => Promise<void>;
  verifyOTP: (phone: string, code: string) => Promise<void>;
  submitVerification: (payload: VerificationPayload) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isLoading: false,
  isAuthenticated: false,
  verificationStatus: 'idle',
  error: null,

  requestOTP: async (phone) => {
    set({ isLoading: true, error: null });
    try {
      await authApi.requestOTP(phone);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'No pudimos enviar el código SMS.';
      set({ error: msg });
      throw new Error(msg);
    } finally {
      set({ isLoading: false });
    }
  },

  verifyOTP: async (phone, code) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await authApi.verifyOTP(phone, code);
      const { token, user } = data;
      await AsyncStorage.multiSet([
        ['djangue_token', token],
        ['djangue_user', JSON.stringify(user)],
      ]);
      set({
        token,
        user,
        isAuthenticated: true,
        verificationStatus: user.verificationStatus,
      });
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Código incorrecto o expirado.';
      set({ error: msg });
      throw new Error(msg);
    } finally {
      set({ isLoading: false });
    }
  },

  submitVerification: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      await authApi.submitVerification(payload);
      set({ verificationStatus: 'pending' });
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Error al enviar la verificación.';
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
      const [[, token], [, userJson]] = await AsyncStorage.multiGet([
        'djangue_token',
        'djangue_user',
      ]);
      if (token && userJson) {
        const user = JSON.parse(userJson) as User;
        set({ token, user, isAuthenticated: true, verificationStatus: user.verificationStatus });
      }
    } catch (_) {}
  },

  clearError: () => set({ error: null }),
}));
