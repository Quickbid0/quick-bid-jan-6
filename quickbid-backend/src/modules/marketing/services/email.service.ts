import sgMail from '@sendgrid/mail';

const apiKey = process.env.SENDGRID_API_KEY;
const fromEmail = process.env.MARKETING_FROM_EMAIL;

if (!apiKey) {
  console.warn('[marketing] SENDGRID_API_KEY is not set. Email sends will be no-ops.');
} else {
  sgMail.setApiKey(apiKey);
}

export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendMarketingEmail(params: SendEmailParams): Promise<void> {
  if (!apiKey || !fromEmail) {
    console.warn('[marketing] Missing SENDGRID_API_KEY or MARKETING_FROM_EMAIL; skipping email');
    return;
  }

  await sgMail.send({
    to: params.to,
    from: fromEmail,
    subject: params.subject,
    html: params.html,
  });
}
