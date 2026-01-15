CREATE TABLE IF NOT EXISTS public.growth_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  interest TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_growth_leads_interest ON public.growth_leads(interest);
