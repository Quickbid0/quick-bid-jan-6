export interface WhatsappBroadcastResult {
  messageId: string;
}

export const WhatsappService = {
  async sendBroadcast(message: string, links: string[]): Promise<WhatsappBroadcastResult> {
    // Stub implementation: log and return fake ID
    console.log('[WhatsappService] sendBroadcast', { message, links });
    return { messageId: 'whatsapp-mock-id' };
  },
};
