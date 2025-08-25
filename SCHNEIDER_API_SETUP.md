# Configuración API de Schneider Electric

Este documento detalla cómo registrarse y configurar el acceso a la API de Schneider Electric para obtener códigos de productos de interruptores termomagnéticos.

## Registro en Schneider Electric Developer Portal

### Paso 1: Crear cuenta de desarrollador

1. **Acceder al Portal de Desarrolladores**
   - Visitar: https://developer.se.com/
   - Hacer clic en "Sign Up" o "Register"

2. **Completar formulario de registro**
   - Nombre completo
   - Email corporativo (preferible)
   - Empresa/Organización
   - País de residencia
   - Propósito del uso de la API

3. **Verificación de cuenta**
   - Revisar email de confirmación
   - Hacer clic en el enlace de verificación
   - Completar perfil de desarrollador

### Paso 2: Solicitar acceso a Product Catalog API

1. **Navegar a APIs disponibles**
   - En el dashboard, ir a "APIs & SDKs"
   - Buscar "Product Catalog API" o "Electrical Products API"

2. **Solicitar acceso**
   - Hacer clic en "Request Access"
   - Completar formulario de solicitud:
     - Tipo de aplicación: Web Application
     - Casos de uso: Calculadora eléctrica profesional
     - Volumen estimado de requests: < 1000/día
     - Descripción del proyecto: Herramienta de cálculos eléctricos

3. **Documentación técnica**
   - Descargar documentación de la API
   - Revisar endpoints disponibles
   - Estudiar esquemas de datos de productos

### Paso 3: Obtener credenciales API

1. **API Keys**
   - Una vez aprobado, obtener:
     - Client ID
     - Client Secret
     - API Key (si es requerida)

2. **Configurar autenticación**
   - Tipo de autenticación: OAuth 2.0
   - Grant type: Client Credentials
   - Scope: product-catalog-read

3. **URLs de endpoints**
   - Base URL: `https://api.se.com/v1/`
   - Token endpoint: `https://api.se.com/oauth/token`
   - Products endpoint: `https://api.se.com/v1/products`

## Configuración en el proyecto

### Variables de entorno requeridas

Crear archivo `.env` en la raíz del proyecto:

```env
SCHNEIDER_CLIENT_ID=your_client_id_here
SCHNEIDER_CLIENT_SECRET=your_client_secret_here
SCHNEIDER_API_KEY=your_api_key_here
SCHNEIDER_BASE_URL=https://api.se.com/v1
```

### Estructura de datos esperada

La API de Schneider devuelve productos con la siguiente estructura:

```json
{
  "products": [
    {
      "code": "A9F79263",
      "name": "C60H-C63-3P",
      "category": "Circuit Breakers",
      "specifications": {
        "current_rating": "63A",
        "curve": "C",
        "poles": 3,
        "breaking_capacity": "10kA",
        "voltage": "400V"
      }
    }
  ]
}
```

## Endpoints relevantes para termomagnéticas

### 1. Búsqueda por especificaciones

```
GET /products/circuit-breakers
Parameters:
- current_rating: 63 (Amperes)
- curve: C
- poles: 3
- voltage: 400
- breaking_capacity: 10
```

### 2. Filtros disponibles

- **current_rating**: 6, 10, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125
- **curve**: B, C, D, K, Z
- **poles**: 1, 2, 3, 4
- **breaking_capacity**: 6, 10, 15, 25 (kA)
- **voltage**: 230, 400 (V)

## Implementación

### Servicio de API (JavaScript)

```javascript
class SchneiderAPI {
  constructor(clientId, clientSecret, baseUrl) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.baseUrl = baseUrl;
    this.accessToken = null;
  }

  async authenticate() {
    const response = await fetch(`${this.baseUrl}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `grant_type=client_credentials&client_id=${this.clientId}&client_secret=${this.clientSecret}`
    });
    
    const data = await response.json();
    this.accessToken = data.access_token;
  }

  async getCircuitBreaker(specs) {
    const params = new URLSearchParams(specs);
    const response = await fetch(`${this.baseUrl}/products/circuit-breakers?${params}`, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    return await response.json();
  }
}
```

## Limitaciones y consideraciones

### Rate Limits
- **Desarrollo**: 100 requests/hora
- **Producción**: 1000 requests/hora
- **Implementar caching** para reducir llamadas

### Disponibilidad de productos
- Solo productos disponibles en el mercado local
- Catálogo puede variar por región
- Verificar disponibilidad de stock

### Manejo de errores
- 401: Token expirado - renovar autenticación
- 403: Sin permisos - verificar scopes
- 429: Rate limit excedido - implementar backoff
- 404: Producto no encontrado - mostrar alternativas

## Testing

### Datos de prueba
```javascript
const testSpecs = {
  current_rating: 25,
  curve: 'C',
  poles: 3,
  breaking_capacity: 6,
  voltage: 400
};
```

### Respuesta esperada
```json
{
  "products": [
    {
      "code": "A9F79325",
      "name": "C60H-C25-3P",
      "availability": "in_stock",
      "price": "45.60 EUR"
    }
  ]
}
```

## Soporte

- **Documentación**: https://developer.se.com/docs
- **Soporte técnico**: api-support@se.com
- **Foro de desarrolladores**: https://community.se.com/developers
- **Status de la API**: https://status.se.com

## Notas importantes

⚠️ **Importante**: La API de Schneider requiere aprobación manual que puede tomar 3-5 días hábiles.

💡 **Tip**: Mientras se aprueba el acceso, implementar un mock service con datos reales de catálogos Schneider.

🔐 **Seguridad**: Nunca commit las credenciales API. Usar variables de entorno y .gitignore.