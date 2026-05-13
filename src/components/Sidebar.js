import { menuItems } from '../constants/menuItems';

function Sidebar({ activeMenu, onChange }) {
  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-top">
        <p className="admin-eyebrow">Sorted Admin</p>
      </div>

      <nav className="admin-nav">
        {menuItems.map((item) => (
          <button
            key={item.key}
            className={`admin-nav-item ${activeMenu === item.key ? 'active' : ''}`}
            onClick={() => onChange(item.key)}>
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;
