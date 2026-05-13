import { settingsTabs } from '../constants/menuItems';

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
            <button className="primary-btn" onClick={onCategoryCreate}>
              Create Category
            </button>
          </div>

          <div className="panel-list">
            {categories.map((category) => (
              <div className="list-row" key={category._id || category.id}>
                <div>
                  <strong>{category.name}</strong>
                  <p>{category.icon || 'No icon'}</p>
                </div>
                <button className="ghost-btn small" onClick={() => onCategoryDelete(category._id || category.id)}>
                  Remove
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
            <button className="primary-btn" onClick={onCountryCreate}>
              Create Country
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
                <button className="ghost-btn small" onClick={() => onCountryDelete(country._id || country.id)}>
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {activeTab !== 'category' && activeTab !== 'country' ? (
        <div className="settings-form">
          {Object.entries(platformSettings[activeTab] || {}).map(([key, value]) => (
            <label className="setting-line" key={key}>
              <span>{key}</span>
              {key === 'otpProvider' ? (
                <select value={String(value)} onChange={(event) => onPlatformChange(activeTab, key, event.target.value)}>
                  <option value="firebase">firebase</option>
                  <option value="system">system</option>
                </select>
              ) : (
                <select value={String(value)} onChange={(event) => onPlatformChange(activeTab, key, event.target.value)}>
                  <option value="true">true</option>
                  <option value="false">false</option>
                </select>
              )}
            </label>
          ))}
          <button className="primary-btn" onClick={() => onPlatformSave(activeTab)}>
            Save {activeTab} Settings
          </button>
        </div>
      ) : null}
    </section>
  );
}

export default SettingsPage;
