import React, { useMemo } from 'react';

interface ThresholdMatrixProps {
  loans: Array<{
    default_score: number;
    refusal_score: number;
  }>;
  onSelectThresholds?: (defaultThreshold: number, refusalThreshold: number) => void;
  selectedDefaultThreshold?: number;
  selectedRefusalThreshold?: number;
}

export const ThresholdMatrix: React.FC<ThresholdMatrixProps> = ({
  loans,
  onSelectThresholds,
  selectedDefaultThreshold,
  selectedRefusalThreshold
}) => {
  // Generate threshold values from 0 to 1 with step 0.05
  const thresholds = useMemo(() => {
    const values: number[] = [];
    for (let i = 0; i <= 1; i += 0.05) {
      // Round to 2 decimal places to avoid floating point issues
      values.push(Math.round(i * 100) / 100);
    }
    return values;
  }, []);

  // Compute the accept rate for each threshold pair
  const matrixData = useMemo(() => {
    if (!loans.length) return [];

    const matrix: number[][] = [];

    // For each default threshold (rows)
    thresholds.forEach((defaultThreshold) => {
      const row: number[] = [];
      
      // For each refusal threshold (columns)
      thresholds.forEach((refusalThreshold) => {
        // Count accepted loans for this threshold pair
        const acceptedCount = loans.filter(
          (loan) => 
            loan.default_score <= defaultThreshold && 
            loan.refusal_score <= refusalThreshold
        ).length;
        
        // Calculate accept rate
        const acceptRate = loans.length > 0 ? acceptedCount / loans.length : 0;
        row.push(acceptRate);
      });
      
      matrix.push(row);
    });

    return matrix;
  }, [loans, thresholds]);

  // Function to get color based on accept rate
  const getColorForRate = (rate: number): string => {
    // Red (0%) to Green (100%)
    const hue = rate * 120; // 0 = red, 120 = green
    return `hsl(${hue}, 80%, 60%)`;
  };

  // Function to format percentage
  const formatPercent = (value: number): string => {
    return `${Math.round(value * 100)}%`;
  };

  if (!loans.length) {
    return <div className="text-gray-400 text-center p-8">No loan data available for analysis</div>;
  }

  return (
    <div className="overflow-auto">
      <div className="text-sm text-gray-400 mb-4">
        This grid shows the Accept Rate for different threshold combinations.
        <br />
        X-axis: Default Score Threshold, Y-axis: Refusal Score Threshold
        <br />
        <span className="text-cyan-400 font-medium">Click any cell to set thresholds and switch to Simulation Mode</span>
      </div>
      
      <div className="relative overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr>
              <th className="p-2 bg-gray-800 sticky left-0 top-0 z-10 text-cyan-300 font-medium">
                Default ↓ / Refusal →
              </th>
              {thresholds.map((threshold) => (
                <th key={`header-${threshold}`} className="p-2 bg-gray-800 sticky top-0 text-cyan-300/80 font-medium">
                  {threshold.toFixed(2)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrixData.map((row, rowIndex) => (
              <tr key={`row-${rowIndex}`}>
                <th className="p-2 bg-gray-800 sticky left-0 text-cyan-300/80 font-medium">
                  {thresholds[rowIndex].toFixed(2)}
                </th>
                {row.map((acceptRate, colIndex) => (
                  <td
                    key={`cell-${rowIndex}-${colIndex}`}
                    style={{ backgroundColor: getColorForRate(acceptRate) }}
                    className={`p-2 text-center font-medium border cursor-pointer transition-all duration-200
                      ${thresholds[rowIndex] === selectedDefaultThreshold && thresholds[colIndex] === selectedRefusalThreshold
                        ? 'border-white border-2 shadow-lg scale-105 z-10'
                        : 'border-gray-700/30 hover:border-gray-500'
                      }`}
                    title={`Default: ${thresholds[rowIndex].toFixed(2)}, Refusal: ${thresholds[colIndex].toFixed(2)}, Accept Rate: ${formatPercent(acceptRate)}`}
                    onClick={() => onSelectThresholds && onSelectThresholds(thresholds[rowIndex], thresholds[colIndex])}
                  >
                    {formatPercent(acceptRate)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mt-6 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="text-xs text-gray-400">Accept Rate:</div>
          <div className="flex items-center">
            <div className="w-4 h-4" style={{ backgroundColor: getColorForRate(0) }}></div>
            <div className="text-xs text-gray-400">0%</div>
          </div>
          <div className="w-32 h-4 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded"></div>
          <div className="flex items-center">
            <div className="w-4 h-4" style={{ backgroundColor: getColorForRate(1) }}></div>
            <div className="text-xs text-gray-400">100%</div>
          </div>
        </div>
      </div>
    </div>
  );
};