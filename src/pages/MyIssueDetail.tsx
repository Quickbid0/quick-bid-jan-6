import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../config/supabaseClient';
import { Loader2, ArrowLeft, AlertCircle, CheckCircle, Clock, FileText, Image as ImageIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface IssueRow {
  id: string;
  user_id: string;
  auction_id: string;
  product_id: string | null;
  reason: string;
  description: string;
  attachment_url: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  product?: {
    id: string;
    title: string;
    image_url?: string | null;
  } | null;
}

const REASON_LABELS: Record<string, string> = {
  damaged_item: 'Damaged item',
  wrong_item: 'Wrong item delivered',
  missing_parts: 'Missing parts',
  late_delivery: 'Late delivery',
  payment_issue: 'Payment issue',
  other: 'Other',
};

const MyIssueDetail: React.FC = () => {
  const { issueId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [issue, setIssue] = useState<IssueRow | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!issueId) {
        setError('Missing issue reference.');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);

        const [{ data: sessionData, error: sessionError }, { data, error: issueError }] = await Promise.all([
          supabase.auth.getSession(),
          supabase
            .from('issues')
            .select(`
              id,
              user_id,
              auction_id,
              product_id,
              reason,
              description,
              attachment_url,
              status,
              created_at,
              updated_at,
              product:products(id, title, image_url)
            `)
            .eq('id', issueId)
            .maybeSingle(),
        ] as any);

        const userId = sessionData?.session?.user?.id;
        if (sessionError) {
          console.error('MyIssueDetail: session error', sessionError);
        }
        if (!userId) {
          setError('You must be logged in to view this issue.');
          setLoading(false);
          return;
        }

        if (issueError || !data) {
          console.error('MyIssueDetail: error loading issue', issueError);
          setError('We could not find this issue.');
          setLoading(false);
          return;
        }

        if (data.user_id !== userId) {
          setError('You are not allowed to view this issue.');
          setLoading(false);
          return;
        }

        setIssue(data as IssueRow);
      } catch (e) {
        console.error('MyIssueDetail: unexpected error', e);
        setError('Unexpected error while loading issue details.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [issueId]);

  const renderStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'resolved') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs">
          <CheckCircle className="h-3 w-3 mr-1" />
          Resolved
        </span>
      );
    }
    if (s === 'in_progress') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs">
          <Clock className="h-3 w-3 mr-1" />
          In progress
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs">
        <AlertCircle className="h-3 w-3 mr-1" />
        Open
      </span>
    );
  };

  const renderTimeline = (status: string) => {
    const s = status.toLowerCase();
    const step1Done = true;
    const step2Done = s === 'in_progress' || s === 'resolved';
    const step3Done = s === 'resolved';

    const stepClass = (done: boolean, current: boolean) =>
      done
        ? 'text-emerald-700'
        : current
        ? 'text-blue-700'
        : 'text-gray-400';

    return (
      <div className="mt-4 flex flex-col gap-2 text-[11px]">
        <div className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${step1Done ? 'bg-emerald-500' : 'bg-gray-300'}`} />
          <span className={stepClass(step1Done, !step2Done && !step3Done)}>Issue created</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${step2Done ? 'bg-emerald-500' : 'bg-gray-300'}`} />
          <span className={stepClass(step2Done, !step3Done && !step1Done)}>In progress</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${step3Done ? 'bg-emerald-500' : 'bg-gray-300'}`} />
          <span className={stepClass(step3Done, !step2Done && !step1Done)}>Resolved</span>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (error || !issue) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12 text-center">
        <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Issue not available</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-4">{error || 'Issue details for this reference are not available.'}</p>
        <button
          type="button"
          onClick={() => navigate('/my/issues')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to My Issues
        </button>
      </div>
    );
  }

  const reasonLabel = REASON_LABELS[issue.reason] || issue.reason;
  const created = issue.created_at ? new Date(issue.created_at).toLocaleString() : '';
  const product = issue.product;
  const isResolved = issue.status.toLowerCase() === 'resolved';

  const isImageUrl = (url: string) => /\.(png|jpe?g|gif|webp)$/i.test(url.split('?')[0]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <button
        type="button"
        onClick={() => navigate('/my/issues')}
        className="mb-4 inline-flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300 hover:text-indigo-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to My Issues
      </button>

      <div className="mb-4 flex items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Issue Details</h1>
          <p className="text-xs text-gray-500">Created on {created}</p>
        </div>
        <div>{renderStatusBadge(issue.status)}</div>
      </div>

      {/* Product context */}
      <div className="mb-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 flex gap-3">
        {product?.image_url && (
          <img
            src={product.image_url}
            alt={product.title}
            className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
          />
        )}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 dark:text-white text-sm md:text-base truncate">
            {product?.title || 'Auction item'}
          </p>
          <p className="text-[11px] text-gray-500 break-all">Auction ID: {issue.auction_id}</p>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px]">
            {issue.product_id && (
              <Link
                to={`/product/${issue.product_id}`}
                className="inline-flex items-center text-indigo-600 hover:text-indigo-800 underline"
              >
                View auction
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Issue info */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-4">
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 text-xs">
            {reasonLabel}
          </span>
        </div>
        <div className="text-sm text-gray-800 dark:text-gray-100 whitespace-pre-wrap mb-3">
          {issue.description}
        </div>

        {issue.attachment_url && (
          <div className="mt-2 text-xs text-gray-700 dark:text-gray-200">
            <p className="font-semibold mb-1">Attachment</p>
            {isImageUrl(issue.attachment_url) ? (
              <a
                href={issue.attachment_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex flex-col items-start gap-1"
              >
                <img
                  src={issue.attachment_url}
                  alt="Attachment"
                  className="w-32 h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                />
                <span className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 mt-1">
                  <ImageIcon className="h-3 w-3" />
                  View full image
                </span>
              </a>
            ) : (
              <a
                href={issue.attachment_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800"
              >
                <FileText className="h-3 w-3" />
                Open attachment
              </a>
            )}
          </div>
        )}

        {renderTimeline(issue.status)}
      </div>

      {/* Admin notes placeholder */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-4 text-xs text-gray-600 dark:text-gray-300">
        <p className="font-semibold mb-1">Admin response</p>
        <p>
          Our support team may add responses or status updates to this issue. These will appear here once they are
          available.
        </p>
      </div>

      <div className="text-xs text-gray-500 dark:text-gray-400">
        {isResolved ? (
          <p className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3 text-emerald-500" />
            This issue has been marked as resolved. If you still need help, please contact support with your auction ID and
            issue ID <span className="font-mono">{issue.id}</span>.
          </p>
        ) : (
          <p>
            We are reviewing your issue. You&apos;ll be notified once there is an update. You can refer to this issue using ID
            <span className="font-mono"> {issue.id}</span> when contacting support.
          </p>
        )}
      </div>
    </div>
  );
};

export default MyIssueDetail;
