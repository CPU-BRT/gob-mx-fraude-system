# 🔥 Configuración de Firebase para Portal Gob MX

## Paso 1: Crear Proyecto en Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Haz clic en **"Agregar proyecto"**
3. Nombre del proyecto: `portal-gob-mx` (o el que prefieras)
4. Desactiva Google Analytics (opcional)
5. Haz clic en **"Crear proyecto"**

## Paso 2: Crear Web App

1. En tu proyecto, haz clic en el ícono **Web** (`</>`)
2. Nombre de la app: `Portal Gob MX`
3. **NO** marques "También configurar Firebase Hosting"
4. Haz clic en **"Registrar app"**
5. **COPIA** las credenciales que aparecen (las necesitarás en el siguiente paso)

## Paso 3: Configurar Firestore Database

1. En el menú lateral, ve a **"Firestore Database"**
2. Haz clic en **"Crear base de datos"**
3. Selecciona **"Comenzar en modo de producción"**
4. Elige la ubicación: **`us-central1`** (o la más cercana)
5. Haz clic en **"Habilitar"**

## Paso 4: Configurar Reglas de Seguridad

1. Ve a la pestaña **"Reglas"** en Firestore
2. Reemplaza las reglas con esto:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /casos/{document=**} {
      allow read, write: if true;
    }
  }
}
```

3. Haz clic en **"Publicar"**

 **NOTA:** Estas reglas permiten acceso total. Para producción, deberías implementar autenticación y reglas más estrictas.

## Paso 5: Configurar Variables de Entorno en Netlify

1. Ve a tu sitio en Netlify
2. **Site settings** → **Environment variables**
3. Agrega las siguientes variables con los valores de tu proyecto Firebase:

```
NEXT_PUBLIC_FIREBASE_API_KEY=tu-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu-proyecto-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

4. Haz clic en **"Save"**
5. Ve a **Deploys** y haz clic en **"Trigger deploy"** → **"Clear cache and deploy site"**

## ✅ ¡Listo!

Tu sitio ahora guarda los casos en Firebase. Los folios funcionarán en producción.

