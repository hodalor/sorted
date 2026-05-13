function UsersPage({ users }) {
  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <p className="admin-eyebrow">Users</p>
          <h2>All user accounts</h2>
        </div>
        <strong>{users.length}</strong>
      </div>

      <div className="panel-list">
        {users.map((user) => (
          <div className="list-row" key={user._id || user.id}>
            <div>
              <strong>{user.name || 'Unnamed user'}</strong>
              <p>{user.phoneNumber}</p>
            </div>
            <div className="meta-block">
              <span className="mini">{user.role}</span>
              <small>{user.address || 'No address'}</small>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default UsersPage;
