import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '../config/supabaseClient';

const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cityFilter, setCityFilter] = useState<string>('all');
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [nearMeOnly, setNearMeOnly] = useState<boolean>(false);
  const [geoError, setGeoError] = useState<string>('');
  const [eventLotCounts, setEventLotCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const isPreview = (import.meta as any)?.env?.MODE !== 'production' || localStorage.getItem('demo-session');
        if (isPreview) {
          const now = Date.now();
          const DEMO_LOCATIONS = [
            { id: 'LOC-HYD', name: 'Hyderabad Yard', city: 'Hyderabad', state: 'Telangana', lat: 17.385, lng: 78.4867, radius_km: 50 },
            { id: 'LOC-BLR', name: 'Bangalore Yard', city: 'Bangalore', state: 'Karnataka', lat: 12.9716, lng: 77.5946, radius_km: 50 },
            { id: 'LOC-MAA', name: 'Chennai Yard', city: 'Chennai', state: 'Tamil Nadu', lat: 13.0827, lng: 80.2707, radius_km: 50 },
          ];
          const DEMO_EVENTS_RAW = [
            { id: 'EVT-001', title: 'Hyderabad Auto Auction', city: 'Hyderabad', status: 'Live', type: 'Timed', lots: 12 },
            { id: 'EVT-002', title: 'Bangalore Vehicle Sale', city: 'Bangalore', status: 'Upcoming', type: 'Live', lots: 8 },
            { id: 'EVT-003', title: 'Chennai Fleet Auction', city: 'Chennai', status: 'Closed', type: 'Timed', lots: 5 },
          ];
          const DEMO_EVENTS = DEMO_EVENTS_RAW.map((e) => {
            const locId = e.city === 'Hyderabad' ? 'LOC-HYD' : e.city === 'Bangalore' ? 'LOC-BLR' : 'LOC-MAA';
            const statusNorm = e.status.toLowerCase() === 'live' ? 'live' : e.status.toLowerCase() === 'upcoming' ? 'scheduled' : 'closed';
            const typeNorm = e.type.toLowerCase() === 'live' ? 'live' : 'timed';
            const startAt =
              statusNorm === 'live' ? new Date(now - 30 * 60 * 1000).toISOString() :
              statusNorm === 'scheduled' ? new Date(now + 24 * 60 * 60 * 1000).toISOString() :
              new Date(now - 48 * 60 * 60 * 1000).toISOString();
            const endAt =
              statusNorm === 'live' ? new Date(now + 2 * 60 * 60 * 1000).toISOString() :
              statusNorm === 'scheduled' ? new Date(now + 27 * 60 * 60 * 1000).toISOString() :
              new Date(now - 24 * 60 * 60 * 1000).toISOString();
            return {
              id: e.id,
              name: e.title,
              event_type: typeNorm,
              status: statusNorm,
              start_at: startAt,
              end_at: endAt,
              location_id: locId,
            };
          });
          const counts: Record<string, number> = {};
          DEMO_EVENTS_RAW.forEach((e) => {
            counts[e.id] = e.lots;
          });
          setEvents(DEMO_EVENTS);
          setLocations(DEMO_LOCATIONS);
          setEventLotCounts(counts);
          return;
        }
        const timeout = new Promise((resolve) => setTimeout(() => resolve({ data: [], error: null }), 2000));
        const [evRes, locRes, aRes] = (await Promise.all([
          Promise.race([
            supabase
              .from('auction_events')
              .select('id, name, event_type, start_at, end_at, status, location_id')
              .order('start_at', { ascending: true })
              .then((r) => r),
            timeout,
          ]),
          Promise.race([
            supabase.from('locations').select('id, name, city, state, lat, lng, radius_km').then((r) => r),
            timeout,
          ]),
          Promise.race([supabase.from('auctions').select('id, event_id').then((r) => r), timeout]),
        ])) as any;
        const evErr = evRes?.error || null;
        const locErr = locRes?.error || null;
        const aErr = aRes?.error || null;
        const evts = evRes?.data || [];
        const locs = locRes?.data || [];
        const aucts = aRes?.data || [];
        setEvents(evts);
        setLocations(locs);

        const counts: Record<string, number> = {};
        (aucts).forEach((a: any) => {
          if (!a.event_id) return;
          counts[a.event_id] = (counts[a.event_id] || 0) + 1;
        });
        setEventLotCounts(counts);
      } catch (e) {
        console.error('Error loading events', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleUseMyLocation = () => {
    setGeoError('');
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported on this device.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setNearMeOnly(true);
      },
      () => {
        setGeoError('Could not access your location. Please check browser permissions.');
      },
      { enableHighAccuracy: false, timeout: 10000 }
    );
  };

  const locationMap = useMemo(
    () => new Map(locations.map((l) => [l.id, l])),
    [locations]
  );

  const now = Date.now();

  const baseFilteredEvents = useMemo(() => {
    return events.filter((e) => {
      if (cityFilter === 'all') return true;
      const loc = e.location_id ? locationMap.get(e.location_id) : null;
      return loc && loc.city === cityFilter;
    });
  }, [events, cityFilter, locationMap]);

  const distanceKm = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const filteredEvents = useMemo(() => {
    if (!nearMeOnly || !userCoords) return baseFilteredEvents;

    return baseFilteredEvents.filter((e) => {
      const loc = e.location_id ? locationMap.get(e.location_id) : null;
      if (!loc || typeof loc.lat !== 'number' || typeof loc.lng !== 'number') return false;
      const d = distanceKm(userCoords.lat, userCoords.lng, loc.lat, loc.lng);
      const radius = typeof loc.radius_km === 'number' && loc.radius_km > 0 ? loc.radius_km : 25;
      return d <= radius;
    });
  }, [baseFilteredEvents, nearMeOnly, userCoords, locationMap]);

  const liveEvents = filteredEvents.filter((e) => {
    if (e.status === 'live') return true;
    if (e.start_at && e.end_at) {
      const s = new Date(e.start_at).getTime();
      const en = new Date(e.end_at).getTime();
      return s <= now && en >= now;
    }
    return false;
  });

  const upcomingEvents = filteredEvents.filter((e) => {
    if (e.status !== 'scheduled' || !e.start_at) return false;
    return new Date(e.start_at).getTime() > now;
  });

  const quickmelaEvents = filteredEvents.filter((e) => e.event_type === 'quickmela');

  const cities = Array.from(new Set(locations.map((l) => l.city))).sort();

  const renderEventCard = (e: any) => {
    const loc = e.location_id ? locationMap.get(e.location_id) : null;
    const lots = eventLotCounts[e.id] || 0;
    const isLive = e.status === 'live';
    const isScheduled = e.status === 'scheduled';
    const isEnded = e.status === 'ended' || e.status === 'closed';
    return (
      <div key={e.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 flex flex-col gap-1">
        <div className="flex items-center justify-between gap-2">
          <div className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2">
            {e.name}
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${
                isLive
                  ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-200'
                  : isScheduled
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200'
                  : isEnded
                  ? 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200'
              }`}
            >
              {isLive ? 'Live' : isScheduled ? 'Scheduled' : isEnded ? 'Ended' : (e.status || '').toString()}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-100">
              {e.event_type}
            </span>
          </div>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {e.start_at && new Date(e.start_at).toLocaleString()} -{' '}
          {e.end_at && new Date(e.end_at).toLocaleString()}
        </div>
        <div className="text-xs text-gray-600 dark:text-gray-300">
          {loc ? `${loc.city}, ${loc.state}` : 'Online / location not set'}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {lots > 0 ? `${lots} lot${lots === 1 ? '' : 's'}` : 'No lots attached yet'}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Events</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Browse upcoming, live, and QuickMela events across locations.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
            aria-label="City"
          >
            <option value="all">All cities</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleUseMyLocation}
            className="px-3 py-2 border border-indigo-300 text-indigo-700 rounded-lg text-xs sm:text-sm hover:bg-indigo-50"
          >
            Use my location
          </button>
          <label className="inline-flex items-center gap-1 text-xs sm:text-sm text-gray-700 dark:text-gray-200">
            <input
              type="checkbox"
              checked={nearMeOnly}
              onChange={(e) => setNearMeOnly(e.target.checked)}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span>Near me only</span>
          </label>
        </div>
      </div>

      {geoError && (
        <p className="text-xs text-red-600 mt-1">{geoError}</p>
      )}

      <section>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Live Now</h2>
        {liveEvents.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400" aria-hidden="true">No live events at the moment.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {liveEvents.map(renderEventCard)}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Upcoming Events</h2>
        {upcomingEvents.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400" aria-hidden="true">No upcoming events found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingEvents.map(renderEventCard)}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">QuickMela Events</h2>
        {quickmelaEvents.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400" aria-hidden="true">No QuickMela events found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickmelaEvents.map(renderEventCard)}
          </div>
        )}
      </section>
    </div>
  );
};

export default EventsPage;
