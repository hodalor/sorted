function ProfilePage({ session, onLogout }) {
  return (
    <section className="section-block">
      <div className="section-heading">
        <p className="eyebrow">Profile</p>
        <h2>{session.user.name}</h2>
      </div>

      <div className="auth-card compact-card">
        <div className="account-row">
          <strong>Phone</strong>
          <span>{session.user.phoneNumber}</span>
        </div>
        <div className="account-row">
          <strong>Address</strong>
          <span>{session.user.address}</span>
        </div>
        <div className="account-row">
          <strong>Email</strong>
          <span>{session.user.email || 'Not provided'}</span>
        </div>
        <div className="account-row">
          <strong>Provider</strong>
          <span>{session.user.providerProfile?.status || 'No provider profile yet'}</span>
        </div>
        <button className="ghost-btn" onClick={onLogout}>
          Log out
        </button>
      </div>
    </section>
  );
}

export default ProfilePage;
