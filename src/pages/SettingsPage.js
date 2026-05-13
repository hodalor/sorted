import { settingsTabs } from '../constants/menuItems';

function SettingsPage({
  activeTab,
  onTabChange,
  categories,
  categoryForm,
  onCategoryChange,
  onCategoryCreate,
  onCategoryDelete,
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

      {activeTab !== 'category' ? (
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
          <button className="primary-btn" onClick={() => onPlatformSave(activeTab)}>
            Save {activeTab} Settings
          </button>
        </div>
      ) : null}
    </section>
  );
}

export default SettingsPage;
