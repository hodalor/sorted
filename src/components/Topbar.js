function Topbar({ title, subtitle, statusMessage }) {
  return (
    <header className="admin-topbar">
      <div>
        <p className="admin-eyebrow">Control Panel</p>
        <h1>{title}</h1>
        {subtitle ? <p className="admin-subtitle">{subtitle}</p> : null}
      </div>
      <p className="admin-status">{statusMessage}</p>
    </header>
  );
}

export default Topbar;
