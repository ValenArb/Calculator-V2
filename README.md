# Calculadora Eléctrica

Una aplicación web completa para cálculos eléctricos profesionales, desarrollada con React, Firebase y Python.

## 🚀 Características Principales

### ✨ Funcionalidades

- **Gestión de Proyectos**: Crear, editar y organizar proyectos de cálculos eléctricos
- **Cálculos Especializados**:
  - DPMS (Determinación de la Potencia Máxima Simultánea)
  - Cargas por Tablero
  - Cálculo Térmico de Conductores
  - Verificación de Caída de Tensión
  - Cálculo de Cortocircuito
  - Centro de Potencia

- **Colaboración en Tiempo Real**: 
  - Múltiples usuarios trabajando simultáneamente
  - Sincronización automática de cambios
  - Gestión de permisos y colaboradores

- **Exportación Profesional**:
  - Exportar a Excel (.xlsx) con múltiples hojas
  - Generar reportes PDF profesionales
  - Incluir/excluir módulos específicos

- **Autenticación Segura**:
  - Login con email/contraseña
  - Integración con Google Sign-In
  - Gestión de sesiones segura

### 🛠️ Tecnologías Utilizadas

#### Frontend
- **React 18** - Framework principal
- **Redux Toolkit** - Gestión de estado
- **React Router** - Navegación
- **Tailwind CSS** - Estilos
- **Vite** - Build tool
- **TypeScript** - Tipado estático

#### Backend
- **Python FastAPI** - API de cálculos
- **NumPy** - Cálculos matemáticos
- **Pandas** - Manipulación de datos

#### Base de Datos y Autenticación
- **Firebase Auth** - Autenticación
- **Firestore** - Base de datos NoSQL
- **Hosting** - Firebase/Vercel

#### Librerías Adicionales
- **jsPDF** - Generación de PDFs
- **XLSX** - Exportación Excel
- **React Hook Form** - Formularios
- **React Hot Toast** - Notificaciones
- **Lucide React** - Iconos

## 📁 Estructura del Proyecto

```
calculadora-electrica/
├── src/
│   ├── components/          # Componentes reutilizables
│   │   ├── ui/             # Componentes base (Button, Input, etc.)
│   │   ├── layout/         # Layout components (Header, Sidebar)
│   │   └── common/         # Componentes comunes
│   ├── features/           # Módulos por funcionalidad
│   │   ├── auth/           # Autenticación
│   │   ├── projects/       # Gestión de proyectos
│   │   ├── calculations/   # Módulos de cálculo
│   │   ├── collaboration/  # Colaboración tiempo real
│   │   └── export/         # Exportación
│   ├── pages/              # Páginas principales
│   ├── services/           # Servicios (Firebase, API)
│   ├── store/              # Redux store
│   ├── utils/              # Utilidades
│   └── types/              # Tipos TypeScript
├── backend-python/         # Backend de cálculos
│   ├── calculations/       # Módulos de cálculo
│   └── main.py            # API principal
└── public/                # Archivos estáticos
```

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js 18+
- Python 3.8+
- Cuenta de Firebase

### Frontend (React)

1. **Instalar dependencias**
```bash
npm install
```

2. **Configurar Backend**
   - El backend utiliza configuración JSON para flexibilidad entre entornos
   - Archivo de configuración: `public/config/app-config.json`
   
   Para desarrollo (localhost):
   ```json
   {
     "backend": {
       "baseUrl": "http://localhost:3001",
       "apiPath": "/api"
     },
     "app": {
       "name": "Calculadora Eléctrica V2",
       "version": "2.0.0",
       "environment": "development"
     }
   }
   ```
   
   Para producción, actualizar `baseUrl` con tu servidor.
   
   > **Nota**: Si el archivo JSON no existe, la app usará `http://localhost:3001/api` por defecto.

3. **Configurar Firebase**
   - Crear proyecto en Firebase Console
   - Habilitar Authentication y Firestore
   - Actualizar `firebaseconfig.js` con las credenciales

4. **Ejecutar en desarrollo**
```bash
npm run dev
```

