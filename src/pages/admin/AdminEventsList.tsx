import React, { useEffect, useState } from 'react';
import { supabase } from '../../config/supabaseClient';
import { Link } from 'react-router-dom';
import LocationFilter from '../../components/admin/LocationFilter';

type EventTypeFilter = 'all' | 'timed' | 'flash' | 'webcast' | 'quickmela';
type EventStatusFilter = 'all' | 'scheduled' | 'live' | 'ended' | 'cancelled';

const AdminEventsList: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<EventTypeFilter>('all');
  const [statusFilter, setStatusFilter] = useState<EventStatusFilter>('all');
  const [filterLocation, setFilterLocation] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        let query = supabase
          .from('auction_events')
          .select('id, name, event_type, start_at, end_at, status, location_id')
          .order('start_at', { ascending: false });

        if (typeFilter !== 'all') {
          query = query.eq('event_type', typeFilter);
        }
        if (statusFilter !== 'all') {
          query = query.eq('status', statusFilter);
        }
        if (filterLocation) {
          query = query.eq('location_id', filterLocation);
        }

        const { data, error } = await query;
        if (error) throw error;
        setEvents(data || []);
      } catch (e) {
        console.error('Error loading events', e);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [typeFilter, statusFilter, filterLocation]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const renderStatusBadge = (status?: string | null) => {
    const base = 'inline-flex px-2 py-1 text-xs font-medium rounded-full ';
    switch (status) {
      case 'scheduled':
        return <span className={base + 'bg-gray-100 text-gray-800'}>Scheduled</span>;
      case 'live':
        return <span className={base + 'bg-red-100 text-red-800'}>Live</span>;
      case 'ended':
        return <span className={base + 'bg-green-100 text-green-800'}>Ended</span>;
      case 'cancelled':
        return <span className={base + 'bg-yellow-100 text-yellow-800'}>Cancelled</span>;
      default:
        return <span className={base + 'bg-gray-100 text-gray-600'}>{status || '-'}</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Events</h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Manage Timed, Flash, Webcast and QuickMela events
          </p>
        </div>
        <div className="flex gap-3 items-center">
          <LocationFilter onFilterChange={setFilterLocation} className="min-w-[180px]" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as EventTypeFilter)}
            className="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All types</option>
            <option value="timed">Timed</option>
            <option value="flash">Flash</option>
            <option value="webcast">Webcast</option>
            <option value="quickmela">QuickMela</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as EventStatusFilter)}
            className="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All statuses</option>
            <option value="scheduled">Scheduled</option>
            <option value="live">Live</option>
            <option value="ended">Ended</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <Link
            to="/admin/events/new"
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
          >
            Create Event
          </Link>
        </div>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          No events found for the selected filters.
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Start</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">End</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {events.map((e) => (
                <tr key={e.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                  <td className="px-4 py-3">
                    <Link
                      to={`/admin/events/${e.id}`}
                      className="text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      {e.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 capitalize text-gray-700 dark:text-gray-200">{e.event_type}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                    {e.start_at ? new Date(e.start_at).toLocaleString() : '-'}
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                    {e.end_at ? new Date(e.end_at).toLocaleString() : '-'}
                  </td>
                  <td className="px-4 py-3">{renderStatusBadge(e.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminEventsList;
