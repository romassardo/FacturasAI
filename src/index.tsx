import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'

type Bindings = {
  OPENAI_API_KEY?: string;
}

const app = new Hono<{ Bindings: Bindings }>()

// Habilitar CORS
app.use('/api/*', cors())

// Servir archivos estáticos
app.use('/static/*', serveStatic({ root: './public' }))

// ========================================
// VERSIÓN PRO - Interfaz Ultra Moderna
// ========================================
app.get('/v2', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>DocuAI Pro - Procesador Inteligente de Documentos</title>
        
        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
        
        <!-- Icons & Libraries -->
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <script src="https://cdn.tailwindcss.com"></script>
        
        <!-- Custom Styles -->
        <link href="/static/styles-v2.css" rel="stylesheet">
    </head>
    <body>
        <div id="app"></div>
        
        <!-- External Libraries -->
        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
        
        <!-- App Script -->
        <script src="/static/app-v2.js"></script>
    </body>
    </html>
  `)
})

// ========================================
// VERSIÓN CLÁSICA - Compatibilidad
// ========================================
app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Procesador de Facturas y Tickets con IA</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <link href="/static/styles.css" rel="stylesheet">
        
        <style>
            /* Estilos para la versión clásica mejorados */
            .hero-gradient {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }
            .glass-card {
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.18);
            }
            .version-badge {
                animation: pulse 2s infinite;
            }
            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.7; }
            }
        </style>
    </head>
    <body class="bg-gray-50">
        <!-- Hero Section -->
        <div class="hero-gradient text-white py-12 px-4">
            <div class="max-w-6xl mx-auto">
                <div class="flex justify-between items-center mb-8">
                    <div>
                        <h1 class="text-4xl font-bold mb-2">
                            <i class="fas fa-file-invoice mr-3"></i>
                            DocuAI
                        </h1>
                        <p class="text-xl opacity-90">Procesador Inteligente de Documentos</p>
                    </div>
                    <div class="text-right">
                        <a href="/v2" class="inline-flex items-center gap-2 bg-white text-purple-700 px-6 py-3 rounded-full font-semibold hover:scale-105 transition-transform">
                            <i class="fas fa-rocket"></i>
                            <span>Probar Versión Pro</span>
                            <span class="version-badge bg-green-500 text-white text-xs px-2 py-1 rounded-full ml-2">NUEVA</span>
                        </a>
                    </div>
                </div>
                
                <div class="grid md:grid-cols-3 gap-6">
                    <div class="glass-card rounded-lg p-4 text-gray-800">
                        <i class="fas fa-magic text-purple-600 text-2xl mb-2"></i>
                        <h3 class="font-semibold mb-1">Extracción con IA</h3>
                        <p class="text-sm">OpenAI Vision para máxima precisión</p>
                    </div>
                    <div class="glass-card rounded-lg p-4 text-gray-800">
                        <i class="fas fa-file-excel text-green-600 text-2xl mb-2"></i>
                        <h3 class="font-semibold mb-1">Exportación Excel</h3>
                        <p class="text-sm">Descarga tus datos procesados</p>
                    </div>
                    <div class="glass-card rounded-lg p-4 text-gray-800">
                        <i class="fas fa-cogs text-blue-600 text-2xl mb-2"></i>
                        <h3 class="font-semibold mb-1">Personalizable</h3>
                        <p class="text-sm">Define los campos a extraer</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Main App Container -->
        <div id="app" class="max-w-6xl mx-auto p-4 -mt-8">
            <!-- La aplicación clásica se carga aquí -->
        </div>
        
        <!-- External Libraries -->
        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js"></script>
        
        <!-- Classic App Script -->
        <script src="/static/app.js"></script>
    </body>
    </html>
  `)
})

// ========================================
// API ENDPOINTS AVANZADOS
// ========================================

// Clasificar documento automáticamente
app.post('/api/classify-document', async (c) => {
  try {
    const { env } = c;
    const { imageBase64 } = await c.req.json();
    const apiKey = env.OPENAI_API_KEY;

    if (!apiKey || !imageBase64) {
      return c.json({ error: 'Datos faltantes' }, 400);
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Clasifica este documento en una de estas categorías:
            - invoice: Factura con IVA, número de factura, emisor
            - receipt: Ticket de compra simple
            - expense: Nota de gastos o reembolso
            
            Responde SOLO con el ID de la categoría.`
          },
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`,
                  detail: 'low'
                }
              }
            ]
          }
        ],
        max_tokens: 10,
        temperature: 0
      })
    });

    const data = await response.json();
    const templateId = data.choices[0].message.content.trim().toLowerCase();

    return c.json({ templateId });
  } catch (error) {
    console.error('Error clasificando:', error);
    return c.json({ templateId: 'invoice' });
  }
})

