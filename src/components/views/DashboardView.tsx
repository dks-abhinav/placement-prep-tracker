import React from 'react';
import {
  Code2,
  CalendarCheck2,
  Briefcase,
  BookOpen,
  Users2,
  FileCheck,
  Flame,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import {
  DSAProblem,
  PlannerTask,
  JobApplication,
  CoreCSSubject,
  MockInterview,
  ChecklistItem,
  UserProfile,
  ActiveTab,
} from '../../types';
import { StatCard } from '../common/StatCard';
import { DifficultyBadge, StatusBadge } from '../common/Badge';

interface DashboardViewProps {
  dsaProblems: DSAProblem[];
  tasks: PlannerTask[];
  applications: JobApplication[];
  coreCSSubjects: CoreCSSubject[];
  mocks: MockInterview[];
  checklist: ChecklistItem[];
  profile: UserProfile;
  onNavigate: (tab: ActiveTab) => void;
  onToggleTask: (taskId: string) => void;
  onToggleDSA: (problemId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  dsaProblems,
  tasks,
  applications,
  coreCSSubjects,
  mocks,
  checklist,
  profile,
  onNavigate,
  onToggleTask,
  onToggleDSA,
}) => {
  // Calculations
  const totalDSA = dsaProblems.length;
  const solvedDSA = dsaProblems.filter((p) => p.solved).length;
  const dsaPercent = totalDSA > 0 ? Math.round((solvedDSA / totalDSA) * 100) : 0;

  const easySolved = dsaProblems.filter((p) => p.difficulty === 'Easy' && p.solved).length;
  const easyTotal = dsaProblems.filter((p) => p.difficulty === 'Easy').length;

  const medSolved = dsaProblems.filter((p) => p.difficulty === 'Medium' && p.solved).length;
  const medTotal = dsaProblems.filter((p) => p.difficulty === 'Medium').length;

  const hardSolved = dsaProblems.filter((p) => p.difficulty === 'Hard' && p.solved).length;
  const hardTotal = dsaProblems.filter((p) => p.difficulty === 'Hard').length;

  // Core CS completion
  let totalCSTopics = 0;
  let completedCSTopics = 0;
  coreCSSubjects.forEach((subj) => {
    subj.topics.forEach((t) => {
      totalCSTopics++;
      if (t.completed) completedCSTopics++;
    });
  });
  const coreCSPercent = totalCSTopics > 0 ? Math.round((completedCSTopics / totalCSTopics) * 100) : 0;

  // Tasks
  const completedTasks = tasks.filter((t) => t.completed).length;
  const pendingTasks = tasks.filter((t) => !t.completed);

  // Applications
  const totalApps = applications.length;
  const offeredCount = applications.filter((a) => a.status === 'Offered').length;
  const inProgressApps = applications.filter(
    (a) => a.status === 'OA Pending' || a.status === 'Technical Round' || a.status === 'HR Round'
  );

  // Mocks Average
  const avgMockRating =
    mocks.length > 0
      ? (mocks.reduce((acc, m) => acc + m.rating, 0) / mocks.length).toFixed(1)
      : '0.0';

  // ATS Checklist score
  const totalChecklist = checklist.length;
  const checkedCount = checklist.filter((c) => c.checked).length;
  const atsScore = totalChecklist > 0 ? Math.round((checkedCount / totalChecklist) * 100) : 0;

  // Topic mastery in DSA
  const topicStats: { [key: string]: { solved: number; total: number } } = {};
  dsaProblems.forEach((p) => {
    if (!topicStats[p.topic]) {
      topicStats[p.topic] = { solved: 0, total: 0 };
    }
    topicStats[p.topic].total++;
    if (p.solved) topicStats[p.topic].solved++;
  });

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-slate-900 tracking-tight">
                Welcome back, {profile.name}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono font-medium bg-amber-50 text-amber-700 border border-amber-200">
                <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> 14-day streak
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {profile.branch} • {profile.college} • Target: <strong className="text-slate-800">{profile.targetCtc}</strong>
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onNavigate('dsa')}
              className="px-3.5 py-1.5 text-xs font-semibold rounded bg-blue-600 text-white hover:bg-blue-700 shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Code2 className="w-4 h-4" /> Go to SDE Sheet
            </button>
            <button
              onClick={() => onNavigate('planner')}
              className="px-3.5 py-1.5 text-xs font-medium rounded bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5"
            >
              <CalendarCheck2 className="w-4 h-4" /> Open Planner
            </button>
          </div>
        </div>
      </div>

      {/* Primary KPI Grid (8 metrics) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="DSA Problems Solved"
          value={`${solvedDSA} / ${totalDSA}`}
          subValue={`(${dsaPercent}%)`}
          trajectory="+12 this week"
          trajectoryType="positive"
          icon={<Code2 className="w-5 h-5" />}
          hint={`Daily target: ${profile.dailyDsaTarget} solved/day`}
          onClick={() => onNavigate('dsa')}
        />

        <StatCard
          label="Core CS Mastery"
          value={`${coreCSPercent}%`}
          subValue={`(${completedCSTopics}/${totalCSTopics} topics)`}
          trajectory={coreCSPercent >= 70 ? 'High Readiness' : 'In Progress'}
          trajectoryType={coreCSPercent >= 70 ? 'positive' : 'warning'}
          icon={<BookOpen className="w-5 h-5" />}
          hint="OS, DBMS, Networks & OOP"
          onClick={() => onNavigate('core-cs')}
        />

        <StatCard
          label="Application Pipeline"
          value={`${inProgressApps.length} Active`}
          subValue={`${totalApps} Total`}
          trajectory={offeredCount > 0 ? `${offeredCount} Offer Secured!` : '0 Offers yet'}
          trajectoryType={offeredCount > 0 ? 'positive' : 'neutral'}
          icon={<Briefcase className="w-5 h-5" />}
          hint="Day 0 / Product drives"
          onClick={() => onNavigate('applications')}
        />

        <StatCard
          label="ATS Resume Score"
          value={`${atsScore}%`}
          subValue={`${checkedCount}/${totalChecklist} Passed`}
          trajectory={atsScore >= 80 ? 'ATS Verified' : 'Needs Optimization'}
          trajectoryType={atsScore >= 80 ? 'positive' : 'warning'}
          icon={<FileCheck className="w-5 h-5" />}
          hint="Single-column format"
          onClick={() => onNavigate('resume')}
        />
      </div>

      {/* 12-Column Responsive Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 8 Columns: Primary Sheets & Sprints */}
        <div className="lg:col-span-8 space-y-6">
          {/* Difficulty Mastery Split */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                  Problem Difficulty Distribution
                </h2>
                <p className="text-xs text-slate-500">
                  Target: 60% Mediums, 25% Easies, 15% Hards for product company OAs
                </p>
              </div>
              <button
                onClick={() => onNavigate('dsa')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                View Full Sheet <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-[#ecfdf5] border border-[#a7f3d0] rounded-md">
                <div className="flex justify-between items-center text-xs text-[#047857] font-semibold">
                  <span>Easy</span>
                  <span className="font-mono">{easySolved} / {easyTotal}</span>
                </div>
                <div className="w-full bg-emerald-200/60 h-2 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-[#047857] h-full rounded-full transition-all"
                    style={{ width: `${easyTotal ? (easySolved / easyTotal) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div className="p-3 bg-[#fffbeb] border border-[#fde68a] rounded-md">
                <div className="flex justify-between items-center text-xs text-[#b45309] font-semibold">
                  <span>Medium</span>
                  <span className="font-mono">{medSolved} / {medTotal}</span>
                </div>
                <div className="w-full bg-amber-200/60 h-2 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-[#b45309] h-full rounded-full transition-all"
                    style={{ width: `${medTotal ? (medSolved / medTotal) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div className="p-3 bg-[#fef2f2] border border-[#fecaca] rounded-md">
                <div className="flex justify-between items-center text-xs text-[#b91c1c] font-semibold">
                  <span>Hard</span>
                  <span className="font-mono">{hardSolved} / {hardTotal}</span>
                </div>
                <div className="w-full bg-red-200/60 h-2 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-[#b91c1c] h-full rounded-full transition-all"
                    style={{ width: `${hardTotal ? (hardSolved / hardTotal) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Pending Tasks Sprints */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <CalendarCheck2 className="w-4 h-4 text-blue-600" />
                <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                  High-Priority Placement Sprints
                </h2>
              </div>
              <span className="text-xs font-mono text-slate-500">
                {completedTasks} completed • {pendingTasks.length} pending
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {pendingTasks.slice(0, 4).map((task) => (
                <div
                  key={task.id}
                  className="py-2.5 flex items-start gap-3 group hover:bg-slate-50/60 px-2 rounded transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => onToggleTask(task.id)}
                    className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold text-slate-800">
                        {task.title}
                      </span>
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                          task.priority === 'High'
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {task.priority}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 font-mono">
                        {task.category}
                      </span>
                    </div>
                    {task.notes && (
                      <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                        {task.notes}
                      </p>
                    )}
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 shrink-0">
                    Due {task.dueDate}
                  </span>
                </div>
              ))}
              {pendingTasks.length === 0 && (
                <div className="py-6 text-center text-slate-400 text-xs">
                  All current tasks completed! Click Study Planner to schedule new tasks.
                </div>
              )}
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => onNavigate('planner')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                Manage All Tasks ({tasks.length}) <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* DSA Topic Mastery Breakdown */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-blue-600" />
                <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                  Topic-Wise DSA Progress
                </h2>
              </div>
              <button
                onClick={() => onNavigate('dsa')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                Filter by Topic
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {Object.entries(topicStats).map(([topic, stats]) => {
                const percent = Math.round((stats.solved / stats.total) * 100);
                return (
                  <div key={topic} className="p-3 border border-slate-200 rounded-md bg-slate-50/50">
                    <div className="flex justify-between items-center text-xs mb-1.5">
                      <span className="font-semibold text-slate-800 truncate mr-2">{topic}</span>
                      <span className="font-mono text-slate-600 text-[11px]">
                        {stats.solved}/{stats.total} ({percent}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          percent === 100
                            ? 'bg-emerald-500'
                            : percent > 50
                            ? 'bg-blue-600'
                            : 'bg-amber-500'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 4 Columns: Target Pipeline & Upcoming Milestones */}
        <div className="lg:col-span-4 space-y-6">
          {/* Active Company Drive Pipeline */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-blue-600" />
                <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                  Company Pipeline
                </h2>
              </div>
              <button
                onClick={() => onNavigate('applications')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                Manage
              </button>
            </div>

            <div className="space-y-2.5">
              {applications.slice(0, 5).map((app) => (
                <div
                  key={app.id}
                  className="p-3 border border-slate-100 rounded bg-slate-50/70 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-bold text-slate-900 truncate">
                      {app.company}
                    </span>
                    <span className="text-[11px] font-mono text-slate-600 font-semibold">
                      {app.ctcLpa}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 truncate mt-0.5">
                    {app.role}
                  </div>
                  <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-slate-200/60">
                    <StatusBadge status={app.status} />
                    {app.oaOrInterviewDate && (
                      <span className="text-[10px] font-mono text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                        {app.oaOrInterviewDate}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100 text-center">
              <button
                onClick={() => onNavigate('applications')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                View all {applications.length} applications →
              </button>
            </div>
          </div>

          {/* Mock Interview Summary Card */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Users2 className="w-4 h-4 text-purple-600" />
                <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                  Mock Interview Benchmark
                </h2>
              </div>
              <button
                onClick={() => onNavigate('mocks')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                Log Mock
              </button>
            </div>

            <div className="flex items-center gap-4 p-3 bg-purple-50/60 border border-purple-100 rounded-md">
              <div className="text-center">
                <div className="text-2xl font-bold font-mono text-purple-900">
                  {avgMockRating}
                </div>
                <div className="text-[10px] uppercase font-semibold text-purple-600">
                  / 5.0 Rating
                </div>
              </div>
              <div className="text-xs text-slate-600 leading-snug">
                Based on <strong className="text-slate-900">{mocks.length} evaluated sessions</strong>.
                Consistently strong on DSA data structures, recommended to sharpen low-level design patterns.
              </div>
            </div>

            {mocks.length > 0 && (
              <div className="mt-3 text-xs">
                <div className="text-[11px] font-semibold text-slate-700 mb-1">
                  Latest Feedback ({mocks[0].title}):
                </div>
                <p className="text-[11px] text-slate-500 italic bg-slate-50 p-2 rounded border border-slate-100">
                  "{mocks[0].feedback}"
                </p>
              </div>
            )}
          </div>

          {/* Quick CS Subject Revision */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-600" />
                <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                  Core CS Status
                </h2>
              </div>
              <button
                onClick={() => onNavigate('core-cs')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                Review Q&A
              </button>
            </div>

            <div className="space-y-2">
              {coreCSSubjects.map((subj) => {
                const completed = subj.topics.filter((t) => t.completed).length;
                const total = subj.topics.length;
                const pct = Math.round((completed / total) * 100);
                return (
                  <div key={subj.id} className="text-xs">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold text-slate-800">{subj.name}</span>
                      <span className="font-mono text-[11px] text-slate-500">
                        {completed}/{total}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
