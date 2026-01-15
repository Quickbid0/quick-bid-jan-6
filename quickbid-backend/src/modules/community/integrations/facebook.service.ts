export interface FacebookPublishResult {
  postId: string;
}

export const FacebookService = {
  async publishToPage(message: string, link?: string): Promise<FacebookPublishResult> {
    // Stub implementation: log and return fake ID
    console.log('[FacebookService] publishToPage', { message, link });
    return { postId: 'facebook-mock-id' };
  },
};
