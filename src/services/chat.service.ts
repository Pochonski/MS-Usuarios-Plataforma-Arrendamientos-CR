import { conversacionDAO } from '../dao/conversacion.dao';
import { mensajeDAO } from '../dao/mensaje.dao';
import { CreateConversacionDTO, CreateMensajeDTO, Conversacion, Mensaje, UpdateMensajeDTO } from '../models/types';
import { EstadoMensaje } from '../models/enums';

export class ConversacionService {
  async getAll(): Promise<Conversacion[]> {
    return conversacionDAO.findAll();
  }

  async getById(id: number): Promise<Conversacion | null> {
    return conversacionDAO.findById(id);
  }

  async getByUser(userId: number): Promise<Conversacion[]> {
    return conversacionDAO.findByUser(userId);
  }

  async getByProperty(propertyId: number): Promise<Conversacion[]> {
    return conversacionDAO.findByProperty(propertyId);
  }

  async createOrGet(data: CreateConversacionDTO): Promise<{ id: number; conversacion: Conversacion }> {
    // Check if conversation already exists
    const existing = await conversacionDAO.findExisting(data.participants, data.propertyId);
    if (existing) {
      return { id: existing.id, conversacion: existing };
    }

    // Create new conversation
    const id = await conversacionDAO.create(data);
    const conversacion = await conversacionDAO.findById(id);

    if (!conversacion) {
      throw new Error('Error al crear conversación');
    }

    return { id, conversacion };
  }

  async delete(id: number): Promise<boolean> {
    const conversacion = await conversacionDAO.findById(id);
    if (!conversacion) {
      throw new Error('Conversación no encontrada');
    }

    return conversacionDAO.delete(id);
  }
}

export class MensajeService {
  async getAll(): Promise<Mensaje[]> {
    return mensajeDAO.findAll();
  }

  async getById(id: number): Promise<Mensaje | null> {
    return mensajeDAO.findById(id);
  }

  async getByConversation(conversationId: number): Promise<Mensaje[]> {
    return mensajeDAO.findByConversation(conversationId);
  }

  async getByUser(userId: number): Promise<Mensaje[]> {
    return mensajeDAO.findByUser(userId);
  }

  async getUnreadByUser(userId: number): Promise<Mensaje[]> {
    return mensajeDAO.findUnreadByUser(userId);
  }

  async create(data: CreateMensajeDTO): Promise<{ id: number; mensaje: Mensaje }> {
    const id = await mensajeDAO.create(data);
    const mensaje = await mensajeDAO.findById(id);

    if (!mensaje) {
      throw new Error('Error al crear mensaje');
    }

    return { id, mensaje };
  }

  async markAsRead(id: number): Promise<boolean> {
    return mensajeDAO.update(id, { status: EstadoMensaje.LEIDO });
  }

  async markConversationAsRead(conversationId: number, userId: number): Promise<boolean> {
    return mensajeDAO.markAsRead(conversationId, userId);
  }

  async update(id: number, data: UpdateMensajeDTO): Promise<boolean> {
    return mensajeDAO.update(id, data);
  }

  async delete(id: number): Promise<boolean> {
    const mensaje = await mensajeDAO.findById(id);
    if (!mensaje) {
      throw new Error('Mensaje no encontrado');
    }

    return mensajeDAO.delete(id);
  }
}

export const conversacionService = new ConversacionService();
export const mensajeService = new MensajeService();