# 📄 DocuAI Pro - Procesador Inteligente de Documentos

## 🚀 Descripción General
**DocuAI Pro** es una aplicación web moderna para procesar facturas, tickets y documentos usando la API de OpenAI. Extrae información estructurada de imágenes de documentos con alta precisión usando los últimos modelos de OpenAI con capacidades de visión integradas.

## 🌐 URLs de Acceso
- **Producción**: https://3000-iqec3a6li4fmcc1b2tzwz-6532622b.e2b.dev/v2
- **Versión Clásica**: https://3000-iqec3a6li4fmcc1b2tzwz-6532622b.e2b.dev/
- **GitHub**: [Pendiente de configuración]

## ✨ Características Actuales

### ✅ Funcionalidades Implementadas
- **Soporte PDF Nativo**: Convierte automáticamente PDFs a imágenes para procesamiento
- **Procesamiento con IA**: Extracción automática de datos usando modelos GPT de OpenAI con visión
- **Múltiples Modelos**: Modelos GPT-4o y O-series disponibles 
- **Clasificación Automática**: Detecta automáticamente si es factura o ticket
- **Memoria de Vendedores**: Aprende de correcciones anteriores
- **Procesamiento en Cola**: Múltiples documentos simultáneos
- **Exportación Excel**: Descarga todos los datos procesados en formato XLSX
- **Persistencia Total**: Los documentos se mantienen entre sesiones
- **Modo Oscuro/Claro**: Cambio de tema integrado
- **API REST**: Endpoints disponibles para integración externa
- **Validación de API Key**: Verificación en tiempo real con OpenAI

### 🤖 Modelos Disponibles (Septiembre 2025)

| Modelo | Descripción | Precio Input | Precio Output | Uso Recomendado |
|--------|-------------|--------------|---------------|-----------------|
| **GPT-4o Mini** 🌟 | Más popular y económico | $0.15/1M | $0.60/1M | ✅ Ideal para facturas y tickets estándar, mejor relación costo-beneficio |
| **GPT-4o** 🚀 | Balanceado | $2.50/1M | $10.00/1M | Uso general, documentos complejos |
| **O3 Mini** 🧠 | Con razonamiento | $1.10/1M | $4.40/1M | Documentos que requieren análisis y razonamiento |
| **O1 Mini** 💡 | Razonamiento básico | $1.10/1M | $4.40/1M | Balance entre costo y capacidad de razonamiento |
| **GPT-4o Agosto 2024** 🔄 | Versión específica | $2.50/1M | $10.00/1M | Compatibilidad con versiones anteriores |

**Nota Importante**: 
- Todos los modelos GPT-4o y O-series incluyen **capacidades de visión nativas** para procesar imágenes
- No existe un modelo "Vision" separado - la capacidad de procesamiento de imágenes está integrada
- Los precios están en USD por millón de tokens (1M tokens ≈ 750,000 palabras)
- Un documento típico usa entre 500-2000 tokens dependiendo de la complejidad

### 📊 Arquitectura de Datos

#### **Modelos de Datos**
```javascript
// Documento Procesado
{
  id: string,
  timestamp: ISO8601,
  filename: string,
  template: 'invoice' | 'receipt' | 'custom',
  data: {
    // Campos extraídos dinámicamente
    invoice_number: string,
    date: string,
    vendor: string,
    total: number,
    tax: number,
    subtotal: number,
    // ... más campos según plantilla
  },
  cost: number,
  model: string
}

// Plantilla de Documento
{
  id: string,
  name: string,
  icon: string,
  fields: Array<{
    key: string,
    label: string,
    type: 'text' | 'date' | 'currency',
    required: boolean
  }>,
  keywords: string[],
  color: string
}
```

#### **Almacenamiento**
- **LocalStorage**: Configuración, documentos procesados, cola, plantillas
- **Base64 Encoding**: Imágenes convertidas para persistencia
- **Sincronización**: Automática cada 5 segundos para mantener consistencia

### 🔌 API Endpoints

| Endpoint | Método | Descripción | Parámetros |
|----------|--------|-------------|------------|
| `/api/process-document` | POST | Procesa un documento | `imageBase64`, `fields`, `apiKey`, `model` |
| `/api/classify-document` | POST | Clasifica tipo de documento | `imageBase64`, `apiKey` |
| `/api/validate-key` | POST | Valida API key de OpenAI | `apiKey` |
| `/api/estimate-cost` | POST | Estima costo de procesamiento | `fileSize`, `model` |

