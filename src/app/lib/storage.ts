import { db } from './firebase';
import { collection, addDoc, getDocs, query, where, doc, updateDoc, type DocumentData } from 'firebase/firestore';
import { sanitizeString, sanitizeForDatabase, validateCasoData } from './security';

export interface Cobro {
  motivoComision: string;
  porcentaje: number;
  montoDeposito: number;
  cuentaDeposito: string;
  nombreBeneficiario: string;
  montoComisionPagar: number;
  fecha: string;
}

// Nueva interfaz para clave de acceso
export interface ClaveAcceso {
  clave: string;
  consecutivo: number;
  fechaCreacion: string;
  expiracion: string;
}

// Concepto adicional opcional
export interface ConceptoAdicional {
  concepto: string;
  monto: number;
}

export interface Caso {
  folio: string;
  cliente: string;
  nombres: string;
  apellidos: string;
  tipoFraude: string;
  licenciado: string;
  recuperacion: number;
  indemnizacion: number;
  penalizacion: number;
  totalEntregar: number;
  pagoPendiente: number;
  conceptoPago: string;
  fechaCreacion: string;
  cobros?: Cobro[]; // Historial de cobros/comisiones
  // Cuenta única de fideicomiso
  numeroCuentaFideicomiso?: string;
  claveInterbancaria?: string;
  institucionBancaria?: string;
  titularCuenta?: string;
  // Conceptos adicionales opcionales
  conceptosAdicionales?: ConceptoAdicional[];
  // Clave de acceso
  claveAcceso?: ClaveAcceso;
}

const COLLECTION_NAME = 'casos';

function reconstruirCaso(docData: DocumentData): Caso {
  return {
    folio: docData.folio || '',
    cliente: docData.cliente || '',
    nombres: docData.nombres || '',
    apellidos: docData.apellidos || '',
    tipoFraude: docData.tipoFraude || '',
    licenciado: docData.licenciado || '',
    recuperacion: docData.recuperacion || 0,
    indemnizacion: docData.indemnizacion || 0,
    penalizacion: docData.penalizacion || 0,
    totalEntregar: docData.totalEntregar || 0,
    pagoPendiente: docData.pagoPendiente || 0,
    conceptoPago: docData.conceptoPago || '',
    fechaCreacion: docData.fechaCreacion || '',
    cobros: docData.cobros ? [...docData.cobros] : [],
    numeroCuentaFideicomiso: docData.numeroCuentaFideicomiso || '',
    claveInterbancaria: docData.claveInterbancaria || '',
    institucionBancaria: docData.institucionBancaria || '',
    titularCuenta: docData.titularCuenta || '',
    conceptosAdicionales: docData.conceptosAdicionales ? [...docData.conceptosAdicionales] : [],
    claveAcceso: docData.claveAcceso ? { ...docData.claveAcceso } : undefined
  };
}

// Generar clave de acceso corta (válida por 6 minutos)
export function generarClaveAcceso(consecutivoActual: number): ClaveAcceso {
  const nuevoConsecutivo = consecutivoActual + 1;
  const ahora = new Date();
  const expiracion = new Date(ahora.getTime() + 15 * 60 * 1000); // 15 minutos

  // Generar clave MUY corta: solo 4 caracteres alfanuméricos
  const caracteres = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Sin caracteres confusos (0,O,1,I)
  let clave = '';
  for (let i = 0; i < 4; i++) {
    clave += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
  }

  return {
    clave: clave,
    consecutivo: nuevoConsecutivo,
    fechaCreacion: ahora.toISOString(),
    expiracion: expiracion.toISOString()
  };
}

