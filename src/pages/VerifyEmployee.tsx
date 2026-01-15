import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../config/supabaseClient';
import { CheckCircle, AlertTriangle, MapPin, RefreshCcw } from 'lucide-react';

interface VerificationResult {
  employee_code: string;
  name: string;
  role: string;
  city?: string;
  state?: string;
  active: boolean;
  verified_at?: string | null;
}

const VerifyEmployee: React.FC = () => {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.rpc('verify_employee', { qr_token: token });
      if (error) throw error;
      if (data && data.length > 0) {
        setResult(data[0]);
      } else {
        setResult(null);
        setError('Employee not found or inactive');
      }
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [token]);

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Verify QuickBid Employee</h1>

      {loading && (
        <div className="flex items-center gap-2 text-gray-600"><RefreshCcw className="h-4 w-4 animate-spin"/> Verifying…</div>
      )}

      {!loading && error && (
        <div className="p-4 rounded bg-red-50 border border-red-200 text-red-700 flex items-start gap-2">
          <AlertTriangle className="h-5 w-5 mt-0.5"/>
          <div>
            <div className="font-semibold">Not a valid QuickBid employee</div>
            <div className="text-sm">{error}</div>
          </div>
        </div>
      )}

      {!loading && result && (
        <div className="p-5 rounded-lg border shadow bg-white">
          <div className="flex items-center gap-2 text-green-700 mb-2">
            <CheckCircle className="h-5 w-5"/>
            <span className="font-semibold">Verified QuickBid Employee</span>
          </div>
          <div className="space-y-1 text-sm">
            <div><span className="text-gray-500">Name:</span> <span className="font-medium">{result.name}</span></div>
            <div><span className="text-gray-500">Role:</span> <span className="font-medium">{result.role}</span></div>
            <div><span className="text-gray-500">Employee Code:</span> <span className="font-mono">{result.employee_code}</span></div>
            {(result.city || result.state) && (
              <div className="flex items-center gap-1 text-gray-700"><MapPin className="h-4 w-4"/> {result.city || ''}{result.city && result.state ? ', ' : ''}{result.state || ''}</div>
            )}
            <div><span className="text-gray-500">Status:</span> <span className="font-medium">{result.active ? 'Active' : 'Inactive'}</span></div>
            {result.verified_at && (
              <div><span className="text-gray-500">Verified at:</span> <span>{new Date(result.verified_at).toLocaleString()}</span></div>
            )}
          </div>
        </div>
      )}

      <div className="mt-6 text-sm text-gray-600">
        Need to scan another? <Link className="text-indigo-600" to="/scan">Open Scanner</Link>
      </div>
    </div>
  );
};

export default VerifyEmployee;
