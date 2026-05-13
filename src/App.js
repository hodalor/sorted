import './App.css';

const metrics = [
  { label: 'Total bookings', value: '12.4k', delta: '+18% this month' },
  { label: 'Active providers', value: '1,284', delta: '+76 added this week' },
  { label: 'Open disputes', value: '24', delta: '6 need urgent attention' },
  { label: 'Platform revenue', value: '$48,920', delta: '+11% vs last month' },
];

const approvalQueue = [
  {
    name: 'Kwame Plumbing Services',
    category: 'Plumber',
    city: 'Accra',
    status: 'Pending KYC',
    rate: '$40/hr',
  },
  {
    name: 'Ama Beauty Studio',
    category: 'Barber',
    city: 'Tema',
    status: 'Pending portfolio review',
    rate: '$28/hr',
  },
  {
    name: 'SparkFix Electrical',
    category: 'Electrician',
    city: 'Kumasi',
    status: 'Ready for approval',
    rate: '$52/hr',
  },
];

const serviceRegions = [
  { city: 'Accra', seekers: 3200, providers: 492 },
  { city: 'Kumasi', seekers: 1910, providers: 281 },
  { city: 'Takoradi', seekers: 1148, providers: 144 },
  { city: 'Tema', seekers: 860, providers: 103 },
];

const supportTickets = [
  'Refund request for cancelled plumbing job',
  'Provider wants to update availability calendar',
  'User flagged suspicious review activity',
  'Agent follow-up for failed mobile payment',
];

function App() {
  return (
    <div className="dashboard-shell">
      <aside className="sidebar">
        <div>
          <p className="eyebrow">Sorted Admin</p>
          <h1>Operations dashboard</h1>
          <p className="muted">
            Manage mobile, web, users, providers, bookings, and support activity from one place.
          </p>
        </div>

        <nav className="sidebar-nav">
          <button className="nav-item active">Overview</button>
          <button className="nav-item">Users</button>
          <button className="nav-item">Providers</button>
          <button className="nav-item">Bookings</button>
          <button className="nav-item">Reviews</button>
          <button className="nav-item">Reports</button>
        </nav>

        <div className="sidebar-card">
          <p className="eyebrow">Platform sync</p>
          <strong>All clients share one API</strong>
          <span>Admin, mobile, and web use the same auth and booking backend.</span>
        </div>
      </aside>

      <main className="dashboard-main">
        <section className="hero">
          <div>
            <p className="eyebrow">Daily summary</p>
            <h2>Keep providers active and service seekers supported.</h2>
            <p className="muted">
              Monitor approvals, booking activity, disputes, and regional performance in real time.
            </p>
          </div>
          <div className="hero-actions">
            <button className="primary-btn">Approve providers</button>
            <button className="ghost-btn">Export reports</button>
          </div>
        </section>

        <section className="metrics-grid">
          {metrics.map((item) => (
            <article className="metric-card" key={item.label}>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
              <small>{item.delta}</small>
            </article>
          ))}
        </section>

        <section className="content-grid">
          <article className="panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Approval queue</p>
                <h3>New providers</h3>
              </div>
              <button className="ghost-btn small">View all</button>
            </div>

            <div className="stack">
              {approvalQueue.map((provider) => (
                <div className="list-row" key={provider.name}>
                  <div>
                    <strong>{provider.name}</strong>
                    <p>
                      {provider.category} • {provider.city}
                    </p>
                  </div>
                  <div className="row-meta">
                    <span className="pill">{provider.status}</span>
                    <small>{provider.rate}</small>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Regional demand</p>
                <h3>Where activity is highest</h3>
              </div>
            </div>

            <div className="stack">
              {serviceRegions.map((region) => (
                <div className="region-card" key={region.city}>
                  <div>
                    <strong>{region.city}</strong>
                    <p>{region.seekers.toLocaleString()} seekers</p>
                  </div>
                  <small>{region.providers} providers</small>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="content-grid">
          <article className="panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Support desk</p>
                <h3>Priority tickets</h3>
              </div>
            </div>

            <ul className="ticket-list">
              {supportTickets.map((ticket) => (
                <li key={ticket}>{ticket}</li>
              ))}
            </ul>
          </article>

          <article className="panel gradient-panel">
            <p className="eyebrow">Platform health</p>
            <h3>Unified operations</h3>
            <p>
              The starter backend exposes shared auth, provider, service, booking, and dashboard
              endpoints so all platforms can stay in sync.
            </p>
            <div className="status-grid">
              <div>
                <span>API</span>
                <strong>Healthy</strong>
              </div>
              <div>
                <span>Payments</span>
                <strong>Connected</strong>
              </div>
              <div>
                <span>Reviews</span>
                <strong>Moderated</strong>
              </div>
              <div>
                <span>Sync</span>
                <strong>Live</strong>
              </div>
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}

export default App;
