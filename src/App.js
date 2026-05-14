import { useEffect, useMemo, useRef, useState } from 'react';
import { apiGet, apiPatch, apiPost } from './api';
import BottomNav from './components/BottomNav';
import {
  clearFirebaseWebSession,
  confirmPhoneVerificationCode,
  getFirebasePhoneErrorMessage,
  renderPhoneRecaptcha,
  resetPhoneRecaptcha,
  sendPhoneVerificationCode,
} from './lib/firebase';
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import BookingsPage from './pages/BookingsPage';
import ProviderPage from './pages/ProviderPage';
import ProfilePage from './pages/ProfilePage';
import './styles/web.css';

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

const providerDefaults = {
  businessName: '',
  isRegisteredBusiness: 'no',
  registrationNumber: '',
  category: 'Mechanic',
  serviceTitle: '',
  city: 'Accra',
  rate: '',
  bio: '',
  profilePictureUrl: '',
  workPhotoOne: '',
  workPhotoTwo: '',
  workPhotoThree: '',
  availability: 'Mon 09:00, Tue 14:00, Thu 10:00',
};

const defaultCountryOptions = [
  { code: 'GH', dialingCode: '+233', currencySymbol: 'GHS', name: 'Ghana' },
];

function App() {
  const defaultOtpProvider = 'firebase';
  const [authStep, setAuthStep] = useState('login');
  const [activeMenu, setActiveMenu] = useState('home');
  const [loginForm, setLoginForm] = useState({
    countryCode: '+233',
    phoneNumber: '240000001',
    pin: '1234',
  });
  const [signupForm, setSignupForm] = useState(signupDefaults);
  const [countryOptions, setCountryOptions] = useState(defaultCountryOptions);
  const [authSettings, setAuthSettings] = useState({ otpProvider: defaultOtpProvider });
  const [authLoading, setAuthLoading] = useState({
    login: false,
    requestOtp: false,
    verifyOtp: false,
    completeSignup: false,
  });
  const [session, setSession] = useState(null);
  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState([]);
  const [providers, setProviders] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [providerAccount, setProviderAccount] = useState(null);
  const [providerForm, setProviderForm] = useState(providerDefaults);
  const [providerEditor, setProviderEditor] = useState({
    rate: '',
    availability: '',
    bio: '',
    serviceTitle: '',
  });
  const [statusMessage, setStatusMessage] = useState('Use phone number and 4-digit PIN to continue.');
  const [showRecaptcha, setShowRecaptcha] = useState(false);
  const [recaptchaRenderKey, setRecaptchaRenderKey] = useState(0);
  const recaptchaVerifierRef = useRef(null);
  const phoneConfirmationRef = useRef(null);
  const pendingFirebasePhoneRef = useRef('');
  const formatPhoneNumber = (countryCode, value) => {
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

  const filteredProviders = useMemo(() => {
    if (!search.trim()) {
      return providers;
    }

    const query = search.toLowerCase();
    return providers.filter(
      (provider) =>
        provider.name.toLowerCase().includes(query) || provider.category.toLowerCase().includes(query)
    );
  }, [providers, search]);

  const loadPortalData = async (activeSession) => {
    if (!activeSession?.user) {
      return;
    }

    try {
      const requests = [
        apiGet('/services/categories'),
        apiGet('/services/providers?status=approved'),
        apiGet(`/bookings?seekerPhone=${encodeURIComponent(activeSession.user.phoneNumber)}`),
      ];

      if (activeSession.user.providerProfile) {
        requests.push(apiGet(`/providers/account/${activeSession.user.id}`));
      }

      const [categoryData, providerData, bookingData, providerAccountData] = await Promise.all(requests);

      setCategories(categoryData.items);
      setProviders(providerData.items);
      setBookings(bookingData.items);
      setProviderAccount(providerAccountData || null);

      if (providerAccountData?.provider) {
        setProviderEditor({
          rate: String(providerAccountData.provider.rate || ''),
          availability: (providerAccountData.provider.availability || []).join(', '),
          bio: providerAccountData.provider.bio || '',
          serviceTitle: providerAccountData.provider.serviceTitle || '',
        });
      }

      setStatusMessage('Account synced successfully.');
    } catch (error) {
      setStatusMessage(error.message);
    }
  };

  useEffect(() => {
    if (session?.user) {
      loadPortalData(session);
    }
  }, [session]);

  useEffect(() => {
    const loadAuthSetup = async () => {
      try {
        const [countryResponse, settingsResponse] = await Promise.all([
          apiGet('/countries'),
          apiGet('/settings/general'),
        ]);
        const enabledCountries = (countryResponse.items || []).filter((item) => item.enabled !== false);
        const otpProvider = settingsResponse?.values?.otpProvider || defaultOtpProvider;

        if (!enabledCountries.length) {
          setAuthSettings({ otpProvider });
          return;
        }

        setCountryOptions(enabledCountries);
        setAuthSettings({ otpProvider });
        setLoginForm((current) => ({
          ...current,
          countryCode: enabledCountries.some((item) => item.dialingCode === current.countryCode)
            ? current.countryCode
            : enabledCountries[0].dialingCode,
        }));
        setSignupForm((current) => ({
          ...current,
          countryCode: enabledCountries.some((item) => item.dialingCode === current.countryCode)
            ? current.countryCode
            : enabledCountries[0].dialingCode,
        }));
      } catch (_error) {
        // Keep the built-in Ghana fallback if the settings endpoint is unavailable.
      }
    };

    loadAuthSetup();
  }, []);

  useEffect(() => {
    if (authStep !== 'signup-phone' || !showRecaptcha || authSettings.otpProvider !== 'firebase') {
      return undefined;
    }

    let isMounted = true;

    const waitForContainer = async () => {
      for (let attempt = 0; attempt < 10; attempt += 1) {
        const container = document.getElementById('firebase-recaptcha');

        if (container) {
          return container;
        }

        await new Promise((resolve) => window.setTimeout(resolve, 60));
      }

      return null;
    };

    const renderAndWaitForVerification = async () => {
      try {
        const container = await waitForContainer();

        if (!container) {
          throw new Error('reCAPTCHA container could not be prepared. Try again.');
        }

        const verifier = await renderPhoneRecaptcha('firebase-recaptcha', {
          callback: async () => {
            try {
              phoneConfirmationRef.current = await sendPhoneVerificationCode(
                pendingFirebasePhoneRef.current,
                recaptchaVerifierRef.current
              );

              if (!isMounted) {
                return;
              }

              setSignupForm((current) => ({
                ...current,
                phoneNumber: pendingFirebasePhoneRef.current,
                otpToken: '',
              }));
              setAuthStep('signup-otp');
              setShowRecaptcha(false);
              setStatusMessage('Verification code sent to your phone.');
            } catch (error) {
              if (isMounted) {
                setStatusMessage(getFirebasePhoneErrorMessage(error));
                setShowRecaptcha(false);
              }
            } finally {
              if (isMounted) {
                setAuthLoading((current) => ({ ...current, requestOtp: false }));
                recaptchaVerifierRef.current = null;
                resetPhoneRecaptcha();
              }
            }
          },
          'expired-callback': () => {
            if (isMounted) {
              setStatusMessage('reCAPTCHA expired. Click Request OTP again.');
              setShowRecaptcha(false);
              setAuthLoading((current) => ({ ...current, requestOtp: false }));
              recaptchaVerifierRef.current = null;
              resetPhoneRecaptcha();
            }
          },
        });

        recaptchaVerifierRef.current = verifier;
      } catch (error) {
        if (isMounted) {
          setStatusMessage(getFirebasePhoneErrorMessage(error));
          setShowRecaptcha(false);
          setAuthLoading((current) => ({ ...current, requestOtp: false }));
        }
      }
    };

    renderAndWaitForVerification();

    return () => {
      isMounted = false;
    };
  }, [authSettings.otpProvider, authStep, showRecaptcha]);

  const handleLoginChange = (event) => {
    const { name, value } = event.target;
    setLoginForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSignupChange = (event) => {
    const { name, value } = event.target;
    setSignupForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleProviderChange = (event) => {
    const { name, value } = event.target;
    setProviderForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleProviderEditorChange = (event) => {
    const { name, value } = event.target;
    setProviderEditor((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleLogin = async () => {
    try {
      setAuthLoading((current) => ({ ...current, login: true }));
      const response = await apiPost('/auth/login', {
        phoneNumber: formatPhoneNumber(loginForm.countryCode, loginForm.phoneNumber),
        pin: loginForm.pin,
      });
      setSession(response);
      setStatusMessage(response.message);
      setAuthStep('portal');
    } catch (error) {
      setStatusMessage(error.message);
    } finally {
      setAuthLoading((current) => ({ ...current, login: false }));
    }
  };

  const handleRequestOtp = async () => {
    const fullPhoneNumber = formatPhoneNumber(signupForm.countryCode, signupForm.phoneNumber);

    if (!fullPhoneNumber || fullPhoneNumber.length < 10) {
      setStatusMessage('Enter a valid phone number first.');
      return;
    }

    try {
      setAuthLoading((current) => ({ ...current, requestOtp: true }));
      setSignupForm((current) => ({
        ...current,
        phoneNumber: fullPhoneNumber,
      }));

      if (authSettings.otpProvider === 'system') {
        const response = await apiPost('/auth/request-otp', {
          phoneNumber: fullPhoneNumber,
        });

        setSignupForm((current) => ({
          ...current,
          phoneNumber: fullPhoneNumber,
          otpToken: response.otpToken,
        }));
        setAuthStep('signup-otp');
        setStatusMessage(`System OTP: ${response.otpCode}`);
        setAuthLoading((current) => ({ ...current, requestOtp: false }));
        return;
      }

      pendingFirebasePhoneRef.current = fullPhoneNumber;
      phoneConfirmationRef.current = null;
      recaptchaVerifierRef.current = null;
      resetPhoneRecaptcha();
      setRecaptchaRenderKey((current) => current + 1);
      setShowRecaptcha(true);
      setStatusMessage('Complete the reCAPTCHA below to send the OTP.');
    } catch (error) {
      setStatusMessage(getFirebasePhoneErrorMessage(error));
      setAuthLoading((current) => ({ ...current, requestOtp: false }));
    }
  };

  const handleVerifyOtp = async () => {
    try {
      setAuthLoading((current) => ({ ...current, verifyOtp: true }));
      const fullPhoneNumber = formatPhoneNumber(signupForm.countryCode, signupForm.phoneNumber);

      let response;

      if (authSettings.otpProvider === 'system') {
        response = await apiPost('/auth/verify-otp', {
          phoneNumber: fullPhoneNumber,
          otpToken: signupForm.otpToken,
          otpCode: signupForm.otpCode,
        });
      } else {
        if (!phoneConfirmationRef.current) {
          setStatusMessage('Request a verification code first.');
          return;
        }

        const idToken = await confirmPhoneVerificationCode(phoneConfirmationRef.current, signupForm.otpCode);
        response = await apiPost('/auth/verify-firebase-phone', {
          idToken,
          phoneNumber: fullPhoneNumber,
        });
      }

      setSignupForm((current) => ({
        ...current,
        phoneNumber: response.phoneNumber || fullPhoneNumber,
        verificationToken: response.verificationToken,
      }));
      setAuthStep('signup-profile');
      setStatusMessage(response.message);
    } catch (error) {
      setStatusMessage(getFirebasePhoneErrorMessage(error));
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
      setStatusMessage(response.message);
      setAuthStep('portal');
      phoneConfirmationRef.current = null;
      recaptchaVerifierRef.current = null;
      setShowRecaptcha(false);
      resetPhoneRecaptcha();
      await clearFirebaseWebSession();
    } catch (error) {
      setStatusMessage(error.message);
    } finally {
      setAuthLoading((current) => ({ ...current, completeSignup: false }));
    }
  };

  const handleQuickBooking = async (provider) => {
    try {
      if (!session?.user?.permissions?.canBook) {
        setStatusMessage('Complete account setup before booking a service.');
        return;
      }

      const response = await apiPost('/bookings', {
        serviceId: provider.serviceId,
        providerId: provider.id || provider._id,
        seekerName: session.user.name,
        seekerPhone: session.user.phoneNumber,
        seekerEmail: session.user.email,
        date: '2026-05-20',
        time: '10:00',
      });

      setBookings((current) => [response.booking, ...current]);
      setStatusMessage(`Booked ${provider.name} successfully.`);
    } catch (error) {
      setStatusMessage(error.message);
    }
  };

  const handleProviderSubmit = async () => {
    try {
      const response = await apiPost('/providers', {
        userId: session.user.id,
        name: session.user.name,
        businessName: providerForm.businessName,
        isRegisteredBusiness: providerForm.isRegisteredBusiness === 'yes',
        registrationNumber: providerForm.registrationNumber,
        category: providerForm.category,
        city: providerForm.city,
        rate: Number(providerForm.rate),
        bio: providerForm.bio,
        profilePictureUrl: providerForm.profilePictureUrl,
        workPhotos: [
          providerForm.workPhotoOne,
          providerForm.workPhotoTwo,
          providerForm.workPhotoThree,
        ].filter(Boolean),
        availability: providerForm.availability
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
        serviceTitle: providerForm.serviceTitle,
      });

      const nextSession = {
        ...session,
        user: {
          ...session.user,
          providerProfile: {
            id: response.provider.id || response.provider._id,
            businessName: response.provider.businessName,
            status: response.provider.status,
            category: response.provider.category,
            serviceTitle: response.provider.serviceTitle,
          },
          permissions: {
            ...session.user.permissions,
            hasProviderProfile: true,
            canProvide: false,
          },
        },
      };

      setSession(nextSession);
      setProviderForm(providerDefaults);
      setStatusMessage('Provider profile submitted. Wait for KYC approval before offering services.');
    } catch (error) {
      setStatusMessage(error.message);
    }
  };

  const handleProviderSettingsSave = async () => {
    try {
      if (!providerAccount?.provider) {
        return;
      }

      const providerId = providerAccount.provider.id || providerAccount.provider._id;
      const response = await apiPatch(`/providers/${providerId}/settings`, {
        rate: Number(providerEditor.rate),
        availability: providerEditor.availability
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
        bio: providerEditor.bio,
        serviceTitle: providerEditor.serviceTitle,
      });

      setProviderAccount((current) =>
        current
          ? {
              ...current,
              provider: response.provider,
            }
          : current
      );
      setStatusMessage(response.message);
    } catch (error) {
      setStatusMessage(error.message);
    }
  };

  const handleProviderBookingAction = async (bookingId, status) => {
    try {
      const response = await apiPatch(`/bookings/${bookingId}/status`, { status });
      setProviderAccount((current) =>
        current
          ? {
              ...current,
              bookings: current.bookings.map((item) =>
                (item.id || item._id) === bookingId ? response.booking : item
              ),
            }
          : current
      );
      setStatusMessage(`Booking ${status} successfully.`);
    } catch (error) {
      setStatusMessage(error.message);
    }
  };

  if (!session) {
    return (
      <div className="web-shell">
        <main className="mobile-frame auth-frame">
          <AuthPage
            authStep={authStep}
            countryOptions={countryOptions}
            otpProvider={authSettings.otpProvider}
            loginForm={loginForm}
            signupForm={signupForm}
            authLoading={authLoading}
            recaptchaRenderKey={recaptchaRenderKey}
            showRecaptcha={showRecaptcha}
            statusMessage={statusMessage}
            onLoginChange={handleLoginChange}
            onSignupChange={handleSignupChange}
            onLogin={handleLogin}
            onRequestOtp={handleRequestOtp}
            onVerifyOtp={handleVerifyOtp}
            onCompleteSignup={handleCompleteSignup}
            onStepChange={(nextStep) => {
              if (nextStep === 'login' || nextStep === 'signup-phone') {
                phoneConfirmationRef.current = null;
                recaptchaVerifierRef.current = null;
                setShowRecaptcha(false);
                setAuthLoading((current) => ({ ...current, requestOtp: false }));
                setSignupForm((current) => ({
                  ...current,
                  otpCode: '',
                  otpToken: '',
                  verificationToken: '',
                }));
                resetPhoneRecaptcha();
              }

              setAuthStep(nextStep);
            }}
          />
        </main>
      </div>
    );
  }

  const renderPage = () => {
    switch (activeMenu) {
      case 'bookings':
        return <BookingsPage bookings={bookings} />;
      case 'provider':
        return (
          <ProviderPage
            session={session}
            providerForm={providerForm}
            providerAccount={providerAccount}
            providerEditor={providerEditor}
            onProviderChange={handleProviderChange}
            onProviderEditorChange={handleProviderEditorChange}
            onSubmitProvider={handleProviderSubmit}
            onSaveProviderSettings={handleProviderSettingsSave}
            onBookingAction={handleProviderBookingAction}
          />
        );
      case 'profile':
        return <ProfilePage session={session} onLogout={() => setSession(null)} />;
      case 'home':
      default:
        return (
          <HomePage
            session={session}
            search={search}
            categories={categories}
            providers={filteredProviders}
            onSearchChange={(event) => setSearch(event.target.value)}
            onBook={handleQuickBooking}
          />
        );
    }
  };

  return (
    <div className="web-shell">
      <main className="mobile-frame">
        {renderPage()}
        <p className="status-banner">{statusMessage}</p>
        <BottomNav activeMenu={activeMenu} onChange={setActiveMenu} />
      </main>
    </div>
  );
}

export default App;
