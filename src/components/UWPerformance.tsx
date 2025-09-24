import React, { useState, useEffect } from 'react';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { supabase } from '../lib/supabase';

interface UWPerformanceData {
  LoanReleasedYear: number;
  LoanReleasedMonth: number;
  MugaDecision: 'accept' | 'refuse';
  NbLoans: number;
  AvgLoanPrincipalAmount: number;
  AvgLoanTotalAmountDue: number;
  AvgRepayment3M: number;
  AvgLoanPendingDue3M: number;
  AvgRepaymentAmount6M: number;
  AvgLoanPending6M: number;
  AvgRepaymentAmount12M: number;
  AvgLoanPendingDue12M: number;
}

const yAxisOptions = [
  { value: 'AvgLoanPrincipalAmount', label: 'Avg Loan Principal Amount' },
  { value: 'AvgLoanTotalAmountDue', label: 'Avg Loan Total Amount Due' },
  { value: 'AvgRepayment3M', label: 'Avg Repayment 3M' },
  { value: 'AvgLoanPendingDue3M', label: 'Avg Loan Pending Due 3M' },
  { value: 'AvgRepaymentAmount6M', label: 'Avg Repayment 6M' },
  { value: 'AvgLoanPending6M', label: 'Avg Loan Pending 6M' },
  { value: 'AvgRepaymentAmount12M', label: 'Avg Repayment 12M' },
  { value: 'AvgLoanPendingDue12M', label: 'Avg Loan Pending Due 12M' },
];

export const UWPerformance: React.FC = () => {
  const [data, setData] = useState<UWPerformanceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [yAxis, setYAxis] = useState<keyof UWPerformanceData>('AvgLoanPrincipalAmount');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('sql-server-query');
        if (error) {
          throw error;
        }
        setData(data);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const chartData = data.reduce((acc, row) => {
    const month = row.LoanReleasedMonth;
    const year = row.LoanReleasedYear;
    const decision = row.MugaDecision;

    let monthData = acc.find((d) => d.month === month);
    if (!monthData) {
      monthData = { month, NbLoans: 0 };
      acc.push(monthData);
    }

    monthData.NbLoans += row.NbLoans;
    monthData[`${year}_${decision}`] = row[yAxis];

    return acc;
  }, [] as any[]);

  const years = [...new Set(data.map((d) => d.LoanReleasedYear))].sort();
  const decisions = ['accept', 'refuse'];
  const colors = {
    accept: ['#8884d8', '#6b66b2', '#4e4a8c'],
    refuse: ['#82ca9d', '#68a17e', '#4e785f'],
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-gray-700/50">
      <h2 className="text-lg font-semibold text-gray-100">UW Performance Analysis</h2>
      <div className="my-4">
        <label htmlFor="y-axis-select" className="text-white mr-2">Y-Axis:</label>
        <select
          id="y-axis-select"
          value={yAxis}
          onChange={(e) => setYAxis(e.target.value as keyof UWPerformanceData)}
          className="bg-gray-700 text-white rounded p-1"
        >
          {yAxisOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="NbLoans" fill="#8884d8" fillOpacity={0.6} />
          {years.map((year, yearIndex) =>
            decisions.map((decision) => (
              <Line
                key={`${year}_${decision}`}
                type="monotone"
                dataKey={`${year}_${decision}`}
                stroke={colors[decision as 'accept' | 'refuse'][yearIndex % colors[decision as 'accept' | 'refuse'].length]}
                strokeWidth={2}
              />
            ))
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};