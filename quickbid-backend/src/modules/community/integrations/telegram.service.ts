export interface TelegramBroadcastResult {
  messageId: string;
}

export const TelegramService = {
  async sendBroadcast(message: string, links: string[]): Promise<TelegramBroadcastResult> {
    // Stub implementation: log and return fake ID
    console.log('[TelegramService] sendBroadcast', { message, links });
    return { messageId: 'telegram-mock-id' };
  },
};
