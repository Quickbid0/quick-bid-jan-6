-- Enables HTTP helpers and wires the analytics alert table to the Edge Function.
CREATE EXTENSION IF NOT EXISTS net;

CREATE OR REPLACE FUNCTION public.notify_performance_alert_edge()
RETURNS TRIGGER AS $$
DECLARE
  edge_url TEXT := current_setting('app.settings.edge_notify_url', true);
  service_key TEXT := current_setting('app.settings.edge_notify_service_key', true);
  payload JSONB;
  response JSONB;
  status_code INT;
BEGIN
  IF edge_url IS NULL OR service_key IS NULL THEN
    RAISE NOTICE 'notify_perf_alert: missing edge_url=% service_key=%', edge_url IS NOT NULL, service_key IS NOT NULL;
    RETURN NEW;
  END IF;

  payload := jsonb_build_object(
    'alert_id', NEW.id,
    'type', NEW.type,
    'message', NEW.message,
    'metric', NEW.metric,
    'value', NEW.value,
    'threshold', NEW.threshold,
    'created_at', NEW.created_at,
    'metadata', COALESCE(NEW.metadata, '{}'::jsonb)
  );

  response := net.http_post(
    edge_url,
    payload::text,
    'application/json',
    jsonb_build_object('Authorization', 'Bearer ' || service_key)
  );

  status_code := (response->>'status_code')::INT;

  UPDATE performance_alerts
  SET
    notification_status = CASE WHEN status_code >= 400 THEN 'failed' ELSE 'sent' END,
    notified_at = NOW()
  WHERE id = NEW.id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_notify_performance_alert ON performance_alerts;

CREATE TRIGGER trigger_notify_performance_alert
AFTER INSERT ON performance_alerts
FOR EACH ROW
EXECUTE FUNCTION public.notify_performance_alert_edge();
