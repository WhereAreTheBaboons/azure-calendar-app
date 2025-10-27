// File: api/config/index.js
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
// You need to set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY
// as Application Settings in your Azure Static Web App configuration.
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
  });
}

module.exports = async function (context, req) {
  try {
    // Get user details from the request headers
    const clientPrincipalHeader = req.headers['x-ms-client-principal'];
    if (!clientPrincipalHeader) {
      return {
        status: 401,
        body: 'Unauthorized: No client principal found.',
      };
    }

    const clientPrincipal = JSON.parse(Buffer.from(clientPrincipalHeader, 'base64').toString('utf8'));
    const userId = clientPrincipal.userId;
    const userDetails = clientPrincipal.userDetails;

    // Generate a custom Firebase token
    const customToken = await admin.auth().createCustomToken(userId, { userDetails });

    // Return the custom token and other necessary config
    context.res = {
      headers: { 'Content-Type': 'application/json' },
      body: {
        customToken: customToken,
        firebaseConfig: JSON.parse(process.env.FIREBASE_CONFIG_JSON),
        appId: process.env.APP_ID
      }
    };
  } catch (error) {
    context.log.error('Error generating custom token:', error);
    context.res = {
      status: 500,
      body: { error: 'Failed to generate custom token.' },
    };
  }
};