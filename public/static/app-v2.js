// ========================
// Estado Global Mejorado
// ========================
const AppState = {
    // Configuración
    config: {
        apiKey: localStorage.getItem('openai_api_key') || '',
        selectedModel: localStorage.getItem('selected_model') || 'gpt-4o-mini',
        theme: localStorage.getItem('theme') || 'light',
        autoClassify: localStorage.getItem('auto_classify') === 'true',
        costTracking: localStorage.getItem('cost_tracking') === 'true'
    },
    
    // Plantillas de documentos
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
    
    // Memoria de proveedores y correcciones
    vendorMemory: JSON.parse(localStorage.getItem('vendor_memory') || JSON.stringify({
        vendors: [],
        corrections: {},
        rules: {}
    })),
    
    // Documentos procesados
    documents: JSON.parse(localStorage.getItem('processed_documents') || '[]'),
    
    // Estado temporal
    currentDocument: null,
    currentTemplate: null,
    processingQueue: [],
    batchMode: false,
    
    // Estadísticas
    stats: {
        totalProcessed: 0,
        totalCost: 0,
        averageAccuracy: 0,
        timesSaved: 0
    }
};

// ========================
// Componentes UI Modernos
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
            <!-- Sidebar Moderno -->
            <aside id="sidebar" class="sidebar">
                <div class="sidebar-header">
                    <div class="logo">
                        <div class="logo-icon">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                                <path d="M9 7H7a2 2 0 00-2 2v9a2 2 0 002 2h9a2 2 0 002-2v-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 8l2 2 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                            </svg>
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
                        <span class="badge">Nuevo</span>
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
                    <a href="#" class="nav-item" data-page="vendors">
                        <i class="fas fa-building"></i>
                        <span>Proveedores</span>
                    </a>
                    <a href="#" class="nav-item" data-page="integrations">
                        <i class="fas fa-plug"></i>
                        <span>Integraciones</span>
                    </a>
                    <a href="#" class="nav-item" data-page="settings">
                        <i class="fas fa-cog"></i>
                        <span>Configuración</span>
                    </a>
                </nav>

                <div class="sidebar-footer">
                    <div class="user-info">
                        <div class="user-avatar">
                            <i class="fas fa-user"></i>
                        </div>
                        <div class="user-details">
                            <span class="user-name">Usuario</span>
                            <span class="user-plan">Plan Pro</span>
                        </div>
                    </div>
                    <button class="theme-toggle" onclick="ModernUI.toggleTheme()">
                        <i class="fas fa-moon" id="themeIcon"></i>
                    </button>
                </div>
            </aside>

            <!-- Main Content Area -->
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
                        <!-- Quick Actions -->
                        <button class="quick-action" onclick="ModernUI.openQuickUpload()">
                            <i class="fas fa-upload"></i>
                            <span>Carga Rápida</span>
                        </button>
                        
                        <!-- Cost Tracker -->
                        <div class="cost-tracker">
                            <i class="fas fa-coins"></i>
                            <span>$<span id="totalCost">0.00</span></span>
                        </div>

                        <!-- Notifications -->
                        <button class="notification-btn">
                            <i class="fas fa-bell"></i>
                            <span class="notification-dot"></span>
                        </button>
                    </div>
                </header>

                <!-- Page Content -->
                <div id="pageContent" class="page-content">
                    <!-- El contenido dinámico se cargará aquí -->
                </div>
            </main>

            <!-- Modales y Overlays -->
            <div id="modalContainer"></div>
            
            <!-- Toast Notifications -->
            <div id="toastContainer" class="toast-container"></div>

            <!-- Quick Upload Modal -->
            <div id="quickUploadModal" class="modal-overlay hidden">
                <div class="modal quick-upload-modal">
                    <div class="modal-header">
                        <h2>Carga Rápida de Documentos</h2>
                        <button class="modal-close" onclick="ModernUI.closeQuickUpload()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="upload-zone" id="quickDropZone">
                            <div class="upload-icon">
                                <i class="fas fa-cloud-upload-alt"></i>
                            </div>
                            <p class="upload-text">Arrastra documentos aquí</p>
                            <p class="upload-subtext">o haz clic para seleccionar</p>
                            <input type="file" id="quickFileInput" multiple accept="image/*,.pdf" hidden>
                        </div>
                        <div class="upload-queue" id="uploadQueue"></div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="ModernUI.closeQuickUpload()">Cancelar</button>
                        <button class="btn btn-primary" onclick="DocumentProcessor.processBatch()">
                            <i class="fas fa-magic"></i> Procesar Todo
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    static loadDashboard() {
        document.getElementById('pageContent').innerHTML = `
            <!-- Stats Cards -->
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon bg-blue">
                        <i class="fas fa-file-invoice"></i>
                    </div>
                    <div class="stat-content">
                        <span class="stat-label">Documentos Procesados</span>
                        <span class="stat-value">${AppState.documents.length}</span>
                        <span class="stat-change positive">+12% este mes</span>
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-icon bg-green">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <div class="stat-content">
                        <span class="stat-label">Precisión Promedio</span>
                        <span class="stat-value">94.5%</span>
                        <span class="stat-change positive">+2.3%</span>
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-icon bg-purple">
                        <i class="fas fa-clock"></i>
                    </div>
                    <div class="stat-content">
                        <span class="stat-label">Tiempo Ahorrado</span>
                        <span class="stat-value">42h</span>
                        <span class="stat-change">este mes</span>
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-icon bg-orange">
                        <i class="fas fa-dollar-sign"></i>
                    </div>
                    <div class="stat-content">
                        <span class="stat-label">Costo API</span>
                        <span class="stat-value">$${AppState.stats.totalCost.toFixed(2)}</span>
                        <span class="stat-change neutral">$0.003/doc</span>
                    </div>
                </div>
            </div>

            <!-- Recent Activity -->
            <div class="dashboard-section">
                <div class="section-header">
                    <h2>Actividad Reciente</h2>
                    <button class="btn btn-sm btn-primary" onclick="ModernUI.loadPage('documents')">
                        Ver Todo
                    </button>
                </div>
                <div class="activity-list">
                    ${this.renderRecentActivity()}
                </div>
            </div>

            <!-- Quick Actions -->
            <div class="dashboard-section">
                <h2>Acciones Rápidas</h2>
                <div class="quick-actions-grid">
                    <button class="quick-action-card" onclick="ModernUI.loadPage('process')">
                        <i class="fas fa-file-upload"></i>
                        <span>Procesar Documento</span>
                    </button>
                    <button class="quick-action-card" onclick="ModernUI.loadPage('templates')">
                        <i class="fas fa-plus-circle"></i>
                        <span>Nueva Plantilla</span>
                    </button>
                    <button class="quick-action-card" onclick="IntegrationManager.exportToExcel()">
                        <i class="fas fa-file-excel"></i>
                        <span>Exportar Excel</span>
                    </button>
                    <button class="quick-action-card" onclick="ModernUI.loadPage('integrations')">
                        <i class="fas fa-share-alt"></i>
                        <span>Configurar API</span>
                    </button>
                </div>
            </div>

            <!-- Chart Section -->
            <div class="dashboard-section">
                <h2>Análisis de Procesamiento</h2>
                <div class="chart-container">
                    <canvas id="processingChart"></canvas>
                </div>
            </div>
        `;

        // Inicializar gráficos
        this.initCharts();
    }

    static renderRecentActivity() {
        const recent = AppState.documents.slice(-5).reverse();
        if (recent.length === 0) {
            return '<p class="empty-state">No hay actividad reciente</p>';
        }

        return recent.map(doc => `
            <div class="activity-item">
                <div class="activity-icon">
                    <i class="fas fa-file-alt"></i>
                </div>
                <div class="activity-details">
                    <span class="activity-title">${doc.vendor || 'Documento'}</span>
                    <span class="activity-time">${this.formatDate(doc.timestamp)}</span>
                </div>
                <div class="activity-status">
                    <span class="status-badge success">Procesado</span>
                </div>
            </div>
        `).join('');
    }

    static loadPage(page) {
        // Actualizar navegación activa
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.page === page) {
                item.classList.add('active');
            }
        });

        // Cargar contenido de la página
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
            case 'vendors':
                VendorManager.loadVendorsPage();
                break;
            case 'integrations':
                IntegrationManager.loadIntegrationsPage();
                break;
            case 'settings':
                SettingsManager.loadSettingsPage();
                break;
        }

        // Actualizar título de página
        const titles = {
            dashboard: 'Dashboard',
            process: 'Procesar Documentos',
            documents: 'Documentos',
            templates: 'Plantillas',
            vendors: 'Proveedores',
            integrations: 'Integraciones',
            settings: 'Configuración'
        };
        document.getElementById('pageTitle').textContent = titles[page] || 'DocuAI Pro';
    }

    static toggleSidebar() {
        document.getElementById('sidebar').classList.toggle('collapsed');
        document.getElementById('mainContent').classList.toggle('expanded');
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
        document.getElementById('themeIcon').className = AppState.config.theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
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
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        document.getElementById('toastContainer').appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    static attachEventListeners() {
        // Navegación
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = item.dataset.page;
                this.loadPage(page);
            });
        });

        // Quick Upload Drop Zone
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

    static formatDate(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) return 'Hace un momento';
        if (diff < 3600000) return `Hace ${Math.floor(diff/60000)} minutos`;
        if (diff < 86400000) return `Hace ${Math.floor(diff/3600000)} horas`;
        return date.toLocaleDateString();
    }

    static initCharts() {
        // Aquí se inicializarían gráficos con Chart.js
        // Por ahora es un placeholder
    }
}

