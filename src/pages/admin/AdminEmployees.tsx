import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { supabase } from '../../config/supabaseClient';
import { Download, Plus, QrCode, RefreshCw } from 'lucide-react';

interface Location {
  id: string;
  name: string;
  city?: string;
  state?: string;
}

interface EmployeeRow {
  id: string;
  employee_code: string;
  name: string;
  role: string;
  location_id: string | null;
  active: boolean;
  verified_at: string | null;
}

const AdminEmployees: React.FC = () => {
  const [rows, setRows] = useState<EmployeeRow[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    role: 'field_agent',
    location_id: '' as string | ''
  });

  const loadAll = async () => {
    setLoading(true);
    try {
      const { data: locs, error: locErr } = await supabase.from('locations').select('id,name,city,state').order('name');
      if (locErr) throw locErr;
      setLocations(locs || []);

      const { data: emps, error: empErr } = await supabase
        .from('employees')
        .select('id,employee_code,name,role,location_id,active,verified_at')
        .order('created_at', { ascending: false });
      if (empErr) throw empErr;
      setRows(emps || []);
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || 'Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const createEmployee = async () => {
    if (!form.name) return toast.error('Name required');
    setLoading(true);
    try {
      // generate a friendly employee code
      const code = 'QB-' + Math.random().toString(36).slice(2, 8).toUpperCase();
      const { data, error } = await supabase.from('employees').insert([
        {
          employee_code: code,
          name: form.name,
          role: form.role,
          location_id: form.location_id || null,
        },
      ]).select('id');
      if (error) throw error;

      // set a fresh QR token via RPC and show it to admin for printing
      const rawToken = crypto.getRandomValues(new Uint32Array(8)).join('');
      const { error: rpcErr } = await supabase.rpc('set_employee_qr_token', { emp_id: data?.[0]?.id, raw_token: rawToken });
      if (rpcErr) throw rpcErr;

      toast.success('Employee created');
      await loadAll();

      // Open printable window with QR
      const url = `${window.location.origin}/verify/employee/${rawToken}`;
      const qrHtml = `<!doctype html><html><head><meta charset="utf-8"><title>ID Card</title></head>
      <body style="font-family: sans-serif; padding:20px;">
        <h2>QuickBid Employee ID</h2>
        <p><strong>${form.name}</strong><br/>Code: ${code}<br/>Role: ${form.role}</p>
        <p>Verify: ${url}</p>
        <div id="qrcode"></div>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
        <script>new QRCode(document.getElementById('qrcode'), { text: '${url}', width: 200, height: 200 });</script>
      </body></html>`;
      const w = window.open('', '_blank');
      if (w) {
        w.document.write(qrHtml);
        w.document.close();
      }
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || 'Failed to create employee');
    } finally {
      setLoading(false);
    }
  };

  const rotateQR = async (emp: EmployeeRow) => {
    try {
      const rawToken = crypto.getRandomValues(new Uint32Array(8)).join('');
      const { error } = await supabase.rpc('set_employee_qr_token', { emp_id: emp.id, raw_token: rawToken });
      if (error) throw error;
      toast.success('QR token rotated');
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || 'Failed to rotate token');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Employees</h1>
        <button onClick={loadAll} className="px-3 py-2 bg-gray-100 rounded hover:bg-gray-200 flex items-center gap-2">
          <RefreshCw className="h-4 w-4"/> Reload
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-3 mb-8">
        <input className="border rounded px-3 py-2" placeholder="Name" value={form.name} onChange={(e)=>setForm({...form, name: e.target.value})} />
        <select className="border rounded px-3 py-2" value={form.role} onChange={(e)=>setForm({...form, role: e.target.value})}>
          <option value="field_agent">Field Agent</option>
          <option value="inspector">Inspector</option>
          <option value="support">Support</option>
          <option value="admin_assistant">Admin Assistant</option>
        </select>
        <select className="border rounded px-3 py-2" value={form.location_id} onChange={(e)=>setForm({...form, location_id: e.target.value})}>
          <option value="">No Location</option>
          {locations.map(l => (
            <option key={l.id} value={l.id}>{l.name}{l.city?` - ${l.city}`:''}</option>
          ))}
        </select>
        <button disabled={loading} onClick={createEmployee} className="md:col-span-3 bg-indigo-600 text-white rounded py-2 hover:bg-indigo-700 flex items-center justify-center gap-2">
          <Plus className="h-4 w-4"/> Create Employee
        </button>
      </div>

      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left p-2">Code</th>
              <th className="text-left p-2">Name</th>
              <th className="text-left p-2">Role</th>
              <th className="text-left p-2">Active</th>
              <th className="text-left p-2">Verified</th>
              <th className="text-left p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(row => (
              <tr key={row.id} className="border-t">
                <td className="p-2 font-mono">{row.employee_code}</td>
                <td className="p-2">{row.name}</td>
                <td className="p-2">{row.role}</td>
                <td className="p-2">{row.active ? 'Yes' : 'No'}</td>
                <td className="p-2">{row.verified_at ? new Date(row.verified_at).toLocaleDateString() : '-'}</td>
                <td className="p-2 flex gap-2">
                  <button onClick={()=>rotateQR(row)} className="px-2 py-1 text-xs bg-gray-100 rounded hover:bg-gray-200 flex items-center gap-1"><QrCode className="h-3 w-3"/>Rotate QR</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminEmployees;
