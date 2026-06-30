import { signInWithCustomToken, onAuthStateChanged, User } from "firebase/auth";
import { auth } from "./firebase";
import liff from "@line/liff";

let signInPromise: Promise<User | null> | null = null;

async function exchangeAndSignIn(): Promise<User | null> {
  try {
    if (typeof liff === "undefined" || !liff.isLoggedIn()) {
      console.warn("LIFF not logged in, cannot authenticate with Firebase");
      return null;
    }

    const accessToken = liff.getAccessToken();
    if (!accessToken) {
      console.warn("No LINE access token available");
      return null;
    }

    const res = await fetch("/api/line-auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accessToken }),
    });

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      console.error("line-auth endpoint failed:", errBody);
      return null;
    }

    const { customToken } = await res.json();
    const userCredential = await signInWithCustomToken(auth, customToken);
    return userCredential.user;
  } catch (e) {
    console.error("exchangeAndSignIn failed:", e);
    return null;
  }
}

// Ensures sign-in happens only once, even if called from multiple places
export function ensureSignedIn(): Promise<User | null> {
  if (auth.currentUser) {
    return Promise.resolve(auth.currentUser);
  }
  if (!signInPromise) {
    signInPromise = exchangeAndSignIn();
  }
  return signInPromise;
}

export function getCurrentUserId(): string | null {
  return auth.currentUser?.uid ?? null;
}

export function waitForAuthInit(): Promise<User | null> {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
}
