import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  trajectory?: string;
  trajectoryType?: 'positive' | 'warning' | 'neutral';
  icon?: React.ReactNode;
  hint?: string;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subValue,
  trajectory,
  trajectoryType = 'positive',
  icon,
  hint,
  onClick,
}) => {
  const trajectoryColorClass =
    trajectoryType === 'positive'
      ? 'text-emerald-600 bg-emerald-50 border-emerald-200'
      : trajectoryType === 'warning'
      ? 'text-amber-600 bg-amber-50 border-amber-200'
      : 'text-slate-600 bg-slate-100 border-slate-200';

  return (
    <div
      onClick={onClick}
      className={`bg-white border border-slate-200 rounded-lg p-4 shadow-[0_1px_3px_rgba(15,23,42,0.04)] transition-all ${
        onClick ? 'cursor-pointer hover:border-slate-300 hover:shadow-md' : ''
      }`}
    >
      <div className="flex items-center justify-between text-slate-500 mb-2">
        <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
          {label}
        </span>
        {icon && <div className="text-slate-400">{icon}</div>}
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tight text-slate-900 font-sans">
          {value}
        </span>
        {subValue && (
          <span className="text-xs font-mono text-slate-500 font-medium">
            {subValue}
          </span>
        )}
      </div>

      {(trajectory || hint) && (
        <div className="mt-2 flex items-center justify-between gap-1.5 flex-wrap">
          {trajectory && (
            <span
              className={`inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-mono font-medium border ${trajectoryColorClass}`}
            >
              {trajectory}
            </span>
          )}
          {hint && <span className="text-[11px] text-slate-500">{hint}</span>}
        </div>
      )}
    </div>
  );
};
