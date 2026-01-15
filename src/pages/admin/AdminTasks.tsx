import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../config/supabaseClient';
import { toast } from 'react-hot-toast';
import {
  CheckSquare,
  Clock,
  AlertCircle,
  MapPin,
  User,
  Filter,
  Search,
  Plus,
  ArrowRight,
  History,
  X,
  Shield,
  Briefcase
} from 'lucide-react';
import LocationFilter from '../../components/admin/LocationFilter';
// Define inline types for Task-related entities since the external types file is missing
type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'overdue';
type TaskPriority = 'critical' | 'high' | 'medium' | 'low';
type TaskType = 'onboard_seller' | 'audit_location' | 'moderate_category' | 'verify_product';

interface Task {
  id: string;
  title: string;
  description: string;
  type: TaskType;
  status: TaskStatus;
  priority: TaskPriority;
  assigned_to?: { id: string; name: string };
  location_scope?: { id: string; name: string; type: 'branch' | 'state' };
  due_date: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  audit_trail: Array<{
    id: string;
    action: string;
    details: string;
    performed_by: string;
    timestamp: string;
  }>;
}

// Types - imported from types/admin

interface StaffMember {
  id: string;
  name: string;
  role: string;
}

// Mock Data
const MOCK_STAFF: StaffMember[] = [
  { id: 's1', name: 'Rajesh Kumar', role: 'Sales Executive' },
  { id: 's2', name: 'Amit Singh', role: 'Field Verifier' },
  { id: 's3', name: 'Priya Patel', role: 'Support Agent' },
  { id: 's4', name: 'Sneha Gupta', role: 'Content Staff' }
];

const MOCK_CURRENT_STAFF = {
  id: 's1',
  name: 'Rajesh Kumar',
  role: 'sales_executive',
  location_scope: { id: 'l1', name: 'Mumbai Central', type: 'branch' }
};

