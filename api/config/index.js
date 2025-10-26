// File: api/config/index.js

const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON))
  });
}

module.exports = async function (context, req) {
  try {
    const firebaseConfig = process.env.FIREBASE_CONFIG_JSON;
    const appId = process.env.APP_ID;

    if (!firebaseConfig || !appId) {
      throw new Error("Server configuration is missing.");
    }

    // Get the user's details from the /.auth/me endpoint
    const userRes = await fetch(`${req.headers['x-ms-original-url'].split('/api/')[0]}/.auth/me`);
    const userPayload = await userRes.json();
    const clientPrincipal = userPayload.clientPrincipal;

    let initialAuthToken = null;
    if (clientPrincipal) {
      const uid = clientPrincipal.userId;
      // You can add additional claims here if needed
      initialAuthToken = await admin.auth().createCustomToken(uid, {
          email: clientPrincipal.userDetails, // Or another relevant claim
          provider: clientPrincipal.identityProvider
      });
    }

    const config = {
      firebaseConfig: JSON.parse(firebaseConfig),
      appId: appId,
      initialAuthToken: initialAuthToken,
    };

    context.res = {
      headers: { 'Content-Type': 'application/json' },
      body: config
    };

  } catch (error) {
    context.res = {
      status: 500,
      body: { error: error.message }
    };
  }
};