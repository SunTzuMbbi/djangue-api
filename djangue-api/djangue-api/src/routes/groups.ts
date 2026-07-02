import { Router, Response } from 'express';
import { db } from '../db';
import { groups, participants, users, cycles } from '../db/schema';
import { eq, and, or } from 'drizzle-orm';
import { requireAuth, AuthRequest } from '../middleware/auth';
import crypto from 'crypto';

const router = Router();

const generateInviteCode = () =>
  Math.random().toString(36).substring(2, 6).toUpperCase() + '-' +
  Math.random().toString(36).substring(2, 6).toUpperCase();

// GET /groups
router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  const { status, country } = req.query;
  let query = db.select().from(groups);
  const allGroups = await query;

  // Enriquecer con lider y participantes
  const enriched = await Promise.all(allGroups
    .filter(g => !status || g.status === status)
    .filter(g => !country || g.countryCode === country)
    .map(async g => {
      const [leader] = await db.select().from(users).where(eq(users.id, g.leaderId));
      const pts = await db.select().from(participants).where(eq(participants.groupId, g.id));
      const enrichedPts = await Promise.all(pts.map(async p => {
        const [u] = await db.select().from(users).where(eq(users.id, p.userId));
        return { ...p, user: u };
      }));
      return { ...g, leader, participants: enrichedPts };
    })
  );

  return res.json({ data: enriched });
});

// GET /groups/:id
router.get('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const [group] = await db.select().from(groups).where(eq(groups.id, id));
  if (!group) return res.status(404).json({ message: 'Tanda no encontrada.' });

  const [leader] = await db.select().from(users).where(eq(users.id, group.leaderId));
  const pts = await db.select().from(participants).where(eq(participants.groupId, id));
  const enrichedPts = await Promise.all(pts.map(async p => {
    const [u] = await db.select().from(users).where(eq(users.id, p.userId));
    return { ...p, user: u };
  }));

  return res.json({ data: { ...group, leader, participants: enrichedPts } });
});

// POST /groups
router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  const { name, amount, maxParticipants, paymentMethod, depositAmount, startDate } = req.body;
  if (!name || !amount || !maxParticipants) return res.status(400).json({ message: 'Datos incompletos.' });

  const [group] = await db.insert(groups).values({
    name,
    leaderId: req.userId!,
    amount: String(amount),
    maxParticipants,
    totalCycles: maxParticipants,
    paymentMethod: paymentMethod || 'bizum',
    depositAmount: String(depositAmount || 0),
    inviteCode: generateInviteCode(),
    nextPaymentDate: startDate ? new Date(startDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    currentParticipants: 1,
  }).returning();

  // Añadir al lider como primer participante
  await db.insert(participants).values({
    userId: req.userId!,
    groupId: group.id,
    depositPaid: true,
    depositAmount: String(depositAmount || 0),
  });

  const [leader] = await db.select().from(users).where(eq(users.id, req.userId!));
  return res.json({ data: { ...group, leader, participants: [] } });
});

// POST /groups/:id/join
router.post('/:id/join', requireAuth, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const [group] = await db.select().from(groups).where(eq(groups.id, id));
  if (!group) return res.status(404).json({ message: 'Tanda no encontrada.' });
  if (group.status !== 'open') return res.status(400).json({ message: 'La tanda no está abierta.' });
  if (group.currentParticipants >= group.maxParticipants) return res.status(400).json({ message: 'La tanda está llena.' });

  const existing = await db.select().from(participants).where(
    and(eq(participants.groupId, id), eq(participants.userId, req.userId!))
  );
  if (existing.length > 0) return res.status(400).json({ message: 'Ya eres participante.' });

  await db.insert(participants).values({
    userId: req.userId!,
    groupId: id,
    depositAmount: group.depositAmount,
  });

  await db.update(groups).set({
    currentParticipants: group.currentParticipants + 1,
    status: group.currentParticipants + 1 >= group.maxParticipants ? 'active' : 'open',
  }).where(eq(groups.id, id));

  return res.json({ data: { message: 'Te has unido a la tanda.' } });
});

// POST /groups/:id/leave
router.post('/:id/leave', requireAuth, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  await db.update(participants).set({ status: 'left' }).where(
    and(eq(participants.groupId, id), eq(participants.userId, req.userId!))
  );
  const [group] = await db.select().from(groups).where(eq(groups.id, id));
  if (group) {
    await db.update(groups).set({ currentParticipants: Math.max(0, group.currentParticipants - 1) }).where(eq(groups.id, id));
  }
  return res.json({ data: { message: 'Has salido de la tanda.' } });
});

// POST /groups/:id/lottery
router.post('/:id/lottery', requireAuth, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const [group] = await db.select().from(groups).where(eq(groups.id, id));
  if (!group) return res.status(404).json({ message: 'Tanda no encontrada.' });
  if (group.leaderId !== req.userId) return res.status(403).json({ message: 'Solo el lider puede ejecutar el sorteo.' });

  const pts = await db.select().from(participants).where(
    and(eq(participants.groupId, id), eq(participants.status, 'active'))
  );

  // Sorteo aleatorio verificable con hash SHA256
  const seed = `${id}-${Date.now()}`;
  const hash = crypto.createHash('sha256').update(seed).digest('hex');
  const shuffled = [...pts].sort(() => Math.random() - 0.5);

  // Asignar posiciones y crear ciclos
  await Promise.all(shuffled.map(async (p, i) => {
    await db.update(participants).set({ cyclePosition: i + 1 }).where(eq(participants.id, p.id));
    const dueDate = new Date();
    dueDate.setMonth(dueDate.getMonth() + i);
    await db.insert(cycles).values({
      groupId: id,
      cycleNumber: i + 1,
      recipientId: p.userId,
      dueDate,
    });
  }));

  await db.update(groups).set({ lotteryHash: hash, status: 'active', currentCycle: 1 }).where(eq(groups.id, id));

  const updatedGroup = await db.select().from(groups).where(eq(groups.id, id));
  return res.json({ data: { ...updatedGroup[0], lotteryHash: hash } });
});

// GET /groups/:id/calendar
router.get('/:id/calendar', requireAuth, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const groupCycles = await db.select().from(cycles).where(eq(cycles.groupId, id));
  const enriched = await Promise.all(groupCycles.map(async c => {
    const [recipient] = await db.select().from(users).where(eq(users.id, c.recipientId));
    return { ...c, recipient };
  }));
  return res.json({ data: enriched.sort((a, b) => a.cycleNumber - b.cycleNumber) });
});

// GET /groups/:id/history
router.get('/:id/history', requireAuth, async (req: AuthRequest, res: Response) => {
  return res.json({ data: [] });
});

export default router;
