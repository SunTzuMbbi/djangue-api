import { Router, Request, Response } from 'express';
import { db } from '../db';
import { users, otpCodes } from '../db/schema';
import { eq, and, gt } from 'drizzle-orm';
import jwt from 'jsonwebtoken';
import { sendOTP, checkOTP } from '../utils/otp';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

// POST /auth/otp/request
router.post('/otp/request', async (req: Request, res: Response) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ message: 'Numero de telefono requerido.' });
  try {
    await sendOTP(phone);
    return res.json({ message: 'Codigo enviado.' });
  } catch (e: any) {
    console.error('Twilio error:', e?.message);
    return res.status(500).json({ message: 'Error al enviar el SMS. Verifica el numero.' });
  }
});

// POST /auth/otp/verify
router.post('/otp/verify', async (req: Request, res: Response) => {
  const { phone, code, nombre, apellidos, email } = req.body;
  if (!phone || !code) return res.status(400).json({ message: 'Datos incompletos.' });

  const valid = await checkOTP(phone, code);
  if (!valid) return res.status(400).json({ message: 'Codigo incorrecto o expirado.' });

  // Buscar o crear usuario
  let [user] = await db.select().from(users).where(eq(users.phone, phone));

  if (!user) {
    const displayName = nombre && apellidos
      ? `${nombre} ${apellidos}`.trim()
      : phone;
    [user] = await db.insert(users).values({
      phone,
      nombre: nombre || '',
      apellidos: apellidos || '',
      email: email || '',
      displayName,
    }).returning();
  } else if (nombre && user.nombre !== nombre) {
    [user] = await db.update(users).set({
      nombre: nombre || user.nombre,
      apellidos: apellidos || user.apellidos,
      email: email || user.email,
      displayName: nombre && apellidos ? `${nombre} ${apellidos}`.trim() : user.displayName,
    }).where(eq(users.id, user.id)).returning();
  }

  const token = jwt.sign(
    { userId: user.id },
    process.env.JWT_SECRET!,
    { expiresIn: '90d' }
  );

  return res.json({ data: { token, user } });
});

// POST /auth/logout
router.post('/logout', requireAuth, async (_req: AuthRequest, res: Response) => {
  return res.json({ message: 'Sesion cerrada.' });
});

// GET /auth/me
router.get('/me', requireAuth, async (req: AuthRequest, res: Response) => {
  return res.json({ data: req.user });
});

export default router;
