import { Router } from 'express';
import { usuarioController } from '../controllers/usuario.controller';
import { authenticate } from '../middlewares/auth';
import { validate, usuarioValidation } from '../middlewares/validation';
import { rateLimitAuth, rateLimitRead, rateLimitWrite } from '../middlewares/rateLimit';

const router = Router();

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Iniciar sesión con email y contraseña
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [correo, contrasena]
 *             properties:
 *               correo:
 *                 type: string
 *                 format: email
 *               contrasena:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: Datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Credenciales inválidas
 *       429:
 *         description: Demasiados intentos
 */
router.post('/auth/login', rateLimitAuth, usuarioValidation.login, validate, usuarioController.login);

/**
 * @swagger
 * /auth/registro:
 *   post:
 *     tags: [Auth]
 *     summary: Registrar un nuevo usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre, correo, rol]
 *             properties:
 *               nombre:
 *                 type: string
 *               correo:
 *                 type: string
 *                 format: email
 *               contrasena:
 *                 type: string
 *               rol:
 *                 type: string
 *                 enum: [dueno, inquilino]
 *               telefono:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuario creado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UsuarioResponse'
 *       400:
 *         description: Datos inválidos
 *       409:
 *         description: El correo ya está registrado
 *       429:
 *         description: Demasiados intentos
 */
router.post('/auth/registro', rateLimitAuth, usuarioValidation.create, validate, usuarioController.create);

/**
 * @swagger
 * /auth/google:
 *   post:
 *     tags: [Auth]
 *     summary: Iniciar sesión o registrarse con Google OAuth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [googleToken]
 *             properties:
 *               googleToken:
 *                 type: string
 *                 description: Google ID token
 *               rol:
 *                 type: string
 *                 enum: [dueno, inquilino]
 *                 description: Rol a asignar si es un usuario nuevo (default dueno)
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       401:
 *         description: Token de Google inválido
 *       429:
 *         description: Demasiados intentos
 */
router.post('/auth/google', rateLimitAuth, usuarioValidation.google, validate, usuarioController.googleLogin);

/**
 * @swagger
 * /auth/profile:
 *   get:
 *     tags: [Auth]
 *     summary: Obtener perfil del usuario autenticado
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil del usuario
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UsuarioResponse'
 *       401:
 *         description: No autenticado
 *       404:
 *         description: Usuario no encontrado
 */
router.get('/auth/profile', rateLimitRead, authenticate, usuarioController.getProfile);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Refrescar token de acceso
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Nuevo token emitido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       401:
 *         description: No autenticado
 */
router.post('/auth/refresh', rateLimitRead, authenticate, usuarioController.refresh);

// Read endpoints - lenient rate limiting

/**
 * @swagger
 * /usuarios:
 *   get:
 *     tags: [Usuarios]
 *     summary: Listar usuarios (con paginación y filtros opcionales)
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *           maximum: 100
 *         description: Usuarios por página
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *         description: Buscar por email (prefijo)
 *       - in: query
 *         name: rol
 *         schema:
 *           type: string
 *           enum: [dueno, inquilino]
 *         description: Filtrar por rol
 *     responses:
 *       200:
 *         description: Lista de usuarios
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/PaginatedResponse'
 *                 - type: array
 *                   items:
 *                     $ref: '#/components/schemas/UsuarioResponse'
 *       401:
 *         description: No autenticado
 */
router.get('/usuarios', rateLimitRead, authenticate, usuarioController.getAll);

/**
 * @swagger
 * /usuario/{id}:
 *   get:
 *     tags: [Usuarios]
 *     summary: Obtener usuario por ID
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario (ej. usr-001)
 *     responses:
 *       200:
 *         description: Usuario encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UsuarioResponse'
 *       401:
 *         description: No autenticado
 *       404:
 *         description: Usuario no encontrado
 */
router.get('/usuario/:id', rateLimitRead, authenticate, usuarioController.getById);

// Write endpoints - moderate rate limiting

/**
 * @swagger
 * /usuario/{id}:
 *   put:
 *     tags: [Usuarios]
 *     summary: Actualizar perfil del usuario autenticado
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario (solo puede actualizar su propio perfil)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               correo:
 *                 type: string
 *                 format: email
 *               telefono:
 *                 type: string
 *               avatar:
 *                 type: string
 *     responses:
 *       200:
 *         description: Perfil actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UsuarioResponse'
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No puedes actualizar otro usuario
 *       404:
 *         description: Usuario no encontrado
 *       409:
 *         description: El correo ya está registrado
 */
router.put('/usuario/:id', rateLimitWrite, authenticate, usuarioValidation.update, validate, usuarioController.update);

/**
 * @swagger
 * /usuario/{id}:
 *   delete:
 *     tags: [Usuarios]
 *     summary: Eliminar la cuenta del usuario autenticado
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario (solo puede eliminar su propia cuenta)
 *     responses:
 *       200:
 *         description: Usuario eliminado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No puedes eliminar otro usuario
 *       404:
 *         description: Usuario no encontrado
 */
router.delete('/usuario/:id', rateLimitWrite, authenticate, usuarioController.delete);

export default router;