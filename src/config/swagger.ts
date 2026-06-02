import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'MS-Usuarios API',
      version: '1.0.0',
      description: 'Microservicio de autenticación y gestión de usuarios para Plataforma de Arrendamientos CR',
    },
    servers: [{ url: '/api' }],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'Ocp-Apim-Subscription-Key',
        },
      },
      schemas: {
        UsuarioResponse: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'usr-001' },
            nombre: { type: 'string', example: 'Juan Pérez' },
            correo: { type: 'string', format: 'email', example: 'juan@example.com' },
            rol: { type: 'string', enum: ['dueno', 'inquilino'] },
            telefono: { type: 'string', example: '+50688889999' },
            avatar: { type: 'string', nullable: true },
            fechaRegistro: { type: 'string', format: 'date-time' },
            ultimoLogin: { type: 'string', format: 'date-time', nullable: true },
          },
        },
        LoginResponse: {
          type: 'object',
          properties: {
            token: { type: 'string' },
            usuario: { $ref: '#/components/schemas/UsuarioResponse' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' },
          },
        },
        PaginatedResponse: {
          type: 'object',
          properties: {
            data: { type: 'array', items: { $ref: '#/components/schemas/UsuarioResponse' } },
            pagination: {
              type: 'object',
              properties: {
                page: { type: 'integer' },
                limit: { type: 'integer' },
                total: { type: 'integer' },
                pages: { type: 'integer' },
              },
            },
          },
        },
      },
    },
    tags: [
      { name: 'Auth', description: 'Autenticación (login, registro, Google OAuth, perfil)' },
      { name: 'Usuarios', description: 'CRUD de usuarios' },
      { name: 'Health', description: 'Health check del servicio' },
    ],
  },
  apis: ['./src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
