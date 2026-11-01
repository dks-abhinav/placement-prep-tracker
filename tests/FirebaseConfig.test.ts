import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock Firebase SDK modules so tests run completely offline and in isolation
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn((cfg: any) => ({ name: '[DEFAULT]', options: cfg })),
  getApps: vi.fn(() => []),
  getApp: vi.fn(() => ({ name: '[DEFAULT]' })),
}));

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn((app: any) => ({ app })),
}));

const mockGetFirestore = vi.fn((app: any, databaseId: string) => ({ app, databaseId }));
vi.mock('firebase/firestore', () => ({
  getFirestore: (...args: [any, string]) => mockGetFirestore(...args),
  doc: vi.fn(),
  getDocFromServer: vi.fn(),
}));

describe('Firebase Configuration Precedence & Validation', () => {
  const originalEnv = { ...process.env };

  const clearFirebaseEnv = () => {
    delete process.env.VITE_FIREBASE_PROJECT_ID;
    delete process.env.VITE_FIREBASE_APP_ID;
    delete process.env.VITE_FIREBASE_API_KEY;
    delete process.env.VITE_FIREBASE_AUTH_DOMAIN;
    delete process.env.VITE_FIREBASE_DATABASE_ID;
    delete process.env.VITE_FIREBASE_STORAGE_BUCKET;
    delete process.env.VITE_FIREBASE_MESSAGING_SENDER_ID;
  };

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    clearFirebaseEnv();
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('prioritizes an environment database ID other than "(default)" over JSON template', async () => {
    process.env.VITE_FIREBASE_PROJECT_ID = 'test-env-project';
    process.env.VITE_FIREBASE_API_KEY = 'test-env-api-key';
    process.env.VITE_FIREBASE_APP_ID = 'test-env-app-id';
    process.env.VITE_FIREBASE_DATABASE_ID = 'custom-named-db-from-env';

    vi.doMock('../firebase-applet-config.json', () => ({
      default: {
        projectId: 'json-fallback-project',
        appId: 'json-fallback-app',
        apiKey: 'json-fallback-key',
        authDomain: 'json-fallback.firebaseapp.com',
        firestoreDatabaseId: 'fallback-named-db-from-json',
      },
    }));

    const { config } = await import('../src/firebase/config');
    expect(config.projectId).toBe('test-env-project');
    expect(config.firestoreDatabaseId).toBe('custom-named-db-from-env');
    expect(mockGetFirestore).toHaveBeenCalledWith(expect.anything(), 'custom-named-db-from-env');
  });

  it('correctly falls back to configured named database ID when environment value is "(default)"', async () => {
    process.env.VITE_FIREBASE_PROJECT_ID = 'test-env-project';
    process.env.VITE_FIREBASE_API_KEY = 'test-env-api-key';
    process.env.VITE_FIREBASE_APP_ID = 'test-env-app-id';
    process.env.VITE_FIREBASE_DATABASE_ID = '(default)';

    vi.doMock('../firebase-applet-config.json', () => ({
      default: {
        projectId: 'test-env-project',
        appId: 'test-env-app-id',
        apiKey: 'test-env-api-key',
        authDomain: '',
        firestoreDatabaseId: 'named-database-from-json-template',
      },
    }));

    const { config } = await import('../src/firebase/config');
    expect(config.firestoreDatabaseId).toBe('named-database-from-json-template');
    expect(mockGetFirestore).toHaveBeenCalledWith(expect.anything(), 'named-database-from-json-template');
  });

  it('falls back to "(default)" when both environment and JSON template database IDs are empty or "(default)"', async () => {
    process.env.VITE_FIREBASE_PROJECT_ID = 'test-env-project';
    process.env.VITE_FIREBASE_API_KEY = 'test-env-api-key';
    process.env.VITE_FIREBASE_APP_ID = 'test-env-app-id';
    process.env.VITE_FIREBASE_DATABASE_ID = '(default)';

    vi.doMock('../firebase-applet-config.json', () => ({
      default: {
        projectId: '',
        appId: '',
        apiKey: '',
        authDomain: '',
        firestoreDatabaseId: '',
      },
    }));

    const { config } = await import('../src/firebase/config');
    expect(config.firestoreDatabaseId).toBe('(default)');
    expect(mockGetFirestore).toHaveBeenCalledWith(expect.anything(), '(default)');
  });

  it('prioritizes environment variables over JSON fallback values for credentials', async () => {
    process.env.VITE_FIREBASE_PROJECT_ID = 'env-override-project';
    process.env.VITE_FIREBASE_API_KEY = 'env-override-api-key';
    process.env.VITE_FIREBASE_APP_ID = 'env-override-app-id';

    vi.doMock('../firebase-applet-config.json', () => ({
      default: {
        projectId: 'json-fallback-project',
        appId: 'json-fallback-app',
        apiKey: 'json-fallback-key',
        authDomain: 'json-fallback.firebaseapp.com',
        firestoreDatabaseId: '',
      },
    }));

    const { config } = await import('../src/firebase/config');
    expect(config.projectId).toBe('env-override-project');
    expect(config.apiKey).toBe('env-override-api-key');
    expect(config.appId).toBe('env-override-app-id');
  });

  it('uses JSON configuration values when environment variables are not present', async () => {
    vi.doMock('../firebase-applet-config.json', () => ({
      default: {
        projectId: 'json-only-project',
        appId: 'json-only-app-id',
        apiKey: 'json-only-api-key',
        authDomain: 'json-only.firebaseapp.com',
        firestoreDatabaseId: 'json-named-db',
      },
    }));

    const { config } = await import('../src/firebase/config');
    expect(config.projectId).toBe('json-only-project');
    expect(config.apiKey).toBe('json-only-api-key');
    expect(config.appId).toBe('json-only-app-id');
    expect(config.firestoreDatabaseId).toBe('json-named-db');
  });

  it('validates that required credentials throw an actionable error when both env and JSON template are empty', async () => {
    vi.doMock('../firebase-applet-config.json', () => ({
      default: {
        projectId: '',
        appId: '',
        apiKey: '',
        authDomain: '',
        firestoreDatabaseId: '',
      },
    }));

    await expect(async () => {
      await import('../src/firebase/config');
    }).rejects.toThrow(/\[Firebase Configuration Error\] Missing required credentials: VITE_FIREBASE_PROJECT_ID, VITE_FIREBASE_API_KEY, VITE_FIREBASE_APP_ID/);
  });
});
