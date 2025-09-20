// ========================
// DocuAI Pro - Versión Moderna
// ========================

const AppState = {
    config: {
        apiKey: localStorage.getItem('openai_api_key') || '',
        selectedModel: localStorage.getItem('selected_model') || 'gpt-4o-mini',
        theme: localStorage.getItem('theme') || 'light',
        autoClassify: localStorage.getItem('auto_classify') === 'true',
        costTracking: localStorage.getItem('cost_tracking') === 'true'
    },
    
    templates: JSON.parse(localStorage.getItem('document_templates') || JSON.stringify([
        {
            id: 'invoice',
            name: 'Factura Estándar',
            icon: '📄',
            fields: [
                { key: 'invoice_number', label: 'Número', type: 'text', required: true },
                { key: 'date', label: 'Fecha', type: 'date', required: true },
                { key: 'vendor', label: 'Emisor', type: 'text', required: true },
                { key: 'vendor_tax_id', label: 'NIF Emisor', type: 'text', required: false },
                { key: 'customer', label: 'Cliente', type: 'text', required: false },
                { key: 'subtotal', label: 'Base Imponible', type: 'currency', required: true },
                { key: 'tax', label: 'IVA', type: 'currency', required: true },
                { key: 'total', label: 'Total', type: 'currency', required: true }
            ],
            keywords: ['factura', 'invoice', 'total', 'iva', 'nif'],
            color: '#3B82F6'
        },
        {
            id: 'receipt',
            name: 'Ticket de Compra',
            icon: '🧾',
            fields: [
                { key: 'date', label: 'Fecha', type: 'date', required: true },
                { key: 'vendor', label: 'Tienda', type: 'text', required: true },
                { key: 'total', label: 'Total', type: 'currency', required: true },
                { key: 'payment_method', label: 'Método de Pago', type: 'text', required: false }
            ],
            keywords: ['ticket', 'receipt', 'tienda', 'shop'],
            color: '#10B981'
        },
        {
            id: 'expense',
            name: 'Nota de Gastos',
            icon: '💰',
            fields: [
                { key: 'date', label: 'Fecha', type: 'date', required: true },
                { key: 'description', label: 'Concepto', type: 'text', required: true },
                { key: 'category', label: 'Categoría', type: 'select', options: ['Transporte', 'Comidas', 'Hotel', 'Material', 'Otros'], required: true },
                { key: 'amount', label: 'Importe', type: 'currency', required: true },
                { key: 'employee', label: 'Empleado', type: 'text', required: false }
            ],
            keywords: ['gasto', 'expense', 'reembolso'],
            color: '#F59E0B'
        }
    ])),
    
    vendorMemory: JSON.parse(localStorage.getItem('vendor_memory') || JSON.stringify({
        vendors: [],
        corrections: {},
        rules: {}
    })),
    
    documents: JSON.parse(localStorage.getItem('processed_documents') || '[]'),
    currentDocument: null,
    currentTemplate: null,
    processingQueue: [],
    batchMode: false,
    
    stats: {
        totalProcessed: 0,
        totalCost: 0,
        averageAccuracy: 0,
        timesSaved: 0
    }
};

// ========================
// UI Principal
// ========================

class ModernUI {
    static init() {
        this.renderApp();
        this.attachEventListeners();
        this.initializeTheme();
        this.loadDashboard();
    }

