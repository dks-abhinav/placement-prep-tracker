import React, { useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Circle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Cpu,
  Database,
  Network,
  Boxes,
  Sparkles,
  Award,
} from 'lucide-react';
import { CoreCSSubject, CSTopic } from '../../types';

interface CoreCSViewProps {
  subjects: CoreCSSubject[];
  onToggleTopic: (subjectId: string, topicId: string) => void;
}

export const CoreCSView: React.FC<CoreCSViewProps> = ({ subjects, onToggleTopic }) => {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(subjects[0]?.id || 'cs-os');
  const [expandedQnAs, setExpandedQnAs] = useState<{ [key: string]: boolean }>({});

  const activeSubject = subjects.find((s) => s.id === selectedSubjectId) || subjects[0];

  const toggleQnA = (qnaKey: string) => {
    setExpandedQnAs((prev) => ({
      ...prev,
      [qnaKey]: !prev[qnaKey],
    }));
  };

  const getSubjectIcon = (code: string) => {
    switch (code) {
      case 'OS':
        return <Cpu className="w-4 h-4" />;
      case 'DBMS':
        return <Database className="w-4 h-4" />;
      case 'CN':
        return <Network className="w-4 h-4" />;
      case 'OOP':
        return <Boxes className="w-4 h-4" />;
      default:
        return <BookOpen className="w-4 h-4" />;
    }
  };

  // Subject completion
  const completedTopicsCount = activeSubject?.topics.filter((t) => t.completed).length || 0;
  const totalTopicsCount = activeSubject?.topics.length || 1;
  const subjectProgress = Math.round((completedTopicsCount / totalTopicsCount) * 100);

  return (
    <div className="space-y-5">
      {/* Subject Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {subjects.map((subj) => {
          const completed = subj.topics.filter((t) => t.completed).length;
          const total = subj.topics.length;
          const pct = Math.round((completed / total) * 100);
          const isSelected = subj.id === selectedSubjectId;

          return (
            <button
              key={subj.id}
              onClick={() => setSelectedSubjectId(subj.id)}
              className={`p-3.5 rounded-lg border text-left transition-all cursor-pointer ${
                isSelected
                  ? 'bg-blue-50/70 border-blue-500 shadow-sm ring-1 ring-blue-500'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between text-slate-700 mb-1.5">
                <span
                  className={`p-1.5 rounded ${
                    isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {getSubjectIcon(subj.code)}
                </span>
                <span className="text-[11px] font-mono font-bold text-slate-500">
                  {completed}/{total}
                </span>
              </div>
              <div className="text-xs font-bold text-slate-900 truncate">{subj.name}</div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    pct === 100 ? 'bg-emerald-500' : 'bg-blue-600'
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Subject Overview Header */}
      {activeSubject && (
        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1 bg-blue-100 text-blue-700 rounded font-mono text-xs font-bold">
                  {activeSubject.code}
                </span>
                <h2 className="text-base font-bold text-slate-900">{activeSubject.name}</h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{activeSubject.description}</p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto font-mono text-xs">
              <span className="text-slate-600 font-medium">Readiness:</span>
              <span
                className={`px-2 py-0.5 rounded font-bold ${
                  subjectProgress === 100
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-blue-100 text-blue-800'
                }`}
              >
                {subjectProgress}% Complete ({completedTopicsCount}/{totalTopicsCount})
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Topics List with Interview Q&A Accordions */}
      <div className="space-y-4">
        {activeSubject?.topics.map((topic) => (
          <div
            key={topic.id}
            className={`bg-white border rounded-lg p-4 shadow-[0_1px_3px_rgba(15,23,42,0.04)] transition-all ${
              topic.completed ? 'border-slate-200 bg-white' : 'border-slate-200'
            }`}
          >
            {/* Topic Header & Toggle */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <button
                  onClick={() => onToggleTopic(activeSubject.id, topic.id)}
                  className="mt-0.5 cursor-pointer text-slate-400 hover:text-blue-600 transition-colors shrink-0"
                  title={topic.completed ? 'Mark uncompleted' : 'Mark completed'}
                >
                  {topic.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-50" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-300 hover:text-slate-400" />
                  )}
                </button>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3
                      className={`text-sm font-bold ${
                        topic.completed ? 'text-slate-700' : 'text-slate-900'
                      }`}
                    >
                      {topic.title}
                    </h3>
                    {topic.importantForOA && (
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 border border-amber-200 font-semibold">
                        ★ High Yield in OAs
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {topic.summary}
                  </p>
                </div>
              </div>
            </div>

            {/* Placement Interview Q&A Flashcards */}
            {topic.interviewQnA && topic.interviewQnA.length > 0 && (
              <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                  <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
                  <span>Key Placement Interview Q&A ({topic.interviewQnA.length})</span>
                </div>

                <div className="space-y-1.5">
                  {topic.interviewQnA.map((qna, idx) => {
                    const qnaKey = `${topic.id}-${idx}`;
                    const isExpanded = Boolean(expandedQnAs[qnaKey]);

                    return (
                      <div
                        key={idx}
                        className="border border-slate-200 rounded-md bg-slate-50/60 overflow-hidden text-xs"
                      >
                        <button
                          onClick={() => toggleQnA(qnaKey)}
                          className="w-full text-left px-3 py-2 flex items-center justify-between gap-2 hover:bg-slate-100 transition-colors font-medium text-slate-800 cursor-pointer"
                        >
                          <span className="flex items-center gap-1.5">
                            <span className="font-mono text-blue-600 font-bold">Q:</span>
                            <span>{qna.question}</span>
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                          )}
                        </button>

                        {isExpanded && (
                          <div className="px-3 py-2.5 bg-white border-t border-slate-200 text-slate-700 text-xs leading-relaxed">
                            <div className="font-semibold text-emerald-700 mb-0.5">Model Answer:</div>
                            {qna.answer}
                            {qna.codeSnippet && (
                              <pre className="mt-2 p-2 bg-slate-900 text-slate-100 rounded text-[11px] font-mono overflow-x-auto">
                                <code>{qna.codeSnippet}</code>
                              </pre>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
