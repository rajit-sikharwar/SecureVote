import {
  doc,
  getDoc,
  writeBatch,
  collection,
  serverTimestamp,
  increment,
  query,
  where,
  getDocs,
  orderBy,
  type FieldValue,
} from 'firebase/firestore';
import { db } from '@/firebase';
import { generateReceiptHash } from '@/lib/crypto';
import type { Vote, UserCategory } from '@/types';

export async function castVote(
  voterId: string,
  electionId: string,
  candidateId: string,
  category: UserCategory
): Promise<string> {
  const voteId = `${voterId}_${electionId}`;

  const existing = await getDoc(doc(db, 'votes', voteId));
  if (existing.exists()) throw new Error('already-exists');

  const electionSnap = await getDoc(doc(db, 'elections', electionId));
  if (!electionSnap.exists() || electionSnap.data().status !== 'active') {
    throw new Error('This election is no longer active.');
  }

  const receiptHash = await generateReceiptHash(
    voterId,
    electionId,
    candidateId
  );

  const batch = writeBatch(db);

  batch.set(doc(db, 'votes', voteId), {
    id: voteId,
    electionId,
    candidateId,
    voterId,
    category,
    castedAt: serverTimestamp(),
    receiptHash,
  } satisfies Omit<Vote, 'castedAt'> & { castedAt: FieldValue });

  batch.update(doc(db, 'candidates', candidateId), {
    voteCount: increment(1),
  });

  batch.update(doc(db, 'elections', electionId), {
    totalVotes: increment(1),
  });

  batch.set(doc(db, 'auditLogs', `${voteId}_audit`), {
    action: 'vote_cast',
    performedBy: voterId,
    targetId: electionId,
    timestamp: serverTimestamp(),
    metadata: { candidateId, category, receiptHash },
  });

  await batch.commit();

  return receiptHash;
}

export async function getUserVotes(voterId: string): Promise<Vote[]> {
  const q = query(
    collection(db, 'votes'),
    where('voterId', '==', voterId),
    orderBy('castedAt', 'desc')
  );

  const snap = await getDocs(q);

  return snap.docs.map((d) => d.data() as Vote);
}

export async function hasVoted(
  voterId: string,
  electionId: string
): Promise<boolean> {
  const snap = await getDoc(doc(db, 'votes', `${voterId}_${electionId}`));
  return snap.exists();
}
