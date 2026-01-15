import React, { useEffect, useState } from 'react';
import { supabase } from '../../config/supabaseClient';
import { logAdminEvent } from '../../utils/adminAudit';
// // import { RiskGauge } from '../../components/admin/RiskGauge';
import { ShieldCheck, ShieldAlert, AlertTriangle, Eye, Activity } from 'lucide-react';
import { Button } from '../../components/ui/button';

const AdminFraudReview: React.FC = () => {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setError(null);
        setLoading(true);
        // Join user_risk_scores with user_controls, and count recent signals
        const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        const { data: riskList, error: riskErr } = await supabase
          .from('user_risk_scores')
          .select('user_id, score, level, updated_at')
          .order('score', { ascending: false })
          .limit(100);
        if (riskErr) throw riskErr;

        const userIds = (riskList || []).map((r: any) => r.user_id);
        const controls: Record<string, any> = {};
        if (userIds.length) {
          const { data: ctrlList } = await supabase
            .from('user_controls')
            .select('user_id, status, updated_at')
            .in('user_id', userIds);
          (ctrlList || []).forEach((c: any) => { controls[c.user_id] = c; });
        }

        // Count signals per user (via RPC-like filter)
        const signalsData: Record<string, { count: number, latestReason: string }> = {};
        for (const chunk of [userIds.slice(0, 50), userIds.slice(50, 100)]) {
          if (!chunk.length) continue;
          const { data: signals } = await supabase
            .from('fraud_signals')
            .select('user_id, reason, signal_type')
            .in('user_id', chunk)
            .gte('created_at', since)
            .order('created_at', { ascending: false });
          
          (signals || []).forEach((s: any) => {
            if (!s.user_id) return;
            if (!signalsData[s.user_id]) {
                signalsData[s.user_id] = { count: 0, latestReason: s.reason || s.signal_type || 'Suspicious activity' };
            }
            signalsData[s.user_id].count++;
          });
        }

        const combined = (riskList || []).map((r: any) => ({
          ...r,
          control: controls[r.user_id]?.status || 'normal',
          signals7d: signalsData[r.user_id]?.count || 0,
          latestReason: signalsData[r.user_id]?.latestReason || 'No recent signals',
        }));
        setRows(combined);
      } catch (e: any) {
        setError(e.message || 'Failed to load');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleAction = async (userId: string, status: string, currentStatus: string) => {
    if (status === currentStatus) return;

    const { data: { session } } = await supabase.auth.getSession();
    const adminId = session?.user?.id;
    if (!adminId) return;

    const { error } = await supabase
        .from('user_controls')
        .upsert({ user_id: userId, status });
    
    if (error) {
        console.error('Error updating status:', error);
        return;
    }

    setRows(rows.map(x => x.user_id === userId ? { ...x, control: status } : x));

    logAdminEvent({
        actionType: 'FRAUD_CONTROL_CYCLE',
        targetType: 'user',
        targetId: userId,
        beforeState: { control: currentStatus },
        afterState: { control: status },
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Fraud Review</h1>
      {error && <div className="mb-3 text-red-600">{error}</div>}
      <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded shadow">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-100">
            <tr>
              <th className="px-3 py-2 text-left">User</th>
              <th className="px-3 py-2 text-left">Risk Score</th>
              <th className="px-3 py-2 text-left">Why Flagged?</th>
              <th className="px-3 py-2 text-left">Status</th>
              <th className="px-3 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="px-3 py-6 text-center text-gray-500">Loading…</td></tr>
            ) : rows.length ? (
              rows.map((r) => (
                <tr key={r.user_id} className="border-t hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-3 py-4">
                    <div className="flex flex-col">
                      <span className="font-mono text-xs text-gray-500">{r.user_id.substring(0, 8)}...</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">User {r.user_id.substring(0, 4)}</span>
                    </div>
                  </td>
                  <td className="px-3 py-4">
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">{r.score}</div>
                      <div className={`w-16 h-2 rounded-full overflow-hidden ${
                        r.score >= 80 ? 'bg-red-200 dark:bg-red-900/30' :
                        r.score >= 60 ? 'bg-orange-200 dark:bg-orange-900/30' :
                        'bg-green-200 dark:bg-green-900/30'
                      }`}>
                        <div 
                          className={`h-full transition-all ${
                            r.score >= 80 ? 'bg-red-500' :
                            r.score >= 60 ? 'bg-orange-500' :
                            'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(r.score, 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-4">
                    <div className="flex items-start gap-2">
                      <div className="p-1.5 bg-red-100 dark:bg-red-900/30 rounded text-red-600 dark:text-red-400">
                        <Activity className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{r.latestReason}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{r.signals7d} suspicious signals in last 7 days</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                        r.control === 'blocked' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200' :
                        r.control === 'limited' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200' :
                        r.control === 'flagged' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200' :
                        'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
                    }`}>
                        {r.control === 'normal' ? 'Active' : r.control}
                    </span>
                  </td>
                  <td className="px-3 py-4">
                    <div className="flex items-center gap-2">
                        <Button
                            size="sm"
                            variant="outline"
                            title="Mark as Safe"
                            className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                            onClick={() => handleAction(r.user_id, 'normal', r.control)}
                        >
                            <ShieldCheck className="w-4 h-4" />
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            title="Flag for Review"
                            className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50 border-yellow-200"
                            onClick={() => handleAction(r.user_id, 'flagged', r.control)}
                        >
                            <AlertTriangle className="w-4 h-4" />
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            title="Block User"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                            onClick={() => handleAction(r.user_id, 'blocked', r.control)}
                        >
                            <ShieldAlert className="w-4 h-4" />
                        </Button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={5} className="px-3 py-6 text-center text-gray-500">No records</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminFraudReview;
