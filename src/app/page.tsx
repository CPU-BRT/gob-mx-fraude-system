"use client";

import { Search, Menu, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { buscarCasoPorFolio } from "./lib/storage";

export default function Home() {
  const [busqueda, setBusqueda] = useState("");
  const [casoEncontrado, setCasoEncontrado] = useState<{
    folio: string;
    cliente: string;
    tipoFraude: string;
    licenciado: string;
    recuperacion: number;
    indemnizacion: number;
    penalizacion: number;
    totalEntregar: number;
    pagoPendiente: number;
    conceptoPago: string;
  } | null>(null);
  const [buscando, setBuscando] = useState(false);
  const [error, setError] = useState("");
  const [mostrarResultados, setMostrarResultados] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState(false);

  const buscarFolio = async () => {
    if (!busqueda.trim()) {
      setError("");
      setCasoEncontrado(null);
      setMostrarResultados(false);
      return;
    }

    setBuscando(true);
    setError("");
    setCasoEncontrado(null);
    setMostrarResultados(false);

    try {
      try {
        const response = await fetch(`/api/casos?folio=${encodeURIComponent(busqueda.trim())}`);
        if (response.ok) {
          const caso = await response.json();
          if (caso) {
            setCasoEncontrado(caso);
            setMostrarResultados(true);
            setBuscando(false);
            return;
          }
        }
      } catch (apiError) {
        console.log('API no disponible, buscando en localStorage');
      }

      const caso = await buscarCasoPorFolio(busqueda);

      if (caso) {
        setCasoEncontrado(caso);
        setMostrarResultados(true);
      } else {
        setError("No se encontró ningún caso con ese folio");
        setMostrarResultados(true);
      }
    } catch (err) {
      console.error(err);
      setError("Error al buscar el caso");
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
              src="/logo-gob.png"
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
        <div className="container mx-auto px-4 overflow-x-auto scrollbar-hide">
          <ul className="flex items-center gap-6 py-3 text-sm text-gray-700 min-w-max">
            <li><a href="https://www.gob.mx" className="hover:text-[#691a34] font-medium">Inicio</a></li>
            <li><a href="https://www.gob.mx/tramites" className="hover:text-[#691a34]">Trámites</a></li>
            <li><a href="https://www.gob.mx/gobierno" className="hover:text-[#691a34]">Gobierno</a></li>
            <li><a href="https://participa.gob.mx" className="hover:text-[#691a34]">Participa</a></li>
            <li><a href="https://datos.gob.mx" className="hover:text-[#691a34]">Datos</a></li>
          </ul>
        </div>
      </nav>

      {/* Hero Section - Estilo datos.gob.mx */}
      <section className="bg-gradient-to-b from-[#3d4f5f] via-[#5a6d7a] to-[#7a8a95] text-white py-10 md:py-20 relative">
        <div className="container mx-auto px-4">
          {/* Título principal */}
          <h1 className="text-2xl md:text-5xl font-bold text-center mb-6 md:mb-12">
            Portal de Consulta de Trámites
          </h1>

          {/* Buscador blanco - INTACTO CON TODA SU FUNCIONALIDAD */}
          <div className="max-w-3xl mx-auto px-2 md:px-0">
            <div className="flex items-center bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="pl-4 pr-2">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                type="text"
                placeholder="Ingresa tu CURP o número de folio"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value.toUpperCase())}
                onKeyPress={handleKeyPress}
                className="flex-1 border-0 text-gray-800 text-sm md:text-lg px-2 md:px-3 py-4 md:py-6 focus-visible:ring-0 placeholder:text-gray-400 bg-transparent"
                maxLength={50}
              />
              <button
                onClick={buscarFolio}
                disabled={buscando}
                className="bg-[#611232] hover:bg-[#4d0f28] px-4 md:px-8 py-4 md:py-6 text-white text-sm md:text-base font-medium transition-colors"
              >
                {buscando ? "..." : "Buscar"}
              </button>
            </div>
          </div>

          {/* Resultados de búsqueda - INTACTO */}
          {mostrarResultados && (
            <div className="max-w-3xl mx-auto mt-6 px-2 md:px-0">
              {buscando ? (
                <div className="bg-white rounded-xl p-6 text-center shadow-lg">
                  <p className="text-gray-600">Buscando...</p>
                </div>
              ) : error ? (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                  <p className="text-red-700">{error}</p>
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
                      <p className="text-xs md:text-sm text-white/90 mb-1">CLIENTE:</p>
                      <p className="text-sm md:text-base font-semibold text-white">{casoEncontrado.cliente}</p>
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
                      <p className="text-xs md:text-sm text-gray-600 mb-1">PENALIZACIÓN:</p>
                      <p className="text-base md:text-lg font-bold text-gray-800">${casoEncontrado.penalizacion?.toLocaleString('es-MX', {minimumFractionDigits: 2})}</p>
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
                </div>
              ) : null}
            </div>
          )}
        </div>
      </section>

      {/* Tarjetas de estadísticas - Estilo datos.gob.mx */}
      <section className="bg-white py-6 md:py-12 -mt-6 md:-mt-8 relative z-10">
        <div className="container mx-auto px-4">
          {/* Móvil: Columna única, Desktop: 4 columnas */}
          <div className="flex flex-col md:grid md:grid-cols-4 gap-4 md:gap-6">
            {/* Tarjeta 1 */}
            <div className="bg-white rounded-xl p-5 md:p-6 text-center shadow-md">
              <p className="text-4xl md:text-5xl font-bold text-[#333] mb-3">2200</p>
              <a href="https://datos.gob.mx/visualizador" className="inline-block bg-[#611232] text-white text-sm px-6 py-2.5 rounded-full hover:bg-[#4d0f28] transition-colors w-full md:w-auto">
                Visualizaciones de datos
              </a>
            </div>

            {/* Tarjeta 2 */}
            <div className="bg-white rounded-xl p-5 md:p-6 text-center shadow-md">
              <p className="text-4xl md:text-5xl font-bold text-[#333] mb-3">6285</p>
              <a href="https://datos.gob.mx/dataset" className="inline-block bg-[#611232] text-white text-sm px-6 py-2.5 rounded-full hover:bg-[#4d0f28] transition-colors w-full md:w-auto">
                Bases de datos
              </a>
            </div>

            {/* Tarjeta 3 */}
            <div className="bg-white rounded-xl p-5 md:p-6 text-center shadow-md">
              <p className="text-4xl md:text-5xl font-bold text-[#333] mb-3">184</p>
              <a href="https://datos.gob.mx/organization" className="inline-block bg-[#611232] text-white text-sm px-6 py-2.5 rounded-full hover:bg-[#4d0f28] transition-colors w-full md:w-auto">
                Instituciones
              </a>
            </div>

            {/* Tarjeta 4 */}
            <div className="bg-white rounded-xl p-5 md:p-6 text-center shadow-md">
              <p className="text-4xl md:text-5xl font-bold text-[#333] mb-3">28</p>
              <a href="https://datos.gob.mx/group" className="inline-block bg-[#611232] text-white text-sm px-6 py-2.5 rounded-full hover:bg-[#4d0f28] transition-colors w-full md:w-auto">
                Categorías
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Sección Consulta por categoría */}
      <section className="bg-white py-8 md:py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-xl md:text-3xl font-bold text-center text-[#333] mb-8 md:mb-10">
            Consulta por categoría
          </h2>

          {/* Móvil: Lista vertical, Desktop: Grid 3 columnas */}
          <div className="flex flex-col md:grid md:grid-cols-3 gap-4 md:gap-8 max-w-4xl mx-auto">
            {/* Categoría 1 */}
            <a href="https://datos.gob.mx/group/agricultura" className="flex items-center gap-3 group p-3 md:p-0 bg-gray-50 md:bg-transparent rounded-lg">
              <div className="w-12 h-12 bg-[#cec5aa]/40 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-[#A57F2C]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-[#611232] underline decoration-[#611232]">Agricultura</p>
                <p className="text-sm text-gray-500">139 Bases de datos</p>
              </div>
            </a>

            {/* Categoría 2 */}
            <a href="https://datos.gob.mx/group/cultura" className="flex items-center gap-3 group p-3 md:p-0 bg-gray-50 md:bg-transparent rounded-lg">
              <div className="w-12 h-12 bg-[#cec5aa]/40 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-[#A57F2C]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-[#611232] underline decoration-[#611232]">Cultura</p>
                <p className="text-sm text-gray-500">187 Bases de datos</p>
              </div>
            </a>

            {/* Categoría 3 */}
            <a href="https://datos.gob.mx/group/deporte" className="flex items-center gap-3 group p-3 md:p-0 bg-gray-50 md:bg-transparent rounded-lg">
              <div className="w-12 h-12 bg-[#cec5aa]/40 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-[#A57F2C]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-[#611232] underline decoration-[#611232]">Deporte</p>
                <p className="text-sm text-gray-500">10 Bases de datos</p>
              </div>
            </a>

            {/* Categoría 4 */}
            <a href="https://datos.gob.mx/group/derechos_humanos" className="flex items-center gap-3 group p-3 md:p-0 bg-gray-50 md:bg-transparent rounded-lg">
              <div className="w-12 h-12 bg-[#cec5aa]/40 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-[#A57F2C]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-[#611232] underline decoration-[#611232]">Derechos humanos</p>
                <p className="text-sm text-gray-500">58 Bases de datos</p>
              </div>
            </a>

            {/* Categoría 5 */}
            <a href="https://datos.gob.mx/group/ciencia_tecnologia" className="flex items-center gap-3 group p-3 md:p-0 bg-gray-50 md:bg-transparent rounded-lg">
              <div className="w-12 h-12 bg-[#cec5aa]/40 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-[#A57F2C]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-[#611232] underline decoration-[#611232]">Ciencia y tecnología</p>
                <p className="text-sm text-gray-500">194 Bases de datos</p>
              </div>
            </a>

            {/* Categoría 6 */}
            <a href="https://datos.gob.mx/group/catalogo_datos" className="flex items-center gap-3 group p-3 md:p-0 bg-gray-50 md:bg-transparent rounded-lg">
              <div className="w-12 h-12 bg-[#cec5aa]/40 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-[#A57F2C]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-[#611232] underline decoration-[#611232]">Catálogo de datos</p>
                <p className="text-sm text-gray-500">5 Bases de datos</p>
              </div>
            </a>
          </div>

          <div className="text-center mt-8 md:mt-10">
            <a href="https://datos.gob.mx/group/" className="inline-block bg-[#611232] text-white px-8 py-3 rounded-full hover:bg-[#4d0f28] transition-colors font-medium w-full md:w-auto max-w-xs">
              Ver todas las categorías
            </a>
          </div>
        </div>
      </section>

      {/* Bases de datos más utilizadas */}
      <section className="bg-[#e5e5e5] py-8 md:py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-xl md:text-3xl font-bold text-center text-[#333] mb-8 md:mb-10">
            Bases de datos más utilizadas
          </h2>

          <div className="flex flex-col md:grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Base 1 */}
            <div className="bg-white border-l-4 border-[#611232] p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-[#611232]/10 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-[#611232]/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
              </div>
              <p className="font-medium text-gray-800 mb-4">Instrumentos de DDH y PEG</p>
              <a href="https://datos.gob.mx/dataset/instrumentos_ddh_peg" className="inline-block bg-[#611232] text-white text-sm px-5 py-2 rounded hover:bg-[#4d0f28] transition-colors">
                Ver más
              </a>
            </div>

            {/* Base 2 */}
            <div className="bg-white border-l-4 border-[#611232] p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-[#611232]/10 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-[#611232]/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
              </div>
              <p className="font-medium text-gray-800 mb-4">Instrumentos y actividades de la DDH y PEG</p>
              <a href="https://datos.gob.mx/dataset/instrumentos_actividades_ddh_peg" className="inline-block bg-[#611232] text-white text-sm px-5 py-2 rounded hover:bg-[#4d0f28] transition-colors">
                Ver más
              </a>
            </div>

            {/* Base 3 */}
            <div className="bg-white border-l-4 border-[#611232] p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-[#611232]/10 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-[#611232]/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
              </div>
              <p className="font-medium text-gray-800 mb-4">Actividades exterior SESNA</p>
              <a href="https://datos.gob.mx/dataset/actividades_exterior_sesna" className="inline-block bg-[#611232] text-white text-sm px-5 py-2 rounded hover:bg-[#4d0f28] transition-colors">
                Ver más
              </a>
            </div>
          </div>

          <div className="text-center mt-8 md:mt-10">
            <a href="https://historico.datos.gob.mx/" className="text-[#611232] hover:underline font-medium inline-flex items-center gap-1">
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
                src="/logo-gob.png"
                alt="Gobierno de México"
                className="h-14 md:h-16 mb-4 brightness-0 invert mx-auto md:mx-0"
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
