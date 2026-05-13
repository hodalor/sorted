function BookingsPage({ bookings }) {
  return (
    <section className="section-block">
      <div className="section-heading">
        <p className="eyebrow">Bookings</p>
        <h2>Your booking records</h2>
      </div>

      <ul className="booking-list">
        {bookings.map((booking) => (
          <li key={booking._id || booking.id}>
            <strong>{booking.serviceTitle}</strong>
            <span>
              {booking.date}, {booking.time} with {booking.providerName}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default BookingsPage;
