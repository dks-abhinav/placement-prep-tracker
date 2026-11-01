import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import {
  ActiveTab,
  UserProfile,
  DSAProblem,
  PlannerTask,
  JobApplication,
  CoreCSSubject,
  MockInterview,
  ChecklistItem,
  AuthStatus,
} from './types';
import { auth, testConnection } from './firebase/config';
import {
  getUserProfile,
  saveUserProfile,
  fetchUserDSA,
  saveUserDSAProblem,
  deleteUserDSAProblem,
  batchSaveDSAProblems,
  fetchUserTasks,
  saveUserTask,
  deleteUserTask,
  fetchUserApplications,
  saveUserApplication,
  deleteUserApplication,
  fetchUserCoreCS,
  saveUserCoreCSTopicToggle,
  fetchUserMocks,
  saveUserMock,
  deleteUserMock,
  fetchUserChecklist,
  saveUserChecklistItem,
  saveUserAllChecklist,
} from './firebase/firestoreService';
import {
  getStoredProfile,
  saveStoredProfile,
  getStoredDSA,
  saveStoredDSA,
  getStoredTasks,
  saveStoredTasks,
  getStoredApplications,
  saveStoredApplications,
  getStoredCoreCS,
  saveStoredCoreCS,
  getStoredMocks,
  saveStoredMocks,
  getStoredChecklist,
  saveStoredChecklist,
} from './utils/storage';
import { initialProfile, initialDSAProblems, initialCoreCSSubjects, initialChecklist } from './data/initialData';

import { AuthScreen } from './components/auth/AuthScreen';
import { EmailVerificationScreen } from './components/auth/EmailVerificationScreen';
import { ProfileSetupScreen } from './components/auth/ProfileSetupScreen';

import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { AssessmentBanner } from './components/AssessmentBanner';
import { DashboardView } from './components/views/DashboardView';
import { DSATrackerView } from './components/views/DSATrackerView';
import { StudyPlannerView } from './components/views/StudyPlannerView';
import { JobApplicationsView } from './components/views/JobApplicationsView';
import { CoreCSView } from './components/views/CoreCSView';
import { MockInterviewsView } from './components/views/MockInterviewsView';
import { ResumeChecklistView } from './components/views/ResumeChecklistView';
import { SettingsView } from './components/views/SettingsView';
import { GraduationCap, AlertTriangle, RotateCw, CheckCircle2, X } from 'lucide-react';

