function BookingsPage({ bookings }) {
  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <p className="admin-eyebrow">Bookings</p>
          <h2>All booking records</h2>
        </div>
      </div>

      <div className="panel-list">
        {bookings.map((booking) => (
          <div className="list-row" key={booking._id || booking.id}>
            <div>
              <strong>{booking.serviceTitle}</strong>
              <p>
                {booking.seekerName} • {booking.providerName}
              </p>
            </div>
            <div className="meta-block">
              <span className={`pill ${booking.status}`}>{booking.status}</span>
              <small>
                {booking.date} {booking.time}
              </small>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default BookingsPage;
