-- Adds tracking columns and RPCs for alert resends + snoozing.
CREATE EXTENSION IF NOT EXISTS net;

ALTER TABLE public.performance_alerts
ADD COLUMN IF NOT EXISTS resolved BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS snoozed_until TIMESTAMPTZ;

CREATE OR REPLACE FUNCTION public.retrigger_performance_alert(p_alert_id UUID)
RETURNS JSONB AS $$
DECLARE
  alert_row RECORD;
  edge_url TEXT := current_setting('app.settings.edge_notify_url', true);
  service_key TEXT := current_setting('app.settings.edge_notify_service_key', true);
  payload JSONB;
  response JSONB;
  status_code INT;
BEGIN
  SELECT id, type, message, metric, value, threshold, metadata
  INTO alert_row
  FROM public.performance_alerts
  WHERE id = p_alert_id
  FOR UPDATE;

  IF alert_row IS NULL THEN
    RAISE EXCEPTION 'Alert % not found', p_alert_id;
  END IF;

  IF edge_url IS NULL OR service_key IS NULL THEN
    RAISE NOTICE 'retrigger_performance_alert: missing edge_url/service_key';
    RETURN jsonb_build_object('success', false, 'error', 'edge function not configured');
  END IF;

  payload := jsonb_build_object(
    'alert_id', alert_row.id,
    'type', alert_row.type,
    'message', alert_row.message,
    'metric', alert_row.metric,
    'value', alert_row.value,
    'threshold', alert_row.threshold,
    'created_at', NOW(),
    'metadata', COALESCE(alert_row.metadata, '{}'::jsonb)
  );

  response := net.http_post(
    edge_url,
    payload::text,
    'application/json',
    jsonb_build_object('Authorization', 'Bearer ' || service_key)
  );

  status_code := (response->>'status_code')::INT;

  UPDATE public.performance_alerts
  SET
    notification_status = CASE WHEN status_code >= 400 THEN 'failed' ELSE 'sent' END,
    notified_at = NOW(),
    resolved = FALSE
  WHERE id = p_alert_id;

  RETURN jsonb_build_object(
    'success', status_code < 400,
    'status_code', status_code,
    'edge_response', response
  );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.snooze_performance_alert(p_alert_id UUID, p_minutes INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE public.performance_alerts
  SET
    snoozed_until = NOW() + (p_minutes || ' minutes')::INTERVAL
  WHERE id = p_alert_id;
END;
$$ LANGUAGE plpgsql;
