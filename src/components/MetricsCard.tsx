import React from 'react';

interface MetricsCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'red' | 'purple';
}

export const MetricsCard: React.FC<MetricsCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  color
}) => {
  const colorClasses = {
    blue: 'from-blue-500 to-cyan-500 text-blue-400',
    green: 'from-emerald-500 to-green-500 text-emerald-400',
    red: 'from-red-500 to-pink-500 text-red-400',
    purple: 'from-purple-500 to-violet-500 text-purple-400'
  };

  const bgClasses = {
    blue: 'bg-blue-500/10 border-blue-500/20',
    green: 'bg-emerald-500/10 border-emerald-500/20',
    red: 'bg-red-500/10 border-red-500/20',
    purple: 'bg-purple-500/10 border-purple-500/20'
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-gray-700/50 hover:shadow-2xl hover:border-gray-600/50 transition-all duration-300 group">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl border ${bgClasses[color]} group-hover:scale-110 transition-transform duration-300`}>
          <div className={colorClasses[color]}>
            {icon}
          </div>
        </div>
      </div>
      <div>
        <p className="text-sm font-medium text-gray-400 mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-100 mb-1">{value}</p>
        {subtitle && (
          <p className={`text-sm font-medium ${colorClasses[color]}`}>{subtitle}</p>
        )}
      </div>
    </div>
  );
};