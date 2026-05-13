import { providerTabs } from '../constants/menuItems';

function ProvidersPage({ activeTab, onTabChange, providers, onStatusChange }) {
  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <p className="admin-eyebrow">Service Providers</p>
          <h2>KYC status queue</h2>
        </div>
      </div>

      <div className="tab-row">
        {providerTabs.map((tab) => (
          <button
            key={tab}
            className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => onTabChange(tab)}>
            {tab}
          </button>
        ))}
      </div>

      <div className="panel-list">
        {providers.map((provider) => {
          const providerId = provider._id || provider.id;
          return (
            <div className="provider-row" key={providerId}>
              <div>
                <strong>{provider.businessName || provider.name}</strong>
                <p>
                  {provider.category} • {provider.city}
                </p>
                <small>{provider.registrationNumber || 'Not registered business'}</small>
              </div>
              <div className="provider-actions">
                <span className={`pill ${provider.status}`}>{provider.status}</span>
                <button className="ghost-btn small" onClick={() => onStatusChange(providerId, 'approved')}>
                  Approve
                </button>
                <button className="ghost-btn small" onClick={() => onStatusChange(providerId, 'rejected')}>
                  Reject
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default ProvidersPage;
