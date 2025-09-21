# 🔧 Guía de Solución de Problemas - DocuAI Pro

## ❌ Error: "You uploaded an unsupported image"

### Causa
Este error ocurre cuando OpenAI no puede procesar la imagen enviada. Las causas comunes son:
1. Formato de imagen no soportado
2. Imagen corrupta o mal codificada
3. Imagen demasiado grande
4. API Key inválida o sin permisos

### Soluciones Implementadas (Septiembre 2025)

✅ **Mejoras en el manejo de imágenes**:
- Detección automática del tipo MIME
- Soporte para data URLs completos
- Validación de base64 antes de enviar

✅ **Mejor manejo de errores**:
- Mensajes de error más descriptivos
- Logging detallado en consola
- Validación de tamaño de imagen

### Pasos para Resolver

#### 1. **Verificar el Formato de Imagen**
- ✅ Formatos soportados: **JPG, PNG, GIF, WEBP**
- ❌ No soportados: BMP, TIFF, SVG, PDF
- Tamaño máximo recomendado: **20MB**

#### 2. **Verificar tu API Key**
```javascript
// En Configuración, usa el botón "Depurar" para verificar:
- La API Key está guardada correctamente
- Empieza con 'sk-'
- Tiene al menos 20 caracteres
```

#### 3. **Probar con una Imagen Simple**
1. Descarga esta imagen de prueba: https://via.placeholder.com/300x200.png
2. Súbela a la aplicación
3. Si funciona, el problema es con tu imagen original

#### 4. **Verificar la Consola del Navegador**
Presiona F12 y revisa:
- La pestaña "Console" para ver errores
- La pestaña "Network" para ver la respuesta de OpenAI

### Errores Comunes y Soluciones

| Error | Causa | Solución |
|-------|-------|----------|
| "Unsupported image" | Formato no válido | Convierte a JPG o PNG |
| "Invalid API key" | API Key incorrecta | Verifica en Configuración |
| "Rate limit exceeded" | Demasiadas solicitudes | Espera 60 segundos |
| "Image too large" | Imagen > 20MB | Reduce el tamaño de la imagen |

### Código de Depuración

Si el problema persiste, ejecuta esto en la consola del navegador (F12):

```javascript
// Verificar API Key
console.log('API Key guardada:', localStorage.getItem('openai_api_key'));

// Verificar cola de procesamiento
console.log('Cola:', JSON.parse(localStorage.getItem('processing_queue') || '[]'));

// Limpiar cola con errores
localStorage.setItem('processing_queue', '[]');
location.reload();
```

### Configuración Recomendada

Para mejores resultados:
1. **Modelo**: GPT-4o Mini (más estable y económico)
2. **Formato**: JPG o PNG
3. **Resolución**: Máximo 2048x2048
4. **Tamaño**: Menos de 5MB

### Test Rápido de API

Prueba tu API Key directamente:

```bash
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer TU_API_KEY_AQUI"
```

Si devuelve una lista de modelos, tu API Key funciona.

### Si Nada Funciona

1. **Resetea todo**:
   - Ve a Configuración
   - Click en "Resetear Todo"
   - Reconfigura tu API Key
   - Prueba con una imagen simple

2. **Verifica tu cuenta OpenAI**:
   - Tienes créditos disponibles
   - Tu API Key tiene permisos para GPT-4o
   - No has excedido límites de uso

3. **Contacta soporte**:
   - Proporciona el error exacto de la consola
   - Incluye una captura de pantalla
   - Menciona el modelo que estás usando

---

**Última actualización**: Septiembre 2025
**Versión**: 2.2.1