import { settingsTabs } from '../constants/menuItems';
import LoadingDots from '../components/LoadingDots';

function SettingsPage({
  activeTab,
  onTabChange,
  categories,
  categoryForm,
  onCategoryChange,
  onCategoryCreate,
  onCategoryDelete,
  countries,
  countryForm,
  actionLoading,
  onCountryChange,
  onCountryCreate,
  onCountryDelete,
  platformSettings,
  onPlatformChange,
  onPlatformSave,
}) {
  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <p className="admin-eyebrow">Settings</p>
          <h2>Platform configuration</h2>
        </div>
      </div>

      <div className="tab-row">
        {settingsTabs.map((tab) => (
          <button
            key={tab}
            className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => onTabChange(tab)}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'general' ? (
        <div className="settings-form">
          <label className="setting-line">
            <span>otpProvider</span>
            <select
              value={String(platformSettings.general?.otpProvider || 'firebase')}
              onChange={(event) => onPlatformChange('general', 'otpProvider', event.target.value)}>
              <option value="firebase">firebase</option>
              <option value="system">system</option>
            </select>
          </label>
          <button className="primary-btn" onClick={() => onPlatformSave('general')}>
            {actionLoading.platformSave === 'general' ? (
              <span className="button-content">
                <LoadingDots />
                <span>Saving General</span>
              </span>
            ) : (
              'Save General Settings'
            )}
          </button>
        </div>
      ) : null}

      {activeTab === 'category' ? (
        <div className="settings-grid">
          <div className="settings-form">
            <input
              name="name"
              value={categoryForm.name}
              onChange={onCategoryChange}
              placeholder="Category name"
            />
            <input
              name="icon"
              value={categoryForm.icon}
              onChange={onCategoryChange}
              placeholder="Icon name"
            />
            <button className="primary-btn" onClick={onCategoryCreate} disabled={actionLoading.categoryCreate}>
              {actionLoading.categoryCreate ? (
                <span className="button-content">
                  <LoadingDots />
                  <span>Creating Category</span>
                </span>
              ) : (
                'Create Category'
              )}
            </button>
          </div>

          <div className="panel-list">
            {categories.map((category) => (
              <div className="list-row" key={category._id || category.id}>
                <div>
                  <strong>{category.name}</strong>
                  <p>{category.icon || 'No icon'}</p>
                </div>
                <button
                  className="ghost-btn small"
                  onClick={() => onCategoryDelete(category._id || category.id)}
                  disabled={actionLoading.categoryDelete === (category._id || category.id)}>
                  {actionLoading.categoryDelete === (category._id || category.id) ? (
                    <span className="button-content">
                      <LoadingDots />
                      <span>Removing</span>
                    </span>
                  ) : (
                    'Remove'
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {activeTab === 'country' ? (
        <div className="settings-grid">
          <div className="settings-form">
            <input
              name="name"
              value={countryForm.name}
              onChange={onCountryChange}
              placeholder="Country name"
            />
            <input
              name="code"
              value={countryForm.code}
              onChange={onCountryChange}
              placeholder="Country code e.g. GH"
            />
            <input
              name="dialingCode"
              value={countryForm.dialingCode}
              onChange={onCountryChange}
              placeholder="Dialing code e.g. +233"
            />
            <input
              name="currencySymbol"
              value={countryForm.currencySymbol}
              onChange={onCountryChange}
              placeholder="Currency symbol e.g. GHS"
            />
            <button className="primary-btn" onClick={onCountryCreate} disabled={actionLoading.countryCreate}>
              {actionLoading.countryCreate ? (
                <span className="button-content">
                  <LoadingDots />
                  <span>Creating Country</span>
                </span>
              ) : (
                'Create Country'
              )}
            </button>
          </div>

          <div className="panel-list">
            {countries.map((country) => (
              <div className="list-row" key={country._id || country.id}>
                <div>
                  <strong>{country.name}</strong>
                  <p>
                    {country.dialingCode} · {country.currencySymbol} · {country.code}
                  </p>
                </div>
                <button
                  className="ghost-btn small"
                  onClick={() => onCountryDelete(country._id || country.id)}
                  disabled={actionLoading.countryDelete === (country._id || country.id)}>
                  {actionLoading.countryDelete === (country._id || country.id) ? (
                    <span className="button-content">
                      <LoadingDots />
                      <span>Removing</span>
                    </span>
                  ) : (
                    'Remove'
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {activeTab !== 'general' && activeTab !== 'category' && activeTab !== 'country' ? (
        <div className="settings-form">
          {Object.entries(platformSettings[activeTab] || {}).map(([key, value]) => (
            <label className="setting-line" key={key}>
              <span>{key}</span>
              <select value={String(value)} onChange={(event) => onPlatformChange(activeTab, key, event.target.value)}>
                <option value="true">true</option>
                <option value="false">false</option>
              </select>
            </label>
          ))}
          <button className="primary-btn" onClick={() => onPlatformSave(activeTab)} disabled={actionLoading.platformSave === activeTab}>
            {actionLoading.platformSave === activeTab ? (
              <span className="button-content">
                <LoadingDots />
                <span>{`Saving ${activeTab}`}</span>
              </span>
            ) : (
              `Save ${activeTab} Settings`
            )}
          </button>
        </div>
      ) : null}
    </section>
  );
}

export default SettingsPage;
