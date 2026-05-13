import { useEffect, useMemo, useState } from 'react';
import { apiGet, apiPost } from './api';
import './App.css';

const toneMap = ['gold', 'amber', 'blue', 'green', 'sky', 'lime'];

function App() {
  const [search, setSearch] = useState('');
  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState({
    name: '',
    email: 'seeker@sorted.app',
    password: 'sorted123',
  });
  const [authResult, setAuthResult] = useState(null);
  const [categories, setCategories] = useState([]);
  const [providers, setProviders] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [statusMessage, setStatusMessage] = useState('Loading services...');

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

  useEffect(() => {
    const loadData = async () => {
      try {
        const [categoryData, providerData, bookingData] = await Promise.all([
          apiGet('/services/categories'),
          apiGet('/services/providers?status=approved'),
          apiGet('/bookings?seekerEmail=seeker@sorted.app'),
        ]);

        setCategories(categoryData.items);
        setProviders(providerData.items);
        setBookings(bookingData.items);
        setStatusMessage('Live data loaded from the backend.');
      } catch (error) {
        setStatusMessage(error.message);
      }
    };

    loadData();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setAuthForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleAuth = async () => {
    try {
      const path = authMode === 'login' ? '/auth/login' : '/auth/register';
      const payload =
        authMode === 'login'
          ? { email: authForm.email, password: authForm.password }
          : {
              name: authForm.name,
              email: authForm.email,
              password: authForm.password,
              role: 'seeker',
            };

      const response = await apiPost(path, payload);
      setAuthResult(response);
      setStatusMessage(response.message);
    } catch (error) {
      setStatusMessage(error.message);
    }
  };

  const handleQuickBooking = async (provider) => {
    try {
      const response = await apiPost('/bookings', {
        serviceId: provider.serviceId || `svc-${provider.id}`,
        providerId: provider.id,
        seekerName: authResult?.user?.name || 'Demo Seeker',
        seekerEmail: authResult?.user?.email || 'seeker@sorted.app',
        date: '2026-05-20',
        time: '10:00',
      });

      setBookings((current) => [response.booking, ...current]);
      setStatusMessage(`Booked ${provider.name} successfully.`);
    } catch (error) {
      setStatusMessage(error.message);
    }
  };

  return (
    <div className="web-shell">
      <main className="mobile-frame">
        <section className="hero-card">
          <div className="hero-top">
            <div>
              <p className="eyebrow">Accra, Ghana</p>
              <h1>What do you need?</h1>
            </div>
            <div className="avatar">KO</div>
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
            <h2>Login or register</h2>
          </div>

          <div className="auth-card">
            {authMode === 'register' ? (
              <input
                name="name"
                type="text"
                placeholder="Full name"
                value={authForm.name}
                onChange={handleChange}
              />
            ) : null}
            <input
              name="email"
              type="email"
              placeholder="Email address"
              value={authForm.email}
              onChange={handleChange}
            />
            <input
              name="password"
              type="password"
              placeholder="Password"
              value={authForm.password}
              onChange={handleChange}
            />
            <div className="auth-actions">
              <button className="primary-btn" onClick={handleAuth}>
                {authMode === 'login' ? 'Login' : 'Create account'}
              </button>
              <button
                className="ghost-btn"
                onClick={() => setAuthMode((current) => (current === 'login' ? 'register' : 'login'))}>
                {authMode === 'login' ? 'Register' : 'Back to login'}
              </button>
            </div>
            <small>
              All platforms use the same backend, so your data stays in sync.
              {authResult?.user ? ` Signed in as ${authResult.user.name}.` : ''}
            </small>
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
