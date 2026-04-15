// 🔒 Utilidades de Seguridad

/**
 * Sanitiza strings para prevenir XSS
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') return '';

  return input
    .trim()
    .replace(/[<>]/g, '') // Remover < y > para prevenir tags HTML
    .replace(/javascript:/gi, '') // Remover javascript: urls
    .replace(/on\w+=/gi, '') // Remover event handlers
    .substring(0, 500); // Limitar longitud
}

/**
 * Valida CURP (18 caracteres alfanuméricos)
 */
export function isValidCURP(curp: string): boolean {
  if (typeof curp !== 'string') return false;

  const curpRegex = /^[A-Z0-9]{18}$/;
  return curpRegex.test(curp.trim().toUpperCase());
}

/**
 * Valida FOLIO/CURP (permite folios antiguos y CURPs)
 * - Folios legacy: mínimo 3 caracteres alfanuméricos
 * - CURPs: 18 caracteres alfanuméricos
 */
export function isValidFolioOrCURP(folio: string): boolean {
  if (typeof folio !== 'string') return false;

  const folioNormalizado = folio.trim().toUpperCase();

  // Debe tener entre 3 y 50 caracteres
  if (folioNormalizado.length < 3 || folioNormalizado.length > 50) return false;

  // Solo letras, números y guiones permitidos
  const folioRegex = /^[A-Z0-9\-]{3,50}$/;
  return folioRegex.test(folioNormalizado);
}

/**
 * Valida que un número esté en rango seguro
 */
export function isValidNumber(value: number, min = 0, max = 999999999): boolean {
  if (typeof value !== 'number' || isNaN(value)) return false;
  return value >= min && value <= max;
}

/**
 * Valida email (básico)
 */
export function isValidEmail(email: string): boolean {
  if (typeof email !== 'string') return false;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Valida longitud de campo
 */
export function isValidLength(input: string, min = 1, max = 200): boolean {
  if (typeof input !== 'string') return false;
  const length = input.trim().length;
  return length >= min && length <= max;
}

/**
 * Previene SQL/NoSQL injection
 */
export function sanitizeForDatabase(input: string): string {
  if (typeof input !== 'string') return '';

  return input
    .trim()
    .replace(/['"\\;]/g, '') // Remover comillas y punto y coma
    .replace(/(\$|\{|\})/g, '') // Remover caracteres de MongoDB/NoSQL
    .substring(0, 500);
}

/**
 * Valida que el input no contenga scripts maliciosos
 */
export function containsMaliciousContent(input: string): boolean {
  if (typeof input !== 'string') return false;

  const maliciousPatterns = [
    /<script/gi,
    /javascript:/gi,
    /on\w+=/gi,
    /eval\(/gi,
    /expression\(/gi,
    /<iframe/gi,
    /<object/gi,
    /<embed/gi,
  ];

  return maliciousPatterns.some(pattern => pattern.test(input));
}

/**
 * Rate limiting simple (local)
 */
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(key: string, maxRequests = 10, windowMs = 60000): boolean {
  const now = Date.now();
  const record = requestCounts.get(key);

  if (!record || now > record.resetTime) {
    requestCounts.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= maxRequests) {
    return false; // Rate limit exceeded
  }

  record.count++;
  return true;
}

/**
 * Valida estructura completa de un caso
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function validateCasoData(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validar FOLIO/CURP (permite folios legacy y CURPs)
  if (!data.folio || !isValidFolioOrCURP(data.folio)) {
    errors.push('FOLIO/CURP inválido (debe tener entre 3 y 50 caracteres alfanuméricos)');
  }

  // Validar nombres
  if (!data.nombres || !isValidLength(data.nombres, 1, 100)) {
    errors.push('Nombres inválidos (1-100 caracteres)');
  }

  // Validar apellidos
  if (!data.apellidos || !isValidLength(data.apellidos, 1, 100)) {
    errors.push('Apellidos inválidos (1-100 caracteres)');
  }

  // Validar tipo de fraude
  if (!data.tipoFraude || !isValidLength(data.tipoFraude, 1, 200)) {
    errors.push('Tipo de fraude inválido (1-200 caracteres)');
  }

  // Validar números
  const numericos = ['recuperacion', 'indemnizacion', 'penalizacion', 'totalEntregar', 'pagoPendiente'];
  numericos.forEach(campo => {
    if (data[campo] !== undefined && !isValidNumber(data[campo])) {
      errors.push(`${campo} inválido (debe ser un número entre 0 y 999,999,999)`);
    }
  });

  // Validar contenido malicioso
  const camposTexto = ['nombres', 'apellidos', 'tipoFraude', 'licenciado', 'conceptoPago'];
  camposTexto.forEach(campo => {
    if (data[campo] && containsMaliciousContent(data[campo])) {
      errors.push(`${campo} contiene contenido no permitido`);
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
}
