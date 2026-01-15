import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { supabase } from '../config/supabaseClient';
import { supportService } from '../services/supportService';
import { Ticket, TicketComment, TicketAttachment, TicketStatus, TicketPriority } from '../types/support';

const SupportTicketDetail: React.FC = () => {
  const { id } = useParams();
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [comments, setComments] = useState<TicketComment[]>([]);
  const [attachments, setAttachments] = useState<TicketAttachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState<FileList | null>(null);
  const [isInternal, setIsInternal] = useState(false);

  const canPost = useMemo(() => !!message.trim() || (files && files.length > 0), [message, files]);

  const loadAll = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      let userId: string | null = null;
      try {
        const demoRaw = localStorage.getItem('demo-session');
        if (demoRaw) {
          const demo = JSON.parse(demoRaw);
          userId = demo?.user?.id || null;
        }
      } catch {}
      if (!userId) {
        const { data: sessionRes } = await supabase.auth.getSession();
        userId = sessionRes.session?.user?.id || null;
      }
      if (!userId) throw new Error('Not authenticated');

      const t = await supportService.getTicketById(id);
      const c = await supportService.getComments(id);
      const a = await supportService.getAttachments(id);

      setTicket(t);
      setComments(c || []);
      setAttachments(a || []);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load ticket';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, [id]);

  const addComment = async () => {
    if (!id) return;
    try {
      let userId: string | null = null;
      try {
        const demoRaw = localStorage.getItem('demo-session');
        if (demoRaw) {
          const demo = JSON.parse(demoRaw);
          userId = demo?.user?.id || null;
        }
      } catch {}
      if (!userId) {
        const { data: sessionRes } = await supabase.auth.getSession();
        userId = sessionRes.session?.user?.id || null;
      }
      if (!userId) throw new Error('Not authenticated');

      const role = isAdminRoute ? 'admin' : 'user';

      if (message.trim()) {
        await supportService.addComment(id, userId, role, message, isInternal);
      }

      if (files && files.length > 0) {
        setUploading(true);
        for (const file of Array.from(files)) {
          await supportService.uploadAttachment(id, userId, file);
        }
        setUploading(false);
      }

      setMessage('');
      setFiles(null);
      setIsInternal(false);
      await loadAll();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to post';
      setError(msg);
    } finally {
      setUploading(false);
    }
  };

  const updateStatus = async (status: TicketStatus) => {
    if (!id) return;
    try {
      await supportService.updateStatus(id, status);
      loadAll();
    } catch (err) {
      console.error(err);
    }
  };

  const updatePriority = async (priority: TicketPriority) => {
    if (!id) return;
    try {
      await supportService.updateTicket(id, { priority });
      loadAll();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-4 text-sm">
        <Link to={isAdminRoute ? "/admin/tickets" : "/support"} className="text-indigo-600">
          ← Back to tickets
        </Link>
      </div>
      {loading && <div>Loading…</div>}
      {error && <div className="text-red-600 text-sm">{error}</div>}
      {ticket && (
        <div className="bg-white dark:bg-gray-900 rounded-lg border dark:border-gray-700 p-5">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-semibold">{ticket.subject}</h1>
              <div className="text-sm text-gray-500">{ticket.category} • {new Date(ticket.created_at).toLocaleString()}</div>
            </div>
            <div className="flex flex-col gap-2 items-end">
              <div className="flex gap-2">
                <span className={`text-xs px-2 py-1 rounded-full border ${
                  ticket.status === 'open' ? 'bg-green-100 text-green-800' :
                  ticket.status === 'closed' ? 'bg-gray-100 text-gray-800' :
                  'bg-blue-100 text-blue-800'
                }`}>{ticket.status}</span>
                <span className="text-xs px-2 py-1 rounded-full border">{ticket.priority}</span>
              </div>
              
              {isAdminRoute && (
                <div className="flex gap-2 mt-2">
                  <select 
                    value={ticket.status}
                    onChange={(e) => updateStatus(e.target.value as TicketStatus)}
                    className="text-xs border rounded px-1 py-0.5"
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="waiting_user">Waiting User</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                  <select 
                    value={ticket.priority}
                    onChange={(e) => updatePriority(e.target.value as TicketPriority)}
                    className="text-xs border rounded px-1 py-0.5"
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              )}
              
              {!isAdminRoute && ticket.status !== 'resolved' && ticket.status !== 'closed' && (
                <button 
                  onClick={() => updateStatus('resolved')}
                  className="text-xs px-2 py-1 border border-green-600 text-green-600 rounded hover:bg-green-50"
                >
                  Mark Resolved
                </button>
              )}
            </div>
          </div>

          <div className="mt-6">
            <h2 className="text-sm font-semibold mb-2">Conversation</h2>
            <div className="space-y-3">
              {comments.map((c) => (
                <div key={c.id} className={`rounded border dark:border-gray-700 p-3 ${c.is_internal ? 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200' : ''}`}>
                  <div className="flex justify-between items-start mb-1">
                    <div className="text-xs text-gray-500">
                      <span className={`font-medium ${c.author_role === 'admin' ? 'text-indigo-600' : ''}`}>
                        {c.author_role === 'admin' ? 'Support Team' : 'You'}
                      </span>
                      {c.is_internal && <span className="ml-2 text-yellow-600 bg-yellow-100 px-1 rounded text-[10px]">Internal Note</span>}
                      <span className="mx-1">•</span>
                      {new Date(c.created_at).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-sm whitespace-pre-wrap">{c.message}</div>
                </div>
              ))}
              {comments.length === 0 && (
                <div className="text-sm text-gray-500">No comments yet.</div>
              )}
            </div>
          </div>

          {/* Attachments */}
          <div className="mt-6">
            <h3 className="text-sm font-semibold mb-2">Attachments</h3>
            <div className="space-y-2">
              {attachments.length === 0 && (
                <div className="text-sm text-gray-500">No attachments.</div>
              )}
              {attachments.map((att) => (
                <AttachmentItem key={att.id} att={att} />
              ))}
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-sm font-semibold mb-2">Add a reply</h3>
            <textarea
              className="w-full rounded border px-3 py-2 bg-transparent"
              rows={3}
              placeholder={isAdminRoute ? "Reply to customer or add internal note..." : "Describe your update or attach screenshots"}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <div className="mt-2 flex items-center gap-3 justify-between">
              <div className="flex items-center gap-3">
                <input type="file" multiple accept="image/*,video/*" onChange={(e) => setFiles(e.target.files)} className="text-sm" />
                {isAdminRoute && (
                  <label className="flex items-center gap-1 text-sm">
                    <input 
                      type="checkbox" 
                      checked={isInternal} 
                      onChange={(e) => setIsInternal(e.target.checked)} 
                    />
                    Internal Note
                  </label>
                )}
              </div>
              <button disabled={!canPost || uploading} onClick={addComment} className="px-4 py-2 rounded bg-indigo-600 text-white disabled:opacity-50">
                {uploading ? 'Uploading…' : 'Post'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const AttachmentItem: React.FC<{ att: TicketAttachment }> = ({ att }) => {
  const [url, setUrl] = React.useState<string | null>(null);
  const isHttp = /^https?:\/\//i.test(att.file_url);

  useEffect(() => {
    let isMounted = true;
    const getUrl = async () => {
      if (isHttp) {
        if (isMounted) setUrl(att.file_url);
        return;
      }
      const { data, error } = await supabase.storage.from('ticket-attachments').createSignedUrl(att.file_url, 60 * 10);
      if (!error && data && isMounted) setUrl(data.signedUrl);
    };
    getUrl();
    return () => { isMounted = false; };
  }, [att.file_url, isHttp]);

  return (
    <div className="flex items-center justify-between rounded border dark:border-gray-700 p-2 text-sm">
      <div className="flex-1">
        <div className="font-medium truncate max-w-[60%]">{att.file_url.split('/').slice(-1)[0]}</div>
        <div className="text-xs text-gray-500">{att.file_type || 'file'} • {(att.size_bytes / 1024).toFixed(1)} KB</div>
      </div>
      <div>
        {url ? (
          <a href={url} target="_blank" rel="noreferrer" className="px-3 py-1 border rounded">Download</a>
        ) : (
          <span className="text-xs text-gray-500">Generating link…</span>
        )}
      </div>
    </div>
  );
};

export default SupportTicketDetail;
