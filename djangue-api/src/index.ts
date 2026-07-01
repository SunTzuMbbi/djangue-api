import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

import authRouter from './routes/auth';
import groupsRouter from './routes/groups';
import {
  paymentsRouter,
  depositsRouter,
  disputesRouter,
  profileRouter,
  notificationsRouter,
} from './routes/misc';

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/', (_req, res) => {
  res.json({
    service: 'Djangue API',
    version: '1.0.0',
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// ─── Rutas ────────────────────────────────────────────────────────────────────
app.use('/auth', authRouter);
app.use('/groups', groupsRouter);
app.use('/payments', paymentsRouter);
app.use('/deposits', depositsRouter);
app.use('/disputes', disputesRouter);
app.use('/profile', profileRouter);
app.use('/notifications', notificationsRouter);

// ─── Error handler ────────────────────────────────────────────────────────────
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ message: 'Error interno del servidor.' });
});

app.listen(PORT, () => {
  console.log(`Djangue API corriendo en puerto ${PORT}`);
});

export default app;
