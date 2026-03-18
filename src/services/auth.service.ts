import {
  signInWithRedirect,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  serverTimestamp,
  type FieldValue,
} from 'firebase/firestore';
import { auth, db, googleProvider } from '@/firebase';
import type { AppUser, UserCategory } from '@/types';

const PENDING_KEY = 'sv_google_pending';

const normalizeEmail = (email: string): string => email.trim().toLowerCase();

// ── Google Sign-In ─────────────────────────────────────────────
export async function signInWithGoogle(): Promise<void> {
  sessionStorage.setItem(PENDING_KEY, '1');
  await signInWithRedirect(auth, googleProvider);
}

export function hasGooglePending(): boolean {
  return sessionStorage.getItem(PENDING_KEY) === '1';
}

export function clearGooglePending(): void {
  sessionStorage.removeItem(PENDING_KEY);
}

/**
 * Called after redirect back from Google login
 */
export async function completeGoogleLogin(): Promise<
  { appUser: AppUser } | 'not_authenticated' | 'not_registered'
> {
  await (auth as { authStateReady?: () => Promise<void> }).authStateReady?.();

  const fu = auth.currentUser;
  if (!fu) return 'not_authenticated';

  const uid = fu.uid;
  if (!fu.email) {
    await firebaseSignOut(auth);
    return 'not_authenticated';
  }
  const email = normalizeEmail(fu.email);

  const existing = await getUserProfile(uid);
  if (existing) return { appUser: existing };

  const regSnap = await getDoc(doc(db, 'registrations', email));

  if (!regSnap.exists()) {
    await firebaseSignOut(auth);
    return 'not_registered';
  }

  const rd = regSnap.data() as {
    name: string;
    category: UserCategory;
  };

  const appUser: AppUser = {
    uid,
    name: rd.name,
    email,
    photoURL: fu.photoURL ?? undefined,
    role: 'voter',
    category: rd.category,
    registeredAt: serverTimestamp() as unknown as FieldValue,
    isActive: true,
  };

  await setDoc(doc(db, 'users', uid), appUser);
  await deleteDoc(doc(db, 'registrations', email));

  return { appUser };
}

// ── Pre-registration ───────────────────────────────────────────
export async function preRegisterVoter(
  name: string,
  email: string,
  category: UserCategory
): Promise<void> {
  const normalizedEmail = normalizeEmail(email);

  await setDoc(doc(db, 'registrations', normalizedEmail), {
    name: name.trim(),
    email: normalizedEmail,
    category,
    registeredAt: serverTimestamp(),
  });
}

// ── ADMIN LOGIN ────────────────────────────────────────────────
export async function signInAdmin(
  email: string,
  password: string
): Promise<AppUser> {
  const cred = await signInWithEmailAndPassword(auth, normalizeEmail(email), password);

  const adminDoc = await getDoc(doc(db, 'users', cred.user.uid));

  if (!adminDoc.exists() || adminDoc.data()?.role !== 'admin') {
    await firebaseSignOut(auth);
    throw new Error('Your account is not authorized as an admin.');
  }

  return {
    uid: cred.user.uid,
    name: cred.user.displayName ?? 'Admin',
    email: cred.user.email ?? '',
    role: 'admin',
    registeredAt: serverTimestamp() as unknown as FieldValue,
    isActive: true,
  };
}

// ── Helpers ────────────────────────────────────────────────────
export async function getUserProfile(uid: string): Promise<AppUser | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? (snap.data() as AppUser) : null;
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}

export function onAuthChange(cb: (user: User | null) => void) {
  return onAuthStateChanged(auth, cb);
}
