function ReportsPage({ dashboard }) {
  return (
    <section className="content-grid">
      <article className="panel">
        <p className="admin-eyebrow">Revenue</p>
        <h2>${dashboard?.totals?.revenueEstimate || 0}</h2>
        <p className="panel-copy">Estimated earnings across all current booking records.</p>
      </article>

      <article className="panel">
        <p className="admin-eyebrow">Channels</p>
        <h2>Mobile and web settings</h2>
        <p className="panel-copy">Use the settings menu to update mobile and web behavior separately.</p>
      </article>
    </section>
  );
}

export default ReportsPage;
