-- Create risk assessments table for tracking risk evaluations
CREATE TABLE IF NOT EXISTS risk_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type VARCHAR(50) NOT NULL, -- 'seller', 'buyer', 'product', etc.
  entity_id UUID NOT NULL,
  risk_level VARCHAR(20) NOT NULL CHECK (risk_level IN ('low', 'medium', 'high')),
  risk_score INTEGER CHECK (risk_score >= 0 AND risk_score <= 100),
  risk_factors JSONB, -- Store detailed risk factors
  notes TEXT,
  assessed_by VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for risk assessments
CREATE INDEX IF NOT EXISTS idx_risk_assessments_entity ON risk_assessments(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_risk_assessments_level ON risk_assessments(risk_level);
CREATE INDEX IF NOT EXISTS idx_risk_assessments_created_at ON risk_assessments(created_at);

-- Create risk factors reference table
CREATE TABLE IF NOT EXISTS risk_factor_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  factor_name VARCHAR(100) NOT NULL,
  factor_type VARCHAR(50) NOT NULL, -- 'account_age', 'verification', 'sales_volume', etc.
  description TEXT,
  weight DECIMAL(3,2) DEFAULT 1.0, -- Weight in risk calculation
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default risk factor definitions
INSERT INTO risk_factor_definitions (factor_name, factor_type, description, weight) VALUES
  ('Account Age', 'account_age', 'Age of the user account in days', 0.2),
  ('Verification Status', 'verification', 'Whether the user has completed verification', 0.25),
  ('Sales Volume', 'sales_volume', 'Total sales volume in currency', 0.2),
  ('Product Count', 'product_count', 'Number of products listed', 0.15),
  ('Reputation', 'reputation', 'User rating and review score', 0.2)
ON CONFLICT DO NOTHING;
