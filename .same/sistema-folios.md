# Sistema de Folios para Casos de Fraude

## 📋 Resumen

Sistema de administración de folios para casos de fraude donde los **ASESORES** registran casos de **VÍCTIMAS/CLIENTES** que han sufrido algún tipo de fraude.

## 🔑 Formato del Folio

**Formato:** `LETRA-LETRA LETRA LETRA NÚMERO NÚMERO LETRA LETRA`

**Ejemplo:** `D-PÑA09SA`

**Total:** 9 caracteres (incluyendo el guión)

**Características:**
- Se genera **automáticamente** al cargar la página de administración
- Es **ÚNICO** - no puede repetirse
- Incluye la letra **Ñ** en el alfabeto

## 🚀 Cómo Funciona

### PASO 1: Acceso a Administración
- URL: `/admin`
- Al cargar, se genera automáticamente un folio único
- El folio aparece visible en la parte superior del formulario

### PASO 2: Registro de Caso
El asesor llena el formulario con:
- **NOMBRES** (Requerido)
- **APELLIDOS** (Requerido)
- **TIPO DE FRAUDE** (Requerido)
- **LICENCIADO** (Requerido)
- **RECUPERACIÓN ($)** (Requerido)
- **INDEMNIZACIÓN ($)** (Requerido)
- **PENALIZACIÓN ($)** (Requerido)
- **TOTAL A ENTREGAR ($)** (Requerido)
- **PAGO PENDIENTE ($)** (Requerido)
- **CONCEPTO DE PAGO** (Requerido)

### PASO 3: Validación
- El sistema valida que el cliente (nombres + apellidos) **NO** esté duplicado
- Si existe, se muestra un modal con el folio y licenciado del caso existente
- **NO** se permite registrar el mismo cliente dos veces

### PASO 4: Guardar
- El caso se guarda con el folio único generado
- Se almacena en **localStorage** (respaldo local)
- Se intenta guardar en **API** del servidor (`/api/casos`)
- Si falla la API, funciona con localStorage (modo offline)
- Se muestra un mensaje de éxito con el folio (copiable)
- El formulario se limpia automáticamente
- Se genera un nuevo folio para el siguiente caso

### PASO 5: Consulta del Cliente
- El asesor **proporciona el folio al cliente**
- El cliente ingresa el folio en el **buscador blanco** de la página principal
- El sistema busca primero en la API, luego en localStorage
- Se muestran todos los datos del caso

## 🔍 Buscador Principal

**El cliente NO debe crear una cuenta ni ir a otra sección**

Simplemente:
1. Ingresa a la página principal
2. Escribe su folio en el buscador blanco grande
3. Presiona Enter o hace clic en el ícono de búsqueda
4. Ve toda la información de su caso

## 💾 Almacenamiento

**Dual Storage:**
- **localStorage**: Respaldo local en el navegador
- **API**: `/api/casos` (POST para guardar, GET para consultar)
- Si la API no está disponible, funciona con localStorage

## ✅ Características Clave

1. **Folios únicos**: Verificación antes de asignar
2. **Sin duplicados**: Un cliente = Un caso
3. **Generación automática**: El asesor no ingresa el folio
4. **Búsqueda case-insensitive**: No importa mayúsculas/minúsculas
5. **Formato de moneda**: Separadores de miles y símbolo $
6. **Modo offline**: Funciona sin conexión a internet
7. **Copiable**: El folio se puede copiar con un clic

## 📱 Páginas del Sistema

### Página Principal (`/`)
- Buscador blanco para consulta de folios
- Muestra resultados del caso cuando se encuentra el folio
- Incluye toda la información del caso

### Página de Administración (`/admin`)
- Formulario de registro de casos
- Generación automática de folios
- Validación de duplicados
- Mensajes de éxito/error
- Modal de cliente duplicado

## 🎯 Flujo Completo

```
ASESOR → Accede a /admin
       → Ve folio generado automáticamente (Ej: D-PÑA09SA)
       → Llena formulario con datos del cliente
       → Sistema valida que cliente no esté duplicado
       → Guarda caso (localStorage + API)
       → Recibe confirmación con folio
       → Proporciona folio al cliente

CLIENTE → Ingresa a página principal
        → Escribe folio en buscador blanco
        → Presiona Enter
        → Ve toda la información de su caso
```

## 🔐 Reglas de Negocio

1. Un cliente = Un caso (no duplicados)
2. Cada caso tiene un folio único
3. El folio se genera automáticamente
4. Todos los campos son obligatorios
5. Formato de nombre: "NOMBRES: X APELLIDOS: Y"
6. Fecha de creación automática
7. Limpieza automática del formulario después de guardar
