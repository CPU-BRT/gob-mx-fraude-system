import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { COOKIE_NAME, isValidAdminSession } from '@/lib/admin-session';
import { validBasicAuth } from '@/lib/verify-admin-basic';
import {
  actualizarClaveAccesoPorFolioAdmin,
  actualizarCasoPorFolioAdmin,
  buscarCasoPorFolioCompletoAdmin,
  guardarCasoAdmin,
  obtenerUltimoConsecutivoAdmin,
} from '@/server/caso-firestore-admin';
import type { Caso, ClaveAcceso } from '@/app/lib/caso-model';

async function isAdminRequest(request: NextRequest): Promise<boolean> {
  const expectedUser = process.env.ADMIN_USERNAME ?? 'Admin';
  const expectedPassword = process.env.ADMIN_PASSWORD;
  if (!expectedPassword) return false;

  const authHeader = request.headers.get('authorization');
  if (validBasicAuth(authHeader, expectedUser, expectedPassword)) {
    return true;
  }

  const cookieStore = await cookies();
  const session = cookieStore.get(COOKIE_NAME)?.value;
  return isValidAdminSession(session, expectedUser, expectedPassword);
}

export async function POST(request: NextRequest) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const body = (await request.json()) as {
      action: string;
      folio?: string;
      caso?: Caso;
      claveAcceso?: ClaveAcceso;
    };

    switch (body.action) {
      case 'buscar-folio-completo': {
        if (!body.folio) {
          return NextResponse.json({ error: 'Folio requerido' }, { status: 400 });
        }
        const resultado = await buscarCasoPorFolioCompletoAdmin(body.folio);
        return NextResponse.json({ resultado });
      }
      case 'guardar': {
        if (!body.caso) {
          return NextResponse.json({ error: 'Caso requerido' }, { status: 400 });
        }
        await guardarCasoAdmin(body.caso);
        return NextResponse.json({ ok: true });
      }
      case 'actualizar-por-folio': {
        if (!body.folio || !body.caso) {
          return NextResponse.json({ error: 'Folio y caso requeridos' }, { status: 400 });
        }
        const count = await actualizarCasoPorFolioAdmin(body.folio, body.caso);
        return NextResponse.json({ ok: true, count });
      }
      case 'actualizar-clave-por-folio': {
        if (!body.folio || !body.claveAcceso) {
          return NextResponse.json({ error: 'Folio y clave requeridos' }, { status: 400 });
        }
        const ok = await actualizarClaveAccesoPorFolioAdmin(body.folio, body.claveAcceso);
        return NextResponse.json({ ok });
      }
      case 'ultimo-consecutivo': {
        const valor = await obtenerUltimoConsecutivoAdmin();
        return NextResponse.json({ valor });
      }
      default:
        return NextResponse.json({ error: 'Acción no válida' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error admin casos:', error);
    const message = error instanceof Error ? error.message : 'Error interno';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