### 💰 Estimación de Costos por Documento

| Modelo | Costo Aproximado | Ejemplo (100 docs/mes) |
|--------|------------------|-------------------------|
| GPT-4o Mini | ~$0.001 | $0.10 |
| GPT-4o | ~$0.012 | $1.20 |
| O3/O1 Mini | ~$0.005 | $0.50 |

### 🛠️ Stack Tecnológico
- **Backend**: Hono Framework + Cloudflare Workers
- **Frontend**: JavaScript vanilla + TailwindCSS
- **Procesamiento PDF**: PDF.js para conversión a imágenes
- **IA**: OpenAI GPT Models (GPT-4o, O-series)
- **Deployment**: Cloudflare Pages
- **Gestión de Procesos**: PM2

## 📋 Guía de Usuario

### Configuración Inicial
1. **Obtener API Key**: 
   - Ve a https://platform.openai.com/api-keys
   - Crea una nueva API key
   - Asegúrate de tener créditos en tu cuenta

2. **Configurar en la App**: 
   - Ve a Configuración ⚙️
   - Pega tu API Key (debe empezar con `sk-`)
   - Selecciona el modelo preferido (recomendado: GPT-4o Mini)
   - Guarda y valida

3. **Verificar Configuración**:
   - Usa el botón "Depurar" para verificar que la API Key está guardada
   - Haz clic en "Validar" para confirmar conexión con OpenAI

### Procesar Documentos
1. Ve a la sección "Procesar"
2. Arrastra o selecciona documentos:
   - **Imágenes**: JPG, PNG, GIF, WEBP
   - **PDFs**: Se convierten automáticamente a imágenes
3. Espera la conversión si es PDF (2-3 segundos)
4. Selecciona campos a extraer o usa clasificación automática
5. Revisa y corrige resultados si es necesario
6. Exporta a Excel cuando termines

### Optimización de Costos
- **Alto volumen**: Usa GPT-4o Mini (mejor relación costo-beneficio)
- **Documentos complejos**: Usa GPT-4o o modelos O-series
- **Procesamiento masivo**: Activa "Control de Costos" en configuración
- **Tip**: GPT-4o Mini es suficiente para el 90% de documentos estándar

## 🚧 Funcionalidades en Desarrollo
- [ ] Soporte para más formatos de documento (Word, PowerPoint)
- [ ] Procesamiento batch con programación
- [ ] Integración con Google Drive y Dropbox
- [ ] API webhooks para notificaciones en tiempo real
- [ ] Dashboard analytics con gráficos interactivos
- [ ] Exportación a múltiples formatos (CSV, JSON, XML)

## 🔧 Desarrollo Local

### Requisitos
- Node.js 18+
- npm o yarn
- Cuenta de OpenAI con créditos

### Instalación
```bash
# Clonar repositorio (cuando esté en GitHub)
git clone [url-del-repo]
cd webapp

# Instalar dependencias
npm install

# Configurar variables de entorno
echo "OPENAI_API_KEY=tu-api-key" > .env

# Desarrollo local
npm run dev

# Build para producción
npm run build

# Deploy a Cloudflare
npm run deploy
```

### Scripts Disponibles
```json
{
  "dev": "Desarrollo local con Vite",
  "build": "Construcción para producción",
  "preview": "Vista previa local",
  "deploy": "Deploy a Cloudflare Pages",
  "clean-port": "Limpia puerto 3000",
  "test": "Prueba de conectividad"
}
```

## 📈 Métricas y Estadísticas
- **Documentos Procesados**: Contador total y por día
- **Precisión Promedio**: ~95% en documentos claros
- **Tiempo de Procesamiento**: 2-5 segundos por documento
- **Costo Promedio**: $0.001 - $0.012 por documento según modelo

## 🔐 Seguridad
- API Keys almacenadas localmente en el navegador
- No se envían datos a servidores externos (excepto OpenAI)
- Procesamiento directo cliente-OpenAI
- Sin almacenamiento permanente en servidor

## 🤝 Soporte y Contribución
- **Reportar Issues**: [Pendiente GitHub]
- **Documentación API**: Disponible en `/api/docs`
- **Contacto**: [Configurar email de soporte]

## 📜 Licencia
Proyecto privado - Todos los derechos reservados

---

**Última Actualización**: Septiembre 2025  
**Versión**: 2.3.0  
**Estado**: ✅ Producción Activa  
**Modelos**: Actualizados con los últimos modelos de OpenAI (GPT-4o, O-series)