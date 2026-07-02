import {
  pgTable, text, integer, boolean, timestamp,
  decimal, pgEnum, uuid,
} from 'drizzle-orm/pg-core';

export const verificationStatusEnum = pgEnum('verification_status', ['idle', 'pending', 'approved', 'rejected']);
export const groupStatusEnum = pgEnum('group_status', ['open', 'active', 'completed', 'expired', 'cancelled']);
export const paymentMethodEnum = pgEnum('payment_method', ['bizum', 'sepa']);
export const participantStatusEnum = pgEnum('participant_status', ['active', 'phantom', 'expelled', 'left']);
export const cycleStatusEnum = pgEnum('cycle_status', ['pending', 'collecting', 'paid', 'failed']);
export const depositStatusEnum = pgEnum('deposit_status', ['pending', 'paid', 'returned', 'forfeited']);
export const disputeStatusEnum = pgEnum('dispute_status', ['open', 'under_review', 'resolved', 'closed']);
export const disputeTypeEnum = pgEnum('dispute_type', ['non_payment', 'phantom', 'identity', 'fraud', 'other']);
export const notificationTypeEnum = pgEnum('notification_type', [
  'payment_due', 'payment_received', 'cycle_completed', 'lottery_done',
  'group_joined', 'deposit_returned', 'dispute_opened', 'dispute_resolved',
  'verification_approved', 'verification_rejected', 'phantom_warning', 'group_expiring',
]);

export const users = pgTable('users', {
  id:                 uuid('id').primaryKey().defaultRandom(),
  phone:              text('phone').notNull().default(''),
  nombre:             text('nombre').notNull().default(''),
  apellidos:          text('apellidos').notNull().default(''),
  email:              text('email').notNull().default(''),
  passwordHash:       text('password_hash').notNull().default(''),
  displayName:        text('display_name').notNull().default(''),
  avatarUrl:          text('avatar_url'),
  countryCode:        text('country_code').notNull().default('ES'),
  verificationStatus: verificationStatusEnum('verification_status').notNull().default('idle'),
  leaderLevel:        integer('leader_level').notNull().default(1),
  reputationScore:    integer('reputation_score').notNull().default(80),
  groupsCompleted:    integer('groups_completed').notNull().default(0),
  groupsFailed:       integer('groups_failed').notNull().default(0),
  createdAt:          timestamp('created_at').notNull().defaultNow(),
});

export const otpCodes = pgTable('otp_codes', {
  id:        uuid('id').primaryKey().defaultRandom(),
  phone:     text('phone').notNull(),
  code:      text('code').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  used:      boolean('used').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const groups = pgTable('groups', {
  id:                  uuid('id').primaryKey().defaultRandom(),
  name:                text('name').notNull(),
  leaderId:            uuid('leader_id').notNull().references(() => users.id),
  amount:              decimal('amount', { precision: 10, scale: 2 }).notNull(),
  maxParticipants:     integer('max_participants').notNull(),
  currentParticipants: integer('current_participants').notNull().default(0),
  status:              groupStatusEnum('status').notNull().default('open'),
  paymentMethod:       paymentMethodEnum('payment_method').notNull().default('bizum'),
  countryCode:         text('country_code').notNull().default('ES'),
  depositAmount:       decimal('deposit_amount', { precision: 10, scale: 2 }).notNull().default('0'),
  currentCycle:        integer('current_cycle').notNull().default(0),
  totalCycles:         integer('total_cycles').notNull().default(0),
  nextPaymentDate:     timestamp('next_payment_date'),
  lotteryHash:         text('lottery_hash'),
  inviteCode:          text('invite_code').notNull().unique(),
  createdAt:           timestamp('created_at').notNull().defaultNow(),
  completedAt:         timestamp('completed_at'),
});

export const participants = pgTable('participants', {
  id:            uuid('id').primaryKey().defaultRandom(),
  userId:        uuid('user_id').notNull().references(() => users.id),
  groupId:       uuid('group_id').notNull().references(() => groups.id),
  cyclePosition: integer('cycle_position').notNull().default(0),
  depositPaid:   boolean('deposit_paid').notNull().default(false),
  depositAmount: decimal('deposit_amount', { precision: 10, scale: 2 }).notNull().default('0'),
  status:        participantStatusEnum('status').notNull().default('active'),
  joinedAt:      timestamp('joined_at').notNull().defaultNow(),
});

export const cycles = pgTable('cycles', {
  id:          uuid('id').primaryKey().defaultRandom(),
  groupId:     uuid('group_id').notNull().references(() => groups.id),
  cycleNumber: integer('cycle_number').notNull(),
  recipientId: uuid('recipient_id').notNull().references(() => users.id),
  status:      cycleStatusEnum('status').notNull().default('pending'),
  dueDate:     timestamp('due_date').notNull(),
  collectedAt: timestamp('collected_at'),
  createdAt:   timestamp('created_at').notNull().defaultNow(),
});

export const payments = pgTable('payments', {
  id:          uuid('id').primaryKey().defaultRandom(),
  groupId:     uuid('group_id').notNull().references(() => groups.id),
  cycleId:     uuid('cycle_id').references(() => cycles.id),
  senderId:    uuid('sender_id').notNull().references(() => users.id),
  recipientId: uuid('recipient_id').notNull().references(() => users.id),
  amount:      decimal('amount', { precision: 10, scale: 2 }).notNull(),
  method:      paymentMethodEnum('method').notNull().default('bizum'),
  status:      text('status').notNull().default('pending'),
  bizumRef:    text('bizum_ref'),
  confirmedAt: timestamp('confirmed_at'),
  createdAt:   timestamp('created_at').notNull().defaultNow(),
});

export const deposits = pgTable('deposits', {
  id:            uuid('id').primaryKey().defaultRandom(),
  groupId:       uuid('group_id').notNull().references(() => groups.id),
  participantId: uuid('participant_id').notNull().references(() => users.id),
  amount:        decimal('amount', { precision: 10, scale: 2 }).notNull(),
  status:        depositStatusEnum('status').notNull().default('pending'),
  paidAt:        timestamp('paid_at'),
  returnedAt:    timestamp('returned_at'),
  createdAt:     timestamp('created_at').notNull().defaultNow(),
});

export const disputes = pgTable('disputes', {
  id:          uuid('id').primaryKey().defaultRandom(),
  groupId:     uuid('group_id').notNull().references(() => groups.id),
  reporterId:  uuid('reporter_id').notNull().references(() => users.id),
  reportedId:  uuid('reported_id').references(() => users.id),
  type:        disputeTypeEnum('type').notNull(),
  description: text('description').notNull(),
  status:      disputeStatusEnum('status').notNull().default('open'),
  resolution:  text('resolution'),
  createdAt:   timestamp('created_at').notNull().defaultNow(),
  resolvedAt:  timestamp('resolved_at'),
});

export const notifications = pgTable('notifications', {
  id:        uuid('id').primaryKey().defaultRandom(),
  userId:    uuid('user_id').notNull().references(() => users.id),
  type:      notificationTypeEnum('type').notNull(),
  title:     text('title').notNull(),
  body:      text('body').notNull(),
  groupId:   uuid('group_id').references(() => groups.id),
  read:      boolean('read').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