export default function App() {
  const [authStatus, setAuthStatus] = useState<AuthStatus>('loading');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [unverifiedEmail, setUnverifiedEmail] = useState('');
  const [startupError, setStartupError] = useState<string | null>(null);
  const [isRetryingLoad, setIsRetryingLoad] = useState(false);
  const [toast, setToast] = useState<{ id: number; message: string; type: 'error' | 'success' } | null>(null);

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Core application states
  const [profile, setProfile] = useState<UserProfile>(initialProfile);
  const [dsaProblems, setDsaProblems] = useState<DSAProblem[]>([]);
  const [tasks, setTasks] = useState<PlannerTask[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [coreCSSubjects, setCoreCSSubjects] = useState<CoreCSSubject[]>(initialCoreCSSubjects);
  const [mocks, setMocks] = useState<MockInterview[]>([]);
  const [checklist, setChecklist] = useState<ChecklistItem[]>(initialChecklist);

  const showToast = (message: string, type: 'error' | 'success' = 'error') => {
    const id = Date.now();
    setToast({ id, message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.id === id ? null : prev));
    }, 5500);
  };

  // Dedicated data loader for verified authenticated users
  const loadUserWorkspace = async (firebaseUser: User) => {
    setStartupError(null);
    try {
      await firebaseUser.getIdToken();
      const studentProfile = await getUserProfile(firebaseUser.uid);
      if (!studentProfile || !studentProfile.profileComplete) {
        setAuthStatus('profile_incomplete');
        return;
      }

      // Profile is complete! Load user's private Firestore data
      setProfile(studentProfile);

      const [userDSA, userTasks, userApps, userCS, userMocks, userChecklist] =
        await Promise.all([
          fetchUserDSA(firebaseUser.uid),
          fetchUserTasks(firebaseUser.uid),
          fetchUserApplications(firebaseUser.uid),
          fetchUserCoreCS(firebaseUser.uid),
          fetchUserMocks(firebaseUser.uid),
          fetchUserChecklist(firebaseUser.uid),
        ]);

      setDsaProblems(userDSA || []);
      setTasks(userTasks || []);
      setApplications(userApps || []);
      setCoreCSSubjects(userCS || initialCoreCSSubjects);
      setMocks(userMocks || []);
      setChecklist(userChecklist || initialChecklist);

      setAuthStatus('authenticated');
    } catch (err: any) {
      console.error('Error loading student profile or workspace data from Firestore:', err);
      setStartupError(
        err?.message ||
          'Failed to load your student profile or workspace records from Cloud Firestore. Please check your network and try again.'
      );
      setAuthStatus('startup_error');
    }
  };

  // Initialize Firebase and Listen to Auth State
  useEffect(() => {
    testConnection();

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setCurrentUser(null);
        // If user was already in demo mode, preserve demo mode, otherwise signed_out
        setAuthStatus((prev) => (prev === 'demo_mode' ? 'demo_mode' : 'signed_out'));
        return;
      }

      setCurrentUser(firebaseUser);

      // Check email verification for password users (Google users are auto-verified)
      const isGoogle = firebaseUser.providerData.some((p) => p.providerId === 'google.com');
      if (!isGoogle && !firebaseUser.emailVerified) {
        setUnverifiedEmail(firebaseUser.email || '');
        setAuthStatus('email_unverified');
        return;
      }

      await loadUserWorkspace(firebaseUser);
    });

    return () => unsubscribe();
  }, []);

  // Enter Demo Mode
  const handleEnterDemoMode = () => {
    setProfile(getStoredProfile());
    setDsaProblems(getStoredDSA());
    setTasks(getStoredTasks());
    setApplications(getStoredApplications());
    setCoreCSSubjects(getStoredCoreCS());
    setMocks(getStoredMocks());
    setChecklist(getStoredChecklist());
    setAuthStatus('demo_mode');
    setActiveTab('dashboard');
  };

  // Sign Out Handler
  const handleSignOut = async () => {
    if (authStatus === 'demo_mode') {
      setAuthStatus('signed_out');
      return;
    }
    try {
      await signOut(auth);
      setAuthStatus('signed_out');
      setCurrentUser(null);
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  // Update Profile
  const handleUpdateProfile = async (newProfile: UserProfile) => {
    if (authStatus === 'authenticated' && currentUser) {
      await saveUserProfile(currentUser.uid, newProfile);
    } else if (authStatus === 'demo_mode') {
      saveStoredProfile(newProfile);
    }
    setProfile(newProfile);
    showToast('Profile preferences updated.', 'success');
  };

  // Profile setup completion
  const handleProfileComplete = async (completedProfile: UserProfile) => {
    setProfile(completedProfile);
    // Real student account starts with clean initial state
    setDsaProblems([]);
    setTasks([]);
    setApplications([]);
    setCoreCSSubjects(
      initialCoreCSSubjects.map((s) => ({
        ...s,
        topics: s.topics.map((t) => ({ ...t, completed: false })),
      }))
    );
    setMocks([]);
    setChecklist(initialChecklist.map((c) => ({ ...c, checked: false })));

    setAuthStatus('authenticated');
    setActiveTab('dashboard');
  };

  // DSA Actions
  const handleToggleSolved = async (id: string) => {
    const prev = dsaProblems;
    const updated = dsaProblems.map((p) => {
      if (p.id === id) {
        const nextSolved = !p.solved;
        return {
          ...p,
          solved: nextSolved,
          solvedDate: nextSolved ? new Date().toISOString().split('T')[0] : undefined,
          revisionsCount: nextSolved && p.revisionsCount === 0 ? 1 : p.revisionsCount,
        };
      }
      return p;
    });
    setDsaProblems(updated);

    const targetProblem = updated.find((p) => p.id === id);
    if (authStatus === 'authenticated' && currentUser && targetProblem) {
      try {
        await saveUserDSAProblem(currentUser.uid, targetProblem);
      } catch (err: any) {
        console.error('Failed to update solved state in Firestore:', err);
        setDsaProblems(prev);
        showToast(err?.message || 'Failed to update solved status. State restored.', 'error');
      }
    } else if (authStatus === 'demo_mode') {
      saveStoredDSA(updated);
    }
  };

  const handleToggleBookmark = async (id: string) => {
    const prev = dsaProblems;
    const updated = dsaProblems.map((p) =>
      p.id === id ? { ...p, bookmarked: !p.bookmarked } : p
    );
    setDsaProblems(updated);

    const targetProblem = updated.find((p) => p.id === id);
    if (authStatus === 'authenticated' && currentUser && targetProblem) {
      try {
        await saveUserDSAProblem(currentUser.uid, targetProblem);
      } catch (err: any) {
        console.error('Failed to update bookmark in Firestore:', err);
        setDsaProblems(prev);
        showToast(err?.message || 'Failed to update bookmark. State restored.', 'error');
      }
    } else if (authStatus === 'demo_mode') {
      saveStoredDSA(updated);
    }
  };

  const handleIncrementRevision = async (id: string) => {
    const prev = dsaProblems;
    const updated = dsaProblems.map((p) =>
      p.id === id ? { ...p, revisionsCount: p.revisionsCount + 1 } : p
    );
    setDsaProblems(updated);

    const targetProblem = updated.find((p) => p.id === id);
    if (authStatus === 'authenticated' && currentUser && targetProblem) {
      try {
        await saveUserDSAProblem(currentUser.uid, targetProblem);
      } catch (err: any) {
        console.error('Failed to update revisions count in Firestore:', err);
        setDsaProblems(prev);
        showToast(err?.message || 'Failed to update revision count. State restored.', 'error');
      }
    } else if (authStatus === 'demo_mode') {
      saveStoredDSA(updated);
    }
  };

  const handleAddProblem = async (newProblem: Omit<DSAProblem, 'id'>) => {
    const problem: DSAProblem = {
      ...newProblem,
      id: `dsa-${Date.now()}`,
    };

    if (authStatus === 'authenticated' && currentUser) {
      await saveUserDSAProblem(currentUser.uid, problem);
    } else if (authStatus === 'demo_mode') {
      saveStoredDSA([problem, ...dsaProblems]);
    }
    setDsaProblems((prev) => [problem, ...prev]);
    showToast('DSA problem saved to cloud.', 'success');
  };

  const handleUpdateDSANotes = async (id: string, notes: string) => {
    const targetProblem = dsaProblems.find((p) => p.id === id);
    if (!targetProblem) return;
    const updatedProblem = { ...targetProblem, notes };

    if (authStatus === 'authenticated' && currentUser) {
      await saveUserDSAProblem(currentUser.uid, updatedProblem);
    } else if (authStatus === 'demo_mode') {
      saveStoredDSA(dsaProblems.map((p) => (p.id === id ? updatedProblem : p)));
    }
    setDsaProblems((prev) => prev.map((p) => (p.id === id ? updatedProblem : p)));
    showToast('Problem notes updated.', 'success');
  };

  const handleDeleteProblem = async (id: string) => {
    if (authStatus === 'authenticated' && currentUser) {
      try {
        await deleteUserDSAProblem(currentUser.uid, id);
        setDsaProblems((prev) => prev.filter((p) => p.id !== id));
        showToast('DSA problem deleted.', 'success');
      } catch (err: any) {
        console.error('Failed to delete problem from Firestore:', err);
        showToast(err?.message || 'Failed to delete problem.', 'error');
        throw err;
      }
    } else if (authStatus === 'demo_mode') {
      const updated = dsaProblems.filter((p) => p.id !== id);
      setDsaProblems(updated);
      saveStoredDSA(updated);
      showToast('DSA problem deleted.', 'success');
    }
  };

  // Option for student to import standard 20 SDE templates with 0 solved
  const handleLoadStandardDSATemplates = async () => {
    const templateProblems: DSAProblem[] = initialDSAProblems.map((p) => ({
      ...p,
      solved: false,
      bookmarked: false,
      revisionsCount: 0,
      solvedDate: undefined,
    }));

    if (authStatus === 'authenticated' && currentUser) {
      try {
        await batchSaveDSAProblems(currentUser.uid, templateProblems);
        setDsaProblems(templateProblems);
        showToast('Imported standard 20 SDE sheet practice problems.', 'success');
      } catch (err: any) {
        console.error('Failed to batch save standard DSA templates:', err);
        showToast(err?.message || 'Failed to import SDE templates.', 'error');
        throw err;
      }
    } else if (authStatus === 'demo_mode') {
      setDsaProblems(templateProblems);
      saveStoredDSA(templateProblems);
      showToast('Loaded standard SDE sheet template.', 'success');
    }
  };

  // Task Actions
  const handleToggleTask = async (id: string) => {
    const prev = tasks;
    const updated = tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t));
    setTasks(updated);

    const targetTask = updated.find((t) => t.id === id);
    if (authStatus === 'authenticated' && currentUser && targetTask) {
      try {
        await saveUserTask(currentUser.uid, targetTask);
      } catch (err: any) {
        console.error('Failed to update task completion in Firestore:', err);
        setTasks(prev);
        showToast(err?.message || 'Failed to update task completion. State restored.', 'error');
      }
    } else if (authStatus === 'demo_mode') {
      saveStoredTasks(updated);
    }
  };

  const handleAddTask = async (newTask: Omit<PlannerTask, 'id'>) => {
    const task: PlannerTask = {
      ...newTask,
      id: `task-${Date.now()}`,
    };

    if (authStatus === 'authenticated' && currentUser) {
      await saveUserTask(currentUser.uid, task);
    } else if (authStatus === 'demo_mode') {
      saveStoredTasks([task, ...tasks]);
    }
    setTasks((prev) => [task, ...prev]);
    showToast('Task added to study planner.', 'success');
  };

  const handleUpdateTask = async (task: PlannerTask) => {
    if (authStatus === 'authenticated' && currentUser) {
      await saveUserTask(currentUser.uid, task);
    } else if (authStatus === 'demo_mode') {
      saveStoredTasks(tasks.map((t) => (t.id === task.id ? task : t)));
    }
    setTasks((prev) => prev.map((t) => (t.id === task.id ? task : t)));
    showToast('Task updated.', 'success');
  };

  const handleDeleteTask = async (id: string) => {
    if (authStatus === 'authenticated' && currentUser) {
      try {
        await deleteUserTask(currentUser.uid, id);
        setTasks((prev) => prev.filter((t) => t.id !== id));
        showToast('Task removed from planner.', 'success');
      } catch (err: any) {
        console.error('Failed to delete task from Firestore:', err);
        showToast(err?.message || 'Failed to delete task.', 'error');
        throw err;
      }
    } else if (authStatus === 'demo_mode') {
      const updated = tasks.filter((t) => t.id !== id);
      setTasks(updated);
      saveStoredTasks(updated);
      showToast('Task removed.', 'success');
    }
  };

  // Job Application Actions
  const handleAddApplication = async (newApp: Omit<JobApplication, 'id'>) => {
    const app: JobApplication = {
      ...newApp,
      id: `app-${Date.now()}`,
    };

    const targetUid = currentUser?.uid || auth.currentUser?.uid;
    if (authStatus === 'authenticated' && targetUid) {
      await saveUserApplication(targetUid, app);
    } else if (authStatus === 'demo_mode') {
      saveStoredApplications([app, ...applications]);
    }
    setApplications((prev) => [app, ...prev]);
    showToast(`Application for ${app.company} saved.`, 'success');
  };

  const handleUpdateApplication = async (app: JobApplication) => {
    const targetUid = currentUser?.uid || auth.currentUser?.uid;
    if (authStatus === 'authenticated' && targetUid) {
      await saveUserApplication(targetUid, app);
    } else if (authStatus === 'demo_mode') {
      saveStoredApplications(applications.map((a) => (a.id === app.id ? app : a)));
    }
    setApplications((prev) => prev.map((a) => (a.id === app.id ? app : a)));
    showToast(`Application for ${app.company} updated.`, 'success');
  };

  const handleDeleteApplication = async (id: string) => {
    const targetUid = currentUser?.uid || auth.currentUser?.uid;
    if (authStatus === 'authenticated' && targetUid) {
      try {
        await deleteUserApplication(targetUid, id);
        setApplications((prev) => prev.filter((a) => a.id !== id));
        showToast('Application deleted.', 'success');
      } catch (err: any) {
        console.error('Failed to delete application from Firestore:', err);
        showToast(err?.message || 'Failed to delete application.', 'error');
        throw err;
      }
    } else if (authStatus === 'demo_mode') {
      const updated = applications.filter((a) => a.id !== id);
      setApplications(updated);
      saveStoredApplications(updated);
      showToast('Application deleted.', 'success');
    }
  };

  // Core CS Actions
  const handleToggleCSTopic = async (subjectId: string, topicId: string) => {
    const prev = coreCSSubjects;
    let newCompletedTopicIds: string[] = [];

    const updated = coreCSSubjects.map((subject) => {
      if (subject.id === subjectId) {
        const nextTopics = subject.topics.map((t) =>
          t.id === topicId ? { ...t, completed: !t.completed } : t
        );
        newCompletedTopicIds = nextTopics.filter((t) => t.completed).map((t) => t.id);
        return {
          ...subject,
          topics: nextTopics,
        };
      }
      return subject;
    });

    setCoreCSSubjects(updated);

    if (authStatus === 'authenticated' && currentUser) {
      try {
        await saveUserCoreCSTopicToggle(currentUser.uid, subjectId, newCompletedTopicIds);
      } catch (err: any) {
        console.error('Failed to update Core CS topic in Firestore:', err);
        setCoreCSSubjects(prev);
        showToast(err?.message || 'Failed to save topic progress. State restored.', 'error');
      }
    } else if (authStatus === 'demo_mode') {
      saveStoredCoreCS(updated);
    }
  };

  // Mock Interviews Actions
  const handleAddMock = async (newMock: Omit<MockInterview, 'id'>) => {
    const mock: MockInterview = {
      ...newMock,
      id: `mock-${Date.now()}`,
    };

    if (authStatus === 'authenticated' && currentUser) {
      await saveUserMock(currentUser.uid, mock);
    } else if (authStatus === 'demo_mode') {
      saveStoredMocks([mock, ...mocks]);
    }
    setMocks((prev) => [mock, ...prev]);
    showToast('Mock interview session recorded.', 'success');
  };

  const handleUpdateMock = async (mock: MockInterview) => {
    if (authStatus === 'authenticated' && currentUser) {
      await saveUserMock(currentUser.uid, mock);
    } else if (authStatus === 'demo_mode') {
      saveStoredMocks(mocks.map((m) => (m.id === mock.id ? mock : m)));
    }
    setMocks((prev) => prev.map((m) => (m.id === mock.id ? mock : m)));
    showToast('Mock interview record updated.', 'success');
  };

  const handleDeleteMock = async (id: string) => {
    if (authStatus === 'authenticated' && currentUser) {
      try {
        await deleteUserMock(currentUser.uid, id);
        setMocks((prev) => prev.filter((m) => m.id !== id));
        showToast('Mock interview deleted.', 'success');
      } catch (err: any) {
        console.error('Failed to delete mock interview from Firestore:', err);
        showToast(err?.message || 'Failed to delete mock interview.', 'error');
        throw err;
      }
    } else if (authStatus === 'demo_mode') {
      const updated = mocks.filter((m) => m.id !== id);
      setMocks(updated);
      saveStoredMocks(updated);
      showToast('Mock interview deleted.', 'success');
    }
  };

  // Resume Checklist Actions
  const handleToggleChecklistItem = async (id: string) => {
    const prev = checklist;
    let nextChecked = false;
    const updated = checklist.map((item) => {
      if (item.id === id) {
        nextChecked = !item.checked;
        return { ...item, checked: nextChecked };
      }
      return item;
    });
    setChecklist(updated);

    if (authStatus === 'authenticated' && currentUser) {
      try {
        await saveUserChecklistItem(currentUser.uid, id, nextChecked);
      } catch (err: any) {
        console.error('Failed to update checklist item in Firestore:', err);
        setChecklist(prev);
        showToast(err?.message || 'Failed to save checklist item. State restored.', 'error');
      }
    } else if (authStatus === 'demo_mode') {
      saveStoredChecklist(updated);
    }
  };

  const handleSetAllChecklist = async (checked: boolean) => {
    const prev = checklist;
    const updated = checklist.map((item) => ({ ...item, checked }));
    setChecklist(updated);

    if (authStatus === 'authenticated' && currentUser) {
      try {
        await saveUserAllChecklist(currentUser.uid, updated, checked);
        showToast(checked ? 'All checklist items verified.' : 'Checklist reset.', 'success');
      } catch (err: any) {
        console.error('Failed to batch save checklist in Firestore:', err);
        setChecklist(prev);
        showToast(err?.message || 'Failed to update checklist items. State restored.', 'error');
      }
    } else if (authStatus === 'demo_mode') {
      saveStoredChecklist(updated);
      showToast(checked ? 'All checklist items verified.' : 'Checklist reset.', 'success');
    }
  };

  // Quick action button in navbar
  const handleQuickAdd = () => {
    if (activeTab === 'dashboard') {
      setActiveTab('dsa');
      setIsAddModalOpen(true);
    } else {
      setIsAddModalOpen(true);
    }
  };

  // --- Render Authentication States ---

  // 1. Loading State
  if (authStatus === 'loading') {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md animate-pulse mb-4">
          <GraduationCap className="w-7 h-7" />
        </div>
        <div className="text-sm font-bold text-slate-800">Placement Prep Tracker</div>
        <div className="text-xs text-slate-400 font-mono mt-1">Connecting to Firebase Auth & Cloud Firestore...</div>
      </div>
    );
  }

  // 2. Signed Out State (Login / Register / Demo mode entry)
  if (authStatus === 'signed_out') {
    return (
      <AuthScreen
        onEnterDemoMode={handleEnterDemoMode}
        onRegisteredUnverified={(email) => {
          setUnverifiedEmail(email);
          setAuthStatus('email_unverified');
        }}
      />
    );
  }

  // 3. Email Unverified State
  if (authStatus === 'email_unverified') {
    return (
      <EmailVerificationScreen
        email={unverifiedEmail || currentUser?.email || 'your email'}
        onVerified={async () => {
          const activeUser = auth.currentUser || currentUser;
          if (activeUser) {
            setCurrentUser(activeUser);
            try {
              await activeUser.getIdToken(true);
            } catch (e) {
              console.warn('Token refresh warning:', e);
            }
            await loadUserWorkspace(activeUser);
          }
        }}
        onSignOut={handleSignOut}
      />
    );
  }

  // 4. Startup Error State (Cloud connection or Firestore read failure)
  if (authStatus === 'startup_error') {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-lg w-full p-6 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Unable to Load Placement Workspace</h2>
            <p className="text-xs text-slate-500 mt-1">
              Your account is signed in and verified, but we encountered an issue loading your workspace data from Cloud Firestore.
            </p>
          </div>

          {startupError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg text-left font-mono break-words leading-relaxed">
              {startupError}
            </div>
          )}

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
            <button
              onClick={async () => {
                const activeUser = auth.currentUser || currentUser;
                if (activeUser) {
                  setIsRetryingLoad(true);
                  await loadUserWorkspace(activeUser);
                  setIsRetryingLoad(false);
                }
              }}
              disabled={isRetryingLoad}
              className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-60 cursor-pointer"
            >
              {isRetryingLoad && <RotateCw className="w-3.5 h-3.5 animate-spin" />}
              {isRetryingLoad ? 'Retrying Connection...' : 'Retry Connection'}
            </button>
            <button
              onClick={handleEnterDemoMode}
              className="w-full sm:w-auto px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold transition-colors cursor-pointer"
            >
              Enter Demo Sandbox
            </button>
            <button
              onClick={handleSignOut}
              className="w-full sm:w-auto px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 5. Profile Incomplete State (Only for genuinely new accounts without completed profiles)
  if (authStatus === 'profile_incomplete' && currentUser) {
    return (
      <ProfileSetupScreen
        uid={currentUser.uid}
        email={currentUser.email || ''}
        initialDisplayName={currentUser.displayName}
        onProfileComplete={handleProfileComplete}
        onSignOut={handleSignOut}
      />
    );
  }

  // 6. Authenticated or Demo Mode State
  const isDemo = authStatus === 'demo_mode';

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Demo Sandbox Alert Strip */}
      {isDemo && (
        <div className="bg-amber-600 text-white text-xs py-1.5 px-4 text-center font-medium shadow-xs flex items-center justify-center gap-2">
          <span>⚠️ <strong>Demo Sandbox Mode Active:</strong> You are exploring with sample offline records. Changes will not be saved to your personal Firebase cloud account.</span>
          <button
            onClick={handleSignOut}
            className="underline font-bold hover:text-amber-100 cursor-pointer ml-1"
          >
            Sign In / Register Real Account →
          </button>
        </div>
      )}

      {/* Sidebar Rail */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        profile={profile}
        dsaProblems={dsaProblems}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
        onSignOut={handleSignOut}
        isDemo={isDemo}
      />

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col lg:pl-[260px] md:max-lg:pl-16 min-w-0 transition-all">
        {/* Assessment & Drive countdown strip */}
        <AssessmentBanner
          applications={applications}
          profile={profile}
          onNavigateToApplications={() => setActiveTab('applications')}
        />

        {/* Global Navbar */}
        <Navbar
          activeTab={activeTab}
          profile={profile}
          setIsMobileOpen={setIsMobileOpen}
          onQuickAdd={handleQuickAdd}
          onNavigateToSettings={() => setActiveTab('settings')}
          onSignOut={handleSignOut}
          isDemo={isDemo}
        />

        {/* Tab View Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <DashboardView
              dsaProblems={dsaProblems}
              tasks={tasks}
              applications={applications}
              coreCSSubjects={coreCSSubjects}
              mocks={mocks}
              checklist={checklist}
              profile={profile}
              onNavigate={setActiveTab}
              onToggleTask={handleToggleTask}
              onToggleDSA={handleToggleSolved}
            />
          )}

          {activeTab === 'dsa' && (
            <DSATrackerView
              problems={dsaProblems}
              onToggleSolved={handleToggleSolved}
              onToggleBookmark={handleToggleBookmark}
              onIncrementRevision={handleIncrementRevision}
              onAddProblem={handleAddProblem}
              onUpdateNotes={handleUpdateDSANotes}
              onDeleteProblem={handleDeleteProblem}
              isAddModalOpen={isAddModalOpen}
              setIsAddModalOpen={setIsAddModalOpen}
              onLoadTemplates={handleLoadStandardDSATemplates}
            />
          )}

          {activeTab === 'planner' && (
            <StudyPlannerView
              tasks={tasks}
              onToggleTask={handleToggleTask}
              onAddTask={handleAddTask}
              onUpdateTask={handleUpdateTask}
              onDeleteTask={handleDeleteTask}
              isAddModalOpen={isAddModalOpen}
              setIsAddModalOpen={setIsAddModalOpen}
            />
          )}

          {activeTab === 'applications' && (
            <JobApplicationsView
              applications={applications}
              onAddApplication={handleAddApplication}
              onUpdateApplication={handleUpdateApplication}
              onDeleteApplication={handleDeleteApplication}
              isAddModalOpen={isAddModalOpen}
              setIsAddModalOpen={setIsAddModalOpen}
            />
          )}

          {activeTab === 'core-cs' && (
            <CoreCSView
              subjects={coreCSSubjects}
              onToggleTopic={handleToggleCSTopic}
            />
          )}

          {activeTab === 'mocks' && (
            <MockInterviewsView
              mocks={mocks}
              onAddMock={handleAddMock}
              onUpdateMock={handleUpdateMock}
              onDeleteMock={handleDeleteMock}
              isAddModalOpen={isAddModalOpen}
              setIsAddModalOpen={setIsAddModalOpen}
            />
          )}

          {activeTab === 'resume' && (
            <ResumeChecklistView
              checklist={checklist}
              onToggleCheck={handleToggleChecklistItem}
              onSetAll={handleSetAllChecklist}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              profile={profile}
              onUpdateProfile={handleUpdateProfile}
              onDataReload={() => {}}
              onSignOut={handleSignOut}
              isDemo={isDemo}
            />
          )}
        </main>
      </div>

      {/* Floating Global Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div
            className={`px-4 py-3 rounded-lg shadow-xl border flex items-center gap-2.5 max-w-md text-xs font-medium ${
              toast.type === 'success'
                ? 'bg-slate-900 text-emerald-300 border-emerald-500/30'
                : 'bg-slate-900 text-red-300 border-red-500/30'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            )}
            <span className="flex-1 leading-snug">{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="text-slate-400 hover:text-white p-1 rounded transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
