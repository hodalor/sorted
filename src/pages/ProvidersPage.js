import { providerTabs } from '../constants/menuItems';
import LoadingDots from '../components/LoadingDots';

function ProvidersPage({ activeTab, onTabChange, providers, actionLoading, onStatusChange }) {
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
        {providers.length ? (
          providers.map((provider) => {
            const providerId = provider._id || provider.id;
            const approving = actionLoading.providerStatus === `${providerId}-approved`;
            const rejecting = actionLoading.providerStatus === `${providerId}-rejected`;

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
                  <button
                    className="ghost-btn small"
                    onClick={() => onStatusChange(providerId, 'approved')}
                    disabled={approving || rejecting}>
                    {approving ? (
                      <span className="button-content">
                        <LoadingDots />
                        <span>Approving</span>
                      </span>
                    ) : (
                      'Approve'
                    )}
                  </button>
                  <button
                    className="ghost-btn small"
                    onClick={() => onStatusChange(providerId, 'rejected')}
                    disabled={approving || rejecting}>
                    {rejecting ? (
                      <span className="button-content">
                        <LoadingDots />
                        <span>Rejecting</span>
                      </span>
                    ) : (
                      'Reject'
                    )}
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="list-row">
            <p>No providers in this status yet.</p>
          </div>
        )}
      </div>
    </section>
  );
}

export default ProvidersPage;
