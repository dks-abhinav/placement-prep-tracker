import React, { useState, useMemo } from 'react';
import {
  Briefcase,
  Plus,
  Search,
  Building,
  Calendar,
  MapPin,
  ExternalLink,
  Edit2,
  Trash2,
  AlertCircle,
  X,
  Filter,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import { JobApplication, ApplicationStatus, CompanyTier } from '../../types';
import { StatusBadge, TierBadge } from '../common/Badge';
import { ConfirmationModal } from '../common/ConfirmationModal';

interface JobApplicationsViewProps {
  applications: JobApplication[];
  onAddApplication: (app: Omit<JobApplication, 'id'>) => Promise<void> | void;
  onUpdateApplication: (app: JobApplication) => Promise<void> | void;
  onDeleteApplication: (id: string) => Promise<void> | void;
  isAddModalOpen: boolean;
  setIsAddModalOpen: (open: boolean) => void;
}

export const JobApplicationsView: React.FC<JobApplicationsViewProps> = ({
  applications,
  onAddApplication,
  onUpdateApplication,
  onDeleteApplication,
  isAddModalOpen,
  setIsAddModalOpen,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterTier, setFilterTier] = useState<string>('All');

  // Modal editing & delete states
  const [editingApp, setEditingApp] = useState<JobApplication | null>(null);
  const [appToDelete, setAppToDelete] = useState<JobApplication | null>(null);

  // Form states
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [ctcLpa, setCtcLpa] = useState('');
  const [tier, setTier] = useState<CompanyTier>('[Product / 18-24 LPA]');
  const [status, setStatus] = useState<ApplicationStatus>('Applied');
  const [appliedDate, setAppliedDate] = useState('2026-10-25');
  const [oaOrInterviewDate, setOaOrInterviewDate] = useState('');
  const [location, setLocation] = useState('Bangalore / Remote');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const tiers: CompanyTier[] = [
    '[Tier-1 / FAANG+]',
    '[Product / 18-24 LPA]',
    '[High-Growth / 12-18 LPA]',
    '[Day 1 / 8-12 LPA]',
    '[Mass / 4-7 LPA]',
  ];

  const statuses: ApplicationStatus[] = [
    'Wishlist',
    'Applied',
    'OA Pending',
    'Technical Round',
    'HR Round',
    'Offered',
    'Rejected',
  ];

  const handleOpenAddModal = () => {
    setCompany('');
    setRole('');
    setCtcLpa('');
    setTier('[Product / 18-24 LPA]');
    setStatus('Applied');
    setAppliedDate(new Date().toISOString().split('T')[0]);
    setOaOrInterviewDate('');
    setLocation('Bengaluru / Hyderabad');
    setNotes('');
    setFormError('');
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (app: JobApplication) => {
    setEditingApp(app);
    setCompany(app.company);
    setRole(app.role);
    setCtcLpa(app.ctcLpa);
    setTier(app.tier);
    setStatus(app.status);
    setAppliedDate(app.appliedDate);
    setOaOrInterviewDate(app.oaOrInterviewDate || '');
    setLocation(app.location);
    setNotes(app.notes || '');
    setFormError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.trim()) {
      setFormError('Company name is required.');
      return;
    }
    if (!role.trim()) {
      setFormError('Role or job profile is required.');
      return;
    }

    const payload = {
      company: company.trim(),
      role: role.trim(),
      ctcLpa: ctcLpa.trim() || 'Undisclosed',
      tier,
      status,
      appliedDate,
      oaOrInterviewDate: oaOrInterviewDate.trim() || '',
      location: location.trim() || 'Pan India',
      notes: notes.trim() || '',
    };

    try {
      setIsSubmitting(true);
      setFormError('');
      if (editingApp) {
        await onUpdateApplication({ ...payload, id: editingApp.id });
        setEditingApp(null);
      } else {
        await onAddApplication(payload);
        setIsAddModalOpen(false);
      }

      setCompany('');
      setRole('');
      setNotes('');
      setOaOrInterviewDate('');
      setFormError('');
    } catch (err) {
      console.error('Failed to save application:', err);
      setFormError(
        err instanceof Error
          ? err.message
          : 'Failed to save application to cloud. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick status updater from card
  const handleQuickStatusChange = async (app: JobApplication, newStatus: ApplicationStatus) => {
    try {
      setActionError(null);
      await onUpdateApplication({
        ...app,
        status: newStatus,
      });
    } catch (err) {
      console.error('Failed to update status:', err);
      setActionError(`Failed to update status for ${app.company}. Please check cloud permissions.`);
      setTimeout(() => setActionError(null), 6000);
    }
  };

  // Filtered applications
  const filteredApps = useMemo(() => {
    return applications.filter((app) => {
      const search = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !search ||
        app.company.toLowerCase().includes(search) ||
        app.role.toLowerCase().includes(search) ||
        app.location.toLowerCase().includes(search);

      const matchesStatus = filterStatus === 'All' || app.status === filterStatus;
      const matchesTier = filterTier === 'All' || app.tier === filterTier;

      return matchesSearch && matchesStatus && matchesTier;
    });
  }, [applications, searchTerm, filterStatus, filterTier]);

  // Counts
  const totalApps = applications.length;
  const offeredCount = applications.filter((a) => a.status === 'Offered').length;
  const inProgressCount = applications.filter(
    (a) => a.status === 'OA Pending' || a.status === 'Technical Round' || a.status === 'HR Round'
  ).length;

  return (
    <div className="space-y-5">
      {actionError && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center justify-between gap-2 shadow-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{actionError}</span>
          </div>
          <button
            onClick={() => setActionError(null)}
            className="text-red-400 hover:text-red-600 p-0.5 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search & Control Toolbar */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-[0_1px_3px_rgba(15,23,42,0.04)] space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by company name, role, or city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none text-slate-900"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold shadow-xs transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" /> Add Application
          </button>
        </div>

        {/* Filter Toolbar */}
        <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-slate-100 text-xs">
          {/* Status Select */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-2.5 py-1 text-xs border border-slate-300 rounded bg-white text-slate-800 focus:border-blue-600 outline-none"
          >
            <option value="All">All Statuses ({totalApps})</option>
            {statuses.map((st) => (
              <option key={st} value={st}>
                {st} ({applications.filter((a) => a.status === st).length})
              </option>
            ))}
          </select>

          {/* Tier Select */}
          <select
            value={filterTier}
            onChange={(e) => setFilterTier(e.target.value)}
            className="px-2.5 py-1 text-xs border border-slate-300 rounded bg-white text-slate-800 focus:border-blue-600 outline-none"
          >
            <option value="All">All Tiers</option>
            {tiers.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <div className="ml-auto flex items-center gap-2 font-mono text-[11px] text-slate-500">
            <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-semibold">
              {offeredCount} Offers
            </span>
            <span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 font-semibold">
              {inProgressCount} In Active Rounds
            </span>
          </div>
        </div>
      </div>

      {/* Applications Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredApps.map((app) => (
          <div
            key={app.id}
            className="bg-white border border-slate-200 rounded-lg p-4 shadow-[0_1px_3px_rgba(15,23,42,0.04)] hover:shadow-md transition-shadow flex flex-col justify-between"
          >
            <div>
              {/* Header */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h3 className="text-base font-bold text-slate-900 tracking-tight leading-tight">
                    {app.company}
                  </h3>
                  <p className="text-xs text-slate-600 font-medium mt-0.5">{app.role}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEditModal(app)}
                    className="p-1 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded"
                    title="Edit application"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setAppToDelete(app)}
                    className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                    title="Delete application"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Tier & CTC */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <TierBadge tier={app.tier} />
                <span className="text-xs font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                  {app.ctcLpa}
                </span>
              </div>

              {/* Meta details */}
              <div className="space-y-1.5 text-[11px] text-slate-500 font-mono mb-3 bg-slate-50 p-2.5 rounded border border-slate-100">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Applied: {app.appliedDate}</span>
                </div>
                {app.oaOrInterviewDate && (
                  <div className="flex items-center gap-1.5 text-amber-800 font-semibold">
                    <Calendar className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>Next Round / OA: {app.oaOrInterviewDate}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{app.location}</span>
                </div>
              </div>

              {app.notes && (
                <p className="text-xs text-slate-600 italic bg-blue-50/40 p-2 rounded border border-blue-100/60 mb-3 leading-relaxed">
                  "{app.notes}"
                </p>
              )}
            </div>

            {/* Bottom Status Controller */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
              <StatusBadge status={app.status} />

              {/* Quick Status Dropdown */}
              <select
                value={app.status}
                onChange={(e) => handleQuickStatusChange(app, e.target.value as ApplicationStatus)}
                className="text-[11px] font-semibold bg-white border border-slate-300 rounded px-2 py-1 text-slate-700 focus:border-blue-600 outline-none"
              >
                {statuses.map((st) => (
                  <option key={st} value={st}>
                    Move to: {st}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>

      {filteredApps.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-lg p-12 text-center text-slate-500">
          <Briefcase className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700">No company applications found</p>
          <p className="text-xs text-slate-400 mt-1">
            Track Day 0, Day 1, or off-campus applications by clicking "Add Application".
          </p>
        </div>
      )}

      {/* Add / Edit Application Modal */}
      {(isAddModalOpen || editingApp) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in duration-150">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {editingApp ? 'Edit Job Application' : 'Add Campus Job Application'}
                </h3>
                <p className="text-xs text-slate-500">
                  Track campus placement drives, OA test links & CTC breakdown
                </p>
              </div>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingApp(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-3.5">
              {formError && (
                <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g. Google, Atlassian, Oracle"
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded focus:border-blue-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Role / Profile *
                  </label>
                  <input
                    type="text"
                    required
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g. Software Engineer Intern"
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded focus:border-blue-600 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    CTC / Stipend (LPA)
                  </label>
                  <input
                    type="text"
                    value={ctcLpa}
                    onChange={(e) => setCtcLpa(e.target.value)}
                    placeholder="e.g. 24.5 LPA or 1.2 Lakh/mo"
                    className="w-full px-2.5 py-1.5 text-xs font-mono border border-slate-300 rounded focus:border-blue-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Company Tier
                  </label>
                  <select
                    value={tier}
                    onChange={(e) => setTier(e.target.value as CompanyTier)}
                    className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded bg-white focus:border-blue-600 outline-none"
                  >
                    {tiers.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Current Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ApplicationStatus)}
                    className="w-full px-2 py-1.5 text-xs border border-slate-300 rounded bg-white focus:border-blue-600 outline-none"
                  >
                    {statuses.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Application Date
                  </label>
                  <input
                    type="date"
                    value={appliedDate}
                    onChange={(e) => setAppliedDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs font-mono border border-slate-300 rounded focus:border-blue-600 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    OA / Interview Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={oaOrInterviewDate}
                    onChange={(e) => setOaOrInterviewDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs font-mono border border-slate-300 rounded focus:border-blue-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Job Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Bangalore / Hyderabad / Noida"
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded focus:border-blue-600 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Round Notes / Cutoff Syllabus (Optional)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. HackerEarth platform test. Focus heavily on Trie, Graphs and DP."
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded focus:border-blue-600 outline-none"
                />
              </div>

              <div className="pt-2 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingApp(null);
                  }}
                  className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded hover:bg-blue-700 shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting && (
                    <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  {editingApp
                    ? isSubmitting
                      ? 'Updating...'
                      : 'Update Application'
                    : isSubmitting
                    ? 'Saving...'
                    : 'Save Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={Boolean(appToDelete)}
        title="Delete Job Application"
        message={`Are you sure you want to remove ${appToDelete?.company} (${appToDelete?.role}) from your placement pipeline?`}
        confirmText="Delete"
        isDestructive={true}
        onCancel={() => setAppToDelete(null)}
        onConfirm={async () => {
          if (appToDelete) {
            try {
              await onDeleteApplication(appToDelete.id);
              setAppToDelete(null);
            } catch (err) {
              console.error('Failed to delete application:', err);
              setActionError(`Failed to delete ${appToDelete.company}. Please check cloud permissions.`);
              setTimeout(() => setActionError(null), 6000);
            }
          }
        }}
      />
    </div>
  );
};
