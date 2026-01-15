import React, { useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '../../config/supabaseClient';
import { toast } from 'react-hot-toast';
import { Send, MessageCircle, RefreshCw } from 'lucide-react';

interface Conversation {
  id: string;
  user_id: string;
  status: 'open' | 'closed';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  created_at: string;
  updated_at: string;
}

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string | null;
  sender_role: 'user' | 'admin';
  content: string;
  created_at: string;
}


const priorityLabels: Record<Conversation['priority'], { label: string; color: string }> = {
  low: { label: 'Low', color: 'bg-green-100 text-green-800' },
  normal: { label: 'Normal', color: 'bg-blue-100 text-blue-800' },
  high: { label: 'High', color: 'bg-orange-100 text-orange-800' },
  urgent: { label: 'Urgent', color: 'bg-red-100 text-red-800' }
};

const formatRelativeAgo = (dateString: string) => {
  const now = Date.now();
  const target = new Date(dateString).getTime();
  const diff = now - target;
  if (diff < 60 * 1000) return 'Just now';
  if (diff < 60 * 60 * 1000) return `${Math.floor(diff / (60 * 1000))}m ago`;
  if (diff < 24 * 60 * 60 * 1000) return `${Math.floor(diff / (60 * 60 * 1000))}h ago`;
  return `${Math.floor(diff / (24 * 60 * 60 * 1000))}d ago`;
};

