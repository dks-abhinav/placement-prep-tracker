import React, { useState } from 'react';
import { signOut } from 'firebase/auth';
import {
  GraduationCap,
  Save,
  LogOut,
  AlertCircle,
  Building,
  Target,
  Calendar,
  BookOpen,
  User,
} from 'lucide-react';
import { auth } from '../../firebase/config';
import { UserProfile } from '../../types';
import { saveUserProfile } from '../../firebase/firestoreService';

interface ProfileSetupScreenProps {
  uid: string;
  email: string;
  initialDisplayName?: string | null;
  onProfileComplete: (profile: UserProfile) => void;
  onSignOut: () => void;
}

export const ProfileSetupScreen: React.FC<ProfileSetupScreenProps> = ({
  uid,
  email,
  initialDisplayName,
  onProfileComplete,
  onSignOut,
}) => {
  const [name, setName] = useState(initialDisplayName || '');
  const [college, setCollege] = useState('');
  const [branch, setBranch] = useState('Computer Science & Engineering (CSE)');
  const [year, setYear] = useState('3rd Year (Class of 2027)');
  const [targetCtc, setTargetCtc] = useState('20+ LPA (Tier-1 / Product)');
  const [placementDriveDate, setPlacementDriveDate] = useState('2026-11-20');
  const [dailyDsaTarget, setDailyDsaTarget] = useState(3);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim()) {
      setErrorMessage('Full Name is required.');
      return;
    }
    if (!college.trim()) {
      setErrorMessage('College / University name is required.');
      return;
    }
    if (!branch.trim()) {
      setErrorMessage('Degree & Branch is required.');
      return;
    }
    if (!year.trim()) {
      setErrorMessage('Graduation Year / Batch is required.');
      return;
    }
    if (!targetCtc.trim()) {
      setErrorMessage('Placement Goal / Target CTC is required.');
      return;
    }

    setIsSaving(true);
    try {
      if (auth.currentUser) {
        // Ensure latest token is attached to Firestore requests
        await auth.currentUser.getIdToken(true);
      }

      const newProfile: UserProfile = {
        uid,
        email,
        name: name.trim(),
        college: college.trim(),
        branch: branch.trim(),
        year: year.trim(),
        targetCtc: targetCtc.trim(),
        placementDriveDate,
        dailyDsaTarget: Number(dailyDsaTarget) || 3,
        profileComplete: true,
        showDemoBanner: false,
        isDemoUser: false,
      };

      console.info('[ProfileSetup] Initiating profile save:', {
        uid,
        hasName: Boolean(newProfile.name),
        nameLength: newProfile.name.length,
        hasCollege: Boolean(newProfile.college),
        collegeLength: newProfile.college.length,
        emailVerified: Boolean(auth.currentUser?.emailVerified),
      });

      await saveUserProfile(uid, newProfile);
      onProfileComplete(newProfile);
    } catch (err: any) {
      console.error('[ProfileSetup] Error saving initial profile:', err);
      setErrorMessage(
        err?.message || 'Failed to save student profile. Please check your network and try again.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      onSignOut();
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md">
            <GraduationCap className="w-7 h-7" />
          </div>
        </div>
        <h2 className="mt-3 text-center text-2xl font-bold tracking-tight text-slate-900">
          Complete Your Student Profile
        </h2>
        <p className="mt-1 text-center text-xs text-slate-500">
          Step 2 of 2: Configure your placement timeline and targets before accessing your workspace
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-8 px-6 shadow-[0_4px_16px_rgba(15,23,42,0.06)] border border-slate-200 rounded-lg sm:px-8 space-y-5">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-md flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>{errorMessage}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aarav Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded focus:border-blue-600 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  College / University *
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. NIT Trichy / IIT Delhi / VIT"
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded focus:border-blue-600 outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Degree & Branch *
                </label>
                <div className="relative">
                  <BookOpen className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. B.Tech Computer Science"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded focus:border-blue-600 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Current Year / Batch *
                </label>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded bg-white focus:border-blue-600 outline-none"
                >
                  <option value="3rd Year (Class of 2027)">3rd Year (Batch of 2027)</option>
                  <option value="4th Year (Class of 2026)">4th Year (Batch of 2026)</option>
                  <option value="2nd Year (Class of 2028)">2nd Year (Batch of 2028)</option>
                  <option value="Postgraduate / M.Tech">Postgraduate / M.Tech</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Placement Goal / Target CTC *
                </label>
                <div className="relative">
                  <Target className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. 24+ LPA (Tier-1 / Product)"
                    value={targetCtc}
                    onChange={(e) => setTargetCtc(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded focus:border-blue-600 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Daily Problem Goal
                </label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={dailyDsaTarget}
                  onChange={(e) => setDailyDsaTarget(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded focus:border-blue-600 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Day 0 Drive Estimated Start Date
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  value={placementDriveDate}
                  onChange={(e) => setPlacementDriveDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs font-mono border border-slate-300 rounded focus:border-blue-600 outline-none"
                />
              </div>
            </div>

            <div className="pt-3">
              <button
                type="submit"
                disabled={isSaving}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Saving Profile...' : 'Save & Open My Placement Workspace'}</span>
              </button>
            </div>
          </form>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Signed in as <strong className="font-mono text-slate-700">{email}</strong></span>
            <button
              onClick={handleLogout}
              className="text-red-600 hover:text-red-700 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
