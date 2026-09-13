import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  getDocs,
  getDocFromServer,
  Firestore,
} from 'firebase/firestore';
import {
  getAuth,
  signInAnonymously,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User,
  Auth,
} from 'firebase/auth';
import { RPPData, FirebaseUser } from '../types';
import rawConfig from '../../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: rawConfig.apiKey,
  authDomain: rawConfig.authDomain,
  projectId: rawConfig.projectId,
  storageBucket: rawConfig.storageBucket,
  messagingSenderId: rawConfig.messagingSenderId,
  appId: rawConfig.appId,
  measurementId: rawConfig.measurementId,
};

// Initialize Firebase App
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firestore with specific database ID if provided
export const db: Firestore = rawConfig.firestoreDatabaseId && rawConfig.firestoreDatabaseId !== '(default)'
  ? getFirestore(app, rawConfig.firestoreDatabaseId)
  : getFirestore(app);

// Initialize Auth
export const auth: Auth = getAuth(app);

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

/**
 * Validate connection to Firestore
 */
export async function testConnection(): Promise<boolean> {
  try {
    if (!auth.currentUser) {
      return true;
    }
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase offline mode active');
      return false;
    }
    return true;
  }
}

/**
 * Attempt anonymous sign-in if enabled, otherwise return null gracefully
 */
export async function ensureAnonymousAuth(): Promise<User | null> {
  if (auth.currentUser) {
    return auth.currentUser;
  }
  try {
    const credential = await signInAnonymously(auth);
    return credential.user;
  } catch (err: any) {
    // When anonymous auth is not enabled in Firebase Console (returns auth/admin-restricted-operation or operation-not-allowed),
    // fallback gracefully to unauthenticated local mode until user logs in with Google.
    return null;
  }
}

/**
 * Sign in with Google
 */
export async function loginWithGoogle(): Promise<User> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (err: any) {
    console.error('Failed to sign in with Google:', err);
    throw err;
  }
}

/**
 * Sign out
 */
export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

/**
 * Listen to Auth State Changes
 */
export function subscribeToAuthState(callback: (user: FirebaseUser | null) => void): () => void {
  return onAuthStateChanged(auth, (user) => {
    if (user) {
      callback({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        isAnonymous: user.isAnonymous,
      });
    } else {
      callback(null);
    }
  });
}

/**
 * Save or update RPP document in Firestore
 */
export async function saveRPPToFirestore(rpp: RPPData, userId: string, userEmail?: string): Promise<void> {
  if (!rpp.id || !userId) return;

  const docRef = doc(db, 'rpps', rpp.id);
  const dataToSave: RPPData = {
    ...rpp,
    ownerId: userId,
    authorEmail: userEmail || (rpp.authorEmail || ''),
    updatedAt: new Date().toISOString(),
  };

  await setDoc(docRef, dataToSave, { merge: true });
}

/**
 * Delete RPP document from Firestore
 */
export async function deleteRPPFromFirestore(rppId: string, userId: string): Promise<void> {
  if (!rppId || !userId) return;
  const docRef = doc(db, 'rpps', rppId);
  await deleteDoc(docRef);
}

/**
 * Subscribe to user's RPP collection in real-time
 */
export function subscribeToUserRPPs(
  userId: string,
  onSuccess: (rpps: RPPData[]) => void,
  onError?: (err: Error) => void
): () => void {
  if (!userId) {
    onSuccess([]);
    return () => {};
  }

  const q = query(collection(db, 'rpps'), where('ownerId', '==', userId));
  
  return onSnapshot(
    q,
    (snapshot) => {
      const results: RPPData[] = [];
      snapshot.forEach((docSnap) => {
        results.push(docSnap.data() as RPPData);
      });
      // Sort newest first
      results.sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime());
      onSuccess(results);
    },
    (err) => {
      console.error('Error fetching RPPs from Firestore:', err);
      if (onError) onError(err);
    }
  );
}

/**
 * Sync all local RPPs to Firestore (e.g. after sign-in or user clicks Sync)
 */
export async function syncLocalRPPsToFirestore(
  localRPPs: RPPData[],
  userId: string,
  userEmail?: string
): Promise<number> {
  if (!userId || localRPPs.length === 0) return 0;

  let count = 0;
  for (const rpp of localRPPs) {
    try {
      await saveRPPToFirestore(rpp, userId, userEmail);
      count++;
    } catch (e) {
      console.error('Failed to sync item:', rpp.id, e);
    }
  }
  return count;
}
