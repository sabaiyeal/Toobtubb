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
import liff from "@line/liff";
async function getUserId(): Promise<string> {
  let source = "unknown";
  let id = "";
  try {
    if (typeof liff !== "undefined" && liff.isLoggedIn()) {
      const profile = await liff.getProfile();
      id = profile.userId;
      source = "liff";
    }
  } catch (e) {
    console.warn("LIFF not available, falling back to localStorage");
  }
  if (!id) {
    let stored = localStorage.getItem("tubtub-user-id");
    if (!stored) {
      stored = crypto.randomUUID();
      localStorage.setItem("tubtub-user-id", stored);
    }
    id = stored;
    source = "localStorage";
  }

  // DEBUG: log to Firestore so we can inspect later
  try {
    await setDoc(doc(db, "debug_logs", `${Date.now()}_${Math.random().toString(36).slice(2,8)}`), {
      userId: id,
      source,
      liffLoggedIn: typeof liff !== "undefined" ? liff.isLoggedIn() : "liff-undefined",
      timestamp: new Date().toISOString(),
      caller: new Error().stack?.split("\n")[2]?.trim() || "unknown",
    });
  } catch (e) {
    console.warn("debug log failed", e);
  }

  return id;
}

export interface Kick {
  id?: string;
  time: string;
  intensity: number;
  meal?: string;
}

export async function saveKick(kick: Kick): Promise<Kick | null> {
  try {
    const userId = await getUserId();
    const docRef = await addDoc(collection(db, "users", userId, "kicks"), kick);
    return { ...kick, id: docRef.id };
  } catch (e) {
    console.error("saveKick failed:", e);
    return null;
  }
}


export async function loadKicks(): Promise<Kick[]> {
  try {
    const userId = await getUserId();
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
    const userId = await getUserId();
    await deleteDoc(doc(db, "users", userId, "kicks", kickId));
  } catch (e) {
    console.error("deleteKick failed:", e);
  }
}

export async function saveDueDate(date: string): Promise<void> {
  try {
    const userId = await getUserId();
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
    const userId = await getUserId();
    await setDoc(doc(db, "users", userId, "sessions", new Date().toISOString().split("T")[0]), {
      lastSeen: new Date().toISOString(),
    });
  } catch (e) {
    console.error("logSession failed:", e);
  }
}
