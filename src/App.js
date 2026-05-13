import { useEffect, useState } from 'react';
import { apiGet, apiPatch } from './api';
import './App.css';

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
  const [dashboard, setDashboard] = useState(null);
  const [approvalQueue, setApprovalQueue] = useState([]);
  const [statusMessage, setStatusMessage] = useState('Loading admin data...');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [dashboardData, providerData] = await Promise.all([
          apiGet('/dashboard/overview'),
          apiGet('/services/providers?status=pending'),
        ]);

        setDashboard(dashboardData);
        setApprovalQueue(providerData.items);
        setStatusMessage('Dashboard synced with backend.');
      } catch (error) {
        setStatusMessage(error.message);
      }
    };

    loadData();
  }, []);

  const metrics = dashboard
    ? [
        {
          label: 'Total bookings',
          value: dashboard.totals.bookings,
          delta: `${dashboard.totals.pendingBookings} pending`,
        },
        {
          label: 'Active providers',
          value: dashboard.totals.providers,
          delta: `${dashboard.totals.pendingProviders} awaiting approval`,
        },
        {
          label: 'Available services',
          value: dashboard.totals.services,
          delta: `${dashboard.totals.categories} categories`,
        },
        {
          label: 'Platform revenue',
          value: `$${dashboard.totals.revenueEstimate}`,
          delta: 'Shared across web and mobile',
        },
      ]
    : [];

  const handleApprove = async (providerId) => {
    try {
      await apiPatch(`/providers/${providerId}/status`, { status: 'approved' });
      setApprovalQueue((current) => current.filter((provider) => (provider.id || provider._id) !== providerId));
      setDashboard((current) =>
        current
          ? {
              ...current,
              totals: {
                ...current.totals,
                pendingProviders: Math.max(0, current.totals.pendingProviders - 1),
              },
            }
          : current
      );
      setStatusMessage('Provider approved successfully.');
    } catch (error) {
      setStatusMessage(error.message);
    }
  };

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
                <div className="list-row" key={provider.id || provider._id}>
                  <div>
                    <strong>{provider.name}</strong>
                    <p>
                      {provider.category} • {provider.city}
                    </p>
                  </div>
                  <div className="row-meta">
                    <span className="pill">{provider.status}</span>
                    <small>${provider.rate}/hr</small>
                    <button className="ghost-btn small" onClick={() => handleApprove(provider.id || provider._id)}>
                      Approve
                    </button>
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

        <p className="admin-status">{statusMessage}</p>
      </main>
    </div>
  );
}

export default App;
