import { Router, Request, Response } from 'express';
import { sendMarketingEmail } from '../services/email.service';

export const emailRouter = Router();

emailRouter.post('/email', async (req: Request, res: Response) => {
  try {
    const { campaignId, subject, body, recipients } = req.body || {};
    if (!campaignId || !subject || !body) {
      return res.status(400).json({ message: 'campaignId, subject, and body are required' });
    }

    const toList = Array.isArray(recipients) && recipients.length > 0 ? recipients : ['marketing-ops@quickbid.example.com'];
    const html = `
      <p><strong>Campaign ID:</strong> ${campaignId}</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <p>${body}</p>
    `;

    await Promise.all(
      toList.map((to) => sendMarketingEmail({
        to,
        subject: `[Campaign ${campaignId}] ${subject}`,
        html,
      }))
    );

    res.status(201).json({ campaignId, emailedTo: toList });
  } catch (err) {
    console.error('marketing email error', err);
    res.status(500).json({ message: 'Failed to queue marketing email', error: (err as Error).message });
  }
});
