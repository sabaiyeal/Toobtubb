import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB4tjjRiQ2bzxKZBQsztItIugdNH5UPIjFM",
  authDomain: "toobtubb-714e7.firebaseapp.com",
  projectId: "toobtubb-714e7",
  storageBucket: "toobtubb-714e7.firebasestorage.app",
  messagingSenderId: "402491784083",
  appId: "1:402491784083:web:896a7ec84f1f2c8a958666",
  measurementId: "G-SCXDGBG7W"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
