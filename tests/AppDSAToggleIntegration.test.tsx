import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup, act } from '@testing-library/react';
import { DSAProblem, UserProfile } from '../src/types';

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
const mockSaveUserDSAProblem = vi.fn();
const mockFetchUserDSA = vi.fn();
const mockGetUserProfile = vi.fn();
const mockFetchUserTasks = vi.fn().mockResolvedValue([]);
const mockFetchUserApplications = vi.fn().mockResolvedValue([]);
const mockFetchUserCoreCS = vi.fn().mockResolvedValue([]);
const mockFetchUserMocks = vi.fn().mockResolvedValue([]);
const mockFetchUserChecklist = vi.fn().mockResolvedValue([]);

vi.mock('../src/firebase/firestoreService', () => ({
  getUserProfile: (...args: any[]) => mockGetUserProfile(...args),
  saveUserProfile: vi.fn().mockResolvedValue(undefined),
  fetchUserDSA: (...args: any[]) => mockFetchUserDSA(...args),
  saveUserDSAProblem: (...args: any[]) => mockSaveUserDSAProblem(...args),
  deleteUserDSAProblem: vi.fn().mockResolvedValue(undefined),
  batchSaveDSAProblems: vi.fn().mockResolvedValue(undefined),
  fetchUserTasks: (...args: any[]) => mockFetchUserTasks(...args),
  saveUserTask: vi.fn().mockResolvedValue(undefined),
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

describe('App.tsx DSA Solved and Bookmark Toggle Rollback Integration Tests', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    authStateListener = null;
  });

  const mockUserProfile: UserProfile = {
    uid: 'student-test-uid-dsa',
    email: 'dsa.student@placement.test',
    name: 'DSA Aspirant',
    college: 'National Institute of Technology',
    branch: 'Computer Science',
    year: '4th Year (Batch 2027)',
    targetCtc: '25+ LPA (Product)',
    placementDriveDate: '2026-12-15',
    dailyDsaTarget: 4,
    profileComplete: true,
  };

  const initialProblem: DSAProblem = {
    id: 'dsa-prob-42',
    code: 'LC-0042',
    title: 'Trapping Rain Water',
    topic: 'Two Pointers',
    difficulty: 'Hard',
    solved: false,
    bookmarked: false,
    revisionsCount: 0,
    platform: 'LeetCode',
    problemUrl: 'https://leetcode.com/problems/trapping-rain-water',
    notes: '',
    tags: ['Two Pointers', 'Array'],
  };

  const mockFirebaseUser = {
    uid: 'student-test-uid-dsa',
    email: 'dsa.student@placement.test',
    emailVerified: true,
    providerData: [{ providerId: 'password' }],
    getIdToken: vi.fn().mockResolvedValue('mocked-firebase-token'),
  };

  it('TEST 3A: executes handleToggleSolved in App.tsx, updates optimistically, and rolls back to unsolved with error toast on Firestore write failure', async () => {
    mockGetUserProfile.mockResolvedValue(mockUserProfile);
    mockFetchUserDSA.mockResolvedValue([initialProblem]);

    render(<App />);

    // Authenticate user
    await act(async () => {
      authStateListener?.(mockFirebaseUser);
    });

    // Wait for workspace to load
    await waitFor(() => {
      expect(screen.getByText('Welcome back, DSA Aspirant')).toBeDefined();
    });

    // Navigate to DSA Tracker tab via real Sidebar UI
    const dsaNavButton = screen.getByTitle('DSA Tracker');
    fireEvent.click(dsaNavButton);

    // Verify DSA Tracker view is active and problem is displayed
    await waitFor(() => {
      expect(screen.getByText('Trapping Rain Water')).toBeDefined();
    });

    // Verify initial unsolved state
    const solveButton = screen.getByTitle('Mark solved');
    expect(solveButton).toBeDefined();

    // Prepare saveUserDSAProblem to reject via deferred promise
    let rejectSolvePersistence!: (err: Error) => void;
    const persistencePromise = new Promise<void>((_, reject) => {
      rejectSolvePersistence = reject;
    });
    mockSaveUserDSAProblem.mockImplementation(() => persistencePromise);

    // Click solve button (triggers real handleToggleSolved in App.tsx)
    fireEvent.click(solveButton);

    // 1. VERIFY OPTIMISTIC UPDATE: Button immediately becomes 'Mark unsolved'
    expect(screen.getByTitle('Mark unsolved')).toBeDefined();
    expect(screen.queryByTitle('Mark solved')).toBeNull();

    // Verify saveUserDSAProblem was called with user ID and solved=true
    expect(mockSaveUserDSAProblem).toHaveBeenCalledTimes(1);
    expect(mockSaveUserDSAProblem).toHaveBeenCalledWith(
      'student-test-uid-dsa',
      expect.objectContaining({
        id: 'dsa-prob-42',
        solved: true,
      })
    );

    // 2. Reject write operation
    await act(async () => {
      rejectSolvePersistence(new Error('Simulated Firestore permission-denied: solved write rejected'));
    });

    // 3. VERIFY ROLLBACK: Button returns to 'Mark solved'
    await waitFor(() => {
      expect(screen.getByTitle('Mark solved')).toBeDefined();
    });
    expect(screen.queryByTitle('Mark unsolved')).toBeNull();

    // 4. VERIFY ERROR TOAST
    expect(screen.getByText('Simulated Firestore permission-denied: solved write rejected')).toBeDefined();
  });

  it('TEST 3B: executes handleToggleBookmark in App.tsx, updates optimistically, and rolls back with error toast on Firestore write failure', async () => {
    mockGetUserProfile.mockResolvedValue(mockUserProfile);
    mockFetchUserDSA.mockResolvedValue([initialProblem]);

    render(<App />);

    // Authenticate user
    await act(async () => {
      authStateListener?.(mockFirebaseUser);
    });

    // Wait for workspace to load
    await waitFor(() => {
      expect(screen.getByText('Welcome back, DSA Aspirant')).toBeDefined();
    });

    // Navigate to DSA Tracker
    const dsaNavButton = screen.getByTitle('DSA Tracker');
    fireEvent.click(dsaNavButton);

    await waitFor(() => {
      expect(screen.getByText('Trapping Rain Water')).toBeDefined();
    });

    // Verify initial unbookmarked state
    const bookmarkButton = screen.getByTitle('Bookmark for revision');
    expect(bookmarkButton).toBeDefined();

    // Prepare saveUserDSAProblem to reject via deferred promise
    let rejectBookmarkPersistence!: (err: Error) => void;
    const persistencePromise = new Promise<void>((_, reject) => {
      rejectBookmarkPersistence = reject;
    });
    mockSaveUserDSAProblem.mockImplementation(() => persistencePromise);

    // Click bookmark button (triggers real handleToggleBookmark in App.tsx)
    fireEvent.click(bookmarkButton);

    // 1. VERIFY OPTIMISTIC UPDATE: Button immediately becomes 'Remove bookmark'
    expect(screen.getByTitle('Remove bookmark')).toBeDefined();
    expect(screen.queryByTitle('Bookmark for revision')).toBeNull();

    // Verify saveUserDSAProblem was called with bookmarked=true
    expect(mockSaveUserDSAProblem).toHaveBeenCalledTimes(1);
    expect(mockSaveUserDSAProblem).toHaveBeenCalledWith(
      'student-test-uid-dsa',
      expect.objectContaining({
        id: 'dsa-prob-42',
        bookmarked: true,
      })
    );

    // 2. Reject write operation
    await act(async () => {
      rejectBookmarkPersistence(new Error('Simulated Firestore permission-denied: bookmark write rejected'));
    });

    // 3. VERIFY ROLLBACK: Button returns to 'Bookmark for revision'
    await waitFor(() => {
      expect(screen.getByTitle('Bookmark for revision')).toBeDefined();
    });
    expect(screen.queryByTitle('Remove bookmark')).toBeNull();

    // 4. VERIFY ERROR TOAST
    expect(screen.getByText('Simulated Firestore permission-denied: bookmark write rejected')).toBeDefined();
  });
});
