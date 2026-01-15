import type { Handler } from '@netlify/functions';
import sgMail from '@sendgrid/mail';

const json = (statusCode: number, body: any) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

export const handler: Handler = async (event) => {
  try {
    if (event.httpMethod !== 'POST') return json(405, { error: 'Method Not Allowed' });
    const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY as string;
    const TO = process.env.INVESTOR_CONTACT_EMAIL as string;
    const DECK_URL = process.env.INVESTOR_DECK_URL as string | undefined;
    const CALENDLY_URL = process.env.INVESTOR_CALENDLY_URL as string | undefined;

    if (!SENDGRID_API_KEY || !TO) return json(500, { error: 'Email settings missing' });
    sgMail.setApiKey(SENDGRID_API_KEY);

    const body = JSON.parse(event.body || '{}');
    const { name, email, company, cheque_size, message } = body || {};

    const subject = `New Investor Lead: ${name || 'Unknown'} (${email || 'no email'})`;
    const lines = [
      `Name: ${name || '-'}\n`,
      `Email: ${email || '-'}\n`,
      `Company: ${company || '-'}\n`,
      `Cheque Size: ${cheque_size || '-'}\n`,
      `Message: ${message || '-'}\n`,
    ].join('');

    const nextSteps = [
      DECK_URL ? `Pitch Deck: ${DECK_URL}` : null,
      CALENDLY_URL ? `Schedule Call: ${CALENDLY_URL}` : null,
    ].filter(Boolean).join('\n');

    await sgMail.send({
      to: TO,
      from: TO,
      subject,
      text: `${lines}\n${nextSteps}`.trim(),
    });

    return json(200, { ok: true });
  } catch (e: any) {
    console.error('investor-lead-email error', e);
    return json(500, { error: e.message || 'Internal error' });
  }
};
