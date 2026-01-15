import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL as string;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

const adminClient = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false },
});

export type AuthContext = {
  userId: string;
  role: string | null;
};

export async function getAuthContextFromEvent(event: any): Promise<AuthContext | null> {
  const authHeader = event.headers?.authorization || event.headers?.Authorization;
  if (!authHeader || typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) return null;

  const token = authHeader.slice('Bearer '.length).trim();
  if (!token) return null;

  const { data, error } = await adminClient.auth.getUser(token);
  if (error || !data?.user) return null;

  const userId = data.user.id;

  const { data: profile } = await adminClient
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .maybeSingle();

  return {
    userId,
    role: profile?.role ?? null,
  };
}

export function ensureRoleOrThrow(ctx: AuthContext | null, allowed: string[]) {
  if (!ctx) throw new Error('unauthorized');
  if (!ctx.role || !allowed.includes(ctx.role)) throw new Error('forbidden');
}
