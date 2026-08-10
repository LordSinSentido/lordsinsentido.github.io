import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  getDoc as getFirestoreDoc,
  query,
  orderBy,
  setDoc,
  addDoc,
  deleteDoc,
} from 'firebase/firestore';

// Public web config (safe to share, never treat as a secret).
// It comes from env vars: local .env for dev, repo variables in CI.
export const firebaseConfig = {
  apiKey: import.meta.env.PUBLIC_FIREBASE_API_KEY,
  authDomain: import.meta.env.PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.PUBLIC_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId,
);

const app = isFirebaseConfigured ? (getApps()[0] ?? initializeApp(firebaseConfig)) : null;

export const db = app ? getFirestore(app) : null;

export const auth = app ? getAuth(app) : null;

export async function getCollection<T>(name: string): Promise<T[]> {
  if (!db) return [];
  const q = query(collection(db, name), orderBy('order', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => doc.data() as T);
}

export async function getDoc<T>(name: string, id: string): Promise<T | null> {
  if (!db) return null;
  const ref = doc(db, name, id);
  const snapshot = await getFirestoreDoc(ref);
  return snapshot.exists() ? (snapshot.data() as T) : null;
}

// Write helpers used by the admin CRUD page. Firestore rules require an
// authenticated user (request.auth != null) for any write.
export async function setCollectionDoc(
  name: string,
  id: string,
  data: unknown,
): Promise<void> {
  if (!db) throw new Error('Firebase is not configured.');
  await setDoc(doc(db, name, id), data);
}

export async function addCollectionDoc(
  name: string,
  data: unknown,
): Promise<string> {
  if (!db) throw new Error('Firebase is not configured.');
  const ref = await addDoc(collection(db, name), data);
  return ref.id;
}

export async function deleteCollectionDoc(name: string, id: string): Promise<void> {
  if (!db) throw new Error('Firebase is not configured.');
  await deleteDoc(doc(db, name, id));
}
