import { db } from "./firebase";
console.log("Firebase db:", db);
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore";

// userId ชั่วคราว — เดี๋ยว Step 2 จะทำ login จริงค่ะ
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

// บันทึกการดิ้น
export async function saveKick(kick: Kick): Promise<void> {
  const userId = getUserId();
  await addDoc(collection(db, "users", userId, "kicks"), kick);
}

// โหลดประวัติทั้งหมด
export async function loadKicks(): Promise<Kick[]> {
  const userId = getUserId();
  const q = query(
    collection(db, "users", userId, "kicks"),
    orderBy("time", "asc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => doc.data() as Kick);
}

// บันทึกวันกำหนดคลอด
export async function saveDueDate(date: string): Promise<void> {
  const userId = getUserId();
  await addDoc(collection(db, "users", userId, "settings"), {
    dueDate: date,
    updatedAt: new Date().toISOString(),
  });
  localStorage.setItem("kick-counter-duedate", date);
}
