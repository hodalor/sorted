import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || '',
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.REACT_APP_FIREBASE_APP_ID || '',
};

const requiredConfigKeys = Object.entries(firebaseConfig)
  .filter(([, value]) => Boolean(value))
  .map(([key]) => key);

const hasFirebaseWebConfig = requiredConfigKeys.length === Object.keys(firebaseConfig).length;

const getFirebaseApp = () => {
  if (!hasFirebaseWebConfig) {
    throw new Error(
      'Firebase web config is missing. Add the REACT_APP_FIREBASE_* values before using phone verification.'
    );
  }

  return getApps().length ? getApp() : initializeApp(firebaseConfig);
};

const getFirebaseAuthClient = () => getAuth(getFirebaseApp());

export const createPhoneRecaptchaVerifier = (containerId) =>
  new RecaptchaVerifier(getFirebaseAuthClient(), containerId, {
    size: 'normal',
  });

export const sendPhoneVerificationCode = async (phoneNumber, appVerifier) =>
  signInWithPhoneNumber(getFirebaseAuthClient(), phoneNumber, appVerifier);

export const confirmPhoneVerificationCode = async (confirmationResult, otpCode) => {
  const credential = await confirmationResult.confirm(otpCode);
  return credential.user.getIdToken();
};

export const clearFirebaseWebSession = async () => {
  if (!hasFirebaseWebConfig) {
    return;
  }

  await getFirebaseAuthClient().signOut();
};

export const isFirebaseWebReady = () => hasFirebaseWebConfig;
