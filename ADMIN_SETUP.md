# 🔧 Configuración del Sistema de Administración de Códigos de Error

## Resumen

Se ha implementado un sistema completo de administración para códigos de error que permite a usuarios administradores agregar nuevos fabricantes, líneas de productos y códigos de error a través de una interfaz intuitiva. Los datos se almacenan en Firebase Firestore.

## 🚀 Características Implementadas

### ✅ Sistema de Roles de Administrador
- **Verificación de email**: Solo usuarios con emails específicos pueden agregar códigos
- **Badge visual**: Los administradores ven un distintivo "Admin" en la interfaz
- **Acceso controlado**: Botones "Agregar Código" e "Invitar Admin" solo visibles para administradores
- **Sistema de invitaciones**: Los administradores pueden invitar a otros usuarios como administradores
- **Gestión dual**: Administradores hardcoded + administradores invitados en Firebase

### ✅ Modal de Administración Avanzado
- **Proceso de 4 pasos**:
  1. Selección/creación de fabricante
  2. Selección/creación de línea de producto
  3. Selección/creación de sub-línea (si aplica)
  4. Ingreso de detalles del código de error

- **Funcionalidades**:
  - Creación dinámica de fabricantes, líneas y sub-líneas
  - Campos múltiples para causas y soluciones
  - Niveles de severidad (Alta, Media, Baja)
  - Validación de campos obligatorios

### ✅ Integración con Firebase
- **Base de datos en tiempo real**: Todos los datos se almacenan en Firestore
- **Estructura jerárquica**: Fabricantes > Líneas > Sub-líneas > Códigos de Error
- **Carga automática**: Los datos se cargan automáticamente al iniciar la app
- **Actualizaciones en vivo**: Los cambios se reflejan inmediatamente

## 🔐 Configuración de Administradores

### Paso 1: Configurar Emails de Administrador

Los emails de administrador están definidos en `/src/utils/adminUtils.js`:

```javascript
export const ADMIN_EMAILS = [
  'valenarbert@gmail.com', // Main admin account
  'admin@calculadoraelectrica.com',
  'valentin@admin.com',
  'admin@example.com',
  // Agregar más emails aquí según sea necesario
];
```

**Para agregar nuevos administradores**:

#### Opción A: Hardcoded (permanente)
1. Edita el archivo `src/utils/adminUtils.js`
2. Agrega el email del nuevo administrador al array `ADMIN_EMAILS`
3. Guarda el archivo y reinicia la aplicación

#### Opción B: Sistema de Invitaciones (recomendado)
1. Inicia sesión como administrador existente
2. Ve a la sección "Códigos de Error"
3. Haz clic en el botón "Invitar Admin" (amarillo)
4. Ingresa el email del nuevo administrador
5. Opcionalmente agrega un mensaje de bienvenida
6. Haz clic en "Enviar Invitación"

> **Nota**: Los administradores invitados se almacenan en Firebase y pueden ser gestionados dinámicamente.

### Paso 2: Configurar Reglas de Firestore

Las reglas de seguridad están en el archivo `firestore-rules.js`. **Debes aplicar estas reglas en Firebase Console**:

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto
3. Ve a **Firestore Database** > **Rules**
4. Copia y pega las reglas del archivo `firestore-rules.js`
5. Haz clic en **Publish**

### Paso 3: Inicializar Datos de Ejemplo (Opcional)

Si la base de datos está vacía, puedes usar el script de inicialización:

1. Abre el archivo `src/scripts/initializeErrorCodes.js`
2. Descomenta la última línea: `initializeErrorCodes()`
3. Ejecuta el script una sola vez
4. Vuelve a comentar la línea para evitar duplicados

## 🎯 Cómo Usar el Sistema de Administración

### Para Usuarios Administrador:

1. **Inicia sesión** con un email que esté en la lista de administradores
2. Ve a la sección **"Códigos de Error"**
3. Verás un badge **"Admin"** junto al título
4. Haz clic en el botón **"Agregar Código"**
5. Sigue el proceso de 4 pasos:

#### Paso 1: Fabricante
- Selecciona un fabricante existente, o
- Marca "Agregar nuevo fabricante" e ingresa el nombre

#### Paso 2: Línea de Producto
- Selecciona una línea existente, o
- Marca "Agregar nueva línea" e ingresa el nombre

#### Paso 3: Sub-línea (si aplica)
- Si la línea requiere sub-líneas, selecciona una existente, o
- Marca "Agregar nueva sub-línea" e ingresa el nombre

#### Paso 4: Detalles del Código
- **Código de Error**: Ej: F0001, 2210, OCF
- **Título**: Descripción corta del error
- **Descripción**: Explicación detallada
- **Causas**: Lista de posibles causas (mínimo 1)
- **Soluciones**: Lista de soluciones recomendadas (mínimo 1)
- **Severidad**: Alta, Media o Baja

