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
import liff from "@line/liff";

async function getUserId(): Promise<string> {
  try {
    if (typeof liff !== "undefined" && liff.isLoggedIn()) {
      const profile = await liff.getProfile();
      return profile.userId;
    }
  } catch (e) {
    console.warn("LIFF not available, falling back to localStorage");
  }
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
  const userId = await getUserId();
  await addDoc(collection(db, "users", userId, "kicks"), kick);
}

export async function loadKicks(): Promise<Kick[]> {
  const userId = await getUserId();
  const q = query(
    collection(db, "users", userId, "kicks"),
    orderBy("time", "asc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => doc.data() as Kick);
}

export async function saveDueDate(date: string): Promise<void> {
  const userId = await getUserId();
  await setDoc(doc(db, "users", userId, "settings", "dueDate"), {
    dueDate: date,
    updatedAt: new Date().toISOString(),
  });
  localStorage.setItem("kick-counter-duedate", date);
}

export async function logSession(): Promise<void> {
  const userId = await getUserId();
  await setDoc(doc(db, "users", userId, "sessions", new Date().toISOString().split("T")[0]), {
    lastSeen: new Date().toISOString(),
  });
}
