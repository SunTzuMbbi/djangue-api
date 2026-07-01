// ─── Djangue — Tipos globales ─────────────────────────────────────────────────

export type DocType = 'DNI' | 'NIE' | 'PASAPORTE';
export type VerificationStatus = 'idle' | 'pending' | 'approved' | 'rejected';
export type LeaderLevel = 1 | 2;
export type GroupStatus = 'open' | 'active' | 'completed' | 'expired' | 'cancelled';
export type PaymentMethod = 'bizum' | 'sepa';
export type DisputeStatus = 'open' | 'under_review' | 'resolved' | 'closed';
export type CycleStatus = 'pending' | 'collecting' | 'paid' | 'failed';

// ─── Usuario ──────────────────────────────────────────────────────────────────
export interface User {
  id: string;
  phone: string;
  displayName: string;
  avatarUrl?: string;
  countryCode: string;
  verificationStatus: VerificationStatus;
  leaderLevel: LeaderLevel;
  reputationScore: number;    // 0–100
  groupsCompleted: number;
  groupsFailed: number;
  createdAt: string;          // ISO
}

// ─── Tanda / Grupo ────────────────────────────────────────────────────────────
export interface Group {
  id: string;
  name: string;
  leaderId: string;
  leader: User;
  amount: number;             // €/mes por participante
  maxParticipants: number;
  currentParticipants: number;
  participants: Participant[];
  status: GroupStatus;
  paymentMethod: PaymentMethod;
  countryCode: string;
  depositAmount: number;      // fianza
  currentCycle: number;       // 1-based
  totalCycles: number;
  nextPaymentDate: string;    // ISO
  lotteryHash?: string;       // hash inmutable del sorteo
  inviteCode: string;
  createdAt: string;
  completedAt?: string;
}

export interface Participant {
  id: string;
  userId: string;
  user: User;
  groupId: string;
  cyclePosition: number;      // posición asignada en el sorteo
  depositPaid: boolean;
  depositAmount: number;
  joinedAt: string;
  status: 'active' | 'phantom' | 'expelled' | 'left';
}

// ─── Ciclo ────────────────────────────────────────────────────────────────────
export interface Cycle {
  id: string;
  groupId: string;
  cycleNumber: number;
  recipientId: string;
  recipient: User;
  status: CycleStatus;
  dueDate: string;
  collectedAt?: string;
  payments: Payment[];
}

// ─── Pagos ────────────────────────────────────────────────────────────────────
export interface Payment {
  id: string;
  groupId: string;
  cycleId: string;
  senderId: string;
  recipientId: string;
  amount: number;
  method: PaymentMethod;
  status: 'pending' | 'confirmed' | 'disputed' | 'failed';
  bizumRef?: string;          // referencia Bizum
  confirmedAt?: string;
  createdAt: string;
}

// ─── Fianza ───────────────────────────────────────────────────────────────────
export interface Deposit {
  id: string;
  groupId: string;
  participantId: string;
  amount: number;
  paidAt?: string;
  returnedAt?: string;
  status: 'pending' | 'paid' | 'returned' | 'forfeited';
}

// ─── Disputas ─────────────────────────────────────────────────────────────────
export interface Dispute {
  id: string;
  groupId: string;
  reporterId: string;
  reportedId: string;
  type: 'non_payment' | 'phantom' | 'identity' | 'fraud' | 'other';
  description: string;
  status: DisputeStatus;
  evidence?: string[];        // URLs de evidencia
  resolution?: string;
  createdAt: string;
  resolvedAt?: string;
}

// ─── Verificación ─────────────────────────────────────────────────────────────
export interface VerificationPayload {
  docType: DocType;
  docFront: string;           // base64
  docBack?: string;           // base64, opcional (pasaporte)
  selfie: string;             // base64
}

// ─── Notificaciones ───────────────────────────────────────────────────────────
export type NotificationType =
  | 'payment_due'
  | 'payment_received'
  | 'cycle_completed'
  | 'lottery_done'
  | 'group_joined'
  | 'deposit_returned'
  | 'dispute_opened'
  | 'dispute_resolved'
  | 'verification_approved'
  | 'verification_rejected'
  | 'phantom_warning'
  | 'group_expiring';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  groupId?: string;
  read: boolean;
  createdAt: string;
}

// ─── Respuestas API ───────────────────────────────────────────────────────────
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ─── Formularios ─────────────────────────────────────────────────────────────
export interface CreateGroupForm {
  name: string;
  amount: number;
  maxParticipants: number;
  paymentMethod: PaymentMethod;
  depositAmount: number;
  startDate: string;
}
