// Sistema de Administración - Generación de Folios y Almacenamiento

// Función para generar folio único con formato: D-PÑA09SA (9 caracteres)
function generarFolio() {
    // Formato: LETRA-GUIÓN-LETRA-LETRA-LETRA-NÚMERO-NÚMERO-LETRA-LETRA
    // Ejemplo: D-PÑA09SA
    
    const letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZÑ';
    const numeros = '0123456789';
    
    // Primera letra (posición 0)
    const letra1 = letras[Math.floor(Math.random() * letras.length)];
    
    // Guión (posición 1)
    const guion = '-';
    
    // Tres letras (posiciones 2, 3, 4)
    const letra2 = letras[Math.floor(Math.random() * letras.length)];
    const letra3 = letras[Math.floor(Math.random() * letras.length)];
    const letra4 = letras[Math.floor(Math.random() * letras.length)];
    
    // Dos números (posiciones 5, 6)
    const num1 = numeros[Math.floor(Math.random() * numeros.length)];
    const num2 = numeros[Math.floor(Math.random() * numeros.length)];
    
    // Dos letras finales (posiciones 7, 8)
    const letra5 = letras[Math.floor(Math.random() * letras.length)];
    const letra6 = letras[Math.floor(Math.random() * letras.length)];
    
    const folio = letra1 + guion + letra2 + letra3 + letra4 + num1 + num2 + letra5 + letra6;
    
    return folio;
}

// Función para verificar si un folio ya existe
function folioExiste(folio) {
    const casos = obtenerCasos();
    return casos.some(caso => caso.folio === folio);
}

// Función para generar un folio único (verificando que no exista)
function generarFolioUnico() {
    let folio;
    let intentos = 0;
    const maxIntentos = 100;
    
    do {
        folio = generarFolio();
        intentos++;
        if (intentos > maxIntentos) {
            // Si después de muchos intentos no encontramos uno único, agregar timestamp
            const timestamp = Date.now().toString().slice(-4);
            folio = generarFolio().slice(0, 7) + timestamp.slice(0, 2);
        }
    } while (folioExiste(folio) && intentos <= maxIntentos);
    
    return folio;
}

// Función para obtener todos los casos almacenados
function obtenerCasos() {
    const casosJSON = localStorage.getItem('casosFraude');
    if (casosJSON) {
        try {
            return JSON.parse(casosJSON);
        } catch (e) {
            console.error('Error al parsear casos:', e);
            return [];
        }
    }
    return [];
}

// Función para guardar un caso (localStorage + API)
async function guardarCaso(caso) {
    // Guardar en localStorage (respaldo local)
    const casos = obtenerCasos();
    casos.push(caso);
    localStorage.setItem('casosFraude', JSON.stringify(casos));
    console.log('Caso guardado en localStorage:', caso);
    console.log('Total de casos guardados:', casos.length);
    console.log('Folio guardado:', caso.folio);
    
    // Intentar guardar en el servidor (API)
    try {
        // Detectar si estamos en file:// o en servidor
        let API_URL;
        if (window.location.protocol === 'file:') {
            // Si estamos en file://, usar localhost:3000
            API_URL = 'http://localhost:3000/api/casos';
        } else {
            // Si estamos en servidor, usar ruta relativa
            API_URL = '/api/casos';
        }
        
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(caso),
        });
        
        if (response.ok) {
            console.log('Caso guardado en servidor exitosamente');
        } else {
            console.warn('No se pudo guardar en servidor, pero se guardó localmente');
        }
    } catch (error) {
        console.warn('Error al guardar en servidor (se guardó localmente):', error);
        // Si falla, el caso ya está guardado en localStorage, así que no hay problema
    }
    
    return true;
}

// Función para buscar un caso por folio
function buscarCasoPorFolio(folio) {
    const casos = obtenerCasos();
    return casos.find(caso => caso.folio.toUpperCase() === folio.toUpperCase());
}

// Función para normalizar nombre (eliminar espacios extras y convertir a mayúsculas)
function normalizarNombre(texto) {
    if (!texto) return '';
    return texto.trim().toUpperCase().replace(/\s+/g, ' ');
}

