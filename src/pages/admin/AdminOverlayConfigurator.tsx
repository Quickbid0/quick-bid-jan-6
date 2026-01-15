import React, { useEffect, useState } from 'react';
import { overlayService, OverlayPreset, OverlaySlotConfig } from '../../services/overlayService';
import { toast } from 'react-hot-toast';
import { Plus, Trash2 } from 'lucide-react';

const slotTypes: OverlaySlotConfig['slotType'][] = [
  'banner_left',
  'banner_right',
  'banner_bottom',
  'popup_card',
  'ticker',
];

const defaultLayout: OverlaySlotConfig[] = [
  {
    slotType: 'banner_bottom',
    x: 0.05,
    y: 0.8,
    width: 0.9,
    height: 0.15,
    zIndex: 10,
    visible: true,
  },
  {
    slotType: 'popup_card',
    x: 0.65,
    y: 0.15,
    width: 0.3,
    height: 0.25,
    zIndex: 20,
    visible: true,
  },
  {
    slotType: 'ticker',
    x: 0,
    y: 0.95,
    width: 1,
    height: 0.05,
    zIndex: 15,
    visible: false,
  },
];

const AdminOverlayConfigurator: React.FC = () => {
  const [presets, setPresets] = useState<OverlayPreset[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [newPreset, setNewPreset] = useState({ presetId: '', name: '', description: '' });
  const [savingLayout, setSavingLayout] = useState(false);

  const selected = presets.find((p) => p._id === selectedId) || null;

  useEffect(() => {
    loadPresets();
  }, []);

  const loadPresets = async () => {
    try {
      const data = await overlayService.listPresets();
      setPresets(data);
      if (!selectedId && data.length > 0) {
        setSelectedId(data[0]._id);
      }
    } catch (err) {
      console.error(err);
      toast.error((err as Error).message || 'Failed to load overlay presets');
    }
  };

  const handleCreatePreset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPreset.presetId || !newPreset.name) {
      toast.error('Preset ID and name are required');
      return;
    }
    try {
      setCreating(true);
      const created = await overlayService.createPreset({
        presetId: newPreset.presetId.trim(),
        name: newPreset.name.trim(),
        description: newPreset.description.trim() || undefined,
      });
      setNewPreset({ presetId: '', name: '', description: '' });
      setPresets((prev) => [...prev, created]);
      setSelectedId(created._id);
      toast.success('Preset created');
    } catch (err) {
      console.error(err);
      toast.error((err as Error).message || 'Failed to create preset');
    } finally {
      setCreating(false);
    }
  };

  const handleDeletePreset = async (id: string) => {
    if (!window.confirm('Delete this preset?')) return;
    try {
      await overlayService.deletePreset(id);
      setPresets((prev) => prev.filter((p) => p._id !== id));
      if (selectedId === id) {
        setSelectedId(null);
      }
      toast.success('Preset deleted');
    } catch (err) {
      console.error(err);
      toast.error((err as Error).message || 'Failed to delete preset');
    }
  };

  const updateSelected = (changes: Partial<OverlayPreset>) => {
    if (!selected) return;
    setPresets((prev) =>
      prev.map((p) => (p._id === selected._id ? { ...p, ...changes } : p)),
    );
  };

  const handleSaveMeta = async () => {
    if (!selected) return;
    try {
      await overlayService.updatePreset(selected._id, {
        name: selected.name,
        description: selected.description,
        eventIds: selected.eventIds,
      });
      toast.success('Preset details saved');
    } catch (err) {
      console.error(err);
      toast.error((err as Error).message || 'Failed to save preset');
    }
  };

  const ensureLayout = () => {
    if (!selected) return;
    if (!selected.layout || selected.layout.length === 0) {
      updateSelected({ layout: defaultLayout });
    }
  };

  useEffect(() => {
    ensureLayout();
  }, [selectedId]);

  const handleSaveLayout = async () => {
    if (!selected) return;
    try {
      setSavingLayout(true);
      await overlayService.updatePreset(selected._id, {
        layout: selected.layout,
      });
      toast.success('Layout saved');
    } catch (err) {
      console.error(err);
      toast.error((err as Error).message || 'Failed to save layout');
    } finally {
      setSavingLayout(false);
    }
  };

  const updateSlot = (index: number, changes: Partial<OverlaySlotConfig>) => {
    if (!selected) return;
    const nextLayout = [...selected.layout];
    nextLayout[index] = { ...nextLayout[index], ...changes };
    updateSelected({ layout: nextLayout });
  };

  const handleCanvasDrag = (
    e: React.MouseEvent<HTMLDivElement>,
    slotIndex: number,
  ) => {
    if (!selected) return;
    const canvas = e.currentTarget.parentElement as HTMLDivElement;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    updateSlot(slotIndex, { x: Math.max(0, Math.min(1, x)), y: Math.max(0, Math.min(1, y)) });
  };

  const parseEventIds = (value: string): string[] =>
    value
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Overlay Configurator</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Manage overlay presets and layouts for live auction ads.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Preset list + create */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-4 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Presets</h2>
          </div>
          <div className="flex-1 overflow-y-auto mb-4">
            {presets.length === 0 ? (
              <div className="text-xs text-gray-500">No presets yet. Create one below.</div>
            ) : (
              <ul className="space-y-1 text-sm">
                {presets.map((p) => (
                  <li
                    key={p._id}
                    className={`flex items-center justify-between px-2 py-1 rounded cursor-pointer text-xs ${
                      selectedId === p._id
                        ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-200'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                    onClick={() => setSelectedId(p._id)}
                  >
                    <span className="truncate">{p.name}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePreset(p._id);
                      }}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <form onSubmit={handleCreatePreset} className="space-y-2 border-t border-gray-200 dark:border-gray-800 pt-3 mt-2">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-xs font-semibold text-gray-800 dark:text-gray-200">New preset</h3>
            </div>
            <input
              type="text"
              placeholder="Preset ID (e.g. default_auction)"
              value={newPreset.presetId}
              onChange={(e) => setNewPreset({ ...newPreset, presetId: e.target.value })}
              className="w-full border rounded-lg px-2 py-1 text-xs bg-white dark:bg-gray-800"
              required
            />
            <input
              type="text"
              placeholder="Name"
              value={newPreset.name}
              onChange={(e) => setNewPreset({ ...newPreset, name: e.target.value })}
              className="w-full border rounded-lg px-2 py-1 text-xs bg-white dark:bg-gray-800"
              required
            />
            <input
              type="text"
              placeholder="Description (optional)"
              value={newPreset.description}
              onChange={(e) => setNewPreset({ ...newPreset, description: e.target.value })}
              className="w-full border rounded-lg px-2 py-1 text-xs bg-white dark:bg-gray-800"
            />
            <button
              type="submit"
              disabled={creating}
              className="w-full flex items-center justify-center gap-1 bg-indigo-600 text-white text-xs py-1.5 rounded-lg disabled:opacity-50"
            >
              <Plus className="h-3 w-3" />
              {creating ? 'Creating...' : 'Create preset'}
            </button>
          </form>
        </div>

        {/* Details + layout */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-lg shadow-sm p-4">
          {!selected ? (
            <div className="text-xs text-gray-500">Select or create a preset to configure its layout.</div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-medium mb-1">Name</label>
                  <input
                    type="text"
                    value={selected.name}
                    onChange={(e) => updateSelected({ name: e.target.value })}
                    className="w-full border rounded-lg px-2 py-1 text-sm bg-white dark:bg-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Preset ID</label>
                  <input
                    type="text"
                    value={selected.presetId}
                    readOnly
                    className="w-full border rounded-lg px-2 py-1 text-sm bg-gray-50 dark:bg-gray-800 text-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Description</label>
                  <input
                    type="text"
                    value={selected.description || ''}
                    onChange={(e) => updateSelected({ description: e.target.value })}
                    className="w-full border rounded-lg px-2 py-1 text-sm bg-white dark:bg-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Event IDs (comma-separated)</label>
                  <input
                    type="text"
                    value={selected.eventIds.join(', ')}
                    onChange={(e) =>
                      updateSelected({ eventIds: parseEventIds(e.target.value) as any })
                    }
                    className="w-full border rounded-lg px-2 py-1 text-sm bg-white dark:bg-gray-800"
                    placeholder="e.g. event123, event456"
                  />
                </div>
              </div>

              <div className="flex justify-end mb-3">
                <button
                  type="button"
                  onClick={handleSaveMeta}
                  className="px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-lg"
                >
                  Save details
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Canvas */}
                <div className="md:col-span-2">
                  <h3 className="text-xs font-semibold mb-2">Layout preview</h3>
                  <div className="relative bg-black rounded-lg overflow-hidden" style={{ aspectRatio: '16 / 9' }}>
                    {/* Video placeholder */}
                    <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-500 bg-gradient-to-br from-gray-800 to-gray-900">
                      Live stream preview
                    </div>
                    {(selected.layout || []).map((slot, idx) => {
                      if (!slot.visible) return null;
                      const left = `${slot.x * 100}%`;
                      const top = `${slot.y * 100}%`;
                      const width = `${slot.width * 100}%`;
                      const height = `${slot.height * 100}%`;
                      return (
                        <div
                          key={idx}
                          className="absolute border border-dashed border-yellow-300 bg-yellow-500/20 cursor-move text-[10px] flex items-center justify-center text-yellow-100"
                          style={{ left, top, width, height, zIndex: slot.zIndex, borderRadius: (slot.style?.borderRadius || 4) }}
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                          onDoubleClick={(e) => {
                            e.stopPropagation();
                            // Center to click position
                            handleCanvasDrag(e as any, idx);
                          }}
                        >
                          {slot.slotType.replace('_', ' ')}
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-end mt-3">
                    <button
                      type="button"
                      onClick={handleSaveLayout}
                      disabled={savingLayout}
                      className="px-3 py-1.5 text-xs bg-indigo-600 text-white rounded-lg disabled:opacity-50"
                    >
                      {savingLayout ? 'Saving...' : 'Save layout'}
                    </button>
                  </div>
                </div>

                {/* Slot controls */}
                <div>
                  <h3 className="text-xs font-semibold mb-2">Slot settings</h3>
                  <div className="space-y-2 max-h-80 overflow-y-auto text-xs">
                    {(selected.layout || []).map((slot, idx) => (
                      <div
                        key={idx}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-2"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium">{slot.slotType}</span>
                          <label className="flex items-center gap-1 text-[10px]">
                            <input
                              type="checkbox"
                              checked={slot.visible}
                              onChange={(e) => updateSlot(idx, { visible: e.target.checked })}
                            />
                            Visible
                          </label>
                        </div>
                        <div className="grid grid-cols-2 gap-1 mb-1">
                          <label className="flex flex-col">
                            <span className="text-[10px]">X</span>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              max="1"
                              value={slot.x}
                              onChange={(e) =>
                                updateSlot(idx, {
                                  x: Math.max(0, Math.min(1, Number(e.target.value) || 0)),
                                })
                              }
                              className="border rounded px-1 py-0.5 text-[10px] bg-white dark:bg-gray-800"
                            />
                          </label>
                          <label className="flex flex-col">
                            <span className="text-[10px]">Y</span>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              max="1"
                              value={slot.y}
                              onChange={(e) =>
                                updateSlot(idx, {
                                  y: Math.max(0, Math.min(1, Number(e.target.value) || 0)),
                                })
                              }
                              className="border rounded px-1 py-0.5 text-[10px] bg-white dark:bg-gray-800"
                            />
                          </label>
                          <label className="flex flex-col">
                            <span className="text-[10px]">Width</span>
                            <input
                              type="number"
                              step="0.01"
                              min="0.05"
                              max="1"
                              value={slot.width}
                              onChange={(e) =>
                                updateSlot(idx, {
                                  width: Math.max(0.05, Math.min(1, Number(e.target.value) || 0)),
                                })
                              }
                              className="border rounded px-1 py-0.5 text-[10px] bg-white dark:bg-gray-800"
                            />
                          </label>
                          <label className="flex flex-col">
                            <span className="text-[10px]">Height</span>
                            <input
                              type="number"
                              step="0.01"
                              min="0.05"
                              max="1"
                              value={slot.height}
                              onChange={(e) =>
                                updateSlot(idx, {
                                  height: Math.max(0.05, Math.min(1, Number(e.target.value) || 0)),
                                })
                              }
                              className="border rounded px-1 py-0.5 text-[10px] bg-white dark:bg-gray-800"
                            />
                          </label>
                        </div>
                        <div className="grid grid-cols-2 gap-1 mb-1">
                          <label className="flex flex-col">
                            <span className="text-[10px]">Z-index</span>
                            <input
                              type="number"
                              value={slot.zIndex}
                              onChange={(e) =>
                                updateSlot(idx, { zIndex: Number(e.target.value) || 0 })
                              }
                              className="border rounded px-1 py-0.5 text-[10px] bg-white dark:bg-gray-800"
                            />
                          </label>
                          <label className="flex flex-col">
                            <span className="text-[10px]">Opacity</span>
                            <input
                              type="number"
                              step="0.1"
                              min="0"
                              max="1"
                              value={slot.style?.opacity ?? 1}
                              onChange={(e) =>
                                updateSlot(idx, {
                                  style: {
                                    ...slot.style,
                                    opacity: Math.max(0, Math.min(1, Number(e.target.value) || 0)),
                                  },
                                })
                              }
                              className="border rounded px-1 py-0.5 text-[10px] bg-white dark:bg-gray-800"
                            />
                          </label>
                        </div>
                        <label className="flex flex-col">
                          <span className="text-[10px]">Border radius</span>
                          <input
                            type="number"
                            min="0"
                            max="32"
                            value={slot.style?.borderRadius ?? 4}
                            onChange={(e) =>
                              updateSlot(idx, {
                                style: {
                                  ...slot.style,
                                  borderRadius: Math.max(0, Math.min(32, Number(e.target.value) || 0)),
                                },
                              })
                            }
                            className="border rounded px-1 py-0.5 text-[10px] bg-white dark:bg-gray-800"
                          />
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminOverlayConfigurator;
