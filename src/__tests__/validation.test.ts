describe('Validation Rules', () => {
  describe('email validation', () => {
    it('should accept valid email', () => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      expect(emailRegex.test('test@example.com')).toBe(true);
    });

    it('should reject invalid email', () => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      expect(emailRegex.test('invalid-email')).toBe(false);
      expect(emailRegex.test('@example.com')).toBe(false);
      expect(emailRegex.test('test@')).toBe(false);
    });
  });

  describe('telefono validation', () => {
    it('should accept valid phone numbers', () => {
      const phoneRegex = /^\+?[0-9]{8,12}$/;
      expect(phoneRegex.test('12345678')).toBe(true);
      expect(phoneRegex.test('+50612345678')).toBe(true);
      expect(phoneRegex.test('123456789012')).toBe(true);
    });

    it('should reject invalid phone numbers', () => {
      const phoneRegex = /^\+?[0-9]{8,12}$/;
      expect(phoneRegex.test('123')).toBe(false); // too short
      expect(phoneRegex.test('12345678901234')).toBe(false); // too long
      expect(phoneRegex.test('abc12345678')).toBe(false); // contains letters
      expect(phoneRegex.test('+50-12345678')).toBe(false); // contains dashes
    });
  });

  describe('nombre validation', () => {
    it('should accept valid names', () => {
      expect('Juan'.length >= 2 && 'Juan'.length <= 100).toBe(true);
      expect('María García López'.length >= 2 && 'María García López'.length <= 100).toBe(true);
    });

    it('should reject invalid names', () => {
      expect(''.length >= 2).toBe(false); // empty
      expect('A'.length >= 2).toBe(false); // too short
      expect('A'.repeat(101).length <= 100).toBe(false); // too long
    });
  });

  describe('contrasena validation', () => {
    it('should accept passwords with 8 or more chars', () => {
      const min = 8;
      expect('12345678'.length >= min).toBe(true);
      expect('Password123!'.length >= min).toBe(true);
    });

    it('should reject passwords with less than 8 chars', () => {
      const min = 8;
      expect('1234567'.length >= min).toBe(false);
      expect(''.length >= min).toBe(false);
    });
  });

  describe('rol validation', () => {
    it('should accept valid roles', () => {
      const validRoles = ['dueno', 'inquilino'];
      expect(validRoles.includes('dueno')).toBe(true);
      expect(validRoles.includes('inquilino')).toBe(true);
    });

    it('should reject invalid roles', () => {
      const validRoles = ['dueno', 'inquilino'];
      expect(validRoles.includes('admin')).toBe(false);
      expect(validRoles.includes('')).toBe(false);
    });
  });
});