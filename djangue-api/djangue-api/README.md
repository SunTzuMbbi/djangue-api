# Djangue API

Backend de la app Djangue. Node.js + Express + PostgreSQL + Drizzle ORM.

## Despliegue en Railway

### 1. Crear proyecto en Railway
- Ve a railway.app → New Project → Empty Project
- Add Service → GitHub Repo → selecciona `djangue-api`

### 2. Añadir PostgreSQL
- En Railway: Add Service → Database → PostgreSQL
- Railway conecta automáticamente DATABASE_URL

### 3. Variables de entorno en Railway
En tu proyecto Railway → Variables:
```
JWT_SECRET=genera_uno_aleatorio_aqui
NODE_ENV=production
```

### 4. Hacer push del código
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/TU_USUARIO/djangue-api.git
git push -u origin main
```

Railway despliega automáticamente al hacer push.

### 5. Crear las tablas
Una vez desplegado, en Railway → tu servicio → Shell:
```bash
npm run db:push
```

### 6. Actualizar URL en la app
En `services/api.ts` de la app Djangue, cambia:
```
const BASE_URL = 'https://TU-SERVICIO.up.railway.app';
```

## Endpoints principales
- POST /auth/otp/request — solicitar OTP por SMS
- POST /auth/otp/verify — verificar OTP y obtener JWT
- GET /groups — listar tandas
- POST /groups — crear tanda
- POST /groups/:id/join — unirse a tanda
- POST /groups/:id/lottery — ejecutar sorteo
- POST /payments/confirm — confirmar pago
- POST /deposits/pay — pagar fianza
- GET /profile/me — perfil del usuario

## OTP en desarrollo
Sin Twilio configurado, el código OTP aparece en los logs de Railway:
`[DEV OTP] +34612542787 → 123456`