const AdminSupportChat: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loadingConv, setLoadingConv] = useState(false);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [typingStatus, setTypingStatus] = useState<Record<string, string>>({});
  const [filterPriority, setFilterPriority] = useState<Conversation['priority'] | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<Conversation['status'] | 'all'>('all');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [aiInsights, setAiInsights] = useState<Record<string, { sentiment: 'positive' | 'neutral' | 'negative'; summary: string }>>({});
  const listRef = useRef<HTMLDivElement>(null);
  const typingChannelRef = useRef<any>(null);
  const typingTimeouts = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const scrollToBottom = () => {
    requestAnimationFrame(() => listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' }));
  };

  const loadConversations = async () => {
    setLoadingConv(true);
    const { data, error } = await supabase
      .from('support_conversations')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(100);
    setLoadingConv(false);
    if (error) return toast.error('Failed to load conversations');
    setConversations(data as Conversation[]);
    setUnreadCounts((prev) => {
      const updated: Record<string, number> = {};
      (data || []).forEach((conv: Conversation) => {
        updated[conv.id] = prev[conv.id] ?? 0;
      });
      return updated;
    });
    if (!activeId && data && data[0]) setActiveId(data[0].id);
  };

  useEffect(() => {
    const handle = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 300);
    return () => clearTimeout(handle);
  }, [searchTerm]);

  const messagesByConversation = useMemo(() => {
    return messages.reduce<Record<string, Message[]>>((acc, msg) => {
      if (!acc[msg.conversation_id]) acc[msg.conversation_id] = [];
      acc[msg.conversation_id].push(msg);
      return acc;
    }, {});
  }, [messages]);

  const aiInsightsMemo = useMemo(() => {
    const insights: typeof aiInsights = {};
    conversations.forEach((conv) => {
      const lastMessage = messagesByConversation[conv.id]?.slice(-1)[0];
      const tone = lastMessage?.content.includes('issue') ? 'negative' : lastMessage?.content.includes('thanks') ? 'positive' : 'neutral';
      insights[conv.id] = {
        sentiment: tone,
        summary: lastMessage
          ? `${lastMessage.sender_role === 'user' ? 'User' : 'Admin'} says ${lastMessage.content.slice(0, 120)}${lastMessage.content.length > 120 ? '…' : ''}`
          : 'No messages yet.'
      };
    });
    return insights;
  }, [conversations, messagesByConversation]);

  const filteredConversations = useMemo(() => {
    return conversations.filter((conv) => {
      if (filterPriority !== 'all' && conv.priority !== filterPriority) return false;
      if (filterStatus !== 'all' && conv.status !== filterStatus) return false;
      if (showUnreadOnly && !(unreadCounts[conv.id] > 0)) return false;
      if (debouncedSearch) {
        const normalizedTerm = debouncedSearch.toLowerCase();
        if (!conv.id.toLowerCase().includes(normalizedTerm)) {
          const conversationMessages = messagesByConversation[conv.id] || [];
          const messageMatch = conversationMessages.some((m) => m.content.toLowerCase().includes(normalizedTerm));
          if (!messageMatch) return false;
        }
      }
      return true;
    });
  }, [conversations, filterPriority, filterStatus, showUnreadOnly, unreadCounts]);

  useEffect(() => {
    setAiInsights(aiInsightsMemo);
  }, [aiInsightsMemo]);

  const toggleConversationSelection = (id: string) => {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]);
  };

  const markSelectedAsRead = async () => {
    setUnreadCounts((prev) => {
      const next = { ...prev };
      selectedIds.forEach((id) => { next[id] = 0; });
      return next;
    });
    setSelectedIds([]);
  };

  const closeSelected = async () => {
    await supabase.from('support_conversations').update({ status: 'closed' }).in('id', selectedIds);
    setConversations((prev) => prev.map((conv) => selectedIds.includes(conv.id) ? { ...conv, status: 'closed' } : conv));
    setSelectedIds([]);
  };

  const loadMessages = async (conversationId: string) => {
    setLoadingMsgs(true);
    const { data, error } = await supabase
      .from('support_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
    setLoadingMsgs(false);
    if (error) return toast.error('Failed to load messages');
    setMessages(data as Message[]);
    scrollToBottom();
    setUnreadCounts((prev) => ({ ...prev, [conversationId]: 0 }));
  };

  useEffect(() => {
    loadConversations();
    const channel = supabase
      .channel('admin-chat-conv')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'support_conversations' }, () => loadConversations())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  useEffect(() => {
    if (!activeId) return;
    loadMessages(activeId);
    const channel = supabase
      .channel(`admin-chat:${activeId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'support_messages', filter: `conversation_id=eq.${activeId}` }, (payload) => {
        setMessages((prev) => [...prev, payload.new as any]);
        scrollToBottom();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [activeId]);

  useEffect(() => {
    const channel = supabase
      .channel('admin-chat-global-msg')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'support_messages' }, (payload) => {
        const convId = payload.new.conversation_id;
        if (convId && convId !== activeId) {
          setUnreadCounts((prev) => ({ ...prev, [convId]: (prev[convId] || 0) + 1 }));
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [activeId]);

  useEffect(() => {
    const channel = supabase.channel('admin-support-typing');
    channel.subscribe();
    typingChannelRef.current = channel;
    channel.on('broadcast', { event: 'user-typing' }, ({ payload }: any) => {
      const convId = payload?.conversation_id;
      if (!convId) return;
      setTypingStatus((prev) => ({ ...prev, [convId]: payload.display || 'User is typing…' }));
      if (typingTimeouts.current[convId]) {
        clearTimeout(typingTimeouts.current[convId]);
      }
      typingTimeouts.current[convId] = setTimeout(() => {
        setTypingStatus((prev) => {
          const next = { ...prev };
          delete next[convId];
          return next;
        });
      }, 2500);
    });
    return () => {
      supabase.removeChannel(channel);
      typingChannelRef.current = null;
    };
  }, []);

  const send = async () => {
    if (!activeId || !input.trim()) return;
    const text = input.trim();
    setInput('');
    const { data: sess } = await supabase.auth.getSession();
    const adminId = sess.session?.user?.id || null;
    const { error } = await supabase.from('support_messages').insert({
      conversation_id: activeId,
      sender_id: adminId,
      sender_role: 'admin',
      content: text,
    });
    if (error) {
      toast.error('Failed to send');
      setInput(text);
    }
  };

  const activeConversation = useMemo(() => conversations.find((conv) => conv.id === activeId), [conversations, activeId]);

  return (
    <div className="max-w-7xl mx-auto p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="md:col-span-3">
      </div>
      <div className="md:col-span-1 border dark:border-gray-700 rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-800">
          <h2 className="font-semibold flex items-center gap-2"><MessageCircle className="w-4 h-4" /> Conversations</h2>
          <button onClick={loadConversations} className="text-sm flex items-center gap-1 px-2 py-1 rounded border dark:border-gray-700"><RefreshCw className="w-3 h-3" />Refresh</button>
        </div>
        <div className="space-y-3 p-3">
          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
            <label className="flex items-center gap-1">
              Priority:
              <select
                value={filterPriority}
                onChange={(event) => setFilterPriority(event.target.value as Conversation['priority'] | 'all')}
                className="rounded border px-2 py-1 text-xs"
              >
                <option value="all">All</option>
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </label>
            <label className="flex items-center gap-1">
              Status:
              <select
                value={filterStatus}
                onChange={(event) => setFilterStatus(event.target.value as Conversation['status'] | 'all')}
                className="rounded border px-2 py-1 text-xs"
              >
                <option value="all">All</option>
                <option value="open">Open</option>
                <option value="closed">Closed</option>
              </select>
            </label>
            <label className="flex items-center gap-1">
              <input type="checkbox" checked={showUnreadOnly} onChange={(event) => setShowUnreadOnly(event.target.checked)} />
              Show unread only
            </label>
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by ID or message"
              className="rounded border px-2 py-1 text-xs"
            />
          </div>
          <div className="max-h-[60vh] overflow-y-auto space-y-1">
            {loadingConv && <div className="p-3 text-sm text-gray-500">Loading…</div>}
            {!loadingConv && filteredConversations.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveId(c.id)}
                className={`w-full text-left px-3 py-2 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 ${activeId === c.id ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{c.id.slice(0, 8)}…</span>
                  {unreadCounts[c.id] > 0 && (
                    <span className="text-[11px] font-semibold text-white bg-indigo-600 px-2 py-0.5 rounded-full">
                      {unreadCounts[c.id]} new
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{c.status}</span>
                  <span>{formatRelativeAgo(c.updated_at)}</span>
                </div>
                <div className="text-[11px] mt-1 flex gap-2">{priorityLabels[c.priority].label}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="md:col-span-2 border dark:border-gray-700 rounded-lg flex flex-col">
        <div className="px-3 py-2 bg-gray-50 dark:bg-gray-800 flex items-center justify-between">
          <div className="font-semibold">Conversation {activeId ? activeId.slice(0,8) : ''}</div>
        </div>
        <div ref={listRef} className="flex-1 min-h-[50vh] max-h-[70vh] overflow-y-auto p-3 space-y-2">
          {loadingMsgs && <div className="text-sm text-gray-500">Loading…</div>}
          {!loadingMsgs && messages.map((m) => (
            <div key={m.id} className={`flex ${m.sender_role === 'admin' ? 'justify-end' : 'justify-start'}`}>
              <div className={`rounded px-3 py-2 text-sm ${m.sender_role === 'admin' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 dark:text-gray-100'}`}>
                {m.content}
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 p-3 border-t dark:border-gray-700">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            placeholder="Type a reply…"
            className="flex-1 rounded border dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm"
          />
          <button onClick={send} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded">
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminSupportChat;
