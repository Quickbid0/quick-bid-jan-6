-- Schedule the smart alert grouping job via pg_cron (runs every 3 minutes)
CREATE EXTENSION IF NOT EXISTS pg_cron;

SELECT cron.schedule(
  'smart_alert_grouping',
  '*/3 * * * *',
  $$
    SELECT public.build_smart_alert_groups(5);
  $$
);
