import {
  UserProfile,
  DSAProblem,
  PlannerTask,
  JobApplication,
  CoreCSSubject,
  MockInterview,
  ChecklistItem,
} from '../types';
import {
  initialProfile,
  initialDSAProblems,
  initialTasks,
  initialApplications,
  initialCoreCSSubjects,
  initialMockInterviews,
  initialChecklist,
} from '../data/initialData';

const KEYS = {
  PROFILE: 'placement_prep_profile_v1',
  DSA: 'placement_prep_dsa_v1',
  TASKS: 'placement_prep_tasks_v1',
  APPLICATIONS: 'placement_prep_applications_v1',
  CORE_CS: 'placement_prep_core_cs_v1',
  MOCKS: 'placement_prep_mocks_v1',
  CHECKLIST: 'placement_prep_checklist_v1',
};

export function getStoredProfile(): UserProfile {
  try {
    const item = localStorage.getItem(KEYS.PROFILE);
    return item ? JSON.parse(item) : initialProfile;
  } catch (err) {
    console.error('Error reading profile from localStorage', err);
    return initialProfile;
  }
}

export function saveStoredProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
  } catch (err) {
    console.error('Error saving profile', err);
  }
}

export function getStoredDSA(): DSAProblem[] {
  try {
    const item = localStorage.getItem(KEYS.DSA);
    return item ? JSON.parse(item) : initialDSAProblems;
  } catch (err) {
    console.error('Error reading DSA problems', err);
    return initialDSAProblems;
  }
}

export function saveStoredDSA(problems: DSAProblem[]): void {
  try {
    localStorage.setItem(KEYS.DSA, JSON.stringify(problems));
  } catch (err) {
    console.error('Error saving DSA problems', err);
  }
}

export function getStoredTasks(): PlannerTask[] {
  try {
    const item = localStorage.getItem(KEYS.TASKS);
    return item ? JSON.parse(item) : initialTasks;
  } catch (err) {
    console.error('Error reading tasks', err);
    return initialTasks;
  }
}

export function saveStoredTasks(tasks: PlannerTask[]): void {
  try {
    localStorage.setItem(KEYS.TASKS, JSON.stringify(tasks));
  } catch (err) {
    console.error('Error saving tasks', err);
  }
}

export function getStoredApplications(): JobApplication[] {
  try {
    const item = localStorage.getItem(KEYS.APPLICATIONS);
    return item ? JSON.parse(item) : initialApplications;
  } catch (err) {
    console.error('Error reading applications', err);
    return initialApplications;
  }
}

export function saveStoredApplications(apps: JobApplication[]): void {
  try {
    localStorage.setItem(KEYS.APPLICATIONS, JSON.stringify(apps));
  } catch (err) {
    console.error('Error saving applications', err);
  }
}

export function getStoredCoreCS(): CoreCSSubject[] {
  try {
    const item = localStorage.getItem(KEYS.CORE_CS);
    return item ? JSON.parse(item) : initialCoreCSSubjects;
  } catch (err) {
    console.error('Error reading Core CS', err);
    return initialCoreCSSubjects;
  }
}

export function saveStoredCoreCS(subjects: CoreCSSubject[]): void {
  try {
    localStorage.setItem(KEYS.CORE_CS, JSON.stringify(subjects));
  } catch (err) {
    console.error('Error saving Core CS', err);
  }
}

export function getStoredMocks(): MockInterview[] {
  try {
    const item = localStorage.getItem(KEYS.MOCKS);
    return item ? JSON.parse(item) : initialMockInterviews;
  } catch (err) {
    console.error('Error reading mocks', err);
    return initialMockInterviews;
  }
}

export function saveStoredMocks(mocks: MockInterview[]): void {
  try {
    localStorage.setItem(KEYS.MOCKS, JSON.stringify(mocks));
  } catch (err) {
    console.error('Error saving mocks', err);
  }
}

export function getStoredChecklist(): ChecklistItem[] {
  try {
    const item = localStorage.getItem(KEYS.CHECKLIST);
    return item ? JSON.parse(item) : initialChecklist;
  } catch (err) {
    console.error('Error reading checklist', err);
    return initialChecklist;
  }
}

export function saveStoredChecklist(items: ChecklistItem[]): void {
  try {
    localStorage.setItem(KEYS.CHECKLIST, JSON.stringify(items));
  } catch (err) {
    console.error('Error saving checklist', err);
  }
}

export function resetToDemoData(): void {
  try {
    localStorage.setItem(KEYS.PROFILE, JSON.stringify(initialProfile));
    localStorage.setItem(KEYS.DSA, JSON.stringify(initialDSAProblems));
    localStorage.setItem(KEYS.TASKS, JSON.stringify(initialTasks));
    localStorage.setItem(KEYS.APPLICATIONS, JSON.stringify(initialApplications));
    localStorage.setItem(KEYS.CORE_CS, JSON.stringify(initialCoreCSSubjects));
    localStorage.setItem(KEYS.MOCKS, JSON.stringify(initialMockInterviews));
    localStorage.setItem(KEYS.CHECKLIST, JSON.stringify(initialChecklist));
  } catch (err) {
    console.error('Error resetting demo data', err);
  }
}

export function exportAllData(): string {
  const data = {
    profile: getStoredProfile(),
    dsa: getStoredDSA(),
    tasks: getStoredTasks(),
    applications: getStoredApplications(),
    coreCS: getStoredCoreCS(),
    mocks: getStoredMocks(),
    checklist: getStoredChecklist(),
    exportedAt: new Date().toISOString(),
  };
  return JSON.stringify(data, null, 2);
}

export function importAllData(jsonStr: string): boolean {
  try {
    const data = JSON.parse(jsonStr);
    if (data.profile) saveStoredProfile(data.profile);
    if (data.dsa) saveStoredDSA(data.dsa);
    if (data.tasks) saveStoredTasks(data.tasks);
    if (data.applications) saveStoredApplications(data.applications);
    if (data.coreCS) saveStoredCoreCS(data.coreCS);
    if (data.mocks) saveStoredMocks(data.mocks);
    if (data.checklist) saveStoredChecklist(data.checklist);
    return true;
  } catch (err) {
    console.error('Failed to import data', err);
    return false;
  }
}

export function clearAllData(): void {
  try {
    Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
  } catch (err) {
    console.error('Error clearing data', err);
  }
}