    static renderApp() {
        document.getElementById('app').innerHTML = `
            <!-- Sidebar -->
            <aside id="sidebar" class="sidebar">
                <div class="sidebar-header">
                    <div class="logo">
                        <div class="logo-icon">
                            <i class="fas fa-file-invoice"></i>
                        </div>
                        <span class="logo-text">DocuAI Pro</span>
                    </div>
                </div>

                <nav class="sidebar-nav">
                    <a href="#" class="nav-item active" data-page="dashboard">
                        <i class="fas fa-chart-line"></i>
                        <span>Dashboard</span>
                    </a>
                    <a href="#" class="nav-item" data-page="process">
                        <i class="fas fa-wand-magic-sparkles"></i>
                        <span>Procesar</span>
                    </a>
                    <a href="#" class="nav-item" data-page="documents">
                        <i class="fas fa-folder-open"></i>
                        <span>Documentos</span>
                        <span class="counter">${AppState.documents.length}</span>
                    </a>
                    <a href="#" class="nav-item" data-page="templates">
                        <i class="fas fa-layer-group"></i>
                        <span>Plantillas</span>
                    </a>
                    <a href="#" class="nav-item" data-page="settings">
                        <i class="fas fa-cog"></i>
                        <span>Configuración</span>
                    </a>
                </nav>

                <div class="sidebar-footer">
                    <button class="theme-toggle" onclick="ModernUI.toggleTheme()">
                        <i class="fas fa-moon" id="themeIcon"></i>
                    </button>
                </div>
            </aside>

            <!-- Main Content -->
            <main id="mainContent" class="main-content">
                <!-- Topbar -->
                <header class="topbar">
                    <div class="topbar-left">
                        <button class="menu-toggle" onclick="ModernUI.toggleSidebar()">
                            <i class="fas fa-bars"></i>
                        </button>
                        <h1 id="pageTitle" class="page-title">Dashboard</h1>
                    </div>

                    <div class="topbar-right">
                        <button class="quick-action" onclick="ModernUI.openQuickUpload()">
                            <i class="fas fa-upload"></i>
                            <span>Carga Rápida</span>
                        </button>
                        
                        <div class="cost-tracker">
                            <i class="fas fa-coins"></i>
                            <span>$<span id="totalCost">0.00</span></span>
                        </div>
                    </div>
                </header>

                <!-- Page Content -->
                <div id="pageContent" class="page-content">
                    <!-- Contenido dinámico -->
                </div>
            </main>

            <!-- Quick Upload Modal -->
            <div id="quickUploadModal" class="modal-overlay hidden">
                <div class="modal">
                    <div class="modal-header">
                        <h2>Carga Rápida</h2>
                        <button onclick="ModernUI.closeQuickUpload()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="upload-zone" id="quickDropZone">
                            <i class="fas fa-cloud-upload-alt"></i>
                            <p>Arrastra documentos aquí</p>
                            <input type="file" id="quickFileInput" multiple accept="image/*,.pdf" hidden>
                        </div>
                        <div id="uploadQueue"></div>
                    </div>
                </div>
            </div>

            <!-- Toast Container -->
            <div id="toastContainer" class="toast-container"></div>
        `;
    }

    static loadDashboard() {
        document.getElementById('pageContent').innerHTML = `
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon bg-blue">
                        <i class="fas fa-file-invoice"></i>
                    </div>
                    <div class="stat-content">
                        <span class="stat-label">Documentos</span>
                        <span class="stat-value">${AppState.documents.length}</span>
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-icon bg-green">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <div class="stat-content">
                        <span class="stat-label">Precisión</span>
                        <span class="stat-value">94.5%</span>
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-icon bg-purple">
                        <i class="fas fa-clock"></i>
                    </div>
                    <div class="stat-content">
                        <span class="stat-label">Tiempo Ahorrado</span>
                        <span class="stat-value">42h</span>
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-icon bg-orange">
                        <i class="fas fa-dollar-sign"></i>
                    </div>
                    <div class="stat-content">
                        <span class="stat-label">Costo API</span>
                        <span class="stat-value">$${AppState.stats.totalCost.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            <div class="dashboard-section">
                <h2>Acciones Rápidas</h2>
                <div class="quick-actions-grid">
                    <button class="quick-action-card" onclick="ModernUI.loadPage('process')">
                        <i class="fas fa-file-upload"></i>
                        <span>Procesar</span>
                    </button>
                    <button class="quick-action-card" onclick="IntegrationManager.exportToExcel()">
                        <i class="fas fa-file-excel"></i>
                        <span>Exportar</span>
                    </button>
                </div>
            </div>
        `;
    }

    static loadPage(page) {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.page === page) {
                item.classList.add('active');
            }
        });

        switch(page) {
            case 'dashboard':
                this.loadDashboard();
                break;
            case 'process':
                DocumentProcessor.loadProcessPage();
                break;
            case 'documents':
                DocumentManager.loadDocumentsPage();
                break;
            case 'templates':
                TemplateManager.loadTemplatesPage();
                break;
            case 'settings':
                SettingsManager.loadSettingsPage();
                break;
        }

        const titles = {
            dashboard: 'Dashboard',
            process: 'Procesar Documentos',
            documents: 'Documentos',
            templates: 'Plantillas',
            settings: 'Configuración'
        };
        document.getElementById('pageTitle').textContent = titles[page] || 'DocuAI Pro';
    }

    static toggleSidebar() {
        document.getElementById('sidebar').classList.toggle('collapsed');
    }

    static toggleTheme() {
        const currentTheme = AppState.config.theme;
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        AppState.config.theme = newTheme;
        localStorage.setItem('theme', newTheme);
        
        document.documentElement.setAttribute('data-theme', newTheme);
        document.getElementById('themeIcon').className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }

    static initializeTheme() {
        document.documentElement.setAttribute('data-theme', AppState.config.theme);
    }

    static openQuickUpload() {
        document.getElementById('quickUploadModal').classList.remove('hidden');
    }

    static closeQuickUpload() {
        document.getElementById('quickUploadModal').classList.add('hidden');
    }

    static showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        document.getElementById('toastContainer').appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    static attachEventListeners() {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                this.loadPage(item.dataset.page);
            });
        });

        const quickDropZone = document.getElementById('quickDropZone');
        const quickFileInput = document.getElementById('quickFileInput');

        if (quickDropZone) {
            quickDropZone.addEventListener('click', () => quickFileInput.click());
            quickDropZone.addEventListener('dragover', (e) => {
                e.preventDefault();
                quickDropZone.classList.add('dragover');
            });
            quickDropZone.addEventListener('dragleave', () => {
                quickDropZone.classList.remove('dragover');
            });
            quickDropZone.addEventListener('drop', (e) => {
                e.preventDefault();
                quickDropZone.classList.remove('dragover');
                DocumentProcessor.handleFiles(e.dataTransfer.files);
            });

            quickFileInput.addEventListener('change', (e) => {
                DocumentProcessor.handleFiles(e.target.files);
            });
        }
    }
}

