# Memoria Del Proyecto

## Producción (objetivo tras migración)

- Proyecto Vercel: `portal-gob-mx`
- Equipo Vercel: **MARCA ACME**
- Cuenta Vercel: `medinamamama5-8864`
- Correo Vercel: `medinamamama5@gmail.com`
- URL pública (activa): `https://portal-gob-mx-tramites.vercel.app`
- URL admin (activa): `https://portal-gob-mx-tramites.vercel.app/admin`
- URL antigua (bloqueada 451): `https://portal-gob-mx.vercel.app` — pendiente liberar dominio

## Cuenta Vercel anterior (no usar)

- `luisak316-5416` / `luisak316@gmail.com`

## Regla antes de desplegar

1. Confirmar cuenta:

   ```powershell
   npx vercel whoami
   ```

2. Debe responder: `medinamamama5-8864`

3. Desplegar en equipo **MARCA ACME**:

   ```powershell
   npx vercel deploy --prod --yes
   ```

4. Guía completa: ver `MIGRACION_VERCEL_MARCA_ACME.md`

## Firebase (sin cambio de proyecto)

- Proyecto: `portal-gob-mx`
- Variables: ver `.env.example` y `.env.local`

## Seguridad

- Variables en Vercel: 6 × `NEXT_PUBLIC_FIREBASE_*` + `ADMIN_PASSWORD`
- Firebase Auth en `/admin` (layout)
- HTTP Basic en `/admin` (middleware)
- Reglas: `firestore.rules`

## Carpeta local de trabajo

`C:\Users\Gothics\Portal Gob MX\gob-mx-fraude-system-git`
