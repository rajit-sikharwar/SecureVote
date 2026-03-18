export function getFirebaseError(code: string): string {
  const map: Record<string, string> = {
    'auth/user-not-found':       'No account found with this email.',
    'auth/wrong-password':       'Incorrect password.',
    'auth/invalid-credential':   'Invalid email or password.',
    'auth/too-many-requests':    'Too many attempts. Please try again later.',
    'auth/network-request-failed': 'No internet connection.',
    'auth/popup-closed-by-user': 'Sign-in popup was closed before completion.',
    'auth/unauthorized-domain':  'This domain is not authorized in Firebase Console.',
    'auth/operation-not-allowed': 'Google Sign-In is not enabled in Firebase Console.',
    'permission-denied':         'You do not have permission. Check Firestore rules.',
    'already-exists':            'You have already voted in this election.',
    'unavailable':               'Service temporarily unavailable.',
  };
  return map[code] ?? `Something went wrong (${code}). Please try again.`;
}
