"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import Link from "next/link";

interface CasoResumen {
  folio: string;
  cliente: string;
  fechaCreacion: string;
  valido: boolean;
  razon?: string;
}

export default function VerificarFolios() {
  const [casos, setCasos] = useState<CasoResumen[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function cargarCasos() {
      try {
        const querySnapshot = await getDocs(collection(db, "casos"));
        const casosData: CasoResumen[] = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const folio = data.folio || "";

          // Verificar si el folio cumple las reglas
          let valido = true;
          let razon = "";

          if (folio.length < 3) {
            valido = false;
            razon = "Menos de 3 caracteres";
          } else if (folio.length > 50) {
            valido = false;
            razon = "Más de 50 caracteres";
          } else if (!/^[A-Z0-9\-]+$/i.test(folio)) {
            valido = false;
            razon = "Contiene caracteres no permitidos";
          }

          casosData.push({
            folio,
            cliente: data.cliente || data.nombres + " " + data.apellidos || "Sin nombre",
            fechaCreacion: data.fechaCreacion || "Sin fecha",
            valido,
            razon
          });
        });

        setCasos(casosData);
      } catch (err) {
        console.error("Error:", err);
        setError("Error al conectar con Firebase. Verifica las credenciales.");
      } finally {
        setLoading(false);
      }
    }

    cargarCasos();
  }, []);

  const foliosValidos = casos.filter(c => c.valido).length;
  const foliosInvalidos = casos.filter(c => !c.valido).length;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-[#6B1839] mb-6">
          Verificación de Folios en Firebase
        </h1>

        {loading && (
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-600">Cargando casos de Firebase...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded-lg mb-4">
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Resumen */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-white p-4 rounded-lg shadow text-center">
                <p className="text-4xl font-bold text-[#6B1839]">{casos.length}</p>
                <p className="text-gray-600">Total de Casos</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg shadow text-center">
                <p className="text-4xl font-bold text-green-600">{foliosValidos}</p>
                <p className="text-gray-600">Folios Válidos</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg shadow text-center">
                <p className="text-4xl font-bold text-red-600">{foliosInvalidos}</p>
                <p className="text-gray-600">Folios con Problemas</p>
              </div>
            </div>

            {/* Lista de casos */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-[#6B1839] text-white">
                  <tr>
                    <th className="p-3 text-left">#</th>
                    <th className="p-3 text-left">Folio</th>
                    <th className="p-3 text-left">Cliente</th>
                    <th className="p-3 text-left">Fecha</th>
                    <th className="p-3 text-center">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {casos.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-gray-500">
                        No hay casos en Firebase
                      </td>
                    </tr>
                  ) : (
                    casos.map((caso, index) => (
                      <tr key={index} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                        <td className="p-3 text-gray-600">{index + 1}</td>
                        <td className="p-3 font-mono font-bold">{caso.folio}</td>
                        <td className="p-3">{caso.cliente}</td>
                        <td className="p-3 text-gray-600">{caso.fechaCreacion}</td>
                        <td className="p-3 text-center">
                          {caso.valido ? (
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                              ✅ Válido
                            </span>
                          ) : (
                            <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm">
                              ❌ {caso.razon}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {foliosInvalidos === 0 && casos.length > 0 && (
              <div className="mt-6 bg-green-100 border border-green-400 text-green-700 p-4 rounded-lg">
                <p className="font-bold">🎉 ¡Excelente!</p>
                <p>Todos tus folios existentes son compatibles con el sistema actual.</p>
              </div>
            )}
          </>
        )}

        <div className="mt-6">
          <Link href="/" className="text-[#6B1839] hover:underline">
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
