import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// NOTE: Ensure you install these dependencies in your project:
// npm install jspdf html2canvas
// or
// yarn add jspdf html2canvas
import jsPDF from 'jspdf';
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
  ai_report: any | null;
  created_at: string;
  reviewed_at: string | null;
  product: InspectionProduct | null;
}

interface InspectionStep {
  id: string;
  inspection_id: string;
  step_key: string;
  title: string;
  description: string | null;
  step_type: string;
  sequence: number;
}

interface InspectionFile {
  id: string;
  step_id: string | null;
  file_type: 'video' | 'photo' | 'document' | 'audio';
  path: string;
  metadata: any;
}

const InspectionReport: React.FC = () => {
  const { inspectionId } = useParams<{ inspectionId: string }>();
  const navigate = useNavigate();

  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [steps, setSteps] = useState<InspectionStep[]>([]);
  const [files, setFiles] = useState<InspectionFile[]>([]);
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [lightboxType, setLightboxType] = useState<'photo' | 'video' | null>(null);
  const certificateRef = useRef<HTMLDivElement | null>(null);

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
          setError(json.error || 'Failed to load inspection report');
          return;
        }

        setInspection(json.inspection);
        setSteps(json.steps || []);
        setFiles(json.files || []);
        setSignedUrls({});
      } catch (e: any) {
        console.error('InspectionReport: load error', e);
        setError(e.message || 'Unexpected error while loading report');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [inspectionId]);

  // Signed URLs for media
  useEffect(() => {
    if (!files.length) return;
    let cancelled = false;

    const loadSigned = async () => {
      try {
        const entries = await Promise.all(
          files.map(async (f) => {
            try {
              const resp = await fetch('/.netlify/functions/get-inspection-file-url', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ path: f.path }),
              });
              const json = await resp.json();
              if (!resp.ok || !json.ok || !json.url) return [f.id, ''] as const;
              return [f.id, json.url] as const;
            } catch {
              return [f.id, ''] as const;
            }
          }),
        );
        if (cancelled) return;
        const next: Record<string, string> = {};
        for (const [id, url] of entries) {
          if (url) next[id] = url;
        }
        setSignedUrls(next);
      } catch (e) {
        console.error('InspectionReport: signed URL load error', e);
      }
    };

    loadSigned();
    return () => {
      cancelled = true;
    };
  }, [files]);

  const ai = inspection?.ai_report || null;
  const overallScore = ai?.scores?.overall ?? null;

  const status = (inspection?.final_status || inspection?.status || 'pending').toLowerCase();
  const statusLabel = (inspection?.final_status || inspection?.status || 'pending').replace('_', ' ');

  const statusClasses =
    status === 'approved'
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : status === 'rejected'
      ? 'bg-rose-50 text-rose-700 border-rose-200'
      : 'bg-amber-50 text-amber-700 border-amber-200';

  const mediaForStep = (stepId: string) => files.filter((f) => f.step_id === stepId);

  if (loading) {
    return (
      <div className="max-w-md mx-auto px-4 py-10 text-center text-gray-500">Loading inspection report…</div>
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

  const inspectedDate = inspection.reviewed_at || inspection.created_at;
  const inspectedOn = inspectedDate ? new Date(inspectedDate).toLocaleString() : null;
  const reportUrl = typeof window !== 'undefined' ? window.location.href : '';

  const gradeExplanation = (() => {
    switch (inspection.final_grade) {
      case 'A+':
        return 'Certified: zero critical defects, minimal cosmetic wear, functionally excellent.';
      case 'A':
        return 'Verified: fully working, minor cosmetic wear, no major functional issues.';
      case 'B':
        return 'Good: functional with visible cosmetic wear, suitable for regular use.';
      case 'C':
        return 'Acceptable: working with moderate wear or minor functional deviations.';
      default:
        return null;
    }
  })();

  const handleDownloadCertificatePdf = async () => {
    if (!certificateRef.current || !inspection) return;
    try {
      const element = certificateRef.current;
      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = pageWidth - 20; // 10mm margin each side
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      const y = (pageHeight - imgHeight) / 2;
      pdf.addImage(imgData, 'PNG', 10, Math.max(10, y), imgWidth, imgHeight, undefined, 'FAST');

      const fileName = `QuickMela-Certificate-${inspection.id}.pdf`;
      pdf.save(fileName);
    } catch (e) {
      console.error('Failed to generate certificate PDF', e);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-6 sm:py-8">
      {/* Certificate-style header */}
      <div
        ref={certificateRef}
        className="mb-4 rounded-2xl border border-indigo-200 dark:border-indigo-800 bg-gradient-to-r from-indigo-50 via-white to-indigo-50 dark:from-indigo-950 dark:via-gray-900 dark:to-indigo-950 p-4 flex items-start justify-between gap-3"
      >
        <div className="flex-1">
          <p className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-300 uppercase tracking-wide">
            QuickMela Certified Inspection
          </p>
          <h1 className="mt-1 text-base font-bold text-gray-900 dark:text-white">
            {product?.title || 'Inspection Report'}
          </h1>
          <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
            Certificate ID: <span className="font-mono">{inspection.id}</span>
          </p>
          {inspectedOn && (
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              Inspected on: {inspectedOn}
            </p>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px]">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              AI-backed
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              Fraud check completed
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-gray-50 text-gray-700 border border-gray-200">
              Multi-point inspection
            </span>
          </div>
        </div>
        <div className="flex flex-col items-center gap-2">
          {reportUrl && (
            <div className="flex flex-col items-center gap-1">
              <div className="w-16 h-16 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 flex items-center justify-center overflow-hidden">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=96x96&data=${encodeURIComponent(reportUrl)}`}
                  alt="Scan inspection report QR"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-[9px] text-gray-500 text-center">Scan to view</span>
            </div>
          )}
          <button
            type="button"
            onClick={handleDownloadCertificatePdf}
            className="mt-1 px-2 py-1 rounded-full bg-indigo-600 text-white text-[10px] hover:bg-indigo-700"
          >
            Download PDF
          </button>
        </div>
      </div>

      {/* Product summary */}
      <div className="mb-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              {product?.title || 'Product'}
            </p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              {product?.brand || product?.model
                ? [product?.brand, product?.model].filter(Boolean).join(' ')
                : product?.category || inspection.product_type}
            </p>
          </div>
          <span
            className={
              'inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] capitalize ' + statusClasses
            }
          >
            {statusLabel}
          </span>
        </div>
        {inspection.final_grade && (
          <p className="text-xs text-gray-700 dark:text-gray-200">
            Grade: <span className="font-semibold">{inspection.final_grade}</span>
          </p>
        )}
      </div>

      {/* AI summary */}
      <div className="mb-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4">
        <h2 className="text-xs font-semibold text-gray-800 dark:text-gray-100 mb-2">AI summary</h2>
        {ai ? (
          <div className="space-y-2 text-xs text-gray-700 dark:text-gray-200">
            {overallScore != null && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span>Overall confidence</span>
                  <span>{Math.round(overallScore * 100)}%</span>
                </div>
                <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-1.5 bg-indigo-500 rounded-full"
                    style={{ width: `${Math.round(overallScore * 100)}%` }}
                  />
                </div>
              </div>
            )}
            {Array.isArray(ai.damages) && ai.damages.length > 0 && (
              <div>
                <div className="font-semibold mb-1">Damages</div>
                <ul className="list-disc list-inside space-y-0.5">
                  {ai.damages.slice(0, 4).map((d: any, idx: number) => (
                    <li key={idx}>
                      {d.type} at {d.location} ({d.severity})
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {Array.isArray(ai.fraud_signals) && ai.fraud_signals.length > 0 && (
              <div>
                <div className="font-semibold text-rose-600 mb-1">Fraud checks</div>
                <ul className="list-disc list-inside space-y-0.5">
                  {ai.fraud_signals.map((f: any, idx: number) => (
                    <li key={idx}>
                      {f.type}: {f.details}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <p className="text-[11px] text-gray-500">
            AI analysis is not available yet. Once processed, summary and confidence scores will appear here.
          </p>
        )}
      </div>

      {/* Grade explanation */}
      {gradeExplanation && (
        <div className="mb-4 rounded-xl border border-blue-100 dark:border-blue-900 bg-blue-50/70 dark:bg-blue-950/40 p-3">
          <p className="text-[11px] font-semibold text-blue-900 dark:text-blue-100 mb-1">What this grade means</p>
          <p className="text-[11px] text-blue-900/80 dark:text-blue-100/80">{gradeExplanation}</p>
        </div>
      )}

      {/* Steps & media (mobile-friendly cards) */}
      <div className="mb-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4">
        <h2 className="text-xs font-semibold text-gray-800 dark:text-gray-100 mb-2">Inspection evidence</h2>
        <div className="space-y-3">
          {steps.map((step) => {
            const media = mediaForStep(step.id);
            return (
              <div key={step.id} className="rounded-lg border border-gray-100 dark:border-gray-800 p-3 bg-gray-50 dark:bg-gray-900/60">
                <p className="text-xs font-semibold text-gray-900 dark:text-white">{step.title}</p>
                {step.description && (
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">{step.description}</p>
                )}
                {media.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {media.map((m) => {
                      const url = signedUrls[m.id];
                      const key = `${m.id}`;
                      if (!url) {
                        return (
                          <div key={key} className="text-[10px] text-gray-400">
                            Loading…
                          </div>
                        );
                      }
                      if (m.file_type === 'photo') {
                        return (
                          <div key={key} className="w-24 h-24 rounded-md overflow-hidden border bg-gray-100">
                            <button
                              type="button"
                              className="w-full h-full"
                              onClick={() => {
                                setLightboxUrl(url);
                                setLightboxType('photo');
                              }}
                            >
                              <img src={url} alt={step.title} className="w-full h-full object-cover" />
                            </button>
                          </div>
                        );
                      }
                      if (m.file_type === 'video') {
                        return (
                          <div key={key} className="w-32">
                            <button
                              type="button"
                              className="w-full"
                              onClick={() => {
                                setLightboxUrl(url);
                                setLightboxType('video');
                              }}
                            >
                              <video src={url} controls className="w-full rounded-md border bg-black max-h-32" />
                            </button>
                          </div>
                        );
                      }
                      return (
                        <div key={key} className="text-[10px] text-gray-500">
                          {m.file_type} file
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
          {steps.length === 0 && (
            <p className="text-[11px] text-gray-500">No step-by-step evidence is available for this inspection.</p>
          )}
        </div>
      </div>

      {/* Footer note */}
      <p className="text-[10px] text-gray-500 text-center">
        This is an automated inspection report generated for transparency. Final purchase decisions should consider your
        own due diligence.
      </p>

      {lightboxUrl && lightboxType && (
        <div className="fixed inset-0 z-40 bg-black/70 flex items-center justify-center">
          <div className="max-w-lg w-full px-4" onClick={() => setLightboxUrl(null)}>
            <div className="mb-2 flex justify-end">
              <button
                type="button"
                className="text-xs text-gray-200 hover:text-white"
                onClick={() => setLightboxUrl(null)}
              >
                Close ×
              </button>
            </div>
            <div className="bg-black rounded-lg overflow-hidden border border-gray-700">
              {lightboxType === 'photo' && (
                <img src={lightboxUrl} alt="Inspection media" className="w-full h-auto object-contain" />
              )}
              {lightboxType === 'video' && (
                <video src={lightboxUrl} controls autoPlay className="w-full h-auto" />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InspectionReport;
