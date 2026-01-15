-- Smart alerts: clusters + flapping detection
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.smart_alert_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  root_metric TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'warning',
  window_start TIMESTAMPTZ NOT NULL,
  window_end TIMESTAMPTZ NOT NULL,
  alert_count INTEGER NOT NULL DEFAULT 0,
  context JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_smart_alert_groups_root_metric ON public.smart_alert_groups(root_metric);
CREATE INDEX IF NOT EXISTS idx_smart_alert_groups_window ON public.smart_alert_groups(window_start, window_end);

ALTER TABLE public.performance_alerts
  ADD COLUMN IF NOT EXISTS group_id UUID REFERENCES public.smart_alert_groups(id),
  ADD COLUMN IF NOT EXISTS is_flapping BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS flap_count INTEGER DEFAULT 0;

CREATE TABLE IF NOT EXISTS public.metric_alert_state (
  metric TEXT PRIMARY KEY,
  last_status TEXT,
  last_change_at TIMESTAMPTZ,
  flap_count_1h INTEGER NOT NULL DEFAULT 0
);

CREATE OR REPLACE FUNCTION public.build_smart_alert_groups(p_window_minutes INTEGER DEFAULT 5)
RETURNS VOID AS $$
DECLARE
  cutoff TIMESTAMPTZ := NOW() - (p_window_minutes || ' minutes')::INTERVAL;
  rec RECORD;
  new_group_id UUID;
  service_key TEXT;
BEGIN
  FOR rec IN
    SELECT
      metric,
      COALESCE(NULLIF(metadata->>'service', ''), 'global') AS service_key,
      MIN(created_at) AS window_start,
      MAX(created_at) AS window_end,
      COUNT(*) AS alert_count
    FROM public.performance_alerts
    WHERE created_at >= cutoff
      AND group_id IS NULL
    GROUP BY metric, COALESCE(NULLIF(metadata->>'service', ''), 'global')
    HAVING COUNT(*) >= 3
  LOOP
    INSERT INTO public.smart_alert_groups (
      root_metric, severity, window_start, window_end, alert_count, context
    ) VALUES (
      rec.metric,
      'warning',
      rec.window_start,
      rec.window_end,
      rec.alert_count,
      jsonb_build_object('service', rec.service_key)
    ) RETURNING id INTO new_group_id;

    UPDATE public.performance_alerts
    SET group_id = new_group_id
    WHERE metric = rec.metric
      AND created_at BETWEEN rec.window_start AND rec.window_end
      AND COALESCE(NULLIF(metadata->>'service', ''), 'global') = rec.service_key
      AND group_id IS NULL;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.detect_flapping_alert()
RETURNS TRIGGER AS $$
DECLARE
  state RECORD;
  now_ts TIMESTAMPTZ := NOW();
  one_hour_ago TIMESTAMPTZ := now_ts - INTERVAL '1 hour';
  new_flap_count INTEGER;
BEGIN
  SELECT * INTO state FROM public.metric_alert_state WHERE metric = NEW.metric;

  IF state IS NULL THEN
    INSERT INTO public.metric_alert_state(metric, last_status, last_change_at, flap_count_1h)
    VALUES (NEW.metric, NEW.type, now_ts, 0);
    RETURN NEW;
  END IF;

  IF state.last_change_at < one_hour_ago THEN
    UPDATE public.metric_alert_state
    SET last_status = NEW.type,
        last_change_at = now_ts,
        flap_count_1h = 0
    WHERE metric = NEW.metric;
    RETURN NEW;
  END IF;

  IF state.last_status IS DISTINCT FROM NEW.type THEN
    new_flap_count := state.flap_count_1h + 1;
    UPDATE public.metric_alert_state
    SET last_status = NEW.type,
        last_change_at = now_ts,
        flap_count_1h = new_flap_count
    WHERE metric = NEW.metric;

    IF new_flap_count >= 3 THEN
      UPDATE public.performance_alerts
      SET is_flapping = TRUE,
          flap_count = new_flap_count
      WHERE id = NEW.id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_detect_flapping_alert ON public.performance_alerts;

CREATE TRIGGER trigger_detect_flapping_alert
AFTER INSERT ON public.performance_alerts
FOR EACH ROW
EXECUTE FUNCTION public.detect_flapping_alert();