// Función para construir el nombre completo en formato "NOMBRES: X APELLIDOS: Y"
function construirNombreCompleto(nombres, apellidos) {
    const nombresNorm = normalizarNombre(nombres);
    const apellidosNorm = normalizarNombre(apellidos);
    return `NOMBRES: ${nombresNorm} APELLIDOS: ${apellidosNorm}`;
}

// Función para buscar el caso de un cliente existente
function buscarCasoClienteExistente(nombres, apellidos) {
    const casos = obtenerCasos();
    const nombreCompletoBuscado = construirNombreCompleto(nombres, apellidos);
    const nombresNorm = normalizarNombre(nombres);
    const apellidosNorm = normalizarNombre(apellidos);
    
    return casos.find(caso => {
        if (!caso.cliente) return false;
        
        // Si el caso tiene el formato nuevo (con "NOMBRES:" y "APELLIDOS:")
        if (caso.cliente.includes('NOMBRES:') && caso.cliente.includes('APELLIDOS:')) {
            return normalizarNombre(caso.cliente) === normalizarNombre(nombreCompletoBuscado);
        }
        
        // Si el caso tiene el formato antiguo (solo texto), comparar normalizado
        // También verificar si tiene campos separados de nombres y apellidos
        if (caso.nombres && caso.apellidos) {
            const casoNombresNorm = normalizarNombre(caso.nombres);
            const casoApellidosNorm = normalizarNombre(caso.apellidos);
            return casoNombresNorm === nombresNorm && casoApellidosNorm === apellidosNorm;
        }
        
        // Comparar el nombre completo normalizado
        const nombreCompletoNorm = `${nombresNorm} ${apellidosNorm}`;
        return normalizarNombre(caso.cliente) === nombreCompletoNorm;
    });
}

// Función para verificar si un cliente (nombre completo) ya existe
function clienteExiste(nombres, apellidos) {
    return buscarCasoClienteExistente(nombres, apellidos) !== undefined;
}

// Función para validar cliente duplicado (llamada desde el HTML) - GLOBAL
window.validarClienteDuplicado = function() {
    const nombresInput = document.getElementById('nombres');
    const apellidosInput = document.getElementById('apellidos');
    const nombresError = document.getElementById('nombresError');
    const apellidosError = document.getElementById('apellidosError');
    
    if (!nombresInput || !apellidosInput || !nombresError || !apellidosError) {
        return true; // Si no existen los elementos, no validar
    }
    
    const nombres = nombresInput.value.trim();
    const apellidos = apellidosInput.value.trim();
    
    // Limpiar errores anteriores
    nombresError.style.display = 'none';
    apellidosError.style.display = 'none';
    nombresInput.style.borderColor = '#e0e0e0';
    apellidosInput.style.borderColor = '#e0e0e0';
    
    // Solo validar si ambos campos tienen contenido
    if (nombres && apellidos) {
        const casoExistente = buscarCasoClienteExistente(nombres, apellidos);
        if (casoExistente) {
            nombresError.textContent = 'Este cliente ya está registrado.';
            nombresError.style.display = 'block';
            apellidosError.textContent = 'Este cliente ya está registrado.';
            apellidosError.style.display = 'block';
            nombresInput.style.borderColor = '#dc3545';
            apellidosInput.style.borderColor = '#dc3545';
            
            // Mostrar modal con información del caso existente
            mostrarModalClienteDuplicado(casoExistente);
            return false;
        }
    }
    
    return true;
};

// Función para cerrar el mensaje de éxito
function cerrarMensajeExito() {
    const successMessage = document.getElementById('successMessage');
    if (successMessage) {
        successMessage.style.display = 'none';
    }
}

