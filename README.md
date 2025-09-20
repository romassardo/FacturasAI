# Procesador de Facturas y Tickets con IA

## Descripción del Proyecto
- **Nombre**: Invoice Processor
- **Objetivo**: Automatizar la extracción de información de facturas y tickets usando Vision AI
- **Características principales**:
  - Procesamiento de imágenes con OpenAI Vision API
  - Selección de modelos de IA (GPT-4, GPT-4 mini, etc.)
  - Configuración personalizable de campos a extraer
  - Exportación de datos a Excel
  - Almacenamiento local de facturas procesadas

## URLs
- **Desarrollo local**: http://localhost:3000
- **Producción**: (Pendiente de despliegue en Cloudflare Pages)
- **GitHub**: (Pendiente de configuración)

## Funcionalidades Completadas ✅
1. **Configuración de API Key**: Validación y almacenamiento seguro de API key de OpenAI
2. **Selección de modelo**: Elegir entre diferentes modelos de OpenAI Vision
3. **Configuración de campos**: Personalizar qué campos extraer de las facturas
4. **Carga de imágenes**: Arrastrar y soltar o selección de archivos
5. **Procesamiento con IA**: Envío a OpenAI Vision API para extracción de datos
6. **Edición de resultados**: Posibilidad de editar datos extraídos antes de guardar
7. **Lista de facturas**: Almacenamiento local de facturas procesadas
8. **Exportación a Excel**: Generación de archivo Excel con todos los datos

## Endpoints de API

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

## Estado del Despliegue
- **Plataforma**: Cloudflare Pages
- **Estado**: ⏳ Pendiente de despliegue
- **Última actualización**: 2025-01-20