import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const InvestApply: React.FC = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    pan: '',
    plan_type: 'fixed',
    amount: '',
    tenure_months: '12',
    payout_frequency: 'monthly',
    bank_account_number: '',
    bank_ifsc: '',
    accept_terms: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as any;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.accept_terms) {
      toast.error('Please accept the Investment Policy & Agreement');
      return;
    }
    setSubmitting(true);
    try {
      // 1) Create or attach investor profile
      const investorRes = await fetch('/.netlify/functions/investor-create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: form.full_name,
          email: form.email,
          phone: form.phone || undefined,
          pan: form.pan || undefined,
          bank_account_number: form.bank_account_number || undefined,
          bank_ifsc: form.bank_ifsc || undefined,
        }),
      });

      if (!investorRes.ok) {
        const err = await investorRes.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to create investor profile');
      }

      const investorData = await investorRes.json();
      const investorId = investorData.id as string;

      // 2) Create investment application
      const res = await fetch('/.netlify/functions/investment-create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          investor_id: investorId,
          plan_type: form.plan_type,
          amount: Number(form.amount || 0),
          tenure_months: Number(form.tenure_months || 0) || null,
          investor_name: form.full_name,
          investor_email: form.email,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to create investment');
      }
      const data = await res.json();
      toast.success('Application submitted. We will contact you shortly.');
      navigate(`/invest/confirm?id=${encodeURIComponent(data.id)}`);
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-900 dark:text-white">Apply to Invest in QuickMela</h1>
      <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm">
        Fill in your details to start the investment process. Our team will review your application, complete KYC, and
        share the Investment Agreement and funding instructions.
      </p>
      <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input
              name="full_name"
              value={form.full_name}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">PAN</label>
            <input
              name="pan"
              value={form.pan}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 text-sm uppercase"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Plan Type</label>
            <select
              name="plan_type"
              value={form.plan_type}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            >
              <option value="fixed">Fixed ROI</option>
              <option value="revenue_share">Revenue Share</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Amount (₹)</label>
            <input
              name="amount"
              type="number"
              min={0}
              step="1000"
              value={form.amount}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tenure (months)</label>
            <select
              name="tenure_months"
              value={form.tenure_months}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            >
              <option value="12">12 months</option>
              <option value="18">18 months</option>
            </select>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Bank Account Number</label>
            <input
              name="bank_account_number"
              value={form.bank_account_number}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Bank IFSC</label>
            <input
              name="bank_ifsc"
              value={form.bank_ifsc}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 text-sm uppercase"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Payout Frequency</label>
          <select
            name="payout_frequency"
            value={form.payout_frequency}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 text-sm max-w-xs"
          >
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="end">End of tenure</option>
          </select>
        </div>

        <div className="flex items-start gap-2 text-sm">
          <input
            id="accept_terms"
            name="accept_terms"
            type="checkbox"
            checked={form.accept_terms}
            onChange={handleChange}
            className="mt-1"
          />
          <label htmlFor="accept_terms" className="text-gray-700 dark:text-gray-200">
            I confirm that I have read and accept the
            {' '}
            <a href="/docs/investor-policy.pdf" className="text-primary-600 underline" target="_blank" rel="noreferrer">
              QuickMela Investment Policy
            </a>
            {' '}and the
            {' '}
            <a href="/legal/investment-agreement-draft" className="text-primary-600 underline" target="_blank" rel="noreferrer">
              Investment Agreement draft
            </a>
            . I understand this is a non-equity contractual return program.
          </label>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/invest')}
            className="btn btn-ghost"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary"
          >
            {submitting ? 'Submitting…' : 'Submit & Book Call'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default InvestApply;
