import React from 'react';
import { Menu, Plus, Sparkles, LogOut, ShieldCheck } from 'lucide-react';
import { ActiveTab, UserProfile } from '../types';

interface NavbarProps {
  activeTab: ActiveTab;
  profile: UserProfile;
  setIsMobileOpen: (open: boolean) => void;
  onQuickAdd: () => void;
  onNavigateToSettings: () => void;
  onSignOut?: () => void;
  isDemo?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  profile,
  setIsMobileOpen,
  onQuickAdd,
  onNavigateToSettings,
  onSignOut,
  isDemo = false,
}) => {
  const getHeaderInfo = () => {
    switch (activeTab) {
      case 'dashboard':
        return {
          title: 'Campus Placement Command Center',
          subtitle: 'Live preparation metrics, OA cutoffs & readiness benchmarks',
          actionText: '+ Log Solved Problem',
        };
      case 'dsa':
        return {
          title: 'DSA Problem Sheet Tracker',
          subtitle: 'Striver & NeetCode style topic-wise mastery with revision logs',
          actionText: '+ Add Custom Problem',
        };
      case 'planner':
        return {
          title: 'Placement Study Planner',
          subtitle: 'Target sprints, core CS revisions & assessment practice tasks',
          actionText: '+ Add Task',
        };
      case 'applications':
        return {
          title: 'Campus Drive Applications Pipeline',
          subtitle: 'Track Day 0 / Day 1 companies, OA test dates & round status',
          actionText: '+ Add Application',
        };
      case 'core-cs':
        return {
          title: 'Core CS Fundamentals & Q&A',
          subtitle: 'Operating Systems, DBMS, Computer Networks & System Design 101',
          actionText: '',
        };
      case 'mocks':
        return {
          title: 'Mock Interviews & Evaluations',
          subtitle: 'Session performance ratings, peer feedback & improvement logs',
          actionText: '+ Record Mock',
        };
      case 'resume':
        return {
          title: 'ATS & Campus Resume Audit',
          subtitle: 'Comprehensive single-column placement resume readiness scorecard',
          actionText: '',
        };
      case 'settings':
        return {
          title: 'Settings & Data Management',
          subtitle: 'Profile customization, demo data reset and export/import',
          actionText: '',
        };
      default:
        return {
          title: 'Placement Prep Tracker',
          subtitle: 'Engineered for B.Tech CSE Placements',
          actionText: '',
        };
    }
  };

  const header = getHeaderInfo();

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-4 sm:px-6 py-3 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileOpen(true)}
            className="lg:hidden text-slate-600 hover:text-slate-900 p-1.5 -ml-1.5 rounded-md hover:bg-slate-100 transition-colors"
            aria-label="Open navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-tight">
              {header.title}
            </h1>
            <p className="hidden sm:block text-xs text-slate-500 font-normal">
              {header.subtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {isDemo ? (
            <div className="flex items-center gap-1.5">
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono bg-amber-50 text-amber-800 border border-amber-200">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Demo Sandbox</span>
              </span>
              {onSignOut && (
                <button
                  onClick={onSignOut}
                  className="px-2 py-1 text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 transition-colors"
                >
                  Sign In to Save
                </button>
              )}
            </div>
          ) : (
            profile.email && (
              <span className="hidden xl:inline-flex items-center gap-1 text-[11px] font-mono text-slate-500 bg-slate-50 px-2 py-1 rounded border border-slate-200">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span className="truncate max-w-[180px]">{profile.email}</span>
              </span>
            )
          )}

          {header.actionText && (
            <button
              onClick={onQuickAdd}
              className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold px-3 py-1.5 rounded shadow-xs focus:ring-2 focus:ring-blue-300 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{header.actionText}</span>
            </button>
          )}

          {onSignOut && !isDemo && (
            <button
              onClick={onSignOut}
              title="Sign Out"
              className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-slate-100 rounded transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
