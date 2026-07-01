import { create } from 'zustand';
import { groupApi, paymentApi, depositApi, disputeApi } from '../services/api';
import type { Group, Cycle, Payment, Deposit, Dispute, CreateGroupForm } from '../types';

interface GroupState {
  groups: Group[];
  myGroups: Group[];
  activeGroup: Group | null;
  cycles: Cycle[];
  deposits: Deposit[];
  disputes: Dispute[];
  isLoading: boolean;
  error: string | null;
  // Grupos
  fetchGroups: (country?: string) => Promise<void>;
  fetchMyGroups: () => Promise<void>;
  fetchGroup: (id: string) => Promise<void>;
  createGroup: (form: CreateGroupForm) => Promise<Group>;
  joinGroup: (id: string, inviteCode?: string) => Promise<void>;
  leaveGroup: (id: string) => Promise<void>;
  runLottery: (id: string) => Promise<void>;
  expelPhantom: (groupId: string, participantId: string, reason: string) => Promise<void>;
  acceptLeaderResponsibility: (groupId: string) => Promise<void>;
  // Pagos
  confirmPayment: (groupId: string, cycleId: string, ref?: string) => Promise<void>;
  claimUnregisteredPayment: (body: any) => Promise<void>;
  // Fianzas
  payDeposit: (groupId: string) => Promise<void>;
  confirmDepositReceipt: (groupId: string, participantId: string) => Promise<void>;
  returnDeposit: (groupId: string, participantId: string) => Promise<void>;
  fetchDeposits: (groupId: string) => Promise<void>;
  // Disputas
  openDispute: (body: any) => Promise<void>;
  fetchDisputes: (groupId?: string) => Promise<void>;
  // Utilidades
  setActiveGroup: (group: Group | null) => void;
  clearError: () => void;
}

export const useGroupStore = create<GroupState>((set, get) => ({
  groups: [],
  myGroups: [],
  activeGroup: null,
  cycles: [],
  deposits: [],
  disputes: [],
  isLoading: false,
  error: null,

  fetchGroups: async (country) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await groupApi.list({ country, status: 'open' });
      set({ groups: data.data });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Error al cargar las tandas.' });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchMyGroups: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await groupApi.list({ status: 'active' });
      set({ myGroups: data.data });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Error al cargar tus tandas.' });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchGroup: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await groupApi.detail(id);
      set({ activeGroup: data.data });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Error al cargar la tanda.' });
    } finally {
      set({ isLoading: false });
    }
  },

  createGroup: async (form) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await groupApi.create(form);
      const newGroup = data.data as Group;
      set(state => ({ myGroups: [newGroup, ...state.myGroups] }));
      return newGroup;
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Error al crear la tanda.';
      set({ error: msg });
      throw new Error(msg);
    } finally {
      set({ isLoading: false });
    }
  },

  joinGroup: async (id, inviteCode) => {
    set({ isLoading: true, error: null });
    try {
      await groupApi.join(id, inviteCode);
      await get().fetchMyGroups();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'No pudiste unirte a la tanda.';
      set({ error: msg });
      throw new Error(msg);
    } finally {
      set({ isLoading: false });
    }
  },

  leaveGroup: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await groupApi.leave(id);
      set(state => ({ myGroups: state.myGroups.filter(g => g.id !== id) }));
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Error al salir de la tanda.';
      set({ error: msg });
      throw new Error(msg);
    } finally {
      set({ isLoading: false });
    }
  },

  runLottery: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await groupApi.runLottery(id);
      set({ activeGroup: data.data });
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Error al ejecutar el sorteo.';
      set({ error: msg });
      throw new Error(msg);
    } finally {
      set({ isLoading: false });
    }
  },

  expelPhantom: async (groupId, participantId, reason) => {
    set({ isLoading: true, error: null });
    try {
      await groupApi.expelPhantom(groupId, participantId, reason);
      await get().fetchGroup(groupId);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Error al expulsar al participante.';
      set({ error: msg });
      throw new Error(msg);
    } finally {
      set({ isLoading: false });
    }
  },

  acceptLeaderResponsibility: async (groupId) => {
    set({ isLoading: true, error: null });
    try {
      await groupApi.acceptLeaderResponsibility(groupId);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Error al confirmar responsabilidad.';
      set({ error: msg });
      throw new Error(msg);
    } finally {
      set({ isLoading: false });
    }
  },

  confirmPayment: async (groupId, cycleId, ref) => {
    set({ isLoading: true, error: null });
    try {
      await paymentApi.confirm(groupId, cycleId, ref);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Error al confirmar el pago.';
      set({ error: msg });
      throw new Error(msg);
    } finally {
      set({ isLoading: false });
    }
  },

  claimUnregisteredPayment: async (body) => {
    set({ isLoading: true, error: null });
    try {
      await paymentApi.claimUnregistered(body);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Error al reclamar el pago.';
      set({ error: msg });
      throw new Error(msg);
    } finally {
      set({ isLoading: false });
    }
  },

  payDeposit: async (groupId) => {
    set({ isLoading: true, error: null });
    try {
      await depositApi.pay(groupId);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Error al pagar la fianza.';
      set({ error: msg });
      throw new Error(msg);
    } finally {
      set({ isLoading: false });
    }
  },

  confirmDepositReceipt: async (groupId, participantId) => {
    set({ isLoading: true, error: null });
    try {
      await depositApi.confirmReceipt(groupId, participantId);
      await get().fetchDeposits(groupId);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Error al confirmar la fianza.';
      set({ error: msg });
      throw new Error(msg);
    } finally {
      set({ isLoading: false });
    }
  },

  returnDeposit: async (groupId, participantId) => {
    set({ isLoading: true, error: null });
    try {
      await depositApi.return(groupId, participantId);
      await get().fetchDeposits(groupId);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Error al devolver la fianza.';
      set({ error: msg });
      throw new Error(msg);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchDeposits: async (groupId) => {
    try {
      const { data } = await depositApi.getForGroup(groupId);
      set({ deposits: data.data });
    } catch (_) {}
  },

  openDispute: async (body) => {
    set({ isLoading: true, error: null });
    try {
      await disputeApi.open(body);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Error al abrir la disputa.';
      set({ error: msg });
      throw new Error(msg);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchDisputes: async (groupId) => {
    try {
      const { data } = await disputeApi.list(groupId);
      set({ disputes: data.data });
    } catch (_) {}
  },

  setActiveGroup: (group) => set({ activeGroup: group }),
  clearError: () => set({ error: null }),
}));
