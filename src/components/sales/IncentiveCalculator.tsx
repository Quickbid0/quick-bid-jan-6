import React, { useState } from 'react';
import { Calculator, IndianRupee } from 'lucide-react';
import { calculateIncentive, STANDARD_SALES_INCENTIVE } from '../../types/business-metrics';

export const IncentiveCalculator = () => {
  const [gmv, setGmv] = useState<number>(500000);
  const [target, setTarget] = useState<number>(2000000);
  const [deals, setDeals] = useState<number>(5);
  
  // Calculate progress
  const achievementPercent = target > 0 ? (gmv / target) * 100 : 0;
  
  // Base commission (e.g., 1% of GMV) - this could be part of the rule or separate
  const baseCommission = gmv * 0.01;
  
  // Performance Bonus based on tiers
  const bonus = calculateIncentive(achievementPercent, baseCommission, STANDARD_SALES_INCENTIVE.tiers);
  
  // Deal bonus (keep the flat 500 per deal as an extra)
  const dealBonus = deals * 500;

  const totalEarnings = baseCommission + bonus + dealBonus;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Incentive Calculator</h3>
          <p className="text-sm text-slate-500">Estimate your earnings</p>
        </div>
        <div className="p-2 bg-emerald-100 rounded-full">
          <Calculator className="w-5 h-5 text-emerald-600" />
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Monthly Target (₹)
            </label>
            <input
              type="number"
              value={target}
              onChange={(e) => setTarget(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Projected GMV (₹)
            </label>
            <input
              type="number"
              value={gmv}
              onChange={(e) => setGmv(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Closed Deals
          </label>
          <input
            type="number"
            value={deals}
            onChange={(e) => setDeals(Number(e.target.value))}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm text-slate-500">Achievement: {Math.round(achievementPercent)}%</span>
            <span className="text-sm text-slate-500">Bonus: +₹{bonus.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm text-slate-500">Estimated Commission</span>
          </div>
          <div className="text-3xl font-bold text-emerald-600 flex items-center">
            <IndianRupee className="w-6 h-6 mr-1" />
            {totalEarnings.toLocaleString()}
          </div>
          <p className="text-xs text-slate-400 mt-2">
            *Includes 1% base, tier bonuses, and deal incentives.
          </p>
        </div>
      </div>
    </div>
  );
};
