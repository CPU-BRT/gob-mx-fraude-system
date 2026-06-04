import { NextResponse } from 'next/server';
import { db } from '../../lib/firebase';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

export async function POST() {
  try {
    const CURPS_A_LIMPIAR = [
      'SAMK020907MMCNRRA5',
      'RAHG610121MPLTRR07'
    ];

    const resultados: { curp: string; eliminados: string[]; conservado: string | null }[] = [];

    const querySnapshot = await getDocs(collection(db, 'casos'));

    for (const curp of CURPS_A_LIMPIAR) {
      const documentosRelacionados: { id: string; folio: string; fechaCreacion: string }[] = [];

      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const folio = (data.folio || '').toString().toUpperCase();

        // Buscar documentos que contengan este CURP en el folio
        if (folio.includes(curp)) {
          documentosRelacionados.push({
            id: docSnap.id,
            folio: folio,
            fechaCreacion: data.fechaCreacion || '1970-01-01'
          });
        }
      });

      const eliminados: string[] = [];
      let conservado: string | null = null;

      if (documentosRelacionados.length > 0) {
        // Separar el documento "correcto" (folio exacto) de los "duplicados" (con prefijo DUPLICADO-)
        const correcto = documentosRelacionados.find(d => d.folio === curp);
        const duplicados = documentosRelacionados.filter(d => d.folio !== curp);

        // Eliminar todos los duplicados
        for (const dup of duplicados) {
          await deleteDoc(doc(db, 'casos', dup.id));
          eliminados.push(dup.id);
        }

        if (correcto) {
          conservado = correcto.id;
        }
      }

      resultados.push({
        curp,
        eliminados,
        conservado
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Limpieza completada',
      resultados
    });

  } catch (error) {
    console.error('Error en limpieza:', error);
    return NextResponse.json({
      success: false,
      error: String(error)
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    const CURPS_A_REVISAR = [
      'SAMK020907MMCNRRA5',
      'RAHG610121MPLTRR07'
    ];

    const querySnapshot = await getDocs(collection(db, 'casos'));
    const resultados: { curp: string; documentos: { id: string; folio: string; fechaCreacion: string }[] }[] = [];

    for (const curp of CURPS_A_REVISAR) {
      const documentos: { id: string; folio: string; fechaCreacion: string }[] = [];

      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const folio = (data.folio || '').toString().toUpperCase();

        if (folio.includes(curp)) {
          documentos.push({
            id: docSnap.id,
            folio: folio,
            fechaCreacion: data.fechaCreacion || 'N/A'
          });
        }
      });

      resultados.push({ curp, documentos });
    }

    return NextResponse.json({
      success: true,
      resultados
    });

  } catch (error) {
    console.error('Error en diagnóstico:', error);
    return NextResponse.json({
      success: false,
      error: String(error)
    }, { status: 500 });
  }
}
