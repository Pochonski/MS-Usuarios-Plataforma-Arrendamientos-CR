import { Request, Response } from 'express';

// Mock config to provide a stable JWT secret for tests
jest.mock('../config/env', () => ({
  config: {
    jwt: {
      secret: 'test_secret_for_jest_12345678901234567890',
      expiresIn: '1h',
    },
    google: {
      clientId: 'test-google-client-id',
    },
    apim: {
      subscriptionKey: '',
      clientCertThumbprint: '',
      validateClientCert: false,
    },
  },
}));

// Mock bcryptjs to make password hashing/comparison predictable and instant
jest.mock('bcryptjs', () => ({
  __esModule: true,
  default: {
    hash: jest.fn((pwd: string) => Promise.resolve(`hashed_${pwd}`)),
    compare: jest.fn((pwd: string, hash: string) => Promise.resolve(hash === `hashed_${pwd}`)),
  },
  hash: jest.fn((pwd: string) => Promise.resolve(`hashed_${pwd}`)),
  compare: jest.fn((pwd: string, hash: string) => Promise.resolve(hash === `hashed_${pwd}`)),
}));

// Mock database — not used in these tests, but imported transitively
jest.mock('../config/database', () => ({
  database: {
    query: jest.fn(),
    execute: jest.fn(),
  },
}));

// Mock the DAO with in-memory store
jest.mock('../dao/usuario.dao');

// Mock googleService to avoid hitting the real Google API
jest.mock('../services/google.service', () => ({
  googleService: {
    verifyToken: jest.fn(),
  },
}));

import { usuarioDAO } from '../dao/usuario.dao';
import { googleService } from '../services/google.service';
import { usuarioController } from '../controllers/usuario.controller';
import { UnauthorizedError } from '../middlewares/errorHandler';
import { Usuario } from '../models/types';
import { RolUsuario } from '../models/enums';

const mockedDAO = usuarioDAO as jest.Mocked<typeof usuarioDAO>;
const mockedGoogle = googleService as jest.Mocked<typeof googleService>;

const buildRes = (): Response => {
  const res: Partial<Response> = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  return res as Response;
};

const buildUsuario = (overrides: Partial<Usuario> = {}): Usuario => ({
  Id: 'usr-001',
  Nombre: 'Test User',
  Correo: 'test@example.com',
  ContrasenaHash: 'hashed_Password123',
  Rol: RolUsuario.DUENO,
  Telefono: '+50688888888',
  FechaRegistro: new Date('2024-01-01'),
  UltimoLogin: new Date('2024-01-02'),
  ...overrides,
} as Usuario);

