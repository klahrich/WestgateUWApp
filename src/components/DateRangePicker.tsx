import React from 'react';

interface DateRange {
  start: Date;
  end: Date;
}

interface DateRangePickerProps {
  dateRange: DateRange;
  onChange: (range: DateRange) => void;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  dateRange,
  onChange
}) => {
  const formatDateForInput = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStart = new Date(e.target.value);
    onChange({
      start: newStart,
      end: dateRange.end
    });
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEnd = new Date(e.target.value);
    onChange({
      start: dateRange.start,
      end: newEnd
    });
  };

  const setQuickRange = (months: number) => {
    const end = new Date();
    const start = new Date();
    start.setMonth(start.getMonth() - months);
    onChange({ start, end });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div>
          <label className="text-sm font-medium text-gray-200 block mb-2">
            Start Date
          </label>
          <input
            type="date"
            value={formatDateForInput(dateRange.start)}
            onChange={handleStartDateChange}
            className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm text-gray-200 backdrop-blur-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-200 block mb-2">
            End Date
          </label>
          <input
            type="date"
            value={formatDateForInput(dateRange.end)}
            onChange={handleEndDateChange}
            className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm text-gray-200 backdrop-blur-sm"
          />
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium text-gray-200">Quick Select</p>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setQuickRange(3)}
            className="px-3 py-2 text-xs bg-gray-700/50 hover:bg-gray-600/50 text-gray-200 rounded-lg transition-all duration-200 border border-gray-600/30 hover:border-gray-500/50 backdrop-blur-sm"
          >
            Last 3 Months
          </button>
          <button
            onClick={() => setQuickRange(6)}
            className="px-3 py-2 text-xs bg-gray-700/50 hover:bg-gray-600/50 text-gray-200 rounded-lg transition-all duration-200 border border-gray-600/30 hover:border-gray-500/50 backdrop-blur-sm"
          >
            Last 6 Months
          </button>
          <button
            onClick={() => setQuickRange(12)}
            className="px-3 py-2 text-xs bg-gray-700/50 hover:bg-gray-600/50 text-gray-200 rounded-lg transition-all duration-200 border border-gray-600/30 hover:border-gray-500/50 backdrop-blur-sm"
          >
            Last Year
          </button>
          <button
            onClick={() => onChange({ 
              start: new Date(new Date().getFullYear(), 0, 1), 
              end: new Date() 
            })}
            className="px-3 py-2 text-xs bg-gray-700/50 hover:bg-gray-600/50 text-gray-200 rounded-lg transition-all duration-200 border border-gray-600/30 hover:border-gray-500/50 backdrop-blur-sm"
          >
            This Year
          </button>
        </div>
      </div>
    </div>
  );
};