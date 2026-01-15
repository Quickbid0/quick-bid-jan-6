import React, { useState } from 'react';
import { TrendingUp, DollarSign, Users, Globe, BarChart3, Target } from 'lucide-react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { motion } from 'framer-motion';
import { supabase } from '../config/supabaseClient';
import { toast } from 'react-hot-toast';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const InvestorRelations = () => {
  const financialData = {
    revenue: 156000000,
    growth: 245,
    users: 125000,
    transactions: 45000,
    marketShare: 12.5,
    valuation: 2500000000
  };

  const revenueData = {
    labels: ['Q1 2023', 'Q2 2023', 'Q3 2023', 'Q4 2023', 'Q1 2024'],
    datasets: [{
      label: 'Revenue (₹ Crores)',
      data: [8.5, 12.3, 18.7, 24.1, 31.2],
      borderColor: '#4F46E5',
      backgroundColor: 'rgba(79, 70, 229, 0.1)',
      fill: true
    }]
  };

  const userGrowthData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Active Users',
      data: [85000, 92000, 98000, 105000, 118000, 125000],
      backgroundColor: '#10B981'
    }]
  };

  const milestones = [
    { year: '2020', event: 'Company Founded', description: 'QuickBid launched with vision to digitize auctions' },
    { year: '2021', event: 'Series A Funding', description: '₹50 Cr raised from leading VCs' },
    { year: '2022', event: 'AI Integration', description: 'Launched AI-powered recommendations and fraud detection' },
    { year: '2023', event: 'B2B Expansion', description: 'Partnered with major banks for asset recovery' },
    { year: '2024', event: 'International Launch', description: 'Expanded to Southeast Asian markets' }
  ];

  const [form, setForm] = useState({ name: '', email: '', company: '', cheque_size: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  const submitLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email) {
      toast.error('Name and email are required');
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.from('investor_leads').insert({
        name: form.name,
        email: form.email,
        company: form.company || null,
        cheque_size: form.cheque_size || null,
        message: form.message || null,
      });
      if (error) throw error;
      try {
        await fetch('/api/investor-lead-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form)
        });
      } catch {}
      toast.success('Thanks! We will reach out shortly.');
      setForm({ name: '', email: '', company: '', cheque_size: '', message: '' });
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-16">
        <TrendingUp className="h-20 w-20 text-primary-600 mx-auto mb-6" />
        <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
          Invest in High-Velocity Auctions
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          More investment. More returns. We operate a trusted, liquid marketplace with strong unit economics and scalable moats.
        </p>
        <div className="mt-6 flex flex-wrap gap-3 justify-center">
          <a href={(import.meta as any).env?.VITE_INVESTOR_DECK_URL || '#investor-form'} target={((import.meta as any).env?.VITE_INVESTOR_DECK_URL ? '_blank' : undefined) as any} className="btn btn-primary btn-lg">Request Deck</a>
          <a href={(import.meta as any).env?.VITE_INVESTOR_CALENDLY_URL || '#investor-form'} target={((import.meta as any).env?.VITE_INVESTOR_CALENDLY_URL ? '_blank' : undefined) as any} className="btn btn-outline btn-lg">Schedule a Call</a>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm text-center"
        >
          <DollarSign className="h-8 w-8 text-green-500 mx-auto mb-2" />
          <p className="text-sm text-gray-500">Annual Revenue</p>
          <p className="text-2xl font-bold text-green-600">₹{(financialData.revenue / 10000000).toFixed(0)} Cr</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm text-center"
        >
          <TrendingUp className="h-8 w-8 text-primary-600 mx-auto mb-2" />
          <p className="text-sm text-gray-500">YoY Growth</p>
          <p className="text-2xl font-bold text-primary-600">{financialData.growth}%</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm text-center"
        >
          <Users className="h-8 w-8 text-purple-500 mx-auto mb-2" />
          <p className="text-sm text-gray-500">Active Users</p>
          <p className="text-2xl font-bold text-purple-600">{(financialData.users / 1000).toFixed(0)}K</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm text-center"
        >
          <BarChart3 className="h-8 w-8 text-orange-500 mx-auto mb-2" />
          <p className="text-sm text-gray-500">Transactions</p>
          <p className="text-2xl font-bold text-orange-600">{(financialData.transactions / 1000).toFixed(0)}K</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm text-center"
        >
          <Globe className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <p className="text-sm text-gray-500">Market Share</p>
          <p className="text-2xl font-bold text-red-600">{financialData.marketShare}%</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm text-center"
        >
          <Target className="h-8 w-8 text-primary-600 mx-auto mb-2" />
          <p className="text-sm text-gray-500">Valuation</p>
          <p className="text-2xl font-bold text-primary-600">₹{(financialData.valuation / 10000000).toFixed(0)} Cr</p>
        </motion.div>
      </div>

      {/* Financial Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Revenue Growth</h2>
          <div className="h-64">
            <Line
              data={revenueData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } }
              }}
            />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">User Growth</h2>
          <div className="h-64">
            <Bar
              data={userGrowthData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } }
              }}
            />
          </div>
        </div>
      </div>

      {/* Company Milestones */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 mb-16">
        <h2 className="text-3xl font-bold text-center mb-8">Company Milestones</h2>
        <div className="space-y-6">
          {milestones.map((milestone, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start gap-6 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <div className="bg-primary-600 text-white px-4 py-2 rounded-lg font-bold">
                {milestone.year}
              </div>
              <div>
                <h3 className="font-semibold text-lg">{milestone.event}</h3>
                <p className="text-gray-600 dark:text-gray-300">{milestone.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Investment Opportunity */}
      <div className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-2xl p-8 mb-16">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Investment Opportunity</h2>
          <p className="text-lg mb-8">
            Earn high returns by partnering with our high-velocity marketplace. Strong LTV/CAC, diversified revenue streams, and robust risk controls.
          </p>
          <div className="flex justify-center gap-6">
            <a href={(import.meta as any).env?.VITE_INVESTOR_DECK_URL || '#investor-form'} target={((import.meta as any).env?.VITE_INVESTOR_DECK_URL ? '_blank' : undefined) as any} className="btn btn-white btn-lg">
              Request Pitch Deck
            </a>
            <a href={(import.meta as any).env?.VITE_INVESTOR_CALENDLY_URL || '#investor-form'} target={((import.meta as any).env?.VITE_INVESTOR_CALENDLY_URL ? '_blank' : undefined) as any} className="btn btn-outline-invert btn-lg">
              Schedule Meeting
            </a>
          </div>
        </div>
      </div>

      {/* Investor Interest Form */}
      <div id="investor-form" className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm">
        <h2 className="text-2xl font-bold mb-4">Express Interest</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">Share your details and we’ll get back with our deck and next steps.</p>
        <form onSubmit={submitLead} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">Name</label>
            <input value={form.name} onChange={(e)=>setForm({...form, name: e.target.value})} required className="w-full border rounded px-3 py-2"/>
          </div>
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input type="email" value={form.email} onChange={(e)=>setForm({...form, email: e.target.value})} required className="w-full border rounded px-3 py-2"/>
          </div>
          <div>
            <label className="block text-sm mb-1">Company</label>
            <input value={form.company} onChange={(e)=>setForm({...form, company: e.target.value})} className="w-full border rounded px-3 py-2"/>
          </div>
          <div>
            <label className="block text-sm mb-1">Cheque Size</label>
            <input value={form.cheque_size} onChange={(e)=>setForm({...form, cheque_size: e.target.value})} placeholder="e.g., $100k - $500k" className="w-full border rounded px-3 py-2"/>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm mb-1">Message</label>
            <textarea value={form.message} onChange={(e)=>setForm({...form, message: e.target.value})} rows={4} className="w-full border rounded px-3 py-2"/>
          </div>
          <div className="md:col-span-2 flex justify-end">
            <button disabled={submitting} className="btn btn-primary">
              {submitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InvestorRelations;