import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import html2canvas from 'html2canvas';

interface InspectionProduct {
  id: string;
  title: string | null;
  category: string | null;
  brand: string | null;
  model: string | null;
  year: number | null;
  metadata?: any;
}

interface Inspection {
  id: string;
  product_id: string;
  product_type: string;
  status: string;
  final_status: string | null;
  final_grade: string | null;
  final_decision: string | null;
  created_at: string;
  reviewed_at: string | null;
  product: InspectionProduct | null;
}

const ShareVerificationBadge: React.FC = () => {
  const { inspectionId } = useParams<{ inspectionId: string }>();
  const navigate = useNavigate();
  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const badgeRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!inspectionId) return;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const resp = await fetch(
          `/.netlify/functions/inspector-inspection-detail?inspectionId=${encodeURIComponent(inspectionId)}`,
        );
        const json = await resp.json();
        if (!resp.ok || !json.ok) {
          setError(json.error || 'Failed to load inspection');
          return;
        }

        setInspection(json.inspection as Inspection);
      } catch (e: any) {
        console.error('ShareVerificationBadge: load error', e);
        setError(e.message || 'Unexpected error while loading inspection');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [inspectionId]);

  const handleDownloadPng = async () => {
    if (!badgeRef.current || !inspection) return;
    try {
      const node = badgeRef.current;
      const canvas = await html2canvas(node, { useCORS: true });
      const dataUrl = canvas.toDataURL('image/png');

      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `QuickMela-Verified-${inspection.id}.png`;
      link.click();
    } catch (e) {
      console.error('Failed to generate badge image', e);
    }
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto px-4 py-10 text-center text-gray-500">Preparing share badge…</div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto px-4 py-10 text-sm text-red-600">{error}</div>
    );
  }

  if (!inspection) {
    return (
      <div className="max-w-md mx-auto px-4 py-10 text-center text-gray-500">Inspection not found.</div>
    );
  }

  const product = inspection.product;
  const grade = inspection.final_grade || '—';
  const decision = (inspection.final_decision || inspection.final_status || '').toLowerCase();
  const isPass = decision === 'pass' || decision === 'approved';
  const gradeLabel = (() => {
    if (!isPass) return 'Inspection in progress';
    if (grade === 'A+') return 'Certified A+';
    if (grade === 'A') return 'Verified A';
    if (grade === 'B' || grade === 'C') return `AI Grade ${grade}`;
    return `Grade ${grade}`;
  })();

  const inspectedDate = inspection.reviewed_at || inspection.created_at;
  const inspectedOn = inspectedDate ? new Date(inspectedDate).toLocaleDateString() : null;
  const certificateUrl = `${window.location.origin}/inspection-report/${inspection.id}`;

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mb-4 text-xs text-gray-500 hover:text-gray-700"
      >
        ← Back
      </button>

      <div
        ref={badgeRef}
        className="rounded-2xl border border-indigo-200 bg-white p-4 shadow-md flex flex-col items-center text-center"
        style={{ maxWidth: 400, margin: '0 auto' }}
      >
        <div className="mb-2 text-[11px] font-semibold text-indigo-600 uppercase tracking-wide">
          Verified on QuickMela
        </div>
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">
            QM
          </div>
          <div className="text-left">
            <div className="text-xs font-semibold text-gray-900">QuickMela Trust Badge</div>
            <div className="text-[10px] text-gray-500">Share this on WhatsApp, social media or your website</div>
          </div>
        </div>

        <div className="px-3 py-2 rounded-xl bg-indigo-50 border border-indigo-100 mb-3 w-full">
          <div className="text-[11px] text-gray-600 mb-1">Inspection result</div>
          <div className="text-sm font-bold text-gray-900">{gradeLabel}</div>
        </div>

        <div className="mb-3 w-full">
          <div className="text-[11px] text-gray-500 mb-0.5">Product</div>
          <div className="text-xs font-semibold text-gray-900 line-clamp-2">
            {product?.title || 'QuickMela listing'}
          </div>
          <div className="text-[10px] text-gray-500">
            {product?.category || inspection.product_type}
          </div>
          {inspectedOn && (
            <div className="mt-1 text-[10px] text-gray-400">Inspected on {inspectedOn}</div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 w-full mt-1">
          <div className="flex flex-col items-center text-center flex-1">
            <div className="w-18 h-18 rounded-lg bg-white border border-gray-200 flex items-center justify-center overflow-hidden">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(
                  certificateUrl,
                )}`}
                alt="Scan to view certificate"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="mt-1 text-[9px] text-gray-500">Scan to view certificate</div>
          </div>
          <div className="flex-1 text-left">
            <div className="text-[10px] text-gray-500 mb-1">Certificate link</div>
            <div className="text-[10px] text-indigo-700 break-all">
              {certificateUrl.replace(/^https?:\/\//, '')}
            </div>
          </div>
        </div>

        <div className="mt-3 text-[9px] text-gray-400">
          Powered by QuickMela AI inspection
        </div>
      </div>

      <div className="mt-4 flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={handleDownloadPng}
          className="px-4 py-2 rounded-full bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700"
        >
          Download shareable badge (PNG)
        </button>
        <Link
          to={`/inspection-report/${inspection.id}`}
          className="text-[11px] text-indigo-600 hover:text-indigo-800 underline"
        >
          View full certificate
        </Link>
      </div>
    </div>
  );
};

export default ShareVerificationBadge;
