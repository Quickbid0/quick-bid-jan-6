CREATE OR REPLACE VIEW public.delivery_health AS
SELECT
  transport,
  COUNT(*) FILTER (WHERE status = 'sent') AS sent_count,
  COUNT(*) FILTER (WHERE status = 'failed') AS failed_count,
  COUNT(*) FILTER (WHERE status = 'skipped') AS skipped_count,
  COUNT(*) AS total_count,
  ROUND(100.0 * SUM(CASE WHEN status = 'sent' THEN 1 ELSE 0 END) / NULLIF(COUNT(*), 0), 1) AS success_percentage,
  ROUND(AVG(latency_ms)) AS avg_latency_ms,
  MAX(sent_at) AS latest_delivery
FROM public.alert_delivery_logs
WHERE sent_at >= NOW() - INTERVAL '7 days'
GROUP BY transport;
