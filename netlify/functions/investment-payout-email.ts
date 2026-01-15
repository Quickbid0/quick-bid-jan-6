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
    const FROM = process.env.INVESTOR_FROM_EMAIL as string;

    if (!SENDGRID_API_KEY || !FROM) return json(500, { error: 'Email settings missing' });
    sgMail.setApiKey(SENDGRID_API_KEY);

    const body = JSON.parse(event.body || '{}');
    const {
      name,
      email,
      amount,
      acct_last4,
      txn_ref,
    } = body || {};

    if (!email || !amount) {
      return json(400, { error: 'email and amount are required' });
    }

    const subject = 'QuickMela — Your investment payout has been processed';

    const textLines = [
      `Hi ${name || 'Investor'},`,
      '',
      `Your QuickMela payout of 

 has been processed to your bank account${acct_last4 ? ` ending ${acct_last4}` : ''}.`,
      txn_ref ? `Txn ref: ${txn_ref}.` : '',
      '',
      'If you have any questions, please reply to this email.',
      '',
      'Regards,',
      'QuickMela Team',
    ].filter(Boolean).join('\n');

    await sgMail.send({
      to: email,
      from: FROM,
      subject,
      text: textLines,
    });

    return json(200, { ok: true });
  } catch (e: any) {
    console.error('investment-payout-email error', e);
    return json(500, { error: e?.message || 'Internal error' });
  }
};
