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

let recaptchaVerifierInstance = null;

const getFirebaseAuthClient = () => getAuth(getFirebaseApp());

export const createPhoneRecaptchaVerifier = (containerId, options = {}) => {
  const auth = getFirebaseAuthClient();
  recaptchaVerifierInstance = new RecaptchaVerifier(auth, containerId, {
    size: 'normal',
    ...options,
  });

  return recaptchaVerifierInstance;
};

export const renderPhoneRecaptcha = async (containerId, options = {}) => {
  resetPhoneRecaptcha();
  const verifier = createPhoneRecaptchaVerifier(containerId, options);
  await verifier.render();
  return verifier;
};

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

export const resetPhoneRecaptcha = () => {
  if (recaptchaVerifierInstance) {
    recaptchaVerifierInstance.clear();
    recaptchaVerifierInstance = null;
  }
};

export const getFirebasePhoneErrorMessage = (error) => {
  const message = error instanceof Error ? error.message : 'Could not start phone verification.';

  if (
    message.includes('network-request-failed') ||
    message.includes('ERR_TIMED_OUT') ||
    message.includes('Failed to load resource')
  ) {
    return 'reCAPTCHA could not load on this network. Disable ad blockers or privacy shields, then try again.';
  }

  if (message.includes('invalid-app-credential') || message.includes('invalid application verifier')) {
    return 'reCAPTCHA verification failed. Refresh the page and try requesting the code again.';
  }

  if (message.includes('billing-not-enabled')) {
    return 'Firebase phone auth billing is not enabled for this project. Enable billing in Firebase or Google Cloud before OTP can be sent.';
  }

  return message;
};

export const isFirebaseWebReady = () => hasFirebaseWebConfig;
