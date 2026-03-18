import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@/firebase';
import type { AppUser } from '@/types';

export function subscribeAllUsers(callback: (users: AppUser[]) => void) {
  const q = query(collection(db, 'users'), orderBy('registeredAt', 'desc'));
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => ({ ...d.data(), uid: d.id } as AppUser)));
  });
}
