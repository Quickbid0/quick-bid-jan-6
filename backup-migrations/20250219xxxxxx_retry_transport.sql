CREATE OR REPLACE FUNCTION public.retry_delivery_transport(p_log_id UUID)
RETURNS JSONB AS $$
DECLARE
  log_row RECORD;
  alert_row RECORD;
  edge_url TEXT := current_setting('app.settings.edge_notify_url', true);
  service_key TEXT := current_setting('app.settings.edge_notify_service_key', true);
  payload JSONB;
  response JSONB;
  status_code INT;
BEGIN
  SELECT alert_id, transport, message, metadata
  INTO log_row
  FROM public.alert_delivery_logs
  WHERE id = p_log_id
  FOR UPDATE;

  IF log_row IS NULL THEN
    RAISE EXCEPTION 'Log entry % not found', p_log_id;
  END IF;

  SELECT id, type, metric, value, threshold, created_at
  INTO alert_row
  FROM public.performance_alerts
  WHERE id = log_row.alert_id;

  IF alert_row IS NULL THEN
    RAISE EXCEPTION 'Alert % not found', log_row.alert_id;
  END IF;

  IF edge_url IS NULL OR service_key IS NULL THEN
    RAISE NOTICE 'retry_delivery_transport: missing edge_url/service_key';
    RETURN jsonb_build_object('success', false, 'error', 'edge function not configured');
  END IF;

  payload := jsonb_build_object(
    'alert_id', alert_row.id,
    'type', alert_row.type,
    'message', log_row.message,
    'metric', alert_row.metric,
    'value', alert_row.value,
    'threshold', alert_row.threshold,
    'created_at', alert_row.created_at,
    'metadata', jsonb_build_object(
      'retry_transport', log_row.transport,
      'override_transport', log_row.transport,
      'override_channel', log_row.metadata->>'channel'
    )
  );

  response := net.http_post(
    edge_url,
    payload::text,
    'application/json',
    jsonb_build_object('Authorization', 'Bearer ' || service_key)
  );

  status_code := (response->>'status_code')::INT;

  RETURN jsonb_build_object(
    'success', status_code < 400,
    'status_code', status_code,
    'edge_response', response
  );
END;
$$ LANGUAGE plpgsql;
