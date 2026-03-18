import {
  collection, query, where, onSnapshot,
  addDoc, updateDoc, deleteDoc, doc,
  serverTimestamp, orderBy, Timestamp
} from 'firebase/firestore';
import { db } from '@/firebase';
import type { Election, ElectionStatus, UserCategory } from '@/types';

// Real-time elections for voter (filtered by category)
export function subscribeElectionsForVoter(
  category: UserCategory,
  callback: (elections: Election[]) => void
) {
  const q = query(
    collection(db, 'elections'),
    where('eligibleCategories', 'array-contains', category),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, snap =>
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as Election)))
  );
}

// Real-time all elections for admin
export function subscribeAllElections(callback: (elections: Election[]) => void) {
  const q = query(collection(db, 'elections'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, snap =>
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as Election)))
  );
}

export async function createElection(data: {
  title: string; description: string;
  eligibleCategories: UserCategory[];
  startDate: Date; endDate: Date;
  status: ElectionStatus; createdBy: string;
}): Promise<string> {
  const ref = await addDoc(collection(db, 'elections'), {
    ...data,
    startDate: Timestamp.fromDate(data.startDate),
    endDate:   Timestamp.fromDate(data.endDate),
    totalVotes: 0,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateElectionStatus(
  id: string, status: ElectionStatus
): Promise<void> {
  await updateDoc(doc(db, 'elections', id), { status });
}

export async function deleteElection(id: string): Promise<void> {
  await deleteDoc(doc(db, 'elections', id));
}
