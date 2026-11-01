export type DSADifficulty = 'Easy' | 'Medium' | 'Hard';

export type DSAPlatform = 'LeetCode' | 'CodeStudio' | 'GeeksforGeeks' | 'InterviewBit';

export interface DSAProblem {
  id: string;
  code: string;
  title: string;
  topic: string;
  difficulty: DSADifficulty;
  solved: boolean;
  bookmarked: boolean;
  revisionsCount: number;
  platform: DSAPlatform;
  problemUrl: string;
  notes: string;
  solvedDate?: string;
  tags: string[];
}

export type TaskCategory =
  | 'DSA Sprint'
  | 'Core CS'
  | 'Aptitude & OAs'
  | 'Mock Prep'
  | 'Resume & Projects';

export type TaskPriority = 'High' | 'Medium' | 'Low';

export interface PlannerTask {
  id: string;
  title: string;
  category: TaskCategory;
  priority: TaskPriority;
  dueDate: string;
  completed: boolean;
  notes?: string;
}

export type CompanyTier =
  | '[Tier-1 / FAANG+]'
  | '[Product / 18-24 LPA]'
  | '[High-Growth / 12-18 LPA]'
  | '[Day 1 / 8-12 LPA]'
  | '[Mass / 4-7 LPA]';

export type ApplicationStatus =
  | 'Wishlist'
  | 'Applied'
  | 'OA Pending'
  | 'Technical Round'
  | 'HR Round'
  | 'Offered'
  | 'Rejected';

export interface JobApplication {
  id: string;
  company: string;
  role: string;
  ctcLpa: string;
  tier: CompanyTier;
  status: ApplicationStatus;
  appliedDate: string;
  oaOrInterviewDate?: string;
  location: string;
  notes?: string;
}

export interface InterviewQnA {
  question: string;
  answer: string;
  codeSnippet?: string;
}

export interface CSTopic {
  id: string;
  title: string;
  completed: boolean;
  importantForOA: boolean;
  summary: string;
  interviewQnA: InterviewQnA[];
}

export interface CoreCSSubject {
  id: string;
  name: string;
  code: 'OS' | 'DBMS' | 'CN' | 'OOP';
  description: string;
  topics: CSTopic[];
}

export type MockInterviewType =
  | 'DSA Round'
  | 'Core CS & System Design'
  | 'HR & Behavioral'
  | 'Full Technical Mock';

export interface MockInterview {
  id: string;
  title: string;
  type: MockInterviewType;
  date: string;
  interviewerOrPlatform: string;
  rating: number; // 1 to 5
  strengths: string;
  weaknesses: string;
  feedback: string;
  problemsAsked: string;
}

export type ChecklistCategory =
  | 'ATS & Formatting'
  | 'Contact & Profiles'
  | 'Academics'
  | 'Technical Skills'
  | 'Projects (STAR)'
  | 'Internships & Work'
  | 'Achievements & Coding';

export interface ChecklistItem {
  id: string;
  category: ChecklistCategory;
  title: string;
  description: string;
  checked: boolean;
  critical: boolean;
}

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  college: string;
  branch: string;
  year: string;
  targetCtc: string;
  placementDriveDate: string;
  dailyDsaTarget: number;
  profileComplete: boolean;
  showDemoBanner?: boolean;
  isDemoUser?: boolean;
}

export type AuthStatus =
  | 'loading'
  | 'signed_out'
  | 'email_unverified'
  | 'profile_incomplete'
  | 'startup_error'
  | 'authenticated'
  | 'demo_mode';

export type ActiveTab =
  | 'dashboard'
  | 'dsa'
  | 'planner'
  | 'applications'
  | 'core-cs'
  | 'mocks'
  | 'resume'
  | 'settings';