// Función para copiar el folio al portapapeles
function copiarFolio() {
    const folioMostrado = document.getElementById('folioMostrado');
    if (!folioMostrado) return;
    
    // Obtener el folio original desde data-folio (siempre la fuente de verdad)
    let folio = folioMostrado.getAttribute('data-folio');
    
    // Si no existe en data-folio, obtenerlo del textContent (solo si no es "✓ Copiado!")
    if (!folio) {
        const textContent = folioMostrado.textContent.trim();
        if (textContent && textContent !== '-' && textContent !== '✓ Copiado!') {
            folio = textContent;
            // Guardarlo en data-folio para futuras copias
            folioMostrado.setAttribute('data-folio', folio);
        }
    }
    
    if (!folio || folio === '-' || folio === '✓ Copiado!') {
        console.warn('No se puede copiar: folio no válido');
        return;
    }
    
    // Copiar el folio original al portapapeles (SIEMPRE desde data-folio)
    const folioACopiar = folioMostrado.getAttribute('data-folio') || folio;
    navigator.clipboard.writeText(folioACopiar).then(function() {
        // Feedback visual (guardar el texto original antes de cambiarlo)
        const originalText = folioMostrado.getAttribute('data-folio') || folio;
        folioMostrado.textContent = '✓ Copiado!';
        folioMostrado.style.background = '#28a745';
        folioMostrado.style.color = 'white';
        
        setTimeout(() => {
            folioMostrado.textContent = originalText;
            folioMostrado.style.background = 'white';
            folioMostrado.style.color = '#155724';
        }, 2000);
    }).catch(function(err) {
        console.error('Error al copiar:', err);
        // Fallback: seleccionar texto
        const range = document.createRange();
        range.selectNode(folioMostrado);
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(range);
    });
}

// Función para copiar el folio del modal
function copiarFolioModal() {
    const folioMostrado = document.getElementById('modalFolioExistente');
    if (!folioMostrado) return;
    
    // Obtener el folio original desde data-folio (siempre la fuente de verdad)
    let folio = folioMostrado.getAttribute('data-folio');
    
    // Si no existe en data-folio, obtenerlo del textContent (solo si no es "✓ Copiado!")
    if (!folio) {
        const textContent = folioMostrado.textContent.trim();
        if (textContent && textContent !== '-' && textContent !== '✓ Copiado!') {
            folio = textContent;
            // Guardarlo en data-folio para futuras copias
            folioMostrado.setAttribute('data-folio', folio);
        }
    }
    
    if (!folio || folio === '-' || folio === '✓ Copiado!') {
        console.warn('No se puede copiar: folio no válido');
        return;
    }
    
    // Copiar el folio original al portapapeles (SIEMPRE desde data-folio)
    const folioACopiar = folioMostrado.getAttribute('data-folio') || folio;
    navigator.clipboard.writeText(folioACopiar).then(function() {
        // Feedback visual (guardar el texto original antes de cambiarlo)
        const originalText = folioMostrado.getAttribute('data-folio') || folio;
        folioMostrado.textContent = '✓ Copiado!';
        folioMostrado.style.background = '#28a745';
        folioMostrado.style.color = 'white';
        
        setTimeout(() => {
            folioMostrado.textContent = originalText;
            folioMostrado.style.background = 'white';
            folioMostrado.style.color = '#611232';
        }, 2000);
    }).catch(function(err) {
        console.error('Error al copiar:', err);
        // Fallback: seleccionar texto
        const range = document.createRange();
        range.selectNode(folioMostrado);
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(range);
    });
}

// Función para mostrar modal de cliente duplicado
function mostrarModalClienteDuplicado(casoExistente) {
    const modal = document.getElementById('modalClienteDuplicado');
    const modalFolio = document.getElementById('modalFolioExistente');
    const modalLicenciado = document.getElementById('modalLicenciadoExistente');
    
    if (modal && modalFolio && modalLicenciado) {
        const folio = casoExistente.folio || '-';
        modalFolio.textContent = folio;
        // Guardar el folio en data-folio para poder copiarlo correctamente
        modalFolio.setAttribute('data-folio', folio);
        modalLicenciado.textContent = casoExistente.licenciado || 'No asignado';
        modal.classList.add('active');
    }
}

// Función para cerrar modal de cliente duplicado
function cerrarModalClienteDuplicado() {
    const modal = document.getElementById('modalClienteDuplicado');
    if (modal) {
        modal.classList.remove('active');
    }
}

