// Admin Controls for Real Products and Users
import { supabase } from '../config/supabaseClient';
export interface AdminControl {
  id: string;
  adminId: string;
  action: 'approve_product' | 'reject_product' | 'approve_seller' | 'disable_product' | 'rollback';
  targetId: string;
  targetType: 'product' | 'user';
  reason: string;
  createdAt: Date;
}

export interface AdminMetrics {
  totalProducts: number;
  realProducts: number;
  betaUsers: number;
  activeBids: number;
  pendingApprovals: number;
}

export class AdminService {
  static async approveProduct(productId: string, adminId: string, reason: string): Promise<void> {
    const { error } = await supabase
    .from('products')
    .update({
      status: 'APPROVED',
      approved_at: new Date().toISOString(),
      approved_by: adminId
    })
    .eq('id', productId);
  if (error) throw error;
    const control: AdminControl = {
      id: `admin_${Date.now()}`,
      adminId,
      action: 'approve_product',
      targetId: productId,
      targetType: 'product',
      reason,
      createdAt: new Date()
    };
    
    // Log admin action
    await this.logAdminAction(control);
  }
  
  static async rejectProduct(productId: string, adminId: string, reason: string): Promise<void> {
    const { error } = await supabase
    .from('products')
    .update({
      status: 'REJECTED',
      rejection_reason: reason
    })
    .eq('id', productId);
  if (error) throw error;
    const control: AdminControl = {
      id: `admin_${Date.now()}`,
      adminId,
      action: 'reject_product',
      targetId: productId,
      targetType: 'product',
      reason,
      createdAt: new Date()
    };
    
    await this.logAdminAction(control);
  }
  
  static async disableProduct(productId: string, adminId: string, reason: string): Promise<void> {
    const { error } = await supabase
    .from('products')
    .update({
      status: 'EXPIRED',
      rejection_reason: reason
    })
    .eq('id', productId);
  if (error) throw error;
    const control: AdminControl = {
      id: `admin_${Date.now()}`,
      adminId,
      action: 'disable_product',
      targetId: productId,
      targetType: 'product',
      reason,
      createdAt: new Date()
    };
    
    await this.logAdminAction(control);
  }
  
  static async approveSeller(userId: string, adminId: string, reason: string): Promise<void> {
    const { error } = await supabase
    .from('users')
    .update({
      status: 'ACTIVE',
      is_verified: true
    })
    .eq('id', userId);
  if (error) throw error;
    const control: AdminControl = {
      id: `admin_${Date.now()}`,
      adminId,
      action: 'approve_seller',
      targetId: userId,
      targetType: 'user',
      reason,
      createdAt: new Date()
    };
    
    await this.logAdminAction(control);
  }
  
  static async rollbackToMockData(adminId: string, reason: string): Promise<void> {
    // Rollback to mock data - mark all approved products as draft
  const { error } = await supabase
    .from('products')
    .update({ status: 'DRAFT' })
    .eq('status', 'APPROVED');
  if (error) throw error;
    const control: AdminControl = {
      id: `admin_${Date.now()}`,
      adminId,
      action: 'rollback',
      targetId: 'all',
      targetType: 'product',
      reason,
      createdAt: new Date()
    };
    
    await this.logAdminAction(control);
  }
  
  static async getAdminMetrics(): Promise<AdminMetrics> {
    const { data: products, error: productsError } = await supabase.from('products').select('status');
    if (productsError) throw productsError;
    const totalProducts = products.length;
    const realProducts = products.filter(p => p.status === 'APPROVED').length;
    const pendingApprovals = products.filter(p => p.status === 'PENDING_APPROVAL').length;

    const { data: bids, error: bidsError } = await supabase.from('bids').select('id');
    if (bidsError) throw bidsError;
    const activeBids = bids.length;

    const { data: users, error: usersError } = await supabase.from('users').select('role');
    if (usersError) throw usersError;
    const betaUsers = users.filter(u => ['BUYER', 'SELLER'].includes(u.role)).length;

    return {
      totalProducts,
      realProducts,
      betaUsers,
      activeBids,
      pendingApprovals
    };
  }
  
  static async getPendingApprovals(): Promise<any[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('status', 'PENDING_APPROVAL');
    if (error) throw error;
    return data || [];
  }
  
  static async getActivityLog(limit: number = 50): Promise<AdminControl[]> {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .in('resource', ['product', 'user'])
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data.map(d => ({
      id: d.id,
      adminId: d.user_id,
      action: (d.action.toLowerCase() + '_' + d.resource) as any,
      targetId: d.resource_id,
      targetType: d.resource as any,
      reason: d.metadata?.reason || '',
      createdAt: new Date(d.created_at)
    })) as AdminControl[];
  }
  
  private static async logAdminAction(control: AdminControl): Promise<void> {
    const { error } = await supabase
      .from('audit_logs')
      .insert({
        user_id: control.admin_id,
        action: 'APPROVE',
        resource: control.target_type,
        resource_id: control.target_id,
        metadata: control,
        created_at: control.created_at.toISOString()
      });
    if (error) console.error('Failed to log admin action:', error);
  }
}
