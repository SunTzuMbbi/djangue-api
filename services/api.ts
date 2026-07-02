import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://djangue-api-production.up.railway.app';

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('djangue_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('djangue_token');
      await AsyncStorage.removeItem('djangue_user');
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  register: (nombre: string, apellidos: string, email: string, password: string, phone?: string) =>
    api.post('/auth/register', { nombre, apellidos, email, password, phone }),
  login:    (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  logout:   () => api.post('/auth/logout'),
  me:       () => api.get('/auth/me'),
};

export const groupApi = {
  list:           (params?: { country?: string; status?: string }) => api.get('/groups', { params }),
  detail:         (id: string) => api.get(`/groups/${id}`),
  create:         (body: any)  => api.post('/groups', body),
  join:           (id: string, inviteCode?: string) => api.post(`/groups/${id}/join`, { inviteCode }),
  leave:          (id: string) => api.post(`/groups/${id}/leave`),
  runLottery:     (id: string) => api.post(`/groups/${id}/lottery`),
  getCalendar:    (id: string) => api.get(`/groups/${id}/calendar`),
  getHistory:     (id: string) => api.get(`/groups/${id}/history`),
};

export const paymentApi = {
  confirm:           (groupId: string, cycleId: string, ref?: string) =>
    api.post('/payments/confirm', { groupId, cycleId, bizumRef: ref }),
  claimUnregistered: (body: any) => api.post('/payments/claim', body),
};

export const depositApi = {
  pay:            (groupId: string) => api.post('/deposits/pay', { groupId }),
  confirmReceipt: (groupId: string, participantId: string) =>
    api.post('/deposits/confirm', { groupId, participantId }),
  return:         (groupId: string, participantId: string) =>
    api.post('/deposits/return', { groupId, participantId }),
  getForGroup:    (groupId: string) => api.get(`/deposits?groupId=${groupId}`),
};

export const disputeApi = {
  open:    (body: any)  => api.post('/disputes', body),
  list:    (groupId?: string) => api.get('/disputes', { params: { groupId } }),
  detail:  (id: string) => api.get(`/disputes/${id}`),
  resolve: (id: string, resolution: string) =>
    api.post(`/disputes/${id}/resolve`, { resolution }),
};

export const profileApi = {
  me:             () => api.get('/profile/me'),
  update:         (body: any) => api.patch('/profile/me', body),
  reputation:     (userId: string) => api.get(`/profile/${userId}/reputation`),
  monthlySummary: (month: string) => api.get(`/profile/summary?month=${month}`),
};

export const notificationApi = {
  list:     (page = 1) => api.get(`/notifications?page=${page}`),
  markRead: (id: string) => api.post(`/notifications/${id}/read`),
  markAll:  () => api.post('/notifications/read-all'),
};

export const adminApi = {
  stats: () => api.get('/admin/stats'),
};
