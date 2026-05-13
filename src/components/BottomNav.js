const items = [
  { key: 'home', label: 'Home' },
  { key: 'bookings', label: 'Bookings' },
  { key: 'provider', label: 'Provider' },
  { key: 'profile', label: 'Profile' },
];

function BottomNav({ activeMenu, onChange }) {
  return (
    <nav className="bottom-nav" aria-label="Primary">
      {items.map((item) => (
        <button
          key={item.key}
          className={`nav-link ${activeMenu === item.key ? 'active' : ''}`}
          onClick={() => onChange(item.key)}>
          {item.label}
        </button>
      ))}
    </nav>
  );
}

export default BottomNav;
