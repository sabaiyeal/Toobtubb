import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB4tjjRIq2bzxKZBQszItIugdNH5UPIjFM",
  authDomain: "toobtubb-714e7.firebaseapp.com",
  projectId: "toobtubb-714e7",
  storageBucket: "toobtubb-714e7.firebasestorage.app",
  messagingSenderId: "402491784083",
  appId: "1:402491784083:web:896a7ec84f1f2c8a958666",
  measurementId: "G-SCXDGBBG7W"
};

// เริ่มต้นเปิดการทำงานของ Firebase
const app = initializeApp(firebaseConfig);

// ส่งออกฐานข้อมูล Firestore เพื่อให้ App.tsx ดึงไปใช้บันทึกข้อมูลลูกดิ้น
export const db = getFirestore(app);
