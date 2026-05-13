import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { FirebaseAuthTypes } from '@react-native-firebase/auth';

import { useAuth } from '@/context/auth-context';
import {
  clearFirebasePhoneSession,
  confirmPhoneVerificationCode,
  getFirebasePhoneErrorMessage,
  requestPhoneVerification,
} from '@/lib/firebase-phone';
import { apiPost } from '@/lib/api';

const signupDefaults = {
  phoneNumber: '',
  otpToken: '',
  otpCode: '',
  verificationToken: '',
  pin: '',
  name: '',
  address: '',
  email: '',
};

export default function AuthScreen() {
  const router = useRouter();
  const { setSession } = useAuth();
  const [step, setStep] = useState<'login' | 'signup-phone' | 'signup-otp' | 'signup-profile'>('login');
  const [loginForm, setLoginForm] = useState({
    phoneNumber: '+233240000001',
    pin: '1234',
  });
  const [signupForm, setSignupForm] = useState(signupDefaults);
  const [message, setMessage] = useState('Login with phone number and 4-digit PIN.');
  const phoneConfirmationRef = useRef<FirebaseAuthTypes.ConfirmationResult | null>(null);

  const handleLogin = async () => {
    try {
      const response = await apiPost('/auth/login', loginForm);
      setSession(response);
      setMessage(response.message);
      router.replace('/(tabs)');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Login failed.');
    }
  };

  const handleRequestOtp = async () => {
    try {
      phoneConfirmationRef.current = await requestPhoneVerification(signupForm.phoneNumber);
      setStep('signup-otp');
      setMessage('Verification code sent to your phone.');
    } catch (error) {
      setMessage(getFirebasePhoneErrorMessage(error, 'Could not request OTP.'));
    }
  };

  const handleVerifyOtp = async () => {
    try {
      if (!phoneConfirmationRef.current) {
        setMessage('Request a verification code first.');
        return;
      }

      const idToken = await confirmPhoneVerificationCode(phoneConfirmationRef.current, signupForm.otpCode);
      const response = await apiPost('/auth/verify-firebase-phone', {
        idToken,
        phoneNumber: signupForm.phoneNumber,
      });
      setSignupForm((current) => ({
        ...current,
        phoneNumber: response.phoneNumber,
        verificationToken: response.verificationToken,
      }));
      setStep('signup-profile');
      setMessage(response.message);
    } catch (error) {
      setMessage(getFirebasePhoneErrorMessage(error, 'Could not verify OTP.'));
    }
  };

  const handleCompleteSignup = async () => {
    try {
      const response = await apiPost('/auth/complete-signup', {
        verificationToken: signupForm.verificationToken,
        phoneNumber: signupForm.phoneNumber,
        pin: signupForm.pin,
        name: signupForm.name,
        address: signupForm.address,
        email: signupForm.email,
      });
      setSession(response);
      setMessage(response.message);
      phoneConfirmationRef.current = null;
      await clearFirebasePhoneSession();
      router.replace('/(tabs)');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not finish signup.');
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.eyebrow}>Sorted</Text>
        <Text style={styles.title}>
          {step === 'login' ? 'Login' : step === 'signup-phone' ? 'Sign up' : 'Create account'}
        </Text>
        <Text style={styles.copy}>
          Use a phone number and 4-digit PIN. New users verify phone first, then set PIN, name,
          address, and optional email.
        </Text>

        {step === 'login' ? (
          <View style={styles.form}>
            <TextInput
              value={loginForm.phoneNumber}
              onChangeText={(phoneNumber) => setLoginForm((current) => ({ ...current, phoneNumber }))}
              style={styles.input}
              placeholder="Phone number"
              placeholderTextColor="#64748b"
              keyboardType="phone-pad"
            />
            <TextInput
              value={loginForm.pin}
              onChangeText={(pin) => setLoginForm((current) => ({ ...current, pin }))}
              style={styles.input}
              placeholder="4-digit PIN"
              placeholderTextColor="#64748b"
              keyboardType="number-pad"
              secureTextEntry
              maxLength={4}
            />
            <TouchableOpacity style={styles.primaryButton} onPress={handleLogin}>
              <Text style={styles.primaryButtonText}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton} onPress={() => setStep('signup-phone')}>
              <Text style={styles.secondaryButtonText}>Sign up</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {step === 'signup-phone' ? (
          <View style={styles.form}>
            <Text style={styles.hint}>Firebase will text a verification code to this number.</Text>
            <TextInput
              value={signupForm.phoneNumber}
              onChangeText={(phoneNumber) => setSignupForm((current) => ({ ...current, phoneNumber }))}
              style={styles.input}
              placeholder="Phone number"
              placeholderTextColor="#64748b"
              keyboardType="phone-pad"
            />
            <TouchableOpacity style={styles.primaryButton} onPress={handleRequestOtp}>
              <Text style={styles.primaryButtonText}>Request OTP</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton} onPress={() => setStep('login')}>
              <Text style={styles.secondaryButtonText}>Back to login</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {step === 'signup-otp' ? (
          <View style={styles.form}>
            <Text style={styles.hint}>Enter the SMS code sent by Firebase.</Text>
            <TextInput
              value={signupForm.otpCode}
              onChangeText={(otpCode) => setSignupForm((current) => ({ ...current, otpCode }))}
              style={styles.input}
              placeholder="Enter OTP"
              placeholderTextColor="#64748b"
              keyboardType="number-pad"
              maxLength={4}
            />
            <TouchableOpacity style={styles.primaryButton} onPress={handleVerifyOtp}>
              <Text style={styles.primaryButtonText}>Verify phone</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {step === 'signup-profile' ? (
          <View style={styles.form}>
            <TextInput
              value={signupForm.pin}
              onChangeText={(pin) => setSignupForm((current) => ({ ...current, pin }))}
              style={styles.input}
              placeholder="Set 4-digit PIN"
              placeholderTextColor="#64748b"
              keyboardType="number-pad"
              secureTextEntry
              maxLength={4}
            />
            <TextInput
              value={signupForm.name}
              onChangeText={(name) => setSignupForm((current) => ({ ...current, name }))}
              style={styles.input}
              placeholder="Full name"
              placeholderTextColor="#64748b"
            />
            <TextInput
              value={signupForm.address}
              onChangeText={(address) => setSignupForm((current) => ({ ...current, address }))}
              style={styles.input}
              placeholder="Address"
              placeholderTextColor="#64748b"
            />
            <TextInput
              value={signupForm.email}
              onChangeText={(email) => setSignupForm((current) => ({ ...current, email }))}
              style={styles.input}
              placeholder="Email optional"
              placeholderTextColor="#64748b"
              keyboardType="email-address"
            />
            <TouchableOpacity style={styles.primaryButton} onPress={handleCompleteSignup}>
              <Text style={styles.primaryButtonText}>Finish signup</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        <Text style={styles.message}>{message}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#020617',
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    borderRadius: 28,
    padding: 24,
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.16)',
    gap: 16,
  },
  eyebrow: {
    color: '#94a3b8',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  title: {
    color: '#f8fafc',
    fontSize: 30,
    fontWeight: '700',
  },
  copy: {
    color: '#cbd5e1',
    lineHeight: 22,
  },
  form: {
    gap: 12,
  },
  hint: {
    color: '#cbd5e1',
    lineHeight: 20,
  },
  input: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#f8fafc',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  primaryButton: {
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#f59e0b',
  },
  primaryButtonText: {
    color: '#111827',
    fontWeight: '700',
  },
  secondaryButton: {
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.24)',
  },
  secondaryButtonText: {
    color: '#93c5fd',
    fontWeight: '700',
  },
  message: {
    color: '#cbd5e1',
    lineHeight: 21,
  },
});
