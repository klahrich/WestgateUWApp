import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface MonthlyStats {
  month: string;
  total: number;
  accepted: number;
  refused: number;
  acceptanceRate: number;
}

interface StatsTableProps {
  data: MonthlyStats[];
}

export const StatsTable: React.FC<StatsTableProps> = ({ data }) => {
  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const getAcceptanceRateTrend = (currentRate: number, previousRate: number) => {
    if (previousRate === 0) return null;
    const diff = currentRate - previousRate;
    if (Math.abs(diff) < 0.1) return null;
    return diff > 0 ? 'up' : 'down';
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-700/30 border-b border-gray-600/30">
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Month
            </th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Total Loans
            </th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Accepted
            </th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Refused
            </th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
              Acceptance Rate
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700/30">
          {data.map((month, index) => {
            const prevMonth = index > 0 ? data[index - 1] : null;
            const trend = prevMonth ? getAcceptanceRateTrend(month.acceptanceRate, prevMonth.acceptanceRate) : null;
            
            return (
              <tr key={month.month} className="hover:bg-gray-700/20 transition-colors duration-200">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-200">
                  {formatMonth(month.month)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  <span className="bg-gray-700/30 px-2 py-1 rounded-md border border-gray-600/30">
                    {month.total.toLocaleString()}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  <div className="flex items-center space-x-2">
                    <span className="text-emerald-400 font-medium bg-emerald-400/10 px-2 py-1 rounded-md border border-emerald-400/20">
                      {month.accepted.toLocaleString()}
                    </span>
                    <span className="text-gray-400 text-xs">
                      ({((month.accepted / month.total) * 100).toFixed(1)}%)
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  <div className="flex items-center space-x-2">
                    <span className="text-red-400 font-medium bg-red-400/10 px-2 py-1 rounded-md border border-red-400/20">
                      {month.refused.toLocaleString()}
                    </span>
                    <span className="text-gray-400 text-xs">
                      ({((month.refused / month.total) * 100).toFixed(1)}%)
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium bg-purple-400/10 px-2 py-1 rounded-md border border-purple-400/20 text-purple-400">
                      {month.acceptanceRate.toFixed(1)}%
                    </span>
                    {trend && (
                      <div className={`flex items-center ${trend === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
                        {trend === 'up' ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {data.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <p>No data available for the selected period</p>
        </div>
      )}
    </div>
  );
};