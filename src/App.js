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
  const [authStep, setAuthStep] = useState('login');
  const [activeMenu, setActiveMenu] = useState('home');
  const [loginForm, setLoginForm] = useState({
    countryCode: '+233',
    phoneNumber: '240000001',
    pin: '1234',
  });
  const [signupForm, setSignupForm] = useState(signupDefaults);
  const [countryOptions, setCountryOptions] = useState(defaultCountryOptions);
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
  const recaptchaVerifierRef = useRef(null);
  const phoneConfirmationRef = useRef(null);
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
    const loadCountries = async () => {
      try {
        const response = await apiGet('/countries');
        const enabledCountries = (response.items || []).filter((item) => item.enabled !== false);

        if (!enabledCountries.length) {
          return;
        }

        setCountryOptions(enabledCountries);
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

    loadCountries();
  }, []);

  useEffect(() => {
    if (authStep !== 'signup-phone') {
      return undefined;
    }

    let isMounted = true;

    const preloadRecaptcha = async () => {
      try {
        await renderPhoneRecaptcha('firebase-recaptcha');
      } catch (error) {
        if (isMounted) {
          setStatusMessage(getFirebasePhoneErrorMessage(error));
        }
      }
    };

    preloadRecaptcha();

    return () => {
      isMounted = false;
    };
  }, [authStep]);

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
    try {
      setAuthLoading((current) => ({ ...current, requestOtp: true }));
      const fullPhoneNumber = formatPhoneNumber(signupForm.countryCode, signupForm.phoneNumber);
      const recaptchaVerifier =
        recaptchaVerifierRef.current || (await renderPhoneRecaptcha('firebase-recaptcha'));

      recaptchaVerifierRef.current = recaptchaVerifier;
      phoneConfirmationRef.current = await sendPhoneVerificationCode(fullPhoneNumber, recaptchaVerifier);
      setAuthStep('signup-otp');
      setStatusMessage('Verification code sent to your phone.');
    } catch (error) {
      setStatusMessage(getFirebasePhoneErrorMessage(error));
    } finally {
      setAuthLoading((current) => ({ ...current, requestOtp: false }));
    }
  };

  const handleVerifyOtp = async () => {
    try {
      setAuthLoading((current) => ({ ...current, verifyOtp: true }));
      if (!phoneConfirmationRef.current) {
        setStatusMessage('Request a verification code first.');
        return;
      }

      const fullPhoneNumber = formatPhoneNumber(signupForm.countryCode, signupForm.phoneNumber);
      const idToken = await confirmPhoneVerificationCode(phoneConfirmationRef.current, signupForm.otpCode);
      const response = await apiPost('/auth/verify-firebase-phone', {
        idToken,
        phoneNumber: fullPhoneNumber,
      });

      setSignupForm((current) => ({
        ...current,
        phoneNumber: response.phoneNumber,
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
            loginForm={loginForm}
            signupForm={signupForm}
            authLoading={authLoading}
            statusMessage={statusMessage}
            onLoginChange={handleLoginChange}
            onSignupChange={handleSignupChange}
            onLogin={handleLogin}
            onRequestOtp={handleRequestOtp}
            onVerifyOtp={handleVerifyOtp}
            onCompleteSignup={handleCompleteSignup}
            onStepChange={(nextStep) => {
              if (nextStep === 'login') {
                phoneConfirmationRef.current = null;
                recaptchaVerifierRef.current = null;
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
