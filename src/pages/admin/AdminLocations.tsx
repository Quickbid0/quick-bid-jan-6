import React, { useEffect, useState } from 'react';
import { supabase } from '../../config/supabaseClient';
import { toast } from 'react-hot-toast';
import { MapPin, Building, Navigation, Plus, Filter, Trash2 } from 'lucide-react';

interface Location {
  id: string;
  name: string;
  type: 'state' | 'district' | 'city' | 'village' | 'branch';
  state: string;
  district?: string;
  city?: string;
  pincode?: string;
  created_at: string;
}

const AdminLocations: React.FC = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');

  const [formData, setFormData] = useState<Partial<Location>>({
    name: '',
    type: 'branch',
    state: '',
    district: '',
    city: '',
    pincode: ''
  });

  const isDemo = localStorage.getItem('demo-session') !== null;

  const loadLocations = async () => {
    setLoading(true);
    try {
      if (isDemo) {
        setLocations([
          { id: '1', name: 'Maharashtra Head Office', type: 'state', state: 'Maharashtra', created_at: '2023-01-01T10:00:00Z' },
          { id: '2', name: 'Mumbai District Hub', type: 'district', state: 'Maharashtra', district: 'Mumbai', created_at: '2023-01-02T10:00:00Z' },
          { id: '3', name: 'Mumbai Central Yard', type: 'branch', state: 'Maharashtra', district: 'Mumbai', city: 'Mumbai', pincode: '400001', created_at: '2023-01-03T10:00:00Z' },
          { id: '4', name: 'Pune City Center', type: 'city', state: 'Maharashtra', district: 'Pune', city: 'Pune', created_at: '2023-01-04T10:00:00Z' },
          { id: '5', name: 'Nagpur North Branch', type: 'branch', state: 'Maharashtra', district: 'Nagpur', city: 'Nagpur', pincode: '440001', created_at: '2023-01-05T10:00:00Z' },
        ]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setLocations(data || []);
    } catch (e) {
      console.error('Error loading locations', e);
      toast.error('Failed to load locations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLocations();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.state) {
      toast.error('Name and State are required');
      return;
    }
    
    if (isDemo) {
      toast.error('Creating locations is disabled in demo mode');
      return;
    }

    try {
      setSaving(true);
      const { error } = await supabase.from('locations').insert([formData]);
      if (error) throw error;
      toast.success('Location added');
      setFormData({
        name: '',
        type: 'branch',
        state: '',
        district: '',
        city: '',
        pincode: ''
      });
      await loadLocations();
    } catch (e) {
      console.error('Error adding location', e);
      toast.error('Failed to add location');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (isDemo) {
      toast.error('Deleting locations is disabled in demo mode');
      return;
    }
    if (!confirm('Are you sure you want to delete this location?')) return;

    try {
      const { error } = await supabase.from('locations').delete().eq('id', id);
      if (error) throw error;
      toast.success('Location deleted');
      setLocations(prev => prev.filter(l => l.id !== id));
    } catch (e) {
      console.error('Error deleting location', e);
      toast.error('Failed to delete location');
    }
  };

  const filteredLocations = locations.filter(l => filterType === 'all' || l.type === filterType);

  if (loading && locations.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <MapPin className="h-8 w-8 text-indigo-600" />
            Location Hierarchy
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage administrative boundaries and operational branches (State → District → City → Branch)
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Plus className="h-5 w-5 text-indigo-500" />
          Add New Location
        </h2>
        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 items-end">
          <div className="lg:col-span-1">
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
            <select
              value={formData.type}
              onChange={e => setFormData({ ...formData, type: e.target.value as any })}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 dark:bg-gray-900 dark:text-white"
            >
              <option value="state">State</option>
              <option value="district">District</option>
              <option value="city">City</option>
              <option value="village">Village</option>
              <option value="branch">Branch / Yard</option>
            </select>
          </div>
          
          <div className="lg:col-span-1">
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">State</label>
            <input
              type="text"
              value={formData.state}
              onChange={e => setFormData({ ...formData, state: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 dark:bg-gray-900 dark:text-white"
              placeholder="e.g. Maharashtra"
            />
          </div>

          <div className="lg:col-span-1">
             <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">District</label>
             <input
              type="text"
              value={formData.district || ''}
              onChange={e => setFormData({ ...formData, district: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 dark:bg-gray-900 dark:text-white"
              placeholder="e.g. Pune"
            />
          </div>

          <div className="lg:col-span-1">
             <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">City / Village</label>
             <input
              type="text"
              value={formData.city || ''}
              onChange={e => setFormData({ ...formData, city: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 dark:bg-gray-900 dark:text-white"
              placeholder="e.g. Hinjewadi"
            />
          </div>

          <div className="lg:col-span-1">
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Location Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 dark:bg-gray-900 dark:text-white"
              placeholder="e.g. Main Yard"
            />
          </div>

          <div className="lg:col-span-1">
            <button
              type="submit"
              disabled={saving}
              className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 flex justify-center items-center"
            >
              {saving ? 'Saving...' : 'Add Location'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h3 className="font-medium text-gray-900 dark:text-white">Existing Locations</h3>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className="text-sm border-none bg-transparent focus:ring-0 text-gray-600 dark:text-gray-300"
            >
              <option value="all">All Types</option>
              <option value="state">States</option>
              <option value="district">Districts</option>
              <option value="city">Cities</option>
              <option value="branch">Branches</option>
            </select>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Hierarchy</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Pincode</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredLocations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    No locations found.
                  </td>
                </tr>
              ) : (
                filteredLocations.map((loc) => (
                  <tr key={loc.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${loc.type === 'state' ? 'bg-purple-100 text-purple-800' : 
                          loc.type === 'district' ? 'bg-blue-100 text-blue-800' : 
                          loc.type === 'branch' ? 'bg-green-100 text-green-800' : 
                          'bg-gray-100 text-gray-800'}`}>
                        {loc.type ? loc.type.toUpperCase() : 'BRANCH'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 dark:text-white">
                      {loc.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">
                      <div className="flex flex-col text-xs">
                        {loc.state && <span>State: {loc.state}</span>}
                        {loc.district && <span>Dist: {loc.district}</span>}
                        {loc.city && <span>City: {loc.city}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">
                      {loc.pincode || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => handleDelete(loc.id)}
                        className="text-red-600 hover:text-red-900 dark:hover:text-red-400"
                        title="Delete Location"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminLocations;
