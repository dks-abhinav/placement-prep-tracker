import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import defaultConfig from '../../firebase-applet-config.json';

// Safe environment accessor across Vite, Vitest, and Node runtimes
const env = (typeof import.meta !== 'undefined' && import.meta.env)
  ? import.meta.env
  : (typeof process !== 'undefined' ? process.env : {}) || {};

// Target database ID:
// In AI Studio / Cloud Run, VITE_FIREBASE_DATABASE_ID is often injected as '(default)'.
// If it is '(default)' or empty, we MUST prioritize the specific named database in defaultConfig.firestoreDatabaseId.
const envDatabaseId = (env.VITE_FIREBASE_DATABASE_ID || '').trim();
const configDatabaseId = (defaultConfig?.firestoreDatabaseId || '').trim();

const targetDatabaseId =
  envDatabaseId && envDatabaseId !== '(default)'
    ? envDatabaseId
    : configDatabaseId && configDatabaseId !== ''
    ? configDatabaseId
    : envDatabaseId || '(default)';

// Assemble configuration prioritizing env variables over JSON defaults
export const config = {
  projectId: (env.VITE_FIREBASE_PROJECT_ID || defaultConfig?.projectId || '').trim(),
  appId: (env.VITE_FIREBASE_APP_ID || defaultConfig?.appId || '').trim(),
  apiKey: (env.VITE_FIREBASE_API_KEY || defaultConfig?.apiKey || '').trim(),
  authDomain: (env.VITE_FIREBASE_AUTH_DOMAIN || defaultConfig?.authDomain || '').trim(),
  firestoreDatabaseId: targetDatabaseId,
  storageBucket: (env.VITE_FIREBASE_STORAGE_BUCKET || defaultConfig?.storageBucket || '').trim(),
  messagingSenderId: (env.VITE_FIREBASE_MESSAGING_SENDER_ID || defaultConfig?.messagingSenderId || '').trim(),
};

// Validate that required credentials exist before initializing Firebase
function validateFirebaseConfig(cfg: typeof config): void {
  const missing: string[] = [];
  if (!cfg.projectId) missing.push('VITE_FIREBASE_PROJECT_ID');
  if (!cfg.apiKey) missing.push('VITE_FIREBASE_API_KEY');
  if (!cfg.appId) missing.push('VITE_FIREBASE_APP_ID');

  if (missing.length > 0) {
    const errorMsg =
      `[Firebase Configuration Error] Missing required credentials: ${missing.join(', ')}.\n` +
      `Please provide valid values in .env or firebase-applet-config.json.`;
    console.error(errorMsg);
    throw new Error(errorMsg);
  }
}

validateFirebaseConfig(config);

// Initialize Firebase App
export const app = getApps().length === 0 ? initializeApp(config) : getApp();

/* CRITICAL: The app will break without this database ID line */
export const db = getFirestore(app, config.firestoreDatabaseId);
export const auth = getAuth(app);

// Sanitized diagnostic log (never exposes credentials, keys, or tokens)
console.info('[Firebase Config] Runtime target initialized:', {
  projectId: config.projectId,
  firestoreDatabaseId: config.firestoreDatabaseId,
  authDomain: config.authDomain,
  hasAppId: Boolean(config.appId),
});

export async function testConnection(): Promise<void> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
