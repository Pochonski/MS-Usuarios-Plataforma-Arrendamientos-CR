import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { usuarioDAO } from '../dao/usuario.dao';
import { CreateUsuarioDTO, UpdateUsuarioDTO, Usuario } from '../models/types';
import { config } from '../config/env';
import { RolUsuario } from '../models/enums';

export class UsuarioService {
  async getAll(): Promise<Usuario[]> {
    return usuarioDAO.findAll();
  }

  async getById(id: number): Promise<Usuario | null> {
    return usuarioDAO.findById(id);
  }

  async getByEmail(email: string): Promise<Usuario[]> {
    return usuarioDAO.findByEmail(email);
  }

  async create(data: CreateUsuarioDTO): Promise<{ id: number; usuario: Partial<Usuario> }> {
    // Check if email already exists
    const existing = await usuarioDAO.findByCorreo(data.correo);
    if (existing) {
      throw new Error('El correo electrónico ya está registrado');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.contrasena, 10);

    const id = await usuarioDAO.create({
      ...data,
      contrasena: hashedPassword,
    });

    const usuario = await usuarioDAO.findById(id);
    if (!usuario) {
      throw new Error('Error al crear usuario');
    }

    // Return without password
    const { contrasena, ...usuarioSinPassword } = usuario;

    return {
      id,
      usuario: usuarioSinPassword,
    };
  }

  async update(id: number, data: UpdateUsuarioDTO): Promise<boolean> {
    return usuarioDAO.update(id, data);
  }

  async delete(id: number): Promise<boolean> {
    return usuarioDAO.delete(id);
  }

  async login(correo: string, contrasena: string): Promise<{ token: string; usuario: Partial<Usuario> }> {
    const usuario = await usuarioDAO.findByCorreo(correo);
    if (!usuario) {
      throw new Error('Credenciales inválidas');
    }

    const isPasswordValid = await bcrypt.compare(contrasena, usuario.contrasena);
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

    const { contrasena: _, ...usuarioSinPassword } = usuario;

    return {
      token,
      usuario: usuarioSinPassword,
    };
  }

  async validateToken(token: string): Promise<{ id: number; correo: string; rol: RolUsuario }> {
    try {
      const decoded = jwt.verify(token, config.jwt.secret) as { id: number; correo: string; rol: RolUsuario };
      return decoded;
    } catch {
      throw new Error('Token inválido o expirado');
    }
  }

  async getProfile(id: number): Promise<Partial<Usuario> | null> {
    const usuario = await usuarioDAO.findById(id);
    if (!usuario) return null;

    const { contrasena, ...usuarioSinPassword } = usuario;
    return usuarioSinPassword;
  }
}

export const usuarioService = new UsuarioService();