// Validar si la clave de acceso es válida (no caducada)
export function validarClaveAcceso(claveAcceso: ClaveAcceso | undefined, claveIngresada: string): { valida: boolean; mensaje: string } {
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

export async function guardarCaso(caso: Caso): Promise<void> {
  try {
    // 🔒 VALIDACIÓN DE SEGURIDAD
    const validacion = validateCasoData(caso);
    if (!validacion.valid) {
      console.error('❌ Validación fallida:', validacion.errors);
      throw new Error(`Datos inválidos: ${validacion.errors.join(', ')}`);
    }

    // 🔒 SANITIZAR DATOS
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

    // 🔍 DEBUG: Verificar que los cobros estén incluidos
    console.log('📝 Guardando caso con cobros:', casoSeguro.cobros);
    console.log('📝 Total de cobros a guardar:', casoSeguro.cobros?.length || 0);

    const docRef = await addDoc(collection(db, COLLECTION_NAME), casoSeguro);
    console.log('✅ Caso guardado en Firebase:', casoSeguro.folio, 'ID:', docRef.id);
    console.log('✅ Cobros guardados:', casoSeguro.cobros?.length || 0);
  } catch (error) {
    console.error('❌ Error al guardar caso en Firebase:', error);
    throw error;
  }
}

// Actualizar clave de acceso de un caso
export async function actualizarClaveAcceso(docId: string, claveAcceso: ClaveAcceso): Promise<boolean> {
  try {
    const docRef = doc(db, 'casos', docId);
    await updateDoc(docRef, { claveAcceso });
    console.log('✅ Clave de acceso actualizada');
    return true;
  } catch (error) {
    console.error('❌ Error al actualizar clave de acceso:', error);
    return false;
  }
}

// Actualizar la misma clave en todos los documentos que tengan el mismo folio/CURP.
// Esto corrige clientes duplicados para que admin y página principal usen la misma clave.
export async function actualizarClaveAccesoPorFolio(folio: string, claveAcceso: ClaveAcceso): Promise<boolean> {
  try {
    const folioNormalizado = folio.trim().toUpperCase();
    const q = query(
      collection(db, COLLECTION_NAME),
      where('folio', '==', folioNormalizado)
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.warn('⚠️ No se encontraron documentos para actualizar clave:', folioNormalizado);
      return false;
    }

    await Promise.all(
      querySnapshot.docs.map((docSnap) =>
        updateDoc(doc(db, COLLECTION_NAME, docSnap.id), { claveAcceso })
      )
    );

    console.log('✅ Clave de acceso actualizada en documentos:', querySnapshot.size);
    return true;
  } catch (error) {
    console.error('❌ Error al actualizar clave por folio:', error);
    return false;
  }
}

// Obtener el último consecutivo usado
export async function obtenerUltimoConsecutivo(): Promise<number> {
  try {
    const casosRef = collection(db, 'casos');
    const querySnapshot = await getDocs(casosRef);

    let maxConsecutivo = 0;
    querySnapshot.forEach((doc) => {
      const caso = doc.data() as Caso;
      if (caso.claveAcceso && caso.claveAcceso.consecutivo > maxConsecutivo) {
        maxConsecutivo = caso.claveAcceso.consecutivo;
      }
    });

    return maxConsecutivo;
  } catch (error) {
    console.error('❌ Error al obtener consecutivo:', error);
    return 0;
  }
}

// Buscar caso por folio Y validar clave de acceso
export async function buscarCasoConClave(folio: string, claveIngresada: string): Promise<{ caso: Caso | null; error: string | null }> {
  try {
    const folioLimpio = folio.trim().toUpperCase();
    const claveNormalizada = claveIngresada.trim().toUpperCase();

    // Validar formato de folio
    if (folioLimpio.length < 3) {
      return { caso: null, error: 'Folio inválido' };
    }

    const q = query(
      collection(db, COLLECTION_NAME),
      where('folio', '==', folioLimpio)
    );
    const querySnapshot = await getDocs(q);
    const casosEncontrados: Caso[] = [];

    querySnapshot.forEach((docSnap) => {
      casosEncontrados.push(reconstruirCaso(docSnap.data()));
    });

    if (casosEncontrados.length === 0) {
      return { caso: null, error: 'No se encontró ningún caso con ese folio' };
    }

    // Si existen duplicados del mismo CURP, usar el documento que tiene la clave ingresada.
    // Esto evita tomar un registro viejo sin clave y mostrar "No existe clave..." por error.
    const casoEncontrado =
      casosEncontrados.find((caso) => caso.claveAcceso?.clave === claveNormalizada) ||
      casosEncontrados.find((caso) => caso.claveAcceso) ||
      casosEncontrados[0];

    console.log('📝 Casos encontrados para folio:', casosEncontrados.length);
    console.log('📝 Caso seleccionado con cobros:', casoEncontrado.cobros?.length || 0);
    console.log('📝 Datos de cobros:', casoEncontrado.cobros);

    // Validar clave de acceso
    const caso: Caso = casoEncontrado;
    const validacion = validarClaveAcceso(caso.claveAcceso, claveNormalizada);

    if (!validacion.valida) {
      return { caso: null, error: validacion.mensaje };
    }

    return { caso: caso, error: null };
  } catch (error) {
    console.error('❌ Error al buscar caso con clave:', error);
    return { caso: null, error: 'Error al buscar el caso' };
  }
}

export async function obtenerTodosCasos(): Promise<Caso[]> {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    const casos: Caso[] = [];
    querySnapshot.forEach((doc) => {
      casos.push(doc.data() as Caso);
    });
    console.log('📦 Total casos en Firebase:', casos.length);
    return casos;
  } catch (error) {
    console.error('❌ Error al obtener casos de Firebase:', error);
    return [];
  }
}

export async function buscarCasoPorFolio(folio: string): Promise<Caso | null> {
  try {
    const folioNormalizado = folio.trim().toUpperCase();
    const q = query(
      collection(db, COLLECTION_NAME),
      where('folio', '==', folioNormalizado)
    );

    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const docData = querySnapshot.docs[0].data();

      // 🔥 CONVERTIR EXPLÍCITAMENTE LOS COBROS
      const caso: Caso = {
        folio: docData.folio || '',
        cliente: docData.cliente || '',
        nombres: docData.nombres || '',
        apellidos: docData.apellidos || '',
        tipoFraude: docData.tipoFraude || '',
        licenciado: docData.licenciado || '',
        recuperacion: docData.recuperacion || 0,
        indemnizacion: docData.indemnizacion || 0,
        penalizacion: docData.penalizacion || 0,
        totalEntregar: docData.totalEntregar || 0,
        pagoPendiente: docData.pagoPendiente || 0,
        conceptoPago: docData.conceptoPago || '',
        fechaCreacion: docData.fechaCreacion || '',
        cobros: docData.cobros ? [...docData.cobros] : [],
        claveAcceso: docData.claveAcceso ? { ...docData.claveAcceso } : undefined
      };

      console.log('✅ Caso encontrado en Firebase:', folioNormalizado);
      console.log('📝 Cobros recuperados:', caso.cobros?.length || 0);
      console.log('📝 Datos de cobros:', caso.cobros);
      console.log('📝 Caso completo reconstruido:', caso);

      return caso;
    }

    console.log('❌ Caso no encontrado en Firebase:', folioNormalizado);
    return null;
  } catch (error) {
    console.error('❌ Error al buscar caso en Firebase:', error);
    return null;
  }
}

export async function buscarCasoPorCliente(nombres: string, apellidos: string): Promise<Caso | null> {
  try {
    const nombresNorm = nombres.trim().toUpperCase();
    const apellidosNorm = apellidos.trim().toUpperCase();

    const casos = await obtenerTodosCasos();

    return casos.find(c =>
      c.nombres.trim().toUpperCase() === nombresNorm &&
      c.apellidos.trim().toUpperCase() === apellidosNorm
    ) || null;
  } catch (error) {
    console.error('❌ Error al buscar cliente en Firebase:', error);
    return null;
  }
}