// ========================
// Procesador de Documentos
// ========================

class DocumentProcessor {
    static loadProcessPage() {
        document.getElementById('pageContent').innerHTML = `
            <div class="upload-section">
                <div class="upload-area" id="mainDropZone">
                    <div class="upload-content">
                        <i class="fas fa-file-upload"></i>
                        <h3>Arrastra tus documentos aquí</h3>
                        <button class="btn btn-primary" onclick="document.getElementById('mainFileInput').click()">
                            Seleccionar Archivos
                        </button>
                        <input type="file" id="mainFileInput" multiple accept="image/*,.pdf" hidden>
                    </div>
                </div>

                <div class="processing-options">
                    <div class="option-card">
                        <h4>Clasificación Automática</h4>
                        <label class="switch">
                            <input type="checkbox" id="autoClassify" ${AppState.config.autoClassify ? 'checked' : ''}>
                            <span class="slider"></span>
                        </label>
                    </div>
                    <div class="option-card">
                        <h4>Optimización de Costos</h4>
                        <label class="switch">
                            <input type="checkbox" id="costOptimization" ${AppState.config.costTracking ? 'checked' : ''}>
                            <span class="slider"></span>
                        </label>
                    </div>
                </div>
            </div>

            <div id="documentQueue"></div>
            <div id="processingResults"></div>
        `;

        this.attachEvents();
    }

    static attachEvents() {
        const dropZone = document.getElementById('mainDropZone');
        const fileInput = document.getElementById('mainFileInput');

        if (dropZone) {
            dropZone.addEventListener('dragover', (e) => {
                e.preventDefault();
                dropZone.classList.add('dragover');
            });

            dropZone.addEventListener('dragleave', () => {
                dropZone.classList.remove('dragover');
            });

            dropZone.addEventListener('drop', (e) => {
                e.preventDefault();
                dropZone.classList.remove('dragover');
                this.handleFiles(e.dataTransfer.files);
            });
        }

        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                this.handleFiles(e.target.files);
            });
        }
    }

    static handleFiles(files) {
        Array.from(files).forEach(file => {
            const id = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            AppState.processingQueue.push({
                id,
                file,
                status: 'pending'
            });

            const queue = document.getElementById('documentQueue') || document.getElementById('uploadQueue');
            if (queue) {
                queue.innerHTML += `
                    <div class="queue-item" id="${id}">
                        <div class="queue-item-details">
                            <span>${file.name}</span>
                            <span class="status-badge pending">Pendiente</span>
                        </div>
                        <button onclick="DocumentProcessor.processDocument('${id}')">
                            <i class="fas fa-play"></i> Procesar
                        </button>
                    </div>
                `;
            }
        });

        ModernUI.showToast(`${files.length} documento(s) añadido(s)`, 'success');
    }

    static async processDocument(docId) {
        const doc = AppState.processingQueue.find(d => d.id === docId);
        if (!doc) return;

        const queueItem = document.getElementById(docId);
        if (queueItem) {
            queueItem.querySelector('.status-badge').textContent = 'Procesando...';
            queueItem.querySelector('.status-badge').className = 'status-badge processing';
        }

        try {
            const base64 = await this.fileToBase64(doc.file);
            
            let template = AppState.templates[0];
            if (AppState.config.autoClassify) {
                template = await this.classifyDocument(base64);
            }

            const model = AppState.config.costTracking && doc.file.size < 1024*1024 ? 'gpt-4o-mini' : AppState.config.selectedModel;

            const response = await fetch('/api/process-document', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    imageBase64: base64,
                    fields: template.fields,
                    apiKey: AppState.config.apiKey,
                    model: model
                })
            });

            const result = await response.json();

            if (result.success) {
                AppState.documents.push({
                    id: docId,
                    timestamp: new Date().toISOString(),
                    filename: doc.file.name,
                    template: template.id,
                    data: result.data,
                    cost: result.cost
                });

                AppState.stats.totalCost += result.cost || 0;
                document.getElementById('totalCost').textContent = AppState.stats.totalCost.toFixed(2);
                
                localStorage.setItem('processed_documents', JSON.stringify(AppState.documents));
                
                if (queueItem) {
                    queueItem.querySelector('.status-badge').textContent = 'Completado';
                    queueItem.querySelector('.status-badge').className = 'status-badge success';
                }

                ModernUI.showToast('Documento procesado', 'success');
            }

        } catch (error) {
            console.error('Error:', error);
            if (queueItem) {
                queueItem.querySelector('.status-badge').textContent = 'Error';
                queueItem.querySelector('.status-badge').className = 'status-badge error';
            }
            ModernUI.showToast('Error procesando documento', 'error');
        }
    }

    static fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result.split(',')[1]);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    static async classifyDocument(base64) {
        try {
            const response = await fetch('/api/classify-document', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ imageBase64: base64 })
            });
            
            const result = await response.json();
            return AppState.templates.find(t => t.id === result.templateId) || AppState.templates[0];
        } catch (error) {
            return AppState.templates[0];
        }
    }
}

