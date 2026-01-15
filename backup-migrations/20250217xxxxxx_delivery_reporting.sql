CREATE TABLE IF NOT EXISTS public.alert_delivery_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id UUID NOT NULL REFERENCES public.performance_alerts(id) ON DELETE CASCADE,
  transport TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('sent', 'failed', 'skipped')),
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  latency_ms INTEGER,
  retry_count INTEGER NOT NULL DEFAULT 0,
  message TEXT,
  metadata JSONB DEFAULT '{}'::JSONB
);

CREATE INDEX IF NOT EXISTS idx_alert_delivery_logs_alert_id ON public.alert_delivery_logs(alert_id);
CREATE INDEX IF NOT EXISTS idx_alert_delivery_logs_status ON public.alert_delivery_logs(status);
