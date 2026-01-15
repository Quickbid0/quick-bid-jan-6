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
      plan_type,
      investment_id,
    } = body || {};

    if (!email || !amount || !plan_type) {
      return json(400, { error: 'email, amount, and plan_type are required' });
    }

    const subject = 'QuickMela — We received your investment application';

    const textLines = [
      `Hi ${name || 'Investor'},`,
      '',
      `Thanks for applying to invest 

 in QuickMela (Plan: ${plan_type}).`,
      '',
      'We have received your KYC details and application. Our team will review and contact you within 48 hours.',
      '',
      'Next steps:',
      '1) Sign the Investment Agreement',
      '2) Transfer funds to the specified account (we will share bank and UTR details)',
      '3) We will confirm activation and begin payouts as per plan.',
      '',
      investment_id ? `Your reference ID: ${investment_id}` : '',
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
    console.error('investment-application-email error', e);
    return json(500, { error: e?.message || 'Internal error' });
  }
};
