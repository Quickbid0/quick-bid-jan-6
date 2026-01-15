import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../config/supabaseClient';
import { toast } from 'react-hot-toast';

const AdminEventCreate: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [eventType, setEventType] = useState<'timed' | 'flash' | 'webcast' | 'quickmela'>('quickmela');
  const [startAt, setStartAt] = useState('');
  const [endAt, setEndAt] = useState('');
  const [increment, setIncrement] = useState('1000');
  const [minDeposit, setMinDeposit] = useState('5000');
  const [autoBid, setAutoBid] = useState(false);
  const [saving, setSaving] = useState(false);
  const [locations, setLocations] = useState<any[]>([]);
  const [locationId, setLocationId] = useState<string>('');

  useEffect(() => {
    const loadLocations = async () => {
      try {
        const { data, error } = await supabase
          .from('locations')
          .select('id, name, city, state')
          .order('state')
          .order('city');
        if (error) throw error;
        setLocations(data || []);
      } catch (e) {
        console.error('Error loading locations for events', e);
      }
    };
    loadLocations();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !startAt || !endAt) {
      toast.error('Please fill in name, start and end time');
      return;
    }

    try {
      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('You must be logged in as admin');
        return;
      }

      const startIso = new Date(startAt).toISOString();
      const endIso = new Date(endAt).toISOString();

      const { error } = await supabase
        .from('auction_events')
        .insert([{
          name,
          event_type: eventType,
          start_at: startIso,
          end_at: endIso,
          rules: {
            increment: increment ? Number(increment) : null,
            min_deposit: minDeposit ? Number(minDeposit) : null,
            auto_bid: autoBid,
          },
          status: 'scheduled',
          created_by: user.id,
          location_id: locationId || null,
        }]);

      if (error) throw error;

      toast.success('Event created');
      navigate('/admin/events');
    } catch (err) {
      console.error('Error creating event', err);
      toast.error('Failed to create event');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Create Event</h1>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
        Configure a new Timed, Flash, Webcast or QuickMela event.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Event name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            placeholder="e.g. Nagpur QuickMela – Bank Recovery Sale"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Event type</label>
            <select
              value={eventType}
              onChange={(e) => setEventType(e.target.value as any)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
            >
              <option value="timed">Timed auction</option>
              <option value="flash">Flash auction</option>
              <option value="webcast">Webcast</option>
              <option value="quickmela">QuickMela event</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Auto-bid allowed</label>
            <label className="inline-flex items-center mt-2 text-sm text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                className="mr-2"
                checked={autoBid}
                onChange={(e) => setAutoBid(e.target.checked)}
              />
              Enable auto-bid for this event
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start time</label>
            <input
              type="datetime-local"
              value={startAt}
              onChange={(e) => setStartAt(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End time</label>
            <input
              type="datetime-local"
              value={endAt}
              onChange={(e) => setEndAt(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Default increment (₹)</label>
            <input
              type="number"
              value={increment}
              onChange={(e) => setIncrement(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Minimum deposit (₹)</label>
            <input
              type="number"
              value={minDeposit}
              onChange={(e) => setMinDeposit(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/admin/events')}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-70"
          >
            {saving ? 'Creating…' : 'Create event'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminEventCreate;