4. **Build para producción**
```bash
npm run build
```

### Backend (Python)

1. **Crear entorno virtual**
```bash
cd backend-python
python -m venv venv
```

2. **Activar entorno virtual**
```bash
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate
```

3. **Instalar dependencias**
```bash
pip install -r requirements.txt
```

4. **Ejecutar servidor**
```bash
python main.py
```

## 📊 Módulos de Cálculo

### 1. DPMS (Determinación de la Potencia Máxima Simultánea)
- Cálculo por tipo de carga (TUG, IUG, ATE, ACU, TUE, OCE)
- Factores de demanda por grado de electrificación
- Análisis por ambiente y tablero

### 2. Cargas por Tablero
- Gestión de cargas por circuito
- Cálculo de potencias activa y reactiva
- Análisis por tipo de alimentación

### 3. Cálculo Térmico
- Verificación de capacidad de conductores
- Factores de corrección por temperatura
- Factores de agrupamiento

### 4. Caída de Tensión
- Cálculo de impedancias
- Verificación de límites normativos
- Optimización de secciones

### 5. Cortocircuito
- Cálculo de corrientes de falla
- Análisis de coordinación de protecciones
- Verificación de equipos

## 🔧 Scripts Disponibles

### Frontend
- `npm run dev` - Servidor de desarrollo
- `npm run build` - Build para producción
- `npm run preview` - Preview del build
- `npm run lint` - Linting del código
- `npm run typecheck` - Verificación de tipos

### Backend
- `python main.py` - Ejecutar servidor de desarrollo
- `uvicorn main:app --reload` - Ejecutar con auto-reload

## 🌐 Despliegue

### Frontend
- **Vercel**: Conectar repositorio para deployment automático
- **Firebase Hosting**: `firebase deploy`

### Backend
- **Heroku**: Deployment con Python buildpack
- **Google Cloud Run**: Containerización con Docker
- **AWS Lambda**: Serverless deployment

## 🔐 Configuración de Firebase

### Firestore Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /projects/{projectId} {
      allow read, write: if request.auth != null && 
        (request.auth.uid == resource.data.ownerId || 
         request.auth.token.email in resource.data.collaborators);
    }
  }
}
```

### Security Rules
- Solo usuarios autenticados pueden acceder
- Propietarios tienen acceso completo
- Colaboradores pueden leer y escribir proyectos compartidos

## 🤝 Colaboración

### Funcionalidades de Colaboración
- **Tiempo Real**: Cambios sincronizados automáticamente
- **Gestión de Usuarios**: Agregar/remover colaboradores
- **Permisos**: Propietario vs Colaborador
- **Indicadores**: Usuarios activos en línea

## 📄 Exportación

### Formatos Disponibles
- **Excel (.xlsx)**: Datos tabulares con múltiples hojas
- **PDF**: Reportes profesionales con gráficos y tablas

### Opciones de Exportación
- Selección de módulos a incluir
- Personalización de contenido
- Descarga directa o generación de links

## 🐛 Solución de Problemas

### Problemas Comunes

1. **Error de Firebase**
   - Verificar configuración en `firebaseconfig.js`
   - Comprobar reglas de Firestore

2. **Backend no conecta**
   - Verificar que Python server esté ejecutándose
   - Comprobar CORS configuration

3. **Build falla**
   - Ejecutar `npm run typecheck`
   - Verificar imports y rutas

## 📝 Contribuir

1. Fork del repositorio
2. Crear branch para feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push al branch (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📋 To-Do / Roadmap

- [ ] Módulo de Centro de Potencia
- [ ] Cálculos avanzados de bandejas
- [ ] Integración con APIs de fabricantes
- [ ] Modo offline
- [ ] Plantillas de proyecto
- [ ] Importación desde Excel
- [ ] API REST pública
- [ ] Aplicación móvil

## 📞 Soporte

Para soporte técnico o consultas:
- Crear issue en GitHub
- Email: soporte@calculadora-electrica.com

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

---

**Calculadora Eléctrica** - Desarrollado con ❤️ para ingenieros eléctricos