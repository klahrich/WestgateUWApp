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
  XCircle
} from 'lucide-react';
import { ThresholdControls } from './ThresholdControls';
import { MetricsCard } from './MetricsCard';
import { MonthlyChart } from './MonthlyChart';
import { DateRangePicker } from './DateRangePicker';
import { StatsTable } from './StatsTable';

interface LoanData {
  id: string;
  created_at: string;
  default_score: number;
  refusal_score: number;
}

interface MonthlyStats {
  month: string;
  total: number;
  accepted: number;
  refused: number;
  acceptanceRate: number;
}

export const Dashboard: React.FC = () => {
  const [defaultThreshold, setDefaultThreshold] = useState(0.7);
  const [refusalThreshold, setRefusalThreshold] = useState(0.6);
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), 0, 1),
    end: new Date()
  });
  const [loans, setLoans] = useState<LoanData[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock data for demonstration - replace with actual Supabase data
  useEffect(() => {
    const generateMockData = () => {
      const mockLoans: LoanData[] = [];
      const startDate = new Date(2023, 0, 1);
      const endDate = new Date();
      
      for (let i = 0; i < 500; i++) {
        const randomDate = new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()));
        mockLoans.push({
          id: `loan-${i}`,
          created_at: randomDate.toISOString(),
          default_score: Math.random(),
          refusal_score: Math.random()
        });
      }
      
      setLoans(mockLoans);
      setLoading(false);
    };

    generateMockData();
  }, []);

  const filteredLoans = useMemo(() => {
    return loans.filter(loan => {
      const loanDate = new Date(loan.created_at);
      return loanDate >= dateRange.start && loanDate <= dateRange.end;
    });
  }, [loans, dateRange]);

  const loanDecisions = useMemo(() => {
    return filteredLoans.map(loan => ({
      ...loan,
      decision: (loan.default_score > defaultThreshold || loan.refusal_score > refusalThreshold) ? 'refuse' : 'accept'
    }));
  }, [filteredLoans, defaultThreshold, refusalThreshold]);

  const aggregateStats = useMemo(() => {
    const total = loanDecisions.length;
    const accepted = loanDecisions.filter(loan => loan.decision === 'accept').length;
    const refused = total - accepted;
    const acceptanceRate = total > 0 ? (accepted / total) * 100 : 0;
    
    return { total, accepted, refused, acceptanceRate };
  }, [loanDecisions]);

  const monthlyStats = useMemo(() => {
    const monthlyData: { [key: string]: MonthlyStats } = {};
    
    loanDecisions.forEach(loan => {
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
    
    return Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));
  }, [loanDecisions]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading dashboard...</p>
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
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-400">Analysis Period</p>
                <p className="text-sm font-medium text-gray-200">
                  {dateRange.start.toLocaleDateString()} - {dateRange.end.toLocaleDateString()}
                </p>
              </div>
              <Calendar className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Column - Controls */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-gray-700/50">
              <div className="flex items-center space-x-2 mb-4">
                <Settings className="h-5 w-5 text-cyan-400" />
                <h2 className="text-lg font-semibold text-gray-100">Risk Thresholds</h2>
              </div>
              <ThresholdControls
                defaultThreshold={defaultThreshold}
                refusalThreshold={refusalThreshold}
                onDefaultChange={setDefaultThreshold}
                onRefusalChange={setRefusalThreshold}
              />
            </div>

            <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-gray-700/50">
              <div className="flex items-center space-x-2 mb-4">
                <Calendar className="h-5 w-5 text-purple-400" />
                <h2 className="text-lg font-semibold text-gray-100">Date Range</h2>
              </div>
              <DateRangePicker
                dateRange={dateRange}
                onChange={setDateRange}
              />
            </div>
          </div>

          {/* Right Column - Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <MetricsCard
                title="Total Loans"
                value={aggregateStats.total.toLocaleString()}
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
                  <PieChart className="h-5 w-5 text-cyan-400" />
                  <h2 className="text-lg font-semibold text-gray-100">Monthly Trends</h2>
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
                  <BarChart3 className="h-5 w-5 text-purple-400" />
                  <h2 className="text-lg font-semibold text-gray-100">Monthly Breakdown</h2>
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