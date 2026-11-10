# Migración a Vercel — MARCA ACME

## Cuenta destino (nueva)

| Campo | Valor |
|--------|--------|
| Correo | `medinamamama5@gmail.com` |
| Usuario Vercel | `medinamamama5-8864` |
| Equipo | **MARCA ACME** (Pro Trial) |
| Nombre del proyecto | `portal-gob-mx` (recomendado, igual que antes) |

## Cuenta anterior (dejar de usar)

| Campo | Valor |
|--------|--------|
| Correo | `luisak316@gmail.com` |
| Usuario | `luisak316-5416` |

## Qué no cambia

- **Firebase** sigue en proyecto `portal-gob-mx` (misma base de datos de clientes).
- **GitHub** puede seguir siendo el mismo repo; solo cambia quién despliega en Vercel.
- **URLs objetivo** (después de configurar dominio):
  - `https://portal-gob-mx.vercel.app` (si la liberas en la cuenta vieja y la asignas en la nueva)
  - O la URL que Vercel asigne: `https://portal-gob-mx-*.vercel.app`

---

## Checklist de migración

### Fase 1 — En tu PC (código listo)

- [x] Memoria del proyecto actualizada
- [x] `.env.example` con variables necesarias
- [ ] Commitear y subir últimos cambios a GitHub (seguridad + leyenda, etc.)
- [ ] Cerrar sesión Vercel vieja e iniciar con cuenta nueva

```powershell
cd "C:\Users\Gothics\Portal Gob MX\gob-mx-fraude-system-git"
npx vercel logout
npx vercel login
npx vercel whoami
# Debe responder: medinamamama5-8864
```

### Fase 2 — Vincular proyecto en MARCA ACME

```powershell
# Quitar vínculo con cuenta vieja
Remove-Item -Recurse -Force .vercel -ErrorAction SilentlyContinue

# Enlazar: elegir equipo MARCA ACME y crear/importar proyecto portal-gob-mx
npx vercel link
npx vercel deploy --prod --yes
```

En el asistente de `vercel link`:

1. Scope: **MARCA ACME**
2. Link to existing project → **No** (primera vez en esta cuenta) o **Sí** si ya lo creaste en el dashboard
3. Nombre: `portal-gob-mx`
4. Directorio: `./`

### Fase 3 — Variables de entorno en Vercel (obligatorio)

En **Vercel → MARCA ACME → portal-gob-mx → Settings → Environment Variables**, agregar para **Production, Preview, Development**:

| Variable | Notas |
|----------|--------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Valor en tu `.env.local` o respaldo USB |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `portal-gob-mx.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `portal-gob-mx` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `portal-gob-mx.firebasestorage.app` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Del respaldo / Firebase Console |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Del respaldo / Firebase Console |
| `ADMIN_PASSWORD` | La misma que usabas en la cuenta vieja (o una nueva fuerte) |

**Importante:** Copia `ADMIN_PASSWORD` de la cuenta Vercel anterior antes de darla de baja (Dashboard → Environment Variables).

Después de guardar variables, **Redeploy** en producción.

### Fase 4 — Firebase (para que el sitio siga funcionando)

En [Firebase Console](https://console.firebase.google.com) → proyecto **portal-gob-mx**:

1. **Authentication → Settings → Authorized domains**  
   Agregar el dominio nuevo de Vercel (ej. `portal-gob-mx.vercel.app` o el que te asigne MARCA ACME).

2. **Firestore** — No migrar datos; ya están en la nube.

3. Si usas reglas en `firestore.rules`, desplegarlas cuando tengas Firebase CLI:

   ```powershell
   firebase deploy --only firestore:rules --project portal-gob-mx
   ```

### Fase 5 — Dominio `portal-gob-mx.vercel.app`

Ese subdominio puede estar **bloqueado** mientras exista en la cuenta `luisak316`:

1. En cuenta vieja: eliminar el proyecto o quitar el alias de producción.
2. En **MARCA ACME**: Settings → Domains → agregar `portal-gob-mx.vercel.app`.

Si no puedes liberarlo, usa la URL nueva de MARCA ACME y actualiza enlaces al público.

### Fase 6 — Pruebas finales

- [ ] Página principal carga e imágenes se ven
- [ ] Búsqueda CURP + clave funciona
- [ ] `/admin` pide HTTP Basic (`ADMIN_PASSWORD`)
- [ ] Login Firebase Auth en admin
- [ ] Crear/editar cliente y clave coincide en página pública

---

## Páginas del sistema

| Ruta | Función |
|------|---------|
| `/` | Consulta pública (CURP + clave) |
| `/admin` | Administración de casos |

---

## Repos GitHub (referencia)

| Uso | Repositorio |
|-----|-------------|
| Código local principal | `https://github.com/CPU-BRT/gob-mx-fraude-system` |
| Histórico vinculado a Vercel viejo | `https://github.com/luisak316-debug/-sistema-de-fraude-gob-mx` |

Recomendación: en MARCA ACME conectar **el repo que realmente actualizas** (`CPU-BRT/gob-mx-fraude-system`) o seguir desplegando solo con CLI desde esta carpeta.

---

## Respaldo en USB

Si algo falla: `G:\RESPALDO PORTAL GOB\` → `RESTAURAR_PROYECTO.md`
