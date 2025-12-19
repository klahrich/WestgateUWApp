import React, { useState, useEffect } from 'react';
import { ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Line } from 'recharts';

interface PerformanceData {
  LoanReleasedYearMonth: string;
  MugaDecision: 'accept' | 'refuse';
  NbLoans: number;
  LoanPrincipalAmount: number;
  LoanTotalAmountDue: number;
  RepaymentAmount3M: number;
  RepaymentAmount6M: number;
  RepaymentAmount12M: number;
}

export const PerformanceDashboard: React.FC = () => {
  const [data, setData] = useState<PerformanceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const code = import.meta.env.VITE_AZURE_FUNCTION_CODE;
        if (!code) {
          throw new Error('Azure Function code is not defined in environment variables.');
        }

        const baseUrl = import.meta.env.PROD
          ? 'https://webhookazurefunctionwestgate.azurewebsites.net'
          : '';
        const response = await fetch(`${baseUrl}/api/MugaPerformanceFundedRequests?code=${code}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.statusText}`);
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const processedData = data.reduce((acc, item) => {
    const month = item.LoanReleasedYearMonth;
    if (!acc[month]) {
      acc[month] = {
        month,
        acceptedPrincipal: 0,
        refusedPrincipal: 0,
        repayment3M: 0,
        repayment6M: 0,
        repayment12M: 0,
        totalPrincipal: 0,
      };
    }

    if (item.MugaDecision === 'accept') {
      acc[month].acceptedPrincipal += item.LoanPrincipalAmount;
    } else {
      acc[month].refusedPrincipal += item.LoanPrincipalAmount;
    }

    acc[month].repayment3M += item.RepaymentAmount3M;
    acc[month].repayment6M += item.RepaymentAmount6M;
    acc[month].repayment12M += item.RepaymentAmount12M;
    acc[month].totalPrincipal += item.LoanPrincipalAmount;

    return acc;
  }, {} as Record<string, any>);

  const chartData = Object.values(processedData).map(item => {
    const today = new Date();
    const itemDate = new Date(item.month);

    const addMonths = (date: Date, months: number) => {
      const d = new Date(date);
      d.setMonth(d.getMonth() + months);
      return d;
    };

    const repaymentRate3M = addMonths(itemDate, 3) > today ? null : item.totalPrincipal > 0 ? (item.repayment3M / item.totalPrincipal) * 100 : 0;
    const repaymentRate6M = addMonths(itemDate, 6) > today ? null : item.totalPrincipal > 0 ? (item.repayment6M / item.totalPrincipal) * 100 : 0;
    const repaymentRate12M = addMonths(itemDate, 12) > today ? null : item.totalPrincipal > 0 ? (item.repayment12M / item.totalPrincipal) * 100 : 0;

    return {
      ...item,
      repaymentRate3M,
      repaymentRate6M,
      repaymentRate12M,
    };
  });

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="p-4 bg-gray-800 text-white rounded-md border border-gray-700">
          <p className="label font-bold">{`${label}`}</p>
          <p style={{ color: '#8884d8' }}>{`3M Repayment % : ${data.repaymentRate3M !== null ? `${data.repaymentRate3M.toFixed(2)}%` : 'N/A'}`}</p>
          <p style={{ color: '#82ca9d' }}>{`6M Repayment % : ${data.repaymentRate6M !== null ? `${data.repaymentRate6M.toFixed(2)}%` : 'N/A'}`}</p>
          <p style={{ color: '#ffc658' }}>{`12M Repayment % : ${data.repaymentRate12M !== null ? `${data.repaymentRate12M.toFixed(2)}%` : 'N/A'}`}</p>
          <p style={{ color: 'rgba(136, 132, 216, 0.6)' }}>{`Accepted Principal : ${data.acceptedPrincipal.toLocaleString()}`}</p>
          <p style={{ color: 'rgba(130, 202, 157, 0.6)' }}>{`Refused Principal : ${data.refusedPrincipal.toLocaleString()}`}</p>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="p-4 text-white">
      <h1 className="text-2xl font-bold mb-4 text-white">Performance Dashboard</h1>
      <ResponsiveContainer width="100%" height={600}>
        <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 30, bottom: 30 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
          <XAxis dataKey="month" tick={{ fill: '#A0AEC0' }} label={{ value: 'Loan Release Month', position: 'insideBottom', offset: -15, fill: '#A0AEC0' }} />
          <YAxis yAxisId="left" tickFormatter={(tick) => `${tick}%`} tick={{ fill: '#A0AEC0' }} label={{ value: 'Repayment %', angle: -90, position: 'insideLeft', offset: -10, fill: '#A0AEC0' }} />
          <YAxis yAxisId="right" orientation="right" tickFormatter={(tick) => `${(tick / 1000)}k`} tick={{ fill: '#A0AEC0' }} label={{ value: 'Loan Principal Amount', angle: 90, position: 'insideRight', offset: -10, fill: '#A0AEC0' }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend verticalAlign="top" wrapperStyle={{ color: '#A0AEC0', paddingBottom: '10px' }} />
          <Bar yAxisId="right" dataKey="acceptedPrincipal" stackId="a" fill="rgba(136, 132, 216, 0.6)" name="Accepted Principal" />
          <Bar yAxisId="right" dataKey="refusedPrincipal" stackId="a" fill="rgba(130, 202, 157, 0.6)" name="Refused Principal" />
          <Line yAxisId="left" type="monotone" dataKey="repaymentRate3M" stroke="#8884d8" strokeWidth={2} name="3M Repayment %" />
          <Line yAxisId="left" type="monotone" dataKey="repaymentRate6M" stroke="#82ca9d" strokeWidth={2} name="6M Repayment %" />
          <Line yAxisId="left" type="monotone" dataKey="repaymentRate12M" stroke="#ffc658" strokeWidth={2} name="12M Repayment %" />
        </ComposedChart>
      </ResponsiveContainer>

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4 text-white">Raw Data</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-gray-800 text-white">
            <thead>
              <tr className="bg-gray-700">
                <th className="py-2 px-4 border-b border-gray-600">Month</th>
                <th className="py-2 px-4 border-b border-gray-600">Accepted Principal</th>
                <th className="py-2 px-4 border-b border-gray-600">Refused Principal</th>
                <th className="py-2 px-4 border-b border-gray-600">Total Principal</th>
                <th className="py-2 px-4 border-b border-gray-600">3M Repayment %</th>
                <th className="py-2 px-4 border-b border-gray-600">6M Repayment %</th>
                <th className="py-2 px-4 border-b border-gray-600">12M Repayment %</th>
              </tr>
            </thead>
            <tbody>
              {chartData.map((item, index) => (
                <tr key={item.month} className={index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-700'}>
                  <td className="py-2 px-4 border-b border-gray-600">{item.month}</td>
                  <td className="py-2 px-4 border-b border-gray-600">{item.acceptedPrincipal.toLocaleString()}</td>
                  <td className="py-2 px-4 border-b border-gray-600">{item.refusedPrincipal.toLocaleString()}</td>
                  <td className="py-2 px-4 border-b border-gray-600">{item.totalPrincipal.toLocaleString()}</td>
                  <td className="py-2 px-4 border-b border-gray-600">{item.repaymentRate3M !== null ? `${item.repaymentRate3M.toFixed(1)}%` : 'N/A'}</td>
                  <td className="py-2 px-4 border-b border-gray-600">{item.repaymentRate6M !== null ? `${item.repaymentRate6M.toFixed(1)}%` : 'N/A'}</td>
                  <td className="py-2 px-4 border-b border-gray-600">{item.repaymentRate12M !== null ? `${item.repaymentRate12M.toFixed(1)}%` : 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};