const AdminTasks = () => {
  // State
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterLocation, setFilterLocation] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [viewMode, setViewMode] = useState<'admin' | 'staff'>('admin'); // For demo purposes
  
  const isDemo = localStorage.getItem('demo-session') !== null;

  // Load Tasks
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      if (isDemo) {
        // Mock data for demo
        const mockTasks: Task[] = [
          {
            id: '1',
            title: 'Verify Seller Documentation - ABC Motors',
            description: 'Verify GST and business registration documents for ABC Motors.',
            type: 'onboard_seller',
            status: 'pending',
            priority: 'high',
            assigned_to: { id: 's1', name: 'Rajesh Kumar' },
            location_scope: { id: 'l1', name: 'Mumbai Central', type: 'branch' },
            due_date: new Date(Date.now() + 86400000).toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            created_by: 'admin',
            audit_trail: [
              {
                id: 'a1',
                action: 'created',
                details: 'Task created',
                performed_by: 'Admin',
                timestamp: new Date().toISOString()
              }
            ]
          },
          {
            id: '2',
            title: 'Audit Branch - Delhi North',
            description: 'Perform quarterly audit of Delhi North branch operations.',
            type: 'audit_location',
            status: 'in_progress',
            priority: 'critical',
            assigned_to: { id: 's2', name: 'Amit Singh' },
            location_scope: { id: 'l2', name: 'Delhi North', type: 'branch' },
            due_date: new Date(Date.now() + 172800000).toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            created_by: 'admin',
            audit_trail: []
          },
          {
             id: '3',
             title: 'Moderate New Vehicles Category',
             description: 'Review pending category additions for new vehicle types.',
             type: 'moderate_category',
             status: 'pending',
             priority: 'medium',
             location_scope: { id: 's1', name: 'Maharashtra', type: 'state' },
             due_date: new Date(Date.now() + 259200000).toISOString(),
             created_at: new Date().toISOString(),
             updated_at: new Date().toISOString(),
             created_by: 'admin',
             audit_trail: []
          },
          {
             id: '4',
             title: 'Verify Product - iPhone 15 Pro',
             description: 'Physical verification required for high-value item.',
             type: 'verify_product',
             status: 'overdue',
             priority: 'high',
             assigned_to: { id: 's1', name: 'Rajesh Kumar' },
             location_scope: { id: 'l1', name: 'Mumbai Central', type: 'branch' },
             due_date: new Date(Date.now() - 86400000).toISOString(),
             created_at: new Date(Date.now() - 172800000).toISOString(),
             updated_at: new Date().toISOString(),
             created_by: 'admin',
             audit_trail: []
          }
        ];
        setTasks(mockTasks);
        setLoading(false);
        return;
      }

      // Real API call would go here
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('due_date', { ascending: true });

      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  // Actions
  const handleStatusChange = async (taskId: string, newStatus: string) => {
    if (isDemo) {
      // Update local state for demo feel
      setTasks(prev => prev.map(t => {
        if (t.id === taskId) {
            return {
                ...t,
                status: newStatus as TaskStatus,
                audit_trail: [
                    ...t.audit_trail,
                    {
                        id: Math.random().toString(36).slice(2, 11),
                        action: 'status_change',
                        details: `Status changed to ${newStatus}`,
                        performed_by: viewMode === 'admin' ? 'Admin' : MOCK_CURRENT_STAFF.name,
                        timestamp: new Date().toISOString()
                    }
                ]
            };
        }
        return t;
      }));
      if (selectedTask && selectedTask.id === taskId) {
          setSelectedTask(prev => prev ? ({ 
            ...prev, 
            status: newStatus as TaskStatus,
            audit_trail: [
              ...(prev.audit_trail || []),
              {
                id: Math.random().toString(36).slice(2, 11),
                action: 'status_change',
                details: `Status changed to ${newStatus}`,
                performed_by: viewMode === 'admin' ? 'Admin' : MOCK_CURRENT_STAFF.name,
                timestamp: new Date().toISOString()
              }
            ]
          }) : null);
      }
      toast.success(`Task status updated to ${newStatus}`);
      return;
    }
    // Real backend call
  };

  const handleReassign = async (taskId: string, staffId: string) => {
      if (isDemo) {
          const newStaff = MOCK_STAFF.find(s => s.id === staffId);
          setTasks(prev => prev.map(t => {
              if (t.id === taskId) {
                  return {
                      ...t,
                      assigned_to: newStaff ? { id: newStaff.id, name: newStaff.name } : undefined,
                      audit_trail: [
                          ...t.audit_trail,
                          {
                              id: Math.random().toString(36).substr(2, 9),
                              action: 'reassign',
                              details: `Reassigned to ${newStaff?.name}`,
                              performed_by: 'Admin',
                              timestamp: new Date().toISOString()
                          }
                      ]
                  };
              }
              return t;
          }));
          
          if (selectedTask && selectedTask.id === taskId) {
             const newStaff = MOCK_STAFF.find(s => s.id === staffId);
             setSelectedTask(prev => prev ? ({
               ...prev,
               assigned_to: newStaff ? { id: newStaff.id, name: newStaff.name } : undefined,
               audit_trail: [
                 ...(prev.audit_trail || []),
                 {
                    id: Math.random().toString(36).substr(2, 9),
                    action: 'reassign',
                    details: `Reassigned to ${newStaff?.name}`,
                    performed_by: 'Admin',
                    timestamp: new Date().toISOString()
                 }
               ]
             }) : null);
          }
          toast.success(`Task reassigned to ${newStaff?.name}`);
      }
  };

  // Filtering
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      // 1. View Mode Filter (Staff vs Admin)
      if (viewMode === 'staff') {
          // Staff can only see tasks in their location
          if (task.location_scope?.id !== MOCK_CURRENT_STAFF.location_scope.id) {
              return false;
          }
      }

      // 2. Search Filter
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           task.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      // 3. Status Filter
      const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
      
      // 4. Priority Filter
      const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
      
      // 5. Location Filter (Admin only)
      const matchesLocation = viewMode === 'staff' || !filterLocation || task.location_scope?.id === filterLocation;

      return matchesSearch && matchesStatus && matchesPriority && matchesLocation;
    });
  }, [tasks, searchTerm, filterStatus, filterPriority, filterLocation, viewMode]);

  // Helpers
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getTypeLabel = (type: string) => {
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <CheckSquare className="h-8 w-8 text-indigo-600" />
            Task Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Track and assign operational tasks across locations
          </p>
        </div>
        <div className="flex gap-3">
             {/* View Mode Toggle for Demo */}
             {isDemo && (
                 <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                     <button
                        onClick={() => setViewMode('admin')}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                            viewMode === 'admin' 
                            ? 'bg-white dark:bg-gray-600 shadow text-indigo-600 dark:text-white' 
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                        }`}
                     >
                        <Shield className="w-4 h-4 inline mr-1" />
                        Admin View
                     </button>
                     <button
                        onClick={() => setViewMode('staff')}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
                            viewMode === 'staff' 
                            ? 'bg-white dark:bg-gray-600 shadow text-indigo-600 dark:text-white' 
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
                        }`}
                     >
                        <Briefcase className="w-4 h-4 inline mr-1" />
                        Staff View
                     </button>
                 </div>
             )}
            <button 
                onClick={() => isDemo ? toast.error('Create task disabled in demo mode') : null}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
                <Plus className="h-5 w-5" />
                Create Task
            </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-6 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
        <div className="flex gap-4 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 items-center">
          {viewMode === 'admin' && (
              <LocationFilter onFilterChange={setFilterLocation} className="min-w-[200px]" />
          )}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="overdue">Overdue</option>
          </select>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="all">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <button className="p-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
            <Filter className="h-5 w-5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Tasks Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredTasks.map((task) => (
            <div 
              key={task.id} 
              className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border-l-4 hover:shadow-md transition-shadow cursor-pointer"
              style={{ borderLeftColor: task.priority === 'critical' ? '#ef4444' : task.priority === 'high' ? '#f97316' : '#3b82f6' }}
              onClick={() => setSelectedTask(task)}
            >
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getPriorityColor(task.priority)} uppercase tracking-wide`}>
                      {task.priority}
                    </span>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(task.status)} uppercase tracking-wide`}>
                      {task.status.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Due: {new Date(task.due_date).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{task.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{task.description}</p>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      Assigned: <span className="font-medium text-gray-900 dark:text-white ml-1">{task.assigned_to?.name || 'Unassigned'}</span>
                    </div>
                    {task.location_scope && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        Location: <span className="font-medium text-gray-900 dark:text-white ml-1">{task.location_scope.name}</span>
                        <span className="text-xs bg-gray-100 dark:bg-gray-700 px-1.5 rounded ml-1">{task.location_scope.type}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      Type: <span className="font-medium text-gray-900 dark:text-white ml-1">{getTypeLabel(task.type)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 md:self-center border-t md:border-t-0 md:border-l border-gray-100 dark:border-gray-700 pt-4 md:pt-0 md:pl-4">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setSelectedTask(task); }}
                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
                    title="View Details"
                  >
                    <ArrowRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {filteredTasks.length === 0 && (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
              <CheckSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">No tasks found</h3>
              <p className="text-gray-500">
                  {viewMode === 'staff' 
                    ? `No tasks assigned to your location (${MOCK_CURRENT_STAFF.location_scope.name})` 
                    : 'Try adjusting your filters or search query'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Task Detail Modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedTask.title}</h2>
                    <div className="flex items-center gap-2 mt-2">
                         <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getPriorityColor(selectedTask.priority)} uppercase tracking-wide`}>
                            {selectedTask.priority}
                        </span>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(selectedTask.status)} uppercase tracking-wide`}>
                            {selectedTask.status.replace('_', ' ')}
                        </span>
                    </div>
                </div>
                <button 
                    onClick={() => setSelectedTask(null)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <div>
                      <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Details</h3>
                      <p className="text-gray-700 dark:text-gray-300 mb-4">{selectedTask.description}</p>
                      
                      <div className="space-y-3">
                          <div className="flex items-center gap-2 text-sm">
                              <MapPin className="h-4 w-4 text-gray-400" />
                              <span className="text-gray-600 dark:text-gray-400">Location:</span>
                              <span className="font-medium dark:text-white">{selectedTask.location_scope?.name}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                              <AlertCircle className="h-4 w-4 text-gray-400" />
                              <span className="text-gray-600 dark:text-gray-400">Type:</span>
                              <span className="font-medium dark:text-white">{getTypeLabel(selectedTask.type)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                              <Clock className="h-4 w-4 text-gray-400" />
                              <span className="text-gray-600 dark:text-gray-400">Due Date:</span>
                              <span className="font-medium dark:text-white">{new Date(selectedTask.due_date).toLocaleDateString()}</span>
                          </div>
                      </div>
                  </div>

                  <div>
                      <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Assignment</h3>
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                          <div className="mb-4">
                              <label className="block text-xs font-medium text-gray-500 mb-1">Assigned To</label>
                              {viewMode === 'admin' ? (
                                  <select 
                                    className="w-full text-sm border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600"
                                    value={selectedTask.assigned_to?.id || ''}
                                    onChange={(e) => handleReassign(selectedTask.id, e.target.value)}
                                  >
                                      <option value="">Unassigned</option>
                                      {MOCK_STAFF.map(s => (
                                          <option key={s.id} value={s.id}>{s.name} ({s.role})</option>
                                      ))}
                                  </select>
                              ) : (
                                  <div className="flex items-center gap-2">
                                      <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                                          {selectedTask.assigned_to?.name.charAt(0)}
                                      </div>
                                      <span className="font-medium dark:text-white">{selectedTask.assigned_to?.name}</span>
                                  </div>
                              )}
                          </div>

                          <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">Update Status</label>
                              <select 
                                className="w-full text-sm border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600"
                                value={selectedTask.status}
                                onChange={(e) => handleStatusChange(selectedTask.id, e.target.value)}
                              >
                                  <option value="pending">Pending</option>
                                  <option value="in_progress">In Progress</option>
                                  <option value="completed">Completed</option>
                                  <option value="overdue">Overdue</option>
                              </select>
                          </div>
                      </div>
                  </div>
              </div>

              {/* Audit Trail */}
              <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <History className="h-4 w-4" />
                      Audit Trail
                  </h3>
                  <div className="border-l-2 border-gray-200 dark:border-gray-700 pl-4 space-y-4">
                      {selectedTask.audit_trail?.map((log) => (
                          <div key={log.id} className="relative">
                              <div className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-gray-300 dark:bg-gray-600 border-2 border-white dark:border-gray-800"></div>
                              <p className="text-sm text-gray-900 dark:text-white font-medium">{log.details}</p>
                              <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
                                  <span>{log.performed_by}</span>
                                  <span>•</span>
                                  <span>{new Date(log.timestamp).toLocaleString()}</span>
                              </div>
                          </div>
                      ))}
                      {(!selectedTask.audit_trail || selectedTask.audit_trail.length === 0) && (
                          <p className="text-sm text-gray-500 italic">No activity recorded yet.</p>
                      )}
                  </div>
              </div>

            </div>
            <div className="bg-gray-50 dark:bg-gray-700/30 px-6 py-4 rounded-b-xl flex justify-end">
                <button 
                    onClick={() => setSelectedTask(null)}
                    className="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                    Close
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTasks;
