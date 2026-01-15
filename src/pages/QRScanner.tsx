import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QrCode, ArrowRight } from 'lucide-react';

const QRScanner: React.FC = () => {
  const [token, setToken] = useState('');
  const navigate = useNavigate();

  const go = () => {
    if (!token) return;
    navigate(`/verify/employee/${encodeURIComponent(token)}`);
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4 flex items-center gap-2"><QrCode className="h-6 w-6"/> QR Scanner (manual)</h1>
      <p className="text-sm text-gray-600 mb-4">For now, paste or type the QR token to verify the employee. Camera-based scanning can be added later.</p>
      <input
        value={token}
        onChange={(e)=>setToken(e.target.value)}
        placeholder="Paste QR token here"
        className="w-full border rounded px-3 py-2 mb-3"
      />
      <button onClick={go} className="w-full bg-indigo-600 text-white rounded py-2 hover:bg-indigo-700 flex items-center justify-center gap-2">
        Verify <ArrowRight className="h-4 w-4"/>
      </button>
    </div>
  );
};

export default QRScanner;
