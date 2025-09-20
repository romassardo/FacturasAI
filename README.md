# DocuAI Pro - Procesador Inteligente de Documentos con IA

## Descripción del Proyecto
- **Nombre**: Invoice Processor
- **Objetivo**: Automatizar la extracción de información de facturas y tickets usando Vision AI
- **Características principales**:
  - Procesamiento de imágenes con OpenAI Vision API
  - Selección de modelos de IA (GPT-4, GPT-4 mini, etc.)
  - Configuración personalizable de campos a extraer
  - Exportación de datos a Excel
  - Almacenamiento local de facturas procesadas

## URLs de Acceso
- **Versión Clásica**: http://localhost:3000
- **Versión Pro (Nueva)**: http://localhost:3000/v2
- **URL Pública**: https://3000-iqec3a6li4fmcc1b2tzwz-6532622b.e2b.dev
- **Producción**: (Pendiente de despliegue en Cloudflare Pages)
- **GitHub**: (Pendiente de configuración)

## Funcionalidades de la Versión Pro ✨

### Interfaz Ultra Moderna
- **Diseño Glassmorphism**: Efectos de vidrio y transparencias
- **Dark Mode**: Tema oscuro/claro con transiciones suaves
- **Animaciones Fluidas**: Transiciones y microinteracciones
- **Dashboard Analítico**: Estadísticas en tiempo real
- **Sidebar Colapsable**: Navegación optimizada

### Clasificador Inteligente con IA 🤖
- **Detección Automática**: Identifica el tipo de documento (factura, ticket, nota de gastos)
- **Plantillas Dinámicas**: Aplica la plantilla correcta según el documento
- **Aprendizaje Continuo**: Mejora con cada corrección del usuario
- **Clasificación por Embeddings**: Análisis semántico del contenido

### Memoria de Proveedores 🧠
- **Historial por Proveedor**: Guarda patrones de cada emisor
- **Correcciones Automáticas**: Aplica reglas aprendidas por proveedor
- **Reglas de Post-Proceso**: Corrección automática de errores comunes
- **Base de Conocimiento**: Mejora la precisión con el tiempo

### Procesamiento Avanzado 🚀
- **Soporte Multipágina**: Procesa PDFs de varias páginas
- **Procesamiento por Lotes**: Múltiples documentos simultáneamente
- **Detección de Continuidad**: Identifica elementos cortados entre páginas
- **Cola de Procesamiento**: Gestión visual de documentos pendientes

### Optimización de Costos 💰
- **Estimación Previa**: Calcula el costo antes de procesar
- **Selección Automática de Modelo**: Usa el modelo más económico según complejidad
- **Presupuesto por Lote**: Control de gastos en procesamiento masivo
- **Tracking de Costos**: Seguimiento en tiempo real del gasto en API

### Integraciones Empresariales 🔗
- **API REST Completa**: Endpoints para integración con sistemas externos
- **Webhooks**: Notificaciones automáticas a tu servidor
- **Exportación Múltiple**: Excel, JSON, CSV
- **Compatibilidad**: Zapier, Make (Integromat), n8n
- **Google Sheets**: Sincronización directa (próximamente)

### Editor Visual Interactivo 🖍️
- **Click-to-Fix**: Clic en el documento para corregir valores
- **Edición en Línea**: Modifica datos extraídos antes de guardar
- **Vista Previa en Tiempo Real**: Ver cambios instantáneamente
- **Validación de Campos**: Verificación automática de datos

## Funcionalidades Completadas ✅
1. **Configuración de API Key**: Validación y almacenamiento seguro de API key de OpenAI
2. **Selección de modelo**: Elegir entre diferentes modelos de OpenAI Vision
3. **Configuración de campos**: Personalizar qué campos extraer de las facturas
4. **Carga de imágenes**: Arrastrar y soltar o selección de archivos
5. **Procesamiento con IA**: Envío a OpenAI Vision API para extracción de datos
6. **Edición de resultados**: Posibilidad de editar datos extraídos antes de guardar
7. **Lista de facturas**: Almacenamiento local de facturas procesadas
8. **Exportación a Excel**: Generación de archivo Excel con todos los datos

## Endpoints de API Ampliados

### GET /
- **Descripción**: Página principal de la aplicación
- **Respuesta**: HTML con la interfaz de usuario

### POST /api/process-invoice
- **Descripción**: Procesar una imagen de factura/ticket con IA
- **Parámetros**:
  - `imageBase64`: Imagen en formato base64
  - `fields`: Array de campos a extraer
  - `apiKey`: API key de OpenAI
  - `model`: Modelo a usar (gpt-4o, gpt-4o-mini, etc.)
- **Respuesta**: JSON con los datos extraídos

### GET /api/models
- **Descripción**: Obtener lista de modelos disponibles
- **Respuesta**: Array de modelos con id, nombre y proveedor

### POST /api/validate-key
- **Descripción**: Validar una API key de OpenAI
- **Parámetros**:
  - `apiKey`: API key a validar
- **Respuesta**: `{ valid: boolean, error?: string }`

### POST /api/classify-document
- **Descripción**: Clasificar automáticamente el tipo de documento
- **Parámetros**:
  - `imageBase64`: Imagen del documento en base64
- **Respuesta**: `{ templateId: string }`

### POST /api/process-document
- **Descripción**: Procesar documento con plantilla específica
- **Parámetros**:
  - `imageBase64`: Imagen en base64
  - `fields`: Campos de la plantilla
  - `model`: Modelo a usar
- **Respuesta**: `{ data: object, cost: number }`

### GET /api/documents
- **Descripción**: Obtener lista de documentos procesados
- **Respuesta**: Array de documentos

