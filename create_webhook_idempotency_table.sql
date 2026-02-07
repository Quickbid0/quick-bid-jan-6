-- Create table for webhook idempotency
-- This prevents duplicate processing of Razorpay webhooks

CREATE TABLE IF NOT EXISTS processed_webhook_events (
    id SERIAL PRIMARY KEY,
    razorpay_id VARCHAR(255) NOT NULL UNIQUE, -- payment_id or refund_id
    event_type VARCHAR(100) NOT NULL, -- payment.captured, payment.failed, refund.created
    event_data JSONB, -- Full webhook payload for debugging
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_processed_webhook_events_razorpay_id ON processed_webhook_events(razorpay_id);
CREATE INDEX IF NOT EXISTS idx_processed_webhook_events_event_type ON processed_webhook_events(event_type);

-- Prevent concurrent inserts of the same razorpay_id
-- This is critical for idempotency
ALTER TABLE processed_webhook_events 
ADD CONSTRAINT unique_razorpay_id UNIQUE (razorpay_id);

COMMENT ON TABLE processed_webhook_events IS 'Tracks processed Razorpay webhook events to ensure idempotency';
COMMENT ON COLUMN processed_webhook_events.razorpay_id IS 'Razorpay payment_id or refund_id - must be unique';
COMMENT ON COLUMN processed_webhook_events.event_type IS 'Webhook event type (payment.captured, payment.failed, refund.created)';
