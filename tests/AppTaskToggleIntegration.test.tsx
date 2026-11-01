import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup, act } from '@testing-library/react';
import { PlannerTask, UserProfile } from '../src/types';

// Captured auth state callback
let authStateListener: ((user: any) => void) | null = null;

// Mock external Firebase configuration module
vi.mock('../src/firebase/config', () => ({
  auth: { currentUser: null },
  db: {},
  app: {},
  config: {},
  testConnection: vi.fn().mockResolvedValue(undefined),
}));

// Mock external Firebase Auth SDK
vi.mock('firebase/auth', () => ({
  onAuthStateChanged: vi.fn((_auth: any, callback: (user: any) => void) => {
    authStateListener = callback;
    return vi.fn(); // unsubscribe
  }),
  signOut: vi.fn().mockResolvedValue(undefined),
}));

// Mock external Firestore service functions
const mockSaveUserTask = vi.fn();
const mockFetchUserTasks = vi.fn();
const mockGetUserProfile = vi.fn();
const mockFetchUserDSA = vi.fn().mockResolvedValue([]);
const mockFetchUserApplications = vi.fn().mockResolvedValue([]);
const mockFetchUserCoreCS = vi.fn().mockResolvedValue([]);
const mockFetchUserMocks = vi.fn().mockResolvedValue([]);
const mockFetchUserChecklist = vi.fn().mockResolvedValue([]);

vi.mock('../src/firebase/firestoreService', () => ({
  getUserProfile: (...args: any[]) => mockGetUserProfile(...args),
  saveUserProfile: vi.fn().mockResolvedValue(undefined),
  fetchUserDSA: (...args: any[]) => mockFetchUserDSA(...args),
  saveUserDSAProblem: vi.fn().mockResolvedValue(undefined),
  deleteUserDSAProblem: vi.fn().mockResolvedValue(undefined),
  batchSaveDSAProblems: vi.fn().mockResolvedValue(undefined),
  fetchUserTasks: (...args: any[]) => mockFetchUserTasks(...args),
  saveUserTask: (...args: any[]) => mockSaveUserTask(...args),
  deleteUserTask: vi.fn().mockResolvedValue(undefined),
  fetchUserApplications: (...args: any[]) => mockFetchUserApplications(...args),
  saveUserApplication: vi.fn().mockResolvedValue(undefined),
  deleteUserApplication: vi.fn().mockResolvedValue(undefined),
  fetchUserCoreCS: (...args: any[]) => mockFetchUserCoreCS(...args),
  saveUserCoreCSTopicToggle: vi.fn().mockResolvedValue(undefined),
  fetchUserMocks: (...args: any[]) => mockFetchUserMocks(...args),
  saveUserMock: vi.fn().mockResolvedValue(undefined),
  deleteUserMock: vi.fn().mockResolvedValue(undefined),
  fetchUserChecklist: (...args: any[]) => mockFetchUserChecklist(...args),
  saveUserChecklistItem: vi.fn().mockResolvedValue(undefined),
  saveUserAllChecklist: vi.fn().mockResolvedValue(undefined),
}));

// Import the REAL App component (never duplicated)
import App from '../src/App';

describe('App.tsx Real Task-Completion Rollback Integration Test', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    authStateListener = null;
  });

  const mockUserProfile: UserProfile = {
    uid: 'student-test-uid-42',
    email: 'student@placement.test',
    name: 'Abhinav Placement Aspirant',
    college: 'Indian Institute of Technology (IIT)',
    branch: 'Computer Science & Engineering',
    year: '4th Year (Batch 2027)',
    targetCtc: '25+ LPA (Product)',
    placementDriveDate: '2026-12-01',
    dailyDsaTarget: 4,
    profileComplete: true,
  };

  const initialIncompleteTask: PlannerTask = {
    id: 'task-live-42',
    title: 'Master Topological Sort & Strongly Connected Components',
    category: 'DSA Sprint',
    priority: 'High',
    dueDate: '2026-11-15',
    completed: false,
    notes: 'Tarjan and Kosaraju algorithms.',
  };

  it('executes handleToggleTask in the real App component, verifies optimistic completion, and rolls back with an error toast on Firestore rejection', async () => {
    // 1. Setup mock workspace responses
    mockGetUserProfile.mockResolvedValue(mockUserProfile);
    mockFetchUserTasks.mockResolvedValue([initialIncompleteTask]);

    const mockFirebaseUser = {
      uid: 'student-test-uid-42',
      email: 'student@placement.test',
      emailVerified: true,
      providerData: [{ providerId: 'password' }],
      getIdToken: vi.fn().mockResolvedValue('mocked-firebase-token'),
    };

    // 2. Render the actual App component
    render(<App />);

    // Initially displays loading screen while Firebase auth is initializing
    expect(screen.getByText('Connecting to Firebase Auth & Cloud Firestore...')).toBeDefined();

    // 3. Emit authenticated user via onAuthStateChanged
    await act(async () => {
      authStateListener?.(mockFirebaseUser);
    });

    // 4. Wait for full student workspace to load into App state
    await waitFor(() => {
      expect(screen.getByText('Welcome back, Abhinav Placement Aspirant')).toBeDefined();
    });

    // 5. Navigate to Study Planner through the real Sidebar UI
    const studyPlannerNavButton = screen.getByTitle('Study Planner');
    fireEvent.click(studyPlannerNavButton);

    // Verify Study Planner view is active (task title is rendered in StudyPlannerView)
    await waitFor(() => {
      expect(
        screen.getByText('Master Topological Sort & Strongly Connected Components')
      ).toBeDefined();
    });

    // 6. Verify task is displayed with initial incomplete state
    expect(
      screen.getByText('Master Topological Sort & Strongly Connected Components')
    ).toBeDefined();
    const toggleButton = screen.getByTitle('Mark completed');
    expect(toggleButton).toBeDefined();

    // 7. Configure saveUserTask to reject via a deferred promise so we can assert the optimistic state
    let rejectSavePersistence!: (err: Error) => void;
    const persistencePromise = new Promise<void>((_, reject) => {
      rejectSavePersistence = reject;
    });
    mockSaveUserTask.mockImplementation(() => persistencePromise);

    // 8. Trigger the actual completion control in the UI (calls real handleToggleTask in App.tsx)
    fireEvent.click(toggleButton);

    // 9. VERIFICATION: Task immediately updates optimistically in the UI
    expect(screen.getByTitle('Mark incomplete')).toBeDefined();
    expect(screen.queryByTitle('Mark completed')).toBeNull();

    // Verify saveUserTask was called with user UID and optimistically updated task
    expect(mockSaveUserTask).toHaveBeenCalledTimes(1);
    expect(mockSaveUserTask).toHaveBeenCalledWith(
      'student-test-uid-42',
      expect.objectContaining({
        id: 'task-live-42',
        completed: true,
      })
    );

    // 10. Reject the write operation with a recognizable permission error
    await act(async () => {
      rejectSavePersistence(new Error('Simulated Firestore permission-denied'));
    });

    // 11. VERIFICATION: The task returns to incomplete (rollback)
    await waitFor(() => {
      expect(screen.getByTitle('Mark completed')).toBeDefined();
    });
    expect(screen.queryByTitle('Mark incomplete')).toBeNull();

    // 12. VERIFICATION: Error toast appears with the meaningful error message
    expect(screen.getByText('Simulated Firestore permission-denied')).toBeDefined();
  });
});
