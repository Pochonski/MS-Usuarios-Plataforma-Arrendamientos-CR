# MS-Usuarios - Plataforma de Arrendamientos Costa Rica

Microservicio de Autenticación y Perfiles para la plataforma de arrendamientos CR.

## Stack Tecnológico

- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Lenguaje**: TypeScript 5.3
- **Base de datos**: Azure SQL Database (MySQL compat)
- **Auth**: JWT (JSON Web Tokens)
- **Validation**: express-validator

## Arquitectura

```
src/
├── config/          # Configuración (env, database)
├── controllers/     # Controladores (handlers de requests)
├── dao/             # Data Access Objects (acceso a BD)
├── middlewares/     # Middlewares (auth, validation, error handling)
├── models/          # Tipos, enums e interfaces
├── routes/          # Definición de rutas
├── services/        # Lógica de negocio
└── index.ts         # Entry point
```

## Patrones de Diseño Aplicados

- **DAO (Data Access Object)**: Separación entre lógica de negocio y acceso a datos
- **DTO (Data Transfer Object)**: Estructuras para transferencia de datos en API
- **Middleware Pattern**: Validación, auth y manejo de errores centralizado
- **Service Layer**: Lógica de negocio encapsulada en servicios

## Endpoints (27 en total)

### Autenticación
- `POST /api/auth/login` - Login de usuario
- `GET /api/auth/profile` - Perfil del usuario autenticado

### Usuarios
- `GET /api/usuarios` - Listar usuarios (búsqueda por email)
- `GET /api/usuario/:id` - Obtener usuario por ID
- `POST /api/usuario/:tempId` - Registrar nuevo usuario
- `PUT /api/usuario/:id` - Actualizar usuario

### Propiedades
- `GET /api/propiedades` - Listar propiedades (con filtros y paginación)
- `GET /api/propiedades/:id` - Obtener propiedad por ID
- `POST /api/propiedades` - Crear propiedad
- `PUT /api/propiedades/:id` - Actualizar propiedad
- `DELETE /api/propiedades/:id` - Eliminar propiedad

### Invitaciones
- `GET /api/invitaciones` - Listar invitaciones
- `GET /api/invitaciones/:id` - Obtener invitación por ID
- `POST /api/invitaciones` - Crear invitación
- `PUT /api/invitaciones/:id` - Actualizar invitación

### Contratos
- `GET /api/contratos` - Listar contratos
- `GET /api/contratos/:id` - Obtener contrato por ID
- `GET /api/contratos/inquilino/:inquilinoId` - Contratos por inquilino
- `POST /api/contratos` - Crear contrato
- `PUT /api/contratos/:id` - Actualizar contrato

### Pagos
- `GET /api/pagos` - Listar pagos
- `GET /api/pagos/user/:userId` - Pagos por usuario
- `GET /api/pagos/:id` - Obtener pago por ID
- `POST /api/pagos` - Crear pago
- `PUT /api/pagos/:id` - Actualizar pago

### Notificaciones
- `GET /api/notificaciones` - Listar notificaciones
- `GET /api/notificaciones/user/:userId` - Notificaciones por usuario
- `GET /api/notificaciones/:id` - Obtener notificación por ID
- `POST /api/notificaciones` - Crear notificación
- `PUT /api/notificaciones/:id` - Marcar notificación como leída

### Conversaciones
- `GET /api/conversaciones` - Listar conversaciones
- `GET /api/conversaciones/user/:userId` - Conversaciones por usuario
- `GET /api/conversaciones/:id` - Obtener conversación por ID
- `POST /api/conversaciones` - Crear/obtener conversación

### Mensajes
- `GET /api/mensajes` - Listar mensajes
- `GET /api/mensajes/user/:userId` - Mensajes por usuario
- `GET /api/mensajes/:id` - Obtener mensaje por ID
- `POST /api/mensajes` - Enviar mensaje
- `PUT /api/mensajes/:id` - Marcar mensaje como leído

## Instalación

1. **Clonar el repositorio**
```bash
git clone <repo-url>
cd ms-usuarios-plataforma-arrendamientos-cr
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env
# Editar .env con los valores correctos
```

4. **Crear la base de datos**
```bash
mysql -h <host> -u <user> -p < sql/schema.sql
```

5. **Ejecutar en desarrollo**
```bash
npm run dev
```

## Scripts Disponibles

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Iniciar servidor en modo desarrollo |
| `npm run build` | Compilar TypeScript a JavaScript |
| `npm start` | Iniciar servidor en producción |
| `npm test` | Ejecutar pruebas unitarias |
| `npm run lint` | Verificar código con ESLint |

## Middleware de Autenticación

El API usa JWT para autenticación. Incluir en los headers:
```
Authorization: Bearer <token>
```

## Modelos de Datos

### Usuario
```json
{
  "id": 1,
  "nombre": "Juan Pérez",
  "correo": "juan@example.com",
  "rol": "dueno",
  "telefono": "+50612345678",
  "fechaRegistro": "2024-01-15T10:30:00Z"
}
```

### Propiedad
```json
{
  "id": 1,
  "titulo": "Casa en Escazú",
  "descripcion": "Casa moderna con vista a la montaña",
  "precio": 1500000,
  "moneda": "CRC",
  "provincia": "San José",
  "canton": "Escazú",
  "distrito": "Escazú",
  "tipo": "casa",
  "estado": "disponible",
  "imagenes": [],
  "idDueno": 1,
  "amenidades": ["piscina", "garage", "jardín"]
}
```

## Errores Comunes

| Código | Descripción |
|--------|-------------|
| 400 | Datos de entrada inválidos |
| 401 | Token inválido o expirado |
| 403 | No tienes permisos para esta acción |
| 404 | Recurso no encontrado |
| 409 | Conflicto (ej: email ya registrado) |
| 500 | Error interno del servidor |

## Documentación Adicional

- [Enunciado Fase I](Proyectos_Enunciado_Proyecto_-_FASE_I.pdf) - Especificación completa del frontend y modelo de datos
- [Enunciado Fase II](Proyectos_Enunciado_Proyecto_-_FASE_II.pdf) - Requisitos de microservices