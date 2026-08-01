"use client";

import { Search, Menu, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { buscarCasoConClave } from "./lib/storage";

export default function Home() {
  const [busqueda, setBusqueda] = useState("");
  const [casoEncontrado, setCasoEncontrado] = useState<{
    folio: string;
    cliente: string;
    tipoFraude: string;
    licenciado: string;
    recuperacion: number;
    indemnizacion: number;
    totalEntregar: number;
    pagoPendiente: number;
    conceptoPago: string;
    // Cuenta única de fideicomiso
    numeroCuentaFideicomiso?: string;
    claveInterbancaria?: string;
    institucionBancaria?: string;
    titularCuenta?: string;
    // Conceptos adicionales
    conceptosAdicionales?: {concepto: string; monto: number}[];
    // DATOS DE COMISIÓN DEL ÚLTIMO COBRO
    motivoComision?: string;
    porcentaje?: number;
    montoDeposito?: number;
    montoComisionPagar?: number;
  } | null>(null);
  const [buscando, setBuscando] = useState(false);
  const [error, setError] = useState("");
  const [errorTipo, setErrorTipo] = useState<"caducada" | "otro" | "">("");
  const [mostrarResultados, setMostrarResultados] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState(false);

  const buscarFolio = async () => {
    if (!busqueda.trim()) {
      setError("Ingresa tu CURP y clave de acceso");
      setErrorTipo("otro");
      setCasoEncontrado(null);
      setMostrarResultados(true);
      return;
    }

    // Separar CURP y clave de acceso (el último elemento separado por espacio es la clave)
    const partes = busqueda.trim().split(/\s+/);

    if (partes.length < 2) {
      setError("Ingresa tu CURP seguido de tu clave de acceso (separados por espacio)");
      setErrorTipo("otro");
      setCasoEncontrado(null);
      setMostrarResultados(true);
      return;
    }

    // La última parte es la clave, el resto es el CURP/Folio
    const claveIngresada = partes[partes.length - 1];
    const curpIngresado = partes.slice(0, -1).join('');

    setBuscando(true);
    setError("");
    setErrorTipo("");
    setCasoEncontrado(null);
    setMostrarResultados(false);

    try {
      // Buscar con validación de clave de acceso
      const resultado = await buscarCasoConClave(curpIngresado, claveIngresada);

      if (resultado.error) {
        setError(resultado.error);
        // Detectar si es error de clave caducada
        if (resultado.error.toLowerCase().includes('caducada')) {
          setErrorTipo("caducada");
        } else {
          setErrorTipo("otro");
        }
        setMostrarResultados(true);
      } else if (resultado.caso) {
        // EXTRAER EL ÚLTIMO COBRO PARA MOSTRAR DATOS DE COMISIÓN
        const ultimoCobro = resultado.caso.cobros && resultado.caso.cobros.length > 0
          ? resultado.caso.cobros[resultado.caso.cobros.length - 1]
          : null;

        console.log('📝 Último cobro encontrado:', ultimoCobro);
        console.log('📝 Total de cobros:', resultado.caso.cobros?.length || 0);

        setCasoEncontrado({
          folio: resultado.caso.folio,
          cliente: resultado.caso.cliente,
          tipoFraude: resultado.caso.tipoFraude,
          licenciado: resultado.caso.licenciado,
          recuperacion: resultado.caso.recuperacion,
          indemnizacion: resultado.caso.indemnizacion,
          totalEntregar: resultado.caso.totalEntregar,
          pagoPendiente: resultado.caso.pagoPendiente,
          conceptoPago: resultado.caso.conceptoPago,
          numeroCuentaFideicomiso: resultado.caso.numeroCuentaFideicomiso,
          claveInterbancaria: resultado.caso.claveInterbancaria,
          institucionBancaria: resultado.caso.institucionBancaria,
          titularCuenta: resultado.caso.titularCuenta,
          conceptosAdicionales: resultado.caso.conceptosAdicionales,
          // DATOS DE COMISIÓN DEL ÚLTIMO COBRO
          motivoComision: ultimoCobro?.motivoComision || undefined,
          porcentaje: ultimoCobro?.porcentaje || undefined,
          montoDeposito: ultimoCobro?.montoDeposito || undefined,
          montoComisionPagar: ultimoCobro?.montoComisionPagar || undefined
        });
        setMostrarResultados(true);
      }
    } catch (err) {
      console.error(err);
      setError("Error al buscar el caso");
      setErrorTipo("otro");
      setMostrarResultados(true);
    }

    setBuscando(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      buscarFolio();
    }
  };

  return (
    <main className="min-h-screen bg-[#f8f8f8]">
      {/* Header Principal - Estilo datos.gob.mx */}
      <header className="bg-[#611232]">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <a href="https://www.gob.mx" className="flex items-center">
            <img
              src="https://ext.same-assets.com/2098432521/3519242953.png"
              alt="Gobierno de México"
              className="h-10 md:h-12"
            />
          </a>

          {/* Desktop: Navigation */}
          <nav className="hidden md:flex items-center gap-6 text-white">
            <a href="https://www.gob.mx/tramites" className="hover:underline text-sm font-medium">Trámites</a>
            <a href="https://www.gob.mx/gobierno" className="hover:underline text-sm font-medium">Gobierno</a>
            <a href="https://www.gob.mx/busqueda" className="hover:opacity-80">
              <Search className="h-5 w-5" />
            </a>
          </nav>
        </div>
      </header>

      {/* Barra de Menú Naranja - Solo móvil */}
      <div className="md:hidden bg-[#9b7b30] text-white">
        <div className="flex items-center justify-between px-4 py-3">
          <span className="font-medium text-sm">Menú</span>
          <button
            onClick={() => setMenuAbierto(!menuAbierto)}
            className="p-1"
          >
            {menuAbierto ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Menú desplegable móvil */}
        {menuAbierto && (
          <div className="bg-[#8a6d2a] px-4 py-3 border-t border-[#7d6227]">
            <nav className="flex flex-col gap-3">
              <a href="https://www.gob.mx/tramites" className="hover:underline text-sm">Trámites</a>
              <a href="https://www.gob.mx/gobierno" className="hover:underline text-sm">Gobierno</a>
              <a href="https://www.gob.mx" className="hover:underline text-sm">Inicio</a>
              <a href="https://datos.gob.mx" className="hover:underline text-sm">Datos</a>
            </nav>
          </div>
        )}
      </div>

      {/* Barra de navegación secundaria - Solo desktop */}
      <nav className="hidden md:block bg-[#f0f0f0] border-b border-gray-300">
        <div className="container mx-auto px-4 flex justify-center">
          <ul className="flex items-center justify-center gap-6 py-3 text-sm text-gray-700">
            <li><a href="https://www.gob.mx" className="hover:text-[#691a34] font-medium">Inicio</a></li>
            <li><a href="https://www.gob.mx/tramites" className="hover:text-[#691a34]">Trámites</a></li>
            <li><a href="https://www.gob.mx/gobierno" className="hover:text-[#691a34]">Gobierno</a></li>
            <li><a href="https://participa.gob.mx" className="hover:text-[#691a34]">Participa</a></li>
            <li><a href="https://datos.gob.mx" className="hover:text-[#691a34]">Datos</a></li>
          </ul>
        </div>
      </nav>

      {/* Hero Section - Estilo datos.gob.mx */}
      <section className="bg-gradient-to-b from-[#3d4f5f] via-[#5a6d7a] to-[#7a8a95] text-white py-12 md:py-24 pb-24 md:pb-32 relative">
        <div className="container mx-auto px-4">
          {/* Título principal */}
          <h1 className="text-2xl md:text-5xl font-bold text-center mb-6 md:mb-12">
            Portal de Consulta de Trámites
          </h1>

          {/* Buscador blanco original */}
          <div className="max-w-3xl mx-auto px-4 md:px-0">
            <div className="flex items-center bg-white rounded-full shadow-lg overflow-hidden">
              <div className="pl-5 pr-2 py-4 md:py-5 flex items-center justify-center">
                <Search className="h-5 w-5 md:h-6 md:w-6 text-gray-500" />
              </div>
              <Input
                type="text"
                placeholder="Ingresa tu CURP y tu clave de acceso"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value.toUpperCase())}
                onKeyPress={handleKeyPress}
                className="flex-1 border-0 text-gray-700 text-base md:text-lg px-2 py-4 md:py-5 focus-visible:ring-0 placeholder:text-gray-400 bg-transparent"
                maxLength={70}
              />
              <button
                onClick={buscarFolio}
                disabled={buscando}
                className="mr-3 px-6 py-3 bg-[#611232] text-white rounded-full hover:bg-[#4d0f28] transition-colors font-medium"
              >
                {buscando ? '...' : 'Buscar'}
              </button>
            </div>
          </div>

          {/* Resultados de búsqueda */}
          {mostrarResultados && (
            <div className="max-w-3xl mx-auto mt-6 px-2 md:px-0">
              {buscando ? (
                <div className="bg-white rounded-xl p-6 text-center shadow-lg">
                  <p className="text-gray-600">Buscando...</p>
                </div>
              ) : error ? (
                <div className={`border-l-4 p-4 rounded-lg ${
                  errorTipo === 'caducada'
                    ? 'bg-red-50 border-red-500'
                    : 'bg-yellow-50 border-yellow-500'
                }`}>
                  <p className={`font-medium ${
                    errorTipo === 'caducada'
                      ? 'text-red-700'
                      : 'text-yellow-700'
                  }`}>
                    {errorTipo === 'caducada' ? "Clave de acceso caducada" : error}
                  </p>
                  {errorTipo === 'caducada' && (
                    <p className="text-red-600 text-sm mt-2">
                      Solicita una nueva clave de acceso a tu asesor.
                    </p>
                  )}
                </div>
              ) : casoEncontrado ? (
                <div className="bg-white rounded-xl p-4 md:p-8 shadow-2xl">
                  <div className="flex justify-between items-start mb-4 md:mb-6">
                    <h3 className="text-xl md:text-2xl font-bold text-[#611232]">Resultados</h3>
                    <button
                      onClick={() => {
                        setMostrarResultados(false);
                        setBusqueda("");
                        setCasoEncontrado(null);
                        setError("");
                        setErrorTipo("");
                      }}
                      className="text-2xl font-bold text-gray-500 hover:text-gray-700"
                    >
                      ×
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    <div className="bg-gradient-to-br from-[#611232] to-[#7a3a50] text-white rounded-lg p-3 md:p-4 shadow-sm">
                      <p className="text-xs md:text-sm text-white/80 mb-1">FOLIO:</p>
                      <p className="text-lg md:text-xl font-bold">{casoEncontrado.folio}</p>
                    </div>

                    <div className="bg-[#2c8e3c] text-white rounded-lg p-3 md:p-4 shadow-sm">
                      <p className="text-xs md:text-sm text-white/90 mb-1">NOMBRE:</p>
                      <p className="text-sm md:text-base font-semibold text-white">
                        {casoEncontrado.cliente?.replace(/APELLIDOS:\s*/gi, ' ').replace(/\s+/g, ' ').trim()}
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3 md:p-4 shadow-sm border">
                      <p className="text-xs md:text-sm text-gray-600 mb-1">TIPO DE FRAUDE:</p>
                      <p className="text-sm md:text-base font-semibold text-gray-800">{casoEncontrado.tipoFraude}</p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3 md:p-4 shadow-sm border">
                      <p className="text-xs md:text-sm text-gray-600 mb-1">LICENCIADO:</p>
                      <p className="text-sm md:text-base font-semibold text-gray-800">{casoEncontrado.licenciado}</p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3 md:p-4 shadow-sm border">
                      <p className="text-xs md:text-sm text-gray-600 mb-1">RECUPERACIÓN:</p>
                      <p className="text-base md:text-lg font-bold text-gray-800">${casoEncontrado.recuperacion?.toLocaleString('es-MX', {minimumFractionDigits: 2})}</p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3 md:p-4 shadow-sm border">
                      <p className="text-xs md:text-sm text-gray-600 mb-1">INDEMNIZACIÓN:</p>
                      <p className="text-base md:text-lg font-bold text-gray-800">${casoEncontrado.indemnizacion?.toLocaleString('es-MX', {minimumFractionDigits: 2})}</p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3 md:p-4 shadow-sm border">
                      <p className="text-xs md:text-sm text-gray-600 mb-1">TOTAL A ENTREGAR:</p>
                      <p className="text-base md:text-lg font-bold text-gray-800">${casoEncontrado.totalEntregar?.toLocaleString('es-MX', {minimumFractionDigits: 2})}</p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3 md:p-4 shadow-sm border">
                      <p className="text-xs md:text-sm text-gray-600 mb-1">PAGO PENDIENTE:</p>
                      <p className="text-base md:text-lg font-bold text-gray-800">${casoEncontrado.pagoPendiente?.toLocaleString('es-MX', {minimumFractionDigits: 2})}</p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3 md:p-4 shadow-sm border">
                      <p className="text-xs md:text-sm text-gray-600 mb-1">CONCEPTO DE PAGO:</p>
                      <p className="text-sm md:text-base font-semibold text-gray-800">{casoEncontrado.conceptoPago}</p>
                    </div>
                  </div>

                  {/* SECCIÓN DE COMISIÓN - DATOS DEL ÚLTIMO COBRO */}
                  {/* Solo mostrar si hay un motivo diferente a SIN MOTIVO y hay valores reales de comisión */}
                  {(casoEncontrado.motivoComision &&
                    casoEncontrado.motivoComision !== "SIN MOTIVO" &&
                    casoEncontrado.porcentaje &&
                    casoEncontrado.porcentaje > 0 &&
                    casoEncontrado.montoComisionPagar &&
                    casoEncontrado.montoComisionPagar > 0) && (
                    <div className="mt-6 bg-blue-50 rounded-xl p-4 md:p-6 border-2 border-blue-300">
                      <h4 className="text-lg font-bold text-blue-900 mb-4">Datos de Comisión</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {casoEncontrado.motivoComision && (
                          <div className="bg-white rounded-lg p-3 border border-blue-200 md:col-span-2">
                            <p className="text-xs text-blue-700 mb-1">MOTIVO DE COMISIÓN:</p>
                            <p className="text-base font-bold text-gray-800">{casoEncontrado.motivoComision}</p>
                          </div>
                        )}
                        {casoEncontrado.porcentaje !== undefined && casoEncontrado.porcentaje > 0 && (
                          <div className="bg-white rounded-lg p-3 border border-blue-200">
                            <p className="text-xs text-blue-700 mb-1">PORCENTAJE:</p>
                            <p className="text-base font-bold text-gray-800">{casoEncontrado.porcentaje}%</p>
                          </div>
                        )}
                        {casoEncontrado.montoDeposito !== undefined && casoEncontrado.montoDeposito > 0 && (
                          <div className="bg-white rounded-lg p-3 border border-blue-200">
                            <p className="text-xs text-blue-700 mb-1">MONTO DE DEPÓSITO:</p>
                            <p className="text-base font-bold text-gray-800">${casoEncontrado.montoDeposito?.toLocaleString('es-MX', {minimumFractionDigits: 2})}</p>
                          </div>
                        )}
                        {casoEncontrado.montoComisionPagar !== undefined && casoEncontrado.montoComisionPagar > 0 && (
                          <div className="bg-green-100 rounded-lg p-3 border-2 border-green-500 md:col-span-2">
                            <p className="text-xs text-green-700 mb-1">MONTO DE COMISIÓN A PAGAR:</p>
                            <p className="text-2xl font-bold text-green-700">${casoEncontrado.montoComisionPagar?.toLocaleString('es-MX', {minimumFractionDigits: 2})} MXN</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Conceptos Adicionales */}
                  {casoEncontrado.conceptosAdicionales && casoEncontrado.conceptosAdicionales.length > 0 && (
                    <div className="mt-6 bg-purple-50 rounded-xl p-4 md:p-6 border-2 border-purple-300">
                      <h4 className="text-lg font-bold text-purple-900 mb-4">Conceptos Adicionales</h4>
                      <div className="space-y-2">
                        {casoEncontrado.conceptosAdicionales.map((item, index) => (
                          <div key={index} className="flex items-center justify-between bg-white rounded-lg p-3 border border-purple-200">
                            <span className="font-medium text-gray-800">{item.concepto}</span>
                            <span className="font-bold text-purple-700">${item.monto?.toLocaleString('es-MX', {minimumFractionDigits: 2})}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Cuenta única de fideicomiso - SIEMPRE VISIBLE */}
                  <div className="mt-6 bg-amber-50 rounded-xl p-4 md:p-6 border-2 border-amber-300">
                    <h4 className="text-lg font-bold text-amber-900 mb-4">Cuenta única de fideicomiso</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="bg-white rounded-lg p-3 border border-amber-200">
                        <p className="text-xs text-amber-700 mb-1">NÚMERO DE CUENTA:</p>
                        <p className="text-base font-bold text-gray-800">{casoEncontrado.numeroCuentaFideicomiso || "No especificado"}</p>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-amber-200">
                        <p className="text-xs text-amber-700 mb-1">CLABE INTERBANCARIA:</p>
                        <p className="text-base font-bold text-gray-800">{casoEncontrado.claveInterbancaria || "No especificado"}</p>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-amber-200">
                        <p className="text-xs text-amber-700 mb-1">INSTITUCIÓN BANCARIA:</p>
                        <p className="text-base font-bold text-gray-800">{casoEncontrado.institucionBancaria || "No especificado"}</p>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-amber-200">
                        <p className="text-xs text-amber-700 mb-1">TITULAR:</p>
                        <p className="text-base font-bold text-gray-800">{casoEncontrado.titularCuenta || "No especificado"}</p>
                      </div>
                    </div>
                    <p className="mt-4 bg-white rounded-lg p-4 border border-amber-300 text-sm md:text-base font-bold text-amber-950 leading-relaxed">
                      Toda aportación realizada a cuentas de personas físicas, ajenas a la cuenta del fideicomiso del gobierno de México, no serán acreditadas para la recuperación del titular.
                    </p>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </section>

      {/* Tarjetas de estadísticas - Sobre el hero */}
      <div className="relative z-10 -mt-16 md:-mt-20 pb-8 md:pb-12">
        <div className="container mx-auto px-4">
          {/* Móvil: Columna única, Desktop: 4 columnas centradas con ancho máximo */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-6xl mx-auto">
            {/* Tarjeta 1 */}
            <div className="bg-white rounded-2xl p-6 md:p-8 text-center shadow-[0_4px_20px_rgba(0,0,0,0.15)] flex flex-col items-center justify-center min-h-[180px]">
              <p className="text-4xl md:text-5xl font-bold text-[#333] mb-4">2200</p>
              <a href="https://datos.gob.mx/visualizador" className="bg-[#611232] text-white text-xs md:text-sm px-4 py-3 rounded-md hover:bg-[#4d0f28] transition-colors font-medium text-center whitespace-nowrap">
                Visualizaciones de datos
              </a>
            </div>

            {/* Tarjeta 2 */}
            <div className="bg-white rounded-2xl p-6 md:p-8 text-center shadow-[0_4px_20px_rgba(0,0,0,0.15)] flex flex-col items-center justify-center min-h-[180px]">
              <p className="text-4xl md:text-5xl font-bold text-[#333] mb-4">6285</p>
              <a href="https://datos.gob.mx/dataset" className="bg-[#611232] text-white text-xs md:text-sm px-4 py-3 rounded-md hover:bg-[#4d0f28] transition-colors font-medium text-center">
                Bases de datos
              </a>
            </div>

            {/* Tarjeta 3 */}
            <div className="bg-white rounded-2xl p-6 md:p-8 text-center shadow-[0_4px_20px_rgba(0,0,0,0.15)] flex flex-col items-center justify-center min-h-[180px]">
              <p className="text-4xl md:text-5xl font-bold text-[#333] mb-4">184</p>
              <a href="https://datos.gob.mx/organization" className="bg-[#611232] text-white text-xs md:text-sm px-4 py-3 rounded-md hover:bg-[#4d0f28] transition-colors font-medium text-center">
                Instituciones
              </a>
            </div>

            {/* Tarjeta 4 */}
            <div className="bg-white rounded-2xl p-6 md:p-8 text-center shadow-[0_4px_20px_rgba(0,0,0,0.15)] flex flex-col items-center justify-center min-h-[180px]">
              <p className="text-4xl md:text-5xl font-bold text-[#333] mb-4">28</p>
              <a href="https://datos.gob.mx/group" className="bg-[#611232] text-white text-xs md:text-sm px-4 py-3 rounded-md hover:bg-[#4d0f28] transition-colors font-medium text-center">
                Categorías
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Sección Consulta por categoría */}
      <section className="bg-white py-8 md:py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-xl md:text-3xl font-bold text-center text-[#333] mb-8 md:mb-10">
            Consulta por categoría
          </h2>

          {/* Móvil: Lista vertical, Desktop: Grid 3 columnas */}
          <div className="flex flex-col md:grid md:grid-cols-3 gap-4 md:gap-8 max-w-4xl mx-auto">
            {/* Categoría 1 - Agricultura */}
            <a href="https://datos.gob.mx/group/agricultura" className="flex items-center gap-4 group p-3 md:p-0 bg-gray-50 md:bg-transparent rounded-lg">
              <div className="w-14 h-14 flex items-center justify-center flex-shrink-0">
                <img
                  src="/icons/agricultura.svg"
                  alt="Agricultura"
                  className="w-12 h-12"
                />
              </div>
              <div>
                <p className="font-semibold text-[#611232] underline decoration-[#611232]">Agricultura</p>
                <p className="text-sm text-gray-500">139 Bases de datos</p>
              </div>
            </a>

            {/* Categoría 2 - Cultura */}
            <a href="https://datos.gob.mx/group/cultura" className="flex items-center gap-4 group p-3 md:p-0 bg-gray-50 md:bg-transparent rounded-lg">
              <div className="w-14 h-14 flex items-center justify-center flex-shrink-0">
                <img
                  src="/icons/cultura.svg"
                  alt="Cultura"
                  className="w-12 h-12"
                />
              </div>
              <div>
                <p className="font-semibold text-[#611232] underline decoration-[#611232]">Cultura</p>
                <p className="text-sm text-gray-500">187 Bases de datos</p>
              </div>
            </a>

            {/* Categoría 3 - Deporte */}
            <a href="https://datos.gob.mx/group/deporte" className="flex items-center gap-4 group p-3 md:p-0 bg-gray-50 md:bg-transparent rounded-lg">
              <div className="w-14 h-14 flex items-center justify-center flex-shrink-0">
                <img
                  src="/icons/deporte.svg"
                  alt="Deporte"
                  className="w-12 h-12"
                />
              </div>
              <div>
                <p className="font-semibold text-[#611232] underline decoration-[#611232]">Deporte</p>
                <p className="text-sm text-gray-500">10 Bases de datos</p>
              </div>
            </a>

            {/* Categoría 4 - Derechos humanos */}
            <a href="https://datos.gob.mx/group/derechos_humanos" className="flex items-center gap-4 group p-3 md:p-0 bg-gray-50 md:bg-transparent rounded-lg">
              <div className="w-14 h-14 flex items-center justify-center flex-shrink-0">
                <img
                  src="/icons/derechos-humanos.svg"
                  alt="Derechos humanos"
                  className="w-12 h-12"
                />
              </div>
              <div>
                <p className="font-semibold text-[#611232] underline decoration-[#611232]">Derechos humanos</p>
                <p className="text-sm text-gray-500">58 Bases de datos</p>
              </div>
            </a>

            {/* Categoría 5 - Ciencia y tecnología */}
            <a href="https://datos.gob.mx/group/ciencia_tecnologia" className="flex items-center gap-4 group p-3 md:p-0 bg-gray-50 md:bg-transparent rounded-lg">
              <div className="w-14 h-14 flex items-center justify-center flex-shrink-0">
                <img
                  src="/icons/ciencia.svg"
                  alt="Ciencia y tecnología"
                  className="w-12 h-12"
                />
              </div>
              <div>
                <p className="font-semibold text-[#611232] underline decoration-[#611232]">Ciencia y tecnología</p>
                <p className="text-sm text-gray-500">194 Bases de datos</p>
              </div>
            </a>

            {/* Categoría 6 - Catálogo de datos */}
            <a href="https://datos.gob.mx/group/catalogo_datos" className="flex items-center gap-4 group p-3 md:p-0 bg-gray-50 md:bg-transparent rounded-lg">
              <div className="w-14 h-14 flex items-center justify-center flex-shrink-0">
                <img
                  src="/icons/catalogos.svg"
                  alt="Catálogo de datos"
                  className="w-12 h-12"
                />
              </div>
              <div>
                <p className="font-semibold text-[#611232] underline decoration-[#611232]">Catálogo de datos</p>
                <p className="text-sm text-gray-500">5 Bases de datos</p>
              </div>
            </a>
          </div>

          <div className="text-center mt-8 md:mt-10">
            <a href="https://datos.gob.mx/group/" className="inline-block bg-[#611232] text-white text-base px-10 py-4 rounded-md hover:bg-[#4d0f28] transition-colors font-semibold w-full md:w-auto max-w-md">
              Ver todas las categorías
            </a>
          </div>
        </div>
      </section>

      {/* Bases de datos más utilizadas */}
      <section className="bg-[#f0f0f0] py-8 md:py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-xl md:text-3xl font-bold text-center text-[#333] mb-8 md:mb-10">
            Bases de datos más utilizadas
          </h2>

          <div className="flex flex-col md:flex-row md:justify-center gap-0 max-w-5xl mx-auto">
            {/* Base 1 */}
            <div className="bg-transparent p-6 text-center md:border-r md:border-[#A57F2C] flex-1">
              <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <img src="/icons/gobierno.svg" alt="" className="w-12 h-12" />
              </div>
              <p className="font-semibold text-gray-800 mb-4">Reporte de salarios brutos y netos de la nómina</p>
              <a href="https://datos.gob.mx/dataset/reporte_salarios_brutos_netos_nomina" className="inline-block bg-[#611232] text-white text-sm px-5 py-2 rounded hover:bg-[#4d0f28] transition-colors">
                Ver más
              </a>
            </div>

            {/* Base 2 */}
            <div className="bg-transparent p-6 text-center md:border-r md:border-[#A57F2C] flex-1 border-t border-b md:border-t-0 md:border-b-0 border-[#A57F2C]">
              <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <img src="/icons/gobierno.svg" alt="" className="w-12 h-12" />
              </div>
              <p className="font-semibold text-gray-800 mb-4">Puestos y vacantes SESNA</p>
              <a href="https://datos.gob.mx/dataset/puestos_vacantes_sesna" className="inline-block bg-[#611232] text-white text-sm px-5 py-2 rounded hover:bg-[#4d0f28] transition-colors">
                Ver más
              </a>
            </div>

            {/* Base 3 */}
            <div className="bg-transparent p-6 text-center flex-1">
              <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <img src="/icons/gobierno.svg" alt="" className="w-12 h-12" />
              </div>
              <p className="font-semibold text-gray-800 mb-4">Padrón de proveedores y contratistas SESNA</p>
              <a href="https://datos.gob.mx/dataset/padron_proveedores_contratistas_sesna" className="inline-block bg-[#611232] text-white text-sm px-5 py-2 rounded hover:bg-[#4d0f28] transition-colors">
                Ver más
              </a>
            </div>
          </div>

          <div className="text-center mt-8 md:mt-10">
            <a href="https://historico.datos.gob.mx/" className="text-[#611232] underline font-medium inline-flex items-center gap-1">
              Consulta el archivo histórico de los datos
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* Línea de "Desarrollado con" */}
      <div className="bg-white py-4 border-t border-gray-200">
        <div className="container mx-auto px-4 text-right">
          <p className="text-sm text-gray-600">Desarrollado con <strong>Sistema Ajolote</strong></p>
        </div>
      </div>

      {/* Footer - Estilo datos.gob.mx */}
      <footer className="bg-[#611232] text-white py-8 md:py-12">
        <div className="container mx-auto px-4">
          {/* Móvil: Stack vertical, Desktop: Grid 4 columnas */}
          <div className="flex flex-col md:grid md:grid-cols-4 gap-8">
            {/* Logo */}
            <div className="text-center md:text-left">
              <img
                src="https://ext.same-assets.com/2098432521/3867328593.png"
                alt="Gobierno de México"
                className="h-14 md:h-16 mb-4 mx-auto md:mx-0"
              />
            </div>

            {/* Enlaces */}
            <div>
              <h3 className="font-bold mb-4 text-lg">Enlaces</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="https://datos.gob.mx/" className="hover:underline">Datos</a></li>
                <li><a href="https://www.gob.mx/publicaciones" className="hover:underline">Publicaciones</a></li>
                <li><a href="https://consultapublicamx.plataformadetransparencia.org.mx" className="hover:underline">Portal de Obligaciones de Transparencia</a></li>
                <li><a href="https://consultapublicamx.plataformadetransparencia.org.mx" className="hover:underline">PNT</a></li>
                <li><a href="http://www.inai.org.mx/" className="hover:underline">INAI</a></li>
                <li><a href="https://alertadores.funcionpublica.gob.mx/" className="hover:underline">Alerta</a></li>
                <li><a href="https://sidec.funcionpublica.gob.mx/" className="hover:underline">Denuncia</a></li>
              </ul>
            </div>

            {/* ¿Qué es gob.mx? */}
            <div>
              <h3 className="font-bold mb-4 text-lg">¿Qué es gob.mx?</h3>
              <p className="text-sm mb-4">
                Es el portal único de trámites, información y participación ciudadana.{" "}
                <a href="https://www.gob.mx/que-es-gobmx" className="underline">Leer más</a>
              </p>
              <ul className="space-y-2 text-sm">
                <li><a href="https://www.gob.mx/amlo" className="hover:underline">Administraciones anteriores</a></li>
                <li><a href="https://www.gob.mx/accesibilidad" className="hover:underline">Declaración de Accesibilidad</a></li>
                <li><a href="http://www.ordenjuridico.gob.mx/" className="hover:underline">Marco jurídico</a></li>
                <li><a href="https://www.gob.mx/terminos#medidas-seguridad-informacion" className="hover:underline">Política de seguridad</a></li>
                <li><a href="https://www.gob.mx/terminos" className="hover:underline">Términos y Condiciones</a></li>
                <li><a href="https://www.gob.mx/aviso_de_privacidad" className="hover:underline">Aviso de privacidad</a></li>
                <li><a href="https://www.gob.mx/sitemap" className="hover:underline">Mapa de sitio</a></li>
              </ul>
            </div>

            {/* Denuncia y redes sociales */}
            <div>
              <h3 className="font-bold mb-4 text-lg">
                <a href="https://sidec.funcionpublica.gob.mx/" className="hover:underline">Denuncia contra servidores públicos</a>
              </h3>

              <h3 className="font-bold mb-3 mt-6">Síguenos en</h3>
              <div className="flex gap-4">
                <a href="https://www.facebook.com/gobmexico" className="hover:opacity-80 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a href="https://x.com/GobiernoMX" className="hover:opacity-80 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
