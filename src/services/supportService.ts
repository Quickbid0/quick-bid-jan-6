import { supabase } from '../config/supabaseClient';
import { Ticket, CreateTicketDTO, TicketFilters, TicketStatus, TicketComment, TicketAttachment } from '../types/support';

export const supportService = {
  /**
   * Get tickets with optional filters
   */
  async getTickets(userId?: string, filters?: TicketFilters) {
    let query = supabase
      .from('tickets')
      .select('*')
      .order('last_update_at', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    }

    if (filters) {
      if (filters.category) {
        query = query.eq('category', filters.category);
      }
      if (filters.priority) {
        query = query.eq('priority', filters.priority);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.assigned_to) {
        query = query.eq('assigned_to', filters.assigned_to);
      }
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as Ticket[];
  },

  /**
   * Get a single ticket by ID
   */
  async getTicketById(id: string) {
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as Ticket;
  },

  /**
   * Get comments for a ticket
   */
  async getComments(ticketId: string) {
    const { data, error } = await supabase
      .from('ticket_comments')
      .select('*')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data as TicketComment[];
  },

  /**
   * Get attachments for a ticket
   */
  async getAttachments(ticketId: string) {
    const { data, error } = await supabase
      .from('ticket_attachments')
      .select('*')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data as TicketAttachment[];
  },

  /**
   * Create a new ticket
   */
  async createTicket(dto: CreateTicketDTO) {
    const { error } = await supabase.from('tickets').insert([
      {
        user_id: dto.user_id,
        role: 'user',
        subject: dto.subject,
        category: dto.category,
        status: 'open',
        priority: dto.priority || 'normal',
        meta: { description: dto.description },
        created_at: new Date().toISOString(),
        last_update_at: new Date().toISOString()
      }
    ]);

    if (error) throw error;
  },

  /**
   * Add a comment to a ticket
   */
  async addComment(ticketId: string, authorId: string, authorRole: string, message: string, isInternal: boolean = false) {
    const { error } = await supabase.from('ticket_comments').insert([
      {
        ticket_id: ticketId,
        author_id: authorId,
        author_role: authorRole,
        message: message.trim(),
        is_internal: isInternal,
        created_at: new Date().toISOString()
      }
    ]);

    if (error) throw error;

    // Update ticket last_update_at
    await this.updateTicket(ticketId, {});
  },

  /**
   * Upload attachment and link to ticket
   */
  async uploadAttachment(ticketId: string, userId: string, file: File) {
    const path = `${userId}/${ticketId}/${Date.now()}_${file.name}`;
    const uploadRes = await supabase.storage.from('ticket-attachments').upload(path, file, {
      cacheControl: '3600',
      upsert: false
    });
    if (uploadRes.error) throw uploadRes.error;

    const { error } = await supabase.from('ticket_attachments').insert([
      {
        ticket_id: ticketId,
        file_url: path,
        file_type: file.type || 'application/octet-stream',
        size_bytes: file.size,
        created_at: new Date().toISOString()
      }
    ]);

    if (error) throw error;
  },

  /**
   * Update a ticket (status, assignment, etc.)
   */
  async updateTicket(id: string, updates: Partial<Ticket>) {
    const { error } = await supabase
      .from('tickets')
      .update({
        ...updates,
        last_update_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Assign ticket to a specific admin (or current user)
   */
  async assignTicket(id: string, adminId: string) {
    return this.updateTicket(id, { assigned_to: adminId });
  },

  /**
   * Update ticket status
   */
  async updateStatus(id: string, status: TicketStatus) {
    return this.updateTicket(id, { status });
  }
};