// ========================
// Procesador de Documentos Mejorado
// ========================

class DocumentProcessor {
    static loadProcessPage() {
        document.getElementById('pageContent').innerHTML = `
            <div class="process-container">
                <!-- Upload Section -->
                <div class="upload-section">
                    <div class="upload-area" id="mainDropZone">
                        <div class="upload-content">
                            <div class="upload-animation">
                                <i class="fas fa-file-upload"></i>
                            </div>
                            <h3>Arrastra tus documentos aquí</h3>
                            <p>Soportamos imágenes y PDFs multipágina</p>
                            <button class="btn btn-primary" onclick="document.getElementById('mainFileInput').click()">
                                <i class="fas fa-folder-open"></i> Seleccionar Archivos
                            </button>
                            <input type="file" id="mainFileInput" multiple accept="image/*,.pdf" hidden>
                        </div>
                    </div>

                    <!-- Processing Options -->
                    <div class="processing-options">
                        <div class="option-card">
                            <div class="option-header">
                                <h4>Modo de Procesamiento</h4>
                                <label class="switch">
                                    <input type="checkbox" id="batchMode" ${AppState.batchMode ? 'checked' : ''}>
                                    <span class="slider"></span>
                                </label>
                            </div>
                            <p>Procesar múltiples documentos de una vez</p>
                        </div>

                        <div class="option-card">
                            <div class="option-header">
                                <h4>Clasificación Automática</h4>
                                <label class="switch">
                                    <input type="checkbox" id="autoClassify" ${AppState.config.autoClassify ? 'checked' : ''}>
                                    <span class="slider"></span>
                                </label>
                            </div>
                            <p>Detectar tipo de documento automáticamente</p>
                        </div>

                        <div class="option-card">
                            <div class="option-header">
                                <h4>Optimización de Costos</h4>
                                <label class="switch">
                                    <input type="checkbox" id="costOptimization" ${AppState.config.costTracking ? 'checked' : ''}>
                                    <span class="slider"></span>
                                </label>
                            </div>
                            <p>Usar modelo económico para documentos simples</p>
                        </div>

                        <div class="option-card">
                            <div class="option-header">
                                <h4>Plantilla Predeterminada</h4>
                            </div>
                            <select id="defaultTemplate" class="form-select">
                                <option value="">Autodetectar</option>
                                ${AppState.templates.map(t => `
                                    <option value="${t.id}">${t.icon} ${t.name}</option>
                                `).join('')}
                            </select>
                        </div>
                    </div>
                </div>

                <!-- Document Queue -->
                <div class="document-queue" id="documentQueue">
                    <!-- Los documentos en cola aparecerán aquí -->
                </div>

                <!-- Processing Results -->
                <div class="processing-results" id="processingResults">
                    <!-- Los resultados aparecerán aquí -->
                </div>
            </div>
        `;

        this.attachProcessingEvents();
    }

