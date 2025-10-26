// File: api/config/index.js

module.exports = async function (context, req) {
  try {
    // Retrieve the configuration from Application Settings (Environment Variables)
    const firebaseConfig = process.env.FIREBASE_CONFIG_JSON;
    const appId = process.env.APP_ID;
    const initialAuthToken = process.env.INITIAL_AUTH_TOKEN;

    if (!firebaseConfig || !appId) {
      throw new Error("Server configuration is missing.");
    }

    const config = {
      firebaseConfig: JSON.parse(firebaseConfig),
      appId: appId,
      initialAuthToken: initialAuthToken || null,
    };

    context.res = {
      // status: 200, /* Defaults to 200 */
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