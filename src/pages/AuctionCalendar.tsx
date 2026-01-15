import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Bell, Eye, Filter, Plus, Video, Timer, FileText, Users, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';

interface AuctionEvent {
  id: string;
  title: string;
  type: 'live' | 'timed' | 'tender';
  start_time: string;
  end_time: string;
  current_price: number;
  image_url: string;
  seller: string;
  category: string;
  status: 'scheduled' | 'live' | 'ended';
  viewer_count?: number;
  bid_count?: number;
}

const AuctionCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [auctions, setAuctions] = useState<AuctionEvent[]>([]);
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [filter, setFilter] = useState('all');
  const [reminders, setReminders] = useState<string[]>([]);

  const mockAuctions: AuctionEvent[] = [
    {
      id: '1',
      title: 'Vintage Watch Collection Auction',
      type: 'live',
      start_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      end_time: new Date(Date.now() + 26 * 60 * 60 * 1000).toISOString(),
      current_price: 125000,
      image_url: 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&w=400&q=80',
      seller: 'Heritage Timepieces',
      category: 'Jewelry',
      status: 'scheduled',
      viewer_count: 0,
      bid_count: 0
    },
    {
      id: '2',
      title: 'Government Vehicle Fleet Tender',
      type: 'tender',
      start_time: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
      end_time: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
      current_price: 2500000,
      image_url: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=400&q=80',
      seller: 'Transport Department',
      category: 'Vehicles',
      status: 'scheduled',
      bid_count: 0
    },
    {
      id: '3',
      title: 'Contemporary Art Exhibition Auction',
      type: 'timed',
      start_time: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
      end_time: new Date(Date.now() + 168 * 60 * 60 * 1000).toISOString(),
      current_price: 45000,
      image_url: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?auto=format&fit=crop&w=400&q=80',
      seller: 'Modern Art Gallery',
      category: 'Art',
      status: 'scheduled',
      bid_count: 0
    }
  ];

  useEffect(() => {
    setAuctions(mockAuctions);
  }, []);

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getAuctionsForDate = (date: Date) => {
    return auctions.filter(auction => {
      const auctionDate = new Date(auction.start_time);
      return auctionDate.toDateString() === date.toDateString();
    });
  };

  const setReminder = (auctionId: string) => {
    if (reminders.includes(auctionId)) {
      setReminders(prev => prev.filter(id => id !== auctionId));
      toast.success('Reminder removed');
    } else {
      setReminders(prev => [...prev, auctionId]);
      toast.success('Reminder set successfully!');
    }
  };

  const getAuctionTypeIcon = (type: string) => {
    switch (type) {
      case 'live':
        return <Video className="h-4 w-4" />;
      case 'timed':
        return <Timer className="h-4 w-4" />;
      case 'tender':
        return <FileText className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const getAuctionTypeColor = (type: string) => {
    switch (type) {
      case 'live':
        return 'bg-red-100 text-red-800';
      case 'timed':
        return 'bg-blue-100 text-blue-800';
      case 'tender':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderCalendarGrid = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 border border-gray-200 dark:border-gray-700"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dayAuctions = getAuctionsForDate(date);
      const isSelected = selectedDate.toDateString() === date.toDateString();
      const isToday = new Date().toDateString() === date.toDateString();

      days.push(
        <div
          key={day}
          onClick={() => setSelectedDate(date)}
          className={`h-24 border border-gray-200 dark:border-gray-700 p-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
            isSelected ? 'bg-indigo-100 dark:bg-indigo-900/30 border-indigo-500' : 
            isToday ? 'bg-blue-50 dark:bg-blue-900/30' : ''
          }`}
        >
          <div className="font-medium text-sm">{day}</div>
          {dayAuctions.length > 0 && (
            <div className="mt-1">
              {dayAuctions.slice(0, 2).map(auction => (
                <div
                  key={auction.id}
                  className={`text-xs p-1 rounded mb-1 ${getAuctionTypeColor(auction.type)}`}
                >
                  {auction.title.substring(0, 15)}...
                </div>
              ))}
              {dayAuctions.length > 2 && (
                <div className="text-xs text-gray-500">+{dayAuctions.length - 2} more</div>
              )}
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  const filteredAuctions = filter === 'all' ? auctions : auctions.filter(a => a.type === filter);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Auction Calendar</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">Schedule and track upcoming auctions</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            {['month', 'week', 'day'].map((viewType) => (
              <button
                key={viewType}
                onClick={() => setView(viewType as any)}
                className={`px-4 py-2 rounded-md text-sm font-medium capitalize ${
                  view === viewType ? 'bg-white dark:bg-gray-600 shadow-sm' : 'text-gray-600 dark:text-gray-300'
                }`}
              >
                {viewType}
              </button>
            ))}
          </div>
          
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Types</option>
            <option value="live">Live Auctions</option>
            <option value="timed">Timed Auctions</option>
            <option value="tender">Tender Auctions</option>
          </select>
        </div>
      </div>

      {/* Calendar Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm text-center">
          <Calendar className="h-8 w-8 text-indigo-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{auctions.length}</p>
          <p className="text-sm text-gray-500">Scheduled Auctions</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm text-center">
          <Video className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{auctions.filter(a => a.type === 'live').length}</p>
          <p className="text-sm text-gray-500">Live Streams</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm text-center">
          <FileText className="h-8 w-8 text-purple-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{auctions.filter(a => a.type === 'tender').length}</p>
          <p className="text-sm text-gray-500">Tender Auctions</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm text-center">
          <Bell className="h-8 w-8 text-orange-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{reminders.length}</p>
          <p className="text-sm text-gray-500">Active Reminders</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Calendar */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
            {/* Calendar Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  ←
                </button>
                <h2 className="text-2xl font-semibold">
                  {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h2>
                <button
                  onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  →
                </button>
              </div>
              <button 
                onClick={() => setCurrentDate(new Date())}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
              >
                Today
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="p-6">
              <div className="grid grid-cols-7 gap-0 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="p-3 text-center font-medium text-gray-500 dark:text-gray-400">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-0">
                {renderCalendarGrid()}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Selected Date Auctions */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">
              {selectedDate.toLocaleDateString('en-US', { 
                month: 'long', 
                day: 'numeric',
                year: 'numeric'
              })}
            </h3>
            
            {getAuctionsForDate(selectedDate).length === 0 ? (
              <div className="text-center py-6">
                <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No auctions scheduled</p>
              </div>
            ) : (
              <div className="space-y-3">
                {getAuctionsForDate(selectedDate).map(auction => (
                  <motion.div
                    key={auction.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border rounded-lg p-3 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-sm line-clamp-2">{auction.title}</h4>
                      <span className={`px-2 py-1 text-xs rounded-full flex items-center gap-1 ${getAuctionTypeColor(auction.type)}`}>
                        {getAuctionTypeIcon(auction.type)}
                        {auction.type.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                      <span>{new Date(auction.start_time).toLocaleTimeString()}</span>
                      <span>{auction.seller}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-green-600">
                        ₹{auction.current_price.toLocaleString()}
                      </span>
                      <button
                        onClick={() => setReminder(auction.id)}
                        className={`p-1 rounded ${
                          reminders.includes(auction.id) 
                            ? 'text-orange-600 bg-orange-100' 
                            : 'text-gray-400 hover:text-orange-600'
                        }`}
                      >
                        <Bell className="h-4 w-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">This Month</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Total Auctions</span>
                <span className="font-bold">{auctions.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Live Streams</span>
                <span className="font-bold text-red-600">{auctions.filter(a => a.type === 'live').length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Tender Auctions</span>
                <span className="font-bold text-purple-600">{auctions.filter(a => a.type === 'tender').length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Total Value</span>
                <span className="font-bold text-green-600">
                  ₹{(auctions.reduce((sum, a) => sum + a.current_price, 0) / 100000).toFixed(1)}L
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Auction Calendar Tips */}
      <div className="mt-12 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-center mb-8">Make the Most of Auction Calendar</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-indigo-100 dark:bg-indigo-900/30 p-4 rounded-xl mb-4 inline-block">
              <Bell className="h-8 w-8 text-indigo-600" />
            </div>
            <h3 className="font-semibold mb-2">Set Reminders</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Never miss an auction with our smart reminder system
            </p>
          </div>
          <div className="text-center">
            <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-xl mb-4 inline-block">
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="font-semibold mb-2">Plan Your Strategy</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Research upcoming auctions and plan your bidding strategy
            </p>
          </div>
          <div className="text-center">
            <div className="bg-purple-100 dark:bg-purple-900/30 p-4 rounded-xl mb-4 inline-block">
              <Users className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="font-semibold mb-2">Track Competition</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Monitor bidder activity and market trends
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuctionCalendar;