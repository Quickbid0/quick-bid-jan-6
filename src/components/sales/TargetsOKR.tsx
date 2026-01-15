import React from 'react';
import { Target } from 'lucide-react';
import { OKRTarget, calculateOKRProgress } from '../../types/business-metrics';

export const TargetsOKR = () => {
  const okrs: OKRTarget[] = [
    { 
      id: 'okr-1',
      metricId: 'gmv',
      label: 'Monthly GMV', 
      currentValue: 1250000, 
      targetValue: 2000000, 
      startDate: '2023-10-01',
      endDate: '2023-10-31'
    },
    { 
      id: 'okr-2',
      metricId: 'sellers',
      label: 'New Sellers', 
      currentValue: 12, 
      targetValue: 20, 
      startDate: '2023-10-01',
      endDate: '2023-10-31'
    },
    { 
      id: 'okr-3',
      metricId: 'auctions',
      label: 'Active Auctions', 
      currentValue: 45, 
      targetValue: 50, 
      startDate: '2023-10-01',
      endDate: '2023-10-31'
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Targets & OKRs</h3>
          <p className="text-sm text-slate-500">Q3 Performance Goals</p>
        </div>
        <div className="p-2 bg-indigo-100 rounded-full">
          <Target className="w-5 h-5 text-indigo-600" />
        </div>
      </div>

      <div className="space-y-6">
        {okrs.map((okr) => {
          const progress = calculateOKRProgress(okr.currentValue, okr.targetValue);
          const unit = okr.metricId === 'gmv' ? '₹' : '';
          
          return (
            <div key={okr.id}>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-slate-700 dark:text-slate-300">{okr.label}</span>
                <span className="text-slate-500">
                  {unit}{okr.currentValue.toLocaleString()} / {unit}{okr.targetValue.toLocaleString()}
                </span>
              </div>
              <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-600 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="mt-1 text-xs text-right text-indigo-600 font-medium">
                {Math.round(progress)}% Achieved
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-sm">
        <span className="text-slate-500">Quarter ends in 12 days</span>
        <button className="text-indigo-600 font-medium hover:text-indigo-700">View Details</button>
      </div>
    </div>
  );
};
