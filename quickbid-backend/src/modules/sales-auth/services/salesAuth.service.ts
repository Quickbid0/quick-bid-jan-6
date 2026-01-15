import bcrypt from 'bcrypt';
import { supabaseAdmin } from '../../../supabaseAdmin';
import { signToken } from '../../../utils/jwt';

export interface SalesUserRecord {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: 'sales';
  status: 'active' | 'disabled' | 'pending';
  created_at: string;
  updated_at: string;
  password_hash: string;
}

export interface SalesLoginResult {
  token: string;
  user: Omit<SalesUserRecord, 'password_hash'>;
}

const ensureSupabase = () => {
  if (!supabaseAdmin) {
    throw new Error('Supabase admin client is not configured');
  }
  return supabaseAdmin;
};

const sanitizeUser = (user: SalesUserRecord): Omit<SalesUserRecord, 'password_hash'> => {
  const { password_hash, ...rest } = user;
  return rest;
};

export const findSalesUserByEmail = async (email: string) => {
  const client = ensureSupabase();
  const { data, error } = await client
    .from('sales_users')
    .select('*')
    .eq('email', email)
    .maybeSingle();

  if (error) {
    throw error;
  }
  return (data as SalesUserRecord) || null;
};

export const findSalesUserById = async (id: string) => {
  const client = ensureSupabase();
  const { data, error } = await client
    .from('sales_users')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    throw error;
  }
  return (data as SalesUserRecord) || null;
};

export const loginSalesUser = async (email: string, password: string): Promise<SalesLoginResult> => {
  const user = await findSalesUserByEmail(email);

  if (!user || user.status !== 'active') {
    throw new Error('Invalid credentials');
  }

  const matches = await bcrypt.compare(password, user.password_hash);
  if (!matches) {
    throw new Error('Invalid credentials');
  }

  const token = signToken({
    sub: user.id,
    role: 'sales',
    email: user.email,
  });

  return {
    token,
    user: sanitizeUser(user),
  };
};
