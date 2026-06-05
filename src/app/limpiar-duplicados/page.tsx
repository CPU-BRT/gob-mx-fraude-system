'use client';

import { useState, useEffect } from 'react';
import { buscarDocumentosPorCurp, eliminarCaso, Caso } from '../lib/storage';

interface DocumentoEncontrado {
  id: string;
  caso: Caso;
}

export default function LimpiarDuplicados() {
  const [curpsABuscar] = useState<string[]>([
    'SAMK020907MMCNRRA5',
    'RAHG610121MPLTRR07'
  ]);
  const [resultados, setResultados] = useState<{ curp: string; documentos: DocumentoEncontrado[] }[]>([]);
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [eliminando, setEliminando] = useState<string | null>(null);

  const buscarDuplicados = async () => {
    setCargando(true);
    setMensaje('Buscando documentos...');

    const nuevosResultados: { curp: string; documentos: DocumentoEncontrado[] }[] = [];

    for (const curp of curpsABuscar) {
      const documentos = await buscarDocumentosPorCurp(curp);
      nuevosResultados.push({ curp, documentos });
    }

    setResultados(nuevosResultados);
    setCargando(false);
    setMensaje(`Búsqueda completada. Se encontraron ${nuevosResultados.reduce((acc, r) => acc + r.documentos.length, 0)} documentos en total.`);
  };

  const eliminarDocumento = async (docId: string, curp: string) => {
    if (!confirm(`¿Estás seguro de eliminar el documento ${docId}?`)) {
      return;
    }

    setEliminando(docId);
    const exito = await eliminarCaso(docId);

    if (exito) {
      setMensaje(`Documento ${docId} eliminado correctamente.`);
      // Actualizar resultados
      setResultados(prev => prev.map(r => {
        if (r.curp === curp) {
          return {
            ...r,
            documentos: r.documentos.filter(d => d.id !== docId)
          };
        }
        return r;
      }));
    } else {
      setMensaje(`Error al eliminar documento ${docId}.`);
    }

    setEliminando(null);
  };

  const eliminarTodosMenosUltimo = async (curp: string, documentos: DocumentoEncontrado[]) => {
    if (documentos.length <= 1) {
      setMensaje('Solo hay un documento, no hay duplicados que eliminar.');
      return;
    }

    // Ordenar por fecha de creación (más reciente primero)
    const ordenados = [...documentos].sort((a, b) => {
      const fechaA = new Date(a.caso.fechaCreacion || '1970-01-01').getTime();
      const fechaB = new Date(b.caso.fechaCreacion || '1970-01-01').getTime();
      return fechaB - fechaA;
    });

    const masReciente = ordenados[0];
    const aEliminar = ordenados.slice(1);

    if (!confirm(`Se conservará el documento más reciente (${masReciente.id}) y se eliminarán ${aEliminar.length} duplicados. ¿Continuar?`)) {
      return;
    }

    setMensaje(`Eliminando ${aEliminar.length} duplicados...`);

    for (const doc of aEliminar) {
      setEliminando(doc.id);
      await eliminarCaso(doc.id);
    }

    // Actualizar resultados
    setResultados(prev => prev.map(r => {
      if (r.curp === curp) {
        return {
          ...r,
          documentos: [masReciente]
        };
      }
      return r;
    }));

    setEliminando(null);
    setMensaje(`Se eliminaron ${aEliminar.length} duplicados. Se conservó el documento más reciente.`);
  };

  const eliminarTodosLosDuplicados = async () => {
    for (const resultado of resultados) {
      if (resultado.documentos.length > 1) {
        await eliminarTodosMenosUltimo(resultado.curp, resultado.documentos);
      }
    }
  };

  const eliminarTodosLosDocumentos = async (curp: string, documentos: DocumentoEncontrado[]) => {
    if (!confirm(`¿Estás seguro de eliminar TODOS los ${documentos.length} documentos para ${curp}? Esta acción no se puede deshacer.`)) {
      return;
    }

    setMensaje(`Eliminando todos los documentos para ${curp}...`);

    for (const doc of documentos) {
      setEliminando(doc.id);
      await eliminarCaso(doc.id);
    }

    // Actualizar resultados
    setResultados(prev => prev.map(r => {
      if (r.curp === curp) {
        return {
          ...r,
          documentos: []
        };
      }
      return r;
    }));

    setEliminando(null);
    setMensaje(`Se eliminaron todos los documentos para ${curp}.`);
  };

  useEffect(() => {
    buscarDuplicados();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          🧹 Limpieza de Duplicados
        </h1>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">CURPs a revisar:</h2>
          <ul className="list-disc list-inside mb-4">
            {curpsABuscar.map(curp => (
              <li key={curp} className="font-mono text-sm">{curp}</li>
            ))}
          </ul>

          <div className="flex gap-4">
            <button
              onClick={buscarDuplicados}
              disabled={cargando}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {cargando ? 'Buscando...' : '🔍 Buscar Duplicados'}
            </button>

            {resultados.some(r => r.documentos.length > 1) && (
              <button
                onClick={eliminarTodosLosDuplicados}
                disabled={cargando || eliminando !== null}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
              >
                🗑️ Eliminar Todos los Duplicados (conservar más reciente)
              </button>
            )}
          </div>
        </div>

        {mensaje && (
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-6">
            {mensaje}
          </div>
        )}

        {resultados.map(resultado => (
          <div key={resultado.curp} className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                CURP: <span className="font-mono">{resultado.curp}</span>
                <span className={`ml-2 px-2 py-1 rounded text-sm ${
                  resultado.documentos.length > 1
                    ? 'bg-red-100 text-red-700'
                    : resultado.documentos.length === 1
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                }`}>
                  {resultado.documentos.length} documento(s)
                </span>
              </h2>

              {resultado.documentos.length > 1 && (
                <div className="flex gap-2">
                  <button
                    onClick={() => eliminarTodosMenosUltimo(resultado.curp, resultado.documentos)}
                    disabled={eliminando !== null}
                    className="bg-orange-500 text-white px-3 py-1 rounded text-sm hover:bg-orange-600 disabled:opacity-50"
                  >
                    Conservar solo el más reciente
                  </button>
                  <button
                    onClick={() => eliminarTodosLosDocumentos(resultado.curp, resultado.documentos)}
                    disabled={eliminando !== null}
                    className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 disabled:opacity-50"
                  >
                    Eliminar TODOS
                  </button>
                </div>
              )}

              {resultado.documentos.length === 1 && (
                <button
                  onClick={() => eliminarTodosLosDocumentos(resultado.curp, resultado.documentos)}
                  disabled={eliminando !== null}
                  className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 disabled:opacity-50"
                >
                  Eliminar documento
                </button>
              )}
            </div>

            {resultado.documentos.length === 0 ? (
              <p className="text-gray-500 italic">No se encontraron documentos para este CURP.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border p-2 text-left">ID Documento</th>
                      <th className="border p-2 text-left">Folio</th>
                      <th className="border p-2 text-left">Cliente</th>
                      <th className="border p-2 text-left">Nombres</th>
                      <th className="border p-2 text-left">Apellidos</th>
                      <th className="border p-2 text-left">Fecha Creación</th>
                      <th className="border p-2 text-left">Clave Acceso</th>
                      <th className="border p-2 text-left">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resultado.documentos.map((doc, index) => (
                      <tr
                        key={doc.id}
                        className={`${index === 0 ? 'bg-green-50' : 'bg-red-50'} ${eliminando === doc.id ? 'opacity-50' : ''}`}
                      >
                        <td className="border p-2 font-mono text-xs">{doc.id}</td>
                        <td className="border p-2 font-mono text-sm">{doc.caso.folio}</td>
                        <td className="border p-2 text-sm">{doc.caso.cliente}</td>
                        <td className="border p-2 text-sm">{doc.caso.nombres}</td>
                        <td className="border p-2 text-sm">{doc.caso.apellidos}</td>
                        <td className="border p-2 text-sm">{doc.caso.fechaCreacion || 'N/A'}</td>
                        <td className="border p-2 text-sm">
                          {doc.caso.claveAcceso ? (
                            <span className="font-mono">
                              {doc.caso.claveAcceso.clave}
                              <br />
                              <span className="text-xs text-gray-500">
                                Exp: {new Date(doc.caso.claveAcceso.expiracion).toLocaleString()}
                              </span>
                            </span>
                          ) : 'Sin clave'}
                        </td>
                        <td className="border p-2">
                          <button
                            onClick={() => eliminarDocumento(doc.id, resultado.curp)}
                            disabled={eliminando !== null}
                            className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600 disabled:opacity-50"
                          >
                            {eliminando === doc.id ? 'Eliminando...' : 'Eliminar'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {resultado.documentos.length > 1 && (
                  <p className="text-sm text-gray-600 mt-2">
                    💡 La fila verde es el documento más reciente. Las filas rojas son duplicados.
                  </p>
                )}
              </div>
            )}
          </div>
        ))}

        <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded">
          <strong>⚠️ Importante:</strong> Al eliminar duplicados, se conservará el documento con la fecha de creación más reciente.
          Los asesores podrán registrar nuevamente estos CURPs después de la limpieza.
        </div>
      </div>
    </div>
  );
}
