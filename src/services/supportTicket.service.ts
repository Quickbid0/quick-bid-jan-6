// 🎫 SUPPORT TICKET SYSTEM
// src/services/supportTicket.service.ts

export interface SupportTicket {
  id: string;
  userId?: string;
  email: string;
  category: TicketCategory;
  priority: TicketPriority;
  subject: string;
  description: string;
  status: TicketStatus;
  assignedTo?: string;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  satisfactionScore?: number;
  notes: TicketNote[];
  attachments: TicketAttachment[];
}

export enum TicketCategory {
  AUTHENTICATION = 'authentication',
  ACCOUNT_ISSUES = 'account_issues',
  PAYMENT_PROBLEMS = 'payment_problems',
  SELLER_SUPPORT = 'seller_support',
  BUYER_SUPPORT = 'buyer_support',
  TECHNICAL_ISSUES = 'technical_issues',
  BILLING_INQUIRIES = 'billing_inquiries',
  REPORT_ABUSE = 'report_abuse',
  GENERAL_INQUIRY = 'general_inquiry'
}

export enum TicketPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
  CRITICAL = 'critical'
}

export enum TicketStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  PENDING_CUSTOMER = 'pending_customer',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
  ESCALATED = 'escalated'
}

export interface TicketNote {
  id: string;
  author: string;
  content: string;
  createdAt: Date;
  isInternal: boolean;
}

export interface TicketAttachment {
  id: string;
  filename: string;
  url: string;
  size: number;
  uploadedAt: Date;
  uploadedBy: string;
}

export class SupportTicketService {
  private tickets: Map<string, SupportTicket> = new Map();
  private ticketCounter = 1;

  // Create a new support ticket
  async createTicket(
    email: string,
    category: TicketCategory,
    priority: TicketPriority,
    subject: string,
    description: string,
    userId?: string
  ): Promise<SupportTicket> {
    const ticket: SupportTicket = {
      id: `TKT-${this.ticketCounter.toString().padStart(6, '0')}`,
      userId,
      email,
      category,
      priority,
      subject,
      description,
      status: TicketStatus.OPEN,
      createdAt: new Date(),
      updatedAt: new Date(),
      notes: [],
      attachments: []
    };

    this.tickets.set(ticket.id, ticket);
    this.ticketCounter++;

    // Store in localStorage for now (will be replaced with backend API)
    const tickets = JSON.parse(localStorage.getItem('supportTickets') || '[]');
    tickets.push(ticket);
    localStorage.setItem('supportTickets', JSON.stringify(tickets));

    console.log('🎫 Support ticket created:', ticket.id, ticket.subject);
    return ticket;
  }

  // Update ticket status
  async updateTicketStatus(
    ticketId: string,
    status: TicketStatus,
    assignedTo?: string,
    note?: string
  ): Promise<SupportTicket> {
    const ticket = this.tickets.get(ticketId);
    if (!ticket) {
      throw new Error(`Ticket ${ticketId} not found`);
    }

    ticket.status = status;
    ticket.updatedAt = new Date();
    
    if (assignedTo) {
      ticket.assignedTo = assignedTo;
    }
    
    if (note) {
      ticket.notes.push({
        id: `note-${Date.now()}`,
        author: 'system',
        content: note,
        createdAt: new Date(),
        isInternal: true
      });
    }

    if (status === TicketStatus.RESOLVED) {
      ticket.resolvedAt = new Date();
    }

    this.tickets.set(ticketId, ticket);
    
    // Update localStorage
    const tickets = JSON.parse(localStorage.getItem('supportTickets') || '[]');
    const ticketIndex = tickets.findIndex(t => t.id === ticketId);
    if (ticketIndex !== -1) {
      tickets[ticketIndex] = ticket;
      localStorage.setItem('supportTickets', JSON.stringify(tickets));
    }

    console.log('🎫 Ticket status updated:', ticketId, status);
    return ticket;
  }

  // Add note to ticket
  async addNote(
    ticketId: string,
    content: string,
    author: string,
    isInternal: boolean = false
  ): Promise<void> {
    const ticket = this.tickets.get(ticketId);
    if (!ticket) {
      throw new Error(`Ticket ${ticketId} not found`);
    }

    const note: TicketNote = {
      id: `note-${Date.now()}`,
      author,
      content,
      createdAt: new Date(),
      isInternal
    };

    ticket.notes.push(note);
    ticket.updatedAt = new Date();

    // Update localStorage
    const tickets = JSON.parse(localStorage.getItem('supportTickets') || '[]');
    const ticketIndex = tickets.findIndex(t => t.id === ticketId);
    if (ticketIndex !== -1) {
      tickets[ticketIndex] = ticket;
      localStorage.setItem('supportTickets', JSON.stringify(tickets));
    }

    console.log('🎫 Note added to ticket:', ticketId);
  }

