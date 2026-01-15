/// <reference lib="deno.ns" />
import { serve } from 'https://deno.land/std@0.203.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const APP_URL = Deno.env.get('NEXT_PUBLIC_APP_URL') ?? 'https://quick-bid-oct.supabase.co';
const API_SECRET = Deno.env.get('API_SECRET_KEY');
const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY');
const SENDGRID_FROM_EMAIL = Deno.env.get('MARKETING_FROM_EMAIL');
const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID');
const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN');
const TWILIO_FROM_NUMBER = Deno.env.get('TWILIO_FROM_NUMBER');
const PUSH_WEBHOOK_URL = Deno.env.get('PUSH_WEBHOOK_URL');

if (!SUPABASE_URL || !SERVICE_KEY || !API_SECRET) {
  console.error('Missing environment variables for notify-performance-alert function');
}

const supabase = createClient(SUPABASE_URL ?? '', SERVICE_KEY ?? '');

type NotificationPreference = {
  user_id: string;
  channel: string;
  type: 'email' | 'slack' | 'in_app' | 'sms' | 'push';
};

type AlertPayload = {
  alert_id: string;
  type?: 'info' | 'warning' | 'error';
  message: string;
  metric: string;
  value: number;
  threshold: number;
  created_at: string;
  metadata?: Record<string, any>;
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const authHeader = req.headers.get('authorization');
  if (!authHeader || authHeader !== `Bearer ${API_SECRET}`) {
    return new Response('Unauthorized', { status: 401, headers: corsHeaders });
  }

  try {
    const alert = (await req.json()) as AlertPayload;
    const { alert_id, type, message, metric, value, threshold, created_at } = alert;

    if (!alert_id) {
      return new Response('Missing alert_id', { status: 400, headers: corsHeaders });
    }

    const { data: preferences, error: subscribersError } = await supabase.rpc('get_alert_subscribers', {
      p_alert_type: 'performance_alert',
      p_severity: type || 'warning',
    });

    if (subscribersError) {
      console.error('Failed to load subscribers', subscribersError);
      return new Response('Failed to load subscribers', {
        status: 500,
        headers: corsHeaders,
      });
    }

    const sendResults = await Promise.allSettled(
      (preferences || []).map(async (pref: NotificationPreference) => {
        const messageBody = formatAlertPayload({
          ...alert,
          type: type ?? 'warning',
        }, pref.type);
        const metadata = {
          channel: pref.channel,
          alert_type: pref.type,
        };
        await executeTransport(alert_id, pref, messageBody, metadata, {
          metric,
          value,
          threshold,
        });
      })
    );

    const failed = sendResults.filter(
      (result: PromiseSettledResult<unknown>): result is PromiseRejectedResult => result.status === 'rejected'
    );

    await supabase
      .from('performance_alerts')
      .update({
        notified_at: new Date().toISOString(),
        notification_status: failed.length > 0 ? 'failed' : 'sent',
      })
      .eq('id', alert_id);

    return new Response(
      JSON.stringify({
        success: failed.length === 0,
        sent: sendResults.length - failed.length,
        failed: failed.length,
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('notify-performance-alert error', error);
    return new Response('Internal server error', {
      status: 500,
      headers: corsHeaders,
    });
  }
});

type TransportResult = {
  status: 'sent' | 'failed' | 'skipped';
  latency?: number;
  metadata?: Record<string, any>;
};

const logDelivery = async (
  alertId: string,
  transport: string,
  status: TransportResult['status'],
  latency?: number,
  retryCount = 0,
  message?: string,
  metadata: Record<string, any> = {}
) => {
  await supabase.from('alert_delivery_logs').insert([{
    alert_id: alertId,
    transport,
    status,
    latency_ms: latency,
    retry_count: retryCount,
    message,
    metadata: { ...metadata },
  }]);
};

const executeTransport = async (
  alertId: string,
  pref: NotificationPreference,
  body: string,
  metadata: Record<string, any>,
  payloadContext: Record<string, any>
) => {
  const start = Date.now();
  let result: TransportResult = { status: 'skipped' };
  const overrideTransport = metadata?.override_transport;
  const overrideChannel = metadata?.override_channel;
  if (overrideTransport && pref.type !== overrideTransport) {
    await logDelivery(alertId, pref.type, 'skipped', 0, 0, body, metadata);
    return;
  }
  if (overrideChannel && pref.channel !== overrideChannel) {
    await logDelivery(alertId, pref.type, 'skipped', 0, 0, body, metadata);
    return;
  }
  try {
    if (pref.type === 'email') {
      await sendEmail(pref.channel, `Performance Alert: ${payloadContext.metric}`, body);
      result = { status: 'sent' };
    } else if (pref.type === 'slack') {
      await sendSlackMessage(pref.channel, body);
      result = { status: 'sent' };
    } else if (pref.type === 'sms') {
      await sendSms(pref.channel, body);
      result = { status: 'sent' };
    } else if (pref.type === 'push') {
      await sendPush(pref.channel, body, payloadContext);
      result = { status: 'sent' };
    } else {
      await createInAppNotification(pref.user_id, 'Performance Alert', body, payloadContext);
      result = { status: 'sent' };
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    result = { status: 'failed', metadata: { error: message } };
  } finally {
    const latency = Date.now() - start;
    await logDelivery(alertId, pref.type, result.status, latency, 0, body, { ...metadata, ...result.metadata });
  }
};

async function sendEmail(to: string, subject: string, html: string) {
  if (!SENDGRID_API_KEY || !SENDGRID_FROM_EMAIL) {
    console.warn('SendGrid configuration missing, skipping email');
    return;
  }

  await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${SENDGRID_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [
        {
          to: [{ email: to }],
          subject,
        },
      ],
      from: { email: SENDGRID_FROM_EMAIL },
      content: [
        {
          type: 'text/plain',
          value: html,
        },
      ],
    }),
  });
}