    static attachProcessingEvents() {
        const mainDropZone = document.getElementById('mainDropZone');
        const mainFileInput = document.getElementById('mainFileInput');

        if (mainDropZone) {
            mainDropZone.addEventListener('dragover', (e) => {
                e.preventDefault();
                mainDropZone.classList.add('dragover');
            });

            mainDropZone.addEventListener('dragleave', () => {
                mainDropZone.classList.remove('dragover');
            });

            mainDropZone.addEventListener('drop', (e) => {
                e.preventDefault();
                mainDropZone.classList.remove('dragover');
                this.handleFiles(e.dataTransfer.files);
            });
        }

        if (mainFileInput) {
            mainFileInput.addEventListener('change', (e) => {
                this.handleFiles(e.target.files);
            });
        }

        // Event listeners para opciones
        ['batchMode', 'autoClassify', 'costOptimization'].forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('change', (e) => {
                    this.updateProcessingOption(id, e.target.checked);
                });
            }
        });
    }

    static handleFiles(files) {
        const queue = document.getElementById('documentQueue');
        const uploadQueue = document.getElementById('uploadQueue');
        const targetQueue = queue || uploadQueue;

        if (!targetQueue) return;

        Array.from(files).forEach(file => {
            const id = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const queueItem = this.createQueueItem(file, id);
            
            AppState.processingQueue.push({
                id,
                file,
                status: 'pending'
            });

            targetQueue.innerHTML += queueItem;
        });

        ModernUI.showToast(`${files.length} documento(s) añadido(s) a la cola`, 'success');
    }

    static createQueueItem(file, id) {
        const fileSize = (file.size / 1024 / 1024).toFixed(2);
        const isPDF = file.type === 'application/pdf';
        
        return `
            <div class="queue-item" id="${id}">
                <div class="queue-item-icon">
                    <i class="fas fa-${isPDF ? 'file-pdf' : 'file-image'}"></i>
                </div>
                <div class="queue-item-details">
                    <span class="queue-item-name">${file.name}</span>
                    <span class="queue-item-info">${fileSize} MB • ${isPDF ? 'PDF' : 'Imagen'}</span>
                </div>
                <div class="queue-item-status">
                    <span class="status-badge pending">Pendiente</span>
                </div>
                <div class="queue-item-actions">
                    <button class="btn-icon" onclick="DocumentProcessor.processDocument('${id}')">
                        <i class="fas fa-play"></i>
                    </button>
                    <button class="btn-icon" onclick="DocumentProcessor.removeFromQueue('${id}')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `;
    }

    static async processDocument(docId) {
        const doc = AppState.processingQueue.find(d => d.id === docId);
        if (!doc) return;

        // Actualizar estado UI
        const queueItem = document.getElementById(docId);
        if (queueItem) {
            queueItem.querySelector('.status-badge').textContent = 'Procesando...';
            queueItem.querySelector('.status-badge').className = 'status-badge processing';
        }

        try {
            // Convertir archivo a base64
            const base64 = await this.fileToBase64(doc.file);
            
            // Detectar plantilla si está activada la clasificación automática
            let template = AppState.templates[0]; // Por defecto
            if (AppState.config.autoClassify) {
                template = await this.classifyDocument(base64);
            }

            // Seleccionar modelo basado en optimización de costos
            const model = this.selectOptimalModel(doc.file);

            // Procesar con API
            const result = await this.callProcessingAPI(base64, template, model);

            // Aplicar correcciones de proveedor si existen
            const correctedResult = this.applyVendorCorrections(result);

            // Guardar resultado
            this.saveProcessedDocument(correctedResult, template, doc.file.name);

            // Actualizar UI
            if (queueItem) {
                queueItem.querySelector('.status-badge').textContent = 'Completado';
                queueItem.querySelector('.status-badge').className = 'status-badge success';
            }

            ModernUI.showToast('Documento procesado exitosamente', 'success');

        } catch (error) {
            console.error('Error procesando documento:', error);
            if (queueItem) {
                queueItem.querySelector('.status-badge').textContent = 'Error';
                queueItem.querySelector('.status-badge').className = 'status-badge error';
            }
            ModernUI.showToast('Error procesando documento', 'error');
        }
    }

    static async processBatch() {
        const pendingDocs = AppState.processingQueue.filter(d => d.status === 'pending');
        
        for (const doc of pendingDocs) {
            await this.processDocument(doc.id);
            // Pequeña pausa entre procesamiento
            await new Promise(resolve => setTimeout(resolve, 500));
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
        // Aquí implementaríamos la clasificación con embeddings
        // Por ahora, clasificación simple basada en keywords
        try {
            const response = await fetch('/api/classify-document', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ imageBase64: base64 })
            });
            
            const result = await response.json();
            const templateId = result.templateId || 'invoice';
            
            return AppState.templates.find(t => t.id === templateId) || AppState.templates[0];
        } catch (error) {
            console.error('Error clasificando documento:', error);
            return AppState.templates[0];
        }
    }

    static selectOptimalModel(file) {
        // Lógica para seleccionar modelo basado en tamaño y complejidad
        const fileSizeMB = file.size / (1024 * 1024);
        
        if (AppState.config.costTracking) {
            // Usar modelo económico para archivos pequeños
            if (fileSizeMB < 1) {
                return 'gpt-4o-mini';
            }
        }
        
        return AppState.config.selectedModel;
    }

    static async callProcessingAPI(base64, template, model) {
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

        if (!response.ok) throw new Error('Error en API');
        
        const result = await response.json();
        return result.data;
    }

    static applyVendorCorrections(data) {
        // Aplicar correcciones guardadas por proveedor
        const vendor = data.vendor || data.emisor;
        if (vendor && AppState.vendorMemory.corrections[vendor]) {
            const corrections = AppState.vendorMemory.corrections[vendor];
            
            Object.keys(corrections).forEach(field => {
                if (data[field]) {
                    data[field] = corrections[field](data[field]);
                }
            });
        }
        
        return data;
    }

    static saveProcessedDocument(data, template, filename) {
        const document = {
            id: `doc_${Date.now()}`,
            timestamp: new Date().toISOString(),
            filename: filename,
            template: template.id,
            data: data,
            corrections: []
        };

        AppState.documents.push(document);
        localStorage.setItem('processed_documents', JSON.stringify(AppState.documents));
        
        // Actualizar estadísticas
        this.updateStats();
    }

    static updateStats() {
        // Actualizar contador en sidebar
        const counter = document.querySelector('.nav-item[data-page="documents"] .counter');
        if (counter) {
            counter.textContent = AppState.documents.length;
        }
    }

    static removeFromQueue(docId) {
        AppState.processingQueue = AppState.processingQueue.filter(d => d.id !== docId);
        const element = document.getElementById(docId);
        if (element) {
            element.remove();
        }
    }

    static updateProcessingOption(option, value) {
        if (option === 'batchMode') {
            AppState.batchMode = value;
        } else if (option === 'autoClassify') {
            AppState.config.autoClassify = value;
            localStorage.setItem('auto_classify', value);
        } else if (option === 'costOptimization') {
            AppState.config.costTracking = value;
            localStorage.setItem('cost_tracking', value);
        }
    }
}

