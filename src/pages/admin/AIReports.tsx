import React, { useEffect, useState } from 'react';
import { supabase } from '../../config/supabaseClient';

const AIReports: React.FC = () => {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scoring, setScoring] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const load = async () => {
      try {
        setError(null);
        setLoading(true);
        // Join risk + last inference
        const { data: riskList, error: riskErr } = await supabase
          .from('user_risk_scores')
          .select('user_id, score, level, updated_at')
          .order('score', { ascending: false })
          .limit(50);
        if (riskErr) throw riskErr;

        const userIds = (riskList || []).map((r: any) => r.user_id);
        const { data: inf } = await supabase
          .from('inference_logs')
          .select('user_id, score, created_at')
          .in('user_id', userIds)
          .order('created_at', { ascending: false });
        const lastInf: Record<string, any> = {};
        (inf || []).forEach((row: any) => { if (!lastInf[row.user_id]) lastInf[row.user_id] = row; });

        setRows((riskList || []).map((r: any) => ({ ...r, ml_score: lastInf[r.user_id]?.score || null, ml_at: lastInf[r.user_id]?.created_at || null })));
      } catch (e: any) {
        setError(e.message || 'Failed to load');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const rescore = async (user_id: string) => {
    try {
      setScoring((s) => ({ ...s, [user_id]: true }));
      const resp = await fetch('/api/risk-score-ml', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id })
      });
      const data = await resp.json();
      setRows((rows) => rows.map(r => r.user_id === user_id ? { ...r, ml_score: data.score, ml_at: new Date().toISOString() } : r));
    } catch (_) {
    } finally {
      setScoring((s) => ({ ...s, [user_id]: false }));
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">AI Reports</h1>
      {error && <div className="mb-3 text-red-600">{error}</div>}
      <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded shadow">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-100">
            <tr>
              <th className="px-3 py-2 text-left">User</th>
              <th className="px-3 py-2 text-left">Rule Score</th>
              <th className="px-3 py-2 text-left">Rule Level</th>
              <th className="px-3 py-2 text-left">ML Score</th>
              <th className="px-3 py-2 text-left">ML Time</th>
              <th className="px-3 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="px-3 py-6 text-center text-gray-500">Loading…</td></tr>
            ) : rows.length ? (
              rows.map((r) => (
                <tr key={r.user_id} className="border-t">
                  <td className="px-3 py-2 font-mono text-xs">{r.user_id}</td>
                  <td className="px-3 py-2">{r.score}</td>
                  <td className="px-3 py-2 capitalize">{r.level}</td>
                  <td className="px-3 py-2">{r.ml_score ?? '-'}</td>
                  <td className="px-3 py-2">{r.ml_at ? new Date(r.ml_at).toLocaleString() : '-'}</td>
                  <td className="px-3 py-2">
                    <button disabled={!!scoring[r.user_id]} className="px-2 py-1 rounded bg-indigo-600 text-white disabled:opacity-60" onClick={() => rescore(r.user_id)}>
                      {scoring[r.user_id] ? 'Scoring…' : 'Run ML Score'}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={6} className="px-3 py-6 text-center text-gray-500">No records</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AIReports;
