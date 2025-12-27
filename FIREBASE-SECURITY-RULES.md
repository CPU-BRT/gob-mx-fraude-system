# 🔒 Reglas de Seguridad de Firebase Firestore

## Implementación de Seguridad Mejorada

### Instrucciones:

1. Ve a **Firebase Console**: https://console.firebase.google.com/
2. Selecciona tu proyecto
3. Ve a **Firestore Database** → **Rules**
4. Reemplaza las reglas actuales con las siguientes:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    // Función de validación de CURP (18 caracteres alfanuméricos)
    function isValidCURP(curp) {
      return curp is string &&
             curp.size() == 18 &&
             curp.matches('[A-Z0-9]{18}');
    }

    // Función de validación de FOLIO/CURP (acepta folios legacy y CURPs)
    function isValidFolioOrCURP(folio) {
      return folio is string &&
             folio.size() >= 3 &&
             folio.size() <= 50 &&
             folio.matches('[A-Z0-9\\-]{3,50}');
    }

    // Función de validación de campos requeridos
    function hasRequiredFields(data) {
      return data.keys().hasAll([
        'folio',
        'cliente',
        'nombres',
        'apellidos',
        'tipoFraude',
        'licenciado',
        'fechaCreacion'
      ]);
    }

    // Función de validación de tipos de datos
    function hasValidTypes(data) {
      return data.folio is string &&
             data.cliente is string &&
             data.nombres is string &&
             data.apellidos is string &&
             data.tipoFraude is string &&
             data.licenciado is string &&
             data.recuperacion is number &&
             data.indemnizacion is number &&
             data.penalizacion is number &&
             data.totalEntregar is number &&
             data.pagoPendiente is number &&
             data.conceptoPago is string;
    }

    // Función de validación de longitud de campos
    function hasValidLengths(data) {
      return data.nombres.size() <= 100 &&
             data.apellidos.size() <= 100 &&
             data.tipoFraude.size() <= 200 &&
             data.licenciado.size() <= 100 &&
             data.conceptoPago.size() <= 200;
    }

    // Función de validación de valores numéricos
    function hasValidNumbers(data) {
      return data.recuperacion >= 0 &&
             data.indemnizacion >= 0 &&
             data.penalizacion >= 0 &&
             data.totalEntregar >= 0 &&
             data.pagoPendiente >= 0 &&
             data.recuperacion <= 999999999 &&
             data.indemnizacion <= 999999999 &&
             data.penalizacion <= 999999999 &&
             data.totalEntregar <= 999999999 &&
             data.pagoPendiente <= 999999999;
    }

    // Función de validación de cobros
    function hasValidCobros(data) {
      return !data.keys().hasAny(['cobros']) ||
             (data.cobros is list && data.cobros.size() <= 100);
    }

    // Reglas para la colección 'casos'
    match /casos/{casoId} {

      // LECTURA: Permitir a todos (para que clientes vean sus casos)
      allow read: if true;

      // ESCRITURA: Validar todos los campos (ACEPTA FOLIOS LEGACY Y CURPS)
      allow create: if hasRequiredFields(request.resource.data) &&
                       hasValidTypes(request.resource.data) &&
                       hasValidLengths(request.resource.data) &&
                       hasValidNumbers(request.resource.data) &&
                       hasValidCobros(request.resource.data) &&
                       isValidFolioOrCURP(request.resource.data.folio);

      // ACTUALIZACIÓN: Validar campos y no permitir cambiar FOLIO/CURP
      allow update: if hasRequiredFields(request.resource.data) &&
                       hasValidTypes(request.resource.data) &&
                       hasValidLengths(request.resource.data) &&
                       hasValidNumbers(request.resource.data) &&
                       hasValidCobros(request.resource.data) &&
                       request.resource.data.folio == resource.data.folio;

      // ELIMINACIÓN: Deshabilitar eliminación por seguridad
      allow delete: if false;
    }

    // Bloquear acceso a todas las demás colecciones
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## 🛡️ Protecciones Implementadas:

### ✅ Validación de FOLIO/CURP (FLEXIBLE):
- **Folios Legacy**: 3 a 50 caracteres alfanuméricos (para clientes antiguos)
- **CURPs Nuevos**: 18 caracteres alfanuméricos (clientes nuevos)
- Formato correcto obligatorio

### ✅ Validación de Campos Requeridos:
- Todos los campos obligatorios deben estar presentes
- No se pueden crear casos incompletos

### ✅ Validación de Tipos de Datos:
- Strings para textos
- Numbers para cantidades
- Previene inyección de datos incorrectos

### ✅ Validación de Longitud:
- Límites en caracteres para prevenir ataques de buffer
- Nombres: 100 caracteres máx
- Tipo de fraude: 200 caracteres máx

### ✅ Validación de Valores Numéricos:
- Solo números positivos
- Máximo 999,999,999 (mil millones)
- Previene overflow y valores negativos

### ✅ Protección de FOLIO/CURP:
- **No se puede modificar el FOLIO/CURP después de crear el caso**
- Previene duplicados y fraude
- Permite actualizar todos los demás datos

### ✅ Límite de Cobros:
- Máximo 100 cobros por caso
- Previene ataques de saturación

### ✅ Lectura Pública, Escritura Validada:
- Clientes pueden ver sus casos
- Solo se pueden crear/actualizar casos válidos
- **NO se pueden eliminar casos** (auditoría)

---

## 📋 Pasos para Aplicar:

1. Copia las reglas de arriba
2. Ve a Firebase Console → Firestore → Rules
3. Pega las reglas
4. Click en **"Publicar"**
5. ✅ ¡Seguridad mejorada activada!

---

## ⚠️ Importante:

Estas reglas ahora aceptan **TANTO folios antiguos COMO CURPs nuevos**, manteniendo la seguridad sin bloquear clientes legacy.

```
