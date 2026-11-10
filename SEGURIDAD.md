# Seguridad del Portal Gob MX

## Medidas activas en el código

1. **Admin protegido** con usuario/contraseña HTTP Basic (`Admin` + `ADMIN_PASSWORD`).
2. **Sesión httpOnly** para llamadas `/api/admin/*` (cookie firmada).
3. **Firestore cerrado al público**: reglas bloquean lectura/escritura directa desde el navegador.
4. **Consulta pública** solo vía `/api/caso/consulta` con CURP + clave válida.
5. **Admin** solo vía `/api/admin/casos` con credenciales.
6. **Cabeceras HTTP** de seguridad en `next.config.js`.
7. **Admin no indexable** en buscadores (`robots: noindex`).

## Configuración obligatoria en Vercel

### 1. Service account de Firebase (crítico)

1. Firebase Console → ⚙️ Project Settings → **Service accounts**.
2. **Generate new private key** (JSON).
3. En Vercel → MARCA ACME → `portal-gob-mx` → Environment Variables.
4. Crear variable **`FIREBASE_SERVICE_ACCOUNT_JSON_B64`** (recomendado): JSON del service account codificado en Base64, o en su defecto **`FIREBASE_SERVICE_ACCOUNT_JSON`** en una sola línea.
5. Aplicar a Production, Preview y Development.
6. **Redeploy**.

Sin esto, la consulta pública y el admin no podrán leer/escribir Firestore.

### 2. Reglas de Firestore

Después de configurar el service account, publicar reglas:

```powershell
firebase deploy --only firestore:rules --project portal-gob-mx
```

Archivo: `firestore.rules` (deniega acceso directo desde clientes).

### 3. Contraseña admin

- Cambia `ADMIN_PASSWORD` si usas una débil.
- No compartas `Corp1997` públicamente; actualízala en Vercel.

### 4. Firebase Authorized domains

En Authentication → Settings → Authorized domains, incluir:

- `portal-gob-mx-tramites.vercel.app`

## Riesgos que siguen si no se hace lo anterior

- Con reglas antiguas abiertas, cualquiera con la API key del navegador podría leer todos los casos.
- Contraseña admin débil = fuerza bruta posible (usa contraseña larga).

## Respaldo

Copia de seguridad en USB: `G:\RESPALDO PORTAL GOB\`
