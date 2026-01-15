CREATE OR REPLACE VIEW public.growth_lead_metrics AS
SELECT
  interest,
  event_type,
  COUNT(*) AS event_count,
  MAX(created_at) AS last_occurrence,
  MIN(created_at) AS first_occurrence
FROM public.growth_lead_events
GROUP BY interest, event_type
ORDER BY interest, event_type;

CREATE OR REPLACE VIEW public.growth_leads_summary AS
SELECT
  interest,
  COUNT(*) AS lead_count,
  MAX(created_at) FILTER (WHERE created_at IS NOT NULL) AS last_lead_at,
  MIN(created_at) FILTER (WHERE created_at IS NOT NULL) AS first_lead_at
FROM public.growth_leads
GROUP BY interest
ORDER BY interest;
