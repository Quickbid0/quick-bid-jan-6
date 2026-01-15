import twilio, { Twilio } from 'twilio';

let cachedClient: Twilio | null = null;

export function getTwilioClient(): Twilio {
  if (cachedClient) return cachedClient;

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!accountSid || !authToken) {
    throw new Error('Twilio credentials are not configured. Please set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN.');
  }

  cachedClient = twilio(accountSid, authToken);
  return cachedClient;
}
