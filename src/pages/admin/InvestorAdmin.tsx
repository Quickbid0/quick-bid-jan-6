import React, { useEffect, useState } from 'react';
import { ShieldCheck, CheckCircle2, XCircle, RefreshCw, Building2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface InvestmentVehicle {
  id: string;
  name: string;
  type: 'bank' | 'nbfc' | 'private';
  minTicket: number;
  maxTicket: number;
  expectedIRR: number;
  tenureMonths: number;
  location: string;
  verified: boolean;
  description: string;
  rejected?: boolean;
}

const STORAGE_KEY = 'investor-listings';

const loadListings = (): InvestmentVehicle[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

const saveListings = (items: InvestmentVehicle[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
};

const InvestorAdmin: React.FC = () => {
  const [items, setItems] = useState<InvestmentVehicle[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = () => {
    setItems(loadListings());
  };

  useEffect(() => {
    refresh();
  }, []);

  const approve = (id: string) => {
    const updated = items.map(it => it.id === id ? { ...it, verified: true, rejected: false } : it);
    setItems(updated);
    saveListings(updated);
    toast.success('Listing approved');
  };

  const reject = (id: string) => {
    const updated = items.map(it => it.id === id ? { ...it, verified: false, rejected: true } : it);
    setItems(updated);
    saveListings(updated);
    toast('Listing rejected');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Building2 className="h-7 w-7 text-indigo-600" />
          <h1 className="text-2xl font-bold">Investor Listings - Admin</h1>
        </div>
        <button onClick={refresh} className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      {items.length === 0 ? (
        <div className="text-gray-600">No submissions yet.</div>
      ) : (
        <div className="space-y-4">
          {items.map((v) => (
            <div key={v.id} className="bg-white dark:bg-gray-800 rounded-xl border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{v.name}</h3>
                  <p className="text-sm text-gray-500">{v.location} • {v.type.toUpperCase()}</p>
                </div>
                <div className="flex items-center gap-2">
                  {v.verified && !v.rejected && (
                    <span className="inline-flex items-center gap-1 text-green-700 bg-green-100 px-2 py-1 rounded text-xs">
                      <ShieldCheck className="h-4 w-4" /> Verified
                    </span>
                  )}
                  {v.rejected && (
                    <span className="inline-flex items-center gap-1 text-red-700 bg-red-100 px-2 py-1 rounded text-xs">
                      <XCircle className="h-4 w-4" /> Rejected
                    </span>
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">{v.description}</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 text-sm">
                <div><span className="text-gray-500">Ticket:</span> <span className="font-medium">₹{v.minTicket.toLocaleString()} - ₹{v.maxTicket.toLocaleString()}</span></div>
                <div><span className="text-gray-500">IRR:</span> <span className="font-medium">{v.expectedIRR}%</span></div>
                <div><span className="text-gray-500">Tenure:</span> <span className="font-medium">{v.tenureMonths} months</span></div>
              </div>
              <div className="mt-4 flex gap-2">
                <button onClick={() => approve(v.id)} className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" /> Approve
                </button>
                <button onClick={() => reject(v.id)} className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2">
                  <XCircle className="h-4 w-4" /> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InvestorAdmin;
