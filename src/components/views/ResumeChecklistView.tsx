import React, { useState, useMemo } from 'react';
import {
  FileCheck,
  CheckCircle2,
  Circle,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  RotateCcw,
  CheckSquare,
  Square,
  Info,
} from 'lucide-react';
import { ChecklistItem, ChecklistCategory } from '../../types';

interface ResumeChecklistViewProps {
  checklist: ChecklistItem[];
  onToggleCheck: (id: string) => void;
  onSetAll: (checked: boolean) => Promise<void> | void;
}

export const ResumeChecklistView: React.FC<ResumeChecklistViewProps> = ({
  checklist,
  onToggleCheck,
  onSetAll,
}) => {
  const [isBatchUpdating, setIsBatchUpdating] = useState(false);

  const handleBatchToggle = async (checked: boolean) => {
    if (isBatchUpdating) return;
    try {
      setIsBatchUpdating(true);
      await onSetAll(checked);
    } finally {
      setIsBatchUpdating(false);
    }
  };

  const totalItems = checklist.length;
  const checkedItems = checklist.filter((item) => item.checked).length;
  const readinessPercent = totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0;

  const categories = useMemo(() => {
    const map: { [key: string]: ChecklistItem[] } = {};
    checklist.forEach((item) => {
      if (!map[item.category]) map[item.category] = [];
      map[item.category].push(item);
    });
    return map;
  }, [checklist]);

  const getScoreVerdict = (score: number) => {
    if (score >= 90) return { label: 'Day 0 & FAANG+ Ready', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    if (score >= 75) return { label: 'High ATS Compatibility', color: 'text-blue-700 bg-blue-50 border-blue-200' };
    if (score >= 50) return { label: 'Moderate (Needs Revision)', color: 'text-amber-700 bg-amber-50 border-amber-200' };
    return { label: 'Critical ATS Gaps Detected', color: 'text-red-700 bg-red-50 border-red-200' };
  };

  const verdict = getScoreVerdict(readinessPercent);

  return (
    <div className="space-y-5">
      {/* Score Header Card */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-blue-600" />
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Campus Resume & ATS Audit Scorecard
              </h2>
            </div>
            <p className="text-xs text-slate-500 max-w-xl leading-relaxed">
              Based on campus hiring filters from Day 0 recruiters (Google, Microsoft, Amazon, Oracle)
              and strict ATS parseability guidelines.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-50 p-3.5 rounded-lg border border-slate-200 shrink-0">
            <div>
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                ATS Score
              </div>
              <div className="text-2xl font-bold font-mono text-slate-900">
                {readinessPercent}%
              </div>
            </div>

            <div className="h-9 w-px bg-slate-200" />

            <div className="space-y-1">
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold border ${verdict.color}`}
              >
                {verdict.label}
              </span>
              <div className="text-[11px] font-mono text-slate-500">
                {checkedItems} of {totalItems} verified
              </div>
            </div>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="w-full sm:max-w-md bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                readinessPercent >= 80 ? 'bg-emerald-500' : 'bg-blue-600'
              }`}
              style={{ width: `${readinessPercent}%` }}
            />
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => handleBatchToggle(true)}
              disabled={isBatchUpdating}
              className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded hover:bg-slate-50 transition-colors flex items-center gap-1 disabled:opacity-50 cursor-pointer"
            >
              <CheckSquare className="w-3.5 h-3.5 text-blue-600" /> {isBatchUpdating ? 'Saving...' : 'Check All'}
            </button>
            <button
              onClick={() => handleBatchToggle(false)}
              disabled={isBatchUpdating}
              className="px-2.5 py-1 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded hover:bg-slate-50 transition-colors flex items-center gap-1 disabled:opacity-50 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" /> Reset
            </button>
          </div>
        </div>
      </div>

      {/* Checklist Sections */}
      <div className="space-y-4">
        {Object.entries(categories).map(([categoryName, items]) => {
          const catChecked = items.filter((i) => i.checked).length;
          const catTotal = items.length;
          const isCategoryComplete = catChecked === catTotal;

          return (
            <div
              key={categoryName}
              className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-[0_1px_3px_rgba(15,23,42,0.04)]"
            >
              {/* Category Header */}
              <div className="px-4 py-3 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 tracking-tight uppercase">
                  {categoryName}
                </span>
                <span
                  className={`text-[11px] font-mono px-2 py-0.5 rounded ${
                    isCategoryComplete
                      ? 'bg-emerald-100 text-emerald-800 font-bold'
                      : 'bg-slate-200/70 text-slate-700'
                  }`}
                >
                  {catChecked} / {catTotal}
                </span>
              </div>

              {/* Items List */}
              <div className="divide-y divide-slate-100">
                {items.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => onToggleCheck(item.id)}
                    className="p-3.5 flex items-start gap-3 hover:bg-slate-50/70 transition-colors cursor-pointer group"
                  >
                    <button
                      type="button"
                      className="mt-0.5 text-slate-400 group-hover:text-blue-600 transition-colors shrink-0"
                    >
                      {item.checked ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-50" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-300 group-hover:text-slate-400" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-xs font-semibold ${
                            item.checked ? 'text-slate-700' : 'text-slate-900'
                          }`}
                        >
                          {item.title}
                        </span>
                        {item.critical && (
                          <span className="text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded bg-red-50 text-red-700 border border-red-200">
                            Required by Day 0
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
