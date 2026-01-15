import React, { useState } from 'react';
import { supabase } from '../config/supabaseClient';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Phone, CheckCircle, Send, Shield } from 'lucide-react';

const PhoneVerification: React.FC = () => {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'enter' | 'otp' | 'done'>('enter');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const deviceHash = () => {
    try {
      const nav = navigator as any;
      const parts = [
        nav.userAgent,
        nav.language,
        Intl.DateTimeFormat().resolvedOptions().timeZone,
        screen.width + 'x' + screen.height,
      ].join('|');
      let h = 0;
      for (let i = 0; i < parts.length; i++) h = (h * 31 + parts.charCodeAt(i)) >>> 0;
      return 'd-' + h.toString(16);
    } catch { return 'd-unknown'; }
  };

  const logSignal = async (payload: any) => {
    try {
      await fetch('/api/log-fraud-signal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, device_hash: deviceHash() })
      });
    } catch (_) {}
  };

  const sendOtp = async () => {
    if (!phone) return toast.error('Enter phone in E.164 format, e.g., +9198XXXXXXXX');
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({ phone, options: { channel: 'sms' } });
      if (error) throw error;
      toast.success('OTP sent');
      await logSignal({ kind: 'otp_send', value_json: { channel: 'sms' } });
      setStep('otp');
    } catch (e: any) {
      console.error(e);
      await logSignal({ kind: 'otp_send_failed', value_json: { reason: e?.message } });
      toast.error(e.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!otp) return toast.error('Enter received OTP');
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.verifyOtp({ phone, token: otp, type: 'sms' });
      if (error) throw error;
      // Mark profile as phone_verified
      const { data: sessionData } = await supabase.auth.getSession();
      const uid = sessionData?.session?.user?.id;
      if (uid) {
        await supabase.from('profiles').update({ phone_verified: true, phone }).eq('id', uid);
      }
      toast.success('Phone verified');
      await logSignal({ kind: 'otp_verify_success' });
      setStep('done');
      setTimeout(() => navigate(-1), 800);
    } catch (e: any) {
      console.error(e);
      await logSignal({ kind: 'otp_verify_failed', value_json: { reason: e?.message } });
      toast.error(e.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <div className="text-center mb-6">
        <Shield className="h-10 w-10 text-indigo-600 mx-auto mb-2"/>
        <h1 className="text-2xl font-bold">Verify your phone</h1>
        <p className="text-sm text-gray-600">Required before placing bids</p>
      </div>

      {step === 'enter' && (
        <div className="space-y-3">
          <label className="block text-sm text-gray-700">Phone number (E.164)</label>
          <div className="relative">
            <Phone className="h-4 w-4 text-gray-400 absolute left-3 top-3"/>
            <input value={phone} onChange={(e)=>setPhone(e.target.value)} placeholder="+9198XXXXXXXX" className="w-full border rounded pl-9 pr-3 py-2"/>
          </div>
          <button disabled={loading} onClick={sendOtp} className="w-full bg-indigo-600 text-white rounded py-2 hover:bg-indigo-700 flex items-center justify-center gap-2">
            <Send className="h-4 w-4"/> Send OTP
          </button>
        </div>
      )}

      {step === 'otp' && (
        <div className="space-y-3">
          <label className="block text-sm text-gray-700">Enter OTP</label>
          <input value={otp} onChange={(e)=>setOtp(e.target.value)} placeholder="6-digit code" className="w-full border rounded px-3 py-2"/>
          <button disabled={loading} onClick={verifyOtp} className="w-full bg-green-600 text-white rounded py-2 hover:bg-green-700">Verify</button>
        </div>
      )}

      {step === 'done' && (
        <div className="bg-green-50 border border-green-200 rounded p-4 flex items-center gap-2 text-green-700 mt-4">
          <CheckCircle className="h-5 w-5"/> Phone verification complete
        </div>
      )}
    </div>
  );
};

export default PhoneVerification;
