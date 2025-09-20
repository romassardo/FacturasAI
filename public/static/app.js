// Versión Clásica - Compatibilidad
const state = {
    apiKey: localStorage.getItem('openai_api_key') || '',
    selectedModel: localStorage.getItem('selected_model') || 'gpt-4o-mini',
    fields: JSON.parse(localStorage.getItem('invoice_fields') || JSON.stringify([
        { name: 'numero_factura', description: 'Número de factura', enabled: true },
        { name: 'fecha', description: 'Fecha', enabled: true },
        { name: 'emisor', description: 'Emisor', enabled: true },
        { name: 'total', description: 'Total', enabled: true }
    ])),
    processedInvoices: JSON.parse(localStorage.getItem('processed_invoices') || '[]'),
    currentImage: null
};

function renderApp() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 class="text-lg font-semibold mb-4">
                <i class="fas fa-cog mr-2"></i>Configuración
            </h2>
            
            <div class="grid md:grid-cols-2 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">API Key de OpenAI</label>
                    <input type="password" id="apiKey" value="${state.apiKey}" 
                           placeholder="sk-..." class="w-full px-3 py-2 border rounded-lg">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Modelo</label>
                    <select id="modelSelect" class="w-full px-3 py-2 border rounded-lg">
                        <option value="gpt-4o-mini">GPT-4 Mini (Rápido)</option>
                        <option value="gpt-4o">GPT-4 (Preciso)</option>
                    </select>
                </div>
            </div>
        </div>

        <div class="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 class="text-lg font-semibold mb-4">
                <i class="fas fa-upload mr-2"></i>Cargar Documento
            </h2>
            
            <div id="dropZone" class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition cursor-pointer">
                <i class="fas fa-cloud-upload-alt text-4xl text-gray-400 mb-3"></i>
                <p class="text-gray-600">Arrastra tu factura aquí</p>
                <input type="file" id="fileInput" accept="image/*" class="hidden">
            </div>

            <div id="imagePreview" class="mt-4 hidden">
                <img id="previewImg" class="max-w-full rounded-lg" style="max-height: 400px;">
                <button onclick="processImage()" class="mt-4 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600">
                    <i class="fas fa-magic mr-2"></i>Procesar
                </button>
            </div>
        </div>

        <div id="results" class="bg-white rounded-lg shadow-lg p-6 hidden">
            <h2 class="text-lg font-semibold mb-4">Resultados</h2>
            <div id="resultsContent"></div>
        </div>

        ${state.processedInvoices.length > 0 ? `
            <div class="bg-white rounded-lg shadow-lg p-6">
                <h2 class="text-lg font-semibold mb-4">
                    Facturas Procesadas (${state.processedInvoices.length})
                </h2>
                <button onclick="exportToExcel()" class="mb-4 px-4 py-2 bg-green-500 text-white rounded-lg">
                    <i class="fas fa-file-excel mr-2"></i>Exportar Excel
                </button>
                <div class="overflow-x-auto">
                    <table class="w-full text-sm">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-3 py-2 text-left">Número</th>
                                <th class="px-3 py-2 text-left">Fecha</th>
                                <th class="px-3 py-2 text-left">Emisor</th>
                                <th class="px-3 py-2 text-left">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${state.processedInvoices.map(inv => `
                                <tr class="hover:bg-gray-50">
                                    <td class="px-3 py-2">${inv.numero_factura || '-'}</td>
                                    <td class="px-3 py-2">${inv.fecha || '-'}</td>
                                    <td class="px-3 py-2">${inv.emisor || '-'}</td>
                                    <td class="px-3 py-2">${inv.total || '-'}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        ` : ''}
    `;

    // Event listeners
    document.getElementById('apiKey').addEventListener('change', (e) => {
        state.apiKey = e.target.value;
        localStorage.setItem('openai_api_key', state.apiKey);
    });

    document.getElementById('modelSelect').value = state.selectedModel;
    document.getElementById('modelSelect').addEventListener('change', (e) => {
        state.selectedModel = e.target.value;
        localStorage.setItem('selected_model', state.selectedModel);
    });

    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');

    dropZone.addEventListener('click', () => fileInput.click());
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('border-blue-500');
    });
    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('border-blue-500');
    });
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('border-blue-500');
        if (e.dataTransfer.files.length > 0) {
            handleFile(e.dataTransfer.files[0]);
        }
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFile(e.target.files[0]);
        }
    });
}

function handleFile(file) {
    if (!file.type.startsWith('image/')) {
        alert('Por favor selecciona una imagen');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        state.currentImage = e.target.result.split(',')[1];
        document.getElementById('previewImg').src = e.target.result;
        document.getElementById('imagePreview').classList.remove('hidden');
    };
    reader.readAsDataURL(file);
}

async function processImage() {
    if (!state.apiKey) {
        alert('Por favor ingresa tu API Key de OpenAI');
        return;
    }

    if (!state.currentImage) {
        alert('Por favor selecciona una imagen');
        return;
    }

    const button = event.target;
    button.disabled = true;
    button.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Procesando...';

    try {
        const response = await axios.post('/api/process-invoice', {
            imageBase64: state.currentImage,
            fields: state.fields.filter(f => f.enabled),
            apiKey: state.apiKey,
            model: state.selectedModel
        });

        if (response.data.success) {
            displayResults(response.data.data);
            
            // Guardar en el historial
            state.processedInvoices.push({
                ...response.data.data,
                timestamp: new Date().toISOString()
            });
            localStorage.setItem('processed_invoices', JSON.stringify(state.processedInvoices));
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error procesando la imagen: ' + (error.response?.data?.error || error.message));
    } finally {
        button.disabled = false;
        button.innerHTML = '<i class="fas fa-magic mr-2"></i>Procesar';
    }
}

function displayResults(data) {
    const results = document.getElementById('results');
    const content = document.getElementById('resultsContent');
    
    let html = '<table class="w-full">';
    Object.entries(data).forEach(([key, value]) => {
        html += `
            <tr class="border-b">
                <td class="py-2 font-medium">${key}:</td>
                <td class="py-2">${value || '-'}</td>
            </tr>
        `;
    });
    html += '</table>';
    
    content.innerHTML = html;
    results.classList.remove('hidden');
    
    renderApp();
}

function exportToExcel() {
    if (state.processedInvoices.length === 0) {
        alert('No hay facturas para exportar');
        return;
    }

    try {
        const ws = XLSX.utils.json_to_sheet(state.processedInvoices);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Facturas');
        XLSX.writeFile(wb, `facturas_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (error) {
        alert('Error exportando: ' + error.message);
    }
}

document.addEventListener('DOMContentLoaded', renderApp);