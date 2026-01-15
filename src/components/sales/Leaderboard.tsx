import React from 'react';
import { Trophy, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { cn } from '../../lib/utils';
import { SalesLeaderboardEntry } from '../../types/business-metrics';

export const Leaderboard = () => {
  const leaders: SalesLeaderboardEntry[] = [
    { rank: 1, salesRepId: 'sr-1', name: 'Arjun Singh', totalSales: 4500000, dealsClosed: 12, trend: 'up' },
    { rank: 2, salesRepId: 'sr-2', name: 'Priya Sharma', totalSales: 3800000, dealsClosed: 9, trend: 'up' },
    { rank: 3, salesRepId: 'sr-3', name: 'Rahul Verma', totalSales: 3200000, dealsClosed: 8, trend: 'down' },
    { rank: 4, salesRepId: 'sr-4', name: 'Sneha Gupta', totalSales: 2900000, dealsClosed: 10, trend: 'neutral' },
    { rank: 5, salesRepId: 'sr-5', name: 'Vikram Malhotra', totalSales: 2100000, dealsClosed: 6, trend: 'up' },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Leaderboard</h3>
          <p className="text-sm text-slate-500">Top performers this month</p>
        </div>
        <div className="p-2 bg-amber-100 rounded-full">
          <Trophy className="w-5 h-5 text-amber-600" />
        </div>
      </div>

      <div className="space-y-4">
        {leaders.map((leader) => (
          <div key={leader.salesRepId} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm",
                leader.rank === 1 ? "bg-amber-100 text-amber-700" :
                leader.rank === 2 ? "bg-slate-200 text-slate-700" :
                leader.rank === 3 ? "bg-orange-100 text-orange-700" :
                "bg-slate-50 text-slate-500"
              )}>
                {leader.rank}
              </div>
              <div>
                <div className="font-medium text-slate-900 dark:text-white">{leader.name}</div>
                <div className="text-xs text-slate-500">{leader.dealsClosed} deals closed</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-semibold text-slate-900 dark:text-white">₹{(leader.totalSales / 100000).toFixed(1)}L</div>
              <div className="flex items-center justify-end text-xs">
                {leader.trend === 'up' && <ArrowUp className="w-3 h-3 text-green-500 mr-1" />}
                {leader.trend === 'down' && <ArrowDown className="w-3 h-3 text-red-500 mr-1" />}
                {leader.trend === 'neutral' && <Minus className="w-3 h-3 text-slate-400 mr-1" />}
                <span className="text-slate-400">vs last week</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
