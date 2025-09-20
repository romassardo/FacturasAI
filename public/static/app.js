// Estado global de la aplicación
const state = {
    apiKey: localStorage.getItem('openai_api_key') || '',
    selectedModel: localStorage.getItem('selected_model') || 'gpt-4o-mini',
    fields: JSON.parse(localStorage.getItem('invoice_fields') || JSON.stringify([
        { name: 'numero_factura', description: 'Número de factura o ticket', enabled: true },
        { name: 'fecha', description: 'Fecha del documento', enabled: true },
        { name: 'emisor', description: 'Nombre del emisor/vendedor', enabled: true },
        { name: 'nif_emisor', description: 'NIF/CIF del emisor', enabled: true },
        { name: 'cliente', description: 'Nombre del cliente', enabled: true },
        { name: 'nif_cliente', description: 'NIF/CIF del cliente', enabled: false },
        { name: 'base_imponible', description: 'Base imponible', enabled: true },
        { name: 'iva', description: 'IVA', enabled: true },
        { name: 'total', description: 'Total de la factura', enabled: true },
        { name: 'metodo_pago', description: 'Método de pago', enabled: false },
        { name: 'concepto', description: 'Concepto o descripción', enabled: true }
    ])),
    processedInvoices: JSON.parse(localStorage.getItem('processed_invoices') || '[]'),
    currentImage: null
};

