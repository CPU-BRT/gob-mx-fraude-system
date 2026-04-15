// Utilidad centralizada para manejar casos con Firebase Firestore
import { db } from './firebase';
import { collection, addDoc, getDocs, query, where, doc, updateDoc } from 'firebase/firestore';
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
}

const COLLECTION_NAME = 'casos';

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
        cobros: docData.cobros ? [...docData.cobros] : []
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
        cobros: docData.cobros ? [...docData.cobros] : []
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
