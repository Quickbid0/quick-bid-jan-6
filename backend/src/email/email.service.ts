import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailService {
  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    // TODO: Implement email sending
    console.log(`Sending welcome email to ${email}`);
  }

  async sendPasswordResetEmail(email: string, resetToken: string): Promise<void> {
    // TODO: Implement email sending
    console.log(`Sending password reset email to ${email}`);
  }
}
