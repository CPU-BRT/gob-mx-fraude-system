import type { Caso, ClaveAcceso } from './caso-model';

async function adminPost<T>(body: Record<string, unknown>): Promise<T> {
  const response = await fetch('/api/admin/casos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error ?? 'Error en operación admin');
  }
  return data as T;
}

export async function guardarCaso(caso: Caso): Promise<void> {
  await adminPost({ action: 'guardar', caso });
}

export async function buscarCasoPorFolioCompleto(
  folio: string
): Promise<{ id: string; caso: Caso } | null> {
  const data = await adminPost<{ resultado: { id: string; caso: Caso } | null }>({
    action: 'buscar-folio-completo',
    folio,
  });
  return data.resultado;
}

export async function actualizarCasoPorFolio(
  folio: string,
  casoActualizado: Caso
): Promise<number> {
  const data = await adminPost<{ count: number }>({
    action: 'actualizar-por-folio',
    folio,
    caso: casoActualizado,
  });
  return data.count ?? 0;
}

export async function actualizarClaveAccesoPorFolio(
  folio: string,
  claveAcceso: ClaveAcceso
): Promise<boolean> {
  const data = await adminPost<{ ok: boolean }>({
    action: 'actualizar-clave-por-folio',
    folio,
    claveAcceso,
  });
  return data.ok;
}

export async function obtenerUltimoConsecutivo(): Promise<number> {
  const data = await adminPost<{ valor: number }>({ action: 'ultimo-consecutivo' });
  return data.valor;
}