describe('Auth Integration — Login/Register/Google', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // -------------------- LOGIN --------------------
  describe('POST /auth/login', () => {
    it('returns token for valid credentials', async () => {
      const user = buildUsuario();
      mockedDAO.findByCorreo.mockResolvedValue(user);

      const req = { body: { correo: 'Test@Example.com', contrasena: 'Password123' } } as Request;
      const res = buildRes();

      await usuarioController.login(req, res);

      // Email should be lowercased
      expect(mockedDAO.findByCorreo).toHaveBeenCalledWith('test@example.com');
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          token: expect.any(String),
          refreshToken: expect.any(String),
          user: expect.objectContaining({ id: 'usr-001', correo: 'test@example.com' }),
        })
      );
      expect(mockedDAO.updateLastLogin).toHaveBeenCalledWith('usr-001');
      expect(res.status).not.toHaveBeenCalled();
    });

    it('returns 401 when user does not exist', async () => {
      mockedDAO.findByCorreo.mockResolvedValue(null);

      const req = { body: { correo: 'noone@example.com', contrasena: 'Password123' } } as Request;
      const res = buildRes();

      await usuarioController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Credenciales inválidas' })
      );
    });

    it('returns 401 when user is OAuth-only (no password hash)', async () => {
      const oauthUser = buildUsuario({ ContrasenaHash: null });
      mockedDAO.findByCorreo.mockResolvedValue(oauthUser);

      const req = { body: { correo: 'oauth@example.com', contrasena: 'Password123' } } as Request;
      const res = buildRes();

      await usuarioController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
    });
  });

  // -------------------- REGISTER --------------------
  describe('POST /auth/registro', () => {
    it('creates a new user with normalized email', async () => {
      mockedDAO.findByCorreo.mockResolvedValue(null);
      mockedDAO.getNextId.mockResolvedValue('usr-042');
      mockedDAO.create.mockResolvedValue('usr-042');
      mockedDAO.findById.mockResolvedValue(buildUsuario({ Id: 'usr-042', Correo: 'new@example.com' }));

      const req = {
        body: {
          nombre: 'Juan Pérez',
          correo: 'NEW@Example.COM',
          contrasena: 'Password123!',
          rol: 'dueno',
          telefono: '+50688888888',
        },
      } as Request;
      const res = buildRes();

      await usuarioController.create(req, res);

      // Email should be lowercased and trimmed
      expect(mockedDAO.findByCorreo).toHaveBeenCalledWith('new@example.com');
      expect(mockedDAO.create).toHaveBeenCalledWith(
        expect.objectContaining({ correo: 'new@example.com', nombre: 'Juan Pérez' })
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ 
          token: expect.any(String),
          refreshToken: expect.any(String),
          user: expect.objectContaining({ id: 'usr-042', correo: 'new@example.com' })
        })
      );
    });

    it('returns 409 when email already exists', async () => {
      mockedDAO.findByCorreo.mockResolvedValue(buildUsuario());

      const req = {
        body: {
          nombre: 'Otro',
          correo: 'test@example.com',
          contrasena: 'Password123!',
          rol: 'dueno',
        },
      } as Request;
      const res = buildRes();

      await usuarioController.create(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: expect.stringContaining('ya está registrado') })
      );
    });

    it('returns 409 on UNIQUE constraint race condition', async () => {
      mockedDAO.findByCorreo.mockResolvedValue(null);
      mockedDAO.getNextId.mockResolvedValue('usr-043');
      mockedDAO.create.mockRejectedValue({ number: 2627, message: 'UNIQUE KEY violation' });

      const req = {
        body: {
          nombre: 'Race Test',
          correo: 'race@example.com',
          contrasena: 'Password123!',
          rol: 'dueno',
        },
      } as Request;
      const res = buildRes();

      await usuarioController.create(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
    });
  });

  // -------------------- GOOGLE LOGIN --------------------
  describe('POST /auth/google', () => {
    const googleUserInfo = {
      googleId: 'google-sub-1',
      email: 'g@example.com',
      name: 'G User',
      picture: 'https://example.com/p.jpg',
    };

    it('logs in existing Google-linked user without changes', async () => {
      const user = buildUsuario({ Correo: 'g@example.com', GoogleId: 'google-sub-1' });
      mockedGoogle.verifyToken.mockResolvedValue(googleUserInfo);
      mockedDAO.findByGoogleId.mockResolvedValue(user);

      const req = { body: { googleToken: 'valid-token' } } as Request;
      const res = buildRes();

      await usuarioController.googleLogin(req, res);

      expect(mockedGoogle.verifyToken).toHaveBeenCalledWith('valid-token', expect.any(Object));
      expect(mockedDAO.findByGoogleId).toHaveBeenCalledWith('google-sub-1');
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ token: expect.any(String), refreshToken: expect.any(String), user: expect.any(Object) })
      );
      expect(mockedDAO.setGoogleProfile).not.toHaveBeenCalled();
    });

    it('links GoogleId to existing password user with same email', async () => {
      const userNoGoogle = buildUsuario({ Correo: 'g@example.com', GoogleId: undefined });
      const userAfterLink = { ...userNoGoogle, GoogleId: 'google-sub-1' };

      mockedGoogle.verifyToken.mockResolvedValue(googleUserInfo);
      mockedDAO.findByGoogleId.mockResolvedValue(null);
      mockedDAO.findByCorreo.mockResolvedValue(userNoGoogle);
      mockedDAO.setGoogleProfile.mockResolvedValue();
      mockedDAO.findById.mockResolvedValue(userAfterLink);

      const req = { body: { googleToken: 'valid-token' } } as Request;
      const res = buildRes();

      await usuarioController.googleLogin(req, res);

      expect(mockedDAO.setGoogleProfile).toHaveBeenCalledWith(
        'usr-001',
        'google-sub-1',
        'https://example.com/p.jpg'
      );
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ token: expect.any(String) })
      );
    });

    it('refuses takeover when GoogleId differs from existing', async () => {
      const user = buildUsuario({ Correo: 'g@example.com', GoogleId: 'other-google-id' });
      mockedGoogle.verifyToken.mockResolvedValue(googleUserInfo);
      mockedDAO.findByGoogleId.mockResolvedValue(null);
      mockedDAO.findByCorreo.mockResolvedValue(user);

      const req = { body: { googleToken: 'valid-token' } } as Request;
      const res = buildRes();

      await usuarioController.googleLogin(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: expect.stringContaining('vinculada') })
      );
      expect(mockedDAO.setGoogleProfile).not.toHaveBeenCalled();
    });

    it('creates a new user when neither googleId nor email match', async () => {
      const newUser = buildUsuario({
        Id: 'usr-077',
        Correo: 'g@example.com',
        GoogleId: 'google-sub-1',
        ContrasenaHash: null,
      });

      mockedGoogle.verifyToken.mockResolvedValue(googleUserInfo);
      mockedDAO.findByGoogleId.mockResolvedValue(null);
      mockedDAO.findByCorreo.mockResolvedValue(null);
      mockedDAO.getNextId.mockResolvedValue('usr-077');
      mockedDAO.create.mockResolvedValue('usr-077');
      mockedDAO.findById.mockResolvedValue(newUser);

      const req = { body: { googleToken: 'valid-token', rol: 'inquilino' } } as Request;
      const res = buildRes();

      await usuarioController.googleLogin(req, res);

      expect(mockedDAO.create).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'usr-077',
          correo: 'g@example.com',
          googleId: 'google-sub-1',
          rol: RolUsuario.INQUILINO,
          contrasena: undefined,
        })
      );
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ token: expect.any(String) })
      );
    });

    it('returns 401 if googleService rejects the token', async () => {
      mockedGoogle.verifyToken.mockRejectedValue(new UnauthorizedError('Email not provided by Google'));

      const req = { body: { googleToken: 'bad-token' } } as Request;
      const res = buildRes();

      await usuarioController.googleLogin(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('does not call DAO if googleService rejects', async () => {
      mockedGoogle.verifyToken.mockRejectedValue(new UnauthorizedError('Google account email is not verified'));

      const req = { body: { googleToken: 'unverified' } } as Request;
      const res = buildRes();

      await usuarioController.googleLogin(req, res);

      expect(mockedDAO.findByGoogleId).not.toHaveBeenCalled();
      expect(mockedDAO.findByCorreo).not.toHaveBeenCalled();
    });
  });

  // -------------------- EMAIL NORMALIZATION --------------------
  describe('Email normalization', () => {
    it('lowercases email on login', async () => {
      mockedDAO.findByCorreo.mockResolvedValue(buildUsuario());
      const req = { body: { correo: '  USER@Example.COM  ', contrasena: 'Password123' } } as Request;
      const res = buildRes();

      await usuarioController.login(req, res);

      expect(mockedDAO.findByCorreo).toHaveBeenCalledWith('user@example.com');
    });

    it('lowercases email on register', async () => {
      mockedDAO.findByCorreo.mockResolvedValue(null);
      mockedDAO.getNextId.mockResolvedValue('usr-099');
      mockedDAO.create.mockResolvedValue('usr-099');
      mockedDAO.findById.mockResolvedValue(buildUsuario({ Correo: 'mixed@example.com' }));

      const req = {
        body: {
          nombre: 'Test',
          correo: '  MIXED@EXAMPLE.COM  ',
          contrasena: 'Password123!',
          rol: 'dueno',
        },
      } as Request;
      const res = buildRes();

      await usuarioController.create(req, res);

      expect(mockedDAO.findByCorreo).toHaveBeenCalledWith('mixed@example.com');
    });
  });
});
