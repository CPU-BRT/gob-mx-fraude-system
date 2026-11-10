import type { Caso, ClaveAcceso } from './caso-model';

export function reconstruirCaso(docData: Record<string, unknown>): Caso {
  const cobros = docData.cobros;
  const conceptosAdicionales = docData.conceptosAdicionales;
  const claveAcceso = docData.claveAcceso;

  return {
    folio: (docData.folio as string) || '',
    cliente: (docData.cliente as string) || '',
    nombres: (docData.nombres as string) || '',
    apellidos: (docData.apellidos as string) || '',
    tipoFraude: (docData.tipoFraude as string) || '',
    licenciado: (docData.licenciado as string) || '',
    recuperacion: (docData.recuperacion as number) || 0,
    indemnizacion: (docData.indemnizacion as number) || 0,
    penalizacion: (docData.penalizacion as number) || 0,
    totalEntregar: (docData.totalEntregar as number) || 0,
    pagoPendiente: (docData.pagoPendiente as number) || 0,
    conceptoPago: (docData.conceptoPago as string) || '',
    fechaCreacion: (docData.fechaCreacion as string) || '',
    cobros: Array.isArray(cobros) ? [...cobros] : [],
    numeroCuentaFideicomiso: (docData.numeroCuentaFideicomiso as string) || '',
    claveInterbancaria: (docData.claveInterbancaria as string) || '',
    institucionBancaria: (docData.institucionBancaria as string) || '',
    titularCuenta: (docData.titularCuenta as string) || '',
    conceptosAdicionales: Array.isArray(conceptosAdicionales)
      ? [...conceptosAdicionales]
      : [],
    claveAcceso:
      claveAcceso && typeof claveAcceso === 'object'
        ? { ...(claveAcceso as ClaveAcceso) }
        : undefined,
  };
}

export function generarClaveAcceso(consecutivoActual: number): ClaveAcceso {
  const nuevoConsecutivo = consecutivoActual + 1;
  const ahora = new Date();
  const expiracion = new Date(ahora.getTime() + 15 * 60 * 1000);
  const caracteres = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let clave = '';
  for (let i = 0; i < 4; i++) {
    clave += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
  }
  return {
    clave,
    consecutivo: nuevoConsecutivo,
    fechaCreacion: ahora.toISOString(),
    expiracion: expiracion.toISOString(),
  };
}

export function validarClaveAcceso(
  claveAcceso: ClaveAcceso | undefined,
  claveIngresada: string
): { valida: boolean; mensaje: string } {
  const claveNormalizada = claveIngresada.trim().toUpperCase();
  if (!claveAcceso) {
    return { valida: false, mensaje: 'No existe clave de acceso para este folio' };
  }
  if (claveAcceso.clave !== claveNormalizada) {
    return { valida: false, mensaje: 'Clave de acceso incorrecta' };
  }
  const ahora = new Date();
  const expiracion = new Date(claveAcceso.expiracion);
  if (ahora > expiracion) {
    return { valida: false, mensaje: 'Clave de acceso caducada' };
  }
  return { valida: true, mensaje: 'Clave válida' };
}