  // Add attachment to ticket
  async addAttachment(
    ticketId: string,
    filename: string,
    url: string,
    size: number,
    uploadedBy: string
  ): Promise<void> {
    const ticket = this.tickets.get(ticketId);
    if (!ticket) {
      throw new Error(`Ticket ${ticketId} not found`);
    }

    const attachment: TicketAttachment = {
      id: `att-${Date.now()}`,
      filename,
      url,
      size,
      uploadedAt: new Date(),
      uploadedBy
    };

    ticket.attachments.push(attachment);
    ticket.updatedAt = new Date();

    // Update localStorage
    const tickets = JSON.parse(localStorage.getItem('supportTickets') || '[]');
    const ticketIndex = tickets.findIndex(t => t.id === ticketId);
    if (ticketIndex !== -1) {
      tickets[ticketIndex] = ticket;
      localStorage.setItem('supportTickets', JSON.stringify(tickets));
    }

    console.log('🎫 Attachment added to ticket:', ticketId, filename);
  }

  // Get ticket by ID
  async getTicket(ticketId: string): Promise<SupportTicket | null> {
    const ticket = this.tickets.get(ticketId);
    return ticket || null;
  }

  // List all tickets with filtering
  async listTickets(options: {
    page?: number;
    limit?: number;
    category?: TicketCategory;
    priority?: TicketPriority;
    status?: TicketStatus;
    assignedTo?: string;
    userId?: string;
  } = {}): Promise<{ tickets: SupportTicket[], total: number }> {
    const {
      page = 1,
      limit = 50,
      category,
      priority,
      status,
      assignedTo,
      userId
    } = options;

    // Get tickets from localStorage (will be replaced with backend API)
    const tickets = JSON.parse(localStorage.getItem('supportTickets') || '[]');
    
    let filteredTickets = tickets;

    // Apply filters
    if (category) {
      filteredTickets = filteredTickets.filter(t => t.category === category);
    }
    if (priority) {
      filteredTickets = filteredTickets.filter(t => t.priority === priority);
    }
    if (status) {
      filteredTickets = filteredTickets.filter(t => t.status === status);
    }
    if (assignedTo) {
      filteredTickets = filteredTickets.filter(t => t.assignedTo === assignedTo);
    }
    if (userId) {
      filteredTickets = filteredTickets.filter(t => t.userId === userId);
    }

    // Sort by creation date (newest first)
    filteredTickets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedTickets = filteredTickets.slice(startIndex, endIndex);

    return {
      tickets: paginatedTickets,
      total: filteredTickets.length
    };
  }

  // Get ticket statistics
  async getTicketStats(): Promise<{
    total: number;
    byCategory: Record<TicketCategory, number>;
    byPriority: Record<TicketPriority, number>;
    byStatus: Record<TicketStatus, number>;
    openTickets: number;
    resolvedTickets: number;
    averageResolutionTime: number;
    customerSatisfaction: number;
  }> {
    const tickets = JSON.parse(localStorage.getItem('supportTickets') || '[]');

    const stats = {
      total: tickets.length,
      byCategory: {} as Record<TicketCategory, number>,
      byPriority: {} as Record<TicketPriority, number>,
      byStatus: {} as Record<TicketStatus, number>,
      openTickets: 0,
      resolvedTickets: 0,
      averageResolutionTime: 0,
      customerSatisfaction: 0
    };

    // Calculate statistics
    tickets.forEach(ticket => {
      stats.byCategory[ticket.category] = (stats.byCategory[ticket.category] || 0) + 1;
      stats.byPriority[ticket.priority] = (stats.byPriority[ticket.priority] || 0) + 1;
      stats.byStatus[ticket.status] = (stats.byStatus[ticket.status] || 0) + 1;
      
      if (ticket.status === TicketStatus.OPEN || ticket.status === TicketStatus.IN_PROGRESS) {
        stats.openTickets++;
      }
      
      if (ticket.status === TicketStatus.RESOLVED) {
        stats.resolvedTickets++;
        
        if (ticket.resolvedAt && ticket.createdAt) {
          const resolutionTime = ticket.resolvedAt.getTime() - ticket.createdAt.getTime();
          stats.averageResolutionTime += resolutionTime;
        }
        
        if (ticket.satisfactionScore) {
          stats.customerSatisfaction += ticket.satisfactionScore;
        }
      }
    });

    // Calculate averages
    if (stats.resolvedTickets > 0) {
      stats.averageResolutionTime = stats.averageResolutionTime / stats.resolvedTickets / (1000 * 60); // Convert to minutes
      stats.customerSatisfaction = stats.customerSatisfaction / stats.resolvedTickets;
    }

    return stats;
  }

