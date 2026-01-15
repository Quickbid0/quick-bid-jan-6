export type TicketStatus = 'open' | 'in_progress' | 'waiting_user' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'normal' | 'high' | 'urgent';
export type TicketCategory = 'general' | 'payment' | 'kyc' | 'auction' | 'technical';

export interface Ticket {
  id: string;
  user_id: string;
  subject: string;
  category: TicketCategory;
  status: TicketStatus;
  priority: TicketPriority;
  assigned_to: string | null;
  role?: string;
  meta?: {
    description?: string;
    [key: string]: any;
  };
  last_update_at: string;
  created_at: string;
}

export interface TicketComment {
  id: string;
  ticket_id: string;
  author_id: string;
  author_role: string;
  message: string;
  is_internal: boolean;
  created_at: string;
}

export interface TicketAttachment {
  id: string;
  ticket_id: string;
  file_url: string;
  file_type: string;
  size_bytes: number;
  created_at: string;
}

export interface CreateTicketDTO {
  user_id: string;
  subject: string;
  category: string;
  description: string;
  priority?: TicketPriority;
}

export interface TicketFilters {
  category?: string;
  priority?: string;
  status?: string;
  mine?: boolean;
  assigned_to?: string;
}
