# Portal Periodístico - Frontend en React

Un frontend moderno en React para un portal periodístico con autenticación y autorización basada en roles.

## Funcionalidades

- Autenticación basada en **JWT (JSON Web Tokens)**.
- Control de acceso basado en roles (**RBAC – Role-Based Access Control**).
- Rutas protegidas mediante **guardias de ruta (route guards)**.
- Inyección automática de tokens mediante **interceptores HTTP**.
- Diseño **responsivo**.

## Stack Tecnológico

- **React 18** – Biblioteca de interfaz de usuario
- **Vite** – Herramienta de build y servidor de desarrollo
- **React Router v6** – Enrutamiento y navegación
- **Axios** – Cliente HTTP con interceptores
- **Context API** – Gestión de estado

## Estructura del Proyecto



```
src/
├── components/         # React components
│   ├── Login.jsx      # Login page
│   ├── Dashboard.jsx  # Dashboard with role-based content
│   └── ProtectedRoute.jsx  # Route guard component
├── contexts/          # React contexts
│   └── AuthContext.jsx     # Authentication state management
├── services/          # Business logic
│   └── auth.service.js     # Authentication service
├── utils/             # Utilities
│   └── axios.interceptor.js  # HTTP interceptor for JWT
├── config/            # Configuration
│   └── api.config.js       # API endpoints configuration
├── App.jsx            # Main app component with routing
└── main.jsx          # Entry point
```

## Roles Disponibles

1. **Reportero** – Crea y envía artículos
2. **Editor** – Revisa artículos desde la perspectiva editorial
3. **Revisor Legal** – Revisa artículos desde la perspectiva legal
4. **Jefe de Redacción** – Autoridad final de aprobación
5. **Administrador** – Gestión del sistema y usuarios

## Flujo de Autenticación

1. El usuario ingresa sus credenciales en `/login`
2. El frontend envía una solicitud POST a `http://localhost:8081/auth/login`
3. El backend valida y devuelve un token JWT con los datos del usuario
4. El token se almacena en `localStorage`
5. El interceptor de Axios añade el token a todas las solicitudes posteriores
6. El usuario es redirigido a `/dashboard`

## Guardias de Ruta

El componente `ProtectedRoute` proporciona dos niveles de protección:

1. **Guardia de Autenticación** – Requiere que el usuario esté autenticado
2. **Guardia Basada en Roles** – Requiere roles específicos (opcional)

### Ejemplo de Uso

```jsx
// Guardia simple de autenticación
<Route path="/dashboard" element={
  <ProtectedRoute>
    <Dashboard />
  </ProtectedRoute>
} />

// Guardia basada en roles
<Route path="/admin" element={
  <ProtectedRoute requiredRoles={['Administrador']}>
    <AdminPanel />
  </ProtectedRoute>
} />


```jsx
// Simple authentication guard
<Route path="/dashboard" element={
  <ProtectedRoute>
    <Dashboard />
  </ProtectedRoute>
} />

// Role-based guard
<Route path="/admin" element={
  <ProtectedRoute requiredRoles={['Administrador']}>
    <AdminPanel />
  </ProtectedRoute>
} />
```

## Configuración de la API

Backend microservices configurados en `src/config/api.config.js`:

- **Auth Service**: `http://localhost:8081`
- **Article Service**: `http://localhost:8082`
- **Suggestion Service**: `http://localhost:8083`

## Primeros Pasos

### Prerequisitos

- Node.js 18+ and npm
- Backend microservices running on ports 8081, 8082, 8083

### Instalación

```bash
# Navigate to project directory
cd newfront-react

# Install dependencies (already done)
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

### Build para producción

```bash
npm run build
```

## FUncionalidades de Seguridad

### Implementadas

- Autenticación basada en tokens JWT
- Inyección automática de tokens mediante interceptores
- Rutas protegidas con guardias de autenticación
- Control de acceso basado en roles
- Manejo de errores 401 con cierre de sesión automático
- TVerificación de expiración del token

### Consideraciones de Seguridad
**Implementación Actual:**
- Tokens almacenados en `localStorage` (vulnerable a ataques XSS)
- Verificación de roles únicamente del lado del cliente

**Recomendaciones para Producción:**
- Usar cookies `HttpOnly` en lugar de `localStorage`
- Implementar un mecanismo de **refresh tokens**
- Añadir protección contra **CSRF**
- Validar la autorización en el **servidor**
- Forzar el uso de **HTTPS**
- Configurar encabezados de **Content Security Policy (CSP)**

## Uso

### Inicio de Sesión

1. Navegar a `http://localhost:5173/login`
2. Ingresar las credenciales:
   - Nombre de usuario
   - Contraseña
3. Hacer clic en **"Iniciar Sesión"**
4. En caso de éxito, se redirige al dashboard

### Dashboard

El dashboard muestra:
- Información del usuario (ID, nombre de usuario, rol)
- Permisos específicos según el rol
- Descripción de todos los roles del sistema

El contenido varía según el rol del usuario.

### Cierre de Sesión

Hacer clic en el botón **"Cerrar Sesión"** en la barra de navegación.

## Manejo de Errores

- **Credenciales inválidas**: Muestra un mensaje de error
- **Usuario inactivo**: Muestra un diálogo modal
- **401 No autorizado**: Cierre de sesión automático y redirección al login
- **Errores de red**: Mensajes de error amigables para el usuario

## Mejoras Futuras

Componentes listos para ser implementados:

- Gestión de artículos (crear, editar, listar)
- Interfaz de flujo de aprobación
- Panel de administración para la gestión de usuarios
- Visualización pública de artículos
- Comentarios y sugerencias

## Notas de Desarrollo

- Uso de componentes funcionales con hooks
- Context API para la gestión del estado
- Interceptores de Axios para el manejo automático de tokens
- Módulos CSS para el estilado de componentes
- Diseño responsivo con soporte para dispositivos móviles

## Licencia

MIT
