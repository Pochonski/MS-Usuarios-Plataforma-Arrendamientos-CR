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
    │   ├── usuario.dao.ts
    │   ├── propiedad.dao.ts
    │   ├── invitacion.dao.ts
    │   ├── contrato.dao.ts
    │   ├── pago.dao.ts
    │   ├── notificacion.dao.ts
    │   ├── conversacion.dao.ts
    │   └── mensaje.dao.ts
    ├── services/
    │   ├── usuario.service.ts
    │   ├── propiedad.service.ts
    │   ├── invitacion.service.ts
    │   ├── contrato.service.ts
    │   ├── pago.service.ts
    │   ├── notificacion.service.ts
    │   └── chat.service.ts
    ├── controllers/
    │   ├── usuario.controller.ts
    │   ├── propiedad.controller.ts
    │   ├── invitacion.controller.ts
    │   ├── contrato.controller.ts
    │   ├── pago.controller.ts
    │   ├── notificacion.controller.ts
    │   └── chat.controller.ts
    └── routes/
        ├── index.ts
        ├── usuario.routes.ts
        ├── propiedad.routes.ts
        ├── invitacion.routes.ts
        ├── contrato.routes.ts
        ├── pago.routes.ts
        ├── notificacion.routes.ts
        └── chat.routes.ts
```