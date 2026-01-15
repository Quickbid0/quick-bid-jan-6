import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../../config/supabaseClient';
import toast from 'react-hot-toast';

const LoanApplyPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const search = new URLSearchParams(location.search);
  const productId = search.get('productId');

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [productTitle, setProductTitle] = useState<string>('');
  const [productPrice, setProductPrice] = useState<number | null>(null);
  const [requestedAmount, setRequestedAmount] = useState<number | ''>('');
  const [tenorMonths, setTenorMonths] = useState<number | ''>(36);
  const [loanType, setLoanType] = useState<string>('vehicle');
  const [consentChecked, setConsentChecked] = useState(false);

  useEffect(() => {
    const loadProduct = async () => {
      if (!productId) return;
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('products')
          .select('id, title, price')
          .eq('id', productId)
          .maybeSingle();

        if (error) {
          console.error('LoanApplyPage: load product error', error);
          return;
        }

        if (data) {
          setProductTitle(data.title || 'Product');
          if (data.price != null) {
            setProductPrice(Number(data.price));
            if (requestedAmount === '') {
              setRequestedAmount(Number(data.price));
            }
          }
        }
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [productId]);

  const handleSubmit: React.FormEventHandler = async (e) => {
    e.preventDefault();
    if (!productId) {
      toast.error('Missing product. Please start from a product page.');
      return;
    }
    if (!requestedAmount || !tenorMonths) {
      toast.error('Please fill amount and tenor.');
      return;
    }
    if (!consentChecked) {
      toast.error('Please accept the consent to proceed.');
      return;
    }

    try {
      setSubmitting(true);
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) {
        toast.error('You must be logged in to apply for a loan.');
        return;
      }

      const resp = await fetch('/api/v1/finance/loans/apply', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_id: productId,
          requested_amount: typeof requestedAmount === 'string' ? Number(requestedAmount) : requestedAmount,
          tenor_months: typeof tenorMonths === 'string' ? Number(tenorMonths) : tenorMonths,
          loan_type: loanType || undefined,
          prefilled: {
            product_title: productTitle || undefined,
            product_price: productPrice ?? undefined,
          },
          documents: [],
          consent_text:
            'I consent to QuickMela sharing my data with partner banks/NBFCs for loan evaluation and processing.',
        }),
      });

      const body = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        const message = body?.error || body?.message || 'Failed to submit loan application';
        toast.error(message);
        return;
      }

      toast.success('Loan application submitted.');
      if (body?.id) {
        navigate(`/finance/loans/${body.id}`);
      }
    } catch (err) {
      console.error('LoanApplyPage: submit error', err);
      toast.error('Unexpected error while submitting application');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-white">Apply for Loan</h1>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Secure a quick loan for your won item or purchase. We share only necessary details with bank / NBFC partners.
      </p>

      <div className="mb-6 text-xs text-gray-600 dark:text-gray-300 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-3 bg-gray-50/60 dark:bg-gray-900/40">
        <p className="font-semibold mb-1">How this works</p>
        <ol className="list-decimal list-inside space-y-0.5">
          <li>Tell us how much you want to finance and for how long.</li>
          <li>We share this application plus basic KYC and product details with 1–2 partner banks/NBFCs.</li>
          <li>The partner may contact you to complete KYC and confirm sanction / offer.</li>
        </ol>
      </div>

      {loading && <div className="text-sm text-gray-500 mb-4">Loading product…</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Product</label>
          <div className="px-3 py-2 rounded border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm text-gray-800 dark:text-gray-100">
            {productTitle || productId || 'Selected product'}
            {productPrice != null && (
              <span className="ml-2 text-xs text-gray-600 dark:text-gray-400">
                (Winning price approx. 
                <span className="font-medium">₹{productPrice.toLocaleString('en-IN')}</span>)
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Requested amount (₹)
            </label>
            <input
              type="number"
              min={10000}
              step={1000}
              value={requestedAmount}
              onChange={(e) => setRequestedAmount(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full border border-gray-300 dark:border-gray-700 rounded px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Tenor (months)
            </label>
            <input
              type="number"
              min={3}
              max={84}
              value={tenorMonths}
              onChange={(e) => setTenorMonths(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full border border-gray-300 dark:border-gray-700 rounded px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Loan type</label>
          <select
            value={loanType}
            onChange={(e) => setLoanType(e.target.value)}
            className="w-full border border-gray-300 dark:border-gray-700 rounded px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
          >
            <option value="vehicle">Vehicle loan</option>
            <option value="personal">Personal loan</option>
            <option value="working_capital">Seller working capital</option>
          </select>
        </div>

        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-gray-50 dark:bg-gray-900 text-xs text-gray-700 dark:text-gray-300">
          <p className="font-semibold mb-1">Consent & privacy</p>
          <p className="mb-1">
            By applying, you allow QuickMela to share relevant KYC, product and transaction details with selected
            partner banks / NBFCs only for loan evaluation and onboarding.
          </p>
          <p>
            Partners may contact you via phone / SMS / email for additional details. You can request data deletion later
            as per our privacy policy.
          </p>
        </div>

        <label className="flex items-start gap-2 text-xs text-gray-700 dark:text-gray-300">
          <input
            type="checkbox"
            checked={consentChecked}
            onChange={(e) => setConsentChecked(e.target.checked)}
            className="mt-0.5"
          />
          <span>
            I have read and agree that QuickMela may share my application details with partner banks / NBFCs for loan
            processing.
          </span>
        </label>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-900"
            onClick={() => navigate(-1)}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-700 disabled:opacity-60"
          >
            {submitting ? 'Submitting…' : 'Submit application'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LoanApplyPage;