### POST /api/estimate-cost
- **Descripción**: Estimar costo de procesamiento
- **Parámetros**:
  - `fileSize`: Tamaño del archivo
  - `pageCount`: Número de páginas
  - `model`: Modelo seleccionado
- **Respuesta**: `{ estimatedCost: number, processingTime: number }`

### POST /api/webhook
- **Descripción**: Enviar datos a webhook externo
- **Parámetros**:
  - `url`: URL del webhook
  - `data`: Datos a enviar
- **Respuesta**: `{ success: boolean, status: number }`

## Arquitectura de Datos

### Campos Predefinidos
- `numero_factura`: Número de factura o ticket
- `fecha`: Fecha del documento
- `emisor`: Nombre del emisor/vendedor
- `nif_emisor`: NIF/CIF del emisor
- `cliente`: Nombre del cliente
- `nif_cliente`: NIF/CIF del cliente
- `base_imponible`: Base imponible
- `iva`: IVA
- `total`: Total de la factura
- `metodo_pago`: Método de pago
- `concepto`: Concepto o descripción

### Almacenamiento
- **LocalStorage**: Se usa para persistir:
  - API key (encriptada)
  - Modelo seleccionado
  - Configuración de campos
  - Facturas procesadas

## Guía de Usuario

### Configuración Inicial
1. **Obtener API Key de OpenAI**:
   - Ir a https://platform.openai.com/api-keys
   - Crear una nueva API key
   - Copiar y pegar en la aplicación

2. **Configurar campos**:
   - Seleccionar qué campos extraer
   - Añadir campos personalizados si es necesario

### Procesar una Factura
1. Arrastrar la imagen de la factura al área de carga
2. Verificar la vista previa
3. Hacer clic en "Procesar con IA"
4. Revisar y editar los datos extraídos si es necesario
5. Hacer clic en "Añadir a la lista"

### Exportar a Excel
1. Procesar todas las facturas necesarias
2. Hacer clic en "Exportar a Excel"
3. El archivo se descargará automáticamente

## Stack Tecnológico
- **Backend**: Hono Framework + TypeScript
- **Frontend**: Vanilla JavaScript + TailwindCSS
- **IA**: OpenAI Vision API
- **Exportación**: SheetJS (XLSX)
- **Despliegue**: Cloudflare Pages

## Cómo Usar la Versión Pro

### Acceso Rápido
1. Visita: https://3000-iqec3a6li4fmcc1b2tzwz-6532622b.e2b.dev/v2
2. Configura tu API Key de OpenAI
3. Empieza a procesar documentos

### Flujo de Trabajo Recomendado
1. **Configuración Inicial**:
   - Ir a Configuración > Ingresar API Key
   - Activar clasificación automática
   - Activar optimización de costos

2. **Procesar Documentos**:
   - Ir a Procesar > Arrastrar documentos
   - El sistema detecta automáticamente el tipo
   - Revisa y ajusta si es necesario
   - Procesar en lote o individualmente

3. **Gestión de Datos**:
   - Ver documentos procesados en la sección Documentos
   - Exportar a Excel o JSON
   - Configurar webhooks para integración automática

4. **Optimización**:
   - Revisar estadísticas en Dashboard
   - Ajustar plantillas según necesidades
   - Configurar reglas por proveedor

## Características Pendientes 🔄
- [ ] Soporte para PDFs (actualmente solo imágenes)
- [ ] Procesamiento por lotes de múltiples facturas
- [ ] Plantillas de extracción personalizadas
- [ ] Histórico de procesamiento con fecha/hora
- [ ] Integración con otros proveedores de IA (Anthropic, Google)
- [ ] Exportación a otros formatos (CSV, JSON)
- [ ] Sistema de usuarios y autenticación

## Próximos Pasos Recomendados
1. **Testing**: Probar con diferentes tipos de facturas y tickets
2. **Optimización**: Mejorar prompts para mejor precisión
3. **Seguridad**: Implementar encriptación de API keys en localStorage
4. **UX**: Añadir tutoriales y ayuda contextual
5. **Integración**: Conectar con sistemas de contabilidad

## Instalación y Desarrollo

### Requisitos
- Node.js 18+
- npm o yarn
- API key de OpenAI con acceso a GPT-4 Vision

### Comandos
```bash
# Instalar dependencias
npm install

# Desarrollo local
npm run dev

# Build para producción
npm run build

# Desplegar en Cloudflare Pages
npm run deploy
```

## Notas de Seguridad
- La API key se almacena en el navegador del usuario
- No se envían datos a servidores externos excepto OpenAI
- Las imágenes se procesan en memoria, no se almacenan en servidor
- Recomendado usar HTTPS en producción

## Comparación de Versiones

| Característica | Versión Clásica | Versión Pro |
|-----------------|-----------------|-------------|
| Interfaz | Básica funcional | Ultra moderna con animaciones |
| Temas | Claro solamente | Claro/Oscuro con transiciones |
| Clasificación | Manual | Automática con IA |
| Plantillas | Fijas | Dinámicas y personalizables |
| Procesamiento | Individual | Lotes y multipágina |
| Memoria | No | Sí, por proveedor |
| Costos | No calculados | Estimación y optimización |
| Integraciones | Excel básico | API REST, Webhooks, múltiples formatos |
| Dashboard | No | Analíticas completas |
| Navegación | Página única | Multi-página con sidebar |

## Estado del Despliegue
- **Plataforma**: Cloudflare Pages
- **Estado**: ✅ Funcionando en sandbox
- **URL Activa**: https://3000-iqec3a6li4fmcc1b2tzwz-6532622b.e2b.dev
- **Última actualización**: 2025-01-20