// Cerrar modal al hacer clic fuera de él
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('modalClienteDuplicado');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                cerrarModalClienteDuplicado();
            }
        });
    }
});

// Inicialización del formulario
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('casoForm');
    const folioGeneradoElement = document.getElementById('folioGenerado');
    const successMessage = document.getElementById('successMessage');
    const errorMessage = document.getElementById('errorMessage');
    
    // Generar folio al cargar la página
    let folioActual = generarFolioUnico();
    folioGeneradoElement.textContent = folioActual;
    
    // Manejar envío del formulario
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Ocultar mensajes anteriores
        successMessage.style.display = 'none';
        errorMessage.style.display = 'none';
        
        // Obtener valores del formulario
        const nombres = document.getElementById('nombres').value.trim();
        const apellidos = document.getElementById('apellidos').value.trim();
        
        // Validar que nombres y apellidos estén llenos
        if (!nombres || !apellidos) {
            errorMessage.textContent = 'Por favor, completa los campos de NOMBRES y APELLIDOS.';
            errorMessage.style.display = 'block';
            return;
        }
        
        // Validar que el cliente no esté duplicado
        const casoExistente = buscarCasoClienteExistente(nombres, apellidos);
        if (casoExistente) {
            // Mostrar modal con información del caso existente
            mostrarModalClienteDuplicado(casoExistente);
            return;
        }
        
        // Construir nombre completo en formato "NOMBRES: X APELLIDOS: Y"
        const nombreCompleto = construirNombreCompleto(nombres, apellidos);
        
        // Obtener valores del formulario
        const caso = {
            folio: folioActual,
            cliente: nombreCompleto,
            nombres: nombres,
            apellidos: apellidos,
            tipoFraude: document.getElementById('tipoFraude').value.trim(),
            licenciado: document.getElementById('licenciado').value.trim(),
            recuperacion: parseFloat(document.getElementById('recuperacion').value) || 0,
            indemnizacion: parseFloat(document.getElementById('indemnizacion').value) || 0,
            penalizacion: parseFloat(document.getElementById('penalizacion').value) || 0,
            totalEntregar: parseFloat(document.getElementById('totalEntregar').value) || 0,
            pagoPendiente: parseFloat(document.getElementById('pagoPendiente').value) || 0,
            conceptoPago: document.getElementById('conceptoPago').value.trim(),
            fechaCreacion: new Date().toISOString()
        };
        
        // Validar que todos los campos requeridos estén llenos
        if (!caso.tipoFraude || !caso.licenciado || !caso.conceptoPago) {
            errorMessage.textContent = 'Por favor, completa todos los campos requeridos.';
            errorMessage.style.display = 'block';
            return;
        }
        
        // Guardar el caso
        try {
            await guardarCaso(caso);
            
            // Mostrar mensaje de éxito con el folio
            const folioMostrado = document.getElementById('folioMostrado');
            if (folioMostrado) {
                folioMostrado.textContent = caso.folio;
                // Guardar el folio en data-folio para poder copiarlo correctamente
                folioMostrado.setAttribute('data-folio', caso.folio);
            }
            successMessage.style.display = 'block';
            
            // Limpiar formulario
            form.reset();
            
            // Limpiar errores de validación
            const nombresError = document.getElementById('nombresError');
            const apellidosError = document.getElementById('apellidosError');
            const nombresInput = document.getElementById('nombres');
            const apellidosInput = document.getElementById('apellidos');
            if (nombresError) nombresError.style.display = 'none';
            if (apellidosError) apellidosError.style.display = 'none';
            if (nombresInput) nombresInput.style.borderColor = '#e0e0e0';
            if (apellidosInput) apellidosInput.style.borderColor = '#e0e0e0';
            
            // Generar nuevo folio
            folioActual = generarFolioUnico();
            folioGeneradoElement.textContent = folioActual;
            
            // NO ocultar automáticamente - el usuario debe cerrar manualmente con el X
            
        } catch (error) {
            console.error('Error al guardar:', error);
            errorMessage.textContent = 'Error al guardar el caso. Por favor, intenta nuevamente.';
            errorMessage.style.display = 'block';
        }
    });
});

