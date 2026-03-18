import {
  collection, query, where, onSnapshot,
  addDoc, deleteDoc, doc, serverTimestamp, orderBy
} from 'firebase/firestore';
import { db } from '@/firebase';
import type { Candidate, UserCategory } from '@/types';

// Real-time candidates for one election + voter's category
export function subscribeCandidates(
  electionId: string,
  category: UserCategory,
  callback: (candidates: Candidate[]) => void
) {
  const q = query(
    collection(db, 'candidates'),
    where('electionId', '==', electionId),
    where('category', '==', category),   // CATEGORY ISOLATION — critical
    orderBy('addedAt', 'asc')
  );
  return onSnapshot(q, snap =>
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as Candidate)))
  );
}

// Admin: all candidates for one election
export function subscribeAllCandidatesForElection(
  electionId: string,
  callback: (candidates: Candidate[]) => void
) {
  const q = query(
    collection(db, 'candidates'),
    where('electionId', '==', electionId),
    orderBy('addedAt', 'asc')
  );
  return onSnapshot(q, snap =>
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as Candidate)))
  );
}

export async function addCandidate(data: {
  electionId: string; category: UserCategory;
  fullName: string; department: string;
  bio: string; manifesto?: string; addedBy: string; photoURL?: string;
}): Promise<string> {
  const ref = await addDoc(collection(db, 'candidates'), {
    ...data, voteCount: 0, photoURL: data.photoURL || null, addedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function deleteCandidate(id: string): Promise<void> {
  await deleteDoc(doc(db, 'candidates', id));
}
