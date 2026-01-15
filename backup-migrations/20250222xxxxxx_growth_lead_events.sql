CREATE TABLE IF NOT EXISTS public.growth_lead_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  interest TEXT NOT NULL,
  page TEXT,
  event_type TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_growth_lead_events_interest ON public.growth_lead_events(interest);
CREATE INDEX IF NOT EXISTS idx_growth_lead_events_event_type ON public.growth_lead_events(event_type);
