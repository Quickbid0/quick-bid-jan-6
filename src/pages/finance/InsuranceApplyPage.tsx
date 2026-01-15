import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../../config/supabaseClient';
import toast from 'react-hot-toast';

const InsuranceApplyPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const search = new URLSearchParams(location.search);
  const productId = search.get('productId');

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [productTitle, setProductTitle] = useState<string>('');
  const [productPrice, setProductPrice] = useState<number | null>(null);
  const [coverageType, setCoverageType] = useState<string>('comprehensive');
  const [insuredValue, setInsuredValue] = useState<number | ''>('');
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
          console.error('InsuranceApplyPage: load product error', error);
          return;
        }

        if (data) {
          setProductTitle(data.title || 'Product');
          if (data.price != null) {
            const priceNum = Number(data.price);
            setProductPrice(priceNum);
            if (insuredValue === '') {
              setInsuredValue(priceNum);
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
    if (!insuredValue) {
      toast.error('Please enter an approximate insured value.');
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
        toast.error('You must be logged in to request insurance.');
        return;
      }

      const resp = await fetch('/api/v1/finance/insurance/apply', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_id: productId,
          insured_value: typeof insuredValue === 'string' ? Number(insuredValue) : insuredValue,
          coverage_type: coverageType,
          documents: [],
          consent_text:
            'I consent to QuickMela sharing my data with partner insurers for quote generation and policy issuance.',
        }),
      });

      const body = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        const message = body?.error || body?.message || 'Failed to submit insurance request';
        toast.error(message);
        return;
      }

      toast.success('Insurance request submitted. A partner may contact you with a quote.');
      if (body?.id) {
        navigate(`/finance/insurance/${body.id}`);
      }
    } catch (err) {
      console.error('InsuranceApplyPage: submit error', err);
      toast.error('Unexpected error while submitting insurance request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-white">Get Insurance Quote</h1>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Protect your vehicle purchase with partner insurers. We will share only necessary details for quote and policy
        issuance.
      </p>

      <div className="mb-6 text-xs text-gray-600 dark:text-gray-300 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-3 bg-gray-50/60 dark:bg-gray-900/40">
        <p className="font-semibold mb-1">How this works</p>
        <ol className="list-decimal list-inside space-y-0.5">
          <li>Tell us your preferred coverage and approximate insured value.</li>
          <li>QuickMela shares this with partner insurers to fetch quotes.</li>
          <li>The partner may contact you to confirm details and issue a policy.</li>
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
                (Approx. price{' '}
                <span className="font-medium">₹{productPrice.toLocaleString('en-IN')}</span>)
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Coverage type
            </label>
            <select
              value={coverageType}
              onChange={(e) => setCoverageType(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-700 rounded px-3 py-2 text-sm bg:white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
            >
              <option value="comprehensive">Comprehensive (recommended)</option>
              <option value="own_damage">Own damage only</option>
              <option value="third_party">Third party only</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Approx. insured value (IDV)
            </label>
            <input
              type="number"
              min={25000}
              step={5000}
              value={insuredValue}
              onChange={(e) => setInsuredValue(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full border border-gray-300 dark:border-gray-700 rounded px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              required
            />
            <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
              Partners will use this as a starting point and may suggest a suitable IDV based on vehicle details.
            </p>
          </div>
        </div>

        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-gray-50 dark:bg-gray-900 text-xs text-gray-700 dark:text-gray-300">
          <p className="font-semibold mb-1">Consent &amp; privacy</p>
          <p className="mb-1">
            By requesting insurance, you allow QuickMela to share relevant KYC, product, and transaction details with
            selected partner insurers only for quote generation, underwriting, and policy servicing.
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
            I have read and agree that QuickMela may share my insurance request details with partner insurers for quote
            and policy processing.
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
            {submitting ? 'Submitting…' : 'Request quote'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default InsuranceApplyPage;
