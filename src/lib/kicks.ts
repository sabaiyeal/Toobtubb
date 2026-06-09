import { db } from "./firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  doc,
  setDoc,
} from "firebase/firestore";

function getUserId(): string {
  let id = localStorage.getItem("tubtub-user-id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("tubtub-user-id", id);
  }
  return id;
}

export interface Kick {
  time: string;
  intensity: number;
  meal?: string;
}

export async function saveKick(kick: Kick): Promise<void> {
  const userId = getUserId();
  await addDoc(collection(db, "users", userId, "kicks"), kick);
}

export async function loadKicks(): Promise<Kick[]> {
  const userId = getUserId();
  const q = query(
    collection(db, "users", userId, "kicks"),
    orderBy("time", "asc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => doc.data() as Kick);
}

export async function saveDueDate(date: string): Promise<void> {
  const userId = getUserId();
  await setDoc(doc(db, "users", userId, "settings", "dueDate"), {
    dueDate: date,
    updatedAt: new Date().toISOString(),
  });
  localStorage.setItem("kick-counter-duedate", date);
}