// Función para renderizar la aplicación
function renderApp() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <!-- Header -->
        <div class="bg-white shadow-sm border-b mb-6">
            <div class="px-6 py-4">
                <h1 class="text-2xl font-bold text-gray-800">
                    <i class="fas fa-file-invoice mr-2"></i>
                    Procesador de Facturas y Tickets con IA
                </h1>
                <p class="text-gray-600 mt-1">Extrae información automáticamente usando Vision AI</p>
            </div>
        </div>

        <!-- Configuración -->
        <div class="bg-white rounded-lg shadow mb-6 p-6">
            <h2 class="text-lg font-semibold mb-4">
                <i class="fas fa-cog mr-2"></i>Configuración
            </h2>
            
            <div class="grid md:grid-cols-2 gap-4 mb-4">
                <!-- API Key -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        API Key de OpenAI
                    </label>
                    <div class="flex gap-2">
                        <input type="password" 
                               id="apiKey" 
                               value="${state.apiKey}"
                               placeholder="sk-..." 
                               class="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <button onclick="validateApiKey()" 
                                class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                            <i class="fas fa-check"></i> Validar
                        </button>
                    </div>
                    <div id="keyStatus" class="mt-1 text-sm"></div>
                </div>

                <!-- Modelo -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        Modelo de IA
                    </label>
                    <select id="modelSelect" 
                            onchange="updateModel(this.value)"
                            class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="gpt-4o-mini" ${state.selectedModel === 'gpt-4o-mini' ? 'selected' : ''}>
                            GPT-4 Vision Mini (Más rápido)
                        </option>
                        <option value="gpt-4o" ${state.selectedModel === 'gpt-4o' ? 'selected' : ''}>
                            GPT-4 Vision (Más preciso)
                        </option>
                        <option value="gpt-4-turbo" ${state.selectedModel === 'gpt-4-turbo' ? 'selected' : ''}>
                            GPT-4 Turbo Vision
                        </option>
                    </select>
                </div>
            </div>

            <!-- Campos a extraer -->
            <div class="mt-6">
                <h3 class="text-md font-medium mb-3">Campos a Extraer</h3>
                <div class="grid md:grid-cols-3 gap-3">
                    ${state.fields.map((field, index) => `
                        <div class="flex items-center">
                            <input type="checkbox" 
                                   id="field_${index}" 
                                   ${field.enabled ? 'checked' : ''}
                                   onchange="toggleField(${index})"
                                   class="mr-2 h-4 w-4 text-blue-600">
                            <label for="field_${index}" class="text-sm">
                                ${field.description}
                            </label>
                        </div>
                    `).join('')}
                </div>
                
                <!-- Botón para añadir campo personalizado -->
                <button onclick="addCustomField()" 
                        class="mt-3 text-sm text-blue-600 hover:text-blue-800">
                    <i class="fas fa-plus mr-1"></i> Añadir campo personalizado
                </button>
            </div>
        </div>

        <!-- Zona de carga de archivos -->
        <div class="bg-white rounded-lg shadow mb-6 p-6">
            <h2 class="text-lg font-semibold mb-4">
                <i class="fas fa-upload mr-2"></i>Cargar Factura o Ticket
            </h2>
            
            <div id="dropZone" 
                 class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition cursor-pointer"
                 ondrop="handleDrop(event)" 
                 ondragover="handleDragOver(event)"
                 onclick="document.getElementById('fileInput').click()">
                
                <i class="fas fa-cloud-upload-alt text-4xl text-gray-400 mb-3"></i>
                <p class="text-gray-600">Arrastra aquí tu factura o ticket</p>
                <p class="text-sm text-gray-500 mt-1">o haz clic para seleccionar</p>
                <input type="file" 
                       id="fileInput" 
                       accept="image/*,.pdf" 
                       onchange="handleFileSelect(event)" 
                       class="hidden">
            </div>

            <!-- Vista previa de la imagen -->
            <div id="imagePreview" class="mt-4 hidden">
                <h3 class="text-md font-medium mb-2">Vista previa:</h3>
                <img id="previewImg" class="max-w-full h-auto rounded-lg shadow" style="max-height: 400px;">
                <button onclick="processImage()" 
                        class="mt-4 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium">
                    <i class="fas fa-magic mr-2"></i>Procesar con IA
                </button>
            </div>

            <!-- Indicador de carga -->
            <div id="loading" class="hidden mt-4">
                <div class="flex items-center justify-center">
                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    <span class="ml-3 text-gray-600">Procesando imagen con IA...</span>
                </div>
            </div>
        </div>

        <!-- Resultados -->
        <div id="resultsSection" class="bg-white rounded-lg shadow mb-6 p-6 hidden">
            <h2 class="text-lg font-semibold mb-4">
                <i class="fas fa-table mr-2"></i>Datos Extraídos
            </h2>
            
            <div id="resultsTable" class="overflow-x-auto">
                <!-- La tabla se insertará aquí -->
            </div>

            <div class="mt-4 flex gap-3">
                <button onclick="addToList()" 
                        class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                    <i class="fas fa-plus mr-2"></i>Añadir a la lista
                </button>
                <button onclick="clearResults()" 
                        class="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600">
                    <i class="fas fa-trash mr-2"></i>Limpiar
                </button>
            </div>
        </div>

        <!-- Lista de facturas procesadas -->
        <div id="invoiceList" class="bg-white rounded-lg shadow p-6 ${state.processedInvoices.length === 0 ? 'hidden' : ''}">
            <h2 class="text-lg font-semibold mb-4">
                <i class="fas fa-list mr-2"></i>Facturas Procesadas (${state.processedInvoices.length})
            </h2>
            
            <div class="overflow-x-auto">
                <table class="w-full text-sm">
                    <thead class="bg-gray-50">
                        <tr>
                            ${state.fields.filter(f => f.enabled).map(field => `
                                <th class="px-3 py-2 text-left font-medium text-gray-700">
                                    ${field.description}
                                </th>
                            `).join('')}
                            <th class="px-3 py-2 text-left font-medium text-gray-700">Acciones</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y">
                        ${state.processedInvoices.map((invoice, index) => `
                            <tr class="hover:bg-gray-50">
                                ${state.fields.filter(f => f.enabled).map(field => `
                                    <td class="px-3 py-2">${invoice[field.name] || '-'}</td>
                                `).join('')}
                                <td class="px-3 py-2">
                                    <button onclick="removeInvoice(${index})" 
                                            class="text-red-600 hover:text-red-800">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>

            <div class="mt-4 flex gap-3">
                <button onclick="exportToExcel()" 
                        class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium">
                    <i class="fas fa-file-excel mr-2"></i>Exportar a Excel
                </button>
                <button onclick="clearAllInvoices()" 
                        class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
                    <i class="fas fa-trash-alt mr-2"></i>Limpiar todo
                </button>
            </div>
        </div>
    `;

    // Validar API key al cargar si existe
    if (state.apiKey) {
        validateApiKey(false);
    }
}

// Funciones de gestión de estado
function updateApiKey(value) {
    state.apiKey = value;
    localStorage.setItem('openai_api_key', value);
}

function updateModel(value) {
    state.selectedModel = value;
    localStorage.setItem('selected_model', value);
}

function toggleField(index) {
    state.fields[index].enabled = !state.fields[index].enabled;
    localStorage.setItem('invoice_fields', JSON.stringify(state.fields));
    renderApp();
}

function addCustomField() {
    const name = prompt('Nombre del campo (sin espacios, ej: direccion):');
    const description = prompt('Descripción del campo:');
    
    if (name && description) {
        state.fields.push({
            name: name.toLowerCase().replace(/\s+/g, '_'),
            description: description,
            enabled: true
        });
        localStorage.setItem('invoice_fields', JSON.stringify(state.fields));
        renderApp();
    }
}

// Validar API Key
async function validateApiKey(showAlert = true) {
    const keyInput = document.getElementById('apiKey');
    const statusDiv = document.getElementById('keyStatus');
    const key = keyInput.value.trim();
    
    if (!key) {
        statusDiv.innerHTML = '<span class="text-yellow-600"><i class="fas fa-exclamation-triangle"></i> API key requerida</span>';
        return;
    }

    updateApiKey(key);
    statusDiv.innerHTML = '<span class="text-gray-500"><i class="fas fa-spinner fa-spin"></i> Validando...</span>';

    try {
        const response = await axios.post('/api/validate-key', { apiKey: key });
        
        if (response.data.valid) {
            statusDiv.innerHTML = '<span class="text-green-600"><i class="fas fa-check-circle"></i> API key válida</span>';
            if (showAlert) {
                alert('API key validada correctamente');
            }
        } else {
            statusDiv.innerHTML = '<span class="text-red-600"><i class="fas fa-times-circle"></i> API key inválida</span>';
            if (showAlert) {
                alert('API key inválida: ' + (response.data.error || 'Error desconocido'));
            }
        }
    } catch (error) {
        statusDiv.innerHTML = '<span class="text-red-600"><i class="fas fa-times-circle"></i> Error validando key</span>';
        if (showAlert) {
            alert('Error validando API key: ' + error.message);
        }
    }
}

// Manejo de archivos
function handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('border-blue-500');
}

function handleDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('border-blue-500');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        processFile(files[0]);
    }
}

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        processFile(file);
    }
}

function processFile(file) {
    if (!file.type.startsWith('image/')) {
        alert('Por favor, selecciona un archivo de imagen');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const base64 = e.target.result.split(',')[1];
        state.currentImage = base64;
        
        // Mostrar vista previa
        const preview = document.getElementById('imagePreview');
        const img = document.getElementById('previewImg');
        img.src = e.target.result;
        preview.classList.remove('hidden');
    };
    reader.readAsDataURL(file);
}

// Procesar imagen con IA
async function processImage() {
    if (!state.apiKey) {
        alert('Por favor, introduce tu API key de OpenAI primero');
        return;
    }

    if (!state.currentImage) {
        alert('Por favor, selecciona una imagen primero');
        return;
    }

    const loadingDiv = document.getElementById('loading');
    const resultsSection = document.getElementById('resultsSection');
    
    loadingDiv.classList.remove('hidden');
    resultsSection.classList.add('hidden');

    try {
        const enabledFields = state.fields.filter(f => f.enabled);
        
        const response = await axios.post('/api/process-invoice', {
            imageBase64: state.currentImage,
            fields: enabledFields,
            apiKey: state.apiKey,
            model: state.selectedModel
        });

        if (response.data.success) {
            displayResults(response.data.data);
        } else {
            alert('Error procesando la imagen: ' + response.data.error);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error procesando la imagen: ' + (error.response?.data?.error || error.message));
    } finally {
        loadingDiv.classList.add('hidden');
    }
}

// Mostrar resultados
function displayResults(data) {
    const resultsSection = document.getElementById('resultsSection');
    const resultsTable = document.getElementById('resultsTable');
    
    // Guardar los datos temporalmente
    state.currentResults = data;
    
    // Crear tabla de resultados
    let tableHTML = '<table class="w-full text-sm"><tbody class="divide-y">';
    
    state.fields.filter(f => f.enabled).forEach(field => {
        const value = data[field.name] || '-';
        tableHTML += `
            <tr class="hover:bg-gray-50">
                <td class="px-3 py-2 font-medium text-gray-700 w-1/3">${field.description}</td>
                <td class="px-3 py-2">
                    <input type="text" 
                           id="result_${field.name}" 
                           value="${value}" 
                           class="w-full px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500">
                </td>
            </tr>
        `;
    });
    
    tableHTML += '</tbody></table>';
    resultsTable.innerHTML = tableHTML;
    resultsSection.classList.remove('hidden');
}

// Añadir a la lista
function addToList() {
    if (!state.currentResults) {
        alert('No hay resultados para añadir');
        return;
    }

    // Obtener valores editados de los campos
    const editedData = {};
    state.fields.filter(f => f.enabled).forEach(field => {
        const input = document.getElementById(`result_${field.name}`);
        if (input) {
            editedData[field.name] = input.value;
        }
    });

    // Añadir timestamp
    editedData.timestamp = new Date().toISOString();
    
    // Añadir a la lista
    state.processedInvoices.push(editedData);
    localStorage.setItem('processed_invoices', JSON.stringify(state.processedInvoices));
    
    // Limpiar y actualizar vista
    clearResults();
    renderApp();
    
    alert('Factura añadida a la lista');
}

// Limpiar resultados
function clearResults() {
    state.currentResults = null;
    state.currentImage = null;
    document.getElementById('resultsSection').classList.add('hidden');
    document.getElementById('imagePreview').classList.add('hidden');
    document.getElementById('fileInput').value = '';
}

// Eliminar factura de la lista
function removeInvoice(index) {
    if (confirm('¿Eliminar esta factura de la lista?')) {
        state.processedInvoices.splice(index, 1);
        localStorage.setItem('processed_invoices', JSON.stringify(state.processedInvoices));
        renderApp();
    }
}

// Limpiar todas las facturas
function clearAllInvoices() {
    if (confirm('¿Eliminar todas las facturas procesadas?')) {
        state.processedInvoices = [];
        localStorage.setItem('processed_invoices', JSON.stringify(state.processedInvoices));
        renderApp();
    }
}

// Exportar a Excel
function exportToExcel() {
    if (state.processedInvoices.length === 0) {
        alert('No hay facturas para exportar');
        return;
    }

    try {
        // Preparar datos para Excel
        const enabledFields = state.fields.filter(f => f.enabled);
        
        // Crear encabezados
        const headers = enabledFields.map(f => f.description);
        
        // Crear filas
        const rows = state.processedInvoices.map(invoice => {
            return enabledFields.map(field => invoice[field.name] || '');
        });

        // Crear libro de Excel
        const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Facturas');

        // Ajustar ancho de columnas
        const colWidths = headers.map(h => ({ wch: Math.max(h.length, 15) }));
        ws['!cols'] = colWidths;

        // Descargar archivo
        const fileName = `facturas_${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(wb, fileName);
        
        alert(`Excel exportado: ${fileName}`);
    } catch (error) {
        console.error('Error exportando a Excel:', error);
        alert('Error al exportar a Excel: ' + error.message);
    }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', renderApp);