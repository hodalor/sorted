import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { FirebaseAuthTypes } from '@react-native-firebase/auth';

import LoadingDots from '@/components/loading-dots';
import ToastBanner from '@/components/toast-banner';
import { useAuth } from '@/context/auth-context';
import {
  clearFirebasePhoneSession,
  confirmPhoneVerificationCode,
  getFirebasePhoneErrorMessage,
  requestPhoneVerification,
} from '@/lib/firebase-phone';
import { apiGet, apiPost } from '@/lib/api';

const signupDefaults = {
  countryCode: '+233',
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
  const [otpProvider, setOtpProvider] = useState<'firebase' | 'system'>('firebase');
  const [step, setStep] = useState<'login' | 'signup-phone' | 'signup-otp' | 'signup-profile'>('login');
  const [loginForm, setLoginForm] = useState({
    countryCode: '+233',
    phoneNumber: '',
    pin: '',
  });
  const [signupForm, setSignupForm] = useState(signupDefaults);
  const [countryOptions, setCountryOptions] = useState<
    { code: string; dialingCode: string; currencySymbol?: string; name: string }[]
  >([{ code: 'GH', dialingCode: '+233', currencySymbol: 'GHS', name: 'Ghana' }]);
  const [message, setMessage] = useState('');
  const [toast, setToast] = useState<{
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
  } | null>(null);
  const [authLoading, setAuthLoading] = useState({
    login: false,
    requestOtp: false,
    verifyOtp: false,
    completeSignup: false,
  });
  const phoneConfirmationRef = useRef<FirebaseAuthTypes.ConfirmationResult | null>(null);
  const otpLength = otpProvider === 'firebase' ? 6 : 4;
  const [otpCooldown, setOtpCooldown] = useState(0);

  const showToast = (
    type: 'success' | 'error' | 'warning' | 'info',
    nextMessage: string,
    title?: string
  ) => {
    setMessage(nextMessage);
    setToast({
      type,
      title:
        title ||
        {
          success: 'Success',
          error: 'Error',
          warning: 'Warning',
          info: 'Notice',
        }[type],
      message: nextMessage,
    });
  };

  const formatPhoneNumber = (countryCode: string, value: string) => {
    const trimmedValue = value.trim();

    if (!trimmedValue) {
      return '';
    }

    if (trimmedValue.startsWith('+')) {
      return trimmedValue;
    }

    const normalizedDigits = trimmedValue.replace(/\D/g, '').replace(/^0+/, '');
    return `${countryCode}${normalizedDigits}`;
  };

  useEffect(() => {
    if (!otpCooldown) {
      return undefined;
    }

    const timer = setTimeout(() => {
      setOtpCooldown((current) => Math.max(0, current - 1));
    }, 1000);

    return () => clearTimeout(timer);
  }, [otpCooldown]);

  useEffect(() => {
    if (!toast) {
      return undefined;
    }

    const timer = setTimeout(() => {
      setToast(null);
    }, 4200);

    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const [countryResponse, settingsResponse] = await Promise.all([
          apiGet('/countries'),
          apiGet('/settings/general'),
        ]);
        const enabledCountries = (countryResponse.items || []).filter(
          (item: { enabled?: boolean }) => item.enabled !== false
        );
        const provider = settingsResponse?.values?.otpProvider;

        if (provider === 'firebase' || provider === 'system') {
          setOtpProvider(provider);
        }

        if (enabledCountries.length) {
          setCountryOptions(enabledCountries);
          setLoginForm((current) => ({
            ...current,
            countryCode: enabledCountries.some(
              (item: { dialingCode: string }) => item.dialingCode === current.countryCode
            )
              ? current.countryCode
              : enabledCountries[0].dialingCode,
          }));
          setSignupForm((current) => ({
            ...current,
            countryCode: enabledCountries.some(
              (item: { dialingCode: string }) => item.dialingCode === current.countryCode
            )
              ? current.countryCode
              : enabledCountries[0].dialingCode,
          }));
        }
      } catch {
        // Keep the built-in Firebase fallback when settings are unavailable.
      }
    };

    loadSettings();
  }, []);

  const handleLogin = async () => {
    try {
      setAuthLoading((current) => ({ ...current, login: true }));
      const response = await apiPost('/auth/login', {
        phoneNumber: formatPhoneNumber(loginForm.countryCode, loginForm.phoneNumber),
        pin: loginForm.pin,
      });
      setSession(response);
      showToast('success', response.message);
      router.replace('/(tabs)');
    } catch (error) {
      showToast('error', error instanceof Error ? error.message : 'Login failed.');
    } finally {
      setAuthLoading((current) => ({ ...current, login: false }));
    }
  };

  const handleRequestOtp = async () => {
    try {
      const fullPhoneNumber = formatPhoneNumber(signupForm.countryCode, signupForm.phoneNumber);

      if (!fullPhoneNumber) {
        showToast('warning', 'Enter a phone number first.');
        return;
      }

      setAuthLoading((current) => ({ ...current, requestOtp: true }));
      if (otpProvider === 'system') {
        const response = await apiPost('/auth/request-otp', {
          phoneNumber: fullPhoneNumber,
        });
        setSignupForm((current) => ({
          ...current,
          phoneNumber: fullPhoneNumber,
          otpCode: '',
          verificationToken: '',
          otpToken: response.otpToken,
        }));
        setStep('signup-otp');
        setOtpCooldown(30);
        showToast('info', `System OTP: ${response.otpCode}`, 'OTP Ready');
        return;
      }

      phoneConfirmationRef.current = await requestPhoneVerification(fullPhoneNumber);
      setSignupForm((current) => ({
        ...current,
        phoneNumber: fullPhoneNumber,
        otpCode: '',
        verificationToken: '',
      }));
      setStep('signup-otp');
      setOtpCooldown(30);
      showToast('success', 'Verification code sent to your phone.', 'OTP Sent');
    } catch (error) {
      showToast('error', getFirebasePhoneErrorMessage(error, 'Could not request OTP.'));
    } finally {
      setAuthLoading((current) => ({ ...current, requestOtp: false }));
    }
  };

  const handleVerifyOtp = async () => {
    try {
      setAuthLoading((current) => ({ ...current, verifyOtp: true }));
      const fullPhoneNumber = formatPhoneNumber(signupForm.countryCode, signupForm.phoneNumber);

      if (otpProvider === 'system') {
        const response = await apiPost('/auth/verify-otp', {
          phoneNumber: fullPhoneNumber,
          otpToken: signupForm.otpToken,
          otpCode: signupForm.otpCode,
        });
        setSignupForm((current) => ({
          ...current,
          verificationToken: response.verificationToken,
        }));
        setStep('signup-profile');
        showToast('success', response.message, 'Phone Verified');
        return;
      }

      if (!phoneConfirmationRef.current) {
        showToast('warning', 'Request a verification code first.');
        return;
      }

      const idToken = await confirmPhoneVerificationCode(phoneConfirmationRef.current, signupForm.otpCode);
      const response = await apiPost('/auth/verify-firebase-phone', {
        idToken,
        phoneNumber: fullPhoneNumber,
      });
      setSignupForm((current) => ({
        ...current,
        phoneNumber: response.phoneNumber || fullPhoneNumber,
        verificationToken: response.verificationToken,
      }));
      setStep('signup-profile');
      showToast('success', response.message, 'Phone Verified');
    } catch (error) {
      showToast('error', getFirebasePhoneErrorMessage(error, 'Could not verify OTP.'));
    } finally {
      setAuthLoading((current) => ({ ...current, verifyOtp: false }));
    }
  };

  const handleCompleteSignup = async () => {
    try {
      setAuthLoading((current) => ({ ...current, completeSignup: true }));
      const response = await apiPost('/auth/complete-signup', {
        verificationToken: signupForm.verificationToken,
        phoneNumber: signupForm.phoneNumber,
        pin: signupForm.pin,
        name: signupForm.name,
        address: signupForm.address,
        email: signupForm.email,
      });
      setSession(response);
      showToast('success', response.message);
      phoneConfirmationRef.current = null;
      await clearFirebasePhoneSession();
      router.replace('/(tabs)');
    } catch (error) {
      showToast('error', error instanceof Error ? error.message : 'Could not finish signup.');
    } finally {
      setAuthLoading((current) => ({ ...current, completeSignup: false }));
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <ToastBanner toast={toast} onClose={() => setToast(null)} />
        <Text style={styles.eyebrow}>Sorted</Text>
        <Text style={styles.title}>
          {step === 'login' ? 'Login' : step === 'signup-phone' ? 'Sign up' : 'Create account'}
        </Text>

        {step === 'login' ? (
          <View style={styles.form}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.codeRow}>
              {countryOptions.map((country) => {
                const active = loginForm.countryCode === country.dialingCode;

                return (
                  <TouchableOpacity
                    key={`${country.code}-${country.dialingCode}`}
                    style={[styles.codeChip, active ? styles.codeChipActive : null]}
                    onPress={() =>
                      setLoginForm((current) => ({
                        ...current,
                        countryCode: country.dialingCode,
                      }))
                    }>
                    <Text style={[styles.codeChipText, active ? styles.codeChipTextActive : null]}>
                      {country.dialingCode}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
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
            <TouchableOpacity
              style={[styles.primaryButton, authLoading.login ? styles.disabledButton : null]}
              onPress={handleLogin}
              disabled={authLoading.login}>
              {authLoading.login ? (
                <View style={styles.buttonContent}>
                  <LoadingDots />
                  <Text style={styles.primaryButtonText}>Logging in</Text>
                </View>
              ) : (
                <Text style={styles.primaryButtonText}>Login</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton} onPress={() => setStep('signup-phone')}>
              <Text style={styles.secondaryButtonText}>Sign up</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {step === 'signup-phone' ? (
          <View style={styles.form}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.codeRow}>
              {countryOptions.map((country) => {
                const active = signupForm.countryCode === country.dialingCode;

                return (
                  <TouchableOpacity
                    key={`${country.code}-${country.dialingCode}`}
                    style={[styles.codeChip, active ? styles.codeChipActive : null]}
                    onPress={() =>
                      setSignupForm((current) => ({
                        ...current,
                        countryCode: country.dialingCode,
                      }))
                    }>
                    <Text style={[styles.codeChipText, active ? styles.codeChipTextActive : null]}>
                      {country.dialingCode}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <TextInput
              value={signupForm.phoneNumber}
              onChangeText={(phoneNumber) => setSignupForm((current) => ({ ...current, phoneNumber }))}
              style={styles.input}
              placeholder="Phone number"
              placeholderTextColor="#64748b"
              keyboardType="phone-pad"
            />
            <TouchableOpacity
              style={[styles.primaryButton, authLoading.requestOtp ? styles.disabledButton : null]}
              onPress={handleRequestOtp}
              disabled={authLoading.requestOtp}>
              {authLoading.requestOtp ? (
                <View style={styles.buttonContent}>
                  <LoadingDots />
                  <Text style={styles.primaryButtonText}>
                    {otpProvider === 'firebase' ? 'Sending OTP' : 'Generating OTP'}
                  </Text>
                </View>
              ) : (
                <Text style={styles.primaryButtonText}>Request OTP</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton} onPress={() => setStep('login')}>
              <Text style={styles.secondaryButtonText}>Back to login</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {step === 'signup-otp' ? (
          <View style={styles.form}>
            <TextInput
              value={signupForm.otpCode}
              onChangeText={(otpCode) => setSignupForm((current) => ({ ...current, otpCode }))}
              style={styles.input}
              placeholder={`Enter ${otpLength}-digit OTP`}
              placeholderTextColor="#64748b"
              keyboardType="number-pad"
              maxLength={otpLength}
              autoComplete="sms-otp"
            />
            <TouchableOpacity
              style={[styles.primaryButton, authLoading.verifyOtp ? styles.disabledButton : null]}
              onPress={handleVerifyOtp}
              disabled={authLoading.verifyOtp}>
              {authLoading.verifyOtp ? (
                <View style={styles.buttonContent}>
                  <LoadingDots />
                  <Text style={styles.primaryButtonText}>Verifying phone</Text>
                </View>
              ) : (
                <Text style={styles.primaryButtonText}>Verify phone</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.secondaryButton, otpCooldown > 0 || authLoading.requestOtp ? styles.disabledButton : null]}
              onPress={handleRequestOtp}
              disabled={otpCooldown > 0 || authLoading.requestOtp}>
              {authLoading.requestOtp ? (
                <View style={styles.buttonContent}>
                  <LoadingDots />
                  <Text style={styles.secondaryButtonText}>
                    {otpProvider === 'firebase' ? 'Sending OTP' : 'Generating OTP'}
                  </Text>
                </View>
              ) : (
                <Text style={styles.secondaryButtonText}>
                  {otpCooldown > 0 ? `Resend OTP in ${otpCooldown}s` : 'Resend OTP'}
                </Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => {
                phoneConfirmationRef.current = null;
                setOtpCooldown(0);
                setSignupForm((current) => ({
                  ...current,
                  otpCode: '',
                  otpToken: '',
                  verificationToken: '',
                }));
                setStep('signup-phone');
              }}>
              <Text style={styles.secondaryButtonText}>Back</Text>
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
            <TouchableOpacity
              style={[styles.primaryButton, authLoading.completeSignup ? styles.disabledButton : null]}
              onPress={handleCompleteSignup}
              disabled={authLoading.completeSignup}>
              {authLoading.completeSignup ? (
                <View style={styles.buttonContent}>
                  <LoadingDots />
                  <Text style={styles.primaryButtonText}>Finishing signup</Text>
                </View>
              ) : (
                <Text style={styles.primaryButtonText}>Finish signup</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : null}

        {message ? <Text style={styles.message}>{message}</Text> : null}
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
  form: {
    gap: 12,
  },
  codeRow: {
    gap: 10,
  },
  codeChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.24)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  codeChipActive: {
    borderColor: 'rgba(245, 158, 11, 0.4)',
    backgroundColor: 'rgba(245, 158, 11, 0.14)',
  },
  codeChipText: {
    color: '#cbd5e1',
    fontWeight: '700',
  },
  codeChipTextActive: {
    color: '#fde68a',
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
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  disabledButton: {
    opacity: 0.7,
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
