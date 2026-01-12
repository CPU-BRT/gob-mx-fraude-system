"use client";

import { Search, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
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
    <main className="min-h-screen bg-white">
      {/* Header - Mobile: logo + hamburger, Desktop: full nav */}
      <header className="bg-[#6B1839] text-white">
        <div className="container mx-auto px-4 py-3 md:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-4">
            <img
              src="https://ext.same-assets.com/2098432521/3519242953.png"
              alt="Gobierno de México"
              className="h-10 md:h-14"
            />
          </div>
          {/* Mobile: Hamburger menu */}
          <div className="md:hidden">
            <Menu className="h-6 w-6" />
          </div>
          {/* Desktop: Full navigation */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8">
            <a href="https://www.gob.mx/index.xhtml" className="hover:underline text-base font-medium">Trámites</a>
            <a href="https://www.gob.mx/gobierno" className="hover:underline text-base font-medium">Gobierno</a>
            <a href="https://www.gob.mx" className="hover:underline text-base font-medium">Iniciar sesión</a>
            <a href="https://www.gob.mx" className="hover:opacity-80">
              <img src="https://ext.same-assets.com/2098432521/1174755020.svg" alt="Llave MX" className="h-7 brightness-0 invert" />
            </a>
            <a href="https://www.gob.mx/busqueda" className="hover:opacity-80">
              <Search className="h-5 w-5" />
            </a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#2d0a1a] via-[#4d1028] to-[#9d3d5c] text-white py-8 md:py-16 lg:py-24 relative overflow-hidden">
        {/* Background image - Desktop only */}
        <div className="hidden md:flex absolute w-[40%] right-[12%] items-start justify-center overflow-hidden top-[80px]">
          <img
            src="https://ext.same-assets.com/2098432521/211302497.png"
            alt="Mujeres indígenas mexicanas"
            className="h-[280px] w-auto object-cover object-top"
          />
        </div>

        <div className="container mx-auto px-4 md:px-8 relative">
          {/* Mobile: Centered, Desktop: Left aligned */}
          <div className="text-center md:text-left md:max-w-xl md:ml-[15%] lg:ml-[18%]">
            <h1 className="text-5xl md:text-5xl lg:text-7xl font-bold mb-4 md:mb-6">gob.mx</h1>
            <h2 className="text-xl md:text-2xl lg:text-4xl font-light mb-1 md:mb-2 leading-tight">Buscador de trámites federales</h2>
            <h2 className="text-xl md:text-2xl lg:text-4xl font-light mb-8 md:mb-12 leading-tight">y programas sociales</h2>
          </div>

          {/* Search Bar */}
          <div className="max-w-6xl w-full mx-auto flex items-center justify-center">
            <div className="flex items-center overflow-hidden rounded-full shadow-xl w-full">
              <Input
                type="text"
                placeholder="Ejemplo: acta de nacimiento"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value.toUpperCase())}
                onKeyPress={handleKeyPress}
                className="flex-1 border-0 text-black text-base md:text-lg lg:text-xl px-4 md:px-6 lg:px-8 py-4 md:py-7 lg:py-8 focus-visible:ring-0 placeholder:text-gray-400 placeholder:italic bg-white rounded-none h-full min-w-0"
                maxLength={50}
              />
              <div
                onClick={buscarFolio}
                className="bg-[#621931] px-6 md:px-8 lg:px-10 py-4 md:py-7 lg:py-8 flex items-center justify-center cursor-pointer hover:bg-[#4d1028] flex-shrink-0"
              >
                <Search className="h-6 w-6 md:h-7 md:w-7 lg:h-8 lg:w-8 text-white" />
              </div>
            </div>
          </div>

          {/* Resultados de búsqueda */}
          {mostrarResultados && (
            <div className="max-w-6xl w-full mx-auto mt-6 px-0">
              {buscando ? (
                <div className="bg-white rounded-xl p-6 text-center shadow-lg">
                  <p className="text-gray-600">Buscando...</p>
                </div>
              ) : error ? (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                  <p className="text-red-700">{error}</p>
                </div>
              ) : casoEncontrado ? (
                <div className="bg-gray-100 rounded-xl p-6 md:p-8 shadow-2xl">
                  <div className="flex justify-between items-start mb-6">
                    <h3 className="text-2xl font-bold text-[#6B1839]">Resultados</h3>
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-[#6B1839] to-[#8B2446] text-white rounded-lg p-4 shadow-sm">
                      <p className="text-sm text-white/80 mb-1">FOLIO:</p>
                      <p className="text-xl font-bold">{casoEncontrado.folio}</p>
                    </div>

                    <div className="bg-[#2c8e3c] text-white rounded-lg p-4 shadow-sm">
                      <p className="text-sm text-white/90 mb-1">CLIENTE:</p>
                      <p className="text-base font-semibold text-white">{casoEncontrado.cliente}</p>
                    </div>

                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <p className="text-sm text-gray-600 mb-1">TIPO DE FRAUDE:</p>
                      <p className="text-base font-semibold text-gray-800">{casoEncontrado.tipoFraude}</p>
                    </div>

                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <p className="text-sm text-gray-600 mb-1">LICENCIADO:</p>
                      <p className="text-base font-semibold text-gray-800">{casoEncontrado.licenciado}</p>
                    </div>

                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <p className="text-sm text-gray-600 mb-1">RECUPERACIÓN:</p>
                      <p className="text-lg font-bold text-gray-800">${casoEncontrado.recuperacion?.toLocaleString('es-MX', {minimumFractionDigits: 2})}</p>
                    </div>

                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <p className="text-sm text-gray-600 mb-1">INDEMNIZACIÓN:</p>
                      <p className="text-lg font-bold text-gray-800">${casoEncontrado.indemnizacion?.toLocaleString('es-MX', {minimumFractionDigits: 2})}</p>
                    </div>

                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <p className="text-sm text-gray-600 mb-1">PENALIZACIÓN:</p>
                      <p className="text-lg font-bold text-gray-800">${casoEncontrado.penalizacion?.toLocaleString('es-MX', {minimumFractionDigits: 2})}</p>
                    </div>

                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <p className="text-sm text-gray-600 mb-1">TOTAL A ENTREGAR:</p>
                      <p className="text-lg font-bold text-gray-800">${casoEncontrado.totalEntregar?.toLocaleString('es-MX', {minimumFractionDigits: 2})}</p>
                    </div>

                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <p className="text-sm text-gray-600 mb-1">PAGO PENDIENTE:</p>
                      <p className="text-lg font-bold text-gray-800">${casoEncontrado.pagoPendiente?.toLocaleString('es-MX', {minimumFractionDigits: 2})}</p>
                    </div>

                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <p className="text-sm text-gray-600 mb-1">CONCEPTO DE PAGO:</p>
                      <p className="text-base font-semibold text-gray-800">{casoEncontrado.conceptoPago}</p>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {/* Quick Access Buttons - Horizontal scroll on mobile */}
          <div className="mt-8 overflow-x-auto scrollbar-hide">
            <div className="flex gap-3 md:flex-wrap md:justify-center min-w-max md:min-w-0 px-0 md:px-4">
              <Button asChild className="bg-[#9b2247] hover:bg-[#7a1b38] border-2 border-white rounded-full px-5 py-2.5 text-sm md:text-base font-semibold whitespace-nowrap text-white shadow-sm">
                <a href="https://www.gob.mx/cedulaprofesional" target="_blank" rel="noopener noreferrer">Cédula profesional</a>
              </Button>
              <Button asChild className="bg-[#9b2247] hover:bg-[#7a1b38] border-2 border-white rounded-full px-5 py-2.5 text-sm md:text-base font-semibold whitespace-nowrap text-white shadow-sm">
                <a href="https://www.gob.mx/curp/" target="_blank" rel="noopener noreferrer">CURP</a>
              </Button>
              <Button asChild className="bg-[#9b2247] hover:bg-[#7a1b38] border-2 border-white rounded-full px-5 py-2.5 text-sm md:text-base font-semibold whitespace-nowrap text-white shadow-sm">
                <a href="https://www.miregistrocivil.gob.mx" target="_blank" rel="noopener noreferrer">Acta de nacimiento</a>
              </Button>
              <Button asChild className="bg-[#9b2247] hover:bg-[#7a1b38] border-2 border-white rounded-full px-5 py-2.5 text-sm md:text-base font-semibold whitespace-nowrap text-white shadow-sm">
                <a href="https://www.gob.mx/pasaporte" target="_blank" rel="noopener noreferrer">Pasaporte</a>
              </Button>
              <Button asChild className="bg-[#9b2247] hover:bg-[#7a1b38] border-2 border-white rounded-full px-5 py-2.5 text-sm md:text-base font-semibold whitespace-nowrap text-white shadow-sm">
                <a href="https://www.imss.gob.mx/tramites/imss02025a" target="_blank" rel="noopener noreferrer">Semanas cotizadas del IMSS</a>
              </Button>
            </div>
          </div>

          {/* Info Box */}
          <div className="max-w-6xl w-full mx-auto mt-8 border-2 border-white/60 rounded-lg p-5 md:p-6 bg-[#621931]/30 backdrop-blur-sm">
            <p className="text-sm md:text-base leading-relaxed text-center">
              Si tu búsqueda de trámite o programa social es <strong>estatal o municipal</strong>, es posible que aún no se encuentre en el portal. <strong>Estamos trabajando para integrarlos próximamente.</strong>
            </p>
          </div>
        </div>

        {/* Decorative wave */}
        <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-none">
          <svg className="relative block w-full h-12 md:h-20" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,0 C150,80 350,80 600,40 C850,0 1050,0 1200,40 L1200,120 L0,120 Z" fill="#f6f2f4"></path>
          </svg>
        </div>
      </section>

      {/* Stats Section - Stack on mobile, Grid on desktop */}
      <section className="py-8 md:py-12 bg-[#f6f2f4]">
        <div className="container mx-auto px-4">
          {/* Mobile: Vertical cards, Desktop: Grid */}
          <div className="space-y-4 md:space-y-0 md:grid md:grid-cols-3 md:gap-4">

            {/* Consulta Card - Mobile first */}
            <div className="md:col-span-1 space-y-4">
              {/* Trámites Card */}
              <a href="https://www.gob.mx/index.xhtml" className="block bg-gradient-to-r from-[#6B1839] to-[#8B2446] text-white rounded-2xl cursor-pointer hover:shadow-xl transition-shadow relative overflow-hidden">
                <div className="p-6 md:p-8">
                  <p className="text-sm text-white/80 mb-1">Consulta</p>
                  <div className="text-4xl md:text-6xl font-bold mb-1 leading-none">Trámites federales</div>
                </div>
                <div className="absolute -right-10 top-1/2 -translate-y-1/2 w-24 h-24 bg-[#a84862] rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-white -ml-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </div>
              </a>

              {/* Programas Sociales Card */}
              <a href="https://www.gob.mx/index.xhtml" className="block bg-gradient-to-r from-[#6B1839] to-[#8B2446] text-white rounded-2xl cursor-pointer hover:shadow-xl transition-shadow relative overflow-hidden">
                <div className="p-6 md:p-8">
                  <p className="text-sm text-white/80 mb-1">Consulta</p>
                  <div className="text-4xl md:text-6xl font-bold mb-1 leading-none">Programas sociales</div>
                </div>
                <div className="absolute -right-10 top-1/2 -translate-y-1/2 w-24 h-24 bg-[#a84862] rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-white -ml-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </div>
              </a>
            </div>

            {/* Llave MX Card */}
            <div className="md:col-span-1">
              <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 md:p-8 flex flex-col items-center justify-center h-full min-h-[200px]">
                <img
                  src="https://ext.same-assets.com/2098432521/1174755020.svg"
                  alt="Llave MX"
                  className="h-16 md:h-20 mb-4"
                />
                <p className="text-center text-gray-700 mb-4 text-sm md:text-base">
                  Accede a trámites y servicios del gobierno
                </p>
                <Button asChild className="bg-[#6B1839] hover:bg-[#8B1F3F] text-white px-6 py-2">
                  <a href="https://www.gob.mx" target="_blank" rel="noopener noreferrer">Crear cuenta</a>
                </Button>
              </div>
            </div>

            {/* No lo dejes pasar Card */}
            <div className="md:col-span-1">
              <div className="bg-white border-2 border-gray-200 rounded-2xl p-5 md:p-6 h-full">
                <h3 className="text-xl md:text-2xl font-bold mb-4">No lo dejes pasar</h3>

                <div className="space-y-4">
                  <div className="border-b pb-4">
                    <p className="text-sm text-gray-600 mb-2">Hasta 27 de febrero 2026</p>
                    <h4 className="font-bold text-[#6B1839] mb-2 text-sm md:text-base">
                      Jugando; Inventamos y Creamos: Primer Concurso de Propiedad Intelectual para Niñas y Niños
                    </h4>
                    <a href="https://jugandoinventamosycreamos.impi.gob.mx/" target="_blank" rel="noopener noreferrer" className="text-[#6B1839] text-sm font-semibold flex items-center gap-1 hover:underline">
                      Más información
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    </a>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-2">Hasta el 17 de abril 2026</p>
                    <h4 className="font-bold text-[#6B1839] mb-2 text-sm md:text-base">
                      Convocatoria Copa FutBotMx
                    </h4>
                    <a href="https://secihti.mx/futbotmx/" target="_blank" rel="noopener noreferrer" className="text-[#6B1839] text-sm font-semibold flex items-center gap-1 hover:underline">
                      Más información
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#6B1839] text-white py-10 md:py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Logo */}
            <div>
              <img
                src="https://ext.same-assets.com/2098432521/3867328593.png"
                alt="Gobierno de México"
                className="h-14 md:h-16 mb-4"
              />
            </div>

            {/* Enlaces */}
            <div>
              <h3 className="font-bold mb-4">Enlaces</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="https://participa.gob.mx/" target="_blank" rel="noopener noreferrer" className="hover:underline">Participa</a></li>
                <li><a href="http://www.ordenjuridico.gob.mx/" target="_blank" rel="noopener noreferrer" className="hover:underline">Marco jurídico</a></li>
                <li><a href="https://consultapublicamx.plataformadetransparencia.org.mx/vut-web/faces/view/consultaPublica.xhtml#inicio" target="_blank" rel="noopener noreferrer" className="hover:underline">Plataforma Nacional de Transparencia</a></li>
                <li><a href="https://transparencia.gob.mx/home.html" target="_blank" rel="noopener noreferrer" className="hover:underline">Transparencia para el pueblo</a></li>
                <li><a href="https://alertadores.buengobierno.gob.mx/" target="_blank" rel="noopener noreferrer" className="hover:underline">Alerta</a></li>
              </ul>
            </div>

            {/* ¿Qué es gob.mx? */}
            <div>
              <h3 className="font-bold mb-4">¿Qué es gob.mx?</h3>
              <p className="text-sm mb-2">
                Es el portal único de trámites, información y participación ciudadana.{" "}
                <a href="https://www.gob.mx/que-es-gobmx" target="_blank" rel="noopener noreferrer" className="underline">Leer más</a>
              </p>
              <ul className="space-y-2 text-sm mt-4">
                <li><a href="https://datos.gob.mx/" target="_blank" rel="noopener noreferrer" className="hover:underline">Portal de datos abiertos</a></li>
                <li><a href="https://www.gob.mx/accesibilidad" target="_blank" rel="noopener noreferrer" className="hover:underline">Declaración de Accesibilidad</a></li>
                <li><a href="https://www.gob.mx/terminos" target="_blank" rel="noopener noreferrer" className="hover:underline">Términos y Condiciones</a></li>
              </ul>
            </div>

            {/* Síguenos */}
            <div>
              <h3 className="font-bold mb-4">
                <a href="https://sidec.buengobierno.gob.mx/#!/" target="_blank" rel="noopener noreferrer" className="hover:underline">Denuncia contra servidores públicos</a>
              </h3>
              <h3 className="font-bold mb-4 mt-6">Síguenos en</h3>
              <div className="flex gap-4 mb-6 flex-wrap">
                <a href="https://www.facebook.com/gobmexico" target="_blank" rel="noopener noreferrer" className="hover:opacity-80">
                  <img src="https://ext.same-assets.com/2098432521/2927868176.png" alt="Facebook" className="h-8" />
                </a>
                <a href="https://x.com/GobiernoMX" target="_blank" rel="noopener noreferrer" className="hover:opacity-80">
                  <img src="https://ext.same-assets.com/2098432521/470247002.png" alt="X" className="h-8" />
                </a>
                <a href="https://www.instagram.com/gobmexico/" target="_blank" rel="noopener noreferrer" className="hover:opacity-80">
                  <img src="https://ext.same-assets.com/2098432521/3918442242.png" alt="Instagram" className="h-8" />
                </a>
                <a href="https://www.youtube.com/@gobiernodemexico" target="_blank" rel="noopener noreferrer" className="hover:opacity-80">
                  <img src="https://ext.same-assets.com/2098432521/894758497.png" alt="YouTube" className="h-8" />
                </a>
              </div>
              <div className="flex items-center gap-2">
                <img src="https://ext.same-assets.com/2098432521/2199402924.png" alt="079" className="h-12" />
              </div>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
