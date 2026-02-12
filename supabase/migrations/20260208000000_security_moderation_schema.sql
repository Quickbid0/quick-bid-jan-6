-- Security and Moderation System Database Schema
-- Migration: 20260208000000_security_moderation_schema.sql

-- 1. User Security Status Table
-- Tracks overall security state of a user
CREATE TABLE IF NOT EXISTS user_security_status (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  risk_score INT DEFAULT 0 CHECK (risk_score >= 0),
  risk_level TEXT CHECK (risk_level IN ('low','medium','high','critical')) DEFAULT 'low',
  is_restricted BOOLEAN DEFAULT FALSE,
  restriction_reason TEXT,
  restricted_at TIMESTAMP WITH TIME ZONE,
  restriction_expires_at TIMESTAMP WITH TIME ZONE,
  verification_required BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Security Events Table
-- Every suspicious activity is logged here
CREATE TABLE IF NOT EXISTS security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  -- login_anomaly, mass_reports, sensitive_post, device_change, api_abuse
  severity TEXT CHECK (severity IN ('low','medium','high')) NOT NULL,
  metadata JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Content Reports Table
-- Smart reporting system (anti-mass-report)
CREATE TABLE IF NOT EXISTS content_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES users(id) ON DELETE CASCADE,
  reported_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL,
  -- post, comment, auction, profile, product
  content_id UUID NOT NULL,
  report_reason TEXT NOT NULL,
  report_weight INT DEFAULT 1 CHECK (report_weight > 0),
  ip_hash TEXT,
  device_hash TEXT,
  is_coordinated BOOLEAN DEFAULT FALSE,
  status TEXT CHECK (status IN ('pending','reviewed','dismissed','actioned')) DEFAULT 'pending',
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Report Clusters Table
-- Detects mass / coordinated reporting attacks
CREATE TABLE IF NOT EXISTS report_clusters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL,
  cluster_score INT DEFAULT 0 CHECK (cluster_score >= 0),
  suspected_attack BOOLEAN DEFAULT FALSE,
  analysis JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Account Restrictions Table
-- Actual enforcement records (never silent)
CREATE TABLE IF NOT EXISTS account_restrictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  restriction_type TEXT NOT NULL,
  -- warning, visibility_limit, temp_restrict, verify_required, suspend, permanent_ban
  reason TEXT NOT NULL,
  applied_by UUID REFERENCES users(id) ON DELETE SET NULL,
  start_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  appeal_allowed BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Identity Verifications Table
-- Government ID verification layer
CREATE TABLE IF NOT EXISTS identity_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  verification_type TEXT NOT NULL,
  -- aadhaar, pan, dl, passport, gst, company_gst
  document_number_hash TEXT,
  document_url TEXT,
  selfie_url TEXT,
  extracted_name TEXT,
  extracted_dob DATE,
  status TEXT CHECK (status IN ('pending','verified','rejected')) DEFAULT 'pending',
  rejection_reason TEXT,
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  ai_match_score DECIMAL(3,2),
  manual_review_required BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Content Appeals Table
-- User appeals for restrictions or takedowns
CREATE TABLE IF NOT EXISTS content_appeals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  related_restriction_id UUID REFERENCES account_restrictions(id) ON DELETE SET NULL,
  related_report_id UUID REFERENCES content_reports(id) ON DELETE SET NULL,
  appeal_type TEXT NOT NULL,
  -- restriction_appeal, content_removal_appeal, verification_appeal
  explanation TEXT NOT NULL,
  evidence_urls TEXT[] DEFAULT '{}',
  public_interest BOOLEAN DEFAULT FALSE,
  whistleblower_tag BOOLEAN DEFAULT FALSE,
  status TEXT CHECK (status IN ('pending','approved','rejected','escalated')) DEFAULT 'pending',
  admin_notes TEXT,
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  decision TEXT,
  -- restore, edit_required, keep_restricted, escalate_legal, partial_restore
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Admin Moderation Actions Table
-- Full audit trail (non-editable)
CREATE TABLE IF NOT EXISTS admin_moderation_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL,
  -- restrict_user, restore_user, verify_identity, reject_identity, approve_appeal,
  -- reject_appeal, escalate_legal, remove_content, edit_content, suspend_user
  target_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  target_content_id UUID,
  target_content_type TEXT,
  notes TEXT,
  evidence_urls TEXT[] DEFAULT '{}',
  severity TEXT CHECK (severity IN ('low','medium','high','critical')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. User Security Logs Table (Transparency)
-- Shown to the user
CREATE TABLE IF NOT EXISTS user_security_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  related_event_id UUID REFERENCES security_events(id) ON DELETE SET NULL,
  related_restriction_id UUID REFERENCES account_restrictions(id) ON DELETE SET NULL,
  related_appeal_id UUID REFERENCES content_appeals(id) ON DELETE SET NULL,
  visible_to_user BOOLEAN DEFAULT TRUE,
  category TEXT DEFAULT 'general',
  -- login, restriction, verification, appeal, report
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Risk Scoring Rules Table
-- Configurable risk detection rules
CREATE TABLE IF NOT EXISTS risk_scoring_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_name TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,
  severity TEXT CHECK (severity IN ('low','medium','high')) NOT NULL,
  base_score INT NOT NULL DEFAULT 1,
  conditions JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_security_events_user_id ON security_events(user_id);
CREATE INDEX IF NOT EXISTS idx_security_events_event_type ON security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_security_events_created_at ON security_events(created_at);

CREATE INDEX IF NOT EXISTS idx_content_reports_reported_user ON content_reports(reported_user_id);
CREATE INDEX IF NOT EXISTS idx_content_reports_status ON content_reports(status);
CREATE INDEX IF NOT EXISTS idx_content_reports_content_id ON content_reports(content_id, content_type);

CREATE INDEX IF NOT EXISTS idx_account_restrictions_user_id ON account_restrictions(user_id);
CREATE INDEX IF NOT EXISTS idx_account_restrictions_active ON account_restrictions(is_active, end_at);

CREATE INDEX IF NOT EXISTS idx_identity_verifications_user_id ON identity_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_identity_verifications_status ON identity_verifications(status);

CREATE INDEX IF NOT EXISTS idx_content_appeals_status ON content_appeals(status);
CREATE INDEX IF NOT EXISTS idx_content_appeals_user_id ON content_appeals(user_id);

CREATE INDEX IF NOT EXISTS idx_admin_actions_admin_id ON admin_moderation_actions(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_target_user ON admin_moderation_actions(target_user_id);

CREATE INDEX IF NOT EXISTS idx_user_security_logs_user_id ON user_security_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_security_logs_visible ON user_security_logs(visible_to_user);

-- Row Level Security (RLS) Policies
ALTER TABLE user_security_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_restrictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE identity_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_appeals ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_moderation_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_security_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies (users can only see their own data, admins can see all)
CREATE POLICY "Users can view own security status" ON user_security_status
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage security status" ON user_security_status
  FOR ALL USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Users can view own security events" ON security_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own reports" ON content_reports
  FOR SELECT USING (auth.uid() = reporter_id);

CREATE POLICY "Users can view restrictions against them" ON account_restrictions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own verifications" ON identity_verifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own appeals" ON content_appeals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own security logs" ON user_security_logs
  FOR SELECT USING (auth.uid() = user_id);

-- Admin policies for moderation tables
CREATE POLICY "Admins can manage all moderation data" ON security_events
  FOR ALL USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Admins can manage reports" ON content_reports
  FOR ALL USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Admins can manage restrictions" ON account_restrictions
  FOR ALL USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Admins can manage verifications" ON identity_verifications
  FOR ALL USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Admins can manage appeals" ON content_appeals
  FOR ALL USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Admins can manage security logs" ON user_security_logs
  FOR ALL USING (EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  ));

-- Functions for risk score calculation
CREATE OR REPLACE FUNCTION calculate_user_risk_score(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  total_score INTEGER := 0;
  event_record RECORD;
BEGIN
  -- Sum all security event scores for the user
  FOR event_record IN
    SELECT se.severity, rsr.base_score
    FROM security_events se
    JOIN risk_scoring_rules rsr ON se.event_type = rsr.event_type
    WHERE se.user_id = user_uuid
    AND rsr.is_active = true
    AND se.created_at > NOW() - INTERVAL '30 days'
  LOOP
    CASE event_record.severity
      WHEN 'low' THEN total_score := total_score + event_record.base_score;
      WHEN 'medium' THEN total_score := total_score + (event_record.base_score * 2);
      WHEN 'high' THEN total_score := total_score + (event_record.base_score * 3);
    END CASE;
  END LOOP;

  RETURN total_score;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update user risk level based on score
CREATE OR REPLACE FUNCTION update_user_risk_level()
RETURNS TRIGGER AS $$
DECLARE
  new_risk_level TEXT;
  current_score INTEGER;
BEGIN
  -- Calculate new risk score
  current_score := calculate_user_risk_score(NEW.user_id);

  -- Determine risk level
  CASE
    WHEN current_score >= 100 THEN new_risk_level := 'critical';
    WHEN current_score >= 50 THEN new_risk_level := 'high';
    WHEN current_score >= 20 THEN new_risk_level := 'medium';
    ELSE new_risk_level := 'low';
  END CASE;

  -- Update user security status
  INSERT INTO user_security_status (user_id, risk_score, risk_level, updated_at)
  VALUES (NEW.user_id, current_score, new_risk_level, NOW())
  ON CONFLICT (user_id) DO UPDATE SET
    risk_score = EXCLUDED.risk_score,
    risk_level = EXCLUDED.risk_level,
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically update risk scores
CREATE TRIGGER trigger_update_risk_score
  AFTER INSERT ON security_events
  FOR EACH ROW
  EXECUTE FUNCTION update_user_risk_level();

-- Function to log security events for users
CREATE OR REPLACE FUNCTION log_user_security_event(
  p_user_id UUID,
  p_message TEXT,
  p_category TEXT DEFAULT 'general',
  p_related_event_id UUID DEFAULT NULL,
  p_related_restriction_id UUID DEFAULT NULL,
  p_related_appeal_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO user_security_logs (
    user_id,
    message,
    category,
    related_event_id,
    related_restriction_id,
    related_appeal_id
  ) VALUES (
    p_user_id,
    p_message,
    p_category,
    p_related_event_id,
    p_related_restriction_id,
    p_related_appeal_id
  ) RETURNING id INTO log_id;

  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert default risk scoring rules
INSERT INTO risk_scoring_rules (rule_name, event_type, severity, base_score, conditions) VALUES
('Login from new device', 'device_change', 'medium', 5, '{"description": "Login from unrecognized device"}'),
('Mass reporting detected', 'mass_reports', 'high', 15, '{"description": "Multiple reports from same user/network"}'),
('Sensitive content posted', 'sensitive_post', 'high', 10, '{"description": "Content involving financial institutions or individuals"}'),
('API abuse detected', 'api_abuse', 'high', 20, '{"description": "Automated or excessive API usage"}'),
('Policy violation', 'policy_violation', 'medium', 8, '{"description": "Content edging on platform policies"}'),
('Login anomaly', 'login_anomaly', 'low', 3, '{"description": "Unusual login pattern or location"}'),
('Harassment report', 'harassment', 'medium', 12, '{"description": "User reported for harassment"}'),
('Fraud report', 'fraud', 'high', 25, '{"description": "User reported for fraudulent activity"}'),
('Misinformation', 'misinformation', 'medium', 6, '{"description": "Spreading false information"}'),
('Privacy violation', 'privacy_violation', 'high', 18, '{"description": "Violation of user privacy"}')
ON CONFLICT (rule_name) DO NOTHING;