// ========================
// Gestores Adicionales
// ========================

class DocumentManager {
    static loadDocumentsPage() {
        document.getElementById('pageContent').innerHTML = `
            <div class="page-header">
                <h2>Documentos Procesados</h2>
                <button class="btn btn-primary" onclick="IntegrationManager.exportToExcel()">
                    <i class="fas fa-file-excel"></i> Exportar Excel
                </button>
            </div>

            <div class="documents-table">
                ${this.renderTable()}
            </div>
        `;
    }

    static renderTable() {
        if (AppState.documents.length === 0) {
            return '<p class="empty-state">No hay documentos procesados</p>';
        }

        return `
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Fecha</th>
                        <th>Archivo</th>
                        <th>Tipo</th>
                        <th>Total</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${AppState.documents.map(doc => `
                        <tr>
                            <td>${new Date(doc.timestamp).toLocaleDateString()}</td>
                            <td>${doc.filename}</td>
                            <td>${doc.template}</td>
                            <td>${doc.data.total || '-'}</td>
                            <td>
                                <button onclick="DocumentManager.deleteDoc('${doc.id}')">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    static deleteDoc(id) {
        AppState.documents = AppState.documents.filter(d => d.id !== id);
        localStorage.setItem('processed_documents', JSON.stringify(AppState.documents));
        this.loadDocumentsPage();
    }
}

class TemplateManager {
    static loadTemplatesPage() {
        document.getElementById('pageContent').innerHTML = `
            <h2>Plantillas de Documentos</h2>
            <div class="templates-grid">
                ${AppState.templates.map(t => `
                    <div class="template-card" style="border-color: ${t.color}">
                        <span class="template-icon">${t.icon}</span>
                        <h3>${t.name}</h3>
                        <p>${t.fields.length} campos</p>
                    </div>
                `).join('')}
            </div>
        `;
    }
}

class SettingsManager {
    static loadSettingsPage() {
        document.getElementById('pageContent').innerHTML = `
            <h2>Configuración</h2>
            <div class="settings-section">
                <label>API Key de OpenAI</label>
                <input type="password" id="apiKeyInput" value="${AppState.config.apiKey}" class="form-input">
                
                <label>Modelo Predeterminado</label>
                <select id="modelSelect" class="form-select">
                    <option value="gpt-4o-mini" ${AppState.config.selectedModel === 'gpt-4o-mini' ? 'selected' : ''}>GPT-4 Mini</option>
                    <option value="gpt-4o" ${AppState.config.selectedModel === 'gpt-4o' ? 'selected' : ''}>GPT-4</option>
                </select>

                <button class="btn btn-primary" onclick="SettingsManager.save()">Guardar</button>
            </div>
        `;
    }

    static save() {
        AppState.config.apiKey = document.getElementById('apiKeyInput').value;
        AppState.config.selectedModel = document.getElementById('modelSelect').value;
        
        localStorage.setItem('openai_api_key', AppState.config.apiKey);
        localStorage.setItem('selected_model', AppState.config.selectedModel);
        
        ModernUI.showToast('Configuración guardada', 'success');
    }
}

class IntegrationManager {
    static exportToExcel() {
        if (AppState.documents.length === 0) {
            ModernUI.showToast('No hay documentos para exportar', 'warning');
            return;
        }

        try {
            const data = AppState.documents.map(doc => ({
                fecha: new Date(doc.timestamp).toLocaleDateString(),
                archivo: doc.filename,
                ...doc.data
            }));

            const ws = XLSX.utils.json_to_sheet(data);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Documentos');
            XLSX.writeFile(wb, `documentos_${new Date().toISOString().split('T')[0]}.xlsx`);
            
            ModernUI.showToast('Excel exportado', 'success');
        } catch (error) {
            ModernUI.showToast('Error exportando', 'error');
        }
    }
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    ModernUI.init();
});