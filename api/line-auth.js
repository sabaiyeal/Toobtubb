import admin from "firebase-admin";

// Initialize Firebase Admin SDK once
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { accessToken } = req.body;

  if (!accessToken) {
    return res.status(400).json({ error: "Missing accessToken" });
  }

  try {
    // 1. Verify the LINE access token with LINE's API
    const verifyRes = await fetch(
      `https://api.line.me/oauth2/v2.1/verify?access_token=${accessToken}`
    );
    const verifyData = await verifyRes.json();

    if (verifyData.error) {
      return res.status(401).json({ error: "Invalid LINE token", detail: verifyData });
    }

    // 2. Check the token belongs to our LINE Login channel
    if (String(verifyData.client_id) !== String(process.env.LINE_CHANNEL_ID)) {
      return res.status(401).json({ error: "Token does not belong to this app" });
    }

    // 3. Get the LINE profile (to get the real userId)
    const profileRes = await fetch("https://api.line.me/v2/profile", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!profileRes.ok) {
      return res.status(401).json({ error: "Failed to fetch LINE profile" });
    }

    const profile = await profileRes.json();
    const lineUserId = profile.userId;

    // 4. Create a Firebase custom token tied to this LINE userId
    const customToken = await admin.auth().createCustomToken(lineUserId);

    return res.status(200).json({ customToken, userId: lineUserId });
  } catch (e) {
    console.error("line-auth error:", e);
    return res.status(500).json({ error: "Internal error" });
  }
}
