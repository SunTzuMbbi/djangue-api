import { Router, Response } from 'express';
import { db } from '../db';
import { payments, deposits, disputes, notifications, users, groups, participants } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { requireAuth, AuthRequest } from '../middleware/auth';

// ─── PAYMENTS ─────────────────────────────────────────────────────────────────
export const paymentsRouter = Router();

paymentsRouter.post('/confirm', requireAuth, async (req: AuthRequest, res: Response) => {
  const { groupId, cycleId, bizumRef } = req.body;
  const [group] = await db.select().from(groups).where(eq(groups.id, groupId));
  if (!group) return res.status(404).json({ message: 'Tanda no encontrada.' });

  await db.insert(payments).values({
    groupId,
    cycleId: cycleId || null,
    senderId: req.userId!,
    recipientId: group.leaderId,
    amount: group.amount,
    bizumRef: bizumRef || null,
    status: 'confirmed',
    confirmedAt: new Date(),
  });

  return res.json({ data: { message: 'Pago confirmado.' } });
});

paymentsRouter.post('/claim', requireAuth, async (req: AuthRequest, res: Response) => {
  const { groupId, bizumRef, amount, notes } = req.body;
  await db.insert(disputes).values({
    groupId,
    reporterId: req.userId!,
    type: 'non_payment',
    description: `Reclamación de pago. Ref: ${bizumRef}. Importe: ${amount}€. ${notes || ''}`,
  });
  return res.json({ data: { message: 'Reclamación enviada.' } });
});

// ─── DEPOSITS ─────────────────────────────────────────────────────────────────
export const depositsRouter = Router();

depositsRouter.post('/pay', requireAuth, async (req: AuthRequest, res: Response) => {
  const { groupId } = req.body;
  const [group] = await db.select().from(groups).where(eq(groups.id, groupId));
  if (!group) return res.status(404).json({ message: 'Tanda no encontrada.' });

  await db.update(participants).set({ depositPaid: true }).where(
    and(eq(participants.groupId, groupId), eq(participants.userId, req.userId!))
  );

  return res.json({ data: { message: 'Fianza marcada como pagada.' } });
});

depositsRouter.post('/confirm', requireAuth, async (req: AuthRequest, res: Response) => {
  const { groupId, participantId } = req.body;
  await db.update(participants).set({ depositPaid: true }).where(
    and(eq(participants.groupId, groupId), eq(participants.userId, participantId))
  );

  const existing = await db.select().from(deposits).where(
    and(eq(deposits.groupId, groupId), eq(deposits.participantId, participantId))
  );
  if (existing.length === 0) {
    const [group] = await db.select().from(groups).where(eq(groups.id, groupId));
    await db.insert(deposits).values({
      groupId,
      participantId,
      amount: group?.depositAmount || '0',
      status: 'paid',
      paidAt: new Date(),
    });
  } else {
    await db.update(deposits).set({ status: 'paid', paidAt: new Date() }).where(eq(deposits.id, existing[0].id));
  }

  return res.json({ data: { message: 'Fianza confirmada.' } });
});

depositsRouter.post('/return', requireAuth, async (req: AuthRequest, res: Response) => {
  const { groupId, participantId } = req.body;
  await db.update(deposits).set({ status: 'returned', returnedAt: new Date() }).where(
    and(eq(deposits.groupId, groupId), eq(deposits.participantId, participantId))
  );
  return res.json({ data: { message: 'Fianza devuelta.' } });
});

depositsRouter.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  const { groupId } = req.query;
  if (!groupId) return res.status(400).json({ message: 'groupId requerido.' });
  const deps = await db.select().from(deposits).where(eq(deposits.groupId, String(groupId)));
  return res.json({ data: deps });
});

// ─── DISPUTES ─────────────────────────────────────────────────────────────────
export const disputesRouter = Router();

disputesRouter.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  const { groupId, type, description, reportedId } = req.body;
  const [dispute] = await db.insert(disputes).values({
    groupId,
    reporterId: req.userId!,
    reportedId: reportedId || null,
    type,
    description,
  }).returning();
  return res.json({ data: dispute });
});

disputesRouter.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  const { groupId } = req.query;
  const all = groupId
    ? await db.select().from(disputes).where(eq(disputes.groupId, String(groupId)))
    : await db.select().from(disputes);
  return res.json({ data: all });
});

disputesRouter.get('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  const [dispute] = await db.select().from(disputes).where(eq(disputes.id, req.params.id));
  if (!dispute) return res.status(404).json({ message: 'Disputa no encontrada.' });
  return res.json({ data: dispute });
});

disputesRouter.post('/:id/resolve', requireAuth, async (req: AuthRequest, res: Response) => {
  const { resolution } = req.body;
  await db.update(disputes).set({ status: 'resolved', resolution, resolvedAt: new Date() }).where(eq(disputes.id, req.params.id));
  return res.json({ data: { message: 'Disputa resuelta.' } });
});

// ─── PROFILE ──────────────────────────────────────────────────────────────────
export const profileRouter = Router();

profileRouter.get('/me', requireAuth, async (req: AuthRequest, res: Response) => {
  return res.json({ data: req.user });
});

profileRouter.patch('/me', requireAuth, async (req: AuthRequest, res: Response) => {
  const { nombre, apellidos, email, avatarUrl } = req.body;
  const [updated] = await db.update(users).set({
    ...(nombre && { nombre }),
    ...(apellidos && { apellidos }),
    ...(email && { email }),
    ...(avatarUrl && { avatarUrl }),
    ...(nombre && apellidos && { displayName: `${nombre} ${apellidos}`.trim() }),
  }).where(eq(users.id, req.userId!)).returning();
  return res.json({ data: updated });
});

profileRouter.get('/:userId/reputation', requireAuth, async (req: AuthRequest, res: Response) => {
  const [user] = await db.select().from(users).where(eq(users.id, req.params.userId));
  if (!user) return res.status(404).json({ message: 'Usuario no encontrado.' });
  return res.json({ data: { score: user.reputationScore, cyclesCompleted: user.groupsCompleted, cleanRecord: user.groupsFailed === 0, onTimePayments: user.groupsCompleted, totalPayments: user.groupsCompleted } });
});

profileRouter.get('/summary', requireAuth, async (req: AuthRequest, res: Response) => {
  return res.json({ data: { month: req.query.month, payments: [], cycles: [], reputation: req.user?.reputationScore } });
});

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────
export const notificationsRouter = Router();

notificationsRouter.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  const notifs = await db.select().from(notifications).where(eq(notifications.userId, req.userId!));
  return res.json({ data: notifs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) });
});

notificationsRouter.post('/:id/read', requireAuth, async (req: AuthRequest, res: Response) => {
  await db.update(notifications).set({ read: true }).where(eq(notifications.id, req.params.id));
  return res.json({ data: { message: 'Notificación marcada.' } });
});

notificationsRouter.post('/read-all', requireAuth, async (req: AuthRequest, res: Response) => {
  await db.update(notifications).set({ read: true }).where(eq(notifications.userId, req.userId!));
  return res.json({ data: { message: 'Todas marcadas.' } });
});
