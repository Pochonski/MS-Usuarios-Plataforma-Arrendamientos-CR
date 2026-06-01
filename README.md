# MS-Usuarios - Plataforma Arrendamientos CR

Microservicio de autenticación y gestión de usuarios para la plataforma de arrendamientos de Costa Rica.

## Stack Tecnológico

| Componente | Tecnología |
|------------|------------|
| Runtime | Node.js 20+ |
| Framework | Express.js 4.18 |
| Lenguaje | TypeScript 5.3 |
| Base de datos | Azure SQL Database (SQL Server) |
| Auth | JWT (jsonwebtoken) + Google OAuth |
| Validación | express-validator |
| Rate Limiting | express-rate-limit |
| Testing | Jest + ts-jest |

## Arquitectura

```
src/
├── config/              # Configuración (env, database)
├── controllers/          # Controladores HTTP
├── dao/                 # Data Access Objects
├── middlewares/         # Auth, validation, rate limit, errors
├── models/              # Tipos y enums
├── routes/              # Definición de rutas
├── services/            # Lógica de negocio
├── utils/               # Utilidades
├── __tests__/           # Tests unitarios
└── index.ts             # Entry point
```

## Patrones de Diseño

- **DAO (Data Access Object)**: Aislamiento del acceso a datos
- **Service Layer**: Lógica de negocio encapsulada
- **Middleware Pattern**: Cross-cutting concerns centralizados
- **DTO Pattern**: Separación entre dominio y transporte

## Endpoints

### Autenticación

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| POST | `/api/auth/login` | Login con email/contraseña | No |
| POST | `/api/auth/registro` | Registro de nuevo usuario | No |
| POST | `/api/auth/google` | Login/registro con Google OAuth | No |
| GET | `/api/auth/profile` | Perfil del usuario autenticado | Sí |

### Usuarios

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| GET | `/api/usuarios` | Listar usuarios (filtros: email, rol) | No |
| GET | `/api/usuario/:id` | Obtener usuario por ID | No |
| PUT | `/api/usuario/:id` | Actualizar usuario | Sí |

### Health

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| GET | `/api/health` | Health check con verificación de BD | No |

## Autenticación

### Login con Email/Password

```bash
POST /api/auth/login
Content-Type: application/json

{
  "correo": "usuario@example.com",
  "contrasena": "password123"
}
```

**Respuesta:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id": "usr-001",
    "nombre": "Juan Pérez",
    "correo": "usuario@example.com",
    "rol": "dueno"
  }
}
```

### Login con Google OAuth

```bash
POST /api/auth/google
Content-Type: application/json

