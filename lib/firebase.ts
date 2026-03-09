import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  serverTimestamp,
  Firestore,
} from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import type {
  BaseProfile,
  IntentProfile,
  Company,
  RawJob,
  ScoredJob,
  JobDetail,
} from './types';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp;
let db: Firestore;

function getFirebaseApp(): FirebaseApp {
  if (!app) {
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApps()[0];
    }
  }
  return app;
}

export function getDb(): Firestore {
  if (!db) {
    db = getFirestore(getFirebaseApp());
  }
  return db;
}

// Session management
export function generateSessionId(): string {
  return uuidv4();
}

export function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  let sessionId = localStorage.getItem('jobright_session_id');
  if (!sessionId) {
    sessionId = generateSessionId();
    localStorage.setItem('jobright_session_id', sessionId);
  }
  return sessionId;
}

export function clearSession(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('jobright_session_id');
  }
}

// Database operations
export async function createSession(sessionId: string): Promise<void> {
  const firestore = getDb();
  await setDoc(doc(firestore, 'sessions', sessionId), {
    createdAt: serverTimestamp(),
    usageCount: 1,
  });
}

export async function saveBaseProfile(
  sessionId: string,
  baseProfile: BaseProfile,
  cvText: string
): Promise<void> {
  const firestore = getDb();
  await updateDoc(doc(firestore, 'sessions', sessionId), {
    baseProfile,
    cvText,
  });
}

export async function saveIntentProfile(
  sessionId: string,
  intentProfile: IntentProfile
): Promise<void> {
  const firestore = getDb();
  await updateDoc(doc(firestore, 'sessions', sessionId), {
    intentProfile,
  });
}

export async function saveCompanies(
  sessionId: string,
  companies: Company[]
): Promise<void> {
  const firestore = getDb();
  await updateDoc(doc(firestore, 'sessions', sessionId), {
    companies,
  });
}

export async function saveRawJobs(
  sessionId: string,
  rawJobs: RawJob[]
): Promise<void> {
  const firestore = getDb();
  await updateDoc(doc(firestore, 'sessions', sessionId), {
    rawJobs,
  });
}

export async function saveScoredJobs(
  sessionId: string,
  scoredJobs: ScoredJob[]
): Promise<void> {
  const firestore = getDb();
  await updateDoc(doc(firestore, 'sessions', sessionId), {
    scoredJobs,
  });
}

export async function saveJobDetail(
  sessionId: string,
  jobId: string,
  jobDetail: JobDetail
): Promise<void> {
  const firestore = getDb();
  await setDoc(
    doc(firestore, 'sessions', sessionId, 'jobDetails', jobId),
    jobDetail
  );
}

export async function getSessionData(sessionId: string) {
  const firestore = getDb();
  const snap = await getDoc(doc(firestore, 'sessions', sessionId));
  if (!snap.exists()) return null;
  return snap.data();
}

export async function getJobDetail(
  sessionId: string,
  jobId: string
): Promise<JobDetail | null> {
  const firestore = getDb();
  const snap = await getDoc(
    doc(firestore, 'sessions', sessionId, 'jobDetails', jobId)
  );
  if (!snap.exists()) return null;
  return snap.data() as JobDetail;
}

export async function ensureSession(sessionId: string): Promise<void> {
  const firestore = getDb();
  const snap = await getDoc(doc(firestore, 'sessions', sessionId));
  if (!snap.exists()) {
    await createSession(sessionId);
  }
}
