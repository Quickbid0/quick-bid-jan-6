import React, { useEffect, useState } from 'react';
import { MapPin } from 'lucide-react';
import { supabase } from '../../config/supabaseClient';

interface LocationFilterProps {
  onFilterChange: (locationId: string | null) => void;
  className?: string;
  selectedLocationId?: string | null;
  label?: string;
}

interface Location {
  id: string;
  name: string;
  type: string;
}

const LocationFilter: React.FC<LocationFilterProps> = ({ 
  onFilterChange, 
  className = '', 
  selectedLocationId,
  label 
}) => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const isDemo = localStorage.getItem('demo-session') !== null;

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      if (isDemo) {
        // Mock locations for demo
        setLocations([
          { id: 'l1', name: 'Mumbai Central', type: 'branch' },
          { id: 'l2', name: 'Delhi North', type: 'branch' },
          { id: 'l3', name: 'Bangalore Tech Park', type: 'branch' },
          { id: 'd1', name: 'Mumbai Suburban', type: 'district' },
          { id: 's1', name: 'Maharashtra', type: 'state' },
          { id: 's2', name: 'Karnataka', type: 'state' },
        ]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('locations')
        .select('id, name, type')
        .order('name');
      
      if (error) throw error;
      setLocations(data || []);
    } catch (error) {
      console.error('Error fetching locations:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`relative ${className}`}>
      {label && <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>}
      <div className={`${label ? '' : 'absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'}`}>
        {!label && <MapPin className="h-4 w-4 text-gray-400" />}
      </div>
      <select
        className={`${label ? 'w-full' : 'pl-10 pr-4 w-full'} py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white appearance-none`}
        onChange={(e) => onFilterChange(e.target.value || null)}
        value={selectedLocationId || ''}
        disabled={loading}
      >
        <option value="">{label ? 'Select Location' : 'All Locations'}</option>
        {locations.map(loc => (
          <option key={loc.id} value={loc.id}>
            {loc.name} ({loc.type})
          </option>
        ))}
      </select>
    </div>
  );
};

export default LocationFilter;
