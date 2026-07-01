import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://api-djangue-production.up.railway.app';

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Inyectar token en cada petición
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('djangue_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Manejar 401 globalmente
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('djangue_token');
      await AsyncStorage.removeItem('djangue_user');
      // Navegar al login se gestiona desde el store
    }
    return Promise.reject(error);
  }
);

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authApi = {
  requestOTP:          (phone: string) =>
    api.post('/auth/otp/request', { phone }),
  verifyOTP:           (phone: string, code: string) =>
    api.post('/auth/otp/verify', { phone, code }),
  submitVerification:  (payload: any) =>
    api.post('/auth/verify-identity', payload),
  refreshToken:        (refresh: string) =>
    api.post('/auth/refresh', { refresh }),
  logout:              () => api.post('/auth/logout'),
};

// ─── Grupos ───────────────────────────────────────────────────────────────────
export const groupApi = {
  list:            (params?: { country?: string; status?: string; page?: number }) =>
    api.get('/groups', { params }),
  detail:          (id: string) => api.get(`/groups/${id}`),
  create:          (body: any)  => api.post('/groups', body),
  join:            (id: string, inviteCode?: string) =>
    api.post(`/groups/${id}/join`, { inviteCode }),
  leave:           (id: string) => api.post(`/groups/${id}/leave`),
  runLottery:      (id: string) => api.post(`/groups/${id}/lottery`),
  getCalendar:     (id: string) => api.get(`/groups/${id}/calendar`),
  getHistory:      (id: string) => api.get(`/groups/${id}/history`),
  expelPhantom:    (id: string, participantId: string, reason: string) =>
    api.post(`/groups/${id}/expel`, { participantId, reason }),
  acceptLeaderResponsibility: (id: string) =>
    api.post(`/groups/${id}/accept-responsibility`),
};

// ─── Pagos ────────────────────────────────────────────────────────────────────
export const paymentApi = {
  confirm:        (groupId: string, cycleId: string, ref?: string) =>
    api.post(`/payments/confirm`, { groupId, cycleId, bizumRef: ref }),
  claimUnregistered: (body: any) => api.post('/payments/claim', body),
  getForCycle:    (cycleId: string) => api.get(`/payments?cycleId=${cycleId}`),
};

// ─── Fianzas ──────────────────────────────────────────────────────────────────
export const depositApi = {
  pay:            (groupId: string) => api.post(`/deposits/pay`, { groupId }),
  confirmReceipt: (groupId: string, participantId: string) =>
    api.post(`/deposits/confirm`, { groupId, participantId }),
  return:         (groupId: string, participantId: string) =>
    api.post(`/deposits/return`, { groupId, participantId }),
  getForGroup:    (groupId: string) => api.get(`/deposits?groupId=${groupId}`),
};

// ─── Disputas ─────────────────────────────────────────────────────────────────
export const disputeApi = {
  open:    (body: any)  => api.post('/disputes', body),
  list:    (groupId?: string) =>
    api.get('/disputes', { params: { groupId } }),
  detail:  (id: string) => api.get(`/disputes/${id}`),
  resolve: (id: string, resolution: string) =>
    api.post(`/disputes/${id}/resolve`, { resolution }),
};

// ─── Perfil / Reputación ─────────────────────────────────────────────────────
export const profileApi = {
  me:              () => api.get('/profile/me'),
  update:          (body: any) => api.patch('/profile/me', body),
  reputation:      (userId: string) => api.get(`/profile/${userId}/reputation`),
  monthlySummary:  (month: string) => api.get(`/profile/summary?month=${month}`),
};

// ─── Notificaciones ──────────────────────────────────────────────────────────
export const notificationApi = {
  list:    (page = 1) => api.get(`/notifications?page=${page}`),
  markRead:(id: string) => api.post(`/notifications/${id}/read`),
  markAll: () => api.post('/notifications/read-all'),
};

// ─── Admin ───────────────────────────────────────────────────────────────────
export const adminApi = {
  verifications: (status?: string) =>
    api.get('/admin/verifications', { params: { status } }),
  approveVerification: (id: string) =>
    api.post(`/admin/verifications/${id}/approve`),
  rejectVerification: (id: string, reason: string) =>
    api.post(`/admin/verifications/${id}/reject`, { reason }),
  disputes: (status?: string) =>
    api.get('/admin/disputes', { params: { status } }),
  stats: () => api.get('/admin/stats'),
};
