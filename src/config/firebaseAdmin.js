const admin = require('firebase-admin');

const getFirebaseCredentials = () => {
  const { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } = process.env;

  if (!FIREBASE_PROJECT_ID || !FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY) {
    return null;
  }

  return {
    projectId: FIREBASE_PROJECT_ID,
    clientEmail: FIREBASE_CLIENT_EMAIL,
    privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  };
};

const getFirebaseAdminApp = () => {
  const credentials = getFirebaseCredentials();

  if (!credentials) {
    return null;
  }

  if (admin.apps.length) {
    return admin.app();
  }

  return admin.initializeApp({
    credential: admin.credential.cert(credentials),
  });
};

const verifyFirebaseIdToken = async (idToken) => {
  const app = getFirebaseAdminApp();

  if (!app) {
    throw new Error(
      'Firebase Admin credentials are missing. Add FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY to the backend environment.'
    );
  }

  return admin.auth(app).verifyIdToken(idToken);
};

module.exports = {
  getFirebaseAdminApp,
  verifyFirebaseIdToken,
};
