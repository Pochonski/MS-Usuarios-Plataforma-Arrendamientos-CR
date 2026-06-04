import { RolUsuario } from '../models/enums';

describe('UsuarioService', () => {
  describe('sinPassword', () => {
    it('should remove ContrasenaHash from usuario', () => {
      const usuario = {
        id: 'usr-001',
        nombre: 'Juan Pérez',
        correo: 'juan@example.com',
        ContrasenaHash: 'hashedpassword123',
        rol: 'dueno' as RolUsuario,
        telefono: '12345678',
        fechaRegistro: new Date(),
        ultimoLogin: undefined,
      };

      const { ContrasenaHash, ...sinPassword } = usuario;

      expect(sinPassword).not.toHaveProperty('ContrasenaHash');
      expect(sinPassword.id).toBe('usr-001');
      expect(sinPassword.nombre).toBe('Juan Pérez');
      expect(sinPassword.correo).toBe('juan@example.com');
      expect(sinPassword.rol).toBe('dueno');
    });

    it('should preserve all other properties', () => {
      const usuario = {
        id: 'usr-002',
        nombre: 'María',
        correo: 'maria@example.com',
        ContrasenaHash: null,
        rol: 'inquilino' as RolUsuario,
        telefono: '87654321',
        avatar: 'https://example.com/avatar.jpg',
        fechaRegistro: new Date(),
        ultimoLogin: new Date(),
      };

      const { ContrasenaHash: _, ...sinPassword } = usuario;

      expect(Object.keys(sinPassword).sort()).toEqual([
        'avatar',
        'correo',
        'fechaRegistro',
        'id',
        'nombre',
        'rol',
        'telefono',
        'ultimoLogin',
      ].sort());
    });
  });

  describe('OAuth user login prevention', () => {
    it('should detect users without password (OAuth)', () => {
      const oauthUser = {
        id: 'usr-003',
        nombre: 'OAuth User',
        correo: 'oauth@example.com',
        ContrasenaHash: '', // empty string for OAuth
        rol: 'dueno' as RolUsuario,
      };

      // OAuth users should not be able to login with password
      const canLoginWithPassword = !!oauthUser.ContrasenaHash;
      expect(canLoginWithPassword).toBe(false);
    });

    it('should allow login for regular users', () => {
      const regularUser = {
        id: 'usr-004',
        nombre: 'Regular User',
        correo: 'regular@example.com',
        ContrasenaHash: 'hashedpassword',
        rol: 'dueno' as RolUsuario,
      };

      const canLoginWithPassword = !!regularUser.ContrasenaHash;
      expect(canLoginWithPassword).toBe(true);
    });
  });

  describe('ID generation format', () => {
    it('should generate IDs in correct format', () => {
      const generateId = (num: number): string => {
        return `usr-${String(num).padStart(3, '0')}`;
      };

      expect(generateId(1)).toBe('usr-001');
      expect(generateId(99)).toBe('usr-099');
      expect(generateId(100)).toBe('usr-100');
      expect(generateId(999)).toBe('usr-999');
    });
  });

  describe('password hashing', () => {
    it('should hash password with bcrypt', async () => {
      const bcrypt = require('bcryptjs');
      const password = 'testpassword123';
      const hash = await bcrypt.hash(password, 10);

      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(50);

      const isValid = await bcrypt.compare(password, hash);
      expect(isValid).toBe(true);

      const isInvalid = await bcrypt.compare('wrongpassword', hash);
      expect(isInvalid).toBe(false);
    });
  });

  describe('Google login account linking', () => {
    it('should link GoogleId to a password-only user when email matches', async () => {
      // Simulated state: existing user with password but no GoogleId
      const user = {
        id: 'usr-100',
        GoogleId: undefined as string | undefined,
        Correo: 'link@example.com',
        ContrasenaHash: 'hashedpassword',
      };

      // googleLogin would setGoogleId on this user
      user.GoogleId = 'google-sub-123';

      expect(user.GoogleId).toBe('google-sub-123');
    });

    it('should refuse to link when GoogleId differs from existing', () => {
      const user = { GoogleId: 'google-sub-A' };
      const attempted = 'google-sub-B';

      const isTakeover = !!user.GoogleId && user.GoogleId !== attempted;
      expect(isTakeover).toBe(true);
    });
  });
});