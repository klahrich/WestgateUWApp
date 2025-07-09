import React, { useState, useMemo } from 'react';
import { AlertCircle } from 'lucide-react';

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
  // Internal state for draft dates - these are the dates shown in the UI
  // but not yet applied/committed to the parent component
  const [draftDates, setDraftDates] = useState<{
    start: Date;
    end: Date;
    startString?: string;
    endString?: string;
  }>({
    start: dateRange.start,
    end: dateRange.end,
    startString: dateRange.startString,
    endString: dateRange.endString
  });

  // Track if draft dates differ from applied dates
  const hasUnappliedChanges = useMemo(() => {
    return draftDates.startString !== dateRange.startString ||
           draftDates.endString !== dateRange.endString;
  }, [draftDates, dateRange]);

  const formatDateForInput = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  // Update handlers to modify draft state instead of calling onChange directly
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateString = e.target.value; // Preserve the exact string from input
    const newStart = new Date(dateString);
    setDraftDates({
      ...draftDates,
      start: newStart,
      startString: dateString
    });
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateString = e.target.value; // Preserve the exact string from input
    const newEnd = new Date(dateString);
    setDraftDates({
      ...draftDates,
      end: newEnd,
      endString: dateString
    });
  };

  // Apply button handler - commits the changes to the parent component
  const handleApply = () => {
    onChange(draftDates);
  };

  // Reset button handler - reverts draft changes to match the applied dates
  const handleReset = () => {
    setDraftDates({
      start: dateRange.start,
      end: dateRange.end,
      startString: dateRange.startString,
      endString: dateRange.endString
    });
  };

  const setQuickRange = (months: number) => {
    const end = new Date();
    const start = new Date();
    start.setMonth(start.getMonth() - months);
    
    // Format the date strings
    const endString = formatDateForInput(end);
    const startString = formatDateForInput(start);
    
    // Update draft dates instead of calling onChange directly
    setDraftDates({
      start,
      end,
      startString,
      endString
    });
  };

  return (
    <div className="space-y-4" style={{ cursor: loading ? 'wait' : 'default' }}>
      {/* Date inputs */}
      <div className="space-y-3" style={{ cursor: loading ? 'wait' : 'default' }}>
        <div>
          <label className="text-sm font-medium text-gray-200 block mb-2">
            Start Date
          </label>
          <input
            type="date"
            value={formatDateForInput(draftDates.start)}
            onChange={!loading ? handleStartDateChange : undefined}
            disabled={loading}
            className={`w-full px-3 py-2 ${hasUnappliedChanges ? 'bg-cyan-900/20 border-cyan-600/30' : 'bg-gray-700/50 border-gray-600/50'} border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm text-gray-200 backdrop-blur-sm ${loading ? 'opacity-70 cursor-wait' : ''}`}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-200 block mb-2">
            End Date (excluded)
          </label>
          <input
            type="date"
            value={formatDateForInput(draftDates.end)}
            onChange={!loading ? handleEndDateChange : undefined}
            disabled={loading}
            className={`w-full px-3 py-2 ${hasUnappliedChanges ? 'bg-cyan-900/20 border-cyan-600/30' : 'bg-gray-700/50 border-gray-600/50'} border rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm text-gray-200 backdrop-blur-sm ${loading ? 'opacity-70 cursor-wait' : ''}`}
          />
        </div>
      </div>

      {/* Quick Select buttons */}
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
              
              // Update draft dates instead of calling onChange directly
              setDraftDates({
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

      {/* Apply/Reset buttons */}
      <div className="flex items-center justify-between mt-4">
        {hasUnappliedChanges && (
          <div className="text-xs text-amber-300 flex items-center">
            <AlertCircle className="h-3 w-3 mr-1" />
            <span>Unapplied changes</span>
          </div>
        )}
        <div className="flex space-x-2 ml-auto">
          {hasUnappliedChanges && (
            <button
              onClick={handleReset}
              disabled={loading}
              className="px-3 py-2 text-xs bg-gray-700/50 hover:bg-gray-600/50 text-gray-200 rounded-lg transition-all duration-200 border border-gray-600/30"
            >
              Reset
            </button>
          )}
          <button
            onClick={handleApply}
            disabled={loading || !hasUnappliedChanges}
            className={`px-4 py-2 text-xs rounded-lg transition-colors duration-200 ${
              hasUnappliedChanges && !loading
                ? 'bg-cyan-500 hover:bg-cyan-600 text-white'
                : 'bg-gray-700/50 text-gray-400 cursor-not-allowed'
            }`}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};