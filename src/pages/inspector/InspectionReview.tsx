import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSession } from '../../context/SessionContext';

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
  reviewed_by: string | null;
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
  status: string;
  manual_status: string | null;
  manual_notes: string | null;
  result: any;
}

interface InspectionFile {
  id: string;
  step_id: string | null;
  file_type: 'video' | 'photo' | 'document' | 'audio';
  path: string;
  metadata: any;
}

const statusBadgeClasses = (status: string | null | undefined) => {
  const s = (status || '').toLowerCase();
  if (s === 'approved') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (s === 'rejected') return 'bg-rose-50 text-rose-700 border-rose-200';
  if (s === 'awaiting_review' || s === 'ai_reviewed') return 'bg-amber-50 text-amber-700 border-amber-200';
  return 'bg-gray-50 text-gray-700 border-gray-200';
};

const statusBadgeLabel = (status: string | null | undefined) => {
  if (!status) return 'pending';
  return status.replace('_', ' ');
};

const InspectionReview: React.FC = () => {
  const { inspectionId } = useParams<{ inspectionId: string }>();
  const navigate = useNavigate();
  const { userProfile } = useSession();

  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [steps, setSteps] = useState<InspectionStep[]>([]);
  const [files, setFiles] = useState<InspectionFile[]>([]);
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingDecision, setSavingDecision] = useState(false);
  const [stepEdits, setStepEdits] = useState<Record<string, { manual_status: string | null; manual_notes: string }>>({});
  const [overallNotes, setOverallNotes] = useState('');

  useEffect(() => {
    if (!inspectionId) return;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const url = `/.netlify/functions/inspector-inspection-detail?inspectionId=${encodeURIComponent(
          inspectionId,
        )}`;
        const resp = await fetch(url);
        const json = await resp.json();

        if (!resp.ok || !json.ok) {
          setError(json.error || 'Failed to load inspection');
          return;
        }

        setInspection(json.inspection);
        setSteps(json.steps || []);
        setFiles(json.files || []);
        setSignedUrls({});

        // Seed per-step edits
        const initialEdits: Record<string, { manual_status: string | null; manual_notes: string }> = {};
        (json.steps || []).forEach((s: InspectionStep) => {
          initialEdits[s.id] = {
            manual_status: s.manual_status,
            manual_notes: s.manual_notes || '',
          };
        });
        setStepEdits(initialEdits);
      } catch (e: any) {
        console.error('Error loading inspection detail', e);
        setError(e.message || 'Unexpected error while loading inspection');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [inspectionId]);

  const aiReport = inspection?.ai_report || null;
  const overallScore = aiReport?.scores?.overall ?? null;

  const mediaForStep = (stepId: string) => files.filter((f) => f.step_id === stepId);

  // Fetch signed URLs for all media files when files change
  useEffect(() => {
    if (!files.length) return;

    let cancelled = false;

    const loadSignedUrls = async () => {
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
        console.error('Failed to load signed URLs for inspection media', e);
      }
    };

    loadSignedUrls();

    return () => {
      cancelled = true;
    };
  }, [files]);

  const handleStepStatusChange = (stepId: string, value: string) => {
    setStepEdits((prev) => ({
      ...prev,
      [stepId]: { ...(prev[stepId] || { manual_status: null, manual_notes: '' }), manual_status: value },
    }));
  };

  const handleStepNotesChange = (stepId: string, value: string) => {
    setStepEdits((prev) => ({
      ...prev,
      [stepId]: { ...(prev[stepId] || { manual_status: null, manual_notes: '' }), manual_notes: value },
    }));
  };

  const submitDecision = async (decision: 'approved' | 'rejected') => {
    if (!inspectionId || !userProfile?.id) return;
    setSavingDecision(true);

    try {
      const step_updates = Object.entries(stepEdits).map(([step_id, v]) => ({
        step_id,
        manual_status: v.manual_status,
        manual_notes: v.manual_notes,
      }));

      const payload = {
        inspection_id: inspectionId,
        decision,
        overall_notes: overallNotes || null,
        step_updates,
      };

      const fnName =
        decision === 'approved' ? 'inspector-approve-inspection' : 'inspector-reject-inspection';

      const resp = await fetch(`/.netlify/functions/${fnName}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await resp.json();

      if (!resp.ok || !json.ok) {
        setError(json.error || 'Failed to save decision');
        return;
      }

      navigate('/inspector');
    } catch (e: any) {
      console.error('Error submitting inspection decision', e);
      setError(e.message || 'Unexpected error while saving decision');
    } finally {
      setSavingDecision(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10 text-center text-gray-500">Loading inspection</div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10 text-sm text-red-600">{error}</div>
    );
  }

  if (!inspection) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10 text-center text-gray-500">Inspection not found.</div>
    );
  }

  const product = inspection.product;
  const status = inspection.final_status || inspection.status;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Inspection Review</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Review AI findings, evidence, and record your final decision.
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full border bg-gray-50 dark:bg-gray-900/60 text-gray-700 dark:text-gray-200">
              ID: {inspection.id}
            </span>
            <span
              className={
                'inline-flex items-center px-2 py-0.5 rounded-full border text-xs capitalize ' +
                statusBadgeClasses(status)
              }
            >
              {statusBadgeLabel(status)}
            </span>
            {inspection.final_grade && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full border bg-indigo-50 text-indigo-700 border-indigo-200">
                Grade: {inspection.final_grade}
              </span>
            )}
          </div>
        </div>
        <button
          type="button"
          className="text-xs text-gray-500 hover:text-gray-800"
          onClick={() => navigate('/inspector')}
        >
          Back to list
        </button>
      </div>

      {/* Product summary */}
      <div className="mb-6 border rounded-lg p-4 bg-white dark:bg-gray-900/60 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-2">Product summary</h2>
        <div className="text-sm text-gray-700 dark:text-gray-200">
          <div className="font-medium">{product?.title || 'Untitled product'}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {product?.brand || product?.model
              ? [product?.brand, product?.model].filter(Boolean).join(' ')
              : null}
            {product?.year ? `  b7 ${product.year}` : ''}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Category: {product?.category || inspection.product_type}
          </div>
        </div>
      </div>

      {/* AI summary */}
      <div className="mb-6 border rounded-lg p-4 bg-white dark:bg-gray-900/60 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3">AI summary</h2>
        {aiReport ? (
          <div className="space-y-3 text-sm text-gray-700 dark:text-gray-200">
            <div className="flex flex-wrap items-center gap-3">
              {aiReport.detected_brand && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-gray-50 text-gray-700 border border-gray-200 text-xs">
                  Brand: {aiReport.detected_brand}
                </span>
              )}
              {aiReport.detected_model && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-gray-50 text-gray-700 border border-gray-200 text-xs">
                  Model: {aiReport.detected_model}
                </span>
              )}
              {aiReport.detected_condition && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-gray-50 text-gray-700 border border-gray-200 text-xs">
                  Condition: {aiReport.detected_condition}
                </span>
              )}
            </div>
            {overallScore != null && (
              <div>
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                  <span>Overall AI score</span>
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
            {Array.isArray(aiReport.damages) && aiReport.damages.length > 0 && (
              <div>
                <div className="text-xs font-semibold mb-1">Damages detected</div>
                <ul className="text-xs list-disc list-inside space-y-0.5">
                  {aiReport.damages.map((d: any, idx: number) => (
                    <li key={idx}>
                      {d.type} at {d.location} ({d.severity})
                      {d.confidence != null && `  b7 ${Math.round(d.confidence * 100)}%`}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {Array.isArray(aiReport.fraud_signals) && aiReport.fraud_signals.length > 0 && (
              <div>
                <div className="text-xs font-semibold mb-1 text-rose-600">Fraud signals</div>
                <ul className="text-xs list-disc list-inside space-y-0.5">
                  {aiReport.fraud_signals.map((f: any, idx: number) => (
                    <li key={idx}>
                      {f.type}: {f.details}
                      {f.confidence != null && `  b7 ${Math.round(f.confidence * 100)}%`}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div className="text-xs text-gray-500">No AI report yet. Ask the seller or system admin to run analysis.</div>
        )}
      </div>

      {/* Steps and evidence */}
      <div className="mb-6 border rounded-lg p-4 bg-white dark:bg-gray-900/60 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3">Inspection steps</h2>
        <div className="space-y-4">
          {steps.map((step) => {
            const media = mediaForStep(step.id);
            const edit = stepEdits[step.id] || { manual_status: step.manual_status, manual_notes: step.manual_notes || '' };

            return (
              <div key={step.id} className="border rounded-md p-3 bg-gray-50 dark:bg-gray-900/40">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {step.title}
                    </div>
                    {step.description && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{step.description}</div>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Type: {step.step_type}
                  </div>
                </div>

                {media.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-3">
                    {media.map((m) => {
                      const key = `${m.id}`;
                      const url = signedUrls[m.id];

                      if (!url) {
                        return (
                          <div key={key} className="text-xs text-gray-400">
                            Loading media   
                          </div>
                        );
                      }

                      if (m.file_type === 'photo') {
                        return (
                          <div key={key} className="w-32 h-32 rounded overflow-hidden border bg-gray-100">
                            <img
                              src={url}
                              alt={step.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        );
                      }

                      if (m.file_type === 'video') {
                        return (
                          <div key={key} className="w-40">
                            <video
                              src={url}
                              controls
                              className="w-full rounded border bg-black max-h-40"
                            />
                          </div>
                        );
                      }

                      return (
                        <div key={key} className="text-xs text-gray-500">
                          {m.file_type} file
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] text-gray-500 mb-1">Manual status</label>
                    <select
                      className="w-full border border-gray-300 dark:border-gray-700 rounded px-2 py-1 text-xs bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100"
                      value={edit.manual_status || ''}
                      onChange={(e) => handleStepStatusChange(step.id, e.target.value || '')}
                    >
                      <option value="">Pending</option>
                      <option value="pass">Pass</option>
                      <option value="fail">Fail</option>
                      <option value="retake_needed">Retake needed</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[11px] text-gray-500 mb-1">Inspector notes</label>
                    <textarea
                      className="w-full border border-gray-300 dark:border-gray-700 rounded px-2 py-1 text-xs bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100"
                      rows={2}
                      value={edit.manual_notes}
                      onChange={(e) => handleStepNotesChange(step.id, e.target.value)}
                    />
                  </div>
                </div>
              </div>
            );
          })}
          {steps.length === 0 && (
            <div className="text-xs text-gray-500">No steps recorded for this inspection.</div>
          )}
        </div>
      </div>

      {/* Final decision */}
      <div className="border rounded-lg p-4 bg-white dark:bg-gray-900/60 shadow-sm mb-10">
        <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-2">Final decision</h2>
        <div className="mb-3 text-xs text-gray-600 dark:text-gray-300">
          Record your final call based on AI findings and manual review. Approved inspections can move to
          "verified" inventory.
        </div>
        <label className="block text-[11px] text-gray-500 mb-1">Overall notes</label>
        <textarea
          className="w-full border border-gray-300 dark:border-gray-700 rounded px-2 py-1 text-xs bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 mb-3"
          rows={3}
          value={overallNotes}
          onChange={(e) => setOverallNotes(e.target.value)}
          placeholder="Summarize condition, major issues, and any fraud concerns."
        />
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={savingDecision}
            onClick={() => submitDecision('approved')}
            className="inline-flex items-center px-3 py-2 rounded bg-emerald-600 text-white text-xs hover:bg-emerald-700 disabled:bg-gray-400"
          >
            Approve inspection
          </button>
          <button
            type="button"
            disabled={savingDecision}
            onClick={() => submitDecision('rejected')}
            className="inline-flex items-center px-3 py-2 rounded bg-rose-600 text-white text-xs hover:bg-rose-700 disabled:bg-gray-400"
          >
            Reject inspection
          </button>
        </div>
      </div>
    </div>
  );
};

export default InspectionReview;