// Nueva función: actualizar un caso existente
export async function actualizarCaso(casoId: string, casoActualizado: Caso): Promise<void> {
  try {
    // 🔒 VALIDACIÓN DE SEGURIDAD
    const validacion = validateCasoData(casoActualizado);
    if (!validacion.valid) {
      console.error('❌ Validación fallida:', validacion.errors);
      throw new Error(`Datos inválidos: ${validacion.errors.join(', ')}`);
    }

    // 🔒 SANITIZAR DATOS
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

    const casoRef = doc(db, COLLECTION_NAME, casoId);
    await updateDoc(casoRef, { ...casoSeguro });
    console.log('✅ Caso actualizado en Firebase:', casoSeguro.folio, 'ID:', casoId);
  } catch (error) {
    console.error('❌ Error al actualizar caso en Firebase:', error);
    throw error;
  }
}

// Actualizar todos los documentos que comparten el mismo folio/CURP.
// Evita que un duplicado muestre información vieja en la página principal.
export async function actualizarCasoPorFolio(folio: string, casoActualizado: Caso): Promise<number> {
  try {
    // 🔒 VALIDACIÓN DE SEGURIDAD
    const validacion = validateCasoData(casoActualizado);
    if (!validacion.valid) {
      console.error('❌ Validación fallida:', validacion.errors);
      throw new Error(`Datos inválidos: ${validacion.errors.join(', ')}`);
    }

    // 🔒 SANITIZAR DATOS
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
    const q = query(
      collection(db, COLLECTION_NAME),
      where('folio', '==', folioNormalizado)
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.warn('⚠️ No se encontraron documentos para actualizar caso:', folioNormalizado);
      return 0;
    }

    await Promise.all(
      querySnapshot.docs.map((docSnap) =>
        updateDoc(doc(db, COLLECTION_NAME, docSnap.id), { ...casoSeguro })
      )
    );

    console.log('✅ Caso actualizado en documentos:', querySnapshot.size);
    return querySnapshot.size;
  } catch (error) {
    console.error('❌ Error al actualizar caso por folio:', error);
    throw error;
  }
}

// Nueva función: buscar caso por folio y devolver con ID para poder actualizar
export async function buscarCasoPorFolioCompleto(folio: string): Promise<{ id: string; caso: Caso } | null> {
  try {
    const folioNormalizado = folio.trim().toUpperCase();
    const q = query(
      collection(db, COLLECTION_NAME),
      where('folio', '==', folioNormalizado)
    );

    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const docSnap = querySnapshot.docs[0];
      const docData = docSnap.data();

      const caso: Caso = {
        folio: docData.folio || '',
        cliente: docData.cliente || '',
        nombres: docData.nombres || '',
        apellidos: docData.apellidos || '',
        tipoFraude: docData.tipoFraude || '',
        licenciado: docData.licenciado || '',
        recuperacion: docData.recuperacion || 0,
        indemnizacion: docData.indemnizacion || 0,
        penalizacion: docData.penalizacion || 0,
        totalEntregar: docData.totalEntregar || 0,
        pagoPendiente: docData.pagoPendiente || 0,
        conceptoPago: docData.conceptoPago || '',
        fechaCreacion: docData.fechaCreacion || '',
        cobros: docData.cobros ? [...docData.cobros] : [],
        claveAcceso: docData.claveAcceso ? { ...docData.claveAcceso } : undefined
      };

      console.log('✅ Caso encontrado en Firebase:', folioNormalizado, 'ID:', docSnap.id);
      return { id: docSnap.id, caso };
    }

    console.log('❌ Caso no encontrado en Firebase:', folioNormalizado);
    return null;
  } catch (error) {
    console.error('❌ Error al buscar caso en Firebase:', error);
    return null;
  }
}
