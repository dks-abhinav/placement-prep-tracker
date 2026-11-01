import React from 'react';
import {
  LayoutDashboard,
  Code2,
  CalendarCheck2,
  Briefcase,
  BookOpen,
  Users2,
  FileCheck,
  Settings,
  X,
  Target,
  GraduationCap,
  LogOut,
} from 'lucide-react';
import { ActiveTab, UserProfile, DSAProblem } from '../types';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  profile: UserProfile;
  dsaProblems: DSAProblem[];
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  onSignOut: () => void;
  isDemo?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  profile,
  dsaProblems,
  isMobileOpen,
  setIsMobileOpen,
  onSignOut,
  isDemo = false,
}) => {
  const solvedCount = dsaProblems.filter((p) => p.solved).length;
  const totalCount = dsaProblems.length || 1;
  const progressPercent = Math.round((solvedCount / totalCount) * 100);

  const navItems = [
    {
      id: 'dashboard' as ActiveTab,
      label: 'Command Center',
      sublabel: 'Dashboard & Metrics',
      icon: LayoutDashboard,
    },
    {
      id: 'dsa' as ActiveTab,
      label: 'DSA Tracker',
      sublabel: 'SDE Sheets & Solves',
      icon: Code2,
      badge: `${solvedCount}/${totalCount}`,
    },
    {
      id: 'planner' as ActiveTab,
      label: 'Study Planner',
      sublabel: 'Sprints & Deadlines',
      icon: CalendarCheck2,
    },
    {
      id: 'applications' as ActiveTab,
      label: 'Job Applications',
      sublabel: 'Drive Pipeline & OAs',
      icon: Briefcase,
    },
    {
      id: 'core-cs' as ActiveTab,
      label: 'Core CS Subjects',
      sublabel: 'OS, DBMS, CN, OOP',
      icon: BookOpen,
    },
    {
      id: 'mocks' as ActiveTab,
      label: 'Mock Interviews',
      sublabel: 'Ratings & Feedback',
      icon: Users2,
    },
    {
      id: 'resume' as ActiveTab,
      label: 'ATS & Resume Checklist',
      sublabel: 'Audit & Scorecard',
      icon: FileCheck,
    },
    {
      id: 'settings' as ActiveTab,
      label: 'Settings & Data',
      sublabel: 'Profile & LocalStorage',
      icon: Settings,
    },
  ];

  const handleNavClick = (tab: ActiveTab) => {
    setActiveTab(tab);
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col bg-slate-900 text-slate-200 border-r border-slate-800 transition-all duration-300 ease-in-out
          ${isMobileOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0'}
          lg:w-[260px] md:max-lg:w-16
        `}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between px-4 h-16 border-b border-slate-800">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center text-white font-bold shrink-0 shadow-sm">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div className="md:max-lg:hidden flex flex-col min-w-0">
              <span className="text-sm font-bold tracking-tight text-white truncate">
                Placement Prep
              </span>
              <span className="text-[11px] font-mono text-slate-400 truncate">
                CSE 2027 Command Hub
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white p-1 rounded transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Rail */}
        <div className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
          <div className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400 md:max-lg:hidden">
            Navigation
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                title={item.label}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-left transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white font-medium shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon
                  className={`w-5 h-5 shrink-0 ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'
                  }`}
                />

                <div className="flex-1 min-w-0 md:max-lg:hidden">
                  <div className="text-xs font-semibold leading-tight truncate">
                    {item.label}
                  </div>
                  <div
                    className={`text-[10px] truncate ${
                      isActive ? 'text-blue-100' : 'text-slate-400'
                    }`}
                  >
                    {item.sublabel}
                  </div>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded md:max-lg:hidden ${
                      isActive
                        ? 'bg-blue-700 text-white'
                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom User / Readiness Dock */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/60 md:max-lg:hidden">
          <div className="bg-slate-900/90 rounded p-2.5 border border-slate-800/80 mb-2">
            <div className="flex items-center justify-between text-[11px] font-medium text-slate-300 mb-1">
              <span className="flex items-center gap-1">
                <Target className="w-3.5 h-3.5 text-blue-400" /> DSA Target
              </span>
              <span className="font-mono text-emerald-400 font-bold">{progressPercent}%</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1 font-mono">
              <span>{solvedCount} solved</span>
              <span>Goal: {totalCount}</span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 pt-1 text-slate-300">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div className="w-7 h-7 rounded-full bg-blue-700/80 text-white font-bold flex items-center justify-center text-xs shrink-0">
                {profile.name.charAt(0) || 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold text-white truncate">{profile.name}</div>
                <div className="text-[10px] text-slate-400 truncate">
                  {isDemo ? 'Demo Mode' : profile.targetCtc}
                </div>
              </div>
            </div>

            <button
              onClick={onSignOut}
              title={isDemo ? 'Exit Demo Sandbox' : 'Sign Out of Account'}
              className="p-1.5 rounded text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
