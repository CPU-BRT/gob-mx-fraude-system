import { NextRequest, NextResponse } from 'next/server';
import { buscarCasoConClaveAdmin } from '@/server/caso-firestore-admin';

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { folio?: string; clave?: string };
    const folio = body.folio ?? '';
    const clave = body.clave ?? '';

    if (!folio.trim() || !clave.trim()) {
      return NextResponse.json(
        { caso: null, error: 'CURP y clave son obligatorios' },
        { status: 400 }
      );
    }

    const resultado = await buscarCasoConClaveAdmin(folio, clave);
    return NextResponse.json(resultado);
  } catch (error) {
    console.error('Error consulta caso:', error);
  return NextResponse.json(
      { caso: null, error: 'Servicio no disponible. Verifica configuración del servidor.' },
      { status: 503 }
    );
  }
}
