# MS-Usuarios - Plataforma Arrendamientos CR

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
│   └── schema.sql
└── src/
    ├── index.ts
    ├── app.ts
    ├── config/
    │   ├── env.ts
    │   └── database.ts
    ├── models/
    │   ├── enums.ts
    │   └── types.ts
    ├── middlewares/
    │   ├── auth.ts
    │   ├── errorHandler.ts
    │   └── validation.ts
    ├── dao/
    │   └── usuario.dao.ts
    ├── services/
    │   └── usuario.service.ts
    ├── controllers/
    │   └── usuario.controller.ts
    └── routes/
        ├── index.ts
        └── usuario.routes.ts
```

## Responsabilidad del Microservicio

Este microservicio es responsable de:

- **Gestión de Identidades**: Manejo de usuarios (Dueño vs. Inquilino) y autenticación
- **Perfiles**: Creación, actualización y consulta de perfiles de usuarios
- **Autenticación**: Login con JWT y validación de tokens

## Rutas Disponibles

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| POST | /auth/login | Iniciar sesión | No |
| GET | /usuarios | Listar usuarios (opcional con email) | No |
| GET | /usuario/:id | Obtener usuario por ID | No |
| POST | /usuario/:tempId | Crear nuevo usuario | No |
| PUT | /usuario/:id | Actualizar usuario | Sí |
| GET | /auth/profile | Obtener perfil del usuario autenticado | Sí |
| GET | /health | Health check del servicio | No |

## Roles de Usuario

- `dueno`: Propietario de propiedades
- `inquilino`: Arrendatario de propiedades