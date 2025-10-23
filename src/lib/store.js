import { db } from './firebase';
import { 
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
} from 'firebase/firestore';

export const usersCol = collection(db, 'users');
export const cardsCol = collection(db, 'cards');

export async function getUserProfile(uid) {
  const snap = await getDoc(doc(usersCol, uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function upsertUserProfile(uid, data) {
  await setDoc(doc(usersCol, uid), { ...data, updatedAt: Date.now() }, { merge: true });
}

export async function createCard(data) {
  const ref = await addDoc(cardsCol, { ...data, createdAt: Date.now() });
  return ref.id;
}

export async function updateCard(cardId, data) {
  await updateDoc(doc(cardsCol, cardId), { ...data, updatedAt: Date.now() });
}

export async function deleteCard(cardId) {
  await deleteDoc(doc(cardsCol, cardId));
}

export async function getCard(cardId) {
  const snap = await getDoc(doc(cardsCol, cardId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function listCardsByOwner(uid) {
  const q = query(cardsCol, where('ownerUid', '==', uid), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function searchCards(uid, term) {
  // Simple client-side filtering after fetching user's cards
  const items = await listCardsByOwner(uid);
  const t = term.trim().toLowerCase();
  if (!t) return items;
  return items.filter(c => {
    const hay = [c.fullName, c.company, c.jobTitle, c.email, c.phone, c.website, (c.tags||[]).join(' ')].join(' ').toLowerCase();
    return hay.includes(t);
  });
}
