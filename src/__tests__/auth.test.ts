import jwt from 'jsonwebtoken';
import { RolUsuario } from '../models/enums';

// Test configuration
const TEST_SECRET = 'test_secret_for_jest_12345678901234567890';

describe('Auth Middleware', () => {
  describe('JWT Token Generation', () => {
    it('should generate valid JWT token', () => {
      const payload = { id: 'usr-001', correo: 'test@example.com', rol: RolUsuario.DUENO };
      const token = jwt.sign(payload, TEST_SECRET, { expiresIn: '1h' });

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3); // JWT has 3 parts
    });

    it('should verify valid token', () => {
      const payload = { id: 'usr-001', correo: 'test@example.com', rol: RolUsuario.DUENO };
      const token = jwt.sign(payload, TEST_SECRET, { expiresIn: '1h' });

      const decoded = jwt.verify(token, TEST_SECRET) as { id: string; correo: string; rol: string };
      expect(decoded.id).toBe('usr-001');
      expect(decoded.correo).toBe('test@example.com');
      expect(decoded.rol).toBe(RolUsuario.DUENO);
    });

    it('should reject invalid token', () => {
      const invalidToken = 'invalid.token.here';

      expect(() => {
        jwt.verify(invalidToken, TEST_SECRET);
      }).toThrow();
    });

    it('should reject token with wrong secret', () => {
      const payload = { id: 'usr-001', correo: 'test@example.com', rol: RolUsuario.DUENO };
      const token = jwt.sign(payload, 'wrong-secret', { expiresIn: '1h' });

      expect(() => {
        jwt.verify(token, TEST_SECRET);
      }).toThrow();
    });

    it('should reject expired token', () => {
      const payload = { id: 'usr-001', correo: 'test@example.com', rol: RolUsuario.DUENO };
      const token = jwt.sign(payload, TEST_SECRET, { expiresIn: '-1s' }); // expired

      expect(() => {
        jwt.verify(token, TEST_SECRET);
      }).toThrow('jwt expired');
    });
  });

  describe('JwtPayload structure', () => {
    it('should have correct structure', () => {
      const payload = { id: 'usr-001', correo: 'test@example.com', rol: RolUsuario.INQUILINO };
      const token = jwt.sign(payload, TEST_SECRET, { expiresIn: '1h' });
      const decoded = jwt.verify(token, TEST_SECRET) as { id: string; correo: string; rol: RolUsuario };

      expect(decoded).toHaveProperty('id');
      expect(decoded).toHaveProperty('correo');
      expect(decoded).toHaveProperty('rol');
      expect(decoded.rol).toBe(RolUsuario.INQUILINO);
    });
  });
});

describe('AuthRequest interface', () => {
  it('should allow user property', () => {
    const mockRequest = {
      user: {
        id: 'usr-001',
        correo: 'test@example.com',
        rol: RolUsuario.DUENO,
      },
    };

    expect(mockRequest.user).toBeDefined();
    expect(mockRequest.user.id).toBe('usr-001');
    expect(mockRequest.user.rol).toBe(RolUsuario.DUENO);
  });
});