{
  "googleToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Flujo:**
1. Frontend ejecuta Google Sign-In y obtiene el ID token
2. Envía el token a este endpoint
3. Backend verifica el token con Google APIs
4. Si es válido, busca o crea el usuario y retorna JWT nuestro

**Respuesta:** Mismo formato que login normal.

### Registro

```bash
POST /api/auth/registro
Content-Type: application/json

{
  "nombre": "Juan Pérez",
  "correo": "usuario@example.com",
  "contrasena": "password123",
  "rol": "dueno",
  "telefono": "12345678"
}
```

### Headers de Auth

Para endpoints protegidos, incluir el JWT en los headers:

```
Authorization: Bearer <token>
```

## Rate Limiting

| Tipo | Límite | Ventana |
|------|--------|---------|
| Auth (login/registro) | 5 requests | 15 min |
| Read (GET) | 200 requests | 15 min |
| Write (POST/PUT) | 50 requests | 15 min |

## Validación de Entrada

### Registro
- `nombre`: 1-100 caracteres
- `correo`: email válido
- `contrasena`: opcional (requerida para usuarios normales, vacía para OAuth)
- `rol`: "dueno" o "inquilino"
- `telefono`: 8-12 dígitos, opcional (+506)

### Login
- `correo`: email válido
- `contrasena`: requerida

## Modelos de Datos

### Usuario

```json
{
  "id": "usr-001",
  "nombre": "Juan Pérez",
  "correo": "juan@example.com",
  "rol": "dueno",
  "telefono": "12345678",
  "avatar": "https://example.com/avatar.jpg",
  "fechaRegistro": "2024-01-15T10:30:00Z"
}
```

### Roles

- `dueno`: Propietario de propiedades
- `inquilino`: Arrendatario de propiedades

## Códigos de Error

| Código | Descripción |
|--------|-------------|
| 400 | Datos de entrada inválidos |
| 401 | Token inválido/expirado o credenciales inválidas |
| 403 | No tienes permisos para esta acción |
| 404 | Recurso no encontrado |
| 409 | Conflicto (ej: email ya registrado) |
| 429 | Demasiadas solicitudes (rate limit) |
| 500 | Error interno del servidor |

## Instalación

```bash
# Clonar repositorio
git clone <repo-url>
cd ms-usuarios-plataforma-arrendamientos-cr

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con los valores correctos

# Ejecutar en desarrollo
npm run dev

# Build para producción
npm run build

# Iniciar en producción
npm start
```

## Scripts Disponibles

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Servidor en modo desarrollo (ts-node-dev) |
| `npm run build` | Compilar TypeScript a JavaScript |
| `npm start` | Iniciar servidor en producción |
| `npm test` | Ejecutar tests unitarios |
| `npm run lint` | Verificar código con ESLint |

## Variables de Entorno

| Variable | Descripción | Requerido |
|----------|-------------|-----------|
| `PORT` | Puerto del servidor (default: 3000) | No |
| `NODE_ENV` | Entorno (development/production) | No |
| `DB_HOST` | Host de Azure SQL | Sí |
| `DB_PORT` | Puerto (default: 1433) | No |
| `DB_NAME` | Nombre de la base de datos | Sí |
| `DB_USER` | Usuario de la base de datos | Sí |
| `DB_PASSWORD` | Contraseña de la base de datos | Sí |
| `JWT_SECRET` | Secret para firmar JWT tokens | **Sí** |
| `JWT_EXPIRES_IN` | Expiración del token (default: 24h) | No |
| `GOOGLE_CLIENT_ID` | Client ID de Google OAuth | Para login con Google |
| `RL_WINDOW_MINUTES` | Ventana de rate limit (default: 15) | No |
| `RL_AUTH_MAX` | Requests permitidos para auth (default: 5) | No |
| `RL_READ_MAX` | Requests permitidos para reads (default: 200) | No |
| `RL_WRITE_MAX` | Requests permitidos para writes (default: 50) | No |

## Seguridad

- **Helmet**: Headers de seguridad HTTP
- **CORS**: Configurable por entorno (orígenes específicos en producción)
- **Rate Limiting**: Protección contra ataques de fuerza bruta
- **JWT**: Tokens firmados con expiración de 24h
- **bcrypt**: Hash de contraseñas con salt rounds 10
- **Trust Proxy**: Habilitado para correcto funcionamiento detrás de APIM

## Tests

```bash
# Ejecutar todos los tests
npm test

# Tests con coverage
npm test -- --coverage
```

**Suite actual:** 28 tests en 4 suites
- `auth.test.ts` - JWT, authenticate, optionalAuth
- `validation.test.ts` - email, teléfono, nombre, rol
- `usuario.service.test.ts` - sinPassword, OAuth, ID generation, bcrypt
- `google.service.test.ts` - GoogleUserInfo, token structure

## Database Schema

El schema SQL está en `sql/schema.sql` y es compatible con Azure SQL Database (SQL Server).

### Tablas principales

- **Usuarios**: Id, Nombre, Correo, ContrasenaHash, Rol, Telefono, Avatar, GoogleId, FechaRegistro, UltimoLogin
- **Sequences**: Tabla auxiliar para generación atómica de IDs

## Documentación Adicional

- [MIGRATIONS.md](./MIGRATIONS.md) - Guía de migraciones de base de datos
- [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) - Estructura del proyecto