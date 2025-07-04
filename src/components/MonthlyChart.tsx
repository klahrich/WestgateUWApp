import React from 'react';

interface MonthlyStats {
  month: string;
  total: number;
  accepted: number;
  refused: number;
  acceptanceRate: number;
}

interface MonthlyChartProps {
  data: MonthlyStats[];
}

export const MonthlyChart: React.FC<MonthlyChartProps> = ({ data }) => {
  const maxTotal = Math.max(...data.map(d => d.total));
  
  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  return (
    <div className="space-y-4">
      {data.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <p>No data available for the selected period</p>
        </div>
      ) : (
        <div className="space-y-4">
          {data.map((month, index) => {
            const acceptedPercentage = maxTotal > 0 ? (month.accepted / maxTotal) * 100 : 0;
            const refusedPercentage = maxTotal > 0 ? (month.refused / maxTotal) * 100 : 0;
            const totalPercentage = acceptedPercentage + refusedPercentage;
            
            return (
              <div key={month.month} className="flex items-center space-x-4 group">
                <div className="w-20 text-sm text-gray-300 font-medium">
                  {formatMonth(month.month)}
                </div>
                <div className="flex-1 relative">
                  <div className="bg-gray-700/50 rounded-full h-8 overflow-hidden border border-gray-600/30">
                    {/* Combined bar container */}
                    <div 
                      className="h-full flex rounded-full overflow-hidden transition-all duration-500"
                      style={{ width: `${totalPercentage}%` }}
                    >
                      {/* Accepted portion */}
                      {month.accepted > 0 && (
                        <div 
                          className="bg-gradient-to-r from-emerald-400 to-green-500 h-full transition-all duration-500 shadow-lg"
                          style={{ 
                            width: `${acceptedPercentage > 0 ? (acceptedPercentage / totalPercentage) * 100 : 0}%`
                          }}
                        />
                      )}
                      {/* Refused portion */}
                      {month.refused > 0 && (
                        <div 
                          className="bg-gradient-to-r from-red-400 to-pink-500 h-full transition-all duration-500 shadow-lg"
                          style={{ 
                            width: `${refusedPercentage > 0 ? (refusedPercentage / totalPercentage) * 100 : 0}%`
                          }}
                        />
                      )}
                    </div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-bold text-white drop-shadow-lg">
                      {month.total}
                    </span>
                  </div>
                </div>
                <div className="w-16 text-sm text-gray-300 text-right font-medium">
                  <span className="bg-gray-700/50 px-2 py-1 rounded-md border border-gray-600/30">
                    {month.acceptanceRate.toFixed(1)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};