import { useState } from 'react';

interface VehicleLiveMetadata {
  title: string;
  subtitle: string;
  highlightBadges: string[];
  notesForBuyers: string;
}

interface VehicleDocumentVisibility {
  id: string;
  label: string;
  type?: string;
  visibleToBuyers: boolean;
}

interface VehicleAdminPanelProps {
  auctionId: string;
  initialMetadata?: VehicleLiveMetadata;
  initialDocuments?: VehicleDocumentVisibility[];
  onSave?: (payload: {
    auctionId: string;
    metadata: VehicleLiveMetadata;
    documents: VehicleDocumentVisibility[];
  }) => Promise<void> | void;
  onBroadcastAnnouncement?: (payload: { auctionId: string; message: string }) => Promise<void> | void;
}

const defaultMetadata: VehicleLiveMetadata = {
  title: '',
  subtitle: '',
  highlightBadges: [],
  notesForBuyers: '',
};

export function VehicleAdminPanel({
  auctionId,
  initialMetadata,
  initialDocuments,
  onSave,
  onBroadcastAnnouncement,
}: VehicleAdminPanelProps) {
  const [metadata, setMetadata] = useState<VehicleLiveMetadata>(
    initialMetadata || defaultMetadata,
  );
  const [documents, setDocuments] = useState<VehicleDocumentVisibility[]>(
    initialDocuments || [],
  );
  const [badgesInput, setBadgesInput] = useState(
    (initialMetadata?.highlightBadges || []).join(', '),
  );
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const [announcing, setAnnouncing] = useState(false);
  const [announceError, setAnnounceError] = useState<string | null>(null);

  const handleToggleDoc = (id: string) => {
    setDocuments(prev =>
      prev.map(doc =>
        doc.id === id ? { ...doc, visibleToBuyers: !doc.visibleToBuyers } : doc,
      ),
    );
  };

  const handleSave = async () => {
    if (!onSave) return;
    setSaving(true);
    setSaveError(null);

    try {
      const cleanBadges = badgesInput
        .split(',')
        .map(b => b.trim())
        .filter(Boolean);

      const payloadMeta: VehicleLiveMetadata = {
        ...metadata,
        highlightBadges: cleanBadges,
      };

      await onSave({ auctionId, metadata: payloadMeta, documents });
    } catch (e: any) {
      setSaveError(e?.message || 'Failed to save vehicle metadata.');
    } finally {
      setSaving(false);
    }
  };

  const handleBroadcast = async () => {
    if (!onBroadcastAnnouncement || !announcement.trim()) return;
    setAnnouncing(true);
    setAnnounceError(null);

    try {
      await onBroadcastAnnouncement({ auctionId, message: announcement.trim() });
      setAnnouncement('');
    } catch (e: any) {
      setAnnounceError(e?.message || 'Failed to send announcement.');
    } finally {
      setAnnouncing(false);
    }
  };

  return (
    <div className="flex h-full flex-col gap-3 rounded-xl border border-gray-800 bg-neutral-950/70 p-4 text-sm text-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            Vehicle admin panel
          </div>
          <div className="text-[11px] text-gray-500">
            Edit live vehicle highlights and control which documents buyers can see during the stream.
          </div>
        </div>
        <span className="text-[11px] text-gray-500">Auction: {auctionId.slice(0, 8)}…</span>
      </div>

      {saveError && (
        <div className="rounded-md bg-red-500/10 px-3 py-2 text-xs text-red-300">{saveError}</div>
      )}

      <div className="grid gap-3 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1.3fr)]">
        {/* Metadata editor */}
        <div className="flex flex-col gap-2 rounded-lg border border-gray-800 bg-neutral-950 p-3">
          <div className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            Live metadata
          </div>
          <label className="flex flex-col gap-1 text-xs">
            <span className="text-gray-400">Title</span>
            <input
              type="text"
              className="rounded-md border border-gray-700 bg-neutral-900 px-2 py-1 text-xs text-gray-100 outline-none focus:border-emerald-500"
              value={metadata.title}
              onChange={e => setMetadata(m => ({ ...m, title: e.target.value }))}
              placeholder="e.g. 2019 Swift VXI, single owner, 35,000 km"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs">
            <span className="text-gray-400">Subtitle</span>
            <input
              type="text"
              className="rounded-md border border-gray-700 bg-neutral-900 px-2 py-1 text-xs text-gray-100 outline-none focus:border-emerald-500"
              value={metadata.subtitle}
              onChange={e => setMetadata(m => ({ ...m, subtitle: e.target.value }))}
              placeholder="e.g. Full service history, quick delivery available"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs">
            <span className="text-gray-400">Highlight badges (comma-separated)</span>
            <input
              type="text"
              className="rounded-md border border-gray-700 bg-neutral-900 px-2 py-1 text-xs text-gray-100 outline-none focus:border-emerald-500"
              value={badgesInput}
              onChange={e => setBadgesInput(e.target.value)}
              placeholder="e.g. RC verified, Low KM, Bank auction"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs">
            <span className="text-gray-400">Notes for buyers (visible in details panel)</span>
            <textarea
              className="min-h-[80px] rounded-md border border-gray-700 bg-neutral-900 px-2 py-1 text-xs text-gray-100 outline-none focus:border-emerald-500"
              value={metadata.notesForBuyers}
              onChange={e => setMetadata(m => ({ ...m, notesForBuyers: e.target.value }))}
              placeholder="Any special instructions, RC status, minor dents, finance/loan notes, etc."
            />
          </label>
          <div className="flex justify-end gap-2 text-xs">
            <button
              type="button"
              onClick={handleSave}
              className="rounded-md bg-emerald-500 px-3 py-1 font-semibold text-black hover:bg-emerald-400 disabled:opacity-40"
              disabled={saving || !onSave}
            >
              {saving ? 'Saving…' : 'Save metadata'}
            </button>
          </div>
        </div>

        {/* Document visibility & announcements */}
        <div className="flex flex-col gap-2 rounded-lg border border-gray-800 bg-neutral-950 p-3">
          <div className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            Documents & announcements
          </div>

          <div className="space-y-1 text-xs">
            <div className="text-[11px] font-medium text-gray-300">Document visibility</div>
            {documents.length === 0 ? (
              <div className="text-[11px] text-gray-500">No documents configured for this vehicle.</div>
            ) : (
              <ul className="max-h-40 space-y-1 overflow-y-auto">
                {documents.map(doc => (
                  <li
                    key={doc.id}
                    className="flex items-center justify-between gap-2 rounded-md border border-gray-800 bg-neutral-950 px-2 py-1"
                  >
                    <div className="flex flex-col">
                      <span className="text-[11px] font-medium">{doc.label}</span>
                      {doc.type && (
                        <span className="text-[10px] text-gray-500">{doc.type}</span>
                      )}
                    </div>
                    <label className="flex items-center gap-1 text-[11px] text-gray-300">
                      <input
                        type="checkbox"
                        checked={doc.visibleToBuyers}
                        onChange={() => handleToggleDoc(doc.id)}
                        className="h-3 w-3 rounded border-gray-600 bg-neutral-900 text-emerald-500"
                      />
                      <span>Visible</span>
                    </label>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="mt-2 space-y-1 text-xs">
            <div className="text-[11px] font-medium text-gray-300">Quick announcement</div>
            <textarea
              className="min-h-[70px] w-full rounded-md border border-gray-700 bg-neutral-900 px-2 py-1 text-xs text-gray-100 outline-none focus:border-emerald-500"
              placeholder="e.g. Next lot: 2018 Creta diesel, RC & insurance up to 2027. Start price ₹5.2L."
              value={announcement}
              onChange={e => setAnnouncement(e.target.value)}
            />
            {announceError && (
              <div className="text-[11px] text-red-400">{announceError}</div>
            )}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleBroadcast}
                className="rounded-md bg-sky-500 px-3 py-1 text-[11px] font-semibold text-black hover:bg-sky-400 disabled:opacity-40"
                disabled={announcing || !onBroadcastAnnouncement || !announcement.trim()}
              >
                {announcing ? 'Sending…' : 'Broadcast to viewers'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
