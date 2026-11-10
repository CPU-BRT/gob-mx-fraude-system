import type { Caso, ClaveAcceso } from '@/app/lib/caso-model';
import { reconstruirCaso, validarClaveAcceso } from '@/app/lib/caso-utils';
import { sanitizeForDatabase, sanitizeString, validateCasoData } from '@/app/lib/security';
import { getCasosCollection } from '@/lib/firebase-admin';

const COLLECTION = 'casos';

export async function buscarCasoConClaveAdmin(
  folio: string,
  claveIngresada: string
): Promise<{ caso: Caso | null; error: string | null }> {
  const folioLimpio = folio.trim().toUpperCase();
  const claveNormalizada = claveIngresada.trim().toUpperCase();

  if (folioLimpio.length < 3) {
    return { caso: null, error: 'Folio inválido' };
  }

  const querySnapshot = await getCasosCollection()
    .where('folio', '==', folioLimpio)
    .get();

  const casosEncontrados: Caso[] = querySnapshot.docs.map((docSnap) =>
    reconstruirCaso(docSnap.data() as Record<string, unknown>)
  );

  if (casosEncontrados.length === 0) {
    return { caso: null, error: 'No se encontró ningún caso con ese folio' };
  }

  const casoEncontrado =
    casosEncontrados.find((caso) => caso.claveAcceso?.clave === claveNormalizada) ||
    casosEncontrados.find((caso) => caso.claveAcceso) ||
    casosEncontrados[0];

  const validacion = validarClaveAcceso(casoEncontrado.claveAcceso, claveNormalizada);
  if (!validacion.valida) {
    return { caso: null, error: validacion.mensaje };
  }

  return { caso: casoEncontrado, error: null };
}

export async function buscarCasoPorFolioCompletoAdmin(
  folio: string
): Promise<{ id: string; caso: Caso } | null> {
  const folioNormalizado = folio.trim().toUpperCase();
  const querySnapshot = await getCasosCollection()
    .where('folio', '==', folioNormalizado)
    .get();

  if (querySnapshot.empty) return null;

  const docSnap = querySnapshot.docs[0];
  return { id: docSnap.id, caso: reconstruirCaso(docSnap.data()) };
}

export async function guardarCasoAdmin(caso: Caso): Promise<void> {
  const validacion = validateCasoData(caso);
  if (!validacion.valid) {
    throw new Error(`Datos inválidos: ${validacion.errors.join(', ')}`);
  }

  const casoSeguro: Caso = {
    ...caso,
    folio: sanitizeForDatabase(caso.folio.toUpperCase()),
    cliente: sanitizeString(caso.cliente),
    nombres: sanitizeString(caso.nombres),
    apellidos: sanitizeString(caso.apellidos),
    tipoFraude: sanitizeString(caso.tipoFraude),
    licenciado: sanitizeString(caso.licenciado),
    conceptoPago: sanitizeString(caso.conceptoPago),
  };

  await getCasosCollection().add(casoSeguro);
}

export async function actualizarCasoPorFolioAdmin(
  folio: string,
  casoActualizado: Caso
): Promise<number> {
  const validacion = validateCasoData(casoActualizado);
  if (!validacion.valid) {
    throw new Error(`Datos inválidos: ${validacion.errors.join(', ')}`);
  }

  const casoSeguro: Caso = {
    ...casoActualizado,
    folio: sanitizeForDatabase(casoActualizado.folio.toUpperCase()),
    cliente: sanitizeString(casoActualizado.cliente),
    nombres: sanitizeString(casoActualizado.nombres),
    apellidos: sanitizeString(casoActualizado.apellidos),
    tipoFraude: sanitizeString(casoActualizado.tipoFraude),
    licenciado: sanitizeString(casoActualizado.licenciado),
    conceptoPago: sanitizeString(casoActualizado.conceptoPago),
  };

  const folioNormalizado = folio.trim().toUpperCase();
  const querySnapshot = await getCasosCollection()
    .where('folio', '==', folioNormalizado)
    .get();

  if (querySnapshot.empty) return 0;

  await Promise.all(
    querySnapshot.docs.map((docSnap) => docSnap.ref.update({ ...casoSeguro }))
  );

  return querySnapshot.size;
}

export async function actualizarClaveAccesoPorFolioAdmin(
  folio: string,
  claveAcceso: ClaveAcceso
): Promise<boolean> {
  const folioNormalizado = folio.trim().toUpperCase();
  const querySnapshot = await getCasosCollection()
    .where('folio', '==', folioNormalizado)
    .get();

  if (querySnapshot.empty) return false;

  await Promise.all(
    querySnapshot.docs.map((docSnap) => docSnap.ref.update({ claveAcceso }))
  );

  return true;
}

export async function obtenerUltimoConsecutivoAdmin(): Promise<number> {
  const querySnapshot = await getCasosCollection().get();
  let maxConsecutivo = 0;

  querySnapshot.forEach((docSnap) => {
    const caso = docSnap.data() as Caso;
    if (caso.claveAcceso && caso.claveAcceso.consecutivo > maxConsecutivo) {
      maxConsecutivo = caso.claveAcceso.consecutivo;
    }
  });

  return maxConsecutivo;
}
