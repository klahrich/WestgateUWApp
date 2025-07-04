import React, { useState, useEffect, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Settings, 
  BarChart3,
  PieChart,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  History,
  Zap,
  Database,
  Sliders,
  TestTube
} from 'lucide-react';
import { ThresholdControls } from './ThresholdControls';
import { MetricsCard } from './MetricsCard';
import { MonthlyChart } from './MonthlyChart';
import { DateRangePicker } from './DateRangePicker';
import { StatsTable } from './StatsTable';
import { supabase, LoanRecord } from '../lib/supabase';
import { USE_MOCK_DATA, generateMockData } from '../config/dataSource';

interface LoanData {
  id: string;
  created_at: string;
  default_score: number;
  refusal_score: number;
  historical_decision?: string; // For actual historical decisions
}

interface MonthlyStats {
  month: string;
  total: number;
  accepted: number;
  refused: number;
  acceptanceRate: number;
}

type ViewMode = 'historical' | 'simulation';

export const Dashboard: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('historical');
  const [defaultThreshold, setDefaultThreshold] = useState(0.7);
  const [refusalThreshold, setRefusalThreshold] = useState(0.6);
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), 0, 1),
    end: new Date()
  });
  const [loans, setLoans] = useState<LoanData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingMockData, setUsingMockData] = useState(USE_MOCK_DATA);

  // Fetch data (either real or mock)
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (USE_MOCK_DATA) {
          // Use mock data
          console.log('Using mock data for development');
          const mockLoans = generateMockData();
          setLoans(mockLoans);
          setUsingMockData(true);
        } else {
          // Fetch real data from Supabase using pagination to get ALL records
          console.log('Fetching real data from Supabase with pagination');
          
          let allData: any[] = [];
          let page = 0;
          const pageSize = 1000;
          let hasMore = true;
          
          while (hasMore) {
            const from = page * pageSize;
            const to = from + pageSize - 1;
            
            console.log(`Fetching page ${page + 1} (records ${from}-${to})...`);
            
            const { data, error } = await supabase
              .from('logs')
              .select('id, created_at, default_score, refusal_score, decision')
              .not('default_score', 'is', null)
              .not('refusal_score', 'is', null)
              .order('created_at', { ascending: true })
              .range(from, to);
              
            if (error) {
              console.error('Supabase query error:', error);
              throw error;
            }
            
            if (data && data.length > 0) {
              allData = [...allData, ...data];
              page++;
              
              // If we got fewer records than the page size, we've reached the end
              if (data.length < pageSize) {
                hasMore = false;
              }
            } else {
              hasMore = false;
            }
          }
          
          console.log('Total records fetched with pagination:', allData.length);

          // Transform the data to match our interface
          const transformedLoans: LoanData[] = allData.map(record => ({
            id: record.id.toString(),
            created_at: record.created_at,
            default_score: record.default_score || 0,
            refusal_score: record.refusal_score || 0,
            historical_decision: record.decision || undefined
          }));

          console.log('Transformed loans:', transformedLoans.length);
          setLoans(transformedLoans);
          setUsingMockData(false);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch loan data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredLoans = useMemo(() => {
    // Helper function to parse Supabase timestamptz correctly
    const parseSupabaseDate = (timestamptz: string): Date => {
      // Ensure the timestamp has a timezone component
      // If it doesn't have a 'Z' or '+'/'-', assume UTC
      let timestamp = timestamptz;
      if (!timestamp.endsWith('Z') && !timestamp.includes('+') && !timestamp.includes('-', 10)) {
        timestamp += 'Z';
      }
      return new Date(timestamp);
    };
    
    // Set the start date to the beginning of the day (00:00:00.000)
    const startDateWithTime = new Date(dateRange.start);
    startDateWithTime.setHours(0, 0, 0, 0);
    
    // Set the end date to the end of the day (23:59:59.999)
    const endDateWithTime = new Date(dateRange.end);
    endDateWithTime.setHours(23, 59, 59, 999);
    
    console.log('Adjusted date range for filtering:', {
      start: startDateWithTime.toISOString(),
      end: endDateWithTime.toISOString(),
      startLocal: startDateWithTime.toLocaleString(),
      endLocal: endDateWithTime.toLocaleString()
    });
    
    // Log a sample of loan dates before filtering
    console.log('Sample of loan dates before filtering:');
    loans.slice(0, 5).forEach((loan, index) => {
      const parsedDate = parseSupabaseDate(loan.created_at);
      console.log(`Loan ${index}:`, {
        created_at: loan.created_at,
        parsed: parsedDate.toISOString(),
        parsedLocal: parsedDate.toLocaleString(),
        year: parsedDate.getFullYear(),
        month: parsedDate.getMonth() + 1,
        day: parsedDate.getDate()
      });
    });
    
    // Count loans that pass each condition separately
    let afterStartCount = 0;
    let beforeEndCount = 0;
    
    const filtered = loans.filter(loan => {
      // Parse the Supabase timestamp using our helper function
      const loanDate = parseSupabaseDate(loan.created_at);
      
      // Compare dates by year, month, and day to avoid timezone issues
      const loanYear = loanDate.getFullYear();
      const loanMonth = loanDate.getMonth();
      const loanDay = loanDate.getDate();
      
      const startYear = startDateWithTime.getFullYear();
      const startMonth = startDateWithTime.getMonth();
      const startDay = startDateWithTime.getDate();
      
      const endYear = endDateWithTime.getFullYear();
      const endMonth = endDateWithTime.getMonth();
      const endDay = endDateWithTime.getDate();
      
      // Check if loan date is on or after start date
      const isAfterStart = (
        loanYear > startYear ||
        (loanYear === startYear && loanMonth > startMonth) ||
        (loanYear === startYear && loanMonth === startMonth && loanDay >= startDay)
      );
      
      // Check if loan date is on or before end date
      const isBeforeEnd = (
        loanYear < endYear ||
        (loanYear === endYear && loanMonth < endMonth) ||
        (loanYear === endYear && loanMonth === endMonth && loanDay <= endDay)
      );
      
      // Update counters
      if (isAfterStart) afterStartCount++;
      if (isBeforeEnd) beforeEndCount++;
      
      // Debug logging for the first few loans to understand the issue
      // Only log the first 5 loans to avoid excessive logging
      const loanIndex = loans.indexOf(loan);
      if (loanIndex < 5) {
        console.log('Loan date comparison:', {
          index: loanIndex,
          loanCreatedAt: loan.created_at,
          loanDateObj: loanDate.toISOString(),
          loanDateLocal: loanDate.toLocaleString(),
          loanYear, loanMonth, loanDay,
          startDate: startDateWithTime.toISOString(),
          startDateLocal: startDateWithTime.toLocaleString(),
          startYear, startMonth, startDay,
          endDate: endDateWithTime.toISOString(),
          endDateLocal: endDateWithTime.toLocaleString(),
          endYear, endMonth, endDay,
          isAfterStart: isAfterStart,
          isBeforeEnd: isBeforeEnd,
          passes: isAfterStart && isBeforeEnd
        });
      }
      
      // Compare with the adjusted date range
      return isAfterStart && isBeforeEnd;
    });
    
    // Log summary of filtering results
    console.log('Date filtering summary:', {
      totalLoans: loans.length,
      passedStartCondition: afterStartCount,
      passedEndCondition: beforeEndCount,
      passedBothConditions: filtered.length
    });
    
    console.log('Filtered loans for date range:', filtered.length);
    console.log('Date range:', {
      start: dateRange.start.toLocaleDateString(),
      end: dateRange.end.toLocaleDateString()
    });
    
    return filtered;
  }, [loans, dateRange]);

  // Historical decisions (actual decisions from database)
  const historicalDecisions = useMemo(() => {
    const decisions = filteredLoans.map(loan => ({
      ...loan,
      decision: loan.historical_decision || 'unknown'
    }));
    console.log('Historical decisions:', decisions);
    console.log('Historical decisions with known status:', decisions.filter(d => d.decision !== 'unknown').length);
    return decisions;
  }, [filteredLoans]);

  // Simulated decisions (based on current thresholds)
  const simulatedDecisions = useMemo(() => {
    return filteredLoans.map(loan => ({
      ...loan,
      decision: (loan.default_score > defaultThreshold || loan.refusal_score > refusalThreshold) ? 'refuse' : 'accept'
    }));
  }, [filteredLoans, defaultThreshold, refusalThreshold]);

  const currentDecisions = viewMode === 'historical' ? historicalDecisions : simulatedDecisions;

  const aggregateStats = useMemo(() => {
    const total = currentDecisions.length;
    const accepted = currentDecisions.filter(loan => loan.decision === 'accept').length;
    const refused = currentDecisions.filter(loan => loan.decision === 'refuse').length;
    const unknown = currentDecisions.filter(loan => loan.decision === 'unknown').length;
    const acceptanceRate = (total - unknown) > 0 ? (accepted / (total - unknown)) * 100 : 0;
    
    console.log('Aggregate stats:', { total, accepted, refused, unknown, acceptanceRate });
    return { total, accepted, refused, unknown, acceptanceRate };
  }, [currentDecisions]);

  const monthlyStats = useMemo(() => {
    const monthlyData: { [key: string]: MonthlyStats } = {};
    
    currentDecisions.forEach(loan => {
      if (loan.decision === 'unknown') return; // Skip unknown decisions for monthly stats
      
      const date = new Date(loan.created_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthKey,
          total: 0,
          accepted: 0,
          refused: 0,
          acceptanceRate: 0
        };
      }
      
      monthlyData[monthKey].total += 1;
      if (loan.decision === 'accept') {
        monthlyData[monthKey].accepted += 1;
      } else {
        monthlyData[monthKey].refused += 1;
      }
    });
    
    Object.values(monthlyData).forEach(month => {
      month.acceptanceRate = month.total > 0 ? (month.accepted / month.total) * 100 : 0;
    });
    
    const monthlyStatsArray = Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));
    console.log('Monthly stats:', monthlyStatsArray);
    return monthlyStatsArray;
  }, [currentDecisions]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-gray-300">
            {USE_MOCK_DATA ? 'Generating mock data...' : 'Loading loan data from Supabase...'}
          </p>
        </div>
      </div>
    );
  }

  if (error && !USE_MOCK_DATA) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 mb-4">
            <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-400 mb-2">Connection Error</h2>
            <p className="text-gray-300 text-sm mb-4">{error}</p>
            <p className="text-gray-400 text-xs">
              Make sure you've connected to Supabase using the "Connect to Supabase" button in the top right.
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors duration-200"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800/50 backdrop-blur-xl border-b border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-cyan-500 to-purple-600 p-2 rounded-xl shadow-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  Westgate
                </h1>
                <p className="text-sm text-gray-400">Lending Analytics Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-right">
                <p className="text-sm text-gray-400">Analysis Period</p>
                <p className="text-sm font-medium text-gray-200">
                  {dateRange.start.toLocaleDateString()} - {dateRange.end.toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-400">Total Records</p>
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-medium text-cyan-400">
                    {loans.length.toLocaleString()} loans
                  </p>
                  {usingMockData && (
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-md px-2 py-1">
                      <div className="flex items-center space-x-1">
                        <TestTube className="h-3 w-3 text-amber-400" />
                        <span className="text-xs text-amber-400 font-medium">Mock</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <Calendar className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Debug Information - Only show in development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-4 p-4 bg-gray-800/30 rounded-xl border border-gray-700/30 text-xs text-gray-400">
            <p><strong>Debug Info:</strong></p>
            <p>Total loans loaded: {loans.length}</p>
            <p>Filtered loans (date range): {filteredLoans.length}</p>
            <p>Current view mode: {viewMode}</p>
            <p>Using mock data: {usingMockData ? 'Yes' : 'No'}</p>
            {viewMode === 'historical' && (
              <p>Historical decisions with data: {historicalDecisions.filter(d => d.decision !== 'unknown').length}</p>
            )}
          </div>
        )}

        {/* Mode Toggle */}
        <div className="mb-8">
          <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl shadow-xl p-2 border border-gray-700/50 inline-flex">
            <button
              onClick={() => setViewMode('historical')}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all duration-300 ${
                viewMode === 'historical'
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/50'
              }`}
            >
              <History className="h-4 w-4" />
              <span className="font-medium">Historical Analysis</span>
              <Database className="h-3 w-3 opacity-70" />
            </button>
            <button
              onClick={() => setViewMode('simulation')}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all duration-300 ${
                viewMode === 'simulation'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/50'
              }`}
            >
              <Zap className="h-4 w-4" />
              <span className="font-medium">Simulation Mode</span>
              <Sliders className="h-3 w-3 opacity-70" />
            </button>
          </div>
          
          {/* Mode Description */}
          <div className="mt-4 p-4 bg-gray-800/30 rounded-xl border border-gray-700/30">
            {viewMode === 'historical' ? (
              <div className="flex items-start space-x-3">
                <div className="bg-blue-500/10 p-2 rounded-lg border border-blue-500/20">
                  <History className="h-4 w-4 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-blue-400 mb-1">Historical Analysis</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Viewing actual historical loan decisions {usingMockData ? 'from mock data' : 'from your database'}. This shows real outcomes and cannot be modified.
                  </p>
                  {!usingMockData && aggregateStats.unknown > 0 && (
                    <p className="text-xs text-amber-400 mt-2">
                      Note: {aggregateStats.unknown} records have no decision data and are excluded from analysis.
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-start space-x-3">
                <div className="bg-purple-500/10 p-2 rounded-lg border border-purple-500/20">
                  <Zap className="h-4 w-4 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-purple-400 mb-1">Simulation Mode</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Simulating loan decisions using adjustable risk thresholds. Change the thresholds to see how different criteria would affect outcomes.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Column - Controls */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-gray-700/50">
              <div className="flex items-center space-x-2 mb-4">
                <Calendar className="h-5 w-5 text-cyan-400" />
                <h2 className="text-lg font-semibold text-gray-100">Date Range</h2>
              </div>
              <DateRangePicker
                dateRange={dateRange}
                onChange={setDateRange}
              />
            </div>

            {/* Threshold Controls - Only show in simulation mode */}
            {viewMode === 'simulation' && (
              <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-gray-700/50">
                <div className="flex items-center space-x-2 mb-4">
                  <Settings className="h-5 w-5 text-purple-400" />
                  <h2 className="text-lg font-semibold text-gray-100">Risk Thresholds</h2>
                </div>
                <ThresholdControls
                  defaultThreshold={defaultThreshold}
                  refusalThreshold={refusalThreshold}
                  onDefaultChange={setDefaultThreshold}
                  onRefusalChange={setRefusalThreshold}
                />
              </div>
            )}

            {/* Historical Info - Only show in historical mode */}
            {viewMode === 'historical' && (
              <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-gray-700/50">
                <div className="flex items-center space-x-2 mb-4">
                  {usingMockData ? (
                    <TestTube className="h-5 w-5 text-amber-400" />
                  ) : (
                    <Database className="h-5 w-5 text-blue-400" />
                  )}
                  <h2 className="text-lg font-semibold text-gray-100">Data Source</h2>
                </div>
                <div className="space-y-3">
                  {usingMockData ? (
                    <div className="bg-amber-500/10 p-3 rounded-lg border border-amber-500/20">
                      <p className="text-xs text-amber-300 font-medium mb-1">Mock Data</p>
                      <p className="text-xs text-gray-400">
                        Using generated mock data for development and testing purposes.
                      </p>
                    </div>
                  ) : (
                    <div className="bg-blue-500/10 p-3 rounded-lg border border-blue-500/20">
                      <p className="text-xs text-blue-300 font-medium mb-1">Historical Decisions</p>
                      <p className="text-xs text-gray-400">
                        Showing actual loan decisions from your database records.
                      </p>
                    </div>
                  )}
                  {aggregateStats.unknown > 0 && (
                    <div className="bg-amber-500/10 p-3 rounded-lg border border-amber-500/20">
                      <p className="text-xs text-amber-300 font-medium mb-1">Missing Data</p>
                      <p className="text-xs text-gray-400">
                        {aggregateStats.unknown} records have no decision data and are excluded from analysis.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <MetricsCard
                title="Total Loans"
                value={(aggregateStats.total - (viewMode === 'historical' ? aggregateStats.unknown : 0)).toLocaleString()}
                subtitle={viewMode === 'historical' && aggregateStats.unknown > 0 ? `${aggregateStats.unknown} excluded` : undefined}
                icon={<BarChart3 className="h-5 w-5" />}
                color="blue"
              />
              <MetricsCard
                title="Accepted"
                value={aggregateStats.accepted.toLocaleString()}
                subtitle={`${aggregateStats.acceptanceRate.toFixed(1)}%`}
                icon={<CheckCircle className="h-5 w-5" />}
                color="green"
              />
              <MetricsCard
                title="Refused"
                value={aggregateStats.refused.toLocaleString()}
                subtitle={`${(100 - aggregateStats.acceptanceRate).toFixed(1)}%`}
                icon={<XCircle className="h-5 w-5" />}
                color="red"
              />
              <MetricsCard
                title="Accept Rate"
                value={`${aggregateStats.acceptanceRate.toFixed(1)}%`}
                icon={<TrendingUp className="h-5 w-5" />}
                color="purple"
              />
            </div>

            {/* Charts */}
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-gray-700/50">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  <PieChart className={`h-5 w-5 ${viewMode === 'historical' ? 'text-blue-400' : 'text-purple-400'}`} />
                  <h2 className="text-lg font-semibold text-gray-100">
                    Monthly Trends {viewMode === 'historical' ? '(Historical)' : '(Simulated)'}
                  </h2>
                </div>
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-gradient-to-r from-emerald-400 to-green-500 rounded-full shadow-lg"></div>
                    <span className="text-gray-300">Accepted</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-gradient-to-r from-red-400 to-pink-500 rounded-full shadow-lg"></div>
                    <span className="text-gray-300">Refused</span>
                  </div>
                </div>
              </div>
              <MonthlyChart data={monthlyStats} />
            </div>

            {/* Detailed Statistics Table */}
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-700/50 overflow-hidden">
              <div className="p-6 border-b border-gray-700/50">
                <div className="flex items-center space-x-2">
                  <BarChart3 className={`h-5 w-5 ${viewMode === 'historical' ? 'text-blue-400' : 'text-purple-400'}`} />
                  <h2 className="text-lg font-semibold text-gray-100">
                    Monthly Breakdown {viewMode === 'historical' ? '(Historical)' : '(Simulated)'}
                  </h2>
                </div>
              </div>
              <StatsTable data={monthlyStats} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};