// Procesar documento con plantilla específica
app.post('/api/process-document', async (c) => {
  try {
    const { env } = c;
    const body = await c.req.json();
    const { imageBase64, fields, apiKey, model = 'gpt-4o-mini' } = body;

    const openaiKey = apiKey || env.OPENAI_API_KEY;
    
    if (!openaiKey || !imageBase64) {
      return c.json({ error: 'Datos requeridos faltantes' }, 400);
    }

    const fieldDescriptions = fields.map((f: any) => 
      `- ${f.key} (${f.label}): ${f.type === 'currency' ? 'formato moneda' : f.type}`
    ).join('\n');

    const systemPrompt = `Eres un experto en extracción de datos de documentos.
    Extrae la siguiente información en formato JSON:
    ${fieldDescriptions}
    
    Reglas:
    - Para campos de tipo currency, usa formato numérico (ej: 123.45)
    - Para campos de tipo date, usa formato YYYY-MM-DD
    - Si no encuentras un campo, usa null
    - Responde SOLO con el JSON, sin explicaciones`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Extrae la información del documento:'
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`,
                  detail: model.includes('mini') ? 'low' : 'high'
                }
              }
            ]
          }
        ],
        max_tokens: 1000,
        temperature: 0.1
      })
    });

    if (!response.ok) {
      const error = await response.text();
      return c.json({ error: `Error de OpenAI: ${error}` }, 500);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    let extractedData;
    try {
      const cleanContent = content.replace(/```json\n?|```/g, '').trim();
      extractedData = JSON.parse(cleanContent);
    } catch (e) {
      extractedData = { raw: content };
    }

    const cost = model.includes('mini') ? 0.002 : 0.01;

    return c.json({
      success: true,
      data: extractedData,
      model: model,
      cost: cost
    });

  } catch (error: any) {
    console.error('Error procesando documento:', error);
    return c.json({ 
      error: 'Error procesando el documento', 
      details: error.message 
    }, 500);
  }
})

// Procesar factura (compatibilidad con versión clásica)
app.post('/api/process-invoice', async (c) => {
  try {
    const { env } = c;
    const body = await c.req.json();
    const { imageBase64, fields, apiKey, model = 'gpt-4o-mini' } = body;

    const openaiKey = apiKey || env.OPENAI_API_KEY;
    
    if (!openaiKey) {
      return c.json({ error: 'API key de OpenAI no proporcionada' }, 400);
    }

    if (!imageBase64) {
      return c.json({ error: 'No se proporcionó imagen' }, 400);
    }

    const systemPrompt = `Eres un asistente experto en extraer información de facturas y tickets. 
    Analiza la imagen y extrae los siguientes campos en formato JSON:
    ${fields.map((f: any) => `- ${f.name}: ${f.description || f.name}`).join('\n')}
    
    Responde SOLO con el JSON, sin explicaciones adicionales.
    Si no encuentras un campo, usa null como valor.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Extrae la información de esta factura/ticket:'
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`,
                  detail: 'high'
                }
              }
            ]
          }
        ],
        max_tokens: 1000,
        temperature: 0.1
      })
    });

    if (!response.ok) {
      const error = await response.text();
      return c.json({ error: `Error de OpenAI: ${error}` }, 500);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    let extractedData;
    try {
      const cleanContent = content.replace(/```json\n?|```/g, '').trim();
      extractedData = JSON.parse(cleanContent);
    } catch (e) {
      extractedData = { raw: content };
    }

    return c.json({
      success: true,
      data: extractedData,
      model: model
    });

  } catch (error: any) {
    console.error('Error procesando factura:', error);
    return c.json({ 
      error: 'Error procesando la imagen', 
      details: error.message 
    }, 500);
  }
})

// Estimación de costos
app.post('/api/estimate-cost', async (c) => {
  try {
    const { fileSize, pageCount, model } = await c.req.json();
    
    let costPerPage = 0.002; // GPT-4 mini por defecto
    
    if (model === 'gpt-4o') {
      costPerPage = 0.01;
    } else if (model === 'gpt-4-turbo') {
      costPerPage = 0.006;
    }
    
    const estimatedCost = (pageCount || 1) * costPerPage;
    const processingTime = (pageCount || 1) * 3; // 3 segundos por página estimado
    
    return c.json({
      estimatedCost,
      processingTime,
      recommendedModel: fileSize < 1024 * 1024 ? 'gpt-4o-mini' : model,
      costBreakdown: {
        perPage: costPerPage,
        pages: pageCount || 1
      }
    });
  } catch (error) {
    return c.json({ error: 'Error estimando costos' }, 500);
  }
})

// Validar API key
app.post('/api/validate-key', async (c) => {
  try {
    const { apiKey } = await c.req.json();
    
    if (!apiKey) {
      return c.json({ valid: false, error: 'No se proporcionó API key' });
    }

    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });

    if (response.ok) {
      return c.json({ valid: true });
    } else {
      return c.json({ valid: false, error: 'API key inválida' });
    }
  } catch (error: any) {
    return c.json({ valid: false, error: error.message });
  }
})

// Obtener modelos disponibles
app.get('/api/models', (c) => {
  const models = [
    { id: 'gpt-4o', name: 'GPT-4 Vision (Más preciso)', provider: 'OpenAI' },
    { id: 'gpt-4o-mini', name: 'GPT-4 Vision Mini (Más rápido)', provider: 'OpenAI' },
    { id: 'gpt-4-turbo', name: 'GPT-4 Turbo Vision', provider: 'OpenAI' }
  ];
  
  return c.json(models);
})

// Obtener documentos procesados
app.get('/api/documents', (c) => {
  // En producción esto vendría de una base de datos
  return c.json([]);
})

// Webhook para integraciones
app.post('/api/webhook', async (c) => {
  try {
    const body = await c.req.json();
    const { url, data } = body;

    if (!url) {
      return c.json({ error: 'URL de webhook requerida' }, 400);
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    return c.json({ 
      success: response.ok,
      status: response.status 
    });
  } catch (error: any) {
    return c.json({ 
      error: 'Error enviando webhook',
      details: error.message 
    }, 500);
  }
})

export default app