// ========================
// Gestor de Plantillas
// ========================

class TemplateManager {
    static loadTemplatesPage() {
        document.getElementById('pageContent').innerHTML = `
            <div class="templates-container">
                <div class="page-header">
                    <h2>Gestión de Plantillas</h2>
                    <button class="btn btn-primary" onclick="TemplateManager.createNewTemplate()">
                        <i class="fas fa-plus"></i> Nueva Plantilla
                    </button>
                </div>

                <div class="templates-grid">
                    ${AppState.templates.map(template => this.renderTemplateCard(template)).join('')}
                </div>
            </div>
        `;
    }

    static renderTemplateCard(template) {
        return `
            <div class="template-card" style="border-color: ${template.color}">
                <div class="template-header">
                    <span class="template-icon">${template.icon}</span>
                    <h3>${template.name}</h3>
                </div>
                <div class="template-fields">
                    <p class="fields-count">${template.fields.length} campos</p>
                    <div class="fields-preview">
                        ${template.fields.slice(0, 3).map(f => `
                            <span class="field-tag">${f.label}</span>
                        `).join('')}
                        ${template.fields.length > 3 ? '<span class="field-tag">...</span>' : ''}
                    </div>
                </div>
                <div class="template-actions">
                    <button class="btn btn-sm btn-secondary" onclick="TemplateManager.editTemplate('${template.id}')">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="TemplateManager.deleteTemplate('${template.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }

    static createNewTemplate() {
        // Implementar creación de plantillas
        ModernUI.showToast('Función en desarrollo', 'info');
    }

    static editTemplate(templateId) {
        // Implementar edición de plantillas
        ModernUI.showToast('Editando plantilla: ' + templateId, 'info');
    }

    static deleteTemplate(templateId) {
        if (confirm('¿Eliminar esta plantilla?')) {
            AppState.templates = AppState.templates.filter(t => t.id !== templateId);
            localStorage.setItem('document_templates', JSON.stringify(AppState.templates));
            this.loadTemplatesPage();
            ModernUI.showToast('Plantilla eliminada', 'success');
        }
    }
}

// ========================
// Gestor de Documentos
// ========================

class DocumentManager {
    static loadDocumentsPage() {
        document.getElementById('pageContent').innerHTML = `
            <div class="documents-container">
                <div class="page-header">
                    <h2>Documentos Procesados</h2>
                    <div class="header-actions">
                        <button class="btn btn-secondary" onclick="IntegrationManager.exportToExcel()">
                            <i class="fas fa-file-excel"></i> Exportar Excel
                        </button>
                        <button class="btn btn-secondary" onclick="DocumentManager.exportToJSON()">
                            <i class="fas fa-file-code"></i> Exportar JSON
                        </button>
                    </div>
                </div>

                <div class="documents-filters">
                    <input type="text" placeholder="Buscar documentos..." class="search-input" id="docSearch">
                    <select class="filter-select">
                        <option value="">Todos los tipos</option>
                        ${AppState.templates.map(t => `
                            <option value="${t.id}">${t.name}</option>
                        `).join('')}
                    </select>
                    <input type="date" class="date-filter" placeholder="Desde">
                    <input type="date" class="date-filter" placeholder="Hasta">
                </div>

                <div class="documents-table">
                    ${this.renderDocumentsTable()}
                </div>
            </div>
        `;
    }

    static renderDocumentsTable() {
        if (AppState.documents.length === 0) {
            return '<p class="empty-state">No hay documentos procesados aún</p>';
        }

        return `
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Fecha</th>
                        <th>Tipo</th>
                        <th>Proveedor</th>
                        <th>Total</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${AppState.documents.map(doc => `
                        <tr>
                            <td>${new Date(doc.timestamp).toLocaleDateString()}</td>
                            <td>${this.getTemplateName(doc.template)}</td>
                            <td>${doc.data.vendor || doc.data.emisor || '-'}</td>
                            <td>${doc.data.total || '-'}</td>
                            <td><span class="status-badge success">Procesado</span></td>
                            <td>
                                <button class="btn-icon" onclick="DocumentManager.viewDocument('${doc.id}')">
                                    <i class="fas fa-eye"></i>
                                </button>
                                <button class="btn-icon" onclick="DocumentManager.editDocument('${doc.id}')">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn-icon danger" onclick="DocumentManager.deleteDocument('${doc.id}')">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    static getTemplateName(templateId) {
        const template = AppState.templates.find(t => t.id === templateId);
        return template ? template.name : 'Desconocido';
    }

    static viewDocument(docId) {
        // Implementar visualización de documento
        ModernUI.showToast('Visualizando documento: ' + docId, 'info');
    }

    static editDocument(docId) {
        // Implementar edición de documento
        ModernUI.showToast('Editando documento: ' + docId, 'info');
    }

    static deleteDocument(docId) {
        if (confirm('¿Eliminar este documento?')) {
            AppState.documents = AppState.documents.filter(d => d.id !== docId);
            localStorage.setItem('processed_documents', JSON.stringify(AppState.documents));
            this.loadDocumentsPage();
            ModernUI.showToast('Documento eliminado', 'success');
        }
    }

    static exportToJSON() {
        const dataStr = JSON.stringify(AppState.documents, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const link = document.createElement('a');
        link.setAttribute('href', dataUri);
        link.setAttribute('download', `documentos_${new Date().toISOString().split('T')[0]}.json`);
        link.click();
        
        ModernUI.showToast('Exportado a JSON', 'success');
    }
}

// ========================
// Gestor de Proveedores
// ========================

class VendorManager {
    static loadVendorsPage() {
        document.getElementById('pageContent').innerHTML = `
            <div class="vendors-container">
                <div class="page-header">
                    <h2>Gestión de Proveedores</h2>
                    <button class="btn btn-primary" onclick="VendorManager.addVendor()">
                        <i class="fas fa-plus"></i> Añadir Proveedor
                    </button>
                </div>

                <div class="vendors-list">
                    ${this.renderVendorsList()}
                </div>
            </div>
        `;
    }

    static renderVendorsList() {
        const vendors = this.extractVendorsFromDocuments();
        
        if (vendors.length === 0) {
            return '<p class="empty-state">No hay proveedores registrados</p>';
        }

        return vendors.map(vendor => `
            <div class="vendor-card">
                <div class="vendor-info">
                    <h3>${vendor.name}</h3>
                    <p>Documentos procesados: ${vendor.count}</p>
                    <p>Última actividad: ${new Date(vendor.lastSeen).toLocaleDateString()}</p>
                </div>
                <div class="vendor-rules">
                    <h4>Reglas de Corrección</h4>
                    ${vendor.rules.length > 0 ? 
                        vendor.rules.map(rule => `
                            <div class="rule-item">
                                <span>${rule.field}: ${rule.description}</span>
                                <button class="btn-icon" onclick="VendorManager.removeRule('${vendor.name}', '${rule.id}')">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                        `).join('') :
                        '<p class="text-muted">Sin reglas definidas</p>'
                    }
                    <button class="btn btn-sm btn-secondary mt-2" onclick="VendorManager.addRule('${vendor.name}')">
                        <i class="fas fa-plus"></i> Añadir Regla
                    </button>
                </div>
            </div>
        `).join('');
    }

    static extractVendorsFromDocuments() {
        const vendorsMap = new Map();
        
        AppState.documents.forEach(doc => {
            const vendorName = doc.data.vendor || doc.data.emisor;
            if (vendorName) {
                if (!vendorsMap.has(vendorName)) {
                    vendorsMap.set(vendorName, {
                        name: vendorName,
                        count: 0,
                        lastSeen: doc.timestamp,
                        rules: AppState.vendorMemory.rules[vendorName] || []
                    });
                }
                const vendor = vendorsMap.get(vendorName);
                vendor.count++;
                if (doc.timestamp > vendor.lastSeen) {
                    vendor.lastSeen = doc.timestamp;
                }
            }
        });

        return Array.from(vendorsMap.values());
    }

    static addVendor() {
        // Implementar añadir proveedor
        ModernUI.showToast('Función en desarrollo', 'info');
    }

    static addRule(vendorName) {
        // Implementar añadir regla de corrección
        ModernUI.showToast('Añadiendo regla para: ' + vendorName, 'info');
    }

    static removeRule(vendorName, ruleId) {
        // Implementar eliminar regla
        ModernUI.showToast('Regla eliminada', 'success');
    }
}

// ========================
// Gestor de Integraciones
// ========================

class IntegrationManager {
    static loadIntegrationsPage() {
        document.getElementById('pageContent').innerHTML = `
            <div class="integrations-container">
                <div class="page-header">
                    <h2>Integraciones y API</h2>
                </div>

                <div class="integrations-grid">
                    <div class="integration-card">
                        <div class="integration-icon bg-green">
                            <i class="fas fa-table"></i>
                        </div>
                        <h3>Google Sheets</h3>
                        <p>Exporta automáticamente a hojas de cálculo</p>
                        <button class="btn btn-primary">Configurar</button>
                    </div>

                    <div class="integration-card">
                        <div class="integration-icon bg-blue">
                            <i class="fas fa-webhook"></i>
                        </div>
                        <h3>Webhooks</h3>
                        <p>Envía datos a tu servidor automáticamente</p>
                        <button class="btn btn-primary">Configurar</button>
                    </div>

                    <div class="integration-card">
                        <div class="integration-icon bg-purple">
                            <i class="fab fa-zapier"></i>
                        </div>
                        <h3>Zapier</h3>
                        <p>Conecta con miles de aplicaciones</p>
                        <button class="btn btn-primary">Configurar</button>
                    </div>

                    <div class="integration-card">
                        <div class="integration-icon bg-orange">
                            <i class="fas fa-database"></i>
                        </div>
                        <h3>API REST</h3>
                        <p>Accede a tus datos vía API</p>
                        <button class="btn btn-primary" onclick="IntegrationManager.showAPIKeys()">Ver API Keys</button>
                    </div>
                </div>

                <div class="api-section">
                    <h3>Documentación de API</h3>
                    <div class="api-docs">
                        <div class="endpoint">
                            <span class="method">POST</span>
                            <span class="path">/api/process-document</span>
                            <p>Procesa un nuevo documento</p>
                        </div>
                        <div class="endpoint">
                            <span class="method get">GET</span>
                            <span class="path">/api/documents</span>
                            <p>Obtiene lista de documentos procesados</p>
                        </div>
                        <div class="endpoint">
                            <span class="method get">GET</span>
                            <span class="path">/api/documents/:id</span>
                            <p>Obtiene un documento específico</p>
                        </div>
                        <div class="endpoint">
                            <span class="method put">PUT</span>
                            <span class="path">/api/documents/:id</span>
                            <p>Actualiza un documento</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    static exportToExcel() {
        if (AppState.documents.length === 0) {
            ModernUI.showToast('No hay documentos para exportar', 'warning');
            return;
        }

        try {
            // Preparar datos para Excel
            const data = AppState.documents.map(doc => {
                const flat = {
                    fecha: new Date(doc.timestamp).toLocaleDateString(),
                    tipo: doc.template,
                    archivo: doc.filename
                };
                
                // Aplanar datos del documento
                Object.keys(doc.data).forEach(key => {
                    flat[key] = doc.data[key];
                });
                
                return flat;
            });

            // Crear libro de Excel
            const ws = XLSX.utils.json_to_sheet(data);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Documentos');

            // Descargar
            const fileName = `documentos_${new Date().toISOString().split('T')[0]}.xlsx`;
            XLSX.writeFile(wb, fileName);
            
            ModernUI.showToast('Excel exportado exitosamente', 'success');
        } catch (error) {
            console.error('Error exportando Excel:', error);
            ModernUI.showToast('Error al exportar Excel', 'error');
        }
    }

    static showAPIKeys() {
        // Implementar mostrar API keys
        ModernUI.showToast('Mostrando API Keys', 'info');
    }
}

// ========================
// Gestor de Configuración
// ========================

class SettingsManager {
    static loadSettingsPage() {
        document.getElementById('pageContent').innerHTML = `
            <div class="settings-container">
                <div class="page-header">
                    <h2>Configuración</h2>
                </div>

                <div class="settings-sections">
                    <div class="settings-section">
                        <h3>API de OpenAI</h3>
                        <div class="form-group">
                            <label>API Key</label>
                            <div class="input-group">
                                <input type="password" id="apiKeyInput" value="${AppState.config.apiKey}" 
                                       placeholder="sk-..." class="form-input">
                                <button class="btn btn-primary" onclick="SettingsManager.validateAPIKey()">
                                    Validar
                                </button>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Modelo Predeterminado</label>
                            <select id="modelSelect" class="form-select">
                                <option value="gpt-4o-mini" ${AppState.config.selectedModel === 'gpt-4o-mini' ? 'selected' : ''}>
                                    GPT-4 Vision Mini (Económico)
                                </option>
                                <option value="gpt-4o" ${AppState.config.selectedModel === 'gpt-4o' ? 'selected' : ''}>
                                    GPT-4 Vision (Preciso)
                                </option>
                                <option value="gpt-4-turbo" ${AppState.config.selectedModel === 'gpt-4-turbo' ? 'selected' : ''}>
                                    GPT-4 Turbo
                                </option>
                            </select>
                        </div>
                    </div>

                    <div class="settings-section">
                        <h3>Preferencias</h3>
                        <div class="form-group">
                            <label class="checkbox-label">
                                <input type="checkbox" ${AppState.config.autoClassify ? 'checked' : ''}>
                                <span>Clasificación automática de documentos</span>
                            </label>
                        </div>
                        <div class="form-group">
                            <label class="checkbox-label">
                                <input type="checkbox" ${AppState.config.costTracking ? 'checked' : ''}>
                                <span>Optimización automática de costos</span>
                            </label>
                        </div>
                    </div>

                    <div class="settings-section">
                        <h3>Exportación de Datos</h3>
                        <div class="button-group">
                            <button class="btn btn-secondary" onclick="SettingsManager.exportAllData()">
                                <i class="fas fa-download"></i> Exportar Todo
                            </button>
                            <button class="btn btn-secondary" onclick="SettingsManager.importData()">
                                <i class="fas fa-upload"></i> Importar Datos
                            </button>
                            <button class="btn btn-danger" onclick="SettingsManager.clearAllData()">
                                <i class="fas fa-trash"></i> Limpiar Todo
                            </button>
                        </div>
                    </div>
                </div>

                <div class="settings-actions">
                    <button class="btn btn-primary" onclick="SettingsManager.saveSettings()">
                        Guardar Cambios
                    </button>
                </div>
            </div>
        `;
    }

    static async validateAPIKey() {
        const apiKey = document.getElementById('apiKeyInput').value.trim();
        
        if (!apiKey) {
            ModernUI.showToast('Por favor ingresa una API Key', 'warning');
            return;
        }

        try {
            const response = await fetch('/api/validate-key', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ apiKey })
            });

            const result = await response.json();
            
            if (result.valid) {
                AppState.config.apiKey = apiKey;
                localStorage.setItem('openai_api_key', apiKey);
                ModernUI.showToast('API Key válida', 'success');
            } else {
                ModernUI.showToast('API Key inválida', 'error');
            }
        } catch (error) {
            ModernUI.showToast('Error validando API Key', 'error');
        }
    }

