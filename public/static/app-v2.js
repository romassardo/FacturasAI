// ========================
// DocuAI Pro - Versión Corregida
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
        }
    ])),
    
    vendorMemory: JSON.parse(localStorage.getItem('vendor_memory') || JSON.stringify({
        vendors: [],
        corrections: {},
        rules: {}
    })),
    
    documents: JSON.parse(localStorage.getItem('processed_documents') || '[]'),
    processingQueue: JSON.parse(localStorage.getItem('processing_queue') || '[]'),
    currentPage: localStorage.getItem('current_page') || 'dashboard',
    
    stats: {
        totalProcessed: 0,
        totalCost: parseFloat(localStorage.getItem('total_cost') || '0'),
        averageAccuracy: 0,
        timesSaved: 0
    }
};

// ========================
// UI Principal Mejorada
// ========================

class ModernUI {
    static init() {
        this.renderApp();
        this.attachEventListeners();
        this.initializeTheme();
        // Cargar la última página visitada
        this.loadPage(AppState.currentPage);
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
                    <a href="#" class="nav-item" data-page="dashboard">
                        <i class="fas fa-chart-line"></i>
                        <span>Dashboard</span>
                    </a>
                    <a href="#" class="nav-item" data-page="process">
                        <i class="fas fa-wand-magic-sparkles"></i>
                        <span>Procesar</span>
                        ${AppState.processingQueue.filter(d => d.status === 'pending').length > 0 ? 
                            `<span class="counter">${AppState.processingQueue.filter(d => d.status === 'pending').length}</span>` : ''}
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
                            <span>$<span id="totalCost">${AppState.stats.totalCost.toFixed(2)}</span></span>
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
                        <div id="uploadQueue" class="mt-4"></div>
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
                        <span class="stat-label">En Cola</span>
                        <span class="stat-value">${AppState.processingQueue.filter(d => d.status === 'pending').length}</span>
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-icon bg-purple">
                        <i class="fas fa-clock"></i>
                    </div>
                    <div class="stat-content">
                        <span class="stat-label">Procesados Hoy</span>
                        <span class="stat-value">${AppState.documents.filter(d => 
                            new Date(d.timestamp).toDateString() === new Date().toDateString()
                        ).length}</span>
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-icon bg-orange">
                        <i class="fas fa-dollar-sign"></i>
                    </div>
                    <div class="stat-content">
                        <span class="stat-label">Costo Total</span>
                        <span class="stat-value">$${AppState.stats.totalCost.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            <div class="dashboard-section">
                <h2>Acciones Rápidas</h2>
                <div class="quick-actions-grid">
                    <button class="quick-action-card" onclick="ModernUI.loadPage('process')">
                        <i class="fas fa-file-upload"></i>
                        <span>Procesar Documento</span>
                    </button>
                    <button class="quick-action-card" onclick="IntegrationManager.exportToExcel()">
                        <i class="fas fa-file-excel"></i>
                        <span>Exportar Excel</span>
                    </button>
                    <button class="quick-action-card" onclick="ModernUI.loadPage('documents')">
                        <i class="fas fa-folder"></i>
                        <span>Ver Documentos</span>
                    </button>
                    <button class="quick-action-card" onclick="ModernUI.loadPage('settings')">
                        <i class="fas fa-cog"></i>
                        <span>Configuración</span>
                    </button>
                </div>
            </div>

            ${AppState.processingQueue.length > 0 ? `
                <div class="dashboard-section">
                    <h2>Cola de Procesamiento</h2>
                    <div id="dashboardQueue">
                        ${DocumentProcessor.renderQueue()}
                    </div>
                </div>
            ` : ''}
        `;
    }

    static loadPage(page) {
        // Guardar página actual
        AppState.currentPage = page;
        localStorage.setItem('current_page', page);
        
        // Actualizar navegación activa
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.page === page) {
                item.classList.add('active');
            }
        });

        // Cargar contenido de página
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

        // Actualizar título
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
        DocumentProcessor.updateQueueDisplay('uploadQueue');
    }

    static closeQuickUpload() {
        document.getElementById('quickUploadModal').classList.add('hidden');
    }

    static showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
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
        // Navegación
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                this.loadPage(item.dataset.page);
            });
        });

        // Quick Upload
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

    static updateSidebarCounters() {
        // Actualizar contador de documentos
        const docCounter = document.querySelector('.nav-item[data-page="documents"] .counter');
        if (docCounter) {
            docCounter.textContent = AppState.documents.length;
        }

        // Actualizar contador de cola
        const processNav = document.querySelector('.nav-item[data-page="process"]');
        if (processNav) {
            const pendingCount = AppState.processingQueue.filter(d => d.status === 'pending').length;
            const existingCounter = processNav.querySelector('.counter');
            
            if (pendingCount > 0) {
                if (existingCounter) {
                    existingCounter.textContent = pendingCount;
                } else {
                    processNav.innerHTML += `<span class="counter">${pendingCount}</span>`;
                }
            } else if (existingCounter) {
                existingCounter.remove();
            }
        }

        // Actualizar costo total
        const costElement = document.getElementById('totalCost');
        if (costElement) {
            costElement.textContent = AppState.stats.totalCost.toFixed(2);
        }
    }
}

// ========================
// Procesador de Documentos Mejorado
// ========================

class DocumentProcessor {
    static loadProcessPage() {
        document.getElementById('pageContent').innerHTML = `
            <div class="upload-section">
                <div class="upload-area" id="mainDropZone">
                    <div class="upload-content">
                        <i class="fas fa-file-upload"></i>
                        <h3>Arrastra tus documentos aquí</h3>
                        <p>Soportamos imágenes (JPG, PNG) y PDFs</p>
                        <button class="btn btn-primary" onclick="document.getElementById('mainFileInput').click()">
                            <i class="fas fa-folder-open"></i> Seleccionar Archivos
                        </button>
                        <input type="file" id="mainFileInput" multiple accept="image/*,.pdf" hidden>
                    </div>
                </div>

                <div class="processing-options">
                    <div class="option-card">
                        <h4>Clasificación Automática</h4>
                        <label class="switch">
                            <input type="checkbox" id="autoClassify" ${AppState.config.autoClassify ? 'checked' : ''}
                                   onchange="DocumentProcessor.updateConfig('autoClassify', this.checked)">
                            <span class="slider"></span>
                        </label>
                    </div>
                    <div class="option-card">
                        <h4>Optimización de Costos</h4>
                        <label class="switch">
                            <input type="checkbox" id="costOptimization" ${AppState.config.costTracking ? 'checked' : ''}
                                   onchange="DocumentProcessor.updateConfig('costTracking', this.checked)">
                            <span class="slider"></span>
                        </label>
                    </div>
                    ${AppState.processingQueue.filter(d => d.status === 'pending').length > 1 ? `
                        <div class="option-card">
                            <button class="btn btn-primary" onclick="DocumentProcessor.processAll()">
                                <i class="fas fa-play-circle"></i> Procesar Todos (${AppState.processingQueue.filter(d => d.status === 'pending').length})
                            </button>
                        </div>
                    ` : ''}
                </div>
            </div>

            <div id="documentQueue" class="mt-4">
                ${this.renderQueue()}
            </div>
            
            <div id="processingResults" class="mt-4"></div>
        `;

        this.attachEvents();
    }

    static renderQueue() {
        if (AppState.processingQueue.length === 0) {
            return '<p class="empty-state">No hay documentos en cola</p>';
        }

        return AppState.processingQueue.map(item => `
            <div class="queue-item" id="${item.id}">
                <div class="queue-item-icon">
                    <i class="fas fa-${item.fileType?.includes('pdf') ? 'file-pdf' : 'file-image'}"></i>
                </div>
                <div class="queue-item-details">
                    <span class="queue-item-name">${item.filename}</span>
                    <span class="queue-item-info">${(item.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                </div>
                <div class="queue-item-status">
                    <span class="status-badge ${item.status}">
                        ${item.status === 'pending' ? 'Pendiente' : 
                          item.status === 'processing' ? 'Procesando...' : 
                          item.status === 'completed' ? 'Completado' : 
                          item.status === 'error' ? 'Error' : item.status}
                    </span>
                </div>
                <div class="queue-item-actions">
                    ${item.status === 'pending' ? `
                        <button class="btn-icon" onclick="DocumentProcessor.processDocument('${item.id}')" title="Procesar">
                            <i class="fas fa-play"></i>
                        </button>
                    ` : item.status === 'completed' ? `
                        <button class="btn-icon" onclick="DocumentProcessor.viewResult('${item.id}')" title="Ver resultado">
                            <i class="fas fa-eye"></i>
                        </button>
                    ` : item.status === 'error' ? `
                        <button class="btn-icon" onclick="DocumentProcessor.retryDocument('${item.id}')" title="Reintentar">
                            <i class="fas fa-redo"></i>
                        </button>
                    ` : ''}
                    <button class="btn-icon danger" onclick="DocumentProcessor.removeFromQueue('${item.id}')" title="Eliminar">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    static updateQueueDisplay(targetId = 'documentQueue') {
        const queue = document.getElementById(targetId);
        if (queue) {
            queue.innerHTML = this.renderQueue();
        }
        ModernUI.updateSidebarCounters();
    }

    static updateConfig(key, value) {
        AppState.config[key] = value;
        localStorage.setItem(key === 'autoClassify' ? 'auto_classify' : 'cost_tracking', value.toString());
        ModernUI.showToast(`${key === 'autoClassify' ? 'Clasificación automática' : 'Optimización de costos'} ${value ? 'activada' : 'desactivada'}`, 'info');
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
        let filesAdded = 0;
        
        Array.from(files).forEach(file => {
            // Validar tipo de archivo
            if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
                ModernUI.showToast(`${file.name} no es una imagen o PDF válido`, 'error');
                return;
            }

            const reader = new FileReader();
            reader.onload = () => {
                const id = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                const queueItem = {
                    id,
                    filename: file.name,
                    fileType: file.type,
                    fileSize: file.size,
                    base64: reader.result.split(',')[1],
                    status: 'pending',
                    timestamp: new Date().toISOString()
                };
                
                AppState.processingQueue.push(queueItem);
                filesAdded++;
                
                // Guardar en localStorage
                localStorage.setItem('processing_queue', JSON.stringify(AppState.processingQueue));
                
                // Actualizar UI
                this.updateQueueDisplay();
                this.updateQueueDisplay('uploadQueue');
                
                if (filesAdded === files.length) {
                    ModernUI.showToast(`${filesAdded} documento(s) añadido(s) a la cola`, 'success');
                }
            };
            
            reader.readAsDataURL(file);
        });
    }

    static async processDocument(docId) {
        const doc = AppState.processingQueue.find(d => d.id === docId);
        if (!doc) {
            ModernUI.showToast('Documento no encontrado', 'error');
            return;
        }

        // Verificar API key
        if (!AppState.config.apiKey) {
            ModernUI.showToast('Por favor configura tu API Key de OpenAI primero', 'warning');
            ModernUI.loadPage('settings');
            return;
        }

        // Actualizar estado a procesando
        doc.status = 'processing';
        localStorage.setItem('processing_queue', JSON.stringify(AppState.processingQueue));
        this.updateQueueDisplay();
        this.updateQueueDisplay('uploadQueue');

        try {
            let template = AppState.templates[0]; // Por defecto factura
            
            // Clasificar documento si está activado
            if (AppState.config.autoClassify) {
                try {
                    const classifyResponse = await fetch('/api/classify-document', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ imageBase64: doc.base64 })
                    });
                    
                    if (classifyResponse.ok) {
                        const result = await classifyResponse.json();
                        const foundTemplate = AppState.templates.find(t => t.id === result.templateId);
                        if (foundTemplate) {
                            template = foundTemplate;
                            ModernUI.showToast(`Documento clasificado como: ${template.name}`, 'info');
                        }
                    }
                } catch (error) {
                    console.log('Error clasificando, usando plantilla por defecto');
                }
            }

            // Seleccionar modelo según configuración
            const model = AppState.config.costTracking && doc.fileSize < 1024*1024 ? 'gpt-4o-mini' : AppState.config.selectedModel;

            // Procesar documento
            const response = await fetch('/api/process-document', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    imageBase64: doc.base64,
                    fields: template.fields,
                    apiKey: AppState.config.apiKey,
                    model: model
                })
            });

            const result = await response.json();

            if (result.success) {
                // Guardar documento procesado
                const processedDoc = {
                    id: docId,
                    timestamp: new Date().toISOString(),
                    filename: doc.filename,
                    template: template.id,
                    templateName: template.name,
                    data: result.data,
                    cost: result.cost || 0
                };
                
                AppState.documents.push(processedDoc);
                localStorage.setItem('processed_documents', JSON.stringify(AppState.documents));
                
                // Actualizar estadísticas
                AppState.stats.totalCost += result.cost || 0;
                localStorage.setItem('total_cost', AppState.stats.totalCost.toString());
                
                // Actualizar estado en la cola
                doc.status = 'completed';
                doc.result = processedDoc;
                localStorage.setItem('processing_queue', JSON.stringify(AppState.processingQueue));
                
                // Actualizar UI
                this.updateQueueDisplay();
                this.updateQueueDisplay('uploadQueue');
                ModernUI.updateSidebarCounters();
                
                ModernUI.showToast(`✅ ${doc.filename} procesado exitosamente`, 'success');
                
                // Mostrar resultados
                this.displayResults(processedDoc);
            } else {
                throw new Error(result.error || 'Error procesando documento');
            }

        } catch (error) {
            console.error('Error:', error);
            
            // Actualizar estado a error
            doc.status = 'error';
            doc.error = error.message;
            localStorage.setItem('processing_queue', JSON.stringify(AppState.processingQueue));
            
            this.updateQueueDisplay();
            this.updateQueueDisplay('uploadQueue');
            
            ModernUI.showToast(`❌ Error: ${error.message}`, 'error');
        }
    }

    static async processAll() {
        const pendingDocs = AppState.processingQueue.filter(d => d.status === 'pending');
        
        if (pendingDocs.length === 0) {
            ModernUI.showToast('No hay documentos pendientes', 'info');
            return;
        }

        ModernUI.showToast(`Procesando ${pendingDocs.length} documentos...`, 'info');
        
        for (const doc of pendingDocs) {
            await this.processDocument(doc.id);
            // Pequeña pausa entre documentos
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }

    static retryDocument(docId) {
        const doc = AppState.processingQueue.find(d => d.id === docId);
        if (doc) {
            doc.status = 'pending';
            doc.error = null;
            localStorage.setItem('processing_queue', JSON.stringify(AppState.processingQueue));
            this.updateQueueDisplay();
            ModernUI.showToast('Documento listo para reintentar', 'info');
        }
    }

    static viewResult(docId) {
        const doc = AppState.processingQueue.find(d => d.id === docId);
        if (doc && doc.result) {
            this.displayResults(doc.result);
        }
    }

    static removeFromQueue(docId) {
        if (confirm('¿Eliminar este documento de la cola?')) {
            AppState.processingQueue = AppState.processingQueue.filter(d => d.id !== docId);
            localStorage.setItem('processing_queue', JSON.stringify(AppState.processingQueue));
            this.updateQueueDisplay();
            this.updateQueueDisplay('uploadQueue');
            ModernUI.updateSidebarCounters();
            ModernUI.showToast('Documento eliminado de la cola', 'info');
        }
    }

    static displayResults(doc) {
        const resultsDiv = document.getElementById('processingResults');
        if (!resultsDiv) return;
        
        resultsDiv.innerHTML = `
            <div class="results-card">
                <div class="results-header">
                    <h3>📊 Resultados: ${doc.filename}</h3>
                    <span class="badge">${doc.templateName || 'Documento'}</span>
                </div>
                <table class="data-table">
                    <tbody>
                        ${Object.entries(doc.data).map(([key, value]) => `
                            <tr>
                                <td style="width: 40%; font-weight: 500;">${this.formatFieldName(key)}</td>
                                <td>${value || '-'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                <div class="results-footer">
                    <span class="cost-info">Costo: $${(doc.cost || 0).toFixed(3)}</span>
                    <button class="btn btn-primary" onclick="DocumentManager.goToDocument('${doc.id}')">
                        <i class="fas fa-folder-open"></i> Ver en Documentos
                    </button>
                </div>
            </div>
        `;
        
        // Scroll a resultados
        resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    static formatFieldName(key) {
        return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
}

// ========================
// Gestores Adicionales Mejorados
// ========================

class DocumentManager {
    static loadDocumentsPage() {
        document.getElementById('pageContent').innerHTML = `
            <div class="page-header">
                <h2>📁 Documentos Procesados</h2>
                <div class="header-actions">
                    <button class="btn btn-primary" onclick="IntegrationManager.exportToExcel()">
                        <i class="fas fa-file-excel"></i> Exportar Excel
                    </button>
                    <button class="btn btn-secondary" onclick="DocumentManager.clearAll()">
                        <i class="fas fa-trash"></i> Limpiar Todo
                    </button>
                </div>
            </div>

            <div class="documents-table">
                ${this.renderTable()}
            </div>
        `;
    }

    static renderTable() {
        if (AppState.documents.length === 0) {
            return '<p class="empty-state">No hay documentos procesados aún</p>';
        }

        return `
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Fecha</th>
                        <th>Archivo</th>
                        <th>Tipo</th>
                        <th>Emisor</th>
                        <th>Total</th>
                        <th>Costo</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${AppState.documents.map(doc => `
                        <tr>
                            <td>${new Date(doc.timestamp).toLocaleDateString()}</td>
                            <td>${doc.filename}</td>
                            <td><span class="badge">${doc.templateName || doc.template}</span></td>
                            <td>${doc.data.vendor || doc.data.emisor || '-'}</td>
                            <td>${doc.data.total || '-'}</td>
                            <td>$${(doc.cost || 0).toFixed(3)}</td>
                            <td>
                                <button class="btn-icon" onclick="DocumentManager.viewDocument('${doc.id}')" title="Ver">
                                    <i class="fas fa-eye"></i>
                                </button>
                                <button class="btn-icon danger" onclick="DocumentManager.deleteDoc('${doc.id}')" title="Eliminar">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    static viewDocument(docId) {
        const doc = AppState.documents.find(d => d.id === docId);
        if (doc) {
            DocumentProcessor.displayResults(doc);
        }
    }

    static goToDocument(docId) {
        ModernUI.loadPage('documents');
        setTimeout(() => {
            this.viewDocument(docId);
        }, 100);
    }

    static deleteDoc(docId) {
        if (confirm('¿Eliminar este documento?')) {
            AppState.documents = AppState.documents.filter(d => d.id !== docId);
            localStorage.setItem('processed_documents', JSON.stringify(AppState.documents));
            this.loadDocumentsPage();
            ModernUI.updateSidebarCounters();
            ModernUI.showToast('Documento eliminado', 'success');
        }
    }

    static clearAll() {
        if (confirm('¿Eliminar TODOS los documentos procesados? Esta acción no se puede deshacer.')) {
            AppState.documents = [];
            localStorage.setItem('processed_documents', JSON.stringify(AppState.documents));
            this.loadDocumentsPage();
            ModernUI.updateSidebarCounters();
            ModernUI.showToast('Todos los documentos eliminados', 'success');
        }
    }
}

class TemplateManager {
    static loadTemplatesPage() {
        document.getElementById('pageContent').innerHTML = `
            <h2>🎨 Plantillas de Documentos</h2>
            <div class="templates-grid">
                ${AppState.templates.map(t => `
                    <div class="template-card" style="border-color: ${t.color}">
                        <span class="template-icon">${t.icon}</span>
                        <h3>${t.name}</h3>
                        <p>${t.fields.length} campos</p>
                        <div class="fields-preview">
                            ${t.fields.slice(0, 3).map(f => `
                                <span class="field-tag">${f.label}</span>
                            `).join('')}
                            ${t.fields.length > 3 ? '<span class="field-tag">...</span>' : ''}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
}

class SettingsManager {
    static loadSettingsPage() {
        document.getElementById('pageContent').innerHTML = `
            <h2>⚙️ Configuración</h2>
            <div class="settings-section">
                <h3>API de OpenAI</h3>
                
                <label>API Key de OpenAI</label>
                <div class="input-group">
                    <input type="password" id="apiKeyInput" value="${AppState.config.apiKey}" 
                           placeholder="sk-..." class="form-input">
                    <button class="btn btn-primary" onclick="SettingsManager.validateKey()">
                        <i class="fas fa-check"></i> Validar
                    </button>
                </div>
                <div id="keyStatus" class="mt-2"></div>
                
                <label class="mt-4">Modelo Predeterminado</label>
                <select id="modelSelect" class="form-select">
                    <option value="gpt-4o-mini" ${AppState.config.selectedModel === 'gpt-4o-mini' ? 'selected' : ''}>
                        GPT-4 Vision Mini (Económico - $0.002/doc)
                    </option>
                    <option value="gpt-4o" ${AppState.config.selectedModel === 'gpt-4o' ? 'selected' : ''}>
                        GPT-4 Vision (Preciso - $0.01/doc)
                    </option>
                    <option value="gpt-4-turbo" ${AppState.config.selectedModel === 'gpt-4-turbo' ? 'selected' : ''}>
                        GPT-4 Turbo (Balanceado - $0.006/doc)
                    </option>
                </select>

                <div class="mt-4">
                    <button class="btn btn-primary" onclick="SettingsManager.save()">
                        <i class="fas fa-save"></i> Guardar Configuración
                    </button>
                </div>

                <h3 class="mt-6">Gestión de Datos</h3>
                <div class="button-group">
                    <button class="btn btn-secondary" onclick="SettingsManager.exportData()">
                        <i class="fas fa-download"></i> Exportar Datos
                    </button>
                    <button class="btn btn-danger" onclick="SettingsManager.resetAll()">
                        <i class="fas fa-trash-alt"></i> Resetear Todo
                    </button>
                </div>
            </div>
        `;
    }

    static async validateKey() {
        const apiKey = document.getElementById('apiKeyInput').value.trim();
        const statusDiv = document.getElementById('keyStatus');
        
        if (!apiKey) {
            statusDiv.innerHTML = '<span class="text-warning">⚠️ Por favor ingresa una API Key</span>';
            return;
        }

        statusDiv.innerHTML = '<span class="text-info">🔄 Validando...</span>';

        try {
            const response = await fetch('/api/validate-key', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ apiKey })
            });

            const result = await response.json();
            
            if (result.valid) {
                statusDiv.innerHTML = '<span class="text-success">✅ API Key válida</span>';
                ModernUI.showToast('API Key validada correctamente', 'success');
            } else {
                statusDiv.innerHTML = '<span class="text-danger">❌ API Key inválida</span>';
                ModernUI.showToast('API Key inválida', 'error');
            }
        } catch (error) {
            statusDiv.innerHTML = '<span class="text-danger">❌ Error validando API Key</span>';
            ModernUI.showToast('Error validando API Key', 'error');
        }
    }

    static save() {
        AppState.config.apiKey = document.getElementById('apiKeyInput').value.trim();
        AppState.config.selectedModel = document.getElementById('modelSelect').value;
        
        localStorage.setItem('openai_api_key', AppState.config.apiKey);
        localStorage.setItem('selected_model', AppState.config.selectedModel);
        
        ModernUI.showToast('✅ Configuración guardada', 'success');
    }

    static exportData() {
        const data = {
            documents: AppState.documents,
            processingQueue: AppState.processingQueue,
            config: {
                selectedModel: AppState.config.selectedModel,
                autoClassify: AppState.config.autoClassify,
                costTracking: AppState.config.costTracking
            },
            stats: AppState.stats,
            exportDate: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `docuai_backup_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        
        ModernUI.showToast('Datos exportados', 'success');
    }

    static resetAll() {
        if (confirm('¿Estás seguro? Se eliminarán TODOS los datos y configuraciones.')) {
            localStorage.clear();
            location.reload();
        }
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
                Fecha: new Date(doc.timestamp).toLocaleDateString(),
                Archivo: doc.filename,
                Tipo: doc.templateName || doc.template,
                ...doc.data,
                Costo: doc.cost || 0
            }));

            const ws = XLSX.utils.json_to_sheet(data);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Documentos');
            XLSX.writeFile(wb, `documentos_${new Date().toISOString().split('T')[0]}.xlsx`);
            
            ModernUI.showToast('✅ Excel exportado exitosamente', 'success');
        } catch (error) {
            console.error('Error exportando:', error);
            ModernUI.showToast('❌ Error al exportar Excel', 'error');
        }
    }
}

// ========================
// Inicialización
// ========================

document.addEventListener('DOMContentLoaded', () => {
    // Limpiar cola de procesamiento de sesiones anteriores que quedaron en "processing"
    let queueUpdated = false;
    AppState.processingQueue.forEach(item => {
        if (item.status === 'processing') {
            item.status = 'pending';
            queueUpdated = true;
        }
    });
    
    if (queueUpdated) {
        localStorage.setItem('processing_queue', JSON.stringify(AppState.processingQueue));
    }

    // Inicializar aplicación
    ModernUI.init();
});