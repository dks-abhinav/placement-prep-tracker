import React, { useState } from 'react';
import {
  Settings,
  Save,
  RotateCcw,
  Download,
  Upload,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Info,
  Sparkles,
  ShieldAlert,
  LogOut,
  ShieldCheck,
  RotateCw,
} from 'lucide-react';
import { UserProfile } from '../../types';
import { ConfirmationModal } from '../common/ConfirmationModal';
import { exportAllData, importAllData, resetToDemoData, clearAllData } from '../../utils/storage';

interface SettingsViewProps {
  profile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => Promise<void> | void;
  onDataReload: () => void;
  onSignOut?: () => void;
  isDemo?: boolean;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  profile,
  onUpdateProfile,
  onDataReload,
  onSignOut,
  isDemo = false,
}) => {
  // Form state
  const [name, setName] = useState(profile.name);
  const [college, setCollege] = useState(profile.college);
  const [branch, setBranch] = useState(profile.branch);
  const [year, setYear] = useState(profile.year);
  const [targetCtc, setTargetCtc] = useState(profile.targetCtc);
  const [placementDriveDate, setPlacementDriveDate] = useState(profile.placementDriveDate);
  const [dailyDsaTarget, setDailyDsaTarget] = useState(profile.dailyDsaTarget);
  const [showDemoBanner, setShowDemoBanner] = useState(profile.showDemoBanner ?? false);

  // Status messages
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // Confirmation Modals
  const [showResetModal, setShowResetModal] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserProfile = {
      ...profile,
      name: name.trim() || 'Student Candidate',
      college: college.trim() || 'Engineering College',
      branch: branch.trim() || 'Computer Science & Engineering',
      year: year.trim() || '3rd Year',
      targetCtc: targetCtc.trim() || '20+ LPA',
      placementDriveDate,
      dailyDsaTarget: Number(dailyDsaTarget) || 3,
      showDemoBanner,
    };

    try {
      setIsSaving(true);
      setSaveError('');
      await onUpdateProfile(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error('Failed to update profile preferences:', err);
      setSaveError(err?.message || 'Failed to save profile preferences. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportData = () => {
    const jsonString = exportAllData();
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `placement-prep-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const success = importAllData(text);
        if (success) {
          setImportStatus('Backup data imported successfully!');
          onDataReload();
        } else {
          setImportStatus('Error: Invalid JSON backup file.');
        }
      } catch (err) {
        setImportStatus('Failed to read or parse file.');
      }
      setTimeout(() => setImportStatus(null), 4000);
    };
    reader.readAsText(file);
  };

  const handleConfirmReset = () => {
    resetToDemoData();
    setShowResetModal(false);
    onDataReload();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleConfirmClear = () => {
    clearAllData();
    setShowClearModal(false);
    onDataReload();
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Account & Cloud Status Banner */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">
                  {isDemo ? 'Local Demo Playground Sandbox' : 'Firebase Student Account'}
                </h3>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                  isDemo ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {isDemo ? 'Demo Mode' : 'Cloud Firestore Active'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {isDemo
                  ? 'Browsing sample offline data. Sign in to sync your personal SDE sheet to Firebase Cloud Firestore.'
                  : `Signed in as ${profile.email} • User ID: ${profile.uid.slice(0, 10)}...`}
              </p>
            </div>
          </div>

          {onSignOut && (
            <button
              onClick={onSignOut}
              className="px-3.5 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{isDemo ? 'Exit Demo Sandbox' : 'Sign Out'}</span>
            </button>
          )}
        </div>
      </div>

      {/* User Profile Form */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Candidate Profile & Placement Targets
            </h3>
            <p className="text-xs text-slate-500">
              Personalize your drive timeline, college details & daily problem goals
            </p>
          </div>
          {saveSuccess && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
              <CheckCircle2 className="w-4 h-4" /> Saved!
            </span>
          )}
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          {saveError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{saveError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                disabled={isSaving}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:border-blue-600 outline-none disabled:bg-slate-50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                College / University
              </label>
              <input
                type="text"
                required
                disabled={isSaving}
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:border-blue-600 outline-none disabled:bg-slate-50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Degree & Branch
              </label>
              <input
                type="text"
                disabled={isSaving}
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:border-blue-600 outline-none disabled:bg-slate-50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Current Year / Batch
              </label>
              <input
                type="text"
                disabled={isSaving}
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded focus:border-blue-600 outline-none disabled:bg-slate-50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Target CTC Package
              </label>
              <input
                type="text"
                disabled={isSaving}
                value={targetCtc}
                onChange={(e) => setTargetCtc(e.target.value)}
                placeholder="20+ LPA"
                className="w-full px-3 py-1.5 text-xs font-mono border border-slate-300 rounded focus:border-blue-600 outline-none disabled:bg-slate-50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Placement Day 0 Date
              </label>
              <input
                type="date"
                disabled={isSaving}
                value={placementDriveDate}
                onChange={(e) => setPlacementDriveDate(e.target.value)}
                className="w-full px-3 py-1.5 text-xs font-mono border border-slate-300 rounded focus:border-blue-600 outline-none disabled:bg-slate-50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Daily Solved DSA Target
              </label>
              <input
                type="number"
                min={1}
                max={20}
                disabled={isSaving}
                value={dailyDsaTarget}
                onChange={(e) => setDailyDsaTarget(Number(e.target.value))}
                className="w-full px-3 py-1.5 text-xs font-mono border border-slate-300 rounded focus:border-blue-600 outline-none disabled:bg-slate-50"
              />
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
              <input
                type="checkbox"
                disabled={isSaving}
                checked={showDemoBanner}
                onChange={(e) => setShowDemoBanner(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 disabled:opacity-50"
              />
              <span className="font-medium">Show Demo Mode indicator badge in navigation</span>
            </label>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-60 cursor-pointer"
            >
              {isSaving ? <RotateCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isSaving ? 'Saving Preferences...' : 'Save Profile Preferences'}
            </button>
          </div>
        </form>
      </div>

      {/* Data Management & Backup */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-[0_1px_3px_rgba(15,23,42,0.04)] space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
            Data Storage & Backup Controls
          </h3>
          <p className="text-xs text-slate-500">
            Export JSON backups, restore previous sessions, or reset to original sample dataset
          </p>
        </div>

        {importStatus && (
          <div
            className={`p-3 rounded text-xs flex items-center gap-2 ${
              importStatus.includes('successfully')
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            <Info className="w-4 h-4 shrink-0" />
            <span>{importStatus}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 border border-slate-200 rounded-lg bg-slate-50/50 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <Download className="w-4 h-4 text-blue-600" />
              <span>Export Full Prep Backup</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Download your entire workspace as a portable JSON file, including custom problems, notes,
              and application pipeline.
            </p>
            <button
              onClick={handleExportData}
              className="mt-1 px-3 py-1.5 text-xs font-semibold text-slate-800 bg-white border border-slate-300 rounded hover:bg-slate-100 transition-colors inline-flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" /> Export JSON
            </button>
          </div>

          <div className="p-4 border border-slate-200 rounded-lg bg-slate-50/50 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <Upload className="w-4 h-4 text-purple-600" />
              <span>Restore Backup File</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Select a previously exported placement JSON backup to restore your data on this browser.
            </p>
            <label className="mt-1 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-800 bg-white border border-slate-300 rounded hover:bg-slate-100 transition-colors cursor-pointer">
              <Upload className="w-3.5 h-3.5" /> Choose JSON File
              <input
                type="file"
                accept=".json"
                onChange={handleImportFile}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="pt-4 border-t border-slate-200 space-y-3">
          <div className="text-xs font-bold text-red-700 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4" /> Reset & Clear Actions
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              type="button"
              onClick={() => setShowResetModal(true)}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-100 transition-colors flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
              Reset to Default Demo Data
            </button>

            <button
              type="button"
              onClick={() => setShowClearModal(true)}
              className="px-3.5 py-2 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded hover:bg-red-100 transition-colors flex items-center justify-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-600" />
              Clear All Stored Data
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Resetting Demo Data */}
      <ConfirmationModal
        isOpen={showResetModal}
        title="Reset to Default Demo Data"
        message="This will overwrite your current progress with the standard B.Tech CSE Placement sample dataset (including Striver/NeetCode problems, mock interviews, and application pipeline). Do you wish to continue?"
        confirmText="Reset to Demo Data"
        isDestructive={false}
        onCancel={() => setShowResetModal(false)}
        onConfirm={handleConfirmReset}
      />

      {/* Confirmation Modal for Clearing All Data */}
      <ConfirmationModal
        isOpen={showClearModal}
        title="Clear All Stored Data"
        message="Are you sure you want to completely erase all problems, tasks, applications, and settings from your browser? This action cannot be reversed unless you have an exported backup."
        confirmText="Clear Everything"
        isDestructive={true}
        onCancel={() => setShowClearModal(false)}
        onConfirm={handleConfirmClear}
      />
    </div>
  );
};