    static saveSettings() {
        // Guardar configuración
        const apiKey = document.getElementById('apiKeyInput').value;
        const model = document.getElementById('modelSelect').value;

        AppState.config.apiKey = apiKey;
        AppState.config.selectedModel = model;

        localStorage.setItem('openai_api_key', apiKey);
        localStorage.setItem('selected_model', model);

        ModernUI.showToast('Configuración guardada', 'success');
    }

    static exportAllData() {
        const exportData = {
            config: AppState.config,
            templates: AppState.templates,
            documents: AppState.documents,
            vendorMemory: AppState.vendorMemory,
            exportDate: new Date().toISOString()
        };

        const dataStr = JSON.stringify(exportData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const link = document.createElement('a');
        link.setAttribute('href', dataUri);
        link.setAttribute('download', `docuai_backup_${new Date().toISOString().split('T')[0]}.json`);
        link.click();
        
        ModernUI.showToast('Datos exportados exitosamente', 'success');
    }

    static importData() {
        // Implementar importación de datos
        ModernUI.showToast('Función en desarrollo', 'info');
    }

    static clearAllData() {
        if (confirm('¿Estás seguro de que quieres eliminar todos los datos? Esta acción no se puede deshacer.')) {
            localStorage.clear();
            location.reload();
        }
    }
}

// ========================
// Inicialización
// ========================

document.addEventListener('DOMContentLoaded', () => {
    ModernUI.init();
});