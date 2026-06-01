# MS-Usuarios - Plataforma Arrendamientos CR

## Responsabilidad del Microservicio

Este microservicio es responsable de:

- **Gestión de Identidades**: Usuarios (Dueño vs Inquilino) y autenticación
- **Autenticación**: Login con JWT, login con Google OAuth, registro
- **Perfiles**: Creación, actualización y consulta de perfiles

## Estructura del Proyecto

```
.
├── package.json
├── tsconfig.json
├── jest.config.js
├── .eslintrc.js
├── .env.example
├── .gitignore
├── README.md
├── sql/
│   └── schema.sql                    # SQL Server schema
└── src/
    ├── index.ts                     # Entry point + graceful shutdown
    ├── app.ts                       # Express app configuration
    ├── config/
    │   ├── env.ts                   # Environment variables
    │   └── database.ts              # Azure SQL connection (mssql)
    ├── models/
    │   ├── enums.ts                 # RolUsuario enum
    │   └── types.ts                 # Interfaces y DTOs
    ├── middlewares/
    │   ├── apimAuth.ts              # Azure APIM security (mTLS + subscription key)
    │   ├── auth.ts                 # JWT authenticate, optionalAuth
    │   ├── errorHandler.ts         # Error handling centralizado
    │   ├── rateLimit.ts            # express-rate-limit config
    │   └── validation.ts            # express-validator rules
    ├── dao/
    │   └── usuario.dao.ts          # Data Access Object
    ├── services/
    │   ├── usuario.service.ts      # Lógica de negocio
    │   └── google.service.ts       # Google OAuth token verification
    ├── controllers/
    │   └── usuario.controller.ts   # Handlers HTTP
    ├── routes/
    │   ├── index.ts                # Router principal + /health
    │   └── usuario.routes.ts       # Rutas de auth y usuarios
    └── __tests__/
        ├── auth.test.ts
        ├── validation.test.ts
        ├── usuario.service.test.ts
        └── google.service.test.ts
```

## Rutas Disponibles

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| POST | /auth/login | Login con email/contraseña | No |
| POST | /auth/registro | Registro de nuevo usuario | No |
| POST | /auth/google | Login/registro con Google OAuth | No |
| GET | /auth/profile | Perfil del usuario autenticado | Sí |
| GET | /usuarios | Listar usuarios (filtros: email, rol) | No |
| GET | /usuario/:id | Obtener usuario por ID | No |
| PUT | /usuario/:id | Actualizar usuario | Sí |
| GET | /health | Health check con verificación de BD | No |

## Flujos de Autenticación

### 1. Login Normal (Email + Password)
```
Usuario → POST /auth/login → usuarioService.login() → JWT
```

### 2. Login con Google OAuth
```
Usuario → Google Sign-In → POST /auth/google → googleService.verifyToken()
→ usuarioService.googleLogin() → JWT (busca/crea usuario por email)
```

### 3. Registro
```
Usuario → POST /auth/registro → usuarioService.create() → { id, usuario }
```

## Modelos de Datos

### Usuario (interface en src/models/types.ts)
```typescript
interface Usuario {
  id: string;              // Formato: usr-001
  nombre: string;
  correo: string;
  ContrasenaHash: string | null;
  rol: RolUsuario;
  avatar?: string;
  telefono?: string;
  fechaRegistro: Date;
  ultimoLogin?: Date;
}
```

### RolUsuario (enum en src/models/enums.ts)
```typescript
enum RolUsuario {
  DUENO = 'dueno',
  INQUILINO = 'inquilino'
}
```

### GoogleUserInfo (interface en src/models/types.ts)
```typescript
interface GoogleUserInfo {
  googleId: string;
  email: string;
  name: string;
  picture?: string;
}
```

## Rate Limiting

| Middleware | Límite | Ventana |
|------------|--------|---------|
| `rateLimitAuth` | 5 req | 15 min |
| `rateLimitRead` | 200 req | 15 min |
| `rateLimitWrite` | 50 req | 15 min |

## Seguridad Implementada

1. **Helmet**: Headers de seguridad HTTP
2. **CORS**: Orígenes configurables (production: arrendacr.com, www, Azure Static Apps)
3. **Trust Proxy**: Para correcto funcionamiento detrás de Azure APIM
4. **JWT Validation**: Token verificable con secret configurado
5. **bcrypt**: Hash de contraseñas con salt rounds 10
6. **express-validator**: Validación y sanitización de inputs
7. **Rate Limiting**: Protección contra ataques de fuerza bruta
8. **APIM Auth**: Validación de subscription key + certificado de cliente mTLS

## Variables de Entorno Requeridas

```bash
# Database
DB_HOST=your-server.database.windows.net
DB_PORT=1433
DB_NAME=arrendamientos_db
DB_USER=your_username
DB_PASSWORD=your_password

# JWT (OBLIGATORIO)
JWT_SECRET=your_super_secret_jwt_key_min_32_chars

# Google OAuth (para login con Google)
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

## Scripts

| Script | Descripción |
|--------|-------------|
| `npm run dev` | ts-node-dev con hot reload |
| `npm run build` | tsc compilation |
| `npm start` | node dist/index.js |
| `npm test` | jest --passWithNoTests |
| `npm run lint` | eslint src/**/*.ts |

## Tests

28 tests en 4 suites:
- **auth.test.ts**: JWT generation, verification, expired tokens
- **validation.test.ts**: email, phone, name, rol validation
- **usuario.service.test.ts**: sinPassword, OAuth detection, ID format, bcrypt
- **google.service.test.ts**: GoogleUserInfo interface, token structure