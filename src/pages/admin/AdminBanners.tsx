import React, { useEffect, useState } from 'react';
import { supabase } from '../../config/supabaseClient';
import { toast } from 'react-hot-toast';

interface BannerAsset {
  id: string;
  image_url: string;
  link_url: string | null;
  title?: string | null;
  alt_text?: string | null;
}

interface BannerSchedule {
  id: string;
  slot: string;
  start_at: string;
  end_at: string;
  banner_assets?: BannerAsset | BannerAsset[] | null;
}

interface BannerIdea {
  title: string;
  subtitle?: string;
  theme?: string;
  mediaType?: string;
}

const AdminBanners: React.FC = () => {
  const [banners, setBanners] = useState<BannerSchedule[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiIdeas, setAiIdeas] = useState<BannerIdea[]>([]);

  const selected = banners.find((b) => b.id === selectedId) || null;
  const asset = (() => {
    if (!selected) return null;
    const joined = selected.banner_assets;
    if (Array.isArray(joined)) return (joined[0] as BannerAsset | undefined) || null;
    return (joined as BannerAsset | null) || null;
  })();

  const [form, setForm] = useState({
    slot: '',
    start_at: '',
    end_at: '',
    image_url: '',
    link_url: '',
    title: '',
    alt_text: '',
  });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('banner_schedules')
          .select('id, slot, start_at, end_at, banner_assets ( id, image_url, link_url, title, alt_text )')
          .order('start_at', { ascending: false });
        if (error) throw error;
        setBanners((data || []) as BannerSchedule[]);
      } catch (e) {
        console.error('Failed to load banners', e);
        toast.error('Failed to load banners');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!selected) return;
    const a = asset;
    setForm({
      slot: selected.slot || '',
      start_at: selected.start_at?.slice(0, 16) || '',
      end_at: selected.end_at?.slice(0, 16) || '',
      image_url: a?.image_url || '',
      link_url: a?.link_url || '',
      title: a?.title || '',
      alt_text: a?.alt_text || '',
    });
  }, [selectedId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!selected) return;
    const a = asset;
    if (!a) {
      toast.error('This banner schedule has no linked asset yet. Asset creation UI is not implemented.');
      return;
    }
    try {
      setSaving(true);
      const updatesSchedule = {
        slot: form.slot,
        start_at: form.start_at ? new Date(form.start_at).toISOString() : selected.start_at,
        end_at: form.end_at ? new Date(form.end_at).toISOString() : selected.end_at,
      };
      const { error: schedErr } = await supabase
        .from('banner_schedules')
        .update(updatesSchedule)
        .eq('id', selected.id);
      if (schedErr) throw schedErr;

      const updatesAsset = {
        image_url: form.image_url || a.image_url,
        link_url: form.link_url || null,
        title: form.title || null,
        alt_text: form.alt_text || null,
      };
      const { error: assetErr } = await supabase
        .from('banner_assets')
        .update(updatesAsset)
        .eq('id', a.id);
      if (assetErr) throw assetErr;

      toast.success('Banner updated');
    } catch (e) {
      console.error('Failed to save banner', e);
      toast.error('Failed to save banner');
    } finally {
      setSaving(false);
    }
  };

  const handleAiSuggest = async () => {
    if (!selected) {
      toast.error('Select a banner first');
      return;
    }
    try {
      setAiLoading(true);
      setAiIdeas([]);
      const res = await fetch('/api/ai/banner-ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slot: selected.slot }),
      });
      if (!res.ok) {
        toast.error('AI could not suggest banners right now');
        return;
      }
      const data = await res.json();
      const ideas = (data?.ideas || []) as BannerIdea[];
      if (!ideas.length) {
        toast('No ideas returned');
        return;
      }
      setAiIdeas(ideas);
      toast.success('AI suggestions loaded');
    } catch (e) {
      console.error('AI banner ideas error', e);
      toast.error('Failed to get AI suggestions');
    } finally {
      setAiLoading(false);
    }
  };

  const applyIdea = (idea: BannerIdea) => {
    setForm((prev) => ({
      ...prev,
      title: idea.title || prev.title,
      alt_text: idea.subtitle || prev.alt_text,
    }));
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-4">Banner Management</h1>
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
        Control the ad spaces shown across the site. Each slot maps to positions like home hero, inline strips, catalog top, etc.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Scheduled banners</h2>
          <div className="border rounded-lg divide-y dark:border-gray-700 dark:divide-gray-700 max-h-96 overflow-y-auto bg-white dark:bg-gray-900">
            {loading && <div className="p-3 text-sm text-gray-500">Loading…</div>}
            {!loading && banners.length === 0 && (
              <div className="p-3 text-sm text-gray-500">No banners configured yet.</div>
            )}
            {banners.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => setSelectedId(b.id)}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 ${
                  selectedId === b.id ? 'bg-indigo-50 dark:bg-indigo-900/30' : ''
                }`}
              >
                <div className="font-medium text-gray-900 dark:text-gray-100">{b.slot}</div>
                <div className="text-xs text-gray-500">
                  {b.start_at?.slice(0, 10)} → {b.end_at?.slice(0, 10)}
                </div>
                {asset && selectedId === b.id && (
                  <div className="text-xs text-gray-500 truncate mt-0.5">
                    {asset.title || asset.image_url}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Banner details</h2>
            <button
              type="button"
              onClick={handleAiSuggest}
              disabled={!selected || aiLoading}
              className="text-xs px-3 py-1 rounded-lg border border-indigo-300 text-indigo-700 hover:bg-indigo-50 disabled:opacity-50"
            >
              {aiLoading ? 'Getting ideas…' : 'AI suggest'}
            </button>
          </div>

          {!selected && (
            <div className="text-sm text-gray-500">Select a banner schedule on the left to edit.</div>
          )}

          {selected && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Slot</label>
                  <input
                    name="slot"
                    value={form.slot}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-900 dark:border-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Image / Video URL</label>
                  <input
                    name="image_url"
                    value={form.image_url}
                    onChange={handleChange}
                    placeholder="https://... (image, mp4, or YouTube/Vimeo embed)"
                    className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-900 dark:border-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Link URL (optional)</label>
                  <input
                    name="link_url"
                    value={form.link_url}
                    onChange={handleChange}
                    placeholder="https://... or /products?category=..."
                    className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-900 dark:border-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Start at</label>
                  <input
                    type="datetime-local"
                    name="start_at"
                    value={form.start_at}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-900 dark:border-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">End at</label>
                  <input
                    type="datetime-local"
                    name="end_at"
                    value={form.end_at}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-900 dark:border-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Title</label>
                  <input
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-900 dark:border-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Alt text / subtitle</label>
                  <input
                    name="alt_text"
                    value={form.alt_text}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-900 dark:border-gray-700"
                  />
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-700 disabled:opacity-50"
                >
                  {saving ? 'Saving…' : 'Save changes'}
                </button>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Video banners: use mp4/webm URLs or YouTube/Vimeo embed URLs.
                </div>
              </div>
            </>
          )}

          {aiIdeas.length > 0 && (
            <div className="mt-6 border rounded-lg p-3 dark:border-gray-700">
              <div className="text-xs font-semibold text-gray-700 dark:text-gray-200 mb-2">AI suggestions</div>
              <div className="space-y-2">
                {aiIdeas.map((idea, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded-md bg-gray-50 dark:bg-gray-900 border dark:border-gray-700 flex items-start justify-between gap-3"
                  >
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{idea.title}</div>
                      {idea.subtitle && (
                        <div className="text-xs text-gray-600 dark:text-gray-300">{idea.subtitle}</div>
                      )}
                      {(idea.theme || idea.mediaType) && (
                        <div className="text-[10px] text-gray-500 mt-1">
                          {idea.theme && <span>Theme: {idea.theme}</span>}
                          {idea.theme && idea.mediaType && <span> · </span>}
                          {idea.mediaType && <span>Media: {idea.mediaType}</span>}
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => applyIdea(idea)}
                      className="text-xs px-2 py-1 rounded-md border border-indigo-300 text-indigo-700 hover:bg-indigo-50"
                    >
                      Apply
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminBanners;
