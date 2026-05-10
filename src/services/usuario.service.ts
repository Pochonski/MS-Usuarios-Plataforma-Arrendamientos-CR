import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { usuarioDAO } from '../dao/usuario.dao';
import { CreateUsuarioDTO, UpdateUsuarioDTO, Usuario } from '../models/types';
import { config } from '../config/env';
import { RolUsuario } from '../models/enums';

export class UsuarioService {
  async getAll(): Promise<Partial<Usuario>[]> {
    const usuarios = await usuarioDAO.findAll();
    return usuarios.map(u => this.sinPassword(u));
  }

  async getById(id: string): Promise<Partial<Usuario> | null> {
    const usuario = await usuarioDAO.findById(id);
    if (!usuario) return null;
    return this.sinPassword(usuario);
  }

  async getByEmail(email: string): Promise<Partial<Usuario>[]> {
    const usuarios = await usuarioDAO.findByEmail(email);
    return usuarios.map(u => this.sinPassword(u));
  }

  async getByRol(rol: 'dueno' | 'inquilino'): Promise<Partial<Usuario>[]> {
    const usuarios = await usuarioDAO.findByRol(rol);
    return usuarios.map(u => this.sinPassword(u));
  }

  async create(data: CreateUsuarioDTO): Promise<{ id: string; usuario: Partial<Usuario> }> {
    // Check if email already exists
    const existing = await usuarioDAO.findByCorreo(data.correo);
    if (existing) {
      throw new Error('El correo electrónico ya está registrado');
    }

    // Hash password only if provided (Google OAuth users may have empty password)
    // Use empty string as placeholder for OAuth users since DB doesn't allow NULL
    const hashedPassword = data.contrasena ? await bcrypt.hash(data.contrasena, 10) : '';

    // Generate next ID
    const id = await usuarioDAO.getNextId();

    await usuarioDAO.create({
      ...data,
      id,
      contrasena: hashedPassword,
    });

    const usuario = await usuarioDAO.findById(id);
    if (!usuario) {
      throw new Error('Error al crear usuario');
    }

    return {
      id,
      usuario: this.sinPassword(usuario),
    };
  }

  async update(id: string, data: UpdateUsuarioDTO): Promise<boolean> {
    return usuarioDAO.update(id, data);
  }

  async delete(id: string): Promise<boolean> {
    return usuarioDAO.delete(id);
  }

  async login(correo: string, contrasena: string): Promise<{ token: string; usuario: Partial<Usuario> }> {
    const usuario = await usuarioDAO.findByCorreo(correo);
    if (!usuario) {
      throw new Error('Credenciales inválidas');
    }

    const isPasswordValid = await bcrypt.compare(contrasena, (usuario as any).ContrasenaHash);
    if (!isPasswordValid) {
      throw new Error('Credenciales inválidas');
    }

    const token = jwt.sign(
      {
        id: usuario.id,
        correo: usuario.correo,
        rol: usuario.rol,
      },
      config.jwt.secret,
      { expiresIn: '24h' }
    );

    return {
      token,
      usuario: this.sinPassword(usuario),
    };
  }

  async validateToken(token: string): Promise<{ id: string; correo: string; rol: RolUsuario }> {
    try {
      const decoded = jwt.verify(token, config.jwt.secret) as { id: string; correo: string; rol: RolUsuario };
      return decoded;
    } catch {
      throw new Error('Token inválido o expirado');
    }
  }

  async getProfile(id: string): Promise<Partial<Usuario> | null> {
    const usuario = await usuarioDAO.findById(id);
    if (!usuario) return null;
    return this.sinPassword(usuario);
  }

  private sinPassword(usuario: Usuario): Partial<Usuario> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { ContrasenaHash, ...sinPassword } = usuario as any;
    return sinPassword;
  }
}

export const usuarioService = new UsuarioService();