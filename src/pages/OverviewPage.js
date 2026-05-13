function OverviewPage({ dashboard }) {
  const metrics = dashboard
    ? [
        {
          label: 'Total Bookings',
          value: dashboard.totals.bookings,
          delta: `${dashboard.totals.pendingBookings} pending`,
        },
        {
          label: 'Providers',
          value: dashboard.totals.providers,
          delta: `${dashboard.totals.pendingProviders} pending KYC`,
        },
        {
          label: 'Users',
          value: dashboard.totals.users,
          delta: `${dashboard.totals.approvedProviders} approved`,
        },
        {
          label: 'Categories',
          value: dashboard.totals.categories,
          delta: `${dashboard.totals.services} services`,
        },
      ]
    : [];

  return (
    <div className="page-stack">
      <section className="metric-grid">
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
              <p className="admin-eyebrow">Recent Providers</p>
              <h2>Latest submissions</h2>
            </div>
          </div>
          <div className="panel-list">
            {(dashboard?.recentProviders || []).map((provider) => (
              <div className="list-row" key={provider._id || provider.id}>
                <div>
                  <strong>{provider.businessName || provider.name}</strong>
                  <p>{provider.category}</p>
                </div>
                <span className={`pill ${provider.status}`}>{provider.status}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="panel">
          <div className="panel-heading">
            <div>
              <p className="admin-eyebrow">Recent Bookings</p>
              <h2>Latest records</h2>
            </div>
          </div>
          <div className="panel-list">
            {(dashboard?.recentBookings || []).map((booking) => (
              <div className="list-row" key={booking._id || booking.id}>
                <div>
                  <strong>{booking.serviceTitle}</strong>
                  <p>{booking.providerName}</p>
                </div>
                <span className={`pill ${booking.status}`}>{booking.status}</span>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}

export default OverviewPage;
