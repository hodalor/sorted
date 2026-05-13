import { useEffect, useMemo, useState } from 'react';
import { apiGet, apiPatch, apiPost } from './api';
import './App.css';

const toneMap = ['gold', 'amber', 'blue', 'green', 'sky', 'lime'];
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

function App() {
  const [authStep, setAuthStep] = useState('login');
  const [loginForm, setLoginForm] = useState({
    phoneNumber: '+233240000001',
    pin: '1234',
  });
  const [signupForm, setSignupForm] = useState(signupDefaults);
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
      const response = await apiPost('/auth/login', loginForm);
      setSession(response);
      setStatusMessage(response.message);
      setAuthStep('portal');
    } catch (error) {
      setStatusMessage(error.message);
    }
  };

  const handleRequestOtp = async () => {
    try {
      const response = await apiPost('/auth/request-otp', { phoneNumber: signupForm.phoneNumber });
      setSignupForm((current) => ({
        ...current,
        otpToken: response.otpToken,
      }));
      setAuthStep('signup-otp');
      setStatusMessage(`OTP sent. Demo code: ${response.otpCode}`);
    } catch (error) {
      setStatusMessage(error.message);
    }
  };

  const handleVerifyOtp = async () => {
    try {
      const response = await apiPost('/auth/verify-otp', {
        phoneNumber: signupForm.phoneNumber,
        otpToken: signupForm.otpToken,
        otpCode: signupForm.otpCode,
      });

      setSignupForm((current) => ({
        ...current,
        verificationToken: response.verificationToken,
      }));
      setAuthStep('signup-profile');
      setStatusMessage(response.message);
    } catch (error) {
      setStatusMessage(error.message);
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
      setStatusMessage(response.message);
      setAuthStep('portal');
    } catch (error) {
      setStatusMessage(error.message);
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
          <section className="auth-screen">
            <p className="eyebrow">Sorted</p>
            <h1>
              {authStep === 'login' ? 'Login' : authStep === 'signup-phone' ? 'Sign up' : 'Create account'}
            </h1>
            <p className="auth-copy">
              Login with your phone number and 4-digit PIN. New users verify phone first, then set PIN,
              name, address, and optional email.
            </p>

            {authStep === 'login' ? (
              <div className="auth-card">
                <input
                  name="phoneNumber"
                  type="tel"
                  placeholder="Phone number"
                  value={loginForm.phoneNumber}
                  onChange={handleLoginChange}
                />
                <input
                  name="pin"
                  type="password"
                  inputMode="numeric"
                  maxLength="4"
                  placeholder="4-digit PIN"
                  value={loginForm.pin}
                  onChange={handleLoginChange}
                />
                <button className="primary-btn full" onClick={handleLogin}>
                  Login
                </button>
                <button className="text-btn" onClick={() => setAuthStep('signup-phone')}>
                  Sign up
                </button>
              </div>
            ) : null}

            {authStep === 'signup-phone' ? (
              <div className="auth-card">
                <input
                  name="phoneNumber"
                  type="tel"
                  placeholder="Phone number"
                  value={signupForm.phoneNumber}
                  onChange={handleSignupChange}
                />
                <button className="primary-btn full" onClick={handleRequestOtp}>
                  Request OTP
                </button>
                <button className="text-btn" onClick={() => setAuthStep('login')}>
                  Back to login
                </button>
              </div>
            ) : null}

            {authStep === 'signup-otp' ? (
              <div className="auth-card">
                <input
                  name="otpCode"
                  type="text"
                  inputMode="numeric"
                  maxLength="4"
                  placeholder="Enter OTP"
                  value={signupForm.otpCode}
                  onChange={handleSignupChange}
                />
                <button className="primary-btn full" onClick={handleVerifyOtp}>
                  Verify phone
                </button>
                <button className="text-btn" onClick={() => setAuthStep('signup-phone')}>
                  Change phone number
                </button>
              </div>
            ) : null}

            {authStep === 'signup-profile' ? (
              <div className="auth-card">
                <input
                  name="pin"
                  type="password"
                  inputMode="numeric"
                  maxLength="4"
                  placeholder="Set 4-digit PIN"
                  value={signupForm.pin}
                  onChange={handleSignupChange}
                />
                <input
                  name="name"
                  type="text"
                  placeholder="Full name"
                  value={signupForm.name}
                  onChange={handleSignupChange}
                />
                <input
                  name="address"
                  type="text"
                  placeholder="Address"
                  value={signupForm.address}
                  onChange={handleSignupChange}
                />
                <input
                  name="email"
                  type="email"
                  placeholder="Email (optional)"
                  value={signupForm.email}
                  onChange={handleSignupChange}
                />
                <button className="primary-btn full" onClick={handleCompleteSignup}>
                  Finish signup
                </button>
              </div>
            ) : null}

            <p className="status-banner">{statusMessage}</p>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="web-shell">
      <main className="mobile-frame">
        <section className="hero-card">
          <div className="hero-top">
            <div>
              <p className="eyebrow">{session.user.phoneNumber}</p>
              <h1>What do you need?</h1>
            </div>
            <div className="avatar">{session.user.name.slice(0, 2).toUpperCase()}</div>
          </div>

          <label className="search-bar" htmlFor="service-search">
            <span>Search a service...</span>
            <input
              id="service-search"
              type="text"
              placeholder="Mechanic, cleaner, barber..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
        </section>

        <section className="section-block">
          <div className="section-heading">
            <p className="eyebrow">Account</p>
            <h2>{session.user.name}</h2>
          </div>

          <div className="auth-card">
            <div className="account-row">
              <strong>Address</strong>
              <span>{session.user.address}</span>
            </div>
            <div className="account-row">
              <strong>Email</strong>
              <span>{session.user.email || 'Not provided'}</span>
            </div>
            <div className="account-row">
              <strong>Booking access</strong>
              <span>{session.user.permissions.canBook ? 'Enabled' : 'Pending setup'}</span>
            </div>
            <small>Same account can book services and apply to become a provider.</small>
          </div>
        </section>

        <section className="section-block">
          <div className="section-heading">
            <p className="eyebrow">Services</p>
            <h2>Browse categories</h2>
          </div>

          <div className="category-grid">
            {categories.map((category, index) => (
              <article className={`category-card ${toneMap[index % toneMap.length]}`} key={category.name}>
                <div className="category-icon">{category.name.slice(0, 1)}</div>
                <strong>{category.name}</strong>
                <span>{category.available} available</span>
              </article>
            ))}
          </div>
        </section>

        <section className="section-block">
          <div className="section-heading">
            <p className="eyebrow">Featured</p>
            <h2>Top rated providers</h2>
          </div>

          <div className="provider-list">
            {filteredProviders.map((provider) => (
              <article className="provider-card" key={provider.name}>
                <div className="provider-head">
                  <div>
                    <strong>{provider.name}</strong>
                    <p>{provider.category}</p>
                  </div>
                  <div className="provider-rating">{provider.rating}</div>
                </div>
                <p className="provider-review">{provider.bio}</p>
                <div className="provider-footer">
                  <span>${provider.rate}/hr</span>
                  <button className="ghost-btn small" onClick={() => handleQuickBooking(provider)}>
                    Book now
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="section-block">
          <div className="section-heading">
            <p className="eyebrow">Provide service</p>
            <h2>
              {session.user.providerProfile
                ? `Provider status: ${session.user.providerProfile.status}`
                : 'Become service provider'}
            </h2>
          </div>

          {!session.user.providerProfile ? (
            <div className="provider-onboarding">
              <input
                name="businessName"
                type="text"
                placeholder="Business name"
                value={providerForm.businessName}
                onChange={handleProviderChange}
              />
              <select
                name="isRegisteredBusiness"
                value={providerForm.isRegisteredBusiness}
                onChange={handleProviderChange}>
                <option value="no">Not registered</option>
                <option value="yes">Registered business</option>
              </select>
              {providerForm.isRegisteredBusiness === 'yes' ? (
                <input
                  name="registrationNumber"
                  type="text"
                  placeholder="Registration number"
                  value={providerForm.registrationNumber}
                  onChange={handleProviderChange}
                />
              ) : null}
              <input
                name="category"
                type="text"
                placeholder="Category"
                value={providerForm.category}
                onChange={handleProviderChange}
              />
              <input
                name="serviceTitle"
                type="text"
                placeholder="Service title"
                value={providerForm.serviceTitle}
                onChange={handleProviderChange}
              />
              <input
                name="city"
                type="text"
                placeholder="City"
                value={providerForm.city}
                onChange={handleProviderChange}
              />
              <input
                name="rate"
                type="number"
                placeholder="Rate"
                value={providerForm.rate}
                onChange={handleProviderChange}
              />
              <textarea
                name="bio"
                placeholder="Short description of your services"
                value={providerForm.bio}
                onChange={handleProviderChange}
              />
              <input
                name="profilePictureUrl"
                type="text"
                placeholder="Profile picture URL"
                value={providerForm.profilePictureUrl}
                onChange={handleProviderChange}
              />
              <input
                name="workPhotoOne"
                type="text"
                placeholder="Work photo 1 URL"
                value={providerForm.workPhotoOne}
                onChange={handleProviderChange}
              />
              <input
                name="workPhotoTwo"
                type="text"
                placeholder="Work photo 2 URL"
                value={providerForm.workPhotoTwo}
                onChange={handleProviderChange}
              />
              <input
                name="workPhotoThree"
                type="text"
                placeholder="Work photo 3 URL"
                value={providerForm.workPhotoThree}
                onChange={handleProviderChange}
              />
              <input
                name="availability"
                type="text"
                placeholder="Availability list"
                value={providerForm.availability}
                onChange={handleProviderChange}
              />
              <button className="primary-btn full" onClick={handleProviderSubmit}>
                Provide service
              </button>
            </div>
          ) : null}

          {session.user.providerProfile?.status === 'pending' ? (
            <div className="provider-panel">
              <strong>KYC in review</strong>
              <p>
                Your provider profile has been submitted. You can book services now, but you cannot offer
                services until approval is complete.
              </p>
            </div>
          ) : null}

          {providerAccount?.provider?.status === 'approved' ? (
            <div className="provider-panel">
              <div className="provider-panel-header">
                <div>
                  <p className="eyebrow">Provider interface</p>
                  <h3>{providerAccount.provider.businessName}</h3>
                </div>
                <span className="pill">Approved</span>
              </div>

              <div className="provider-onboarding compact">
                <input
                  name="serviceTitle"
                  type="text"
                  placeholder="Service title"
                  value={providerEditor.serviceTitle}
                  onChange={handleProviderEditorChange}
                />
                <input
                  name="rate"
                  type="number"
                  placeholder="Rate"
                  value={providerEditor.rate}
                  onChange={handleProviderEditorChange}
                />
                <input
                  name="availability"
                  type="text"
                  placeholder="Availability"
                  value={providerEditor.availability}
                  onChange={handleProviderEditorChange}
                />
                <textarea
                  name="bio"
                  placeholder="Service description"
                  value={providerEditor.bio}
                  onChange={handleProviderEditorChange}
                />
                <button className="primary-btn full" onClick={handleProviderSettingsSave}>
                  Save provider settings
                </button>
              </div>

              <div className="provider-booking-stack">
                {providerAccount.bookings?.map((booking) => {
                  const bookingId = booking.id || booking._id;
                  return (
                    <div className="provider-booking-card" key={bookingId}>
                      <div>
                        <strong>{booking.serviceTitle}</strong>
                        <p>
                          {booking.seekerName} • {booking.date} • {booking.time}
                        </p>
                      </div>
                      <div className="provider-booking-actions">
                        <span className="pill">{booking.status}</span>
                        <button
                          className="ghost-btn small"
                          onClick={() => handleProviderBookingAction(bookingId, 'confirmed')}>
                          Accept
                        </button>
                        <button
                          className="ghost-btn small"
                          onClick={() => handleProviderBookingAction(bookingId, 'cancelled')}>
                          Reject
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}
        </section>

        <section className="section-block">
          <div className="section-heading">
            <p className="eyebrow">Bookings</p>
            <h2>Upcoming jobs</h2>
          </div>

          <ul className="booking-list">
            {bookings.map((booking) => {
              const itemKey = booking.id || booking._id;
              return (
                <li key={itemKey}>
                  {booking.date}, {booking.time} with {booking.providerName}
                </li>
              );
            })}
          </ul>
        </section>

        <p className="status-banner">{statusMessage}</p>

        <nav className="bottom-nav" aria-label="Primary">
          <button className="nav-link active">Home</button>
          <button className="nav-link">My jobs</button>
          <button className="nav-link">Messages</button>
          <button className="nav-link">Profile</button>
        </nav>
      </main>
    </div>
  );
}

export default App;
