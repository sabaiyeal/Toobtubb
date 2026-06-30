import { db } from "./firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  doc,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import { getCurrentUserId } from "./auth";

export interface Kick {
  id?: string;
  time: string;
  intensity: number;
  meal?: string;
}

export async function saveKick(kick: Kick): Promise<Kick | null> {
  try {
    const userId = getCurrentUserId();
    if (!userId) {
      console.error("saveKick failed: not signed in");
      return null;
    }
    const docRef = await addDoc(collection(db, "users", userId, "kicks"), kick);
    return { ...kick, id: docRef.id };
  } catch (e) {
    console.error("saveKick failed:", e);
    return null;
  }
}

export async function loadKicks(): Promise<Kick[]> {
  try {
    const userId = getCurrentUserId();
    if (!userId) {
      console.error("loadKicks failed: not signed in");
      return [];
    }
    const q = query(
      collection(db, "users", userId, "kicks"),
      orderBy("time", "asc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data() as Kick,
    }));
  } catch (e) {
    console.error("loadKicks failed:", e);
    return [];
  }
}

export async function deleteKick(kickId: string): Promise<void> {
  try {
    const userId = getCurrentUserId();
    if (!userId) {
      console.error("deleteKick failed: not signed in");
      return;
    }
    await deleteDoc(doc(db, "users", userId, "kicks", kickId));
  } catch (e) {
    console.error("deleteKick failed:", e);
  }
}

export async function saveDueDate(date: string): Promise<void> {
  try {
    const userId = getCurrentUserId();
    if (!userId) {
      console.error("saveDueDate failed: not signed in");
      return;
    }
    await setDoc(doc(db, "users", userId, "settings", "dueDate"), {
      dueDate: date,
      updatedAt: new Date().toISOString(),
    });
    localStorage.setItem("kick-counter-duedate", date);
  } catch (e) {
    console.error("saveDueDate failed:", e);
  }
}

export async function logSession(): Promise<void> {
  try {
    const userId = getCurrentUserId();
    if (!userId) {
      console.error("logSession failed: not signed in");
      return;
    }
    await setDoc(doc(db, "users", userId, "sessions", new Date().toISOString().split("T")[0]), {
      lastSeen: new Date().toISOString(),
    });
  } catch (e) {
    console.error("logSession failed:", e);
  }
}
