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

// Ruta principal - HTML de la aplicación
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
    </head>
    <body class="bg-gray-50 min-h-screen">
        <div id="app" class="container mx-auto p-4">
            <!-- La aplicación se cargará aquí -->
        </div>
        
        <!-- Bibliotecas externas -->
        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js"></script>
        
        <!-- Script de la aplicación -->
        <script src="/static/app.js"></script>
    </body>
    </html>
  `)
})

// API endpoint para procesar imágenes con OpenAI Vision
app.post('/api/process-invoice', async (c) => {
  try {
    const { env } = c;
    const body = await c.req.json();
    const { imageBase64, fields, apiKey, model = 'gpt-4o-mini' } = body;

    // Usar API key proporcionada o la del entorno
    const openaiKey = apiKey || env.OPENAI_API_KEY;
    
    if (!openaiKey) {
      return c.json({ error: 'API key de OpenAI no proporcionada' }, 400);
    }

    if (!imageBase64) {
      return c.json({ error: 'No se proporcionó imagen' }, 400);
    }

    // Construir el prompt para OpenAI
    const systemPrompt = `Eres un asistente experto en extraer información de facturas y tickets. 
    Analiza la imagen y extrae los siguientes campos en formato JSON:
    ${fields.map((f: any) => `- ${f.name}: ${f.description || f.name}`).join('\n')}
    
    Responde SOLO con el JSON, sin explicaciones adicionales.
    Si no encuentras un campo, usa null como valor.`;

    // Llamar a OpenAI Vision API
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
    
    // Intentar parsear el JSON de la respuesta
    let extractedData;
    try {
      // Limpiar el contenido por si tiene marcadores de código
      const cleanContent = content.replace(/```json\n?|```/g, '').trim();
      extractedData = JSON.parse(cleanContent);
    } catch (e) {
      // Si no se puede parsear, devolver el contenido tal cual
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

// API endpoint para obtener modelos disponibles
app.get('/api/models', (c) => {
  const models = [
    { id: 'gpt-4o', name: 'GPT-4 Vision (Más preciso)', provider: 'OpenAI' },
    { id: 'gpt-4o-mini', name: 'GPT-4 Vision Mini (Más rápido)', provider: 'OpenAI' },
    { id: 'gpt-4-turbo', name: 'GPT-4 Turbo Vision', provider: 'OpenAI' }
  ];
  
  return c.json(models);
})

// API endpoint para validar API key
app.post('/api/validate-key', async (c) => {
  try {
    const { apiKey } = await c.req.json();
    
    if (!apiKey) {
      return c.json({ valid: false, error: 'No se proporcionó API key' });
    }

    // Hacer una llamada simple a OpenAI para validar la key
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

export default app
