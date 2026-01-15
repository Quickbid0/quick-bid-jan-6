import { useEffect, useState } from 'react';
import { useSession } from '../../hooks/useSession';

interface Ad {
  id: string;
  title: string;
  media_url: string;
  duration_sec: number;
  sponsor_id?: string | null;
  active: boolean;
}

interface AuctionSummary {
  id: string;
  lot_no?: string;
  status: string;
}

interface AuctionAdSlot {
  slotIndex: number;
  label: string;
  startSec: number;
  adId: string | null;
  adTitle?: string | null;
}

const API_BASE = import.meta.env.VITE_SERVER_URL;

async function fetchJSON<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { credentials: 'include' });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

export function SuperAdminAds() {
  const { session } = useSession();
  const roles: string[] = (session as any)?.user?.roles || [];

  const [ads, setAds] = useState<Ad[]>([]);
  const [auctions, setAuctions] = useState<AuctionSummary[]>([]);
  const [selectedAuctionId, setSelectedAuctionId] = useState<string | null>(null);
  const [slots, setSlots] = useState<AuctionAdSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSuperAdmin = roles.includes('superadmin');

  useEffect(() => {
    if (!isSuperAdmin) return;

    const loadData = async () => {
      try {
        setError(null);
        const [adsRes, auctionsRes] = await Promise.all([
          fetchJSON<Ad[]>('/ads?active=true'),
          fetchJSON<AuctionSummary[]>('/auctions?status=live'),
        ]);
        setAds(adsRes || []);
        setAuctions(auctionsRes || []);
        if (!selectedAuctionId && auctionsRes.length > 0) {
          setSelectedAuctionId(auctionsRes[0].id);
        }
      } catch (e) {
        setError('Failed to load ads or auctions');
      }
    };

    loadData();
  }, [isSuperAdmin, selectedAuctionId]);

  useEffect(() => {
    if (!isSuperAdmin || !selectedAuctionId) return;

    const loadSlots = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchJSON<AuctionAdSlot[]>(
          `/auctions/${selectedAuctionId}/ad-slots`,
        );
        setSlots(data || []);
      } catch (e) {
        setError('Failed to load ad slots for this auction');
      } finally {
        setLoading(false);
      }
    };

    loadSlots();
  }, [isSuperAdmin, selectedAuctionId]);

  const handleAssign = async (slot: AuctionAdSlot, adId: string) => {
    if (!selectedAuctionId) return;
    try {
      setLoading(true);
      setError(null);
      await fetch(`${API_BASE}/ads/${adId}/schedule`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          auctionId: selectedAuctionId,
          slotIndex: slot.slotIndex,
          startSec: slot.startSec,
        }),
      });
      const updated = await fetchJSON<AuctionAdSlot[]>(
        `/auctions/${selectedAuctionId}/ad-slots`,
      );
      setSlots(updated || []);
    } catch (e) {
      setError('Failed to assign ad to slot');
    } finally {
      setLoading(false);
    }
  };

  const handlePushNow = async (adId: string) => {
    if (!selectedAuctionId) return;
    try {
      setLoading(true);
      setError(null);
      await fetch(`${API_BASE}/ads/${adId}/push`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ auctionId: selectedAuctionId }),
      });
    } catch (e) {
      setError('Failed to push ad to live stream');
    } finally {
      setLoading(false);
    }
  };

  if (!isSuperAdmin) {
    return <div className="p-4 text-sm text-red-400">Access denied.</div>;
  }

  return (
    <div className="flex h-full flex-col gap-4 p-4 text-sm text-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            SuperAdmin: Ad scheduling
          </div>
          <div className="text-[11px] text-gray-500">
            Manage sponsor ads and push them into the live stream for active auctions.
          </div>
        </div>
        {loading && (
          <span className="text-[11px] text-gray-500">Saving…</span>
        )}
      </div>

      {error && <div className="rounded-md bg-red-500/10 px-3 py-2 text-xs text-red-300">{error}</div>}

      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-gray-400">Auction:</span>
        <select
          className="rounded-md border border-gray-700 bg-neutral-950 px-2 py-1 text-xs text-gray-100"
          value={selectedAuctionId || ''}
          onChange={e => setSelectedAuctionId(e.target.value || null)}
        >
          {auctions.map(a => (
            <option key={a.id} value={a.id}>
              {a.lot_no || a.id.slice(0, 6)} — {a.status}
            </option>
          ))}
          {auctions.length === 0 && <option value="">No live auctions</option>}
        </select>
      </div>

      <div className="grid flex-1 gap-4 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1.2fr)]">
        {/* Ad library */}
        <div className="flex flex-col gap-2 rounded-xl border border-gray-800 bg-neutral-950/70 p-3">
          <div className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            Ad library
          </div>
          <div className="max-h-80 overflow-y-auto space-y-2 text-xs">
            {ads.length === 0 ? (
              <div className="text-gray-500">No active ads configured.</div>
            ) : (
              ads.map(ad => (
                <div
                  key={ad.id}
                  className="flex items-center justify-between gap-2 rounded-lg border border-gray-800 bg-neutral-950 px-3 py-2"
                >
                  <div className="flex flex-col">
                    <span className="text-[11px] font-medium">{ad.title}</span>
                    <span className="text-[10px] text-gray-500">
                      {Math.round(ad.duration_sec)}s • {ad.media_url.split('/').pop()}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handlePushNow(ad.id)}
                    className="rounded-md bg-emerald-500 px-2 py-1 text-[10px] font-semibold text-black hover:bg-emerald-400"
                  >
                    Push now
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Schedule board */}
        <div className="flex flex-col gap-2 rounded-xl border border-gray-800 bg-neutral-950/70 p-3">
          <div className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            Auction ad slots
          </div>
          <div className="max-h-80 overflow-y-auto space-y-2 text-xs">
            {slots.length === 0 ? (
              <div className="text-gray-500">No ad slots configured for this auction.</div>
            ) : (
              slots.map(slot => (
                <div
                  key={slot.slotIndex}
                  className="flex items-center justify-between gap-2 rounded-lg border border-gray-800 bg-neutral-950 px-3 py-2"
                >
                  <div className="flex flex-col">
                    <span className="text-[11px] font-medium">{slot.label}</span>
                    <span className="text-[10px] text-gray-500">
                      Starts at T+{slot.startSec}s
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {slot.adId ? `Ad: ${slot.adTitle || slot.adId.slice(0, 6)}` : 'No ad assigned'}
                    </span>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <select
                      className="w-32 rounded-md border border-gray-700 bg-neutral-900 px-2 py-1 text-[10px] text-gray-100"
                      value={slot.adId || ''}
                      onChange={e => handleAssign(slot, e.target.value)}
                    >
                      <option value="">Unassigned</option>
                      {ads.map(ad => (
                        <option key={ad.id} value={ad.id}>
                          {ad.title}
                        </option>
                      ))}
                    </select>
                    {slot.adId && (
                      <button
                        type="button"
                        onClick={() => handlePushNow(slot.adId as string)}
                        className="rounded-md bg-emerald-500 px-2 py-1 text-[10px] font-semibold text-black hover:bg-emerald-400"
                      >
                        Push slot now
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
