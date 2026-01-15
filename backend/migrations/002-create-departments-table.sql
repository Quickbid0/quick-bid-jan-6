-- Create departments table for admin functionality
CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_departments_name ON departments(name);
CREATE INDEX IF NOT EXISTS idx_departments_active ON departments(is_active);

-- Create employees table (referenced in departments route)
CREATE TABLE IF NOT EXISTS employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50),
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  position VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for employees
CREATE INDEX IF NOT EXISTS idx_employees_department_id ON employees(department_id);
CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email);
CREATE INDEX IF NOT EXISTS idx_employees_active ON employees(is_active);

-- Insert default departments
INSERT INTO departments (name, description) VALUES
  ('Sales', 'Sales department handling customer acquisition and revenue generation'),
  ('Marketing', 'Marketing department responsible for branding and promotional activities'),
  ('Operations', 'Operations department managing day-to-day business processes'),
  ('Finance', 'Finance department handling financial planning and accounting'),
  ('Human Resources', 'HR department managing employee relations and recruitment'),
  ('IT', 'IT department handling technology infrastructure and support'),
  ('Legal', 'Legal department handling compliance and legal matters'),
  ('Customer Support', 'Customer support department handling customer inquiries and issues')
ON CONFLICT DO NOTHING;
