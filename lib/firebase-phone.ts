import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';

export const requestPhoneVerification = async (phoneNumber: string) => auth().signInWithPhoneNumber(phoneNumber);

export const confirmPhoneVerificationCode = async (
  confirmation: FirebaseAuthTypes.ConfirmationResult,
  otpCode: string
) => {
  const credential = await confirmation.confirm(otpCode);

  if (!credential || !credential.user) {
    throw new Error('Firebase could not confirm the phone number.');
  }

  return credential.user.getIdToken();
};

export const clearFirebasePhoneSession = async () => {
  if (!auth().currentUser) {
    return;
  }

  await auth().signOut();
};

export const getFirebasePhoneErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error) {
    if (error.message.includes('No Firebase App')) {
      return 'Firebase mobile config is missing. Add the Android and iOS Firebase files, then rebuild the app.';
    }

    if (
      error.message.includes('auth/error-code:-39') ||
      error.message.includes('Error code: 39') ||
      error.message.includes('quota-exceeded')
    ) {
      return 'Firebase phone verification is temporarily restricted for this project, number, region, or quota. Wait and try again later, or switch to system OTP in General settings.';
    }

    if (error.message.includes('invalid-verification-code')) {
      return 'The OTP code is incorrect. Check the SMS code and try again.';
    }

    if (error.message.includes('code-expired') || error.message.includes('session-expired')) {
      return 'The OTP code has expired. Request a new code and try again.';
    }

    return error.message;
  }

  return fallback;
};
