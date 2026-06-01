import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { usuarioDAO } from '../dao/usuario.dao';
import { CreateUsuarioDTO, UpdateUsuarioDTO, Usuario, GoogleUserInfo, UsuarioResponse } from '../models/types';
import { config } from '../config/env';
import { RolUsuario } from '../models/enums';

// Helper to convert DB row (PascalCase) to API response (camelCase)
const toApiResponse = (usuario: Usuario) => ({
  id: usuario.Id,
  nombre: usuario.Nombre,
  correo: usuario.Correo,
  rol: usuario.Rol,
  telefono: usuario.Telefono,
  avatar: usuario.Avatar,
  fechaRegistro: usuario.FechaRegistro,
  ultimoLogin: usuario.UltimoLogin,
});

export class UsuarioService {
  async getAll(): Promise<UsuarioResponse[]> {
    const usuarios = await usuarioDAO.findAll();
    return usuarios.map(u => this.sinPassword(u));
  }

  async getById(id: string): Promise<UsuarioResponse | null> {
    const usuario = await usuarioDAO.findById(id);
    if (!usuario) return null;
    return this.sinPassword(usuario);
  }

  async getByEmail(email: string): Promise<UsuarioResponse[]> {
    const usuarios = await usuarioDAO.findByEmail(email);
    return usuarios.map(u => this.sinPassword(u));
  }

  async getByRol(rol: 'dueno' | 'inquilino'): Promise<UsuarioResponse[]> {
    const usuarios = await usuarioDAO.findByRol(rol);
    return usuarios.map(u => this.sinPassword(u));
  }

  async create(data: CreateUsuarioDTO): Promise<{ id: string; usuario: UsuarioResponse }> {
    // Check if email already exists
    const existing = await usuarioDAO.findByCorreo(data.correo);
    if (existing) {
      throw new Error('El correo electrónico ya está registrado');
    }

    // Hash password only if provided (Google OAuth users may have empty password)
    const hashedPassword = data.contrasena ? await bcrypt.hash(data.contrasena, 10) : '';

    // Generate next ID
    const id = await usuarioDAO.getNextId();

    await usuarioDAO.create({
      nombre: data.nombre,
      correo: data.correo,
      contrasena: hashedPassword,
      rol: data.rol,
      telefono: data.telefono,
      id,
    });

    const usuario = await usuarioDAO.findById(id);
    if (!usuario) {
      throw new Error('Error al crear usuario');
    }

    return {
      id: usuario.Id,
      usuario: this.sinPassword(usuario),
    };
  }

  async update(id: string, data: UpdateUsuarioDTO): Promise<boolean> {
    return usuarioDAO.update(id, data);
  }

  async delete(id: string): Promise<boolean> {
    return usuarioDAO.delete(id);
  }

  async login(correo: string, contrasena: string): Promise<{ token: string; usuario: UsuarioResponse }> {
    const usuario = await usuarioDAO.findByCorreo(correo);
    if (!usuario) {
      throw new Error('Credenciales inválidas');
    }

    // OAuth users cannot login with password
    if (!usuario.ContrasenaHash) {
      throw new Error('Credenciales inválidas');
    }

    const isPasswordValid = await bcrypt.compare(contrasena, usuario.ContrasenaHash);
    if (!isPasswordValid) {
      throw new Error('Credenciales inválidas');
    }

    const token = jwt.sign(
      {
        id: usuario.Id,
        correo: usuario.Correo,
        rol: usuario.Rol,
      },
      config.jwt.secret,
      { expiresIn: '24h' }
    );

    return {
      token,
      usuario: this.sinPassword(usuario),
    };
  }

  async getProfile(id: string): Promise<UsuarioResponse | null> {
    const usuario = await usuarioDAO.findById(id);
    if (!usuario) return null;
    return this.sinPassword(usuario);
  }

  async googleLogin(googleUser: GoogleUserInfo): Promise<{ token: string; usuario: UsuarioResponse }> {
    // Buscar usuario por email de Google
    let usuario = await usuarioDAO.findByCorreo(googleUser.email);

    if (!usuario) {
      // Crear nuevo usuario Google
      const id = await usuarioDAO.getNextId();
      await usuarioDAO.create({
        nombre: googleUser.name,
        correo: googleUser.email,
        contrasena: undefined,  // Google users no password
        rol: RolUsuario.DUENO,
        telefono: undefined,
        id,
      });
      usuario = await usuarioDAO.findById(id);
    }

    if (!usuario) {
      throw new Error('Error al procesar usuario de Google');
    }

    // Generar JWT
    const token = jwt.sign(
      { id: usuario.Id, correo: usuario.Correo, rol: usuario.Rol },
      config.jwt.secret,
      { expiresIn: '24h' }
    );

    return { token, usuario: this.sinPassword(usuario) };
  }

  private sinPassword(usuario: Usuario): UsuarioResponse {
    const { ContrasenaHash, ...rest } = usuario;
    // Convert to camelCase for API response
    return {
      id: rest.Id,
      nombre: rest.Nombre,
      correo: rest.Correo,
      rol: rest.Rol,
      telefono: rest.Telefono,
      avatar: rest.Avatar,
      fechaRegistro: rest.FechaRegistro,
      ultimoLogin: rest.UltimoLogin,
    };
  }
}

export const usuarioService = new UsuarioService();