async function sendSlackMessage(webhookUrl: string, message: string) {
  await fetch(webhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: message,
    }),
  });
}

async function sendSms(to: string, body: string) {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_FROM_NUMBER) {
    console.warn('Twilio configuration missing, skipping SMS');
    return;
  }

  const credentials = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);
  const payload = new URLSearchParams();
  payload.append('To', to);
  payload.append('From', TWILIO_FROM_NUMBER);
  payload.append('Body', body);

  await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: payload.toString(),
  });
}

async function sendPush(webhookUrl: string, message: string, metadata: Record<string, any>) {
  if (!PUSH_WEBHOOK_URL && !webhookUrl) {
    console.warn('Push webhook URL missing, skipping push');
    return;
  }

  await fetch(webhookUrl || PUSH_WEBHOOK_URL!, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
      metadata,
    }),
  });
}

async function createInAppNotification(userId: string, title: string, message: string, metadata: Record<string, any>) {
  await supabase.from('notifications').insert([
    {
      user_id: userId,
      title,
      message,
      metadata,
      read: false,
    },
  ]);
}

function formatAlertPayload(alert: AlertPayload, type: NotificationPreference['type']) {
  const timestamp = new Date(alert.created_at).toLocaleString();

  if (type === 'email') {
    return `Performance alert triggered:\nMetric: ${alert.metric}\nValue: ${alert.value} (threshold: ${alert.threshold})\nTime: ${timestamp}`;
  }

  if (type === 'slack') {
    return `🚨 *${alert.metric}* alert\nValue: ${alert.value} (threshold: ${alert.threshold})\n${alert.message}\n<${APP_URL}/performance/alerts/${alert.alert_id}|View in dashboard>`;
  }

  return `${alert.message} — ${alert.metric}=${alert.value} (threshold ${alert.threshold})`;
}
