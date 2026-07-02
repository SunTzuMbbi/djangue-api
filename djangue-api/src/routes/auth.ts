import { Router, Request, Response } from 'express';
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

// POST /auth/register
router.post('/register', async (req: Request, res: Response) => {
  const { nombre, apellidos, email, password, phone } = req.body;
  if (!nombre || !email || !password) {
    return res.status(400).json({ message: 'Nombre, email y contraseña son obligatorios.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres.' });
  }

  try {
    const [existing] = await db.select().from(users).where(eq(users.email, email));
    if (existing) {
      return res.status(409).json({ message: 'Ya existe una cuenta con ese email.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const displayName = apellidos ? `${nombre} ${apellidos}`.trim() : nombre;

    const [user] = await db.insert(users).values({
      nombre,
      apellidos: apellidos || '',
      email,
      phone: phone || '',
      displayName,
      passwordHash,
    }).returning();

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: '90d' });
    return res.status(201).json({ data: { token, user } });
  } catch (e: any) {
    console.error('Register error:', e?.message);
    return res.status(500).json({ message: 'Error al crear la cuenta.' });
  }
});

// POST /auth/login
router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email y contraseña son obligatorios.' });
  }

  try {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    if (!user) {
      return res.status(401).json({ message: 'Email o contraseña incorrectos.' });
    }

    const valid = await bcrypt.compare(password, user.passwordHash || '');
    if (!valid) {
      return res.status(401).json({ message: 'Email o contraseña incorrectos.' });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: '90d' });
    return res.json({ data: { token, user } });
  } catch (e: any) {
    console.error('Login error:', e?.message);
    return res.status(500).json({ message: 'Error al iniciar sesion.' });
  }
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
