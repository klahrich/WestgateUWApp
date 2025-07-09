import React from 'react';

interface DateRange {
  start: Date;
  end: Date;
  // Add string representations to preserve exact input values
  startString?: string;
  endString?: string;
}

interface DateRangePickerProps {
  dateRange: DateRange;
  onChange: (range: DateRange) => void;
  loading?: boolean; // Optional loading prop
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  dateRange,
  onChange,
  loading = false
}) => {
  const formatDateForInput = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateString = e.target.value; // Preserve the exact string from input
    const newStart = new Date(dateString);
    onChange({
      start: newStart,
      end: dateRange.end,
      startString: dateString,
      endString: dateRange.endString
    });
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateString = e.target.value; // Preserve the exact string from input
    const newEnd = new Date(dateString);
    onChange({
      start: dateRange.start,
      end: newEnd,
      startString: dateRange.startString,
      endString: dateString
    });
  };

  const setQuickRange = (months: number) => {
    const end = new Date();
    const start = new Date();
    start.setMonth(start.getMonth() - months);
    
    // Format the date strings
    const endString = formatDateForInput(end);
    const startString = formatDateForInput(start);
    
    onChange({
      start,
      end,
      startString,
      endString
    });
  };

  return (
    <div className="space-y-4" style={{ cursor: loading ? 'wait' : 'default' }}>
      <div className="space-y-3" style={{ cursor: loading ? 'wait' : 'default' }}>
        <div>
          <label className="text-sm font-medium text-gray-200 block mb-2">
            Start Date
          </label>
          <input
            type="date"
            value={formatDateForInput(dateRange.start)}
            onChange={!loading ? handleStartDateChange : undefined}
            disabled={loading}
            className={`w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm text-gray-200 backdrop-blur-sm ${loading ? 'opacity-70 cursor-wait' : ''}`}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-200 block mb-2">
            End Date
          </label>
          <input
            type="date"
            value={formatDateForInput(dateRange.end)}
            onChange={!loading ? handleEndDateChange : undefined}
            disabled={loading}
            className={`w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm text-gray-200 backdrop-blur-sm ${loading ? 'opacity-70 cursor-wait' : ''}`}
          />
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium text-gray-200">Quick Select</p>
        <div className="grid grid-cols-2 gap-2" style={{ cursor: loading ? 'wait' : 'default' }}>
          <button
            onClick={() => !loading && setQuickRange(3)}
            disabled={loading}
            className={`px-3 py-2 text-xs bg-gray-700/50 hover:bg-gray-600/50 text-gray-200 rounded-lg transition-all duration-200 border border-gray-600/30 hover:border-gray-500/50 backdrop-blur-sm ${loading ? 'opacity-70 cursor-wait' : ''}`}
          >
            Last 3 Months
          </button>
          <button
            onClick={() => !loading && setQuickRange(6)}
            disabled={loading}
            className={`px-3 py-2 text-xs bg-gray-700/50 hover:bg-gray-600/50 text-gray-200 rounded-lg transition-all duration-200 border border-gray-600/30 hover:border-gray-500/50 backdrop-blur-sm ${loading ? 'opacity-70 cursor-wait' : ''}`}
          >
            Last 6 Months
          </button>
          <button
            onClick={() => !loading && setQuickRange(12)}
            disabled={loading}
            className={`px-3 py-2 text-xs bg-gray-700/50 hover:bg-gray-600/50 text-gray-200 rounded-lg transition-all duration-200 border border-gray-600/30 hover:border-gray-500/50 backdrop-blur-sm ${loading ? 'opacity-70 cursor-wait' : ''}`}
          >
            Last Year
          </button>
          <button
            onClick={() => {
              if (loading) return;
              const end = new Date();
              const start = new Date(new Date().getFullYear(), 0, 1);
              
              // Format the date strings
              const endString = formatDateForInput(end);
              const startString = formatDateForInput(start);
              
              onChange({
                start,
                end,
                startString,
                endString
              });
            }}
            disabled={loading}
            className={`px-3 py-2 text-xs bg-gray-700/50 hover:bg-gray-600/50 text-gray-200 rounded-lg transition-all duration-200 border border-gray-600/30 hover:border-gray-500/50 backdrop-blur-sm ${loading ? 'opacity-70 cursor-wait' : ''}`}
          >
            This Year
          </button>
        </div>
      </div>
    </div>
  );
};