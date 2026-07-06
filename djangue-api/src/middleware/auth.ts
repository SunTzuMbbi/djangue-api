import { Request, Response, NextFunction } from 'express';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';

// Inicializar Firebase Admin solo una vez
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId:   process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey:  process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

export interface AuthRequest extends Request {
  userId?: string;
  user?: typeof users.$inferSelect;
  firebaseUid?: string;
}

export const requireAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No autenticado.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verificar token Firebase
    const decoded = await getAuth().verifyIdToken(token);
    req.firebaseUid = decoded.uid;

    // Buscar o crear usuario en nuestra DB por email
    const email = decoded.email || '';
    let [user] = await db.select().from(users).where(eq(users.email, email));

    if (!user) {
      // Primera vez: crear usuario en DB con datos de Firebase
      const nameParts = (decoded.name || '').split(' ');
      const [newUser] = await db.insert(users).values({
        email,
        nombre:      nameParts[0] || '',
        apellidos:   nameParts.slice(1).join(' ') || '',
        displayName: decoded.name || '',
        phone:       '',
        passwordHash: '',
      }).returning();
      user = newUser;
    }

    req.userId = user.id;
    req.user   = user;
    next();
  } catch (err: any) {
    console.error('Auth error:', err?.message);
    return res.status(401).json({ message: 'Token invalido o expirado.' });
  }
};