  // Search tickets
  async searchTickets(query: string, options: {
    page?: number;
    limit?: number;
  } = {}): Promise<{ tickets: SupportTicket[], total: number }> {
    const { page = 1, limit = 50 } = options;
    const tickets = JSON.parse(localStorage.getItem('supportTickets') || '[]');

    const searchResults = tickets.filter(ticket => 
      ticket.subject.toLowerCase().includes(query.toLowerCase()) ||
      ticket.description.toLowerCase().includes(query.toLowerCase()) ||
      ticket.email.toLowerCase().includes(query.toLowerCase())
    );

    // Sort by creation date (newest first)
    searchResults.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedTickets = searchResults.slice(startIndex, endIndex);

    return {
      tickets: paginatedTickets,
      total: searchResults.length
    };
  }

  // Escalate ticket
  async escalateTicket(
    ticketId: string,
    reason: string,
    escalatedTo: string
  ): Promise<SupportTicket> {
    const ticket = this.tickets.get(ticketId);
    if (!ticket) {
      throw new Error(`Ticket ${ticketId} not found`);
    }

    ticket.status = TicketStatus.ESCALATED;
    ticket.assignedTo = escalatedTo;
    ticket.updatedAt = new Date();

    // Add escalation note
    ticket.notes.push({
      id: `note-${Date.now()}`,
      author: 'system',
      content: `Escalated to ${escalatedTo}. Reason: ${reason}`,
      createdAt: new Date(),
      isInternal: true
    });

    this.tickets.set(ticketId, ticket);
    
    // Update localStorage
    const tickets = JSON.parse(localStorage.getItem('supportTickets') || '[]');
    const ticketIndex = tickets.findIndex(t => t.id === ticketId);
    if (ticketIndex !== -1) {
      tickets[ticketIndex] = ticket;
      localStorage.setItem('supportTickets', JSON.stringify(tickets));
    }

    console.log('🎫 Ticket escalated:', ticketId, escalatedTo);
    return ticket;
  }

  // Close ticket with satisfaction score
  async closeTicket(
    ticketId: string,
    satisfactionScore: number,
    resolutionNote?: string
  ): Promise<SupportTicket> {
    const ticket = this.tickets.get(ticketId);
    if (!ticket) {
      throw new Error(`Ticket ${ticketId} not found`);
    }

    ticket.status = TicketStatus.CLOSED;
    ticket.resolvedAt = new Date();
    ticket.satisfactionScore = satisfactionScore;
    ticket.updatedAt = new Date();

    if (resolutionNote) {
      ticket.notes.push({
        id: `note-${Date.now()}`,
        author: 'system',
        content: resolutionNote,
        createdAt: new Date(),
        isInternal: true
      });
    }

    this.tickets.set(ticketId, ticket);
    
    // Update localStorage
    const tickets = JSON.parse(localStorage.getItem('supportTickets') || '[]');
    const ticketIndex = tickets.findIndex(t => t.id === ticketId);
    if (ticketIndex !== -1) {
      tickets[ticketIndex] = ticket;
      localStorage.setItem('supportTickets', JSON.stringify(tickets));
    }

    console.log('🎫 Ticket closed:', ticketId, satisfactionScore);
    return ticket;
  }

  // Get tickets assigned to agent
  async getAgentTickets(agentName: string): Promise<SupportTicket[]> {
    const tickets = JSON.parse(localStorage.getItem('supportTickets') || '[]');
    return tickets.filter(ticket => ticket.assignedTo === agentName);
  }

  // Get tickets by user
  async getUserTickets(userId: string): Promise<SupportTicket[]> {
    const tickets = JSON.parse(localStorage.getItem('supportTickets') || '[]');
    return tickets.filter(ticket => ticket.userId === userId);
  }
}

export default SupportTicketService;
