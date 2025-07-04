import React from 'react';
import { AlertTriangle, Shield } from 'lucide-react';

interface ThresholdControlsProps {
  defaultThreshold: number;
  refusalThreshold: number;
  onDefaultChange: (value: number) => void;
  onRefusalChange: (value: number) => void;
}

export const ThresholdControls: React.FC<ThresholdControlsProps> = ({
  defaultThreshold,
  refusalThreshold,
  onDefaultChange,
  onRefusalChange
}) => {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="h-4 w-4 text-amber-400" />
          <label className="text-sm font-medium text-gray-200">Default Score Threshold</label>
        </div>
        <div className="space-y-2">
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={defaultThreshold}
            onChange={(e) => onDefaultChange(Number(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-amber"
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>0.00</span>
            <span className="font-medium text-amber-400 bg-gray-700/50 px-2 py-1 rounded-md">
              {defaultThreshold.toFixed(2)}
            </span>
            <span>1.00</span>
          </div>
        </div>
        <p className="text-xs text-gray-400 bg-gray-700/30 p-3 rounded-lg border border-gray-600/30">
          Loans with default score above <span className="text-amber-400 font-medium">{defaultThreshold.toFixed(2)}</span> will be refused
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Shield className="h-4 w-4 text-red-400" />
          <label className="text-sm font-medium text-gray-200">Refusal Score Threshold</label>
        </div>
        <div className="space-y-2">
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={refusalThreshold}
            onChange={(e) => onRefusalChange(Number(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-red"
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>0.00</span>
            <span className="font-medium text-red-400 bg-gray-700/50 px-2 py-1 rounded-md">
              {refusalThreshold.toFixed(2)}
            </span>
            <span>1.00</span>
          </div>
        </div>
        <p className="text-xs text-gray-400 bg-gray-700/30 p-3 rounded-lg border border-gray-600/30">
          Loans with refusal score above <span className="text-red-400 font-medium">{refusalThreshold.toFixed(2)}</span> will be refused
        </p>
      </div>

      <div className="bg-gradient-to-r from-gray-700/50 to-gray-600/50 rounded-xl p-4 border border-gray-600/50">
        <h4 className="text-sm font-medium text-gray-100 mb-2 flex items-center space-x-2">
          <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
          <span>Decision Logic</span>
        </h4>
        <p className="text-xs text-gray-300 leading-relaxed">
          A loan is <span className="font-medium text-red-400 bg-red-400/10 px-1.5 py-0.5 rounded">refused</span> if either the default score OR refusal score exceeds their respective thresholds. 
          Otherwise, the loan is <span className="font-medium text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded">accepted</span>.
        </p>
      </div>
    </div>
  );
};