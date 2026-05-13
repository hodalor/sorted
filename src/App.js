import './App.css';

const categories = [
  { name: 'Mechanic', available: 12, tone: 'gold' },
  { name: 'Electrician', available: 8, tone: 'amber' },
  { name: 'Plumber', available: 6, tone: 'blue' },
  { name: 'Barber', available: 20, tone: 'green' },
  { name: 'Cleaner', available: 9, tone: 'sky' },
  { name: 'Tailor', available: 5, tone: 'lime' },
];

const featuredProviders = [
  {
    name: 'Emmanuel Auto Works',
    service: 'Mechanic',
    rating: 4.9,
    rate: '$45/hr',
    review: 'Fast diagnosis and neat repairs.',
  },
  {
    name: 'Aisha Home Care',
    service: 'Cleaner',
    rating: 4.8,
    rate: '$22/hr',
    review: 'Very punctual and detail oriented.',
  },
  {
    name: 'Bright Spark Electric',
    service: 'Electrician',
    rating: 4.7,
    rate: '$38/hr',
    review: 'Solved the issue same day.',
  },
];

const upcomingBookings = [
  'Tomorrow, 9:00 AM with SparkFix Electrical',
  'Friday, 2:30 PM with Ama Tailoring Studio',
  'Saturday, 11:00 AM with Kwame Plumbing',
];

function App() {
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
            <input id="service-search" type="text" placeholder="Mechanic, cleaner, barber..." />
          </label>
        </section>

        <section className="section-block">
          <div className="section-heading">
            <p className="eyebrow">Account</p>
            <h2>Login or register</h2>
          </div>

          <div className="auth-card">
            <input type="email" placeholder="Email address" />
            <input type="password" placeholder="Password" />
            <div className="auth-actions">
              <button className="primary-btn">Login</button>
              <button className="ghost-btn">Register</button>
            </div>
            <small>All platforms use the same backend, so your data stays in sync.</small>
          </div>
        </section>

        <section className="section-block">
          <div className="section-heading">
            <p className="eyebrow">Services</p>
            <h2>Browse categories</h2>
          </div>

          <div className="category-grid">
            {categories.map((category) => (
              <article className={`category-card ${category.tone}`} key={category.name}>
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
            {featuredProviders.map((provider) => (
              <article className="provider-card" key={provider.name}>
                <div className="provider-head">
                  <div>
                    <strong>{provider.name}</strong>
                    <p>{provider.service}</p>
                  </div>
                  <div className="provider-rating">{provider.rating}</div>
                </div>
                <p className="provider-review">{provider.review}</p>
                <div className="provider-footer">
                  <span>{provider.rate}</span>
                  <button className="ghost-btn small">View profile</button>
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
            {upcomingBookings.map((booking) => (
              <li key={booking}>{booking}</li>
            ))}
          </ul>
        </section>

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
