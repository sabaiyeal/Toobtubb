import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "tubtub-app.firebaseapp.com",
  projectId: "tubtub-app",
  storageBucket: "tubtub-app.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