6. Haz clic en **"Guardar Código"**

### Para Invitar Nuevos Administradores:

1. **Inicia sesión** como administrador
2. Ve a la sección **"Códigos de Error"**  
3. Haz clic en **"Invitar Admin"** (botón amarillo)
4. En el modal que aparece:
   - **Email**: Ingresa el email del nuevo administrador
   - **Mensaje**: Opcionalmente agrega un mensaje personalizado
5. Haz clic en **"Enviar Invitación"**
6. El usuario será agregado inmediatamente como administrador

### Para Usuarios Regulares:
- Pueden ver y buscar todos los códigos de error
- No ven los botones "Agregar Código" ni "Invitar Admin"
- No pueden modificar la base de datos

## 🗄️ Estructura de la Base de Datos

```
Firestore:
├── manufacturers/
│   └── {manufacturerId}/
│       ├── name: string
│       ├── createdAt: timestamp
│       ├── updatedAt: timestamp
│       └── lines/
│           └── {lineId}/
│               ├── name: string
│               ├── hasSubLines: boolean
│               ├── createdAt: timestamp
│               ├── updatedAt: timestamp
│               ├── errorCodes/ (si hasSubLines = false)
│               │   └── {errorCodeId}/
│               │       ├── code: string
│               │       ├── title: string
│               │       ├── description: string
│               │       ├── causes: array
│               │       ├── solutions: array
│               │       └── severity: string
│               └── subLines/ (si hasSubLines = true)
│                   └── {subLineId}/
│                       ├── name: string
│                       ├── createdAt: timestamp
│                       ├── updatedAt: timestamp
│                       └── errorCodes/
│                           └── {errorCodeId}/
│                               ├── code: string
│                               ├── title: string
│                               ├── description: string
│                               ├── causes: array
│                               ├── solutions: array
│                               └── severity: string
├── productCodes/
│   └── {productCode}/
│       ├── manufacturer: string
│       ├── line: string
│       ├── subLine: string (opcional)
│       └── createdAt: timestamp
├── admins/
│   └── {adminId}/
│       ├── email: string
│       ├── originalEmail: string
│       ├── addedBy: string
│       ├── addedAt: timestamp
│       ├── isActive: boolean
│       └── permissions: object
└── adminInvitations/
    └── {invitationId}/
        ├── email: string
        ├── originalEmail: string
        ├── invitedBy: string
        ├── invitedAt: timestamp
        ├── message: string
        ├── status: string
        └── expiresAt: timestamp
```

## 🔧 Archivos Modificados/Creados

### Nuevos Archivos:
- `src/utils/adminUtils.js` - Sistema de roles de administrador
- `src/components/error-codes/AdminAddErrorModal.jsx` - Modal de administración de códigos
- `src/components/error-codes/InviteAdminModal.jsx` - Modal para invitar administradores
- `src/services/firebase/errorCodes.js` - Servicio de Firebase para códigos de error
- `src/services/firebase/admins.js` - Servicio de Firebase para gestión de administradores
- `src/scripts/initializeErrorCodes.js` - Script de inicialización
- `firestore-rules.js` - Reglas de seguridad de Firestore
- `ADMIN_SETUP.md` - Este archivo de documentación

### Archivos Modificados:
- `src/components/error-codes/ErrorCodesApp.jsx` - Integración con Firebase y funcionalidad de admin

## 🛡️ Seguridad

- **Autenticación requerida**: Solo usuarios autenticados pueden leer datos
- **Autorización por email**: Solo administradores pueden escribir datos
- **Validación client-side**: Campos obligatorios y validaciones en el frontend
- **Reglas server-side**: Firestore valida permisos en el servidor

## 🚨 Resolución de Problemas

### "Error cargando la base de datos"
- Verifica que las reglas de Firestore estén configuradas correctamente
- Asegúrate de que el usuario esté autenticado
- Revisa la consola del navegador para errores específicos

### "No aparece el botón Agregar Código"
- Verifica que el email del usuario esté en `ADMIN_EMAILS`
- Asegúrate de que el usuario esté correctamente autenticado
- Refresca la página después de hacer cambios en `adminUtils.js`

### "Error al guardar código de error"
- Verifica permisos de Firestore
- Revisa que todos los campos obligatorios estén completos
- Checa la consola del navegador para detalles del error

## 📧 Soporte

Para agregar nuevos administradores o resolver problemas:
1. Edita `src/utils/adminUtils.js` para agregar emails
2. Actualiza las reglas de Firestore si es necesario
3. Reinicia el servidor de desarrollo si haces cambios en archivos de configuración

---

*Sistema implementado con React, Firebase Firestore, y autenticación basada en email.*